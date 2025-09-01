import { NextResponse } from 'next/server'

// Sample GPU data - will replace with real API calls
const gpuData = [
  {
    id: 'rtx-4090',
    model: 'RTX 4090',
    brand: 'NVIDIA',
    msrp: 1599,
    currentPrice: 2499,
    availability: 'limited',
    priceHistory: [
      { date: '2025-08-25', price: 2599 },
      { date: '2025-08-26', price: 2549 },
      { date: '2025-08-27', price: 2499 },
    ],
    benchmarkScore: 35000,
    powerConsumption: 450,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'rtx-4080-super',
    model: 'RTX 4080 Super', 
    brand: 'NVIDIA',
    msrp: 999,
    currentPrice: 1199,
    availability: 'in_stock',
    priceHistory: [
      { date: '2025-08-25', price: 1249 },
      { date: '2025-08-26', price: 1224 },
      { date: '2025-08-27', price: 1199 },
    ],
    benchmarkScore: 28000,
    powerConsumption: 320,
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'rx-7900-xtx',
    model: 'RX 7900 XTX',
    brand: 'AMD',
    msrp: 999,
    currentPrice: 899,
    availability: 'in_stock',
    priceHistory: [
      { date: '2025-08-25', price: 949 },
      { date: '2025-08-26', price: 924 },
      { date: '2025-08-27', price: 899 },
    ],
    benchmarkScore: 26500,
    powerConsumption: 355,
    lastUpdated: new Date().toISOString()
  }
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const gpuId = searchParams.get('id')
  
  // Return specific GPU or all GPUs
  if (gpuId) {
    const gpu = gpuData.find(g => g.id === gpuId)
    if (!gpu) {
      return NextResponse.json({ error: 'GPU not found' }, { status: 404 })
    }
    return NextResponse.json(gpu)
  }
  
  return NextResponse.json(gpuData)
}

export async function POST(request: Request) {
  // TODO: Add new GPU price data
  const body = await request.json()
  console.log('New price data:', body)
  
  return NextResponse.json({ success: true, message: 'Price updated' })
}
