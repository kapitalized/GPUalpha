import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

// Simplified price update without scraping for now
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET || 'gpu-alpha-price-update-secret'
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting price update...')
    
    // For now, just update prices with some mock fluctuation
    // This proves the endpoint works before adding complex scraping
    const { data: gpus, error } = await supabase
      .from('gpus')
      .select('id, model, brand, current_price')
    
    if (error) throw error
    
    const updates = []
    
    for (const gpu of gpus || []) {
      // Simulate small price changes (±2%) for testing
      const fluctuation = (Math.random() - 0.5) * 0.04 // -2% to +2%
      const newPrice = Math.round(gpu.current_price * (1 + fluctuation) * 100) / 100
      
      // Update GPU price
      const { error: updateError } = await supabase
        .from('gpus')
        .update({ 
          current_price: newPrice,
          updated_at: new Date().toISOString()
        })
        .eq('id', gpu.id)
      
      if (!updateError) {
        // Add to price history
        await supabase
          .from('price_history')
          .insert({
            gpu_id: gpu.id,
            price: newPrice,
            source: 'mock_update',
            recorded_at: new Date().toISOString()
          })
        
        updates.push({
          gpu: `${gpu.brand} ${gpu.model}`,
          oldPrice: gpu.current_price,
          newPrice: newPrice,
          change: ((newPrice - gpu.current_price) / gpu.current_price * 100).toFixed(2) + '%'
        })
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Prices updated successfully',
      updates,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Error updating prices:', error)
    return NextResponse.json(
      { error: 'Failed to update prices', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'Price update endpoint is working',
    timestamp: new Date().toISOString()
  })
}