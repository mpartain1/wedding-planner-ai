import { supabase } from '../lib/supabase';
import type { DbVendor, DbVendorCategory, CategoryWithVendors } from '../types';

export class VendorService {
  // Get all categories with their vendors
  static async getCategories(): Promise<CategoryWithVendors[]> {
    // First get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('vendor_categories')
      .select('*')
      .order('name');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw categoriesError;
    }

    if (!categories) return [];

    // Then get vendors for each category
    const categoriesWithVendors = await Promise.all(
      categories.map(async (category) => {
        const { data: vendors, error: vendorsError } = await supabase
          .from('vendors')
          .select('*')
          .eq('category_id', category.id)
          .order('name');

        if (vendorsError) {
          console.error('Error fetching vendors for category:', category.id, vendorsError);
          throw vendorsError;
        }

        // Get selected vendor if exists
        let selectedVendor = null;
        if (category.selected_vendor_id) {
          const { data: selectedVendorData } = await supabase
            .from('vendors')
            .select('*')
            .eq('id', category.selected_vendor_id)
            .single();
          selectedVendor = selectedVendorData;
        }

        return {
          ...category,
          vendors: vendors || [],
          selected_vendor: selectedVendor,
        };
      })
    );

    return categoriesWithVendors;
  }

  // Get vendors for a specific category
  static async getVendorsByCategory(categoryId: string): Promise<DbVendor[]> {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .eq('category_id', categoryId)
      .order('name');

    if (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }

    return data || [];
  }

  // Add a new vendor
  static async addVendor(vendor: Omit<DbVendor, 'id' | 'created_at' | 'updated_at'>): Promise<DbVendor> {
    const { data, error } = await supabase
      .from('vendors')
      .insert(vendor)
      .select()
      .single();

    if (error) {
      console.error('Error adding vendor:', error);
      throw error;
    }

    return data;
  }

  // Update vendor
  static async updateVendor(id: string, updates: Partial<DbVendor>): Promise<DbVendor> {
    const { data, error } = await supabase
      .from('vendors')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating vendor:', error);
      throw error;
    }

    return data;
  }

  // Delete vendor
  static async deleteVendor(id: string): Promise<void> {
    const { error } = await supabase
      .from('vendors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vendor:', error);
      throw error;
    }
  }

  // Select a vendor for a category
  static async selectVendor(categoryId: string, vendorId: string): Promise<DbVendorCategory> {
    const { data, error } = await supabase
      .from('vendor_categories')
      .update({
        selected_vendor_id: vendorId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Error selecting vendor:', error);
      throw error;
    }

    return data;
  }

  // Add a new category
  static async addCategory(category: Omit<DbVendorCategory, 'id' | 'created_at' | 'updated_at' | 'selected_vendor_id'>): Promise<DbVendorCategory> {
    const { data, error } = await supabase
      .from('vendor_categories')
      .insert(category)
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      throw error;
    }

    return data;
  }

  // Update category budget
  static async updateCategory(id: string, updates: Partial<DbVendorCategory>): Promise<DbVendorCategory> {
    const { data, error } = await supabase
      .from('vendor_categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return data;
  }

  // Get vendors that need human input
  static async getVendorsNeedingInput(): Promise<DbVendor[]> {
    const { data: actions, error } = await supabase
      .from('ai_actions')
      .select(`
        *,
        vendor:vendors (*)
      `)
      .eq('requires_human_input', true)
      .eq('completed', false);

    if (error) {
      console.error('Error fetching vendors needing input:', error);
      throw error;
    }

    return actions?.map(action => action.vendor).filter(Boolean) || [];
  }

  // Mark AI action as completed
  static async completeAIAction(actionId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_actions')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', actionId);

    if (error) {
      console.error('Error completing AI action:', error);
      throw error;
    }
  }
}