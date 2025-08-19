-- Migration: 004_update_vendor_status.sql
-- Description: Replace 'pending' status with 'uncontacted'
-- Created: 2024-08-19

-- Step 1: Update existing records
UPDATE vendors 
SET status = 'uncontacted' 
WHERE status = 'pending';

-- Step 2: Drop the old constraint
ALTER TABLE vendors 
DROP CONSTRAINT vendors_status_check;

-- Step 3: Add new constraint with updated statuses
ALTER TABLE vendors 
ADD CONSTRAINT vendors_status_check 
CHECK (status IN ('confirmed', 'negotiating', 'interested', 'uncontacted', 'declined'));