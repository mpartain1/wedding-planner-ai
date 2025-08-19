import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export type Database = {
  public: {
    Tables: {
      vendor_categories: {
        Row: {
          id: string;
          name: string;
          budget: number;
          selected_vendor_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          budget: number;
          selected_vendor_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          budget?: number;
          selected_vendor_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      vendors: {
        Row: {
          id: string;
          category_id: string;
          name: string;
          contact_email: string;
          phone: string | null;
          price: number;
          status: 'confirmed' | 'negotiating' | 'interested' | 'uncontacted' | 'declined';
          last_contact: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          name: string;
          contact_email: string;
          phone?: string | null;
          price?: number;
          status?: 'confirmed' | 'negotiating' | 'interested' | 'uncontacted' | 'declined';
          last_contact?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          name?: string;
          contact_email?: string;
          phone?: string | null;
          price?: number;
          status?: 'confirmed' | 'negotiating' | 'interested' | 'uncontacted' | 'declined';
          last_contact?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          vendor_id: string;
          message_type: 'outbound' | 'inbound';
          subject: string | null;
          body: string | null;
          sent_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          message_type: 'outbound' | 'inbound';
          subject?: string | null;
          body?: string | null;
          sent_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          message_type?: 'outbound' | 'inbound';
          subject?: string | null;
          body?: string | null;
          sent_at?: string;
          created_at?: string;
        };
      };
      ai_actions: {
        Row: {
          id: string;
          vendor_id: string;
          action_type: string;
          description: string | null;
          requires_human_input: boolean;
          input_needed: string | null;
          completed: boolean;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          vendor_id: string;
          action_type: string;
          description?: string | null;
          requires_human_input?: boolean;
          input_needed?: string | null;
          completed?: boolean;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          vendor_id?: string;
          action_type?: string;
          description?: string | null;
          requires_human_input?: boolean;
          input_needed?: string | null;
          completed?: boolean;
          created_at?: string;
          completed_at?: string | null;
        };
      };
    };
  };
};