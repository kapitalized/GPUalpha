'use client'

import { useState } from 'react'
import { GPUCard } from '../components/GPUCard'
import { PredictionModal } from '../components/PredictionModal'
import { Button } from '../components/ui/button'

// Sample data
const sampleGPUs = [
  {
    id: '1',
    model: 'RTX 4090',
    brand: 'NVIDIA',
    currentPrice: 2499,
    msrp: 1599,
    availability: 'limited',
    predictedPrice: 2199
  },
  {
    id: '2', 
    model: 'RTX 4080 Super',
    brand: 'NVIDIA',
    currentPrice: 1199,
    msrp: 999,
    availability: 'in_stock',
    predictedPrice: 1099
  },
  {
    id: '3',
    model: 'RX 7900 XTX',
    brand: 'AMD', 
    currentPrice: 899,
    msrp: 999,
    availability: 'in_stock',
    predictedPrice: 849
  }
]

export default function HomePage() {
  const [selectedGPU, setSelectedGPU] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const handlePredict = (gpuId: string) => {
    const gpu = sampleGPUs.find(g => g.id === gpuId)
    setSelectedGPU(gpu)
    setIsModalOpen(true)
  }

  const handlePredictionSubmit = (prediction: any) => {
    console.log('Prediction submitted:', prediction)
    alert('Prediction saved! 🎯')
    setIsModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-bold text-white">⚡ GPUAlpha</span>
              <span className="text-sm bg-blue-600 text-white px-2 py-1 rounded">BETA</span>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost">Dashboard</Button>
              <Button variant="ghost">
                <a href="/leaderboard">Leaderboard</a>
              </Button>
              <Button variant="outline">Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Generate Alpha in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">GPU Markets</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Make predictions on GPU prices and earn reputation points for accuracy
          </p>
        </div>

        {/* Featured GPUs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">🔥 Trending GPUs</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleGPUs.map((gpu) => (
              <GPUCard 
                key={gpu.id} 
                gpu={gpu} 
                onPredict={handlePredict}
              />
            ))}
          </div>
        </section>

        {/* S
