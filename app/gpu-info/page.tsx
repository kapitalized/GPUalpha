'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { LoadingSkeleton } from '../../components/LoadingSkeleton'
import { logger } from '../../lib/utils/logger'
import toast from 'react-hot-toast'

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

// Comprehensive GPU Information Database
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
  pros: string[]
  cons: string[]
  tdp: string
}> = {
  'RTX 4090': {
    description: 'NVIDIA\'s flagship consumer GPU, designed for extreme 4K gaming, content creation, and AI workloads. The most powerful consumer GPU available.',
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
    tdp: '450W',
    features: ['DLSS 3', 'Ray Tracing', 'AV1 Encoding', '8K Gaming', 'AI Acceleration', 'NVENC'],
    useCases: ['4K/8K Gaming', 'AI/ML Training', 'Video Editing', '3D Rendering', 'Scientific Computing'],
    pros: ['Best gaming performance', 'Excellent for AI workloads', 'Massive VRAM', 'Future-proof'],
    cons: ['Very expensive', 'High power consumption', 'Requires large PSU']
  },
  'RTX 4080': {
    description: 'High-end GPU offering excellent 4K performance with advanced ray tracing and AI features. Great balance of power and efficiency.',
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
    tdp: '320W',
    features: ['DLSS 3', 'Ray Tracing', 'AV1 Encoding', '4K Gaming', 'AI Acceleration'],
    useCases: ['4K Gaming', 'Streaming', 'Content Creation', 'VR Gaming', 'Video Editing'],
    pros: ['Excellent 4K performance', 'Good value vs 4090', 'Efficient architecture'],
    cons: ['Still expensive', '16GB VRAM may limit future use']
  },
  'RTX 4070': {
    description: 'Mid-to-high range GPU perfect for 1440p gaming and content creation at an accessible price point. Sweet spot for most gamers.',
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
    tdp: '200W',
    features: ['DLSS 3', 'Ray Tracing', '1440p Gaming', 'AV1 Encoding'],
    useCases: ['1440p Gaming', 'Streaming', 'Video Editing', 'Photo Editing', '1080p/1440p'],
    pros: ['Great 1440p performance', 'Good price/performance', 'Efficient power usage'],
    cons: ['12GB VRAM', '192-bit bus width']
  },
  'RTX 4070 Ti': {
    description: 'High-performance GPU positioned between RTX 4070 and RTX 4080, offering excellent 1440p and entry-level 4K gaming.',
    releaseDate: 'January 2023',
    architecture: 'Ada Lovelace',
    memory: '12 GB',
    memoryType: 'GDDR6X',
    busWidth: '192-bit',
    baseClock: '2.31 GHz',
    boostClock: '2.61 GHz',
    cudaCores: '7,680',
    rayTracing: true,
    dlss: true,
    tdp: '285W',
    features: ['DLSS 3', 'Ray Tracing', '1440p/4K Gaming', 'AV1 Encoding'],
    useCases: ['1440p Gaming', 'Entry 4K Gaming', 'Content Creation', 'Streaming'],
    pros: ['Strong performance', 'Good for high-refresh 1440p'],
    cons: ['12GB VRAM limitation', 'Price point competition']
  },
  'RTX 4060 Ti': {
    description: 'Mid-range GPU offering great 1080p and solid 1440p performance with modern features. Available in 8GB and 16GB variants.',
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
    tdp: '165W',
    features: ['DLSS 3', 'Ray Tracing', '1080p/1440p Gaming', 'AV1 Encoding'],
    useCases: ['1080p Gaming', '1440p Gaming', 'Streaming', 'Light Content Creation'],
    pros: ['Good 1080p performance', 'Efficient', '16GB variant available'],
    cons: ['128-bit bus', '8GB variant limited']
  },
  'RTX 4060': {
    description: 'Entry-level RTX 40-series GPU designed for 1080p gaming with modern features like DLSS 3 and ray tracing support.',
    releaseDate: 'June 2023',
    architecture: 'Ada Lovelace',
    memory: '8 GB',
    memoryType: 'GDDR6',
    busWidth: '128-bit',
    baseClock: '1.83 GHz',
    boostClock: '2.46 GHz',
    cudaCores: '3,072',
    rayTracing: true,
    dlss: true,
    tdp: '115W',
    features: ['DLSS 3', 'Ray Tracing', '1080p Gaming', 'AV1 Encoding'],
    useCases: ['1080p Gaming', 'Esports', 'Light Streaming', 'General Use'],
    pros: ['Low power consumption', 'DLSS 3 support', 'Good for 1080p'],
    cons: ['8GB VRAM', '128-bit bus', 'Limited for future games']
  },
  'RX 7900 XTX': {
    description: 'AMD\'s flagship GPU competing with RTX 4080, offering excellent rasterization performance and 24GB VRAM.',
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
    tdp: '355W',
    features: ['FSR 3', 'Ray Tracing', 'AV1 Encoding', '4K Gaming', 'Hybrid Ray Tracing'],
    useCases: ['4K Gaming', 'Content Creation', 'Streaming', 'VR Gaming', 'Workstation'],
    pros: ['24GB VRAM', 'Great rasterization', 'Good value', 'FSR support'],
    cons: ['Ray tracing weaker than NVIDIA', 'No DLSS', 'Higher power under load']
  },
  'RX 7900 XT': {
    description: 'High-end AMD GPU offering strong 4K performance, positioned between RX 7800 XT and RX 7900 XTX.',
    releaseDate: 'December 2022',
    architecture: 'RDNA 3',
    memory: '20 GB',
    memoryType: 'GDDR6',
    busWidth: '320-bit',
    baseClock: '1.5 GHz',
    boostClock: '2.4 GHz',
    streamProcessors: '5,376',
    rayTracing: true,
    dlss: false,
    tdp: '315W',
    features: ['FSR 3', 'Ray Tracing', 'AV1 Encoding', '4K Gaming'],
    useCases: ['4K Gaming', '1440p High-Refresh', 'Content Creation', 'Streaming'],
    pros: ['20GB VRAM', 'Good performance', 'FSR support'],
    cons: ['Ray tracing performance', 'Positioned close to XTX']
  },
  'RX 7800 XT': {
    description: 'High-performance GPU targeting 1440p and entry-level 4K gaming with excellent value proposition.',
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
    tdp: '263W',
    features: ['FSR 3', 'Ray Tracing', '1440p/4K Gaming', 'AV1 Encoding'],
    useCases: ['1440p Gaming', '4K Gaming', 'Streaming', 'Content Creation'],
    pros: ['16GB VRAM', 'Excellent value', 'Strong 1440p performance'],
    cons: ['Ray tracing weaker', 'No DLSS']
  },
  'RX 7700 XT': {
    description: 'Mid-range GPU offering solid 1440p performance and good value for money. Great for high-refresh 1440p gaming.',
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
    tdp: '245W',
    features: ['FSR 3', 'Ray Tracing', '1440p Gaming', 'AV1 Encoding'],
    useCases: ['1440p Gaming', '1080p Gaming', 'Streaming', 'Light Content Creation'],
    pros: ['Good 1440p performance', '12GB VRAM', 'Value oriented'],
    cons: ['Ray tracing performance', 'Close to 7800 XT price']
  },
  'RX 7600': {
    description: 'Entry-level RDNA 3 GPU designed for 1080p gaming with modern features and good efficiency.',
    releaseDate: 'May 2023',
    architecture: 'RDNA 3',
    memory: '8 GB',
    memoryType: 'GDDR6',
    busWidth: '128-bit',
    baseClock: '1.72 GHz',
    boostClock: '2.66 GHz',
    streamProcessors: '2,048',
    rayTracing: true,
    dlss: false,
    tdp: '165W',
    features: ['FSR 3', 'Ray Tracing', '1080p Gaming', 'AV1 Encoding'],
    useCases: ['1080p Gaming', 'Esports', 'Light Streaming'],
    pros: ['Good 1080p performance', 'Efficient', 'Modern features'],
    cons: ['8GB VRAM', 'Ray tracing limited', 'No DLSS']
  },
  'RTX 3090': {
    description: 'Previous generation flagship NVIDIA GPU with massive 24GB VRAM. Still excellent for content creation and AI workloads.',
    releaseDate: 'September 2020',
    architecture: 'Ampere',
    memory: '24 GB',
    memoryType: 'GDDR6X',
    busWidth: '384-bit',
    baseClock: '1.40 GHz',
    boostClock: '1.70 GHz',
    cudaCores: '10,496',
    rayTracing: true,
    dlss: true,
    tdp: '350W',
    features: ['DLSS 2', 'Ray Tracing', '8K Gaming', 'NVENC', 'AI Acceleration'],
    useCases: ['4K Gaming', 'AI/ML Training', 'Video Editing', '3D Rendering', 'Workstation'],
    pros: ['24GB VRAM', 'Still powerful', 'Good for AI'],
    cons: ['Older architecture', 'Less efficient', 'No DLSS 3']
  },
  'RTX 3080': {
    description: 'Previous generation high-end GPU, still capable of excellent 4K gaming and content creation.',
    releaseDate: 'September 2020',
    architecture: 'Ampere',
    memory: '10 GB / 12 GB',
    memoryType: 'GDDR6X',
    busWidth: '320-bit / 384-bit',
    baseClock: '1.44 GHz',
    boostClock: '1.71 GHz',
    cudaCores: '8,704 / 8,960',
    rayTracing: true,
    dlss: true,
    tdp: '320W / 350W',
    features: ['DLSS 2', 'Ray Tracing', '4K Gaming', 'NVENC'],
    useCases: ['4K Gaming', '1440p High-Refresh', 'Content Creation', 'Streaming'],
    pros: ['Still powerful', 'Good value used'],
    cons: ['Older architecture', 'VRAM limitations', 'No DLSS 3']
  }
}

