import React, { useState } from 'react';
import type { CategoryWithVendors } from '../../types';
import { Edit2, Check, X, DollarSign, FileText } from 'lucide-react';
import { useUpdateCategory } from '../../hooks/useVendors';
import VendorTable from './VendorTable';

interface CategoryCardProps {
  category: CategoryWithVendors;
}

interface EditingState {
  budget: boolean;
  notes: boolean;
  tempBudget: string;
  tempNotes: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const [editing, setEditing] = useState<EditingState>({
    budget: false,
    notes: false,
    tempBudget: '',
    tempNotes: ''
  });

  const updateCategoryMutation = useUpdateCategory();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const startEditingBudget = () => {
    setEditing(prev => ({
      ...prev,
      budget: true,
      tempBudget: category.budget.toString()
    }));
  };

  const startEditingNotes = () => {
    setEditing(prev => ({
      ...prev,
      notes: true,
      tempNotes: category.notes || ''
    }));
  };

  const cancelEditingBudget = () => {
    setEditing(prev => ({
      ...prev,
      budget: false,
      tempBudget: ''
    }));
  };

  const cancelEditingNotes = () => {
    setEditing(prev => ({
      ...prev,
      notes: false,
      tempNotes: ''
    }));
  };

  const saveBudget = async () => {
    const newBudget = parseFloat(editing.tempBudget);
    if (isNaN(newBudget) || newBudget < 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    try {
      await updateCategoryMutation.mutateAsync({
        id: category.id,
        updates: { budget: newBudget }
      });
      cancelEditingBudget();
    } catch (error) {
      console.error('Failed to update budget:', error);
    }
  };

  const saveNotes = async () => {
    try {
      await updateCategoryMutation.mutateAsync({
        id: category.id,
        updates: { notes: editing.tempNotes.trim() || null }
      });
      cancelEditingNotes();
    } catch (error) {
      console.error('Failed to update notes:', error);
    }
  };

  const handleBudgetKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveBudget();
    } else if (e.key === 'Escape') {
      cancelEditingBudget();
    }
  };

  const handleNotesKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      saveNotes();
    } else if (e.key === 'Escape') {
      cancelEditingNotes();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
          </div>
          {category.selected_vendor && (
            <div className="text-right">
              <p className="text-sm font-medium text-green-600">✓ Locked In</p>
              <p className="text-sm text-gray-600">{category.selected_vendor.name}</p>
              <p className="text-xs text-gray-500">
                {formatCurrency(category.selected_vendor.price)}
              </p>
            </div>
          )}
        </div>

        {/* Editable Budget */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Budget:</span>
          {editing.budget ? (
            <div className="flex items-center space-x-2">
              <span className="text-gray-500 text-sm">$</span>
              <input
                type="number"
                value={editing.tempBudget}
                onChange={(e) => setEditing(prev => ({ ...prev, tempBudget: e.target.value }))}
                onKeyDown={handleBudgetKeyPress}
                className="w-24 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
                autoFocus
              />
              <button
                onClick={saveBudget}
                disabled={updateCategoryMutation.isPending}
                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                title="Save budget"
              >
                {updateCategoryMutation.isPending ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-green-600"></div>
                ) : (
                  <Check className="h-3 w-3" />
                )}
              </button>
              <button
                onClick={cancelEditingBudget}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Cancel editing"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={startEditingBudget}
              className="flex items-center space-x-1 hover:bg-gray-50 px-2 py-1 rounded transition-colors group"
              title="Click to edit budget"
            >
              <span className="font-medium text-sm">{formatCurrency(category.budget)}</span>
              <Edit2 className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </button>
          )}
        </div>

        {/* Editable Vision Notes */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Vision Notes:</span>
            {!editing.notes && (
              <button
                onClick={startEditingNotes}
                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                title="Click to edit vision notes"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            )}
          </div>
          
          {editing.notes ? (
            <div className="space-y-2">
              <textarea
                value={editing.tempNotes}
                onChange={(e) => setEditing(prev => ({ ...prev, tempNotes: e.target.value }))}
                onKeyDown={handleNotesKeyPress}
                className="w-full px-3 py-2 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe your vision for this category..."
                rows={3}
                autoFocus
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Press Ctrl+Enter to save, Escape to cancel</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={saveNotes}
                    disabled={updateCategoryMutation.isPending}
                    className="flex items-center space-x-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    {updateCategoryMutation.isPending ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-green-600"></div>
                    ) : (
                      <Check className="h-3 w-3" />
                    )}
                    <span>Save</span>
                  </button>
                  <button
                    onClick={cancelEditingNotes}
                    className="flex items-center space-x-1 px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div 
              onClick={startEditingNotes}
              className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
            >
              {category.notes ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{category.notes}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">Click to add vision notes for this category...</p>
              )}
            </div>
          )}
        </div>
        
        {/* Progress indicator */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>
              {category.vendors.filter(v => v.status !== 'uncontacted').length} / {category.vendors.length} contacted
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${category.vendors.length > 0 
                  ? (category.vendors.filter(v => v.status !== 'uncontacted').length / category.vendors.length) * 100 
                  : 0}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {category.vendors.length > 0 ? (
          <VendorTable vendors={category.vendors} />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No vendors added yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Add vendors to start the outreach process
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;