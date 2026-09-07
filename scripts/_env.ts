import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/types/database.ts';

config({ path: '.env.import' });

function required(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`\n✗ Falta ${name} no .env.import (copie de .env.import.example).\n`);
    process.exit(1);
  }
  return v;
}

export const env = {
  supabaseUrl: () => required('SUPABASE_URL'),
  serviceRoleKey: () => required('SUPABASE_SERVICE_ROLE_KEY'),
  bubbleBase: () => required('BUBBLE_API_BASE'),
  bubbleToken: () => required('BUBBLE_API_TOKEN'),
};

export function admin() {
  return createClient<Database>(env.supabaseUrl(), env.serviceRoleKey(), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
