# Time-Series Data Storage for GPUalpha

## Overview

Since **TimescaleDB is not available in Supabase** (deprecated due to licensing), we use **standard PostgreSQL optimizations** for efficient time-series data storage and querying.

## Solution: Standard PostgreSQL Optimizations

### What We Use Instead of TimescaleDB

1. **Composite Indexes** - Optimized for GPU + time queries
2. **Materialized Views** - Pre-computed daily/hourly aggregates  
3. **Partial Indexes** - Indexes only on recent data
4. **Helper Functions** - Reusable functions for common queries
5. **Query Optimization** - Best practices for time-series patterns

## Setup Instructions

### Step 1: Run the Optimization SQL

1. Go to Supabase SQL Editor: https://app.supabase.com/project/cycpibwgmkvdpdooqbzu/sql/new
2. Open `supabase_timeseries_optimized.sql`
3. Copy and paste the entire file
4. Click **Run**

This will create:
- ✅ Optimized indexes for time-series queries
- ✅ Materialized views for daily/hourly aggregates
- ✅ Helper functions (get_latest_price, get_price_average, get_price_stats)
- ✅ Refresh function for materialized views

### Step 2: Set Up Automatic Refresh (Optional)

Materialized views need periodic refresh. Options:

**Option A: Vercel Cron (if deployed on Vercel)**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/prices/refresh-aggregates",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

**Option B: External Cron Service**
- Use GitHub Actions, cron-job.org, or similar
- Call: `POST /api/prices/refresh-aggregates` with Bearer token

**Option C: Manual Refresh**
- Call the refresh endpoint when needed
- Or run SQL: `SELECT refresh_price_aggregates();`

## Performance Benefits

### Index Optimizations

**Composite Index** (`gpu_id, recorded_at DESC`):
- Perfect for queries filtering by GPU and time range
- Includes price and source in index (covering index)
- Fast lookups without table scans

**Partial Index** (recent 90 days):
- Smaller index = faster scans
- Optimized for current/recent price queries
- Automatically excludes old data

### Materialized Views

**Daily Aggregates** (`price_history_daily`):
- Pre-computed: avg, min, max, open, close prices per day
- Much faster than calculating on-the-fly
- Refresh once per day

**Hourly Aggregates** (`price_history_hourly`):
- Pre-computed hourly averages for last 7 days
- Fast queries for recent price trends
- Refresh every hour

## Usage Examples

### Get Latest Spot Price
```typescript
// API: GET /api/prices/spot?gpu_id=xxx
const response = await fetch('/api/prices/spot?gpu_id=xxx')
const { spot_price, recorded_at } = await response.json()
```

### Get 7-Day Average (Asian-Style Settlement)
```typescript
// API: GET /api/prices/average?gpu_id=xxx&days=7
const response = await fetch('/api/prices/average?gpu_id=xxx&days=7')
const { average_price } = await response.json()
```

### Get Price Statistics
```typescript
// API: GET /api/prices/stats?gpu_id=xxx&days=30
const response = await fetch('/api/prices/stats?gpu_id=xxx&days=30')
const { avg_price, min_price, max_price, price_change_percent } = await response.json()
```

### Query Daily Aggregates (Fast)
```sql
-- Use materialized view for daily data
SELECT day, avg_price, min_price, max_price
FROM price_history_daily
WHERE gpu_id = 'xxx'
  AND day >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY day DESC;
```

## Storage Considerations

### Without Compression

- Standard PostgreSQL doesn't have automatic compression like TimescaleDB
- However, PostgreSQL's native compression is still efficient
- For very large datasets, consider:
  - Archiving old data (>2 years) to separate table
  - Using table partitioning (PostgreSQL native feature)
  - Regular VACUUM operations

### Recommended Retention

- **Keep all data** for accurate historical analysis
- **Archive data older than 2 years** if storage becomes an issue
- **Use materialized views** to reduce query load on raw data

## Monitoring & Maintenance

### Check Index Usage
```sql
EXPLAIN ANALYZE
SELECT * FROM price_history
WHERE gpu_id = 'xxx'
  AND recorded_at > NOW() - INTERVAL '30 days'
ORDER BY recorded_at DESC;
```

### Check Materialized View Status
```sql
SELECT 
  matviewname,
  pg_size_pretty(pg_total_relation_size('public.' || matviewname)) AS size
FROM pg_matviews 
WHERE matviewname LIKE 'price_history%';
```

### Refresh Aggregates
```sql
-- Manual refresh
SELECT refresh_price_aggregates();

-- Or via API
POST /api/prices/refresh-aggregates
Authorization: Bearer <CRON_SECRET>
```

## Comparison: TimescaleDB vs Standard PostgreSQL

| Feature | TimescaleDB | Standard PostgreSQL (Our Solution) |
|---------|-------------|-----------------------------------|
| Time partitioning | ✅ Automatic | ⚠️ Manual (not needed with good indexes) |
| Compression | ✅ Automatic | ❌ Not available |
| Continuous aggregates | ✅ Auto-refresh | ⚠️ Manual refresh (materialized views) |
| Query performance | ✅ Excellent | ✅ Excellent (with proper indexes) |
| Setup complexity | ✅ Simple | ✅ Simple |
| Availability | ❌ Not in Supabase | ✅ Always available |

## Conclusion

While TimescaleDB would be ideal, **standard PostgreSQL with proper optimizations works very well** for time-series data. The key is:

1. ✅ **Proper indexes** - Composite indexes on (gpu_id, recorded_at)
2. ✅ **Materialized views** - Pre-computed aggregates
3. ✅ **Helper functions** - Reusable query patterns
4. ✅ **Query optimization** - Always use time ranges in WHERE clauses

Your price history queries will be fast and efficient! 🚀

