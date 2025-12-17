-- Optimized Time-Series Setup for GPUalpha Price History
-- This works with standard PostgreSQL (no TimescaleDB required)
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. OPTIMIZE price_history TABLE STRUCTURE
-- ============================================

-- Ensure the table exists with optimal structure
CREATE TABLE IF NOT EXISTS public.price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gpu_id UUID NOT NULL REFERENCES public.gpus(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL,
  source TEXT DEFAULT 'api',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 2. CREATE OPTIMAL TIME-SERIES INDEXES
-- ============================================

-- Drop existing indexes if they exist (to recreate with better structure)
DROP INDEX IF EXISTS idx_price_history_gpu_id;
DROP INDEX IF EXISTS idx_price_history_recorded_at;
DROP INDEX IF EXISTS idx_price_history_gpu_time;

-- Composite index for most common query pattern: GPU + time range
-- This is the most important index for time-series queries
CREATE INDEX idx_price_history_gpu_time 
ON public.price_history (gpu_id, recorded_at DESC)
INCLUDE (price, source);

-- Index for time-only queries (for aggregate queries across all GPUs)
CREATE INDEX idx_price_history_recorded_at 
ON public.price_history (recorded_at DESC)
WHERE recorded_at > NOW() - INTERVAL '1 year';

-- Partial index for recent data (faster queries on recent prices)
CREATE INDEX idx_price_history_recent 
ON public.price_history (gpu_id, recorded_at DESC)
WHERE recorded_at > NOW() - INTERVAL '90 days';

-- Index for source filtering
CREATE INDEX idx_price_history_source 
ON public.price_history (source, recorded_at DESC)
WHERE source IS NOT NULL;

-- ============================================
-- 3. CREATE MATERIALIZED VIEWS FOR AGGREGATES
-- ============================================
-- These pre-compute daily/hourly averages for faster queries

-- Daily price aggregates (refreshed periodically)
CREATE MATERIALIZED VIEW IF NOT EXISTS price_history_daily AS
SELECT 
  DATE(recorded_at) AS day,
  gpu_id,
  AVG(price) AS avg_price,
  MIN(price) AS min_price,
  MAX(price) AS max_price,
  COUNT(*) AS data_points,
  (array_agg(price ORDER BY recorded_at ASC))[1] AS open_price,
  (array_agg(price ORDER BY recorded_at DESC))[1] AS close_price
FROM public.price_history
GROUP BY DATE(recorded_at), gpu_id;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_price_history_daily_unique 
ON price_history_daily (day, gpu_id);

CREATE INDEX IF NOT EXISTS idx_price_history_daily_gpu 
ON price_history_daily (gpu_id, day DESC);

-- Hourly aggregates for recent data (last 7 days)
CREATE MATERIALIZED VIEW IF NOT EXISTS price_history_hourly AS
SELECT 
  DATE_TRUNC('hour', recorded_at) AS hour,
  gpu_id,
  AVG(price) AS avg_price,
  MIN(price) AS min_price,
  MAX(price) AS max_price,
  COUNT(*) AS data_points
FROM public.price_history
WHERE recorded_at > NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', recorded_at), gpu_id;

-- Create index on hourly view
CREATE UNIQUE INDEX IF NOT EXISTS idx_price_history_hourly_unique 
ON price_history_hourly (hour, gpu_id);

CREATE INDEX IF NOT EXISTS idx_price_history_hourly_gpu 
ON price_history_hourly (gpu_id, hour DESC);

-- ============================================
-- 4. HELPER FUNCTIONS FOR TIME-SERIES QUERIES
-- ============================================

-- Function to get latest spot price for a GPU
CREATE OR REPLACE FUNCTION get_latest_price(p_gpu_id UUID)
RETURNS TABLE (
  price NUMERIC,
  recorded_at TIMESTAMPTZ,
  source TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT ph.price, ph.recorded_at, ph.source
  FROM public.price_history ph
  WHERE ph.gpu_id = p_gpu_id
  ORDER BY ph.recorded_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get price average over time period (for Asian-style settlement)
CREATE OR REPLACE FUNCTION get_price_average(
  p_gpu_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
)
RETURNS NUMERIC AS $$
DECLARE
  v_avg NUMERIC;
BEGIN
  SELECT AVG(price) INTO v_avg
  FROM public.price_history
  WHERE gpu_id = p_gpu_id
    AND recorded_at >= p_start_time
    AND recorded_at <= p_end_time;
  
  RETURN COALESCE(v_avg, 0);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get comprehensive price statistics
CREATE OR REPLACE FUNCTION get_price_stats(
  p_gpu_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ
)
RETURNS TABLE (
  avg_price NUMERIC,
  min_price NUMERIC,
  max_price NUMERIC,
  price_change NUMERIC,
  price_change_percent NUMERIC,
  data_points BIGINT,
  open_price NUMERIC,
  close_price NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH price_data AS (
    SELECT 
      price,
      recorded_at
    FROM public.price_history
    WHERE gpu_id = p_gpu_id
      AND recorded_at >= p_start_time
      AND recorded_at <= p_end_time
    ORDER BY recorded_at
  )
  SELECT 
    AVG(price) AS avg_price,
    MIN(price) AS min_price,
    MAX(price) AS max_price,
    (MAX(price) - MIN(price)) AS price_change,
    CASE 
      WHEN MIN(price) > 0 
      THEN ((MAX(price) - MIN(price)) / MIN(price)) * 100
      ELSE 0
    END AS price_change_percent,
    COUNT(*) AS data_points,
    (SELECT price FROM price_data ORDER BY recorded_at ASC LIMIT 1) AS open_price,
    (SELECT price FROM price_data ORDER BY recorded_at DESC LIMIT 1) AS close_price
  FROM price_data;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_price_aggregates()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY price_history_daily;
  REFRESH MATERIALIZED VIEW CONCURRENTLY price_history_hourly;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. AUTOMATIC REFRESH FUNCTION (via pg_cron if available)
-- ============================================
-- Note: pg_cron may not be available on all Supabase plans
-- You can manually refresh or set up a cron job externally

-- Function to refresh daily aggregates (run this periodically)
-- You can call this from your API or set up a cron job

-- ============================================
-- 6. QUERY OPTIMIZATION TIPS
-- ============================================

-- Always use time ranges in WHERE clauses for better index usage
-- Example:
-- SELECT * FROM price_history 
-- WHERE gpu_id = 'xxx' 
--   AND recorded_at >= NOW() - INTERVAL '30 days'
-- ORDER BY recorded_at DESC;

-- Use materialized views for daily/hourly aggregates
-- Example:
-- SELECT * FROM price_history_daily 
-- WHERE gpu_id = 'xxx' 
--   AND day >= CURRENT_DATE - INTERVAL '30 days'
-- ORDER BY day DESC;

-- ============================================
-- 7. INITIAL DATA POPULATION
-- ============================================
-- Refresh materialized views after setup
SELECT refresh_price_aggregates();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check indexes
-- SELECT indexname, indexdef FROM pg_indexes 
-- WHERE tablename = 'price_history';

-- Check materialized views
-- SELECT schemaname, matviewname FROM pg_matviews 
-- WHERE matviewname LIKE 'price_history%';

-- Test helper functions
-- SELECT * FROM get_latest_price('your-gpu-id-here');
-- SELECT get_price_average('your-gpu-id-here', NOW() - INTERVAL '7 days', NOW());
-- SELECT * FROM get_price_stats('your-gpu-id-here', NOW() - INTERVAL '30 days', NOW());

