'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

interface IndexData {
  timestamp: string
  gpuComputeIndex: number
  highEndIndex: number
  midRangeIndex: number
  nvidiaIndex: number
  amdIndex: number
  change24h: number
  change7d: number
  change30d: number
  volatility: number
}

export default function OverviewPage() {
  const [indexData, setIndexData] = useState<IndexData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchIndexData()
    const interval = setInterval(fetchIndexData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchIndexData = async () => {
    try {
      const response = await fetch('/api/index')
      if (response.ok) {
        const data = await response.json()
        setIndexData(data)
      }
    } catch (error) {
      console.error('Error fetching index data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="text-3xl font-bold text-white">⚡ GPUAlpha</a>
            <div className="flex space-x-4">
              <span className="text-white px-3 py-2 border-b-2 border-blue-500">Overview</span>
              <a href="/" className="text-slate-300 hover:text-white px-3 py-2">Index</a>
              <a href="/gpu-info" className="text-slate-300 hover:text-white px-3 py-2">GPU Info</a>
              <a href="/history" className="text-slate-300 hover:text-white px-3 py-2">History</a>
              <a href="/analytics" className="text-slate-300 hover:text-white px-3 py-2">Analytics</a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6">
            GPU Compute <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Price Index</span>
          </h1>
          <p className="text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Real-time data, indexing, and intelligence for compute infrastructure markets
          </p>
          {indexData && (
            <div className="inline-flex items-center space-x-4 bg-slate-900/50 border border-slate-700 rounded-xl px-8 py-4">
              <div>
                <div className="text-slate-400 text-sm">GPU Compute Index</div>
                <div className="text-3xl font-bold text-white">{indexData.gpuComputeIndex.toFixed(2)}</div>
              </div>
              <div className="h-12 w-px bg-slate-700"></div>
              <div>
                <div className="text-slate-400 text-sm">24h Change</div>
                <div className={`text-2xl font-bold ${indexData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {indexData.change24h >= 0 ? '+' : ''}{indexData.change24h.toFixed(2)}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Core Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Platform Capabilities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Data and Indexing */}
            <Card className="hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">📊</div>
                <CardTitle>Data & Indexing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Comprehensive data collection and indexing of compute infrastructure, including GPUs and other critical chips. 
                  Real-time price tracking with weighted indices for market transparency.
                </p>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>• GPU Compute Index</li>
                  <li>• High-End & Mid-Range Indices</li>
                  <li>• Brand-specific indices (NVIDIA, AMD)</li>
                  <li>• Weighted market calculations</li>
                </ul>
                <a href="/" className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-4 inline-block">
                  View Indices →
                </a>
              </CardContent>
            </Card>

            {/* GPU Information */}
            <Card className="hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">ℹ️</div>
                <CardTitle>GPU & Chip Information</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Detailed specifications, features, and use cases for GPUs and other critical compute chips. 
                  Comprehensive technical data for infrastructure planning.
                </p>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>• Technical specifications</li>
                  <li>• Architecture details</li>
                  <li>• Performance metrics</li>
                  <li>• Use case recommendations</li>
                </ul>
                <a href="/gpu-info" className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-4 inline-block">
                  Browse GPUs →
                </a>
              </CardContent>
            </Card>

            {/* Trends & History */}
            <Card className="hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">📈</div>
                <CardTitle>Trends & Spot Prices</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Historical price trends, spot price tracking, and market analysis. 
                  Interactive charts and analytics for price discovery and trend identification.
                </p>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>• Historical price charts</li>
                  <li>• Real-time spot prices</li>
                  <li>• Trend analysis</li>
                  <li>• Volatility metrics</li>
                </ul>
                <a href="/history" className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-4 inline-block">
                  View History →
                </a>
              </CardContent>
            </Card>

            {/* News & Information */}
            <Card className="hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">📰</div>
                <CardTitle>Market News & Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Information and news affecting compute pricing. Market intelligence and insights 
                  to understand factors driving price movements.
                </p>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>• Market insights</li>
                  <li>• Price impact analysis</li>
                  <li>• Volatility commentary</li>
                  <li>• Trend explanations</li>
                </ul>
                <a href="/analytics" className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-4 inline-block">
                  View Analytics →
                </a>
              </CardContent>
            </Card>

            {/* Computed Averages & Indexes */}
            <Card className="hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">🔢</div>
                <CardTitle>Computed Averages & Indexes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Sophisticated calculations for market averages, weighted indices, and settlement values. 
                  Asian-style settlement calculations for futures contracts.
                </p>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>• 7-day, 30-day, 90-day averages</li>
                  <li>• Weighted market indices</li>
                  <li>• Settlement calculations</li>
                  <li>• Benchmark values</li>
                </ul>
                <a href="/analytics" className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-4 inline-block">
                  View Calculations →
                </a>
              </CardContent>
            </Card>

            {/* Availability Tracking */}
            <Card className="hover:border-blue-500 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-4">📦</div>
                <CardTitle>Chip & Rental Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Real-time tracking of chip availability and rental market conditions. 
                  Monitor stock levels and market supply dynamics.
                </p>
                <ul className="text-sm text-slate-400 space-y-2">
                  <li>• Stock status tracking</li>
                  <li>• Availability indicators</li>
                  <li>• Market supply metrics</li>
                  <li>• Rental market data</li>
                </ul>
                <a href="/" className="text-blue-400 hover:text-blue-300 text-sm font-medium mt-4 inline-block">
                  View Availability →
                </a>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Use Cases */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Who Uses GPUAlpha?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🏦</div>
                <h3 className="text-xl font-bold text-white mb-2">Financial Institutions</h3>
                <p className="text-slate-400 text-sm">
                  Price discovery and risk management for compute derivatives and futures contracts
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">☁️</div>
                <h3 className="text-xl font-bold text-white mb-2">Cloud Providers</h3>
                <p className="text-slate-400 text-sm">
                  Infrastructure planning and cost optimization for GPU inventory management
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">🏢</div>
                <h3 className="text-xl font-bold text-white mb-2">AI Companies</h3>
                <p className="text-slate-400 text-sm">
                  Hedging compute exposure and planning infrastructure investments
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-white mb-2">Market Makers</h3>
                <p className="text-slate-400 text-sm">
                  Providing liquidity and pricing for compute futures and derivatives
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Technology Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Frontend</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center space-x-2">
                      <span className="text-blue-400">•</span>
                      <span><strong>Next.js 14</strong> - React framework with App Router</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-blue-400">•</span>
                      <span><strong>TypeScript</strong> - Type-safe development</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-blue-400">•</span>
                      <span><strong>Tailwind CSS</strong> - Utility-first styling</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-blue-400">•</span>
                      <span><strong>Recharts</strong> - Data visualization and charts</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-blue-400">•</span>
                      <span><strong>React Hooks</strong> - State management</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Backend & Infrastructure</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-center space-x-2">
                      <span className="text-purple-400">•</span>
                      <span><strong>Next.js API Routes</strong> - Serverless API endpoints</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-purple-400">•</span>
                      <span><strong>Supabase</strong> - PostgreSQL database & authentication</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-purple-400">•</span>
                      <span><strong>Row Level Security (RLS)</strong> - Database security policies</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-purple-400">•</span>
                      <span><strong>PostgreSQL</strong> - Relational database</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-purple-400">•</span>
                      <span><strong>RESTful API</strong> - Standard HTTP endpoints</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-4">Key Features</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-300">
                  <div>
                    <strong className="text-white">Real-time Updates</strong>
                    <p className="text-slate-400">Auto-refreshing data every 5 minutes</p>
                  </div>
                  <div>
                    <strong className="text-white">Index Calculations</strong>
                    <p className="text-slate-400">Weighted market indices and averages</p>
                  </div>
                  <div>
                    <strong className="text-white">Data Visualization</strong>
                    <p className="text-slate-400">Interactive charts and analytics</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Explore?</h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Start tracking compute prices, analyzing trends, and accessing market intelligence
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="/"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
              >
                View Price Index
              </a>
              <a
                href="/analytics"
                className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors border border-slate-700"
              >
                Explore Analytics
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

