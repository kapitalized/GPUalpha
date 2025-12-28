# GPUalpha
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
**GPU Compute Price Index & Market Intelligence Platform**

Real-time tracking and analytics for compute infrastructure pricing. The transparent benchmark for GPU/compute markets, enabling price discovery and risk management for AI infrastructure.

<<<<<<< Updated upstream
## Overview
=======
## 🚀 Overview
>>>>>>> Stashed changes

GPUalpha provides comprehensive data, indexing, and intelligence for compute infrastructure markets:

### Core Capabilities

<<<<<<< Updated upstream
1. **Data and Indexing of Compute / GPUs**
   - Real-time price tracking and data collection
   - Weighted market indices (GPU Compute Index, High-End, Mid-Range, Brand-specific)
   - Comprehensive database of GPU specifications and market data

2. **Information on GPUs and Other Critical Chips**
   - Detailed technical specifications
   - Architecture information
   - Performance metrics and benchmarks
   - Use case recommendations

3. **Trends, History and Spot Prices**
   - Historical price charts with interactive visualization
   - Real-time spot price tracking
   - Trend analysis and pattern identification
   - Volatility metrics and market dynamics

4. **Information and News Affecting Compute Pricing**
   - Market insights and commentary
   - Price impact analysis
   - Volatility explanations
   - Automated market intelligence

5. **Computed Averages and Indexes**
   - 7-day, 30-day, 90-day price averages (Asian-style settlement ready)
   - Weighted market indices
   - Settlement calculations for futures contracts
   - Benchmark values for financial products

6. **Chip Availability, Rental Availability**
   - Real-time stock status tracking
   - Availability indicators (in_stock, limited, out_of_stock)
   - Market supply metrics
   - Rental market data integration

## Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router for server-side rendering and API routes
- **TypeScript** - Type-safe development for better code quality
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **Recharts** - Data visualization library for interactive charts and graphs
- **React Hooks** - Modern state management and side effects

### Backend & Infrastructure
- **Next.js API Routes** - Serverless API endpoints for data fetching and processing
- **Supabase** - PostgreSQL database with built-in authentication and real-time capabilities
- **Row Level Security (RLS)** - Database-level security policies for data access control
- **PostgreSQL** - Relational database for structured data storage
- **RESTful API** - Standard HTTP endpoints for data access

### Key Features
- Real-time data updates (auto-refresh every 5 minutes)
- Index calculations with weighted algorithms
- Interactive data visualization
- Secure authentication and authorization
- Scalable serverless architecture

## Use Cases

- **Financial Institutions** - Price discovery and risk management for compute derivatives
- **Cloud Providers** - Infrastructure planning and cost optimization
- **AI Companies** - Hedging compute exposure and investment planning
- **Market Makers** - Providing liquidity and pricing for compute futures
- **Data Centers** - Inventory management and procurement planning

## API Endpoints

