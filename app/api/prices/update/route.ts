import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { fetchVastAiPrices, aggregateVastAiPrices, hourlyToMonthly } from '../../../../lib/api/vastai'
import { fetchLambdaLabsPrices, aggregateLambdaPrices } from '../../../../lib/api/lambdalabs'
import { fetchRunPodPrices, aggregateRunPodPrices } from '../../../../lib/api/runpod'
import { logger } from '../../../../lib/utils/logger'
import { sizeLimiters } from '../../../../lib/middleware/requestSizeLimit'

export async function POST(request: Request) {
  // Request size limit (cron jobs shouldn't have large bodies)
  const sizeLimitResponse = await sizeLimiters.strict(request)
  if (sizeLimitResponse) return sizeLimitResponse
  
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

    logger.info('Starting price update from 3 API sources...')
    
    // Fetch prices from all sources in parallel
    const [vastAiOffers, lambdaInstances, runPodGpus] = await Promise.all([
      fetchVastAiPrices().catch(err => {
        logger.error('Vast.ai fetch failed:', err)
        return []
      }),
      fetchLambdaLabsPrices().catch(err => {
        logger.error('Lambda Labs fetch failed:', err)
        return []
      }),
      fetchRunPodPrices().catch(err => {
        logger.error('RunPod fetch failed:', err)
        return []
      })
    ])
    
    const vastAiPrices = aggregateVastAiPrices(vastAiOffers)
    const lambdaPrices = aggregateLambdaPrices(lambdaInstances)
    const runPodPrices = aggregateRunPodPrices(runPodGpus)
    
    logger.info(`Data sources: Vast.ai: ${vastAiPrices.size} models, Lambda Labs: ${lambdaPrices.size} models, RunPod: ${runPodPrices.size} models`)
    
    // Merge prices with priority: RunPod > Lambda Labs > Vast.ai
    // (Most reliable to least reliable)
    const allPrices = new Map(vastAiPrices)
    
    // Add Lambda Labs (overrides Vast.ai)
    for (const [key, lambdaData] of Array.from(lambdaPrices.entries())) {
      allPrices.set(key, {
        ...lambdaData,
        source: 'lambdalabs',
        avgPricePerMonth: lambdaData.pricePerMonth,
        avgPricePerHour: lambdaData.pricePerHour
      } as any)
    }
    
    // Add RunPod (highest priority, overrides both)
    for (const [key, runPodData] of Array.from(runPodPrices.entries())) {
      allPrices.set(key, {
        ...runPodData,
        source: 'runpod',
        avgPricePerMonth: runPodData.pricePerMonth,
        avgPricePerHour: runPodData.pricePerHour
      } as any)
    }
    
    logger.info(`Total unique GPU models: ${allPrices.size}`)
    
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
        const newPrice = priceData.avgPricePerMonth || (priceData as any).pricePerMonth
        const source = (priceData as any).source || 'vastai'
        
        // Build update object with all available data
        const updateData: any = {
          current_price: newPrice,
          updated_at: new Date().toISOString()
        }
        
        // Add extended specs if available
        if ((priceData as any).avgCpuCores) updateData.cpu_cores = (priceData as any).avgCpuCores
        if ((priceData as any).avgCpuRam) updateData.cpu_ram = (priceData as any).avgCpuRam
        if ((priceData as any).commonCpuName) updateData.cpu_name = (priceData as any).commonCpuName
        if ((priceData as any).avgDiskSpace) updateData.disk_space = (priceData as any).avgDiskSpace
        if ((priceData as any).avgInetDown) updateData.inet_down = (priceData as any).avgInetDown
        if ((priceData as any).avgInetUp) updateData.inet_up = (priceData as any).avgInetUp
        if ((priceData as any).avgDlperf) updateData.dlperf = (priceData as any).avgDlperf
        if ((priceData as any).maxCudaVersion) updateData.cuda_version = (priceData as any).maxCudaVersion
        if ((priceData as any).avgReliability) updateData.reliability_score = (priceData as any).avgReliability
        if ((priceData as any).providers) updateData.provider_count = (priceData as any).providers
        if ((priceData as any).minPrice) updateData.price_range_min = hourlyToMonthly((priceData as any).minPrice)
        if ((priceData as any).maxPrice) updateData.price_range_max = hourlyToMonthly((priceData as any).maxPrice)
        
        // Track data source
        updateData.data_sources = [source]
        
        // Update GPU with extended data
        const { error: updateError } = await supabase
          .from('gpus')
          .update(updateData)
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
    logger.error('Error updating prices:', error)
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