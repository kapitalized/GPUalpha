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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!gpu) return

    onSubmit({
      gpuId: gpu.id,
      predictedPrice: parseFloat(predictedPrice),
      timeframe,
      confidence,
      reasoning
    })

    // Reset form
    setPredictedPrice('')
    setReasoning('')
    setConfidence(50)
    onClose()
  }

  if (!isOpen || !gpu) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Predict: {gpu.brand} {gpu.model}</span>
            <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
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
                value={predictedPrice}
                onChange={(e) => setPredictedPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2499.99"
                required
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
                className="w-full"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>Low</span>
                <span>High</span>
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
              />
            </div>

            {/* Submit */}
            <div className="flex space-x-3">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                Submit Prediction 🎯
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
