import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Clock, Eye, MessageSquare, Mail, Phone } from 'lucide-react';
import type { DbVendor } from '../../types';
import { useSendInitialOutreach } from '../../hooks/useAIEmail';
import ConversationModal from './ConversationModal';

interface VendorTableProps {
  vendors: DbVendor[];
}

const VendorTable: React.FC<VendorTableProps> = ({ vendors }) => {
  const [selectedVendor, setSelectedVendor] = useState<DbVendor | null>(null);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  
  const sendInitialOutreachMutation = useSendInitialOutreach();

  const getStatusColor = (status: DbVendor['status']): string => {
    switch(status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'negotiating': return 'text-yellow-600 bg-yellow-100';
      case 'interested': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-purple-600 bg-purple-100';
      case 'declined': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: DbVendor['status']): React.ReactElement => {
    switch(status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'negotiating': return <MessageSquare className="w-4 h-4" />;
      case 'interested': return <Eye className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'declined': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleViewConversation = (vendor: DbVendor) => {
    setSelectedVendor(vendor);
    setIsConversationModalOpen(true);
  };

  const handleSendInitialOutreach = async (vendor: DbVendor) => {
    try {
      await sendInitialOutreachMutation.mutateAsync({ vendorId: vendor.id });
    } catch (error) {
      console.error('Failed to send outreach:', error);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-600 border-b">
              <th className="pb-3">Vendor</th>
              <th className="pb-3">Contact</th>
              <th className="pb-3">Price</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Last Contact</th>
              <th className="pb-3">Email Conversation</th>
              <th className="pb-3">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="text-sm hover:bg-gray-50">
                <td className="py-3 font-medium text-gray-900">{vendor.name}</td>
                
                <td className="py-3 text-gray-600">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span>{vendor.contact_email}</span>
                    </div>
                    {vendor.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                  </div>
                </td>
                
                <td className="py-3 font-medium">${vendor.price.toLocaleString()}</td>
                
                <td className="py-3">
                  <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vendor.status)}`}>
                    {getStatusIcon(vendor.status)}
                    <span className="capitalize">{vendor.status}</span>
                  </span>
                </td>
                
                <td className="py-3 text-gray-600">{formatDate(vendor.last_contact)}</td>
                
                <td className="py-3">
                  <button
                    onClick={() => handleViewConversation(vendor)}
                    className="flex items-center space-x-1 px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>View Chat</span>
                  </button>
                </td>
                
                <td className="py-3 text-gray-600 max-w-xs">
                  <div className="truncate" title={vendor.notes || ''}>
                    {vendor.notes || 'No notes'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Conversation Modal */}
      <ConversationModal
        vendor={selectedVendor}
        isOpen={isConversationModalOpen}
        onClose={() => {
          setIsConversationModalOpen(false);
          setSelectedVendor(null);
        }}
      />
    </>
  );
};

export default VendorTable;