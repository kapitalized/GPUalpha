'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'

interface GPU {
  id: string
  model: string
  brand: string
  current_price: number
  msrp: number
  availability: string
  benchmark_score?: number
  power_consumption?: number
}

// GPU Information Database
const gpuInfo: Record<string, {
  description: string
  releaseDate: string
  architecture: string
  memory: string
  memoryType: string
  busWidth: string
  baseClock: string
  boostClock: string
  cudaCores?: string
  streamProcessors?: string
  rayTracing: boolean
  dlss?: boolean
  features: string[]
  useCases: string[]
}> = {
  'RTX 4090': {
    description: 'NVIDIA\'s flagship consumer GPU, designed for extreme 4K gaming, content creation, and AI workloads.',
    releaseDate: 'October 2022',
    architecture: 'Ada Lovelace',
    memory: '24 GB',
    memoryType: 'GDDR6X',
    busWidth: '384-bit',
    baseClock: '2.23 GHz',
    boostClock: '2.52 GHz',
    cudaCores: '16,384',
    rayTracing: true,
    dlss: true,
    features: ['DLSS 3', 'Ray Tracing', 'AV1 Encoding', '8K Gaming'],
    useCases: ['4K/8K Gaming', 'AI/ML Training', 'Video Editing', '3D Rendering']
  },
  'RTX 4080': {
    description: 'High-end GPU offering excellent 4K performance with advanced ray tracing and AI features.',
    releaseDate: 'November 2022',
    architecture: 'Ada Lovelace',
    memory: '16 GB',
    memoryType: 'GDDR6X',
    busWidth: '256-bit',
    baseClock: '2.21 GHz',
    boostClock: '2.51 GHz',
    cudaCores: '9,728',
    rayTracing: true,
    dlss: true,
    features: ['DLSS 3', 'Ray Tracing', 'AV1 Encoding', '4K Gaming'],
    useCases: ['4K Gaming', 'Streaming', 'Content Creation', 'VR Gaming']
  },
  'RTX 4070': {
    description: 'Mid-to-high range GPU perfect for 1440p gaming and content creation at an accessible price point.',
    releaseDate: 'April 2023',
    architecture: 'Ada Lovelace',
    memory: '12 GB',
    memoryType: 'GDDR6X',
    busWidth: '192-bit',
    baseClock: '1.92 GHz',
    boostClock: '2.48 GHz',
    cudaCores: '5,888',
    rayTracing: true,
    dlss: true,
    features: ['DLSS 3', 'Ray Tracing', '1440p Gaming'],
    useCases: ['1440p Gaming', 'Streaming', 'Video Editing', 'Photo Editing']
  },
  'RTX 4060 Ti': {
    description: 'Mid-range GPU offering great 1080p and solid 1440p performance with modern features.',
    releaseDate: 'May 2023',
    architecture: 'Ada Lovelace',
    memory: '8 GB / 16 GB',
    memoryType: 'GDDR6',
    busWidth: '128-bit',
    baseClock: '2.31 GHz',
    boostClock: '2.54 GHz',
    cudaCores: '4,352',
    rayTracing: true,
    dlss: true,
    features: ['DLSS 3', 'Ray Tracing', '1080p/1440p Gaming'],
    useCases: ['1080p Gaming', '1440p Gaming', 'Streaming', 'Light Content Creation']
  },
  'RX 7900 XTX': {
    description: 'AMD\'s flagship GPU competing with RTX 4080, offering excellent rasterization performance.',
    releaseDate: 'December 2022',
    architecture: 'RDNA 3',
    memory: '24 GB',
    memoryType: 'GDDR6',
    busWidth: '384-bit',
    baseClock: '1.9 GHz',
    boostClock: '2.5 GHz',
    streamProcessors: '6,144',
    rayTracing: true,
    dlss: false,
    features: ['FSR 3', 'Ray Tracing', 'AV1 Encoding', '4K Gaming'],
    useCases: ['4K Gaming', 'Content Creation', 'Streaming', 'VR Gaming']
  },
  'RX 7800 XT': {
    description: 'High-performance GPU targeting 1440p and entry-level 4K gaming with excellent value.',
    releaseDate: 'September 2023',
    architecture: 'RDNA 3',
    memory: '16 GB',
    memoryType: 'GDDR6',
    busWidth: '256-bit',
    baseClock: '1.8 GHz',
    boostClock: '2.43 GHz',
    streamProcessors: '3,840',
    rayTracing: true,
    dlss: false,
    features: ['FSR 3', 'Ray Tracing', '1440p/4K Gaming'],
    useCases: ['1440p Gaming', '4K Gaming', 'Streaming', 'Content Creation']
  },
  'RX 7700 XT': {
    description: 'Mid-range GPU offering solid 1440p performance and good value for money.',
    releaseDate: 'September 2023',
    architecture: 'RDNA 3',
    memory: '12 GB',
    memoryType: 'GDDR6',
    busWidth: '192-bit',
    baseClock: '1.8 GHz',
    boostClock: '2.54 GHz',
    streamProcessors: '3,456',
    rayTracing: true,
    dlss: false,
    features: ['FSR 3', 'Ray Tracing', '1440p Gaming'],
    useCases: ['1440p Gaming', '1080p Gaming', 'Streaming', 'Light Content Creation']
  }
}

export default function InfoPage() {
  const [gpus, setGpus] = useState<GPU[]>([])
  const [selectedGPU, setSelectedGPU] = useState<GPU | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGPUs()
  }, [])

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

  const getGPUInfo = (gpu: GPU) => {
    const key = `${gpu.brand} ${gpu.model}`
    return gpuInfo[key] || null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  const info = selectedGPU ? getGPUInfo(selectedGPU) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <a href="/" className="text-3xl font-bold text-white">⚡ GPUAlpha</a>
            <div className="flex space-x-4">
              <a href="/overview" className="text-slate-300 hover:text-white px-3 py-2">Overview</a>
              <a href="/" className="text-slate-300 hover:text-white px-3 py-2">Index</a>
              <span className="text-white px-3 py-2 border-b-2 border-blue-500">Info</span>
              <a href="/history" className="text-slate-300 hover:text-white px-3 py-2">History</a>
              <a href="/analytics" className="text-slate-300 hover:text-white px-3 py-2">Analytics</a>
              <a href="/leaderboard" className="text-slate-300 hover:text-white px-3 py-2">Leaderboard</a>
              <a href="/predictions" className="text-slate-300 hover:text-white px-3 py-2">Predictions</a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">ℹ️ GPU Information</h1>
          <p className="text-slate-300">Learn about each GPU's specifications, features, and use cases</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* GPU List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Select GPU</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {gpus.map((gpu) => (
                    <button
                      key={gpu.id}
                      onClick={() => setSelectedGPU(gpu)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
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
              </CardContent>
            </Card>
          </div>

          {/* GPU Details */}
          <div className="lg:col-span-2">
            {selectedGPU && info ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      {selectedGPU.brand} {selectedGPU.model}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                      <p className="text-slate-300">{info.description}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Specifications</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Release Date:</span>
                            <span className="text-white">{info.releaseDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Architecture:</span>
                            <span className="text-white">{info.architecture}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Memory:</span>
                            <span className="text-white">{info.memory}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Memory Type:</span>
                            <span className="text-white">{info.memoryType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Bus Width:</span>
                            <span className="text-white">{info.busWidth}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Base Clock:</span>
                            <span className="text-white">{info.baseClock}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Boost Clock:</span>
                            <span className="text-white">{info.boostClock}</span>
                          </div>
                          {info.cudaCores && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">CUDA Cores:</span>
                              <span className="text-white">{info.cudaCores}</span>
                            </div>
                          )}
                          {info.streamProcessors && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Stream Processors:</span>
                              <span className="text-white">{info.streamProcessors}</span>
                            </div>
                          )}
                          {selectedGPU.power_consumption && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Power Consumption:</span>
                              <span className="text-white">{selectedGPU.power_consumption}W</span>
                            </div>
                          )}
                          {selectedGPU.benchmark_score && (
                            <div className="flex justify-between">
                              <span className="text-slate-400">Benchmark Score:</span>
                              <span className="text-white">{selectedGPU.benchmark_score}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Features</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${info.rayTracing ? 'bg-green-400' : 'bg-red-400'}`}></span>
                            <span className="text-slate-300">Ray Tracing: {info.rayTracing ? 'Yes' : 'No'}</span>
                          </div>
                          {info.dlss !== undefined && (
                            <div className="flex items-center space-x-2">
                              <span className={`w-2 h-2 rounded-full ${info.dlss ? 'bg-green-400' : 'bg-red-400'}`}></span>
                              <span className="text-slate-300">DLSS: {info.dlss ? 'Yes' : 'No'}</span>
                            </div>
                          )}
                          <div>
                            <div className="text-slate-400 text-sm mb-2">Key Features:</div>
                            <div className="flex flex-wrap gap-2">
                              {info.features.map((feature, idx) => (
                                <span key={idx} className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Best Use Cases</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {info.useCases.map((useCase, idx) => (
                          <div key={idx} className="bg-slate-800 p-3 rounded-lg flex items-center space-x-2">
                            <span className="text-green-400">✓</span>
                            <span className="text-slate-300">{useCase}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="text-slate-400 text-sm">Current Price</div>
                          <div className="text-2xl font-bold text-white">${selectedGPU.current_price}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm">MSRP</div>
                          <div className="text-2xl font-bold text-slate-300">${selectedGPU.msrp}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : selectedGPU ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-slate-400">Information not available for {selectedGPU.brand} {selectedGPU.model}</div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-slate-400">No GPU selected</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

