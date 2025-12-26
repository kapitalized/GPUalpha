# 📍 Where Vast.ai Data Shows on Frontend + Available Data Fields

## 🖥️ Frontend Display Locations

### 1. **Homepage (app/page.tsx)** - Main GPU List

**URL**: `http://localhost:2000/`

**What Shows:**
- GPU cards with current prices from Vast.ai
- Price updates via "Update Prices" button
- Each GPU card displays:
  ```
  ┌─────────────────────────────┐
  │ NVIDIA RTX 4090             │ ← Brand + Model
  │ In Stock                    │ ← Availability
  │                             │
  │ Current Price: $1,549.00    │ ← FROM VAST.AI!
  │ MSRP: $1,599.00            │
  │ vs MSRP: -3.1%             │
  │ [Make Prediction 🎯]       │
  └─────────────────────────────┘
  ```

**Data Flow:**
```typescript
Homepage → /api/prices → Supabase gpus table → current_price (from Vast.ai)
```

---

### 2. **History Page (app/history/page.tsx)** - Price Trends

**URL**: `http://localhost:2000/history`

**What Shows:**
- Historical price charts
- Price points with **source labels**:
  - 🟦 "vastai" = From Vast.ai API
  - 🟪 "lambdalabs" = From Lambda Labs
  - 🟨 "runpod" = From RunPod

**Example Display:**
```
📊 NVIDIA RTX 4090 - Price History

$1,600 ┤     ╭─╮
$1,550 ┤   ╭─╯ ╰╮        ← Points show source
$1,500 ┤ ╭─╯    ╰─╮
$1,450 ┼─────────────────
       Jan  Feb  Mar  Apr

Source: vastai (120 data points)
```

---

### 3. **Analytics Page (app/analytics/page.tsx)** - Market Analytics

**URL**: `http://localhost:2000/analytics`

**What Shows:**
- Market-wide statistics
- Price distribution
- Average prices across all GPUs
- Uses aggregated Vast.ai data for calculations

---

### 4. **Info Page (app/info/page.tsx)** - GPU Details

**URL**: `http://localhost:2000/info`

**What Shows:**
- Detailed GPU specifications
- Current market price (from Vast.ai)
- Price comparisons

---

### 5. **Price Update Response** - API Output

When you click "Update Prices" button, you see:

```json
{
  "success": true,
  "message": "Prices updated from 3 API sources",
  "sources": ["vastai", "lambdalabs", "runpod"],
  "stats": {
    "totalGPUs": 50,
    "updated": 45,
    "vastAiModels": 120,        ← Models found
    "lambdaModels": 15,
    "runPodModels": 25,
    "totalUniqueModels": 135
  },
  "updates": [
    {
      "gpu": "NVIDIA RTX 4090",
      "oldPrice": 1599.99,
      "newPrice": 1549.00,
      "change": "-3.19%",
      "source": "vastai",        ← Source tag!
      "dataPoints": 12           ← # of offers
    }
  ]
}
```

---

## 📊 Complete Vast.ai API Data Fields

### Current Implementation (What We Use)

```typescript
interface VastAiOffer {
  id: number                    // ✅ Used for tracking
  gpu_name: string             // ✅ Used (parsed to brand/model)
  num_gpus: number             // ✅ Available
  dph_total: number            // ✅ Used (converted to monthly)
  gpu_ram: number              // ✅ Available
  reliability2: number         // ✅ Used (for averaging)
  
  // Available but not yet used:
  cpu_cores_effective: number  // ⚠️ NOT DISPLAYED YET
  disk_space: number           // ⚠️ NOT DISPLAYED YET
  inet_down: number            // ⚠️ NOT DISPLAYED YET
  inet_up: number              // ⚠️ NOT DISPLAYED YET
  dlperf: number               // ⚠️ NOT DISPLAYED YET
  cuda_max_good: number        // ⚠️ NOT DISPLAYED YET
  verification: string         // ⚠️ NOT DISPLAYED YET
  machine_id: number           // ⚠️ NOT DISPLAYED YET
}
```

