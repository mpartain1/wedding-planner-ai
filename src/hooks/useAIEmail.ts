import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AIEmailService } from '../services/aiEmailService';
import toast from 'react-hot-toast';

// Get conversation history for a vendor
export function useConversationHistory(vendorId: string) {
  return useQuery({
    queryKey: ['conversations', vendorId],
    queryFn: () => AIEmailService.getConversationHistory(vendorId),
    enabled: !!vendorId,
  });
}

// Get pending AI actions
export function usePendingActions() {
  return useQuery({
    queryKey: ['ai-actions'],
    queryFn: AIEmailService.getPendingActions,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Send initial outreach with AI generation
export function useSendInitialOutreach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, customMessage }: { vendorId: string; customMessage?: string }) =>
      AIEmailService.sendInitialOutreach(vendorId, customMessage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-actions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('🤖 AI-generated email sent successfully!');
    },
    onError: (error) => {
      console.error('Failed to send AI outreach:', error);
      toast.error('Failed to send AI-generated email');
    },
  });
}

// Process vendor response with AI analysis
export function useProcessVendorResponse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      vendorId, 
      responseContent, 
      priceQuoted 
    }: { 
      vendorId: string; 
      responseContent: string; 
      priceQuoted?: number;
    }) => AIEmailService.processVendorResponse(vendorId, responseContent, priceQuoted),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-actions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('🤖 Vendor response analyzed by AI!');
    },
    onError: (error) => {
      console.error('Failed to process response:', error);
      toast.error('Failed to process vendor response');
    },
  });
}

// Send AI-generated follow-up
export function useSendFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, message }: { vendorId: string; message?: string }) =>
      AIEmailService.sendFollowUp(vendorId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('🤖 AI follow-up email sent!');
    },
    onError: (error) => {
      console.error('Failed to send follow-up:', error);
      toast.error('Failed to send follow-up email');
    },
  });
}

// Negotiate price with AI-generated email
export function useNegotiatePrice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      vendorId, 
      targetPrice, 
      justification 
    }: { 
      vendorId: string; 
      targetPrice: number; 
      justification: string;
    }) => AIEmailService.negotiatePrice(vendorId, targetPrice, justification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-actions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('💰 Price negotiation email sent!');
    },
    onError: (error) => {
      console.error('Failed to negotiate price:', error);
      toast.error('Failed to send negotiation email');
    },
  });
}

// Accept vendor with AI-generated acceptance email
export function useAcceptVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, finalPrice }: { vendorId: string; finalPrice: number }) =>
      AIEmailService.acceptVendor(vendorId, finalPrice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('✅ Vendor accepted! Contract process initiated.');
    },
    onError: (error) => {
      console.error('Failed to accept vendor:', error);
      toast.error('Failed to accept vendor');
    },
  });
}

// Decline vendor with AI-generated polite decline email
export function useDeclineVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, reason }: { vendorId: string; reason: string }) =>
      AIEmailService.declineVendor(vendorId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      toast.success('❌ Vendor declined politely.');
    },
    onError: (error) => {
      console.error('Failed to decline vendor:', error);
      toast.error('Failed to decline vendor');
    },
  });
}

// Test email configuration (SendGrid + OpenAI)
export function useTestEmailConfiguration() {
  return useMutation({
    mutationFn: (testEmail: string) => AIEmailService.testEmailConfiguration(testEmail),
    onSuccess: (result) => {
      if (result.sendgrid && result.openai) {
        toast.success('✅ All email services are working correctly!');
      } else if (result.sendgrid || result.openai) {
        toast.success('⚠️ Some services are working, check configuration.');
      } else {
        toast.error('❌ Email services not configured properly.');
      }
    },
    onError: (error) => {
      console.error('Failed to test configuration:', error);
      toast.error('Failed to test email configuration');
    },
  });
}

// Mark AI action as completed
export function useCompleteAIAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (actionId: string) => {
      // This would be implemented in AIEmailService
      throw new Error('Not implemented yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-actions'] });
      toast.success('Action completed!');
    },
    onError: (error) => {
      console.error('Failed to complete action:', error);
      toast.error('Failed to complete action');
    },
  });
}

// Batch operations for multiple vendors
export function useBatchSendOutreach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vendorIds, customMessage }: { 
      vendorIds: string[]; 
      customMessage?: string 
    }) => {
      const results = await Promise.allSettled(
        vendorIds.map(vendorId => 
          AIEmailService.sendInitialOutreach(vendorId, customMessage)
        )
      );
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;
      
      return { successful, failed, total: vendorIds.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-actions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      
      toast.success(
        `📧 Batch email sent! ${result.successful} successful, ${result.failed} failed.`
      );
    },
    onError: (error) => {
      console.error('Failed to send batch emails:', error);
      toast.error('Failed to send batch emails');
    },
  });
}

// Get email analytics/stats
export function useEmailStats() {
  return useQuery({
    queryKey: ['email-stats'],
    queryFn: async () => {
      // This would be implemented to get stats from database
      // For now, return placeholder
      return {
        totalSent: 0,
        totalResponses: 0,
        responseRate: 0,
        averageResponseTime: '0 days',
        successfulNegotiations: 0
      };
    },
    refetchInterval: 60000, // Refetch every minute
  });
}

// Custom hook for vendor email workflow
export function useVendorEmailWorkflow(vendorId: string) {
  const conversationHistory = useConversationHistory(vendorId);
  const sendInitialOutreach = useSendInitialOutreach();
  const sendFollowUp = useSendFollowUp();
  const processResponse = useProcessVendorResponse();
  const negotiatePrice = useNegotiatePrice();
  const acceptVendor = useAcceptVendor();
  const declineVendor = useDeclineVendor();

  return {
    // Data
    conversationHistory: conversationHistory.data || [],
    isLoading: conversationHistory.isLoading,
    
    // Actions
    sendInitialOutreach: sendInitialOutreach.mutateAsync,
    sendFollowUp: sendFollowUp.mutateAsync,
    processResponse: processResponse.mutateAsync,
    negotiatePrice: negotiatePrice.mutateAsync,
    acceptVendor: acceptVendor.mutateAsync,
    declineVendor: declineVendor.mutateAsync,
    
    // Loading states
    isSending: sendInitialOutreach.isPending || 
               sendFollowUp.isPending || 
               negotiatePrice.isPending ||
               acceptVendor.isPending ||
               declineVendor.isPending,
    
    // Individual loading states
    isLoadingStates: {
      sendingOutreach: sendInitialOutreach.isPending,
      sendingFollowUp: sendFollowUp.isPending,
      processing: processResponse.isPending,
      negotiating: negotiatePrice.isPending,
      accepting: acceptVendor.isPending,
      declining: declineVendor.isPending,
    }
  };
}