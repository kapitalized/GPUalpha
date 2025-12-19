/*
 * File: app/page.tsx
 * Function: Homepage with GPU prediction interface, enhanced navigation with dashboard links and user points
 */

'use client'

import { useState, useEffect } from 'react'
import { ManualPriceUpdate } from '../components/ManualPriceUpdate'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

interface GPU {
  id: string
  model: string
  brand: string
  current_price: number
  msrp: number
  availability: string
}

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

// Note: SEO metadata is defined in app/layout.tsx (root layout)
// This page uses the default metadata from root layout
export default function HomePage() {
  const [gpus, setGpus] = useState<GPU[]>([])
  const [indexData, setIndexData] = useState<IndexData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGpu, setSelectedGpu] = useState<GPU | null>(null)
  const [predictedPrice, setPredictedPrice] = useState('')
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d')
  const [confidence, setConfidence] = useState('50')
  const [reasoning, setReasoning] = useState('')
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  useEffect(() => {
    fetchGPUs()
    fetchIndexData()
    const interval = setInterval(() => {
      fetchGPUs()
      fetchIndexData()
    }, 5 * 60 * 1000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [])

  const fetchGPUs = async () => {
    try {
      const response = await fetch('/api/prices')
      if (response.ok) {
        const data = await response.json()
        setGpus(data)
      }
    } catch (error) {
      console.error('Error fetching GPUs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchIndexData = async () => {
    try {
      const response = await fetch('/api/index')
      if (response.ok) {
        const data = await response.json()
        setIndexData(data)
      }
    } catch (error) {
      console.error('Error fetching index data:', error)
    }
  }

  const handlePredict = async () => {
    if (!selectedGpu || !predictedPrice) {
      alert('Please select a GPU and enter a predicted price')
      return
    }

    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gpu_id: selectedGpu.id,
          predicted_price: parseFloat(predictedPrice),
          timeframe,
          confidence: parseInt(confidence),
          reasoning: reasoning || undefined
        })
      })

      if (response.ok) {
        alert('Prediction submitted successfully!')
        setSelectedGpu(null)
        setPredictedPrice('')
        setReasoning('')
        setConfidence('50')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to submit prediction'}`)
      }
    } catch (error) {
      console.error('Error submitting prediction:', error)
      alert('Failed to submit prediction')
    }
  }

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
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-white">⚡ GPUAlpha</span>
              <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded">INDEX</span>
            </div>
            <div className="flex space-x-4">
              <a href="/overview" className="text-slate-300 hover:text-white px-3 py-2">Overview</a>
              <button className="text-slate-300 hover:text-white px-3 py-2">Index</button>
              <a href="/info" className="text-slate-300 hover:text-white px-3 py-2">Info</a>
              <a href="/history" className="text-slate-300 hover:text-white px-3 py-2">History</a>
              <a href="/analytics" className="text-slate-300 hover:text-white px-3 py-2">Analytics</a>
              <a href="/leaderboard" className="text-slate-300 hover:text-white px-3 py-2">Leaderboard</a>
              <a href="/predictions" className="text-slate-300 hover:text-white px-3 py-2">Predictions</a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            GPU Compute Price Index
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Real-time market intelligence for GPU compute pricing
          </p>
          
          {indexData && (
            <div className="bg-slate-800/50 rounded-lg p-6 mb-8">
              <div className="text-4xl font-bold text-white mb-2">
                {indexData.gpuComputeIndex.toFixed(2)}
              </div>
              <div className="flex justify-center gap-6 text-sm">
                <span className={`${indexData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  24h: {indexData.change24h >= 0 ? '+' : ''}{indexData.change24h.toFixed(2)}%
                </span>
                <span className={`${indexData.change7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  7d: {indexData.change7d >= 0 ? '+' : ''}{indexData.change7d.toFixed(2)}%
                </span>
                <span className={`${indexData.change30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  30d: {indexData.change30d >= 0 ? '+' : ''}{indexData.change30d.toFixed(2)}%
                </span>
                <span className="text-slate-400">
                  Volatility: {indexData.volatility.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Index Overview */}
        {indexData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-300 text-sm">GPU Compute Index</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{indexData.gpuComputeIndex.toFixed(2)}</div>
                <div className={`text-sm mt-1 ${indexData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {indexData.change24h >= 0 ? '+' : ''}{indexData.change24h.toFixed(2)}% (24h)
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-300 text-sm">High-End Index</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{indexData.highEndIndex.toFixed(2)}</div>
                <div className="text-sm mt-1 text-slate-400">Premium GPUs</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-300 text-sm">Mid-Range Index</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{indexData.midRangeIndex.toFixed(2)}</div>
                <div className="text-sm mt-1 text-slate-400">Value GPUs</div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-slate-300 text-sm">NVIDIA Index</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{indexData.nvidiaIndex.toFixed(2)}</div>
                <div className="text-sm mt-1 text-slate-400">NVIDIA GPUs</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* GPU Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {gpus.map((gpu) => (
            <Card key={gpu.id} className="bg-slate-800/50 border-slate-700 hover:border-blue-500 transition-colors">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span className="text-white text-xl">
                    {gpu.brand} {gpu.model}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    gpu.availability === 'in_stock' ? 'bg-green-500/20 text-green-400' :
                    gpu.availability === 'limited' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {gpu.availability.replace('_', ' ').toUpperCase()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Price</span>
                    <span className="text-white font-bold">${gpu.current_price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MSRP</span>
                    <span className="text-slate-300">${gpu.msrp.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Discount/Premium</span>
                    <span className={`font-semibold ${
                      gpu.current_price < gpu.msrp ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {gpu.current_price < gpu.msrp ? '-' : '+'}
                      ${Math.abs(gpu.current_price - gpu.msrp).toFixed(2)}
                      ({((gpu.current_price - gpu.msrp) / gpu.msrp * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <Button
                    onClick={() => setSelectedGpu(gpu)}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    Make Prediction
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Prediction Modal */}
        {selectedGpu && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="bg-slate-800 border-slate-700 w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-white">
                  Predict Price: {selectedGpu.brand} {selectedGpu.model}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-slate-300 block mb-2">Predicted Price ($)</label>
                  <input
                    type="number"
                    value={predictedPrice}
                    onChange={(e) => setPredictedPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded"
                    placeholder={selectedGpu.current_price.toString()}
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-2">Timeframe</label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value as '7d' | '30d' | '90d')}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded"
                  >
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                    <option value="90d">90 Days</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 block mb-2">Confidence (0-100%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={confidence}
                    onChange={(e) => setConfidence(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-2">Reasoning (Optional)</label>
                  <textarea
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded"
                    rows={3}
                    placeholder="Explain your prediction..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePredict}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Submit Prediction
                  </Button>
                  <Button
                    onClick={() => setSelectedGpu(null)}
                    className="flex-1 bg-slate-600 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* CTA Section */}
        <div className="text-center mt-12">
          <h2 className="text-3xl font-bold text-white mb-4">Explore Market Insights</h2>
          <p className="text-slate-300 mb-6">
            Dive deeper into GPU market analytics, historical trends, and detailed specifications
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/analytics">
              <Button className="bg-blue-600 hover:bg-blue-700">
                View Analytics
              </Button>
            </a>
            <a href="/history">
              <Button className="bg-slate-700 hover:bg-slate-600">
                Price History
              </Button>
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
