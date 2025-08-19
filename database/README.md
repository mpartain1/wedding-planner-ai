# Wedding Planner Database

This directory contains all database-related files for the Wedding Planner AI application.

## Directory Structure

```
database/
├── migrations/          # Schema changes, versioned
├── seeds/              # Sample data for development
├── queries/            # Common queries for reference
└── README.md          # This file
```

## Migrations

Migrations are numbered and run in order. Each migration should be:
- **Incremental**: Only contains changes, not the full schema
- **Idempotent**: Safe to run multiple times
- **Documented**: Clear description of what it does

### Current Migrations

1. **001_initial_schema.sql** - Creates base tables and relationships
2. **002_add_vendor_constraints.sql** - Adds constraints, indexes, and search
3. **003_add_audit_logging.sql** - Adds audit logging and email threading

## Running Migrations

### Option 1: Manual (Supabase Dashboard)
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste migration content
3. Run the SQL

### Option 2: Via CLI (if using Supabase CLI)
```bash
# Run all migrations
supabase db reset

# Or run specific migration
supabase db push
```

## Database Schema

### Core Tables

- **vendor_categories** - Wedding service categories (floral, venue, etc.)
- **vendors** - Individual vendors with contact info and status
- **ai_conversations** - Email conversation history
- **ai_actions** - Pending actions requiring human input

### Audit Tables

- **audit_log** - Tracks all changes to important records
- **email_threads** - Groups related conversations

## Sample Data

The `seeds/` directory contains sample data for development:
- Sample vendor categories
- Sample vendors in each category
- Sample email conversations
- Sample AI actions

## Useful Queries

Check `queries/common-queries.sql` for pre-written queries for:
- Budget analysis
- Vendor progress tracking
- Conversation history
- Recent activity

## Environment Setup

Make sure these environment variables are set:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Row Level Security (RLS)

All tables have RLS enabled with permissive policies for development.
In production, you should:
1. Create user authentication
2. Add proper RLS policies based on user roles
3. Remove the "allow all" policies

## Backup and Recovery

### Backup
```bash
# Via Supabase CLI
supabase db dump -f backup.sql

# Or use pg_dump if you have direct access
pg_dump postgres://[connection_string] > backup.sql
```

### Recovery
```bash
# Reset and restore
supabase db reset
psql postgres://[connection_string] < backup.sql
```

## Development Workflow

1. **Make schema changes**: Create new migration file
2. **Test locally**: Run migration on local/dev database
3. **Update types**: Regenerate TypeScript types if needed
4. **Deploy**: Run migration on production database

## Notes

- Always create a migration for schema changes (don't edit existing ones)
- Use descriptive names: `004_add_payment_tracking.sql`
- Include rollback instructions in comments if needed
- Test migrations on a copy of production data before deploying