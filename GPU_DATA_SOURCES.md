# 💰 Low-Cost GPU Data Sources

## Overview
This document lists affordable data sources for GPU pricing, specifications, and availability information.

---

## 🌟 Recommended Low-Cost Data Sources

### 1. **RunPod API** (Free Tier + Pay-as-you-go)
- **Cost**: Free tier available, $0.01/1000 requests
- **Data**: Real-time GPU pricing, availability, specs
- **Coverage**: Cloud GPU rentals (A100, H100, RTX 4090, etc.)
- **Rate Limit**: 1000 req/day (free), 100,000/day (paid)
- **Documentation**: https://docs.runpod.io/
- **Use Case**: Real-time cloud GPU pricing

### 2. **Vast.ai API** (Free)
- **Cost**: FREE (no API key required for public data)
- **Data**: GPU rental prices, availability, performance benchmarks
- **Coverage**: Distributed GPU marketplace
- **Rate Limit**: Reasonable usage (no official limit)
- **Documentation**: https://vast.ai/docs/api
- **Use Case**: Competitive pricing data, spot instances

### 3. **Lambda Labs API** (Free)
- **Cost**: FREE for price queries
- **Data**: GPU instance pricing, availability
- **Coverage**: A100, H100, RTX series
- **Rate Limit**: Not specified (reasonable usage)
- **Documentation**: https://docs.lambdalabs.com/
- **Use Case**: Enterprise GPU pricing

### 4. **TechPowerUp GPU Database** (Free - Web Scraping)
- **Cost**: FREE (requires web scraping)
- **Data**: GPU specifications, MSRP, release dates
- **Coverage**: 2000+ GPU models
- **Rate Limit**: Respect robots.txt
- **Documentation**: https://www.techpowerup.com/gpu-specs/
- **Use Case**: Historical pricing, specifications

### 5. **PCPartPicker API** (Unofficial - Web Scraping)
- **Cost**: FREE (web scraping or unofficial API)
- **Data**: Retail GPU prices from multiple vendors
- **Coverage**: Consumer GPUs (RTX, AMD, etc.)
- **Rate Limit**: Respect robots.txt (~1 req/sec)
- **Documentation**: Community-driven
- **Use Case**: Retail pricing trends

### 6. **Newegg API** (Developer Program)
- **Cost**: FREE for approved developers
- **Data**: Product prices, availability, specifications
- **Coverage**: Consumer GPUs
- **Rate Limit**: Varies by approval level
- **Documentation**: https://developer.newegg.com/
- **Use Case**: Real-time retail pricing

### 7. **eBay Finding API** (Free Tier)
- **Cost**: Free tier: 5,000 calls/day
- **Data**: Used GPU prices, market trends
- **Coverage**: Secondary market
- **Rate Limit**: 5,000 calls/day (free)
- **Documentation**: https://developer.ebay.com/
- **Use Case**: Used GPU market analysis

### 8. **Amazon Product Advertising API** (Free with Associates account)
- **Cost**: FREE (requires Amazon Associates account)
- **Data**: GPU prices, reviews, availability
- **Coverage**: Amazon marketplace
- **Rate Limit**: 8,640 requests/day (free)
- **Documentation**: https://webservices.amazon.com/paapi5/
- **Use Case**: Major retailer pricing

---

## 📊 Data Source Comparison

| Source | Cost | Rate Limit | Real-time | Best For |
|--------|------|------------|-----------|----------|
| RunPod | Free/Paid | 1K-100K/day | ✅ Yes | Cloud GPU rentals |
| Vast.ai | FREE | Unlimited* | ✅ Yes | Spot pricing |
| Lambda Labs | FREE | Reasonable | ✅ Yes | Enterprise pricing |
| TechPowerUp | FREE | N/A | ❌ No | Specifications |
| PCPartPicker | FREE | ~86K/day | ⚠️ Delayed | Retail trends |
| Newegg | FREE | Varies | ✅ Yes | Retail pricing |
| eBay | FREE | 5K/day | ✅ Yes | Used market |
| Amazon | FREE | 8.6K/day | ✅ Yes | Retail pricing |

*Reasonable usage expected

---

## 🔑 API Keys Configuration

### Active API Keys

