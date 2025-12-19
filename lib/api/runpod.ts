/**
 * RunPod API Integration
 * Fetches GPU pricing from RunPod GraphQL API
 * API Docs: https://docs.runpod.io/graphql-api
 */

export interface RunPodGpuType {
  id: string
  displayName: string
  memoryInGb: number
  secureCloud: boolean
  communityCloud: boolean
  securePrice: number
  communityPrice: number
  oneMonthPrice?: number
  threeMonthPrice?: number
  lowestPrice: {
    minimumBidPrice: number
    uninterruptablePrice: number
  }
}

export interface RunPodResponse {
  data: {
    gpuTypes: RunPodGpuType[]
  }
}

/**
 * Fetch GPU types from RunPod GraphQL API
 * Requires API key in environment: RUNPOD_API_KEY
 */
export async function fetchRunPodPrices(): Promise<RunPodGpuType[]> {
  const apiKey = process.env.RUNPOD_API_KEY

  if (!apiKey) {
    console.warn('[RunPod] API key not configured, skipping...')
    return []
  }

  const query = `
    query GpuTypes {
      gpuTypes {
        id
        displayName
        memoryInGb
        secureCloud
        communityCloud
        securePrice
        communityPrice
        lowestPrice {
          minimumBidPrice
          uninterruptablePrice
        }
      }
    }
  `

  try {
    const response = await fetch('https://api.runpod.io/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ query }),
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`RunPod API error: ${response.status} ${response.statusText}`)
    }

    const result: RunPodResponse = await response.json()
    const gpuTypes = result.data?.gpuTypes || []
    
    console.log(`[RunPod] Fetched ${gpuTypes.length} GPU types`)
    
    return gpuTypes
  } catch (error) {
    console.error('[RunPod] Failed to fetch prices:', error)
    throw error
  }
}

/**
 * Parse RunPod GPU display name to extract brand and model
 * Examples: "NVIDIA RTX 4090", "NVIDIA A100 80GB", "RTX 3090"
 */
export function parseRunPodGpuName(displayName: string): { 
  brand: string
  model: string
} | null {
  const name = displayName.toUpperCase().trim()
  
  let brand = 'NVIDIA' // RunPod primarily offers NVIDIA GPUs
  let model = displayName.trim()
  
  // Remove brand prefix if present
  model = model.replace(/NVIDIA\s*/i, '')
               .replace(/AMD\s*/i, '')
               .trim()
  
  // Extract specific model patterns
  if (name.includes('A100')) {
    model = name.includes('80GB') ? 'A100 80GB' : name.includes('40GB') ? 'A100 40GB' : 'A100'
  } else if (name.includes('H100')) {
    model = name.includes('80GB') ? 'H100 80GB' : 'H100'
  } else if (name.includes('A6000')) {
    model = 'A6000'
  } else if (name.includes('A40')) {
    model = 'A40'
  } else if (name.includes('V100')) {
    model = 'V100'
  } else if (name.includes('RTX')) {
    const rtxMatch = name.match(/RTX\s*(\d+\s*(?:TI)?)/i)
    if (rtxMatch) {
      model = `RTX ${rtxMatch[1].trim()}`
    }
  } else if (name.includes('L40')) {
    model = 'L40'
  } else if (name.includes('L4')) {
    model = 'L4'
  }
  
  if (name.includes('AMD')) {
    brand = 'AMD'
  }
  
  return { brand, model }
}

/**
 * Convert hourly price to monthly estimate
 */
export function hourlyToMonthly(hourlyPrice: number): number {
  // 730 hours per month average
  return Math.round(hourlyPrice * 730 * 100) / 100
}

/**
 * Aggregate RunPod GPU pricing
 */
export function aggregateRunPodPrices(gpuTypes: RunPodGpuType[]): Map<string, {
  brand: string
  model: string
  pricePerHour: number
  pricePerMonth: number
  memoryInGb: number
  secureCloud: boolean
  communityCloud: boolean
  minimumBidPrice?: number
}> {
  const gpuMap = new Map()

  for (const gpu of gpuTypes) {
    const gpuInfo = parseRunPodGpuName(gpu.displayName)
    
    if (!gpuInfo) continue

    const key = `${gpuInfo.brand}|${gpuInfo.model}`
    
    // Use the lowest available price (community cloud or secure cloud)
    let pricePerHour = 0
    
    if (gpu.lowestPrice?.minimumBidPrice > 0) {
      pricePerHour = gpu.lowestPrice.minimumBidPrice
    } else if (gpu.communityPrice > 0) {
      pricePerHour = gpu.communityPrice
    } else if (gpu.securePrice > 0) {
      pricePerHour = gpu.securePrice
    } else if (gpu.lowestPrice?.uninterruptablePrice > 0) {
      pricePerHour = gpu.lowestPrice.uninterruptablePrice
    }
    
    if (pricePerHour <= 0) continue
    
    const pricePerMonth = hourlyToMonthly(pricePerHour)

    // If already exists, keep the cheaper option
    if (!gpuMap.has(key) || gpuMap.get(key).pricePerMonth > pricePerMonth) {
      gpuMap.set(key, {
        brand: gpuInfo.brand,
        model: gpuInfo.model,
        pricePerHour: Math.round(pricePerHour * 100) / 100,
        pricePerMonth,
        memoryInGb: gpu.memoryInGb,
        secureCloud: gpu.secureCloud,
        communityCloud: gpu.communityCloud,
        minimumBidPrice: gpu.lowestPrice?.minimumBidPrice
      })
    }
  }

  return gpuMap
}

