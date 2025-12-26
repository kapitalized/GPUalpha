import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Fetch GPU with price history
    const { data: gpu, error: gpuError } = await supabase
      .from('gpus')
      .select(`
        *,
        price_history (
          price,
          source,
          recorded_at
        )
      `)
      .eq('id', id)
      .single()

    if (gpuError) throw gpuError
    
    if (!gpu) {
      return NextResponse.json(
        { error: 'GPU not found' },
        { status: 404 }
      )
    }

    // Sort price history by date
    if (gpu.price_history) {
      gpu.price_history.sort((a: any, b: any) => 
        new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
      )
    }

    // Calculate price statistics
    const prices = gpu.price_history?.map((h: any) => h.price) || []
    const stats = prices.length > 0 ? {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((a: number, b: number) => a + b, 0) / prices.length,
      current: gpu.current_price,
      change24h: prices.length > 1 ? 
        ((gpu.current_price - prices[prices.length - 2]) / prices[prices.length - 2] * 100) : 0,
      change7d: prices.length > 7 ?
        ((gpu.current_price - prices[prices.length - 8]) / prices[prices.length - 8] * 100) : 0,
      change30d: prices.length > 30 ?
        ((gpu.current_price - prices[prices.length - 31]) / prices[prices.length - 31] * 100) : 0
    } : null

    return NextResponse.json({
      ...gpu,
      stats
    })
  } catch (error) {
    console.error('Error fetching GPU details:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch GPU details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