export default function GPUInfoPage() {
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
      
      // Log GPU data for debugging
      if (data.length > 0) {
        logger.debug('Fetched GPUs:', data.map((gpu: GPU) => `${gpu.brand} ${gpu.model}`))
        setSelectedGPU(data[0])
      }
    } catch (error) {
      logger.error('Error fetching GPUs:', error)
      toast.error('Failed to load GPU data')
    } finally {
      setLoading(false)
    }
  }

  const getGPUInfo = (gpu: GPU) => {
    // Normalize the model name (remove extra spaces, trim)
    const normalizedModel = gpu.model.trim()
    const normalizedBrand = gpu.brand.trim()
    
    // gpuInfo keys are just model names like "RTX 4090", not "NVIDIA RTX 4090"
    // Try model name first (most common case)
    if (gpuInfo[normalizedModel]) {
      return gpuInfo[normalizedModel]
    }
    
    // Try with brand prefix
    const withBrand = `${normalizedBrand} ${normalizedModel}`
    if (gpuInfo[withBrand]) {
      return gpuInfo[withBrand]
    }
    
    // Try uppercase variations
    if (gpuInfo[normalizedModel.toUpperCase()]) {
      return gpuInfo[normalizedModel.toUpperCase()]
    }
    
    // Try partial matching - check if model name matches any info key
    const modelUpper = normalizedModel.toUpperCase()
    for (const [infoKey, infoValue] of Object.entries(gpuInfo)) {
      const infoKeyUpper = infoKey.toUpperCase()
      // Check if model exactly matches or is contained in the key
      if (infoKeyUpper === modelUpper || infoKeyUpper.includes(modelUpper)) {
        return infoValue
      }
    }
    
    // Last resort: try matching by number (e.g., "4090" in model matches "RTX 4090" in key)
    const modelNumbers = normalizedModel.match(/\d+/g)
    if (modelNumbers && modelNumbers.length > 0) {
      for (const [infoKey, infoValue] of Object.entries(gpuInfo)) {
        // Check if any number from model is in the info key
        if (modelNumbers.some(num => infoKey.includes(num))) {
          return infoValue
        }
      }
    }
    
    // Debug: log what we tried
    logger.debug('No GPU info found', {
      brand: normalizedBrand,
      model: normalizedModel,
      triedKeys: [normalizedModel, withBrand, normalizedModel.toUpperCase()],
      availableKeys: Object.keys(gpuInfo).slice(0, 5)
    })
    
    return null
  }

  if (loading) {
    return <LoadingSkeleton />
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
              <span className="text-white px-3 py-2 border-b-2 border-blue-500">GPU Info</span>
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
          <h1 className="text-4xl font-bold text-white mb-4">ℹ️ GPU Information & Specifications</h1>
          <p className="text-slate-300">Detailed information about each GPU including specifications, features, use cases, and performance characteristics</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* GPU List */}
          <div className="lg:col-span-1">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Select GPU</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {gpus.map((gpu) => (
                    <button
                      key={gpu.id}
                      onClick={() => setSelectedGPU(gpu)}
                      className={`w-full text-left p-4 rounded-lg transition-colors ${
                        selectedGPU?.id === gpu.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <div className="font-semibold">{gpu.brand} {gpu.model}</div>
                      <div className="text-sm opacity-80">${gpu.current_price.toFixed(2)}</div>
                      {gpu.availability && (
                        <div className={`text-xs mt-1 ${
                          gpu.availability === 'in_stock' ? 'text-green-400' :
                          gpu.availability === 'limited' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {gpu.availability.replace('_', ' ').toUpperCase()}
                        </div>
                      )}
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
                <Card className="bg-slate-800/50 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-2xl text-white">
                      {selectedGPU.brand} {selectedGPU.model}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                      <p className="text-slate-300 leading-relaxed">{info.description}</p>
                    </div>

                    {/* Specifications Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Technical Specifications</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between border-b border-slate-700 pb-2">
                            <span className="text-slate-400">Release Date:</span>
                            <span className="text-white font-medium">{info.releaseDate}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-700 pb-2">
                            <span className="text-slate-400">Architecture:</span>
                            <span className="text-white font-medium">{info.architecture}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-700 pb-2">
                            <span className="text-slate-400">Memory:</span>
                            <span className="text-white font-medium">{info.memory}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-700 pb-2">
                            <span className="text-slate-400">Memory Type:</span>
                            <span className="text-white font-medium">{info.memoryType}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-700 pb-2">
                            <span className="text-slate-400">Bus Width:</span>
                            <span className="text-white font-medium">{info.busWidth}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-700 pb-2">
                            <span className="text-slate-400">Base Clock:</span>
                            <span className="text-white font-medium">{info.baseClock}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-700 pb-2">
                            <span className="text-slate-400">Boost Clock:</span>
                            <span className="text-white font-medium">{info.boostClock}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-700 pb-2">
                            <span className="text-slate-400">TDP:</span>
                            <span className="text-white font-medium">{info.tdp}</span>
                          </div>
                          {info.cudaCores && (
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                              <span className="text-slate-400">CUDA Cores:</span>
                              <span className="text-white font-medium">{info.cudaCores}</span>
                            </div>
                          )}
                          {info.streamProcessors && (
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                              <span className="text-slate-400">Stream Processors:</span>
                              <span className="text-white font-medium">{info.streamProcessors}</span>
                            </div>
                          )}
                          {selectedGPU.power_consumption && (
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                              <span className="text-slate-400">Power Consumption:</span>
                              <span className="text-white font-medium">{selectedGPU.power_consumption}W</span>
                            </div>
                          )}
                          {selectedGPU.benchmark_score && (
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                              <span className="text-slate-400">Benchmark Score:</span>
                              <span className="text-white font-medium">{selectedGPU.benchmark_score}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Features & Technologies</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <span className={`w-3 h-3 rounded-full ${info.rayTracing ? 'bg-green-400' : 'bg-red-400'}`}></span>
                              <span className="text-slate-300">Ray Tracing: {info.rayTracing ? 'Yes' : 'No'}</span>
                            </div>
                            {info.dlss !== undefined && (
                              <div className="flex items-center space-x-2">
                                <span className={`w-3 h-3 rounded-full ${info.dlss ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                <span className="text-slate-300">DLSS: {info.dlss ? 'Yes (NVIDIA)' : 'No (AMD uses FSR)'}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-slate-400 text-sm mb-2">Key Features:</div>
                            <div className="flex flex-wrap gap-2">
                              {info.features.map((feature, idx) => (
                                <span key={idx} className="bg-blue-600/20 text-blue-300 px-3 py-1 rounded text-xs font-medium">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Pros and Cons */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-green-400 mb-3">✓ Advantages</h3>
                        <ul className="space-y-2">
                          {info.pros.map((pro, idx) => (
                            <li key={idx} className="text-slate-300 text-sm flex items-start">
                              <span className="text-green-400 mr-2">•</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-red-400 mb-3">✗ Considerations</h3>
                        <ul className="space-y-2">
                          {info.cons.map((con, idx) => (
                            <li key={idx} className="text-slate-300 text-sm flex items-start">
                              <span className="text-red-400 mr-2">•</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Use Cases */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Best Use Cases</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {info.useCases.map((useCase, idx) => (
                          <div key={idx} className="bg-slate-700/50 p-3 rounded-lg flex items-center space-x-2 border border-slate-600">
                            <span className="text-green-400 text-lg">✓</span>
                            <span className="text-slate-300">{useCase}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing Info */}
                    <div className="pt-4 border-t border-slate-700">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <div className="text-slate-400 text-sm mb-1">Current Price</div>
                          <div className="text-2xl font-bold text-white">${selectedGPU.current_price.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm mb-1">MSRP</div>
                          <div className="text-2xl font-bold text-slate-300">${selectedGPU.msrp.toFixed(2)}</div>
                        </div>
                        <div>
                          <div className="text-slate-400 text-sm mb-1">Price vs MSRP</div>
                          <div className={`text-2xl font-bold ${
                            selectedGPU.current_price < selectedGPU.msrp ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {selectedGPU.current_price < selectedGPU.msrp ? '-' : '+'}
                            ${Math.abs(selectedGPU.current_price - selectedGPU.msrp).toFixed(2)}
                            ({((selectedGPU.current_price - selectedGPU.msrp) / selectedGPU.msrp * 100).toFixed(1)}%)
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : selectedGPU ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-8">
                  <div className="text-center mb-4">
                    <div className="text-slate-400 mb-2">
                      Detailed information not available for <span className="text-white font-semibold">{selectedGPU.brand} {selectedGPU.model}</span>
                    </div>
                    <div className="text-slate-500 text-sm">
                      Basic information may be available from the GPU detail page
                    </div>
                  </div>
                  
                  {/* Debug info in development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 p-4 bg-slate-900 rounded text-xs text-slate-400 border border-slate-700">
                      <div className="font-semibold mb-2">Debug Info:</div>
                      <div>Brand: {selectedGPU.brand}</div>
                      <div>Model: {selectedGPU.model}</div>
                      <div>Lookup key tried: "{selectedGPU.model}"</div>
                      <div className="mt-2">
                        Available keys (first 5): {Object.keys(gpuInfo).slice(0, 5).join(', ')}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center mt-6">
                    <a 
                      href={`/gpu/${selectedGPU.id}`}
                      className="text-blue-400 hover:text-blue-300 inline-block"
                    >
                      View GPU Details →
                    </a>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-slate-800/50 border-slate-700">
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

