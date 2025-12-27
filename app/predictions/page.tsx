'use client'

import { useState, useEffect } from 'react'

interface Prediction {
  id: string
  predicted_price: number
  timeframe: string
  confidence: number
  reasoning?: string
  created_at: string
  is_resolved: boolean
  accuracy_score?: number
  points_earned?: number
  gpus: {
    model: string
    brand: string
    current_price: number
    msrp: number
  }
}

interface GPU {
  id: string
  model: string
  brand: string
  current_price: number
  msrp: number
}

interface PriceHistory {
  price: number
  recorded_at: string
  source: string
}

interface PredictionResult {
  predictedPrice: number
  confidenceInterval: {
    lower: number
    upper: number
  }
  annualReturnRate: number
  volatility: number
  trend: 'upward' | 'downward' | 'stable'
  dataPoints: number
  assumptions: string[]
}

export default function MyPredictions() {
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)
  
  // Prediction tool state
  const [gpus, setGpus] = useState<GPU[]>([])
  const [selectedGpuId, setSelectedGpuId] = useState<string>('')
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [showTool, setShowTool] = useState(false)

  useEffect(() => {
    fetchPredictions()
    fetchGPUs()
  }, [])

  const fetchPredictions = async () => {
    try {
      // For now, get all predictions since we don't have user auth yet
      const response = await fetch('/api/predictions')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setPredictions(data)
    } catch (error) {
      console.error('Error fetching predictions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (prediction: Prediction) => {
    if (!prediction.is_resolved) return 'text-yellow-400'
    if (prediction.accuracy_score && prediction.accuracy_score >= 80) return 'text-green-400'
    if (prediction.accuracy_score && prediction.accuracy_score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getStatusText = (prediction: Prediction) => {
    if (!prediction.is_resolved) return 'Pending'
    if (prediction.accuracy_score && prediction.accuracy_score >= 80) return 'Great Prediction!'
    if (prediction.accuracy_score && prediction.accuracy_score >= 60) return 'Good Prediction'
    return 'Needs Improvement'
  }

  const fetchGPUs = async () => {
    try {
      const response = await fetch('/api/prices')
      if (!response.ok) throw new Error('Failed to fetch')
      const data = await response.json()
      setGpus(data)
      if (data.length > 0 && !selectedGpuId) {
        setSelectedGpuId(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching GPUs:', error)
    }
  }

  const calculate1YearPrediction = async () => {
    if (!selectedGpuId) return
    
    setCalculating(true)
    try {
      // Fetch price history for the selected GPU
      const response = await fetch(`/api/prices?id=${selectedGpuId}`)
      if (!response.ok) throw new Error('Failed to fetch price history')
      
      const gpuData: GPU & { price_history?: PriceHistory[] } = await response.json()
      
      if (!gpuData.price_history || gpuData.price_history.length < 10) {
        alert('Insufficient price history data. Need at least 10 data points for accurate prediction.')
        setCalculating(false)
        return
      }

      // Sort by date
      const sortedHistory = [...gpuData.price_history].sort((a, b) => 
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
      )

      // Calculate daily returns
      const returns: number[] = []
      for (let i = 1; i < sortedHistory.length; i++) {
        const prevPrice = Number(sortedHistory[i - 1].price)
        const currPrice = Number(sortedHistory[i].price)
        if (prevPrice > 0) {
          returns.push((currPrice - prevPrice) / prevPrice)
        }
      }

      // Calculate annualized volatility (standard deviation of returns * sqrt(365))
      const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length
      const dailyVolatility = Math.sqrt(variance)
      const annualVolatility = dailyVolatility * Math.sqrt(365) * 100 // Convert to percentage

      // Calculate trend (average return rate)
      const totalReturn = sortedHistory.length > 1 
        ? (Number(sortedHistory[sortedHistory.length - 1].price) - Number(sortedHistory[0].price)) / Number(sortedHistory[0].price)
        : 0
      
      const daysOfData = (new Date(sortedHistory[sortedHistory.length - 1].recorded_at).getTime() - 
                          new Date(sortedHistory[0].recorded_at).getTime()) / (1000 * 60 * 60 * 24)
      
      const dailyReturnRate = daysOfData > 0 ? totalReturn / daysOfData : 0
      const annualReturnRate = dailyReturnRate * 365 * 100 // Convert to percentage

      // Predict 1-year forward price
      const currentPrice = Number(gpuData.current_price)
      const predictedPrice = currentPrice * (1 + annualReturnRate / 100)

      // Calculate confidence interval (±2 standard deviations = ~95% confidence)
      const priceVolatility = currentPrice * (annualVolatility / 100)
      const lowerBound = predictedPrice - (2 * priceVolatility)
      const upperBound = predictedPrice + (2 * priceVolatility)

      // Determine trend direction
      let trend: 'upward' | 'downward' | 'stable' = 'stable'
      if (annualReturnRate > 5) trend = 'upward'
      else if (annualReturnRate < -5) trend = 'downward'

      // Assumptions
      const assumptions = [
        `Historical price trend continues (${annualReturnRate.toFixed(1)}% annual return)`,
        `Volatility remains constant (${annualVolatility.toFixed(1)}% annual volatility)`,
        `Based on ${sortedHistory.length} historical data points over ${Math.round(daysOfData)} days`,
        `No major market disruptions or supply chain shocks`,
        `Technology lifecycle and demand patterns remain similar`,
        `Market conditions similar to historical period analyzed`
      ]

      setPredictionResult({
        predictedPrice,
        confidenceInterval: {
          lower: Math.max(0, lowerBound),
          upper: upperBound
        },
        annualReturnRate,
        volatility: annualVolatility,
        trend,
        dataPoints: sortedHistory.length,
        assumptions
      })
    } catch (error) {
      console.error('Error calculating prediction:', error)
      alert('Failed to calculate prediction. Please try again.')
    } finally {
      setCalculating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading predictions...</div>
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
              <a href="/gpu-info" className="text-slate-300 hover:text-white px-3 py-2">GPU Info</a>
              <a href="/history" className="text-slate-300 hover:text-white px-3 py-2">History</a>
              <a href="/analytics" className="text-slate-300 hover:text-white px-3 py-2">Analytics</a>
              <a href="/leaderboard" className="text-slate-300 hover:text-white px-3 py-2">Leaderboard</a>
              <a href="/predictions" className="text-slate-300 hover:text-white px-3 py-2 border-b-2 border-blue-500">Predictions</a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">📊 Recent Predictions</h1>
          <p className="text-slate-300">Track prediction accuracy and earn alpha points</p>
        </div>

        {/* 1-Year Forward Price Prediction Tool */}
        <div className="mb-12 bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">🔮 1-Year Forward Price Predictor</h2>
              <p className="text-slate-400 text-sm">Calculate predicted price based on historical volatility and trends</p>
            </div>
            <button
              onClick={() => setShowTool(!showTool)}
              className="text-blue-400 hover:text-blue-300 text-sm font-medium"
            >
              {showTool ? 'Hide Tool' : 'Show Tool'}
            </button>
          </div>

          {showTool && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Select GPU
                  </label>
                  <select
                    value={selectedGpuId}
                    onChange={(e) => setSelectedGpuId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {gpus.map((gpu) => (
                      <option key={gpu.id} value={gpu.id}>
                        {gpu.brand} {gpu.model} - ${gpu.current_price}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={calculate1YearPrediction}
                    disabled={calculating || !selectedGpuId}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {calculating ? 'Calculating...' : 'Calculate Prediction'}
                  </button>
                </div>
              </div>

              {predictionResult && (
                <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <div className="text-slate-400 text-sm mb-1">Predicted Price (1 Year)</div>
                        <div className="text-3xl font-bold text-white">
                          ${predictionResult.predictedPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">
                          {predictionResult.trend === 'upward' && '📈 Upward Trend'}
                          {predictionResult.trend === 'downward' && '📉 Downward Trend'}
                          {predictionResult.trend === 'stable' && '➡️ Stable Trend'}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-slate-400 text-sm mb-1">95% Confidence Interval</div>
                        <div className="text-lg text-slate-300">
                          ${predictionResult.confidenceInterval.lower.toFixed(2)} - ${predictionResult.confidenceInterval.upper.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-slate-400 text-sm mb-1">Expected Annual Return</div>
                        <div className={`text-xl font-semibold ${
                          predictionResult.annualReturnRate >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {predictionResult.annualReturnRate >= 0 ? '+' : ''}{predictionResult.annualReturnRate.toFixed(2)}%
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-slate-400 text-sm mb-1">Annual Volatility</div>
                        <div className="text-lg text-yellow-400">
                          {predictionResult.volatility.toFixed(2)}%
                        </div>
                      </div>

                      <div>
                        <div className="text-slate-400 text-sm mb-1">Data Points Used</div>
                        <div className="text-lg text-slate-300">
                          {predictionResult.dataPoints} historical prices
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-700 pt-6">
                    <h3 className="text-white font-semibold mb-3">📋 Model Assumptions</h3>
                    <ul className="space-y-2">
                      {predictionResult.assumptions.map((assumption, idx) => (
                        <li key={idx} className="text-slate-300 text-sm flex items-start">
                          <span className="text-slate-500 mr-2">•</span>
                          <span>{assumption}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-yellow-400 text-xl mr-3">⚠️</div>
                  <div className="flex-1">
                    <h3 className="text-yellow-400 font-semibold mb-2">Important Disclaimer</h3>
                    <div className="text-yellow-200/90 text-sm space-y-2">
                      <p>
                        <strong>This prediction tool is for informational purposes only and should not be used as financial or investment advice.</strong>
                      </p>
                      <p>
                        The 1-year forward price prediction is based on historical price data, volatility, and trend analysis. 
                        Actual future prices may differ significantly due to:
                      </p>
                      <ul className="list-disc list-inside ml-2 space-y-1 mt-2">
                        <li>Market disruptions, supply chain issues, or economic changes</li>
                        <li>New product releases or technology shifts</li>
                        <li>Changes in demand patterns or industry trends</li>
                        <li>Regulatory changes or geopolitical events</li>
                        <li>Limited historical data availability</li>
                      </ul>
                      <p className="mt-2">
                        Past performance does not guarantee future results. Always conduct your own research and consult with 
                        financial advisors before making investment decisions. GPUalpha is not responsible for any losses or 
                        decisions made based on these predictions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {predictions.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Predictions Yet</h3>
            <p className="text-slate-400 mb-6">Start making predictions to appear on the leaderboard!</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700"
            >
              Make Your First Prediction
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-white text-lg font-semibold mb-2">
                      {prediction.gpus.brand} {prediction.gpus.model}
                    </h3>
                    <div className="text-sm text-slate-400">
                      Made on {formatDate(prediction.created_at)}
                    </div>
                  </div>
                  <div className={`text-sm px-3 py-1 rounded ${getStatusColor(prediction)} bg-slate-800`}>
                    {getStatusText(prediction)}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Predicted Price:</span>
                      <span className="text-white font-semibold">${prediction.predicted_price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Current Price:</span>
                      <span className="text-slate-300">${prediction.gpus.current_price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Timeframe:</span>
                      <span className="text-slate-300">{prediction.timeframe}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Confidence:</span>
                      <span className="text-slate-300">{prediction.confidence}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {prediction.is_resolved && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Accuracy Score:</span>
                          <span className={`font-semibold ${getStatusColor(prediction)}`}>
                            {prediction.accuracy_score}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Points Earned:</span>
                          <span className="text-blue-400 font-semibold">
                            +{prediction.points_earned || 0}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {prediction.reasoning && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="text-slate-400 text-sm mb-2">Reasoning:</div>
                    <div className="text-slate-300 text-sm">{prediction.reasoning}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}