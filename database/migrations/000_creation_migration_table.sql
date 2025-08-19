-- Migration: 000_create_migrations_table.sql
-- Description: Create schema_migrations table for tracking applied migrations
-- Created: 2024-08-18

-- Create the migrations tracking table
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);