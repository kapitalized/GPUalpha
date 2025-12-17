'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface GPU {
  id: string
  model: string
  brand: string
  current_price: number
  msrp: number
  availability: string
}

interface PriceHistory {
  price: number
  recorded_at: string
  source: string
}

interface GPUWithHistory extends GPU {
  price_history?: PriceHistory[]
}

export default function HistoryPage() {
  const [gpus, setGpus] = useState<GPU[]>([])
  const [selectedGPU, setSelectedGPU] = useState<GPU | null>(null)
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  useEffect(() => {
    fetchGPUs()
  }, [])

  useEffect(() => {
    if (selectedGPU) {
      fetchPriceHistory(selectedGPU.id)
    }
  }, [selectedGPU, timeRange])

  const fetchGPUs = async () => {
    try {
      const response = await fetch('/api/prices')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setGpus(data)
      if (data.length > 0) {
        setSelectedGPU(data[0])
      }
    } catch (error) {
      console.error('Error fetching GPUs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPriceHistory = async (gpuId: string) => {
    try {
      const response = await fetch(`/api/prices?id=${gpuId}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const data: GPUWithHistory = await response.json()
      
      if (data.price_history) {
        let filteredHistory = data.price_history

        // Filter by time range
        const now = new Date()
        const cutoffDate = new Date()
        if (timeRange === '7d') {
          cutoffDate.setDate(now.getDate() - 7)
        } else if (timeRange === '30d') {
          cutoffDate.setDate(now.getDate() - 30)
        } else if (timeRange === '90d') {
          cutoffDate.setDate(now.getDate() - 90)
        }

        if (timeRange !== 'all') {
          filteredHistory = data.price_history.filter(h => 
            new Date(h.recorded_at) >= cutoffDate
          )
        }

        // Sort by date
        filteredHistory.sort((a, b) => 
          new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
        )

        setPriceHistory(filteredHistory)
      } else {
        setPriceHistory([])
      }
    } catch (error) {
      console.error('Error fetching price history:', error)
      setPriceHistory([])
    }
  }

  const formatChartData = () => {
    return priceHistory.map(h => ({
      date: new Date(h.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      price: parseFloat(h.price.toFixed(2)),
      fullDate: h.recorded_at
    }))
  }

  const calculateStats = () => {
    if (priceHistory.length === 0) return null

    const prices = priceHistory.map(h => h.price)
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length
    const current = priceHistory[priceHistory.length - 1]?.price || 0
    const first = priceHistory[0]?.price || 0
    const change = current - first
    const changePercent = first > 0 ? (change / first) * 100 : 0

    // Calculate volatility (standard deviation)
    const variance = prices.reduce((acc, price) => acc + Math.pow(price - avg, 2), 0) / prices.length
    const volatility = Math.sqrt(variance) / avg * 100

    return {
      min,
      max,
      avg,
      current,
      change,
      changePercent,
      volatility
    }
  }

  const stats = calculateStats()
  const chartData = formatChartData()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
              <a href="/" className="text-3xl font-bold text-white">⚡ GPUAlpha</a>
            <div className="flex space-x-4">
              <a href="/overview" className="text-slate-300 hover:text-white px-3 py-2">Overview</a>
              <a href="/" className="text-slate-300 hover:text-white px-3 py-2">Index</a>
              <a href="/info" className="text-slate-300 hover:text-white px-3 py-2">Info</a>
              <span className="text-white px-3 py-2 border-b-2 border-blue-500">History</span>
              <a href="/analytics" className="text-slate-300 hover:text-white px-3 py-2">Analytics</a>
              <a href="/leaderboard" className="text-slate-300 hover:text-white px-3 py-2">Leaderboard</a>
              <a href="/predictions" className="text-slate-300 hover:text-white px-3 py-2">Predictions</a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">📈 Price History</h1>
          <p className="text-slate-300">Track historical GPU prices and market trends</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* GPU Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Select GPU</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {gpus.map((gpu) => (
                    <button
                      key={gpu.id}
                      onClick={() => setSelectedGPU(gpu)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedGPU?.id === gpu.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <div className="font-semibold">{gpu.brand} {gpu.model}</div>
                      <div className="text-sm opacity-80">${gpu.current_price}</div>
                    </button>
                  ))}
                </div>

                {/* Time Range Selector */}
                <div className="border-t border-slate-700 pt-4">
                  <div className="text-sm text-slate-400 mb-2">Time Range</div>
                  <div className="grid grid-cols-2 gap-2">
                    {(['7d', '30d', '90d', 'all'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                          timeRange === range
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {range === 'all' ? 'All Time' : range.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart and Stats */}
          <div className="lg:col-span-3">
            {selectedGPU && (
              <>
                {/* Stats Cards */}
                {stats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-slate-400 text-sm mb-1">Current Price</div>
                        <div className="text-2xl font-bold text-white">${stats.current.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-slate-400 text-sm mb-1">Period Change</div>
                        <div className={`text-2xl font-bold ${stats.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%
                        </div>
                        <div className="text-xs text-slate-500">
                          ${stats.change >= 0 ? '+' : ''}{stats.change.toFixed(2)}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-slate-400 text-sm mb-1">Average</div>
                        <div className="text-2xl font-bold text-white">${stats.avg.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-slate-400 text-sm mb-1">Volatility</div>
                        <div className="text-2xl font-bold text-yellow-400">{stats.volatility.toFixed(2)}%</div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Price Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedGPU.brand} {selectedGPU.model} - Price History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {chartData.length > 0 ? (
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#9CA3AF"
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                              stroke="#9CA3AF"
                              style={{ fontSize: '12px' }}
                              tickFormatter={(value) => `$${value}`}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1F2937', 
                                border: '1px solid #374151',
                                borderRadius: '8px'
                              }}
                              formatter={(value: any) => [`$${value}`, 'Price']}
                              labelStyle={{ color: '#9CA3AF' }}
                            />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="price" 
                              stroke="#3B82F6" 
                              strokeWidth={2}
                              dot={{ fill: '#3B82F6', r: 3 }}
                              activeDot={{ r: 6 }}
                              name="Price"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-96 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-6xl mb-4">📊</div>
                          <div className="text-slate-400 text-lg">No price history available</div>
                          <div className="text-slate-500 text-sm mt-2">
                            Price updates will appear here once data is collected
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Min/Max Info */}
                {stats && (
                  <div className="grid md:grid-cols-2 gap-4 mt-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-slate-400 text-sm mb-2">Price Range</div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-xs text-slate-500">Minimum</div>
                            <div className="text-lg font-semibold text-red-400">${stats.min.toFixed(2)}</div>
                          </div>
                          <div className="text-slate-600">→</div>
                          <div>
                            <div className="text-xs text-slate-500">Maximum</div>
                            <div className="text-lg font-semibold text-green-400">${stats.max.toFixed(2)}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-slate-400 text-sm mb-2">Data Points</div>
                        <div className="text-2xl font-bold text-white">{priceHistory.length}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {timeRange === 'all' ? 'All time' : `Last ${timeRange}`}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

