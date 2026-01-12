# Time-Series Optimization Guide for GPUalpha

## ⚠️ Important Note

**TimescaleDB is no longer available in Supabase** (deprecated due to licensing restrictions with PostgreSQL 17). This guide uses **standard PostgreSQL optimizations** that provide excellent performance for time-series data without requiring any extensions.

## Standard PostgreSQL Time-Series Optimizations

We use standard PostgreSQL features optimized for time-series data:

- **Optimized composite indexes** - Fast queries on GPU + time ranges
- **Materialized views** - Pre-computed daily/hourly aggregates
- **Partial indexes** - Indexes only on recent data for better performance
- **Helper functions** - Reusable functions for common queries
- **Query optimization** - Best practices for time-series queries

## Setup Steps

### Run the Optimization Migration

1. Go to: **SQL Editor → New Query**
2. Copy and paste the contents of `supabase_timeseries_optimized.sql` (in project root)
3. Click **Run**

**Note:** Completed migration SQL files have been archived to `docs/archive/sql/` for reference.

This will:
- Create optimized composite indexes for time-series queries
- Set up materialized views for daily/hourly aggregates
- Add helper functions for common queries (spot prices, averages, stats)
- Create partial indexes for recent data (faster queries)
- Set up automatic refresh functions

## Benefits

### Performance Improvements

**Before (Unoptimized):**
```sql
-- Slow: scans entire table, no optimal index
SELECT * FROM price_history 
WHERE gpu_id = 'xxx' 
AND recorded_at > NOW() - INTERVAL '30 days'
ORDER BY recorded_at DESC;
```

**After (Optimized Indexes):**
```sql
-- Fast: uses composite index (gpu_id, recorded_at)
SELECT * FROM price_history 
WHERE gpu_id = 'xxx' 
AND recorded_at > NOW() - INTERVAL '30 days'
ORDER BY recorded_at DESC;
```

### Pre-computed Aggregates

Instead of calculating daily averages on-the-fly:
```sql
-- Slow: calculates every time, scans all data
SELECT DATE(recorded_at), AVG(price)
FROM price_history
WHERE gpu_id = 'xxx'
GROUP BY DATE(recorded_at);
```

Use materialized view:
```sql
-- Fast: pre-computed, only scans aggregated data
SELECT * FROM price_history_daily
WHERE gpu_id = 'xxx'
ORDER BY day DESC;
```

### Partial Indexes for Recent Data

- Recent data (last 90 days) has dedicated index
- Faster queries on current/recent prices
- Smaller index size = faster index scans

## Usage Examples

### Get Latest Spot Price
```sql
SELECT * FROM get_latest_price('gpu-id-here');
```

### Get 7-Day Average (for Asian-style settlement)
```sql
SELECT get_price_average(
  'gpu-id-here',
  NOW() - INTERVAL '7 days',
  NOW()
);
```

### Get Price Statistics
```sql
SELECT * FROM get_price_stats(
  'gpu-id-here',
  NOW() - INTERVAL '30 days',
  NOW()
);
```

### Query Daily Aggregates
```sql
SELECT day, avg_price, min_price, max_price
FROM price_history_daily
WHERE gpu_id = 'gpu-id-here'
  AND day > NOW() - INTERVAL '90 days'
ORDER BY day DESC;
```

## API Integration

Your existing API code will work without changes! TimescaleDB is transparent - it's just optimized PostgreSQL.

However, you can optimize queries by using the helper functions:

```typescript
// In your API route
const { data } = await supabase.rpc('get_price_stats', {
  p_gpu_id: gpuId,
  p_start_time: startDate,
  p_end_time: endDate
})
```

## Monitoring

### Check Indexes
```sql
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'price_history';
```

### Check Materialized Views
```sql
SELECT schemaname, matviewname, hasindexes
FROM pg_matviews 
WHERE matviewname LIKE 'price_history%';
```

### Check Materialized View Size
```sql
SELECT 
  schemaname,
  matviewname,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) AS size
FROM pg_matviews 
WHERE matviewname LIKE 'price_history%';
```

## Maintenance

### Refresh Materialized Views

Materialized views need to be refreshed periodically. You can:

1. **Manual refresh** (from API or cron):
```sql
SELECT refresh_price_aggregates();
```

2. **Set up external cron job** (recommended):
   - Use Vercel Cron, GitHub Actions, or similar
   - Call your API endpoint that refreshes views
   - Or use Supabase Edge Functions with scheduled triggers

3. **Refresh on-demand** when needed:
   - Refresh daily aggregates once per day
   - Refresh hourly aggregates every hour (for recent data)

## Troubleshooting

### Migration Fails
- Ensure `price_history` table exists first
- Check that you have proper permissions
- Verify you're using the correct schema (public)

### Queries Still Slow
- Check if indexes are being used: `EXPLAIN ANALYZE <query>`
- Verify materialized views are refreshed: `SELECT * FROM price_history_daily LIMIT 1;`
- Ensure you're using time ranges in WHERE clauses
- Consider refreshing materialized views more frequently

### Materialized Views Not Updating
- Materialized views don't auto-refresh (unlike TimescaleDB continuous aggregates)
- You need to manually refresh them: `SELECT refresh_price_aggregates();`
- Set up a cron job or scheduled function to refresh periodically

### Index Not Being Used
- Use `EXPLAIN ANALYZE` to see query plan
- Ensure WHERE clause includes both `gpu_id` and `recorded_at` for best performance
- Check that time ranges are specific (not too broad)

