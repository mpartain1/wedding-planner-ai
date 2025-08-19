import React from 'react';
import { DollarSign, Target, CheckCircle, Calendar, Users, AlertCircle } from 'lucide-react';

interface StatsCardsProps {
  totalBudget: number;
  totalSpent: number;
  categoriesComplete: number;
  totalCategories: number;
  totalVendors: number;
  vendorsNeedingInput: number;
}

const StatsCards: React.FC<StatsCardsProps> = ({ 
  totalBudget, 
  totalSpent, 
  categoriesComplete, 
  totalCategories,
  totalVendors,
  vendorsNeedingInput
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600">Total Budget</p>
            <p className="text-lg font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
          </div>
          <DollarSign className="w-6 h-6 text-blue-500" />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600">Spent</p>
            <p className="text-lg font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
          </div>
          <Target className="w-6 h-6 text-green-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600">Categories Done</p>
            <p className="text-lg font-bold text-gray-900">{categoriesComplete}/{totalCategories}</p>
          </div>
          <CheckCircle className="w-6 h-6 text-purple-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600">Remaining</p>
            <p className="text-lg font-bold text-gray-900">${(totalBudget - totalSpent).toLocaleString()}</p>
          </div>
          <Calendar className="w-6 h-6 text-orange-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600">Total Vendors</p>
            <p className="text-lg font-bold text-gray-900">{totalVendors}</p>
          </div>
          <Users className="w-6 h-6 text-indigo-500" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600">Need Input</p>
            <p className="text-lg font-bold text-orange-600">{vendorsNeedingInput}</p>
          </div>
          <AlertCircle className="w-6 h-6 text-orange-500" />
        </div>
      </div>
    </div>
  );
};

export default StatsCards;