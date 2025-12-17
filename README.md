# GPUalpha
**GPU Compute Price Index & Market Intelligence Platform**

Real-time tracking and analytics for compute infrastructure pricing. The transparent benchmark for GPU/compute markets, enabling price discovery and risk management for AI infrastructure.

## Overview

GPUalpha provides comprehensive data, indexing, and intelligence for compute infrastructure markets:

### Core Capabilities

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