| Service | API Key | Status | Environment Variable | Last Updated |
|---------|---------|--------|---------------------|--------------|
| **Vast.ai** | `N/A (Public)` | ✅ **IMPLEMENTED** | N/A | Dec 20, 2025 |
| **Lambda Labs** | `[NOT SET]` | ✅ **IMPLEMENTED** | `LAMBDA_API_KEY` | Dec 20, 2025 |
| **RunPod** | `[NOT SET]` | ✅ **IMPLEMENTED** | `RUNPOD_API_KEY` | Dec 20, 2025 |
| Newegg | `[NOT SET]` | ⚠️ Pending | `NEWEGG_API_KEY` | N/A |
| eBay | `[NOT SET]` | ⚠️ Pending | `EBAY_API_KEY` | N/A |
| Amazon PA API | `[NOT SET]` | ⚠️ Pending | `AMAZON_API_KEY` | N/A |
| TechPowerUp | `N/A (Scraping)` | ⚠️ Manual | N/A | N/A |
| PCPartPicker | `N/A (Scraping)` | ⚠️ Manual | N/A | N/A |

### Environment Variables Template

Add to `.env.local`:

```env
# GPU Data Sources
RUNPOD_API_KEY=your-runpod-key-here
LAMBDA_API_KEY=your-lambda-key-here
NEWEGG_API_KEY=your-newegg-key-here
EBAY_API_KEY=your-ebay-key-here
AMAZON_API_KEY=your-amazon-key-here
AMAZON_SECRET_KEY=your-amazon-secret-here
AMAZON_PARTNER_TAG=your-associate-tag-here

# Rate Limiting
API_RATE_LIMIT_PER_MINUTE=60
API_CACHE_TTL_SECONDS=300
```

---

## 🚀 Quick Start Guide

### ✅ Already Implemented (3 APIs)

**Your system is now using real-time GPU pricing from:**
1. ✅ **Vast.ai** - Working immediately (no key required)
2. ✅ **Lambda Labs** - Add API key to activate
3. ✅ **RunPod** - Add API key to activate

### Step 1: Get API Keys (Optional but Recommended)

1. **Lambda Labs**: 
   - Sign up: https://lambdalabs.com/
   - Dashboard → API Keys → Generate new key
   - Free for price queries

2. **RunPod**: 
   - Sign up: https://runpod.io/
   - Settings → API Keys → Create API Key
   - Free tier: 1000 requests/day

### Step 2: Add Keys to `.env.local`

Update `D:\Github\GPUalpha\.env.local`:

```env
# GPU Data Source APIs (Optional - Vast.ai works without keys)
LAMBDA_API_KEY=your-lambda-key-here
RUNPOD_API_KEY=your-runpod-key-here
```

### Step 3: Test the Integration

1. **Restart your dev server:**
```powershell
npm run dev
```

2. **Trigger price update:**
   - Go to http://localhost:2000/dashboard
   - Click "Update Prices" button
   - Check console for API responses

3. **Verify data:**
```powershell
curl http://localhost:2000/api/prices
```

### Step 4: View Results

Check the API response for real pricing data with source labels:
- `"source": "vastai"` - Vast.ai pricing
- `"source": "lambdalabs"` - Lambda Labs pricing  
- `"source": "runpod"` - RunPod pricing (highest priority)

---

## 💡 Implementation Priority

### Phase 1: Free & Easy (Week 1)
1. ✅ Vast.ai (no key required)
2. ✅ Lambda Labs (free, simple approval)
3. ✅ RunPod free tier

### Phase 2: Retail Data (Week 2)
4. Amazon Product API (requires Associates)
5. eBay Finding API (quick approval)
6. PCPartPicker scraping (with rate limiting)

### Phase 3: Advanced (Week 3+)
7. Newegg API (requires approval)
8. TechPowerUp scraping (for specs)
9. Custom aggregation logic

---

## 📝 Notes

- **Always respect rate limits** to avoid being blocked
- **Cache responses** to reduce API calls (5-15 min cache recommended)
- **Implement retry logic** with exponential backoff
- **Monitor usage** to stay within free tiers
- **Keep API keys secure** - never commit to Git

---

## 🔒 Security Checklist

- [ ] All API keys stored in `.env.local` (not committed)
- [ ] `.gitignore` configured for all sensitive files
- [ ] API keys never exposed in client-side code
- [ ] Rate limiting implemented
- [ ] Error handling for API failures
- [ ] API usage monitoring/alerting

---

## 📚 Additional Resources

- **GPU Benchmarking**: https://www.gpucheck.com/
- **Price History**: https://camelcamelcamel.com/ (Amazon)
- **Market Analysis**: https://www.tomshardware.com/news/gpu
- **Cloud GPU Comparison**: https://fullstackdeeplearning.com/cloud-gpus/

---

**Last Updated**: December 19, 2025
**Maintained by**: GPUalpha Team

