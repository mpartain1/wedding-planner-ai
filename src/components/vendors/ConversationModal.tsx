import React, { useState } from 'react';
import { X, Send, Mail, Reply, Clock, User, Bot } from 'lucide-react';
import type { DbVendor } from '../../types';
import { useConversationHistory, useSendFollowUp } from '../../hooks/useAIEmail';

interface ConversationModalProps {
  vendor: DbVendor | null;
  isOpen: boolean;
  onClose: () => void;
}

const ConversationModal: React.FC<ConversationModalProps> = ({ vendor, isOpen, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);

  const { data: conversations, isLoading } = useConversationHistory(vendor?.id || '');
  const sendFollowUpMutation = useSendFollowUp();

  const handleSendMessage = async () => {
    if (!vendor || !newMessage.trim()) return;

    try {
      await sendFollowUpMutation.mutateAsync({
        vendorId: vendor.id,
        message: newMessage,
      });
      setNewMessage('');
      setIsComposing(false);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Email Conversation</h2>
              <p className="text-sm text-gray-600">{vendor.name} - {vendor.contact_email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : conversations && conversations.length > 0 ? (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`flex ${
                  conversation.message_type === 'outbound' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-4 ${
                    conversation.message_type === 'outbound'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    {conversation.message_type === 'outbound' ? (
                      <Bot className="h-4 w-4" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {conversation.message_type === 'outbound' ? 'AI Assistant' : vendor.name}
                    </span>
                    <Clock className="h-3 w-3 opacity-70" />
                    <span className="text-xs opacity-70">
                      {formatDate(conversation.sent_at)}
                    </span>
                  </div>
                  
                  {conversation.subject && (
                    <div className="font-semibold mb-2 text-sm">
                      Subject: {conversation.subject}
                    </div>
                  )}
                  
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {conversation.body}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No conversation history yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start the conversation by sending an initial outreach email
              </p>
            </div>
          )}
        </div>

        {/* Compose Section */}
        <div className="border-t border-gray-200 p-6">
          {!isComposing ? (
            <button
              onClick={() => setIsComposing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Reply className="h-4 w-4" />
              <span>Compose Reply</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message to {vendor.name}
                </label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsComposing(false);
                    setNewMessage('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendFollowUpMutation.isPending}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {sendFollowUpMutation.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span>{sendFollowUpMutation.isPending ? 'Sending...' : 'Send Message'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationModal;