-- Migration: Add Extended GPU Specifications
-- Run this in Supabase SQL Editor to add detailed specs from Vast.ai API
-- Date: December 24, 2025

-- Add new columns to gpus table for extended specifications
ALTER TABLE gpus
ADD COLUMN IF NOT EXISTS cpu_cores INTEGER,
ADD COLUMN IF NOT EXISTS cpu_ram INTEGER,
ADD COLUMN IF NOT EXISTS cpu_name TEXT,
ADD COLUMN IF NOT EXISTS disk_space INTEGER,
ADD COLUMN IF NOT EXISTS inet_down INTEGER,
ADD COLUMN IF NOT EXISTS inet_up INTEGER,
ADD COLUMN IF NOT EXISTS dlperf NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS cuda_version NUMERIC(4,1),
ADD COLUMN IF NOT EXISTS reliability_score NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS provider_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_range_min NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS price_range_max NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS data_sources TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add comments to new columns
COMMENT ON COLUMN gpus.cpu_cores IS 'Average CPU cores across providers';
COMMENT ON COLUMN gpus.cpu_ram IS 'Average system RAM in GB';
COMMENT ON COLUMN gpus.cpu_name IS 'Most common CPU model name';
COMMENT ON COLUMN gpus.disk_space IS 'Average disk space in GB';
COMMENT ON COLUMN gpus.inet_down IS 'Average download speed in Mbps';
COMMENT ON COLUMN gpus.inet_up IS 'Average upload speed in Mbps';
COMMENT ON COLUMN gpus.dlperf IS 'Deep learning performance score';
COMMENT ON COLUMN gpus.cuda_version IS 'Maximum supported CUDA version';
COMMENT ON COLUMN gpus.reliability_score IS 'Average provider reliability (0-100)';
COMMENT ON COLUMN gpus.provider_count IS 'Number of providers offering this GPU';
COMMENT ON COLUMN gpus.price_range_min IS 'Minimum price across providers';
COMMENT ON COLUMN gpus.price_range_max IS 'Maximum price across providers';
COMMENT ON COLUMN gpus.data_sources IS 'Array of data sources (vastai, lambdalabs, runpod)';

-- Create index for better filtering
CREATE INDEX IF NOT EXISTS idx_gpus_provider_count ON gpus(provider_count);
CREATE INDEX IF NOT EXISTS idx_gpus_dlperf ON gpus(dlperf DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_gpus_price_range ON gpus(price_range_min, price_range_max);

-- Update existing GPUs to have default values
UPDATE gpus
SET 
  provider_count = 0,
  data_sources = ARRAY[]::TEXT[]
WHERE provider_count IS NULL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Extended GPU specifications migration completed successfully!';
  RAISE NOTICE 'New columns added: cpu_cores, cpu_ram, cpu_name, disk_space, inet_down, inet_up, dlperf, cuda_version, reliability_score, provider_count, price_range_min, price_range_max, data_sources';
END $$;

