'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../lib/contexts/AuthContext'
import { ManualPriceUpdate } from '../components/ManualPriceUpdate'
import { AuthModal } from '../components/AuthModal'
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

export default function HomePage() {
  const [gpus, setGpus] = useState<GPU[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGPU, setSelectedGPU] = useState<GPU | null>(null)
  const [showPredictionModal, setShowPredictionModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  
  // Prediction form state
  const [predictedPrice, setPredictedPrice] = useState('')
  const [timeframe, setTimeframe] = useState('7d')
  const [confidence, setConfidence] = useState(50)
  const [reasoning, setReasoning] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { user, loading: authLoading, signOut } = useAuth()

  useEffect(() => {
    fetchGPUs()
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
  
  const handlePredict = (gpu: GPU) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
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
    if (!selectedGPU || !user) return

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
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

  if (loading || authLoading) {
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
              <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded">BETA</span>
            </div>
            <div className="flex space-x-4">
              <button className="text-slate-300 hover:text-white px-3 py-2">Dashboard</button>
              <a href="/leaderboard" className="text-slate-300 hover:text-white px-3 py-2">Leaderboard</a>
              <a href="/predictions" className="text-slate-300 hover:text-white px-3 py-2">My Predictions</a>
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-slate-300">Welcome, {user.username || user.email}</span>
                  <button 
                    onClick={() => signOut()}
                    className="border border-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="border border-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Manual Price Update Component */}
        <ManualPriceUpdate />
        
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Generate Alpha in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">GPU Markets</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Make predictions on GPU prices and earn reputation points for accuracy
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">🔥 Trending GPUs</h2>
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

        <section className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-blue-400">2,847</div>
            <div className="text-slate-400">Predictions Made</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-green-400">73%</div>
            <div className="text-slate-400">Avg Accuracy</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-purple-400">156</div>
            <div className="text-slate-400">Active Predictors</div>
          </div>
          <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl text-center">
            <div className="text-3xl font-bold text-yellow-400">$2.1M</div>
            <div className="text-slate-400">Market Value Tracked</div>
          </div>
        </section>

        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Predicting?</h3>
            <p className="text-slate-300 mb-6">Join the alpha access program and start earning prediction points</p>
            <button 
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
            >
              🚀 Get Alpha Access
            </button>
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <footer className="bg-black/50 text-center py-8 mt-12">
        <p className="text-slate-400">&copy; 2025 GPUAlpha. Generate alpha in GPU markets.</p>
      </footer>
    </div>
  )
}