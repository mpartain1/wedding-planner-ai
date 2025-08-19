import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export function useRealtimeVendors() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to vendor changes
    const vendorSubscription = supabase
      .channel('vendor-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendors',
        },
        (payload) => {
          console.log('Vendor change detected:', payload);
          
          // Invalidate queries to refetch data
          queryClient.invalidateQueries({ queryKey: ['categories'] });
          queryClient.invalidateQueries({ queryKey: ['vendors'] });
          
          // Show notification based on event type
          switch (payload.eventType) {
            case 'INSERT':
              toast.success(`New vendor "${payload.new.name}" added`);
              break;
            case 'UPDATE':
              toast.success(`Vendor "${payload.new.name}" updated`);
              break;
            case 'DELETE':
              toast.success('Vendor removed');
              break;
          }
        }
      )
      .subscribe();

    // Subscribe to category changes
    const categorySubscription = supabase
      .channel('category-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendor_categories',
        },
        (payload) => {
          console.log('Category change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['categories'] });
          
          if (payload.eventType === 'UPDATE' && payload.new.selected_vendor_id) {
            toast.success(`Vendor selected for ${payload.new.name}`);
          }
        }
      )
      .subscribe();

    // Subscribe to AI actions
    const aiActionSubscription = supabase
      .channel('ai-action-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_actions',
        },
        (payload) => {
          console.log('New AI action:', payload);
          
          if (payload.new.requires_human_input) {
            toast.error(`Action required: ${payload.new.description}`);
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      vendorSubscription.unsubscribe();
      categorySubscription.unsubscribe();
      aiActionSubscription.unsubscribe();
    };
  }, [queryClient]);
}