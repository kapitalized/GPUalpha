'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface PredictionModalProps {
  gpu: {
    id: string
    model: string
    brand: string
    currentPrice: number
  } | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (prediction: {
    gpuId: string
    predictedPrice: number
    timeframe: string
    confidence: number
    reasoning: string
  }) => void
}

export function PredictionModal({ gpu, isOpen, onClose, onSubmit }: PredictionModalProps) {
  const [predictedPrice, setPredictedPrice] = useState('')
  const [timeframe, setTimeframe] = useState('7d')
  const [confidence, setConfidence] = useState(50)
  const [reasoning, setReasoning] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gpu) return

    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/predictions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'temp-user-id', // Will be replaced with real user ID after auth
          gpu_id: gpu.id,
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
      
      // Call the onSubmit callback
      onSubmit({
        gpuId: gpu.id,
        predictedPrice: parseFloat(predictedPrice),
        timeframe,
        confidence,
        reasoning
      })

      // Show success message with navigation option
      const viewPredictions = confirm(`🎯 Prediction saved successfully!\n\nGPU: ${gpu.brand} ${gpu.model}\nPredicted Price: $${predictedPrice}\nTimeframe: ${timeframe}\nConfidence: ${confidence}%\n\nWould you like to view all predictions?`)
      
      if (viewPredictions) {
        window.location.href = '/predictions'
      }

      // Reset form
      setPredictedPrice('')
      setReasoning('')
      setConfidence(50)
      onClose()
    } catch (error) {
      console.error('Error saving prediction:', error)
      alert(`❌ Failed to save prediction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !gpu) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Predict: {gpu.brand} {gpu.model}</span>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-white text-xl leading-none"
              disabled={isSubmitting}
            >
              ✕
            </button>
          </CardTitle>
          <p className="text-slate-400 text-sm">Current Price: ${gpu.currentPrice}</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
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
                      ${gpu.currentPrice} → ${parseFloat(predictedPrice).toFixed(2)}
                    </div>
                    <div className={`text-sm font-medium ${
                      parseFloat(predictedPrice) > gpu.currentPrice ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {parseFloat(predictedPrice) > gpu.currentPrice ? '+' : ''}
                      {((parseFloat(predictedPrice) - gpu.currentPrice) / gpu.currentPrice * 100).toFixed(1)}%
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
                onClick={onClose} 
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
  )
}