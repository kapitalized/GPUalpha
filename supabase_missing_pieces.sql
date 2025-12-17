-- GPUalpha - Missing Database Pieces
-- Run this in your Supabase SQL Editor to add indexes, RLS policies, and triggers
-- Your tables are already created, this just adds the missing security and performance features

-- ============================================
-- 1. CREATE INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes for predictions table (most queried)
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON public.predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_gpu_id ON public.predictions(gpu_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON public.predictions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_is_resolved ON public.predictions(is_resolved) WHERE is_resolved = false;

-- Indexes for price_history table
CREATE INDEX IF NOT EXISTS idx_price_history_gpu_id ON public.price_history(gpu_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON public.price_history(recorded_at DESC);

-- Indexes for users table (for leaderboard queries)
CREATE INDEX IF NOT EXISTS idx_users_points ON public.users(points DESC);
CREATE INDEX IF NOT EXISTS idx_users_accuracy_score ON public.users(accuracy_score DESC) WHERE accuracy_score > 0;

-- Indexes for gpus table
CREATE INDEX IF NOT EXISTS idx_gpus_brand ON public.gpus(brand);
CREATE INDEX IF NOT EXISTS idx_gpus_availability ON public.gpus(availability);

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 3. CREATE RLS POLICIES
-- ============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

DROP POLICY IF EXISTS "Anyone can view GPUs" ON public.gpus;
DROP POLICY IF EXISTS "Service role can manage GPUs" ON public.gpus;

DROP POLICY IF EXISTS "Users can view all predictions" ON public.predictions;
DROP POLICY IF EXISTS "Users can create own predictions" ON public.predictions;
DROP POLICY IF EXISTS "Users can update own predictions" ON public.predictions;

DROP POLICY IF EXISTS "Anyone can view price history" ON public.price_history;
DROP POLICY IF EXISTS "Service role can insert price history" ON public.price_history;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" 
  ON public.users FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS Policies for gpus table
CREATE POLICY "Anyone can view GPUs" 
  ON public.gpus FOR SELECT 
  USING (true);

-- Allow service role (API routes) to manage GPUs
-- Note: FOR ALL requires both USING and WITH CHECK for INSERT operations
CREATE POLICY "Service role can manage GPUs" 
  ON public.gpus FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for predictions table
CREATE POLICY "Users can view all predictions" 
  ON public.predictions FOR SELECT 
  USING (true);

CREATE POLICY "Users can create own predictions" 
  ON public.predictions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions" 
  ON public.predictions FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for price_history table
CREATE POLICY "Anyone can view price history" 
  ON public.price_history FOR SELECT 
  USING (true);

-- Allow service role to insert price history (for automated updates)
CREATE POLICY "Service role can insert price history" 
  ON public.price_history FOR INSERT 
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- 4. CREATE TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_gpus_updated_at ON public.gpus;

-- Create triggers
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON public.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gpus_updated_at 
  BEFORE UPDATE ON public.gpus
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 5. OPTIONAL: INSERT SAMPLE GPU DATA
-- ============================================
-- Uncomment the section below if you want to add sample GPU data

/*
INSERT INTO public.gpus (model, brand, msrp, current_price, availability) VALUES
  ('RTX 4090', 'NVIDIA', 1599.00, 1699.00, 'limited'),
  ('RTX 4080', 'NVIDIA', 1199.00, 1099.00, 'in_stock'),
  ('RTX 4070', 'NVIDIA', 599.00, 549.00, 'in_stock'),
  ('RTX 4060 Ti', 'NVIDIA', 399.00, 379.00, 'in_stock'),
  ('RX 7900 XTX', 'AMD', 999.00, 949.00, 'in_stock'),
  ('RX 7800 XT', 'AMD', 499.00, 479.00, 'in_stock'),
  ('RX 7700 XT', 'AMD', 449.00, 429.00, 'in_stock')
ON CONFLICT DO NOTHING;
*/

-- ============================================
-- VERIFICATION QUERIES (Optional - run to verify)
-- ============================================

-- Check if indexes were created
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('users', 'gpus', 'predictions', 'price_history');

-- Check if RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('users', 'gpus', 'predictions', 'price_history');

-- Check if policies exist
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';

