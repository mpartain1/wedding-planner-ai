// Database types
export interface DbVendor {
    id: string;
    category_id: string;
    name: string;
    contact_email: string;
    phone: string | null;
    price: number;
    status: 'uncontacted' | 'negotiating' | 'interested' | 'declined' | 'confirmed';
    last_contact: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export interface DbVendorCategory {
    id: string;
    name: string;
    budget: number;
    notes: string | null;
    selected_vendor_id: string | null;
    created_at: string;
    updated_at: string;
    vendors?: DbVendor[];
    selected_vendor?: DbVendor | null;
  }
  
  export interface DbAIConversation {
    id: string;
    vendor_id: string;
    message_type: 'outbound' | 'inbound';
    subject: string | null;
    body: string | null;
    sent_at: string;
    created_at: string;
  }
  
  export interface DbAIAction {
    id: string;
    vendor_id: string;
    action_type: string;
    description: string | null;
    requires_human_input: boolean;
    input_needed: string | null;
    completed: boolean;
    created_at: string;
    completed_at: string | null;
  }
  
  // Legacy types for compatibility (can be removed later)
  export interface Vendor {
    id: number;
    name: string;
    contact: string;
    phone: string;
    price: number;
    status: 'confirmed' | 'negotiating' | 'interested' | 'uncontacted' | 'declined';
    lastContact: string;
    notes: string;
  }
  
  export interface VendorCategory {
    name: string;
    budget: number;
    selected: { id: number; name: string; price: number } | null;
    vendors: Vendor[];
  }
  
  export interface VendorCategories {
    [key: string]: VendorCategory;
  }
  
  export interface NewVendorForm {
    category: string;
    name: string;
    contact: string;
    phone: string;
    estimatedPrice: string;
  }
  
  export type TabType = 'dashboard' | 'vendors';
  
  // API Response types
  export interface VendorWithCategory extends DbVendor {
    category: DbVendorCategory;
  }
  
  export interface CategoryWithVendors extends DbVendorCategory {
    vendors: DbVendor[];
    selected_vendor: DbVendor | null;
  }