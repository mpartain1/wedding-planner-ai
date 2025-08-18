import React, { useState } from 'react';
import { Plus, Mail, Users, DollarSign, Calendar, CheckCircle, AlertCircle, Clock, Eye, MessageSquare, Target } from 'lucide-react';

interface Vendor {
  id: number;
  name: string;
  contact: string;
  phone: string;
  price: number;
  status: 'confirmed' | 'negotiating' | 'interested' | 'pending' | 'declined';
  lastContact: string;
  notes: string;
}

interface VendorCategory {
  name: string;
  budget: number;
  selected: { id: number; name: string; price: number } | null;
  vendors: Vendor[];
}

interface VendorCategories {
  [key: string]: VendorCategory;
}

interface NewVendorForm {
  category: string;
  name: string;
  contact: string;
  phone: string;
  estimatedPrice: string;
}

const WeddingPlannerApp: React.FC = () => {
  const [vendors, setVendors] = useState<VendorCategories>({
    floral: {
      name: 'Floral Arrangements',
      budget: 5000,
      selected: null,
      vendors: [
        { id: 1, name: 'Bloom & Blossom', contact: 'sarah@bloomblossom.com', phone: '(555) 123-4567', price: 4200, status: 'negotiating', lastContact: '2024-08-17', notes: 'Waiting for revised quote with premium roses' },
        { id: 2, name: 'Garden Dreams', contact: 'mike@gardendreams.com', phone: '(555) 234-5678', price: 5500, status: 'declined', lastContact: '2024-08-16', notes: 'Over budget, declined offer' },
        { id: 3, name: 'Petals & Co', contact: 'jenny@petalsco.com', phone: '(555) 345-6789', price: 3800, status: 'interested', lastContact: '2024-08-18', notes: 'Requested portfolio examples' }
      ]
    },
    venue: {
      name: 'Venue & Catering',
      budget: 15000,
      selected: { id: 1, name: 'Sunset Manor', price: 14500 },
      vendors: [
        { id: 1, name: 'Sunset Manor', contact: 'events@sunsetmanor.com', phone: '(555) 456-7890', price: 14500, status: 'confirmed', lastContact: '2024-08-17', notes: 'Contract signed, deposit paid' },
        { id: 2, name: 'Grand Ballroom', contact: 'info@grandballroom.com', phone: '(555) 567-8901', price: 16000, status: 'declined', lastContact: '2024-08-15', notes: 'Over budget' }
      ]
    },
    photography: {
      name: 'Photography',
      budget: 8000,
      selected: null,
      vendors: [
        { id: 1, name: 'Capture Moments', contact: 'alex@capturemoments.com', phone: '(555) 678-9012', price: 7200, status: 'pending', lastContact: '2024-08-18', notes: 'Reviewing contract terms' },
        { id: 2, name: 'Forever Photos', contact: 'lisa@foreverphotos.com', phone: '(555) 789-0123', price: 8500, status: 'negotiating', lastContact: '2024-08-17', notes: 'Discussing package options' }
      ]
    },
    music: {
      name: 'Music & Entertainment',
      budget: 3000,
      selected: null,
      vendors: [
        { id: 1, name: 'DJ Soundwave', contact: 'beats@djsoundwave.com', phone: '(555) 890-1234', price: 2800, status: 'interested', lastContact: '2024-08-18', notes: 'Checking availability for date' },
        { id: 2, name: 'Live Band Co', contact: 'gigs@livebandco.com', phone: '(555) 901-2345', price: 4000, status: 'declined', lastContact: '2024-08-16', notes: 'Over budget for full band' }
      ]
    }
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'vendors'>('dashboard');
  const [newVendorForm, setNewVendorForm] = useState<NewVendorForm>({ category: '', name: '', contact: '', phone: '', estimatedPrice: '' });

  const totalBudget = Object.values(vendors).reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = Object.values(vendors).reduce((sum, cat) => {
    return sum + (cat.selected ? cat.selected.price : 0);
  }, 0);
  const categoriesComplete = Object.values(vendors).filter(cat => cat.selected).length;
  const totalCategories = Object.keys(vendors).length;

  const getStatusColor = (status: Vendor['status']): string => {
    switch(status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'negotiating': return 'text-yellow-600 bg-yellow-100';
      case 'interested': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-purple-600 bg-purple-100';
      case 'declined': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: Vendor['status']): React.ReactElement => {
    switch(status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'negotiating': return <MessageSquare className="w-4 h-4" />;
      case 'interested': return <Eye className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'declined': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const addVendor = (): void => {
    if (!newVendorForm.category || !newVendorForm.name || !newVendorForm.contact) return;
    
    const newVendor: Vendor = {
      id: Date.now(),
      name: newVendorForm.name,
      contact: newVendorForm.contact,
      phone: newVendorForm.phone || '',
      price: parseInt(newVendorForm.estimatedPrice) || 0,
      status: 'pending',
      lastContact: new Date().toISOString().split('T')[0],
      notes: 'Added manually - AI agent will initiate contact'
    };

    setVendors(prev => ({
      ...prev,
      [newVendorForm.category]: {
        ...prev[newVendorForm.category],
        vendors: [...prev[newVendorForm.category].vendors, newVendor]
      }
    }));

    setNewVendorForm({ category: '', name: '', contact: '', phone: '', estimatedPrice: '' });
  };

  const Dashboard: React.FC = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Spent</p>
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
            </div>
            <Target className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Categories Complete</p>
              <p className="text-2xl font-bold text-gray-900">{categoriesComplete}/{totalCategories}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-gray-900">${(totalBudget - totalSpent).toLocaleString()}</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Vendor Categories</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(vendors).map(([key, category]) => (
              <div key={key} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  {category.selected ? (
                    <span className="px-2 py-1 text-xs font-medium text-green-600 bg-green-100 rounded-full">
                      Confirmed
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium text-yellow-600 bg-yellow-100 rounded-full">
                      In Progress
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium">${category.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vendors:</span>
                    <span className="font-medium">{category.vendors.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium">
                      {category.selected 
                        ? `Locked: $${category.selected.price.toLocaleString()}`
                        : `${category.vendors.filter(v => v.status !== 'declined').length} active`
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Recent AI Agent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Negotiation email sent to Bloom & Blossom</p>
                <p className="text-xs text-gray-600">2 hours ago • Floral category</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Contract confirmed with Sunset Manor</p>
                <p className="text-xs text-gray-600">4 hours ago • Venue category</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <MessageSquare className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Follow-up required for DJ Soundwave</p>
                <p className="text-xs text-gray-600">6 hours ago • Music category</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const VendorManagement: React.FC = () => (
    <div className="space-y-6">
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
              {Object.entries(vendors).map(([key, cat]) => (
                <option key={key} value={key}>{cat.name}</option>
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
              onClick={addVendor}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>

      {Object.entries(vendors).map(([categoryKey, category]) => (
        <div key={categoryKey} className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                <p className="text-sm text-gray-600">Budget: ${category.budget.toLocaleString()}</p>
              </div>
              {category.selected && (
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">✓ Locked In</p>
                  <p className="text-sm text-gray-600">{category.selected.name}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-600 border-b">
                    <th className="pb-3">Vendor</th>
                    <th className="pb-3">Contact</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Last Contact</th>
                    <th className="pb-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {category.vendors.map((vendor) => (
                    <tr key={vendor.id} className="text-sm">
                      <td className="py-3 font-medium text-gray-900">{vendor.name}</td>
                      <td className="py-3 text-gray-600">{vendor.contact}</td>
                      <td className="py-3 font-medium">${vendor.price.toLocaleString()}</td>
                      <td className="py-3">
                        <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                          {getStatusIcon(vendor.status)}
                          <span className="capitalize">{vendor.status}</span>
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">{vendor.lastContact}</td>
                      <td className="py-3 text-gray-600 max-w-xs truncate">{vendor.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">WP</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Wedding Planner AI</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Sarah's Wedding</p>
                <p className="text-xs text-gray-600">September 15, 2024</p>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vendors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vendor Management
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'vendors' && <VendorManagement />}
      </main>
    </div>
  );
};

export default WeddingPlannerApp;