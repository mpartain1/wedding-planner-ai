import React from 'react';
import { Mail, CheckCircle, MessageSquare, AlertCircle, Clock, DollarSign } from 'lucide-react';
import type { CategoryWithVendors } from '../../types';
import { usePendingActions } from '../../hooks/useAIEmail';

interface AIActivityProps {
  categories: CategoryWithVendors[];
}

const AIActivity: React.FC<AIActivityProps> = ({ categories }) => {
  const { data: pendingActions, isLoading } = usePendingActions();

  // Generate recent activity from vendor statuses
  const recentActivity = categories.flatMap(category =>
    category.vendors
      .filter(vendor => vendor.last_contact)
      .map(vendor => ({
        id: vendor.id,
        vendor: vendor.name,
        category: category.name,
        status: vendor.status,
        lastContact: vendor.last_contact,
        price: vendor.price,
        action: getActionFromStatus(vendor.status)
      }))
  ).sort((a, b) => new Date(b.lastContact!).getTime() - new Date(a.lastContact!).getTime())
    .slice(0, 6); // Show last 6 activities

  function getActionFromStatus(status: string) {
    switch (status) {
      case 'confirmed':
        return 'Contract confirmed';
      case 'negotiating':
        return 'Price negotiation in progress';
      case 'interested':
        return 'Vendor showed interest';
      case 'declined':
        return 'Vendor declined';
      default:
        return 'Initial contact made';
    }
  }

  function getActivityIcon(status: string) {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'negotiating':
        return <DollarSign className="w-5 h-5 text-yellow-600" />;
      case 'interested':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'declined':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Mail className="w-5 h-5 text-gray-600" />;
    }
  }

  function getBgColor(status: string) {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 border-green-200';
      case 'negotiating':
        return 'bg-yellow-50 border-yellow-200';
      case 'interested':
        return 'bg-blue-50 border-blue-200';
      case 'declined':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return '1 day ago';
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Recent AI Activity</h2>
          <p className="text-sm text-gray-600 mt-1">
            Latest vendor interactions and status updates
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${getBgColor(activity.status)}`}
                >
                  {getActivityIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action} - {activity.vendor}
                    </p>
                    <p className="text-xs text-gray-600">
                      {activity.category} • ${activity.price.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(activity.lastContact!)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400">
                  Start vendor outreach to see activity here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Actions Required</h2>
          <p className="text-sm text-gray-600 mt-1">
            AI actions waiting for your input
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
            ) : pendingActions && pendingActions.length > 0 ? (
              pendingActions.slice(0, 5).map((action) => (
                <div key={action.id} className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {action.description}
                    </p>
                    {action.input_needed && (
                      <p className="text-xs text-orange-700 mt-1">
                        {action.input_needed}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(action.created_at)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-gray-500">No pending actions</p>
                <p className="text-sm text-gray-400">
                  All AI tasks are up to date
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIActivity;