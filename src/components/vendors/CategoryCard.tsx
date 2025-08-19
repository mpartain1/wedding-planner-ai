import React from 'react';
import type { CategoryWithVendors } from '../../types';
import VendorTable from './VendorTable';

interface CategoryCardProps {
  category: CategoryWithVendors;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
            <p className="text-sm text-gray-600">Budget: ${category.budget.toLocaleString()}</p>
          </div>
          {category.selected_vendor && (
            <div className="text-right">
              <p className="text-sm font-medium text-green-600">✓ Locked In</p>
              <p className="text-sm text-gray-600">{category.selected_vendor.name}</p>
              <p className="text-xs text-gray-500">
                ${category.selected_vendor.price.toLocaleString()}
              </p>
            </div>
          )}
        </div>
        
        {/* Progress indicator */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>
              {category.vendors.filter(v => v.status !== 'pending').length} / {category.vendors.length} contacted
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${category.vendors.length > 0 
                  ? (category.vendors.filter(v => v.status !== 'pending').length / category.vendors.length) * 100 
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