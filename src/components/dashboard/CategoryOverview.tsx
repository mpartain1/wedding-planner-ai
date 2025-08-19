import React, { useState } from 'react';
import type { CategoryWithVendors } from '../../types';
import { CheckCircle, Clock, MessageSquare, Edit2, Check, X, DollarSign } from 'lucide-react';
import { useUpdateCategory } from '../../hooks/useVendors';

interface CategoryOverviewProps {
  categories: CategoryWithVendors[];
}

interface EditingState {
  [categoryId: string]: {
    isEditing: boolean;
    tempBudget: string;
  };
}

const CategoryOverview: React.FC<CategoryOverviewProps> = ({ categories }) => {
  const [editingState, setEditingState] = useState<EditingState>({});
  const [isBulkEditing, setIsBulkEditing] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    newTotalBudget: '',
    distributionMethod: 'proportional' as 'proportional' | 'equal'
  });
  const updateCategoryMutation = useUpdateCategory();

  const getOverallStatus = (category: CategoryWithVendors) => {
    if (category.selected_vendor) {
      return { text: 'Confirmed', color: 'text-green-600 bg-green-100' };
    }
    
    const negotiating = category.vendors.filter(v => v.status === 'negotiating').length;
    const interested = category.vendors.filter(v => v.status === 'interested').length;
    const uncontacted = category.vendors.filter(v => v.status === 'uncontacted').length;
    
    if (negotiating > 0) return { text: 'Negotiating', color: 'text-blue-600 bg-blue-100' };
    if (interested > 0) return { text: 'Active', color: 'text-purple-600 bg-purple-100' };
    if (uncontacted > 0) return { text: 'Uncontacted', color: 'text-yellow-600 bg-yellow-100' };
    
    return { text: 'No Activity', color: 'text-gray-600 bg-gray-100' };
  };

  const getVendorCounts = (category: CategoryWithVendors) => {
    return {
      negotiating: category.vendors.filter(v => v.status === 'negotiating').length,
      interested: category.vendors.filter(v => v.status === 'interested').length,
      uncontacted: category.vendors.filter(v => v.status === 'uncontacted').length,
      confirmed: category.vendors.filter(v => v.status === 'confirmed').length,
      declined: category.vendors.filter(v => v.status === 'declined').length,
    };
  };

  const startEditing = (categoryId: string, currentBudget: number) => {
    setEditingState(prev => ({
      ...prev,
      [categoryId]: {
        isEditing: true,
        tempBudget: currentBudget.toString()
      }
    }));
  };

  const cancelEditing = (categoryId: string) => {
    setEditingState(prev => ({
      ...prev,
      [categoryId]: {
        isEditing: false,
        tempBudget: ''
      }
    }));
  };

  const saveBudget = async (categoryId: string) => {
    const editState = editingState[categoryId];
    if (!editState) return;

    const newBudget = parseFloat(editState.tempBudget);
    
    if (isNaN(newBudget) || newBudget < 0) {
      alert('Please enter a valid budget amount');
      return;
    }

    try {
      await updateCategoryMutation.mutateAsync({
        id: categoryId,
        updates: { budget: newBudget }
      });

      setEditingState(prev => ({
        ...prev,
        [categoryId]: {
          isEditing: false,
          tempBudget: ''
        }
      }));
    } catch (error) {
      console.error('Failed to update budget:', error);
    }
  };

  const updateTempBudget = (categoryId: string, value: string) => {
    setEditingState(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        tempBudget: value
      }
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent, categoryId: string) => {
    if (e.key === 'Enter') {
      saveBudget(categoryId);
    } else if (e.key === 'Escape') {
      cancelEditing(categoryId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleBulkBudgetEdit = () => {
    const currentTotal = categories.reduce((sum, cat) => sum + cat.budget, 0);
    setBulkEditData({
      newTotalBudget: currentTotal.toString(),
      distributionMethod: 'proportional'
    });
    setIsBulkEditing(true);
  };

  const saveBulkBudget = async () => {
    const newTotal = parseFloat(bulkEditData.newTotalBudget);
    if (isNaN(newTotal) || newTotal < 0) {
      alert('Please enter a valid total budget amount');
      return;
    }

    const currentTotal = categories.reduce((sum, cat) => sum + cat.budget, 0);
    
    try {
      if (bulkEditData.distributionMethod === 'proportional') {
        const updates = categories.map(category => {
          const proportion = category.budget / currentTotal;
          const newBudget = Math.round(newTotal * proportion);
          return { id: category.id, newBudget };
        });

        await Promise.all(
          updates.map(update => 
            updateCategoryMutation.mutateAsync({
              id: update.id,
              updates: { budget: update.newBudget }
            })
          )
        );
      } else {
        const budgetPerCategory = Math.round(newTotal / categories.length);
        await Promise.all(
          categories.map(category => 
            updateCategoryMutation.mutateAsync({
              id: category.id,
              updates: { budget: budgetPerCategory }
            })
          )
        );
      }

      setIsBulkEditing(false);
    } catch (error) {
      console.error('Failed to update budgets:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Vendor Categories</h2>
            <p className="text-sm text-gray-600 mt-1">
              Budget allocation and vendor activity overview
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <DollarSign className="h-4 w-4" />
            <span>Click budgets to edit</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const isEditing = editingState[category.id]?.isEditing || false;
            const tempBudget = editingState[category.id]?.tempBudget || '';
            const overallStatus = getOverallStatus(category);
            const vendorCounts = getVendorCounts(category);

            return (
              <div 
                key={category.id} 
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  {category.selected_vendor ? (
                    <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full">
                      Confirmed
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium text-yellow-600 bg-yellow-100 rounded-full">
                      Unconfirmed
                    </span>
                  )}
                </div>
                
                <div className="space-y-3">
                  {/* Editable Budget */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Budget:</span>
                    <div className="flex items-center space-x-2">
                      {isEditing ? (
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500 text-sm">$</span>
                          <input
                            type="number"
                            value={tempBudget}
                            onChange={(e) => updateTempBudget(category.id, e.target.value)}
                            onKeyDown={(e) => handleKeyPress(e, category.id)}
                            className="w-24 px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="0"
                            autoFocus
                          />
                          <button
                            onClick={() => saveBudget(category.id)}
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
                            onClick={() => cancelEditing(category.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Cancel editing"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(category.id, category.budget)}
                          className="flex items-center space-x-1 hover:bg-gray-50 px-2 py-1 rounded transition-colors group"
                          title="Click to edit budget"
                        >
                          <span className="font-medium text-sm">{formatCurrency(category.budget)}</span>
                          <Edit2 className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Vendor Counts by Status */}
                  <div className="space-y-2">
                    <div className="space-y-1 text-xs">
                      {vendorCounts.negotiating > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-blue-600">Negotiating:</span>
                          <span className="font-medium">{vendorCounts.negotiating}</span>
                        </div>
                      )}
                      {vendorCounts.interested > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-purple-600">Interested:</span>
                          <span className="font-medium">{vendorCounts.interested}</span>
                        </div>
                      )}
                      {vendorCounts.uncontacted > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-600">Uncontacted:</span>
                          <span className="font-medium">{vendorCounts.uncontacted}</span>
                        </div>
                      )}
                      {vendorCounts.confirmed > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-green-600">Confirmed:</span>
                          <span className="font-medium">{vendorCounts.confirmed}</span>
                        </div>
                      )}
                      {vendorCounts.declined > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-red-600">Declined:</span>
                          <span className="font-medium">{vendorCounts.declined}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Total vendors count */}
                    <div className="pt-1 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Total Vendors:</span>
                        <span className="font-medium text-gray-700">{category.vendors.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected vendor info (if any) */}
                  {category.selected_vendor && (
                    <div className="pt-2 border-t border-gray-100">
                      <div className="text-xs text-gray-500 mb-1">Selected Vendor:</div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">{category.selected_vendor.name}</span>
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(category.selected_vendor.price)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <DollarSign className="h-12 w-12 mx-auto" />
            </div>
            <p className="text-gray-500 font-medium">No vendor categories found</p>
            <p className="text-sm text-gray-400 mt-1">
              Categories will appear here once your database is set up
            </p>
          </div>
        )}
      </div>

      {/* Budget Summary */}
      {categories.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Total Budget:</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleBulkBudgetEdit()}
                className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors"
                title="Adjust all budgets proportionally"
              >
                <Edit2 className="h-3 w-3" />
              </button>
              <span className="font-semibold text-gray-900">
                {formatCurrency(categories.reduce((sum, cat) => sum + cat.budget, 0))}
              </span>
            </div>
          </div>
          {categories.some(cat => cat.selected_vendor) && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-gray-600">Total Committed:</span>
              <span className="font-semibold text-gray-900">
                {formatCurrency(categories.reduce((sum, cat) => 
                  sum + (cat.selected_vendor ? cat.selected_vendor.price : 0), 0))}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
            <span>Remaining Budget:</span>
            <span className={`font-medium ${
              categories.reduce((sum, cat) => sum + cat.budget, 0) - 
              categories.reduce((sum, cat) => sum + (cat.selected_vendor ? cat.selected_vendor.price : 0), 0) >= 0
                ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(
                categories.reduce((sum, cat) => sum + cat.budget, 0) - 
                categories.reduce((sum, cat) => sum + (cat.selected_vendor ? cat.selected_vendor.price : 0), 0)
              )}
            </span>
          </div>
        </div>
      )}

      {/* Bulk Budget Editing Modal */}
      {isBulkEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Adjust Total Budget
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Total Budget
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">$</span>
                  <input
                    type="number"
                    value={bulkEditData.newTotalBudget}
                    onChange={(e) => setBulkEditData(prev => ({
                      ...prev,
                      newTotalBudget: e.target.value
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distribution Method
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="proportional"
                      checked={bulkEditData.distributionMethod === 'proportional'}
                      onChange={(e) => setBulkEditData(prev => ({
                        ...prev,
                        distributionMethod: e.target.value as 'proportional'
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      Proportional (maintain current ratios)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="equal"
                      checked={bulkEditData.distributionMethod === 'equal'}
                      onChange={(e) => setBulkEditData(prev => ({
                        ...prev,
                        distributionMethod: e.target.value as 'equal'
                      }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      Equal distribution across all categories
                    </span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Current Total:</span>
                    <span>{formatCurrency(categories.reduce((sum, cat) => sum + cat.budget, 0))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>New Total:</span>
                    <span className="font-medium">
                      {formatCurrency(parseFloat(bulkEditData.newTotalBudget) || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setIsBulkEditing(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveBulkBudget}
                disabled={updateCategoryMutation.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded-md transition-colors"
              >
                {updateCategoryMutation.isPending ? 'Updating...' : 'Update Budgets'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryOverview;