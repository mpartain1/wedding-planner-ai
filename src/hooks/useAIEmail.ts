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

// Send initial outreach
export function useSendInitialOutreach() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, customMessage }: { vendorId: string; customMessage?: string }) =>
      AIEmailService.sendInitialOutreach(vendorId, customMessage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['ai-actions'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Initial outreach email sent!');
    },
    onError: (error) => {
      console.error('Failed to send outreach:', error);
      toast.error('Failed to send outreach email');
    },
  });
}

// Process vendor response
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
      toast.success('Vendor response processed!');
    },
    onError: (error) => {
      console.error('Failed to process response:', error);
      toast.error('Failed to process vendor response');
    },
  });
}

// Send follow-up
export function useSendFollowUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, message }: { vendorId: string; message: string }) =>
      AIEmailService.sendFollowUp(vendorId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Follow-up email sent!');
    },
    onError: (error) => {
      console.error('Failed to send follow-up:', error);
      toast.error('Failed to send follow-up email');
    },
  });
}

// Negotiate price
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
      toast.success('Price negotiation email sent!');
    },
    onError: (error) => {
      console.error('Failed to negotiate price:', error);
      toast.error('Failed to send negotiation email');
    },
  });
}

// Accept vendor
export function useAcceptVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, finalPrice }: { vendorId: string; finalPrice: number }) =>
      AIEmailService.acceptVendor(vendorId, finalPrice),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Vendor accepted! Contract process initiated.');
    },
    onError: (error) => {
      console.error('Failed to accept vendor:', error);
      toast.error('Failed to accept vendor');
    },
  });
}

// Decline vendor
export function useDeclineVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, reason }: { vendorId: string; reason: string }) =>
      AIEmailService.declineVendor(vendorId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Vendor declined politely.');
    },
    onError: (error) => {
      console.error('Failed to decline vendor:', error);
      toast.error('Failed to decline vendor');
    },
  });
}