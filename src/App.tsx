import React, { useState } from 'react';
import type { TabType, NewVendorForm } from './types';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import Dashboard from './components/dashboard/Dashboard';
import VendorManagement from './components/vendors/VendorManagement';
import { useCategories } from './hooks/useVendors';
import { useRealtimeVendors } from './hooks/useRealtimeVendors';

const WeddingPlannerApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [newVendorForm, setNewVendorForm] = useState<NewVendorForm>({ 
    category: '', 
    name: '', 
    contact: '', 
    phone: '', 
    estimatedPrice: '' 
  });
  
  // Enable real-time updates
  useRealtimeVendors();
  
  // Fetch data from database
  const { data: categories, isLoading, error } = useCategories();

  const addVendor = (): void => {
    // TODO: Implement vendor addition logic
    console.log('Add vendor:', newVendorForm);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading wedding planner...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Database Connection Error</div>
          <p className="text-gray-600 mb-4">
            Failed to connect to the database. Please check your configuration.
          </p>
          <pre className="text-sm text-gray-500 bg-gray-100 p-4 rounded">
            {error?.message || 'Unknown error'}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && <Dashboard categories={categories || []} />}
        {activeTab === 'vendors' && (
          <VendorManagement 
            categories={categories || []}
          />
        )}
      </main>
    </div>
  );
};

export default WeddingPlannerApp;