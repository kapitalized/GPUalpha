import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Provide better error messages for missing env vars
if (!supabaseUrl || !supabaseAnonKey) {
  const missing = []
  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseAnonKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  
  const errorMessage = `Missing required Supabase environment variables: ${missing.join(', ')}. ` +
    `Please add them to Vercel Dashboard → Settings → Environment Variables. ` +
    `See VERCEL_ENV_SETUP.md for instructions.`
  
  // In production, throw immediately to fail fast
  if (process.env.NODE_ENV === 'production') {
    throw new Error(errorMessage)
  }
  
  // In development/build, log warning but allow build to continue
  // This helps with build-time checks where env vars might not be available
  console.warn('⚠️', errorMessage)
}

// Client-side Supabase client (uses anon key with RLS protection)
// Will fail at runtime if env vars are missing in production
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Server-side Supabase client (uses service role key, bypasses RLS)
// Only use in API routes, never in client-side code
export const supabaseServiceRole = (supabaseUrl && supabaseServiceRoleKey)
  ? createClient(supabaseUrl!, supabaseServiceRoleKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Database types for TypeScript
export interface UserProfile {
  id: string
  email: string
  username?: string
  avatar_url?: string
  points: number
  accuracy_score: number
  prediction_streak: number
  created_at: string
  updated_at: string
}

export interface GPU {
  id: string
  model: string
  brand: string
  slug: string
  msrp: number
  current_price: number
  availability: 'in_stock' | 'limited' | 'out_of_stock'
  benchmark_score?: number
  power_consumption?: number
  created_at: string
  updated_at: string
}

export interface Prediction {
  id: string
  user_id: string
  gpu_id: string
  predicted_price: number
  timeframe: '7d' | '30d' | '90d'
  confidence: number
  reasoning?: string
  actual_price?: number
  is_resolved: boolean
  accuracy_score?: number
  points_earned?: number
  created_at: string
  resolved_at?: string
}

export interface PriceHistory {
  id: string
  gpu_id: string
  price: number
  source: string
  recorded_at: string
}