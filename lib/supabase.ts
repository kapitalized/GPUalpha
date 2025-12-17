import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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