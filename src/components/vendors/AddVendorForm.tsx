import React from 'react';
import { Plus } from 'lucide-react';
import type { CategoryWithVendors, NewVendorForm } from '../../types';

interface AddVendorFormProps {
  vendors: CategoryWithVendors[];
  newVendorForm: NewVendorForm;
  setNewVendorForm: (form: NewVendorForm) => void;
  onAddVendor: () => void;
}

const AddVendorForm: React.FC<AddVendorFormProps> = ({ 
  vendors, 
  newVendorForm, 
  setNewVendorForm, 
  onAddVendor 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">Add New Vendor</h2>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newVendorForm.category}
            onChange={(e) => setNewVendorForm({...newVendorForm, category: e.target.value})}
          >
            <option value="">Select Category</option>
            {vendors.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Vendor Name"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newVendorForm.name}
            onChange={(e) => setNewVendorForm({...newVendorForm, name: e.target.value})}
          />
          
          <input
            type="email"
            placeholder="Email Contact"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newVendorForm.contact}
            onChange={(e) => setNewVendorForm({...newVendorForm, contact: e.target.value})}
          />
          
          <input
            type="tel"
            placeholder="Phone (optional)"
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newVendorForm.phone}
            onChange={(e) => setNewVendorForm({...newVendorForm, phone: e.target.value})}
          />
          
          <button
            onClick={onAddVendor}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddVendorForm;