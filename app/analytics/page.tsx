'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts'

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

interface GPU {
  id: string
  model: string
  brand: string
  current_price: number
  msrp: number
  availability: string
}

interface MarketAnalytics {
  totalGPUs: number
  totalValue: number
  inStock: number
  averagePrice: number
  averageDiscount: number
  nvidiaCount: number
  amdCount: number
  priceDistribution: Array<{ range: string; count: number }>
}

export default function AnalyticsPage() {
  const [indexData, setIndexData] = useState<IndexData | null>(null)
  const [gpus, setGpus] = useState<GPU[]>([])
  const [analytics, setAnalytics] = useState<MarketAnalytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    // Refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      // Fetch index data
      const indexResponse = await fetch('/api/index')
      if (indexResponse.ok) {
        const index = await indexResponse.json()
        setIndexData(index)
      }

      // Fetch GPU data
      const gpuResponse = await fetch('/api/prices')
      if (gpuResponse.ok) {
        const gpuData = await gpuResponse.json()
        setGpus(gpuData)
        calculateAnalytics(gpuData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAnalytics = (gpuList: GPU[]) => {
    const totalValue = gpuList.reduce((sum, gpu) => sum + gpu.current_price, 0)
    const averagePrice = totalValue / gpuList.length
    const inStock = gpuList.filter(g => g.availability === 'in_stock').length
    
    // Calculate average discount/premium vs MSRP
    const priceDiffs = gpuList.map(gpu => ((gpu.current_price - gpu.msrp) / gpu.msrp) * 100)
    const averageDiscount = priceDiffs.reduce((a, b) => a + b, 0) / priceDiffs.length

    // Count by brand
    const nvidiaCount = gpuList.filter(g => g.brand === 'NVIDIA').length
    const amdCount = gpuList.filter(g => g.brand === 'AMD').length

    // Price distribution
    const ranges = [
      { min: 0, max: 500, label: '$0-$500' },
      { min: 500, max: 1000, label: '$500-$1K' },
      { min: 1000, max: 1500, label: '$1K-$1.5K' },
      { min: 1500, max: 2000, label: '$1.5K-$2K' },
      { min: 2000, max: Infinity, label: '$2K+' }
    ]

    const priceDistribution = ranges.map(range => ({
      range: range.label,
      count: gpuList.filter(g => g.current_price >= range.min && g.current_price < range.max).length
    }))

    setAnalytics({
      totalGPUs: gpuList.length,
      totalValue,
      inStock,
      averagePrice,
      averageDiscount,
      nvidiaCount,
      amdCount,
      priceDistribution
    })
  }

  const getVolatilityColor = (vol: number) => {
    if (vol < 5) return 'text-green-400'
    if (vol < 10) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getVolatilityLabel = (vol: number) => {
    if (vol < 5) return 'Low'
    if (vol < 10) return 'Moderate'
    return 'High'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    )
  }

  // Prepare index comparison chart data
  const indexComparisonData = indexData ? [
    {
      name: 'GPU Compute',
      value: indexData.gpuComputeIndex,
      change: indexData.change24h
    },
    {
      name: 'High-End',
      value: indexData.highEndIndex,
      change: indexData.change24h
    },
    {
      name: 'Mid-Range',
      value: indexData.midRangeIndex,
      change: indexData.change24h
    },
    {
      name: 'NVIDIA',
      value: indexData.nvidiaIndex,
      change: indexData.change24h
    },
    {
      name: 'AMD',
      value: indexData.amdIndex,
      change: indexData.change24h
    }
  ] : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="text-3xl font-bold text-white">⚡ GPUAlpha</a>
            <div className="flex space-x-4">
              <a href="/overview" className="text-slate-300 hover:text-white px-3 py-2">Overview</a>
              <a href="/" className="text-slate-300 hover:text-white px-3 py-2">Index</a>
              <a href="/gpu-info" className="text-slate-300 hover:text-white px-3 py-2">GPU Info</a>
              <a href="/history" className="text-slate-300 hover:text-white px-3 py-2">History</a>
              <span className="text-white px-3 py-2 border-b-2 border-blue-500">Analytics</span>
              <a href="/leaderboard" className="text-slate-300 hover:text-white px-3 py-2">Leaderboard</a>
              <a href="/predictions" className="text-slate-300 hover:text-white px-3 py-2">Predictions</a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">📊 Market Analytics</h1>
          <p className="text-slate-300">Comprehensive market intelligence and price discovery metrics</p>
        </div>

        {/* Index Performance */}
        {indexData && (
          <section className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Index Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-slate-400 text-sm mb-2">GPU Compute Index</div>
                    <div className="text-3xl font-bold text-white mb-1">{indexData.gpuComputeIndex.toFixed(2)}</div>
                    <div className={`text-sm font-semibold ${indexData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {indexData.change24h >= 0 ? '+' : ''}{indexData.change24h.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 text-sm mb-2">7-Day Change</div>
                    <div className={`text-3xl font-bold ${indexData.change7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {indexData.change7d >= 0 ? '+' : ''}{indexData.change7d.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 text-sm mb-2">30-Day Change</div>
                    <div className={`text-3xl font-bold ${indexData.change30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {indexData.change30d >= 0 ? '+' : ''}{indexData.change30d.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 text-sm mb-2">Volatility</div>
                    <div className={`text-3xl font-bold ${getVolatilityColor(indexData.volatility)}`}>
                      {indexData.volatility.toFixed(2)}%
                    </div>
                    <div className="text-xs text-slate-500 mt-1">{getVolatilityLabel(indexData.volatility)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400 text-sm mb-2">Market Status</div>
                    <div className={`text-2xl font-bold ${
                      indexData.volatility < 5 ? 'text-green-400' : 
                      indexData.volatility < 10 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {indexData.volatility < 5 ? 'Stable' : indexData.volatility < 10 ? 'Volatile' : 'High Risk'}
                    </div>
                  </div>
                </div>

                {/* Index Comparison Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={indexComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        formatter={(value: any) => [value.toFixed(2), 'Index Value']}
                      />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Market Overview */}
        {analytics && (
          <section className="mb-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-slate-400 text-sm mb-2">Total GPUs Tracked</div>
                  <div className="text-3xl font-bold text-blue-400">{analytics.totalGPUs}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-slate-400 text-sm mb-2">Total Market Value</div>
                  <div className="text-3xl font-bold text-green-400">
                    ${(analytics.totalValue / 1000).toFixed(1)}K
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-slate-400 text-sm mb-2">Average Price</div>
                  <div className="text-3xl font-bold text-purple-400">
                    ${analytics.averagePrice.toFixed(0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-slate-400 text-sm mb-2">vs MSRP</div>
                  <div className={`text-3xl font-bold ${
                    analytics.averageDiscount < 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {analytics.averageDiscount >= 0 ? '+' : ''}{analytics.averageDiscount.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {analytics.averageDiscount < 0 ? 'Below MSRP' : 'Above MSRP'}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Market Distribution */}
        {analytics && (
          <section className="mb-8">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Brand Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Brand Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { name: 'NVIDIA', value: analytics.nvidiaCount, fill: '#76B900' },
                        { name: 'AMD', value: analytics.amdCount, fill: '#ED1C24' }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="value" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Price Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Price Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.priceDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="range" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="count" fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Market Insights */}
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {indexData && (
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">💡</div>
                      <div>
                        <div className="text-white font-semibold mb-1">Market Volatility</div>
                        <div className="text-slate-300 text-sm">
                          Current volatility is {indexData.volatility.toFixed(2)}%, indicating a{' '}
                          {getVolatilityLabel(indexData.volatility).toLowerCase()} market. 
                          {indexData.volatility < 5 && ' Prices are relatively stable, suitable for long-term planning.'}
                          {indexData.volatility >= 5 && indexData.volatility < 10 && ' Moderate price fluctuations suggest active market conditions.'}
                          {indexData.volatility >= 10 && ' High volatility indicates significant price uncertainty.'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {analytics && (
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">📊</div>
                      <div>
                        <div className="text-white font-semibold mb-1">Price Trends</div>
                        <div className="text-slate-300 text-sm">
                          Average GPU price is ${analytics.averagePrice.toFixed(0)}. 
                          {analytics.averageDiscount < 0 
                            ? ` GPUs are trading ${Math.abs(analytics.averageDiscount).toFixed(1)}% below MSRP on average, indicating a buyer's market.`
                            : ` GPUs are trading ${analytics.averageDiscount.toFixed(1)}% above MSRP on average, indicating strong demand.`
                          }
                          {' '}{analytics.inStock} of {analytics.totalGPUs} GPUs are currently in stock.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {indexData && indexData.change7d !== 0 && (
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">📈</div>
                      <div>
                        <div className="text-white font-semibold mb-1">7-Day Trend</div>
                        <div className="text-slate-300 text-sm">
                          The GPU Compute Index has {indexData.change7d >= 0 ? 'increased' : 'decreased'} by{' '}
                          {Math.abs(indexData.change7d).toFixed(2)}% over the past week.
                          {indexData.change7d >= 0 
                            ? ' This upward trend suggests increasing demand or supply constraints.'
                            : ' This downward trend may indicate improving supply or reduced demand.'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}

