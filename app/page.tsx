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

export default function HomePage() {
  const [gpus, setGpus] = useState<GPU[]>([])
  const [indexData, setIndexData] = useState<IndexData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedGPU, setSelectedGPU] = useState<GPU | null>(null)
  const [showPredictionModal, setShowPredictionModal] = useState(false)
  
  // Prediction form state
  const [predictedPrice, setPredictedPrice] = useState('')
  const [timeframe, setTimeframe] = useState('7d')
  const [confidence, setConfidence] = useState(50)
  const [reasoning, setReasoning] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchGPUs()
    fetchIndexData()
    // Refresh index data every 5 minutes
    const interval = setInterval(fetchIndexData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchGPUs = async () => {
    try {
      const response = await fetch('/api/prices')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setGpus(data)
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
  
  const handlePredict = (gpu: GPU) => {
    // No auth required - allow anonymous predictions
    setSelectedGPU(gpu)
    setShowPredictionModal(true)
  }

  const handleModalClose = () => {
    setShowPredictionModal(false)
    setSelectedGPU(null)
    // Reset form
    setPredictedPrice('')
    setReasoning('')
    setConfidence(50)
  }

  const handlePredictionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGPU) return

    setIsSubmitting(true)
    
    try {
      // Use anonymous user ID for testing
      const anonymousUserId = '00000000-0000-0000-0000-000000000000'
      
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: anonymousUserId,
          gpu_id: selectedGPU.id,
          predicted_price: parseFloat(predictedPrice),
          timeframe,
          confidence,
          reasoning: reasoning || null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save prediction')
      }

      const result = await response.json()
      console.log('Prediction saved:', result)
      
      // Show success message with navigation option
      const viewPredictions = confirm(`🎯 Prediction saved successfully!\n\nGPU: ${selectedGPU.brand} ${selectedGPU.model}\nPredicted Price: $${predictedPrice}\nTimeframe: ${timeframe}\nConfidence: ${confidence}%\n\nWould you like to view all predictions?`)
      
      if (viewPredictions) {
        window.location.href = '/predictions'
      }

      handleModalClose()
    } catch (error) {
      console.error('Error saving prediction:', error)
      alert(`❌ Failed to save prediction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
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
        {/* Manual Price Update Component */}
        <ManualPriceUpdate />
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            GPU <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">Compute Price Index</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Real-time compute infrastructure pricing and market intelligence for AI infrastructure
          </p>
        </div>

        {/* Index Dashboard */}
        {indexData && (
          <section className="mb-12">
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Market Indices</h2>
              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                  <div className="text-slate-400 text-sm mb-2">GPU Compute Index</div>
                  <div className="text-3xl font-bold text-white mb-1">{indexData.gpuComputeIndex.toFixed(2)}</div>
                  <div className={`text-sm font-semibold ${indexData.change24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {indexData.change24h >= 0 ? '+' : ''}{indexData.change24h.toFixed(2)}% (24h)
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                  <div className="text-slate-400 text-sm mb-2">High-End Index</div>
                  <div className="text-2xl font-bold text-white mb-1">{indexData.highEndIndex.toFixed(2)}</div>
                  <div className="text-xs text-slate-500">Premium GPUs</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                  <div className="text-slate-400 text-sm mb-2">Mid-Range Index</div>
                  <div className="text-2xl font-bold text-white mb-1">{indexData.midRangeIndex.toFixed(2)}</div>
                  <div className="text-xs text-slate-500">Mainstream GPUs</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                  <div className="text-slate-400 text-sm mb-2">NVIDIA Index</div>
                  <div className="text-2xl font-bold text-white mb-1">{indexData.nvidiaIndex.toFixed(2)}</div>
                  <div className="text-xs text-slate-500">NVIDIA GPUs</div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                  <div className="text-slate-400 text-sm mb-2">AMD Index</div>
                  <div className="text-2xl font-bold text-white mb-1">{indexData.amdIndex.toFixed(2)}</div>
                  <div className="text-xs text-slate-500">AMD GPUs</div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                  <div className="text-slate-400 text-sm mb-2">7-Day Change</div>
                  <div className={`text-2xl font-bold ${indexData.change7d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {indexData.change7d >= 0 ? '+' : ''}{indexData.change7d.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                  <div className="text-slate-400 text-sm mb-2">30-Day Change</div>
                  <div className={`text-2xl font-bold ${indexData.change30d >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {indexData.change30d >= 0 ? '+' : ''}{indexData.change30d.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-4 text-center">
                  <div className="text-slate-400 text-sm mb-2">Volatility</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {indexData.volatility.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">📊 Current GPU Prices</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gpus.map((gpu) => (
              <div key={gpu.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-800/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-blue-400 text-sm">{gpu.brand}</div>
                    <div className="text-white text-xl font-semibold">{gpu.model}</div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${
                    gpu.availability === 'in_stock' 
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-red-900 text-red-300'
                  }`}>
                    {gpu.availability.replace('_', ' ')}
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Current Price:</span>
                    <span className="text-white font-bold">${gpu.current_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MSRP:</span>
                    <span className="text-slate-300">${gpu.msrp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">vs MSRP:</span>
                    <span className={`font-semibold ${
                      gpu.current_price > gpu.msrp ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {gpu.current_price > gpu.msrp ? '+' : ''}{(((gpu.current_price - gpu.msrp) / gpu.msrp) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handlePredict(gpu)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-colors"
                >
                  Make Prediction 🎯
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-blue-400">{gpus.length}</div>
            <div className="text-slate-400">GPUs Tracked</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-green-400">
              ${gpus.reduce((sum, gpu) => sum + gpu.current_price, 0).toLocaleString()}
            </div>
            <div className="text-slate-400">Total Market Value</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-purple-400">
              {gpus.filter(g => g.availability === 'in_stock').length}
            </div>
            <div className="text-slate-400">In Stock</div>
          </div>
        </section>

        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Predicting?</h3>
            <p className="text-slate-300 mb-6">Start making predictions and track GPU price trends</p>
            <a 
              href="/history"
              className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
            >
              📊 View Price History
            </a>
          </div>
        </section>
      </main>

      {/* Full Prediction Modal */}
      {showPredictionModal && selectedGPU && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Predict: {selectedGPU.brand} {selectedGPU.model}</span>
                <button 
                  onClick={handleModalClose} 
                  className="text-slate-400 hover:text-white text-xl leading-none"
                  disabled={isSubmitting}
                >
                  ✕
                </button>
              </CardTitle>
              <p className="text-slate-400 text-sm">Current Price: ${selectedGPU.current_price}</p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handlePredictionSubmit} className="space-y-6">
                {/* Price Prediction */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Predicted Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={predictedPrice}
                    onChange={(e) => setPredictedPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2499.99"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Timeframe */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Timeframe
                  </label>
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isSubmitting}
                  >
                    <option value="7d">7 days</option>
                    <option value="30d">30 days</option>
                    <option value="90d">90 days</option>
                  </select>
                </div>

                {/* Confidence */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confidence: {confidence}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={confidence}
                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>Low (10%)</span>
                    <span>High (100%)</span>
                  </div>
                </div>

                {/* Reasoning */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Reasoning (Optional)
                  </label>
                  <textarea
                    value={reasoning}
                    onChange={(e) => setReasoning(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Why do you think the price will change?"
                    maxLength={500}
                    disabled={isSubmitting}
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    {reasoning.length}/500 characters
                  </div>
                </div>

                {/* Price Change Preview */}
                {predictedPrice && (
                  <div className="bg-slate-800 rounded-md p-3">
                    <div className="text-sm text-slate-400 mb-2">Price Change Preview:</div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Current → Predicted:</span>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          ${selectedGPU.current_price} → ${parseFloat(predictedPrice).toFixed(2)}
                        </div>
                        <div className={`text-sm font-medium ${
                          parseFloat(predictedPrice) > selectedGPU.current_price ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {parseFloat(predictedPrice) > selectedGPU.current_price ? '+' : ''}
                          {((parseFloat(predictedPrice) - selectedGPU.current_price) / selectedGPU.current_price * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleModalClose} 
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isSubmitting || !predictedPrice}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Prediction 🎯'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}


      <footer className="bg-black/50 text-center py-8 mt-12">
        <p className="text-slate-400">&copy; 2025 GPUAlpha. Generate alpha in GPU markets.</p>
      </footer>
    </div>
  )
}