---

## 🔍 Available Data Breakdown

### 1. **GPU Data (Currently Displayed)** ✅

| Field | Description | Where It Shows | Status |
|-------|-------------|----------------|--------|
| `gpu_name` | GPU model name | All pages (as card title) | ✅ Active |
| `dph_total` | $ per hour | Converted to monthly price | ✅ Active |
| `num_gpus` | # of GPUs in offer | Backend (for aggregation) | ✅ Active |
| `gpu_ram` | GPU memory (GB) | Backend available | ✅ Active |
| `reliability2` | Reliability score | Backend (for averaging) | ✅ Active |

### 2. **CPU Data (Available, Not Displayed)** ⚠️

| Field | Description | Current Status | Potential Use |
|-------|-------------|----------------|---------------|
| `cpu_cores_effective` | # of CPU cores | ⚠️ Not shown | Could show in GPU details |
| `cpu_name` | CPU model | ⚠️ Not fetched | Could add to specs |
| `cpu_ram` | System RAM (GB) | ⚠️ Not fetched | Could show total memory |

### 3. **Network Data (Available, Not Displayed)** ⚠️

| Field | Description | Current Status | Potential Use |
|-------|-------------|----------------|---------------|
| `inet_down` | Download speed (Mbps) | ⚠️ Not shown | Useful for training jobs |
| `inet_up` | Upload speed (Mbps) | ⚠️ Not shown | Useful for data transfer |

### 4. **Storage Data (Available, Not Displayed)** ⚠️

| Field | Description | Current Status | Potential Use |
|-------|-------------|----------------|---------------|
| `disk_space` | Storage (GB) | ⚠️ Not shown | Important for datasets |
| `disk_bw` | Disk bandwidth | ⚠️ Not fetched | Useful for I/O intensive |

### 5. **Performance Data (Available, Not Displayed)** ⚠️

| Field | Description | Current Status | Potential Use |
|-------|-------------|----------------|---------------|
| `dlperf` | Deep learning perf score | ⚠️ Not shown | Benchmark comparison |
| `cuda_max_good` | Max CUDA version | ⚠️ Not shown | Compatibility info |
| `gpu_frac` | GPU fraction available | ⚠️ Not fetched | Partial GPU rentals |

### 6. **Provider Data (Available, Not Displayed)** ⚠️

| Field | Description | Current Status | Potential Use |
|-------|-------------|----------------|---------------|
| `machine_id` | Host machine ID | ⚠️ Backend only | Track specific hosts |
| `verification` | Verification status | ⚠️ Not shown | Trust/reliability |
| `geolocation` | Server location | ⚠️ Not fetched | Latency optimization |
| `datacenter` | Datacenter info | ⚠️ Not fetched | Enterprise filtering |

### 7. **Spot Pricing Data (Available!)** 🎯

| Field | Description | Current Status | Implementation |
|-------|-------------|----------------|----------------|
| `dph_total` | Current spot price | ✅ Used | Main pricing source |
| `min_bid` | Minimum bid price | ⚠️ Not fetched | Could show "from $X" |
| `rentable` | Is rentable now | ⚠️ Not fetched | Real-time availability |

### 8. **Historical Data** ❌

| Data Type | Availability | Current Status |
|-----------|--------------|----------------|
| Price history | ❌ Not in API | We track in database |
| Availability trends | ❌ Not in API | We track in database |
| Price changes | ❌ Not in API | We calculate ourselves |

**Note**: Vast.ai API provides **real-time snapshots only**, not historical data. 
We create history by saving each update to `price_history` table.

---

## 🗄️ Database Storage

### What Gets Saved from Vast.ai:

```sql
-- price_history table
INSERT INTO price_history (
  gpu_id,           -- Links to gpus table
  price,            -- FROM: dph_total (converted to monthly)
  source,           -- SET TO: 'vastai'
  recorded_at       -- Timestamp of update
);

-- gpus table (updated)
UPDATE gpus SET
  current_price = <from Vast.ai>,
  updated_at = NOW();
```

