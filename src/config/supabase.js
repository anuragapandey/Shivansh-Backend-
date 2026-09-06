import { createClient } from '@supabase/supabase-js'
import { env } from './env.js'

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_PUBLIC_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

export const supabaseAdmin = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})
