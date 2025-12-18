import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

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

/**
 * Calculate weighted GPU Compute Index
 * Similar to S&P 500 but for compute infrastructure
 */
async function calculateIndices(): Promise<IndexData> {
  // Get all GPUs with price history
  const { data: gpus, error } = await supabase
    .from('gpus')
    .select('*')
    .order('current_price', { ascending: false })

  if (error || !gpus || gpus.length === 0) {
    throw new Error('Failed to fetch GPU data')
  }

  // Get price history for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { data: priceHistory } = await supabase
    .from('price_history')
    .select('gpu_id, price, recorded_at')
    .gte('recorded_at', thirtyDaysAgo.toISOString())
    .order('recorded_at', { ascending: true })

  // Calculate base index (weighted by price * availability factor)
  let totalWeightedPrice = 0
  let totalWeight = 0
  
  const highEndGPUs: any[] = []
  const midRangeGPUs: any[] = []
  const nvidiaGPUs: any[] = []
  const amdGPUs: any[] = []

  gpus.forEach((gpu: any) => {
    // Weight by price (higher price = more compute power)
    const availabilityWeight = gpu.availability === 'in_stock' ? 1.0 : 
                               gpu.availability === 'limited' ? 0.7 : 0.3
    const priceWeight = gpu.current_price * availabilityWeight
    
    totalWeightedPrice += priceWeight
    totalWeight += availabilityWeight

    // Categorize GPUs
    if (gpu.current_price >= 1000) {
      highEndGPUs.push({ ...gpu, weight: priceWeight })
    } else {
      midRangeGPUs.push({ ...gpu, weight: priceWeight })
    }

    if (gpu.brand === 'NVIDIA') {
      nvidiaGPUs.push({ ...gpu, weight: priceWeight })
    } else if (gpu.brand === 'AMD') {
      amdGPUs.push({ ...gpu, weight: priceWeight })
    }
  })

  // Base index (normalized to 1000)
  const baseIndex = totalWeight > 0 ? (totalWeightedPrice / totalWeight) : 1000
  const gpuComputeIndex = (baseIndex / 1000) * 1000 // Normalize

  // Calculate sub-indices
  const calculateSubIndex = (gpuList: any[]) => {
    if (gpuList.length === 0) return baseIndex
    const total = gpuList.reduce((sum, gpu) => sum + gpu.weight, 0)
    const avg = total / gpuList.length
    return (avg / 1000) * 1000
  }

  const highEndIndex = calculateSubIndex(highEndGPUs)
  const midRangeIndex = calculateSubIndex(midRangeGPUs)
  const nvidiaIndex = calculateSubIndex(nvidiaGPUs)
  const amdIndex = calculateSubIndex(amdGPUs)

  // Calculate changes (need historical data)
  const { data: recentHistory } = await supabase
    .from('price_history')
    .select('price, recorded_at, gpu_id')
    .gte('recorded_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('recorded_at', { ascending: false })

  // Calculate 7-day average
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  
  const { data: weekAgoHistory } = await supabase
    .from('price_history')
    .select('price, recorded_at, gpu_id')
    .gte('recorded_at', sevenDaysAgo.toISOString())
    .lt('recorded_at', new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString())

  // Calculate 30-day average
  const thirtyDaysAgoDate = new Date()
  thirtyDaysAgoDate.setDate(thirtyDaysAgoDate.getDate() - 30)
  
  const { data: monthAgoHistory } = await supabase
    .from('price_history')
    .select('price, recorded_at, gpu_id')
    .gte('recorded_at', thirtyDaysAgoDate.toISOString())
    .lt('recorded_at', new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString())

  // Calculate average prices for change calculations
  interface PriceHistoryItem {
    price: number
    recorded_at: string
    gpu_id: string
  }

  const calculateAveragePrice = (history: PriceHistoryItem[] | null) => {
    if (!history || history.length === 0) return baseIndex
    const sum = history.reduce((acc: number, h: PriceHistoryItem) => acc + h.price, 0)
    return sum / history.length
  }

  const currentAvg = calculateAveragePrice(recentHistory)
  const weekAgoAvg = calculateAveragePrice(weekAgoHistory)
  const monthAgoAvg = calculateAveragePrice(monthAgoHistory)

  const change7d = weekAgoAvg > 0 ? ((currentAvg - weekAgoAvg) / weekAgoAvg) * 100 : 0
  const change30d = monthAgoAvg > 0 ? ((currentAvg - monthAgoAvg) / monthAgoAvg) * 100 : 0

  // Calculate volatility (standard deviation of price changes)
  const prices = recentHistory?.map((h: PriceHistoryItem) => h.price) || []
  const mean = prices.length > 0 ? prices.reduce((a: number, b: number) => a + b, 0) / prices.length : baseIndex
  const variance = prices.length > 0 
    ? prices.reduce((acc: number, price: number) => acc + Math.pow(price - mean, 2), 0) / prices.length 
    : 0
  const volatility = Math.sqrt(variance) / mean * 100 // Coefficient of variation

  // 24h change (simplified - would need hourly data)
  const change24h = change7d / 7

  return {
    timestamp: new Date().toISOString(),
    gpuComputeIndex: Math.round(gpuComputeIndex * 100) / 100,
    highEndIndex: Math.round(highEndIndex * 100) / 100,
    midRangeIndex: Math.round(midRangeIndex * 100) / 100,
    nvidiaIndex: Math.round(nvidiaIndex * 100) / 100,
    amdIndex: Math.round(amdIndex * 100) / 100,
    change24h: Math.round(change24h * 100) / 100,
    change7d: Math.round(change7d * 100) / 100,
    change30d: Math.round(change30d * 100) / 100,
    volatility: Math.round(volatility * 100) / 100
  }
}

export async function GET() {
  try {
    const indexData = await calculateIndices()
    return NextResponse.json(indexData)
  } catch (error: any) {
    console.error('Error calculating indices:', error)
    return NextResponse.json(
      { 
        error: 'Failed to calculate indices',
        details: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

