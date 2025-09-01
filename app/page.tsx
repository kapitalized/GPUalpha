'use client'

import { useState } from 'react'

// Sample data
const sampleGPUs = [
  {
    id: '1',
    model: 'RTX 4090',
    brand: 'NVIDIA',
    currentPrice: 2499,
    msrp: 1599,
    availability: 'limited'
  },
  {
    id: '2', 
    model: 'RTX 4080 Super',
    brand: 'NVIDIA',
    currentPrice: 1199,
    msrp: 999,
    availability: 'in_stock'
  },
  {
    id: '3',
    model: 'RX 7900 XTX',
    brand: 'AMD', 
    currentPrice: 899,
    msrp: 999,
    availability: 'in_stock'
  }
]

export default function HomePage() {
  const [selectedGPU, setSelectedGPU] = useState<string | null>(null)
  
  const handlePredict = (gpuId: string) => {
    setSelectedGPU(gpuId)
    alert(`Making prediction for GPU ${gpuId}`)
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
              <button className="text-slate-300 hover:text-white px-3 py-2">Leaderboard</button>
              <button className="border border-slate-700 text-white px-4 py-2 rounded hover:bg-slate-800">Sign In</button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
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
            {sampleGPUs.map((gpu) => (
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
                    <span className="text-white font-bold">${gpu.currentPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MSRP:</span>
                    <span className="text-slate-300">${gpu.msrp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">vs MSRP:</span>
                    <span className={`font-semibold ${
                      gpu.currentPrice > gpu.msrp ? 'text-red-400' : 'text-green-400'
                    }`}>
                      {gpu.currentPrice > gpu.msrp ? '+' : ''}{(((gpu.currentPrice - gpu.msrp) / gpu.msrp) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => handlePredict(gpu.id)}
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
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold">
              🚀 Get Alpha Access
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-black/50 text-center py-8 mt-12">
        <p className="text-slate-400">&copy; 2025 GPUAlpha. Generate alpha in GPU markets.</p>
      </footer>
    </div>
  )
}
