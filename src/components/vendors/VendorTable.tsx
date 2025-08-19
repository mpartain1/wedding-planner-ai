import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Clock, Eye, MessageSquare, Mail, Phone, Trash2, MoreVertical } from 'lucide-react';
import type { DbVendor } from '../../types';
import { useSendInitialOutreach } from '../../hooks/useAIEmail';
import { useDeleteVendor } from '../../hooks/useVendors';
import ConversationModal from './ConversationModal';

interface VendorTableProps {
  vendors: DbVendor[];
}

const VendorTable: React.FC<VendorTableProps> = ({ vendors }) => {
  const [selectedVendor, setSelectedVendor] = useState<DbVendor | null>(null);
  const [isConversationModalOpen, setIsConversationModalOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<DbVendor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const sendInitialOutreachMutation = useSendInitialOutreach();
  const deleteVendorMutation = useDeleteVendor();

  const getStatusColor = (status: DbVendor['status']): string => {
    switch(status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'negotiating': return 'text-yellow-600 bg-yellow-100';
      case 'interested': return 'text-blue-600 bg-blue-100';
      case 'uncontacted': return 'text-purple-600 bg-purple-100';
      case 'declined': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: DbVendor['status']): React.ReactElement => {
    switch(status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'negotiating': return <MessageSquare className="w-4 h-4" />;
      case 'interested': return <Eye className="w-4 h-4" />;
      case 'uncontacted': return <Clock className="w-4 h-4" />;
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
      await sendInitialOutreachMutation.mutateAsync({
        vendorId: vendor.id
      });
    } catch (error) {
      console.error('Failed to send outreach:', error);
    }
  };

  const handleDeleteClick = (vendor: DbVendor) => {
    setVendorToDelete(vendor);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!vendorToDelete) return;

    try {
      await deleteVendorMutation.mutateAsync(vendorToDelete.id);
      setShowDeleteConfirm(false);
      setVendorToDelete(null);
    } catch (error) {
      console.error('Failed to delete vendor:', error);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setVendorToDelete(null);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid';
    }
  };

  if (vendors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No vendors in this category yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Add vendors using the form above
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr className="text-left">
              <th className="pb-3 font-medium text-gray-900">Vendor</th>
              <th className="pb-3 font-medium text-gray-900">Price</th>
              <th className="pb-3 font-medium text-gray-900">Status</th>
              <th className="pb-3 font-medium text-gray-900">Last Contact</th>
              <th className="pb-3 font-medium text-gray-900">Actions</th>
              <th className="pb-3 font-medium text-gray-900">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vendors.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-gray-50">
                <td className="py-3">
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900">{vendor.name}</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <a 
                        href={`mailto:${vendor.contact_email}`}
                        className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <Mail className="h-3 w-3" />
                        <span>{vendor.contact_email}</span>
                      </a>
                    </div>
                    {vendor.phone && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Phone className="h-3 w-3 text-gray-400" />
                        <a 
                          href={`tel:${vendor.phone}`}
                          className="text-xs text-gray-600 hover:text-gray-800"
                        >
                          {vendor.phone}
                        </a>
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
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewConversation(vendor)}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      title="View conversation history"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Chat</span>
                    </button>
                    
                    {vendor.status === 'uncontacted' && (
                      <button
                        onClick={() => handleSendInitialOutreach(vendor)}
                        disabled={sendInitialOutreachMutation.isPending}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors disabled:opacity-50"
                        title="Send AI-generated outreach email"
                      >
                        {sendInitialOutreachMutation.isPending ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b border-green-600"></div>
                        ) : (
                          <Mail className="h-3 w-3" />
                        )}
                        <span>Send AI Outreach</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteClick(vendor)}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      title="Delete vendor"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && vendorToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Vendor</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{vendorToDelete.name}</strong>? 
                This will permanently remove the vendor and all associated conversation history.
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                disabled={deleteVendorMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteVendorMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 rounded-md transition-colors flex items-center justify-center space-x-2"
              >
                {deleteVendorMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Vendor</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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