import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const gpuId = searchParams.get('id')
  
  try {
    if (gpuId) {
      // Return specific GPU with price history
      const { data: gpu, error: gpuError } = await supabase
        .from('gpus')
        .select(`
          *,
          price_history (
            price,
            recorded_at,
            source
          )
        `)
        .eq('id', gpuId)
        .single()
      
      if (gpuError) throw gpuError
      if (!gpu) {
        return NextResponse.json({ error: 'GPU not found' }, { status: 404 })
      }
      
      return NextResponse.json(gpu)
    } else {
      // Return all GPUs with latest price data
      const { data: gpus, error } = await supabase
        .from('gpus')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      return NextResponse.json(gpus)
    }
  } catch (error: any) {
    console.error('Database error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch GPU data',
        details: error?.message || 'Unknown error',
        hint: error?.code === '42P01' ? 'Database table "gpus" does not exist. Please run the SQL schema migration.' : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Add new GPU or update price
    if (body.type === 'price_update') {
      const { gpu_id, price, source = 'api' } = body
      
      // Update current price in gpus table
      const { error: updateError } = await supabase
        .from('gpus')
        .update({ 
          current_price: price, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', gpu_id)
      
      if (updateError) throw updateError
      
      // Add to price history
      const { error: historyError } = await supabase
        .from('price_history')
        .insert({
          gpu_id,
          price,
          source
        })
      
      if (historyError) throw historyError
      
      return NextResponse.json({ success: true, message: 'Price updated' })
    }
    
    // Add new GPU
    if (body.type === 'new_gpu') {
      const { data, error } = await supabase
        .from('gpus')
        .insert(body.gpu_data)
        .select()
        .single()
      
      if (error) throw error
      
      return NextResponse.json({ success: true, gpu: data })
    }
    
    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
    
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}