#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: '.env.local' });
config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Environment Check:');
console.log(`VITE_SUPABASE_URL: ${supabaseUrl ? '✅ Found' : '❌ Missing'}`);
console.log(`VITE_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ Found' : '❌ Missing'}`);
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Check if migrations table exists
 */
async function checkMigrationsTable() {
  try {
    const { data, error } = await supabase
      .from('schema_migrations')
      .select('version')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      return false; // Table doesn't exist
    }
    
    return true; // Table exists
  } catch (error) {
    return false;
  }
}

/**
 * Get applied migrations
 */
async function getAppliedMigrations() {
  try {
    const { data, error } = await supabase
      .from('schema_migrations')
      .select('version')
      .order('version');
    
    if (error) {
      return [];
    }
    
    return data?.map(row => row.version) || [];
  } catch (error) {
    return [];
  }
}

/**
 * Display SQL for manual execution
 */
async function showMigrationSQL(filename) {
  try {
    const filePath = path.join(__dirname, 'migrations', filename);
    const sql = await fs.readFile(filePath, 'utf8');
    
    console.log(`\n📄 Migration: ${filename}`);
    console.log('📋 Copy and paste this SQL into Supabase Dashboard → SQL Editor:\n');
    console.log('```sql');
    console.log(sql);
    console.log('```\n');
    
    return true;
  } catch (error) {
    console.error(`❌ Error reading migration ${filename}:`, error);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🔄 Database Migration Helper');
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`);
  
  try {
    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort();
    
    console.log(`📁 Available migrations: ${migrationFiles.length}`);
    
    // Check if migrations table exists
    const migrationsTableExists = await checkMigrationsTable();
    
    if (!migrationsTableExists) {
      console.log('\n🚀 First time setup detected!');
      console.log('📋 Run all migrations in order:\n');
      
      // Show all migrations in order, including 000_create_migrations_table
      for (const file of migrationFiles) {
        await showMigrationSQL(file);
      }
      
      // Show how to mark all as applied
      console.log('📋 After running all migrations above, mark them as applied:');
      console.log('```sql');
      for (const file of migrationFiles) {
        const version = file.replace('.sql', '');
        console.log(`INSERT INTO schema_migrations (version) VALUES ('${version}');`);
      }
      console.log('```\n');
      
      console.log('🎉 After running all SQL above, your database will be fully set up!');
      console.log('💡 Then test your app with: npm run dev');
      return;
    }
    
    // If migrations table exists, check for pending migrations
    const appliedMigrations = await getAppliedMigrations();
    console.log(`📋 Applied migrations: ${appliedMigrations.length}`);
    
    if (appliedMigrations.length > 0) {
      console.log(`⏭️  Already applied: ${appliedMigrations.join(', ')}`);
    }
    
    // Show pending migrations
    const pendingMigrations = migrationFiles.filter(file => {
      const version = file.replace('.sql', '');
      return !appliedMigrations.includes(version);
    });
    
    if (pendingMigrations.length === 0) {
      console.log('\n✨ Database is up to date! No migrations needed.');
      return;
    }
    
    console.log(`\n🔄 Found ${pendingMigrations.length} pending migration(s):\n`);
    
    // Show each pending migration
    for (const file of pendingMigrations) {
      await showMigrationSQL(file);
    }
    
    // Show how to mark migrations as applied
    console.log('📋 After running each migration, mark it as applied:');
    console.log('```sql');
    for (const file of pendingMigrations) {
      const version = file.replace('.sql', '');
      console.log(`INSERT INTO schema_migrations (version) VALUES ('${version}');`);
    }
    console.log('```\n');
    
    console.log('🎉 After running all SQL above, your database will be fully migrated!');
    console.log('💡 Then test your app with: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Migration process failed:', error);
  }
}

main();