### Building Historical Data:

Even though Vast.ai doesn't provide history, we're building it:

```
Time      | Price  | Source
----------|--------|--------
10:00 AM  | $1,549 | vastai   ← First update
11:00 AM  | $1,552 | vastai   ← Second update
12:00 PM  | $1,547 | vastai   ← Third update
          ↓
     Creates trend chart
```

---

## 🚀 How to See All Available Data

### Option 1: Check API Response Directly

```powershell
# Test Vast.ai API integration
cd D:\Github\GPUalpha
npm run dev

# In browser console (F12):
fetch('https://console.vast.ai/api/v0/bundles/')
  .then(r => r.json())
  .then(d => console.table(d[0]))
```

### Option 2: View in Price Update Response

Click "Update Prices" button and check browser console for:
```javascript
console.log('[Vast.ai] Full offer data:', offers)
```

### Option 3: Database Query

```sql
-- View all price history with sources
SELECT 
  g.brand,
  g.model,
  g.current_price,
  ph.price as historical_price,
  ph.source,
  ph.recorded_at
FROM gpus g
LEFT JOIN price_history ph ON g.id = ph.gpu_id
WHERE ph.source = 'vastai'
ORDER BY ph.recorded_at DESC
LIMIT 100;
```

---

## 📈 Future Enhancement Opportunities

### Data We Could Add to Frontend:

1. **CPU Information Tab**
   - Show CPU cores alongside GPU specs
   - Total system memory
   - Useful for full workload planning

2. **Network Performance**
   - Display download/upload speeds
   - Help users choose for data-heavy tasks

3. **Storage Details**
   - Show available disk space
   - Important for large datasets

4. **Performance Scores**
   - Display DLPerf benchmarks
   - CUDA compatibility info

5. **Provider Reliability**
   - Show verification status
   - Reliability scores from Vast.ai

6. **Geographic Filters**
   - Filter by datacenter location
   - Show latency estimates

7. **Spot Price Ranges**
   - Show min/max/average spot prices
   - "Starting from $X/month" display

---

## 🎯 Current vs. Potential Display

### What Users See NOW:

```
NVIDIA RTX 4090
Current Price: $1,549/month
Availability: In Stock
[Make Prediction]
```

### What We COULD Show:

```
NVIDIA RTX 4090
━━━━━━━━━━━━━━━━━━━━━━━━
💰 Price: $1,549/month (spot)
   Range: $1,450 - $1,650
   From: 12 providers

🖥️  System:
   • 16 vCPU cores
   • 128GB RAM
   • 2TB NVMe storage

🌐 Network:
   • 1000 Mbps down / 500 Mbps up

📊 Performance:
   • DLPerf: 95/100
   • CUDA: 12.0+

✅ Provider: Verified (98% reliability)
📍 Location: US-East

[Rent Now] [Compare Providers]
```

---

## 💡 Summary

**Where Data Shows:**
1. ✅ Homepage - GPU cards with prices
2. ✅ History - Price trends with source labels
3. ✅ Analytics - Market statistics
4. ✅ API Response - Detailed update info

**What's Used from Vast.ai:**
- ✅ GPU name/model
- ✅ Hourly pricing (→ monthly)
- ✅ Number of GPUs
- ✅ Reliability scores
- ✅ GPU memory

**What's Available but NOT Displayed:**
- ⚠️ CPU cores/specs
- ⚠️ Network speeds
- ⚠️ Storage capacity
- ⚠️ Performance benchmarks
- ⚠️ Provider details
- ⚠️ Location data

**Historical Data:**
- ❌ Not in Vast.ai API
- ✅ We're building it in our database!

---

**Want to enhance the display to show more Vast.ai data?** 

We could easily add CPU, network, storage, and provider info to the GPU cards! Just let me know what you'd like to see. 🚀


