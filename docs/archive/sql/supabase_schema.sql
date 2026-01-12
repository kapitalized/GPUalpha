-- GPUalpha Database Schema
-- Run this in your Supabase SQL Editor: https://app.supabase.com/project/cycpibwgmkvdpdooqbzu/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  avatar_url TEXT,
  points INTEGER DEFAULT 0,
  accuracy_score NUMERIC(5,2) DEFAULT 0,
  prediction_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GPUs table
CREATE TABLE IF NOT EXISTS gpus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model TEXT NOT NULL,
  brand TEXT NOT NULL,
  msrp NUMERIC(10,2) NOT NULL,
  current_price NUMERIC(10,2) NOT NULL,
  availability TEXT CHECK (availability IN ('in_stock', 'limited', 'out_of_stock')) DEFAULT 'out_of_stock',
  benchmark_score INTEGER,
  power_consumption INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gpu_id UUID NOT NULL REFERENCES gpus(id) ON DELETE CASCADE,
  predicted_price NUMERIC(10,2) NOT NULL,
  timeframe TEXT CHECK (timeframe IN ('7d', '30d', '90d')) NOT NULL,
  confidence INTEGER CHECK (confidence >= 0 AND confidence <= 100) NOT NULL,
  reasoning TEXT,
  actual_price NUMERIC(10,2),
  is_resolved BOOLEAN DEFAULT FALSE,
  accuracy_score NUMERIC(5,2),
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Price history table
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gpu_id UUID NOT NULL REFERENCES gpus(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  source TEXT DEFAULT 'api',
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_gpu_id ON predictions(gpu_id);
CREATE INDEX IF NOT EXISTS idx_predictions_created_at ON predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_price_history_gpu_id ON price_history(gpu_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON price_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_users_points ON users(points DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for gpus table
CREATE POLICY "Anyone can view GPUs" ON gpus FOR SELECT USING (true);
CREATE POLICY "Service role can manage GPUs" ON gpus FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for predictions table
CREATE POLICY "Users can view all predictions" ON predictions FOR SELECT USING (true);
CREATE POLICY "Users can create own predictions" ON predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own predictions" ON predictions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for price_history table
CREATE POLICY "Anyone can view price history" ON price_history FOR SELECT USING (true);
CREATE POLICY "Service role can insert price history" ON price_history FOR INSERT USING (auth.role() = 'service_role');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gpus_updated_at BEFORE UPDATE ON gpus
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample GPU data
INSERT INTO gpus (model, brand, msrp, current_price, availability) VALUES
  ('RTX 4090', 'NVIDIA', 1599.00, 1699.00, 'limited'),
  ('RTX 4080', 'NVIDIA', 1199.00, 1099.00, 'in_stock'),
  ('RTX 4070', 'NVIDIA', 599.00, 549.00, 'in_stock'),
  ('RX 7900 XTX', 'AMD', 999.00, 949.00, 'in_stock'),
  ('RX 7800 XT', 'AMD', 499.00, 479.00, 'in_stock')
ON CONFLICT DO NOTHING;

