-- Migration: Add SEO-friendly slugs to GPUs
-- Run this in Supabase SQL Editor
-- Date: December 26, 2025

-- Add slug column to gpus table
ALTER TABLE gpus
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Create index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_gpus_slug ON gpus(slug);

-- Add comment
COMMENT ON COLUMN gpus.slug IS 'SEO-friendly URL slug (e.g., nvidia-rtx-4090)';

-- Function to generate slug from brand and model
CREATE OR REPLACE FUNCTION generate_gpu_slug(brand TEXT, model TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        trim(brand || ' ' || model),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Generate slugs for existing GPUs
UPDATE gpus
SET slug = generate_gpu_slug(brand, model)
WHERE slug IS NULL;

-- Ensure slugs are unique by adding numbers if needed
DO $$
DECLARE
  gpu_record RECORD;
  base_slug TEXT;
  new_slug TEXT;
  counter INTEGER;
BEGIN
  FOR gpu_record IN 
    SELECT id, brand, model, slug
    FROM gpus
    WHERE slug IN (
      SELECT slug 
      FROM gpus 
      WHERE slug IS NOT NULL 
      GROUP BY slug 
      HAVING COUNT(*) > 1
    )
    ORDER BY created_at
  LOOP
    base_slug := generate_gpu_slug(gpu_record.brand, gpu_record.model);
    counter := 2;
    new_slug := base_slug || '-' || counter;
    
    -- Find unique slug
    WHILE EXISTS (SELECT 1 FROM gpus WHERE slug = new_slug AND id != gpu_record.id) LOOP
      counter := counter + 1;
      new_slug := base_slug || '-' || counter;
    END LOOP;
    
    -- Update with unique slug
    UPDATE gpus SET slug = new_slug WHERE id = gpu_record.id;
  END LOOP;
END $$;

-- Add constraint to ensure slug is always set for new records
ALTER TABLE gpus
ALTER COLUMN slug SET NOT NULL;

-- Create trigger to auto-generate slug on insert/update
CREATE OR REPLACE FUNCTION set_gpu_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_gpu_slug(NEW.brand, NEW.model);
    
    -- Ensure uniqueness
    IF EXISTS (SELECT 1 FROM gpus WHERE slug = NEW.slug AND id != NEW.id) THEN
      NEW.slug := NEW.slug || '-' || extract(epoch from now())::bigint;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_gpu_slug
  BEFORE INSERT OR UPDATE ON gpus
  FOR EACH ROW
  EXECUTE FUNCTION set_gpu_slug();

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Slug migration completed successfully!';
  RAISE NOTICE 'Example URLs will be: /gpu/nvidia-rtx-4090, /gpu/amd-radeon-rx-7900-xtx';
END $$;




