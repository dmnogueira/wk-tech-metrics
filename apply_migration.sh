#!/bin/bash

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found!"
  exit 1
fi

# Load environment variables
source .env

# Extract project ID and anon key
PROJECT_ID="${VITE_SUPABASE_PROJECT_ID}"
SUPABASE_URL="${VITE_SUPABASE_URL}"

echo "🔄 Applying migration to Supabase project: $PROJECT_ID"
echo "📂 Migration: 20251116010000_fix_user_roles_and_rls.sql"
echo ""

# Read migration file
MIGRATION_SQL=$(cat supabase/migrations/20251116010000_fix_user_roles_and_rls.sql)

echo "📤 Sending migration SQL to Supabase..."
echo ""
echo "⚠️  Note: This requires Supabase CLI or direct SQL execution"
echo "Please run this migration manually via Supabase Dashboard > SQL Editor"
echo ""
echo "Migration file location:"
echo "  /home/user/webapp/supabase/migrations/20251116010000_fix_user_roles_and_rls.sql"
echo ""
echo "Or use Supabase CLI:"
echo "  supabase db push"

