import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { logger } from '../../../../lib/utils/logger'

// Get all GPUs (simplified, for navigation menu)
export async function GET() {
  try {
    const { data: gpus, error } = await supabase
      .from('gpus')
      .select('id, brand, model, slug, current_price, availability')
      .order('brand', { ascending: true })
      .order('model', { ascending: true })

    if (error) throw error

    // Group by brand
    const groupedByBrand = gpus?.reduce((acc: any, gpu) => {
      const brand = gpu.brand || 'Other'
      if (!acc[brand]) {
        acc[brand] = []
      }
      acc[brand].push(gpu)
      return acc
    }, {})

    return NextResponse.json({
      gpus,
      groupedByBrand,
      total: gpus?.length || 0
    })
  } catch (error) {
    logger.error('Error fetching GPUs:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch GPUs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}


