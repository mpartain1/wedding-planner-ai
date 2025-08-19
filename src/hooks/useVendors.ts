import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { VendorService } from '../services/vendorService';
import type { DbVendor, CategoryWithVendors } from '../types';
import toast from 'react-hot-toast';

// Get all categories with vendors
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: VendorService.getCategories,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Get vendors for a specific category
export function useVendorsByCategory(categoryId: string) {
  return useQuery({
    queryKey: ['vendors', categoryId],
    queryFn: () => VendorService.getVendorsByCategory(categoryId),
    enabled: !!categoryId,
  });
}

// Add vendor mutation
export function useAddVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: VendorService.addVendor,
    onSuccess: (newVendor) => {
      // Invalidate categories to refresh the data
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['vendors', newVendor.category_id] });
      toast.success('Vendor added successfully!');
    },
    onError: (error) => {
      console.error('Failed to add vendor:', error);
      toast.error('Failed to add vendor');
    },
  });
}

// Update vendor mutation
export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DbVendor> }) =>
      VendorService.updateVendor(id, updates),
    onSuccess: (updatedVendor) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['vendors', updatedVendor.category_id] });
      toast.success('Vendor updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update vendor:', error);
      toast.error('Failed to update vendor');
    },
  });
}

// Delete vendor mutation
export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: VendorService.deleteVendor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Vendor deleted successfully!');
    },
    onError: (error) => {
      console.error('Failed to delete vendor:', error);
      toast.error('Failed to delete vendor');
    },
  });
}

// Select vendor mutation
export function useSelectVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, vendorId }: { categoryId: string; vendorId: string }) =>
      VendorService.selectVendor(categoryId, vendorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Vendor selected successfully!');
    },
    onError: (error) => {
      console.error('Failed to select vendor:', error);
      toast.error('Failed to select vendor');
    },
  });
}

// Add category mutation
export function useAddCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: VendorService.addCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category added successfully!');
    },
    onError: (error) => {
      console.error('Failed to add category:', error);
      toast.error('Failed to add category');
    },
  });
}

// Update category mutation
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CategoryWithVendors> }) =>
      VendorService.updateCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update category:', error);
      toast.error('Failed to update category');
    },
  });
}