import { NextResponse } from 'next/server'
import { supabase, supabaseServiceRole, GPU, PriceHistory } from '../../../lib/supabase'
import { logger } from '../../../lib/utils/logger'
import { rateLimiters } from '../../../lib/middleware/rateLimit'
import { BASE_INDEX, HIGH_END_PRICE_THRESHOLD, MID_RANGE_MIN_PRICE, MID_RANGE_MAX_PRICE, HIGH_END_MODELS } from '../../../lib/constants'

/**
 * Calculate GPU Compute Indices
 * Returns weighted indices for different GPU categories
 */
export async function GET(request: Request) {
  // Rate limiting
  const rateLimitResponse = rateLimiters.public(request)
  if (rateLimitResponse) return rateLimitResponse

  try {
    // Get all GPUs with current prices
    const { data: gpus, error: gpusError } = await supabase
      .from('gpus')
      .select('id, model, brand, current_price, msrp')
      .not('current_price', 'is', null)
      .gt('current_price', 0)

    if (gpusError) throw gpusError
    if (!gpus || gpus.length === 0) {
      return NextResponse.json({
        timestamp: new Date().toISOString(),
        gpuComputeIndex: 100,
        highEndIndex: 100,
        midRangeIndex: 100,
        nvidiaIndex: 100,
        amdIndex: 100,
        change24h: 0,
        change7d: 0,
        change30d: 0,
        volatility: 0,
        message: 'No GPU data available'
      })
    }

    // Calculate base indices (weighted average of current prices)
    const totalPrice = gpus.reduce((sum: number, gpu: GPU) => sum + Number(gpu.current_price), 0)
    const avgPrice = totalPrice / gpus.length

    // Calculate indices by category
    const highEndGPUs = gpus.filter((gpu: GPU) => 
      Number(gpu.current_price) >= HIGH_END_PRICE_THRESHOLD || 
      HIGH_END_MODELS.some(model => gpu.model.includes(model))
    )
    const midRangeGPUs = gpus.filter((gpu: GPU) => 
      Number(gpu.current_price) >= MID_RANGE_MIN_PRICE && Number(gpu.current_price) < MID_RANGE_MAX_PRICE
    )
    const nvidiaGPUs = gpus.filter((gpu: GPU) => gpu.brand === 'NVIDIA')
    const amdGPUs = gpus.filter((gpu: GPU) => gpu.brand === 'AMD')

    // Calculate weighted indices
    const gpuComputeIndex = BASE_INDEX * (avgPrice / 1000) // Normalize to base
    const highEndIndex = highEndGPUs.length > 0
      ? BASE_INDEX * (highEndGPUs.reduce((sum: number, gpu: GPU) => sum + Number(gpu.current_price), 0) / highEndGPUs.length / 1000)
      : BASE_INDEX
    const midRangeIndex = midRangeGPUs.length > 0
      ? BASE_INDEX * (midRangeGPUs.reduce((sum: number, gpu: GPU) => sum + Number(gpu.current_price), 0) / midRangeGPUs.length / 500)
      : BASE_INDEX
    const nvidiaIndex = nvidiaGPUs.length > 0
      ? BASE_INDEX * (nvidiaGPUs.reduce((sum: number, gpu: GPU) => sum + Number(gpu.current_price), 0) / nvidiaGPUs.length / 1000)
      : BASE_INDEX
    const amdIndex = amdGPUs.length > 0
      ? BASE_INDEX * (amdGPUs.reduce((sum: number, gpu: GPU) => sum + Number(gpu.current_price), 0) / amdGPUs.length / 1000)
      : BASE_INDEX

    // Get price history for change calculations
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Get historical averages
    const { data: history24h } = await supabase
      .from('price_history')
      .select('price, recorded_at')
      .gte('recorded_at', dayAgo.toISOString())
      .order('recorded_at', { ascending: false })
      .limit(100)

    const { data: history7d } = await supabase
      .from('price_history')
      .select('price, recorded_at')
      .gte('recorded_at', weekAgo.toISOString())
      .order('recorded_at', { ascending: false })
      .limit(500)

    const { data: history30d } = await supabase
      .from('price_history')
      .select('price, recorded_at')
      .gte('recorded_at', monthAgo.toISOString())
      .order('recorded_at', { ascending: false })
      .limit(2000)

    // Calculate average prices for periods
    const avg24h = history24h && history24h.length > 0
      ? history24h.reduce((sum: number, h: PriceHistory) => sum + Number(h.price), 0) / history24h.length
      : avgPrice
    const avg7d = history7d && history7d.length > 0
      ? history7d.reduce((sum: number, h: PriceHistory) => sum + Number(h.price), 0) / history7d.length
      : avgPrice
    const avg30d = history30d && history30d.length > 0
      ? history30d.reduce((sum: number, h: PriceHistory) => sum + Number(h.price), 0) / history30d.length
      : avgPrice

    // Calculate percentage changes
    const change24h = avgPrice > 0 ? ((avgPrice - avg24h) / avg24h) * 100 : 0
    const change7d = avgPrice > 0 ? ((avgPrice - avg7d) / avg7d) * 100 : 0
    const change30d = avgPrice > 0 ? ((avgPrice - avg30d) / avg30d) * 100 : 0

    // Calculate volatility (standard deviation of recent prices)
    let volatility = 0
    if (history7d && history7d.length > 1) {
      const prices = history7d.map((h: PriceHistory) => Number(h.price))
      const mean = prices.reduce((a: number, b: number) => a + b, 0) / prices.length
      const variance = prices.reduce((sum: number, price: number) => sum + Math.pow(price - mean, 2), 0) / prices.length
      volatility = Math.sqrt(variance) / mean * 100 // Coefficient of variation as percentage
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      gpuComputeIndex: Math.round(gpuComputeIndex * 100) / 100,
      highEndIndex: Math.round(highEndIndex * 100) / 100,
      midRangeIndex: Math.round(midRangeIndex * 100) / 100,
      nvidiaIndex: Math.round(nvidiaIndex * 100) / 100,
      amdIndex: Math.round(amdIndex * 100) / 100,
      change24h: Math.round(change24h * 100) / 100,
      change7d: Math.round(change7d * 100) / 100,
      change30d: Math.round(change30d * 100) / 100,
      volatility: Math.round(volatility * 100) / 100,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })

  } catch (error: any) {
    logger.error('Error calculating index data:', error)
    return NextResponse.json(
      {
        error: 'Failed to calculate index data',
        details: error?.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}

