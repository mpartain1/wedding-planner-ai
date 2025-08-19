import React from 'react';
import type { CategoryWithVendors } from '../../types';
import StatsCards from './StatsCards';
import CategoryOverview from './CategoryOverview';
import AIActivity from './AIActivity';

interface DashboardProps {
  categories: CategoryWithVendors[];
}

const Dashboard: React.FC<DashboardProps> = ({ categories }) => {
  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = categories.reduce((sum, cat) => {
    return sum + (cat.selected_vendor ? cat.selected_vendor.price : 0);
  }, 0);
  const categoriesComplete = categories.filter(cat => cat.selected_vendor).length;
  const totalCategories = categories.length;

  // Calculate vendor statistics
  const allVendors = categories.flatMap(cat => cat.vendors);
  const vendorsNeedingInput = allVendors.filter(v => 
    v.status === 'negotiating' || 
    (v.status === 'interested' && v.notes?.includes('portfolio'))
  );

  return (
    <div className="space-y-6">
      <StatsCards 
        totalBudget={totalBudget}
        totalSpent={totalSpent}
        categoriesComplete={categoriesComplete}
        totalCategories={totalCategories}
        totalVendors={allVendors.length}
        vendorsNeedingInput={vendorsNeedingInput.length}
      />
      <CategoryOverview categories={categories} />
      <AIActivity categories={categories} />
    </div>
  );
};

export default Dashboard;