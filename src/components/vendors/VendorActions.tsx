import React, { useState } from 'react';
import { CheckCircle, XCircle, DollarSign, MessageSquare, Eye } from 'lucide-react';
import type { DbVendor } from '../../types';
import { useAcceptVendor, useDeclineVendor, useNegotiatePrice } from '../../hooks/useAIEmail';

interface VendorActionsProps {
  vendor: DbVendor;
  onViewConversation: () => void;
}

const VendorActions: React.FC<VendorActionsProps> = ({ vendor, onViewConversation }) => {
  const [showNegotiationForm, setShowNegotiationForm] = useState(false);
  const [showDeclineForm, setShowDeclineForm] = useState(false);
  const [targetPrice, setTargetPrice] = useState(vendor.price * 0.85); // Default to 15% discount
  const [justification, setJustification] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  const acceptVendorMutation = useAcceptVendor();
  const declineVendorMutation = useDeclineVendor();
  const negotiatePriceMutation = useNegotiatePrice();

  const handleAccept = async () => {
    try {
      await acceptVendorMutation.mutateAsync({
        vendorId: vendor.id,
        finalPrice: vendor.price,
      });
    } catch (error) {
      console.error('Failed to accept vendor:', error);
    }
  };

  const handleNegotiate = async () => {
    if (!justification.trim()) return;

    try {
      await negotiatePriceMutation.mutateAsync({
        vendorId: vendor.id,
        targetPrice,
        justification,
      });
      setShowNegotiationForm(false);
      setJustification('');
    } catch (error) {
      console.error('Failed to negotiate:', error);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) return;

    try {
      await declineVendorMutation.mutateAsync({
        vendorId: vendor.id,
        reason: declineReason,
      });
      setShowDeclineForm(false);
      setDeclineReason('');
    } catch (error) {
      console.error('Failed to decline vendor:', error);
    }
  };

  if (vendor.status === 'confirmed') {
    return (
      <div className="flex items-center space-x-2">
        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
          ✅ Confirmed
        </span>
        <button
          onClick={onViewConversation}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          <Eye className="h-3 w-3" />
          <span>View</span>
        </button>
      </div>
    );
  }

  if (vendor.status === 'declined') {
    return (
      <div className="flex items-center space-x-2">
        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
          ❌ Declined
        </span>
        <button
          onClick={onViewConversation}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          <Eye className="h-3 w-3" />
          <span>View</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Quick Actions */}
      <div className="flex items-center space-x-1">
        <button
          onClick={handleAccept}
          disabled={acceptVendorMutation.isPending}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
        >
          <CheckCircle className="h-3 w-3" />
          <span>Accept</span>
        </button>

        <button
          onClick={() => setShowNegotiationForm(!showNegotiationForm)}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
        >
          <DollarSign className="h-3 w-3" />
          <span>Negotiate</span>
        </button>

        <button
          onClick={() => setShowDeclineForm(!showDeclineForm)}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          <XCircle className="h-3 w-3" />
          <span>Decline</span>
        </button>

        <button
          onClick={onViewConversation}
          className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
        >
          <MessageSquare className="h-3 w-3" />
          <span>Chat</span>
        </button>
      </div>

      {/* Negotiation Form */}
      {showNegotiationForm && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Target Price
            </label>
            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(Number(e.target.value))}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Justification
            </label>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Budget constraints, competing offers, etc."
              rows={2}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-yellow-500 resize-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleNegotiate}
              disabled={!justification.trim() || negotiatePriceMutation.isPending}
              className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50"
            >
              {negotiatePriceMutation.isPending ? 'Sending...' : 'Send Negotiation'}
            </button>
            <button
              onClick={() => setShowNegotiationForm(false)}
              className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Decline Form */}
      {showDeclineForm && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Reason for Declining
            </label>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Over budget, not the right fit, etc."
              rows={2}
              className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-red-500 resize-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDecline}
              disabled={!declineReason.trim() || declineVendorMutation.isPending}
              className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {declineVendorMutation.isPending ? 'Sending...' : 'Send Decline'}
            </button>
            <button
              onClick={() => setShowDeclineForm(false)}
              className="px-3 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorActions;