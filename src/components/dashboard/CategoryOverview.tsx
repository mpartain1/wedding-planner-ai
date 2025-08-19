import React from 'react';
import type { CategoryWithVendors } from '../../types';
import { MessageSquare, CheckCircle, Clock, Users } from 'lucide-react';

interface CategoryOverviewProps {
  categories: CategoryWithVendors[];
}

const CategoryOverview: React.FC<CategoryOverviewProps> = ({ categories }) => {
  const getStatusIcon = (category: CategoryWithVendors) => {
    if (category.selected_vendor) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
    
    const activeVendors = category.vendors.filter(v => v.status !== 'declined' && v.status !== 'pending');
    if (activeVendors.length > 0) {
      return <MessageSquare className="h-5 w-5 text-blue-600" />;
    }
    
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const getStatusText = (category: CategoryWithVendors) => {
    if (category.selected_vendor) {
      return `Confirmed: ${category.selected_vendor.name}`;
    }
    
    const negotiating = category.vendors.filter(v => v.status === 'negotiating').length;
    const interested = category.vendors.filter(v => v.status === 'interested').length;
    const pending = category.vendors.filter(v => v.status === 'pending').length;
    
    if (negotiating > 0) return `${negotiating} negotiating`;
    if (interested > 0) return `${interested} interested`;
    if (pending > 0) return `${pending} pending outreach`;
    
    return 'No active vendors';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">Vendor Categories</h2>
        <p className="text-sm text-gray-600 mt-1">
          Track progress across all wedding vendor categories
        </p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((category) => {
            const progressPercentage = category.vendors.length > 0 
              ? (category.vendors.filter(v => v.status !== 'pending').length / category.vendors.length) * 100 
              : 0;

            return (
              <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(category)}
                    <h3 className="font-medium text-gray-900">{category.name}</h3>
                  </div>
                  {category.selected_vendor ? (
                    <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full">
                      Confirmed
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium text-yellow-600 bg-yellow-100 rounded-full">
                      In Progress
                    </span>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">${category.budget.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-gray-900">
                      {getStatusText(category)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vendors:</span>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3 text-gray-400" />
                      <span className="font-medium">{category.vendors.length}</span>
                    </div>
                  </div>

                  {category.selected_vendor && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Final Price:</span>
                      <span className="font-medium text-green-600">
                        ${category.selected_vendor.price.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Outreach Progress</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          category.selected_vendor ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategoryOverview;