'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface GPUListItem {
  id: string
  brand: string
  model: string
  slug: string
  current_price: number
  availability: string
}

interface GPU {
  id: string
  model: string
  brand: string
  current_price: number
  msrp: number
  availability: string
  benchmark_score?: number
  power_consumption?: number
  // Extended specs
  cpu_cores?: number
  cpu_ram?: number
  cpu_name?: string
  disk_space?: number
  inet_down?: number
  inet_up?: number
  dlperf?: number
  cuda_version?: number
  reliability_score?: number
  provider_count?: number
  price_range_min?: number
  price_range_max?: number
  data_sources?: string[]
  // Price history
  price_history?: Array<{
    price: number
    source: string
    recorded_at: string
  }>
  stats?: {
    min: number
    max: number
    avg: number
    current: number
    change24h: number
    change7d: number
    change30d: number
  }
}

export default function GPUDetailPage() {
  const params = useParams()
  const [gpu, setGpu] = useState<GPU | null>(null)
  const [allGPUs, setAllGPUs] = useState<{ [brand: string]: GPUListItem[] }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchGPUDetails(params.id as string)
      fetchAllGPUs()
    }
  }, [params.id])

  const fetchGPUDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/gpu/${id}`)
      if (!response.ok) throw new Error('Failed to fetch GPU details')
      const data = await response.json()
      setGpu(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load GPU')
    } finally {
      setLoading(false)
    }
  }

  const fetchAllGPUs = async () => {
    try {
      const response = await fetch('/api/gpus/all')
      if (!response.ok) return
      const data = await response.json()
      setAllGPUs(data.groupedByBrand || {})
    } catch (err) {
      console.error('Failed to fetch GPU list:', err)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-red-400'
    if (change < 0) return 'text-green-400'
    return 'text-slate-400'
  }

  const getSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      vastai: 'bg-blue-500/20 text-blue-300',
      lambdalabs: 'bg-purple-500/20 text-purple-300',
      runpod: 'bg-yellow-500/20 text-yellow-300'
    }
    return colors[source] || 'bg-slate-500/20 text-slate-300'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading GPU details...</div>
      </div>
    )
  }

  if (error || !gpu) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-4">Error</h2>
            <p className="text-slate-300 mb-6">{error || 'GPU not found'}</p>
            <a href="/">
              <Button>Back to Home</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Prepare chart data
  const chartData = gpu.price_history?.slice(-30).map(h => ({
    date: new Date(h.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    price: h.price,
    source: h.source
  })) || []

  const brandColors: Record<string, string> = {
    'NVIDIA': 'text-green-400',
    'AMD': 'text-red-400',
    'Intel': 'text-blue-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="text-3xl font-bold text-white">⚡ GPUAlpha</a>
            <div className="flex space-x-4">
              <a href="/" className="text-slate-300 hover:text-white px-3 py-2">Home</a>
              <a href="/overview" className="text-slate-300 hover:text-white px-3 py-2">Overview</a>
              <a href="/info" className="text-slate-300 hover:text-white px-3 py-2">All GPUs</a>
              <a href="/history" className="text-slate-300 hover:text-white px-3 py-2">History</a>
              <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden text-slate-300 hover:text-white px-3 py-2"
              >
                {showSidebar ? '✕' : '☰'} GPUs
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* GPU Navigation Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 left-0 h-screen w-64 bg-slate-900/95 border-r border-slate-800 
          overflow-y-auto z-40 transition-transform duration-300
          ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold text-lg">All GPUs</h3>
              <button 
                onClick={() => setShowSidebar(false)}
                className="lg:hidden text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {Object.entries(allGPUs).sort().map(([brand, gpus]) => (
                <div key={brand}>
                  <h4 className={`font-semibold text-sm mb-2 ${brandColors[brand] || 'text-slate-300'}`}>
                    {brand} ({gpus.length})
                  </h4>
                  <div className="space-y-1">
                    {gpus.map((g) => (
                      <a
                        key={g.id}
                        href={`/gpu/${g.slug}`}
                        className={`
                          block px-3 py-2 rounded text-sm transition-colors
                          ${gpu?.id === g.id 
                            ? 'bg-blue-600 text-white' 
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{g.model}</span>
                          <span className={`text-xs px-1 rounded ${
                            g.availability === 'in_stock' ? 'bg-green-500/20 text-green-400' :
                            g.availability === 'limited' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {g.availability === 'in_stock' ? '✓' : 
                             g.availability === 'limited' ? '!' : '✕'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          ${g.current_price.toFixed(0)}/mo
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 px-4 py-12 lg:px-8">
        {/* GPU Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                <span className="text-blue-400">{gpu.brand}</span> {gpu.model}
              </h1>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  gpu.availability === 'in_stock' 
                    ? 'bg-green-900/50 text-green-300' 
                    : gpu.availability === 'limited'
                    ? 'bg-yellow-900/50 text-yellow-300'
                    : 'bg-red-900/50 text-red-300'
                }`}>
                  {gpu.availability?.replace('_', ' ') || 'Unknown'}
                </span>
                {gpu.data_sources && gpu.data_sources.map(source => (
                  <span key={source} className={`px-2 py-1 rounded text-xs ${getSourceBadge(source)}`}>
                    {source}
                  </span>
                ))}
              </div>
            </div>
            <a href="/">
              <Button variant="outline">← Back to List</Button>
            </a>
          </div>
        </div>

        {/* Price Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="text-slate-400 text-sm mb-1">Current Price</div>
              <div className="text-3xl font-bold text-white">{formatPrice(gpu.current_price)}</div>
              <div className="text-slate-500 text-sm mt-1">per month</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-slate-400 text-sm mb-1">MSRP</div>
              <div className="text-2xl font-bold text-slate-300">{formatPrice(gpu.msrp)}</div>
              <div className={`text-sm mt-1 ${gpu.current_price < gpu.msrp ? 'text-green-400' : 'text-red-400'}`}>
                {gpu.current_price < gpu.msrp ? '↓' : '↑'} {Math.abs(((gpu.current_price - gpu.msrp) / gpu.msrp * 100)).toFixed(1)}% vs MSRP
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-slate-400 text-sm mb-1">Price Range</div>
              <div className="text-xl font-bold text-slate-300">
                {formatPrice(gpu.price_range_min || gpu.current_price)} - {formatPrice(gpu.price_range_max || gpu.current_price)}
              </div>
              <div className="text-slate-500 text-sm mt-1">{gpu.provider_count || 0} providers</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-slate-400 text-sm mb-1">7-Day Change</div>
              <div className={`text-2xl font-bold ${getChangeColor(gpu.stats?.change7d || 0)}`}>
                {gpu.stats?.change7d ? (gpu.stats.change7d > 0 ? '+' : '') + gpu.stats.change7d.toFixed(2) + '%' : 'N/A'}
              </div>
              <div className="text-slate-500 text-sm mt-1">
                {gpu.stats?.change30d ? `30d: ${(gpu.stats.change30d > 0 ? '+' : '') + gpu.stats.change30d.toFixed(1)}%` : ''}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Price History Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>📈 Price History (Last 30 Updates)</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#e2e8f0' }}
                    />
                    <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  No price history available yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* GPU Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>🎮 GPU Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {gpu.benchmark_score && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Benchmark Score</span>
                    <span className="text-white font-medium">{gpu.benchmark_score}</span>
                  </div>
                )}
                {gpu.power_consumption && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Power</span>
                    <span className="text-white font-medium">{gpu.power_consumption}W</span>
                  </div>
                )}
                {gpu.cuda_version && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">CUDA Version</span>
                    <span className="text-white font-medium">{gpu.cuda_version}</span>
                  </div>
                )}
                {gpu.dlperf && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">DL Performance</span>
                    <span className="text-white font-medium">{gpu.dlperf}/100</span>
                  </div>
                )}
                {gpu.reliability_score && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reliability</span>
                    <span className="text-green-400 font-medium">{gpu.reliability_score.toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Specifications */}
        {(gpu.cpu_cores || gpu.cpu_ram || gpu.disk_space || gpu.inet_down) && (
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* CPU & Memory */}
            <Card>
              <CardHeader>
                <CardTitle>💻 CPU & Memory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gpu.cpu_name && (
                    <div>
                      <div className="text-slate-400 text-sm">Processor</div>
                      <div className="text-white font-medium">{gpu.cpu_name}</div>
                    </div>
                  )}
                  {gpu.cpu_cores && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">CPU Cores</span>
                      <span className="text-white font-medium">{gpu.cpu_cores} vCPUs</span>
                    </div>
                  )}
                  {gpu.cpu_ram && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">System RAM</span>
                      <span className="text-white font-medium">{gpu.cpu_ram} GB</span>
                    </div>
                  )}
                  {gpu.disk_space && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Storage</span>
                      <span className="text-white font-medium">{gpu.disk_space} GB</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Network */}
            <Card>
              <CardHeader>
                <CardTitle>🌐 Network Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gpu.inet_down && (
                    <div>
                      <div className="text-slate-400 text-sm mb-1">Download Speed</div>
                      <div className="text-2xl font-bold text-blue-400">{gpu.inet_down} Mbps</div>
                    </div>
                  )}
                  {gpu.inet_up && (
                    <div>
                      <div className="text-slate-400 text-sm mb-1">Upload Speed</div>
                      <div className="text-2xl font-bold text-purple-400">{gpu.inet_up} Mbps</div>
                    </div>
                  )}
                  {!gpu.inet_down && !gpu.inet_up && (
                    <div className="text-slate-400 text-center py-4">Network data not available</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Price Updates */}
        {gpu.price_history && gpu.price_history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>🕒 Recent Price Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {gpu.price_history.slice(-10).reverse().map((update, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-xs ${getSourceBadge(update.source)}`}>
                        {update.source}
                      </span>
                      <span className="text-slate-400 text-sm">{formatDate(update.recorded_at)}</span>
                    </div>
                    <span className="text-white font-medium">{formatPrice(update.price)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <a href="/">
            <Button size="lg">Make Price Prediction</Button>
          </a>
          <a href="/history">
            <Button size="lg" variant="outline">View All History</Button>
          </a>
        </div>
        </main>
      </div>
    </div>
  )
}

