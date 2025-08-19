-- Migration: 001_initial_schema.sql
-- Description: Create initial wedding planner database schema
-- Created: 2024-08-18

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create vendor_categories table
CREATE TABLE vendor_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  budget DECIMAL(10,2) NOT NULL,
  selected_vendor_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vendors table
CREATE TABLE vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES vendor_categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' 
    CHECK (status IN ('confirmed', 'negotiating', 'interested', 'pending', 'declined')),
  last_contact DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for selected_vendor_id
ALTER TABLE vendor_categories 
ADD CONSTRAINT fk_selected_vendor 
FOREIGN KEY (selected_vendor_id) REFERENCES vendors(id);

-- Create ai_conversations table for tracking email chains
CREATE TABLE ai_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  message_type VARCHAR(50) NOT NULL CHECK (message_type IN ('outbound', 'inbound')),
  subject VARCHAR(500),
  body TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ai_actions table for tracking what AI needs to do
CREATE TABLE ai_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  description TEXT,
  requires_human_input BOOLEAN DEFAULT FALSE,
  input_needed TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_vendors_category_id ON vendors(category_id);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_ai_conversations_vendor_id ON ai_conversations(vendor_id);
CREATE INDEX idx_ai_actions_vendor_id ON ai_actions(vendor_id);
CREATE INDEX idx_ai_actions_completed ON ai_actions(completed);

-- Enable Row Level Security (RLS)
ALTER TABLE vendor_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_actions ENABLE ROW LEVEL SECURITY;

-- Create policies (for now, allow all operations - you can restrict later)
CREATE POLICY "Allow all operations on vendor_categories" ON vendor_categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on vendors" ON vendors FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai_conversations" ON ai_conversations FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai_actions" ON ai_actions FOR ALL USING (true);