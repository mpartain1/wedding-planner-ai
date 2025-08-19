import React, { useState } from 'react';
import type { CategoryWithVendors } from '../../types';
import { useAddVendor } from '../../hooks/useVendors';
import CategoryCard from './CategoryCard';
import { Plus } from 'lucide-react';

interface VendorManagementProps {
  categories: CategoryWithVendors[];
}

interface NewVendorForm {
  categoryId: string;
  name: string;
  contactEmail: string;
  phone: string;
  estimatedPrice: string;
}

const VendorManagement: React.FC<VendorManagementProps> = ({ categories }) => {
  const [newVendorForm, setNewVendorForm] = useState<NewVendorForm>({ 
    categoryId: '', 
    name: '', 
    contactEmail: '', 
    phone: '', 
    estimatedPrice: '' 
  });

  const addVendorMutation = useAddVendor();

  const handleAddVendor = async () => {
    if (!newVendorForm.categoryId || !newVendorForm.name || !newVendorForm.contactEmail) {
      return;
    }

    try {
      await addVendorMutation.mutateAsync({
        category_id: newVendorForm.categoryId,
        name: newVendorForm.name,
        contact_email: newVendorForm.contactEmail,
        phone: newVendorForm.phone || null,
        price: parseInt(newVendorForm.estimatedPrice) || 0,
        status: 'pending',
        last_contact: null,
        notes: 'Added manually - ready for AI outreach',
      });

      // Reset form
      setNewVendorForm({ 
        categoryId: '', 
        name: '', 
        contactEmail: '', 
        phone: '', 
        estimatedPrice: '' 
      });
    } catch (error) {
      console.error('Failed to add vendor:', error);
    }
  };

  // Check if required fields are filled
  const isFormValid = Boolean(
    newVendorForm.categoryId && 
    newVendorForm.name.trim() && 
    newVendorForm.contactEmail.trim()
  );

  // Debug log to see if validation is working
  console.log('Form validation:', {
    categoryId: newVendorForm.categoryId,
    name: newVendorForm.name.trim(),
    contactEmail: newVendorForm.contactEmail.trim(),
    isFormValid
  });

  return (
    <div className="space-y-6">
      {/* Add New Vendor Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Add New Vendor</h2>
          <p className="text-sm text-gray-600 mt-1">
            Add vendors to start automated outreach and negotiations
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <select 
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newVendorForm.categoryId}
              onChange={(e) => setNewVendorForm({...newVendorForm, categoryId: e.target.value})}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            
            <input
              type="text"
              placeholder="Vendor Name"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newVendorForm.name}
              onChange={(e) => setNewVendorForm({...newVendorForm, name: e.target.value})}
            />
            
            <input
              type="email"
              placeholder="Email Contact"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newVendorForm.contactEmail}
              onChange={(e) => setNewVendorForm({...newVendorForm, contactEmail: e.target.value})}
            />
            
            <input
              type="tel"
              placeholder="Phone (optional)"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newVendorForm.phone}
              onChange={(e) => setNewVendorForm({...newVendorForm, phone: e.target.value})}
            />

            <input
              type="number"
              placeholder="Est. Price"
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newVendorForm.estimatedPrice}
              onChange={(e) => setNewVendorForm({...newVendorForm, estimatedPrice: e.target.value})}
            />
            
            <button
              onClick={handleAddVendor}
              disabled={!isFormValid || addVendorMutation.isPending}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                isFormValid && !addVendorMutation.isPending
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
              style={{
                backgroundColor: isFormValid && !addVendorMutation.isPending ? '#2563eb' : '#d1d5db',
                color: isFormValid && !addVendorMutation.isPending ? 'white' : '#6b7280'
              }}
            >
              {addVendorMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{addVendorMutation.isPending ? 'Adding...' : 'Add'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Cards */}
      {categories.map((category) => (
        <CategoryCard 
          key={category.id}
          category={category}
        />
      ))}

      {categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No vendor categories found</p>
          <p className="text-sm text-gray-400 mt-1">
            Categories should be automatically loaded from the database
          </p>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;