- `/api/index` - Compute price indices and market metrics
- `/api/prices` - Current GPU prices and availability
- `/api/prices?id={gpuId}` - Price history for specific GPU
- `/api/analytics` - Market metrics, volatility, and trends
- `/api/predictions` - Market sentiment and predictions

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.local.example`)
4. Run database migrations (see `supabase_schema.sql`)
5. Start development server: `npm run dev`

## License

Private - All rights reserved
=======
1. **Real-Time Price Tracking**
   - Aggregates pricing data from multiple sources (Vast.ai, Lambda Labs, RunPod)
   - Automatic price updates via cron jobs
   - Historical price tracking and analytics

2. **GPU Compute Indices**
   - GPU Compute Index (overall market)
   - High-End Index (premium GPUs)
   - Mid-Range Index (value GPUs)
   - Brand-specific indices (NVIDIA, AMD)
   - Volatility metrics and trend analysis

3. **Price Predictions**
   - User-submitted price predictions
   - 1-year forward price predictor (based on historical volatility and trends)
   - Prediction accuracy tracking and leaderboards

4. **Market Analytics**
   - Price history visualization
   - Market trends and patterns
   - Volatility analysis
   - Price change tracking (24h, 7d, 30d)

5. **User Features**
   - User authentication and profiles
   - Prediction tracking and scoring
   - Leaderboard rankings
   - Personal dashboard with stats

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization
- **React Hot Toast** - User notifications

### Backend & Infrastructure
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database with authentication
- **Row Level Security (RLS)** - Database-level security
- **Sentry** - Error tracking and monitoring

### External Integrations
- **Vast.ai API** - GPU marketplace pricing
- **Lambda Labs API** - Cloud GPU pricing
- **RunPod API** - GPU rental pricing

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── index/         # GPU compute indices
│   │   ├── prices/        # Price data endpoints
│   │   ├── predictions/   # Prediction endpoints
│   │   └── leaderboard/   # Leaderboard data
│   ├── analytics/         # Analytics dashboard
│   ├── predictions/       # Predictions page
│   └── ...
├── components/            # React components
│   ├── ui/               # UI components
│   └── ...
├── lib/                   # Utility libraries
│   ├── api/              # External API integrations
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom React hooks
│   ├── middleware/       # API middleware (rate limiting, etc.)
│   ├── validation/       # Input validation schemas
│   └── utils/            # Utility functions
└── public/               # Static assets
```

## 🔑 Environment Variables

Required environment variables (see `.env.local` for local development):

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cron Secret (for price update endpoint)
CRON_SECRET=your-secure-random-secret

# Optional but Recommended
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
RUNPOD_API_KEY=your-runpod-api-key
NEXT_PUBLIC_GA_ID=your-ga-id
```

**⚠️ Important**: For production deployment on Vercel, add all environment variables in the Vercel dashboard. `.env.local` is only for local development.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd GPUalpha
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.local.example` to `.env.local` (if exists)
   - Add all required environment variables (see above)

4. **Set up database**
   - Run SQL migrations in Supabase SQL Editor
   - Enable Row Level Security (RLS) policies

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:3000` (or the port shown)

## 📡 API Endpoints

### Public Endpoints
- `GET /api/index` - GPU compute indices and market metrics
- `GET /api/prices` - Current GPU prices
- `GET /api/prices?id={gpuId}` - Price history for specific GPU
- `GET /api/prices/spot?gpu_id={id}` - Latest spot price
- `GET /api/leaderboard` - User leaderboard
- `GET /api/predictions` - User predictions

### Protected Endpoints
- `POST /api/prices/update` - Price update (requires CRON_SECRET)
- `POST /api/predictions` - Create prediction (requires auth)
- `GET /api/user/stats/[id]` - User statistics

## 🔒 Security Features

- ✅ Input validation with Zod schemas
- ✅ Rate limiting on API endpoints
- ✅ Request size limits
- ✅ Row Level Security (RLS) in database
- ✅ Environment variable validation
- ✅ Error tracking with Sentry
- ✅ Secure authentication via Supabase

## 📊 Features

### Price Tracking
- Real-time price aggregation from multiple sources
- Historical price data with time-series optimization
- Automatic price updates (configurable cron schedule)
- Price change tracking (24h, 7d, 30d)

### Indices
- Weighted GPU compute indices
- Category-specific indices (high-end, mid-range, brands)
- Volatility calculations
- Trend analysis

### Predictions
- User-submitted price predictions
- 1-year forward price predictor (based on historical data)
- Accuracy scoring and tracking
- Leaderboard rankings

### Analytics
- Interactive price charts
- Market trend visualization
- Volatility metrics
- Price distribution analysis

## 🧪 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📝 License

Private - All rights reserved

## 🤝 Contributing

This is a private project. For questions or issues, please contact the project maintainers.

---

**Built with ❤️ for the GPU compute market**
>>>>>>> Stashed changes
