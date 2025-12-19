import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { fetchVastAiPrices, aggregateVastAiPrices } from '../../../../lib/api/vastai'
import { fetchLambdaLabsPrices, aggregateLambdaPrices } from '../../../../lib/api/lambdalabs'
import { fetchRunPodPrices, aggregateRunPodPrices } from '../../../../lib/api/runpod'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET
    
    if (!expectedToken) {
      return NextResponse.json(
        { error: 'CRON_SECRET not configured' },
        { status: 500 }
      )
    }
    
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🚀 Starting price update from 3 API sources...')
    
    // Fetch prices from all sources in parallel
    const [vastAiOffers, lambdaInstances, runPodGpus] = await Promise.all([
      fetchVastAiPrices().catch(err => {
        console.error('❌ Vast.ai fetch failed:', err)
        return []
      }),
      fetchLambdaLabsPrices().catch(err => {
        console.error('❌ Lambda Labs fetch failed:', err)
        return []
      }),
      fetchRunPodPrices().catch(err => {
        console.error('❌ RunPod fetch failed:', err)
        return []
      })
    ])
    
    const vastAiPrices = aggregateVastAiPrices(vastAiOffers)
    const lambdaPrices = aggregateLambdaPrices(lambdaInstances)
    const runPodPrices = aggregateRunPodPrices(runPodGpus)
    
    console.log(`📊 Data sources:`)
    console.log(`   - Vast.ai: ${vastAiPrices.size} models`)
    console.log(`   - Lambda Labs: ${lambdaPrices.size} models`)
    console.log(`   - RunPod: ${runPodPrices.size} models`)
    
    // Merge prices with priority: RunPod > Lambda Labs > Vast.ai
    // (Most reliable to least reliable)
    const allPrices = new Map(vastAiPrices)
    
    // Add Lambda Labs (overrides Vast.ai)
    for (const [key, lambdaData] of lambdaPrices.entries()) {
      allPrices.set(key, {
        ...lambdaData,
        source: 'lambdalabs',
        avgPricePerMonth: lambdaData.pricePerMonth,
        avgPricePerHour: lambdaData.pricePerHour
      })
    }
    
    // Add RunPod (highest priority, overrides both)
    for (const [key, runPodData] of runPodPrices.entries()) {
      allPrices.set(key, {
        ...runPodData,
        source: 'runpod',
        avgPricePerMonth: runPodData.pricePerMonth,
        avgPricePerHour: runPodData.pricePerHour
      })
    }
    
    console.log(`✅ Total unique GPU models: ${allPrices.size}`)
    
    // Get existing GPUs from database
    const { data: gpus, error } = await supabase
      .from('gpus')
      .select('id, model, brand, current_price')
    
    if (error) throw error
    
    const updates = []
    const notFound = []
    
    for (const gpu of gpus || []) {
      // Try to match GPU with API data
      const key = `${gpu.brand}|${gpu.model}`
      const priceData = allPrices.get(key)
      
      if (priceData) {
        const newPrice = priceData.avgPricePerMonth || priceData.pricePerMonth
        const source = (priceData as any).source || 'vastai'
        
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
              source,
              recorded_at: new Date().toISOString()
            })
          
          updates.push({
            gpu: `${gpu.brand} ${gpu.model}`,
            oldPrice: gpu.current_price,
            newPrice: newPrice,
            change: gpu.current_price > 0 
              ? ((newPrice - gpu.current_price) / gpu.current_price * 100).toFixed(2) + '%'
              : 'N/A',
            source,
            dataPoints: (priceData as any).count || 1
          })
        }
      } else {
        notFound.push(`${gpu.brand} ${gpu.model}`)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: `Prices updated from 3 API sources`,
      sources: ['vastai', 'lambdalabs', 'runpod'],
      stats: {
        totalGPUs: gpus?.length || 0,
        updated: updates.length,
        notFound: notFound.length,
        vastAiModels: vastAiPrices.size,
        lambdaModels: lambdaPrices.size,
        runPodModels: runPodPrices.size,
        totalUniqueModels: allPrices.size,
        updateRate: gpus?.length ? ((updates.length / gpus.length) * 100).toFixed(1) + '%' : '0%'
      },
      updates: updates.slice(0, 20), // Show first 20 updates
      notFoundGPUs: notFound.slice(0, 10), // Limit to first 10
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error updating prices:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update prices', 
        details: error instanceof Error ? error.message : 'Unknown error',
        sources: ['vastai', 'lambdalabs', 'runpod']
      },
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