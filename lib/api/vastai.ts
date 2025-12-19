/**
 * Vast.ai API Integration
 * Fetches GPU pricing from Vast.ai marketplace
 * API Docs: https://vast.ai/api/v0
 */

export interface VastAiOffer {
  id: number
  gpu_name: string
  gpu_ram: number
  num_gpus: number
  dph_total: number // dollars per hour
  reliability2: number
  inet_down: number
  inet_up: number
  cpu_cores_effective: number
  disk_space: number
  verification: string
  dlperf: number
  machine_id: number
  cuda_max_good: number
}

export interface VastAiResponse {
  offers: VastAiOffer[]
}

/**
 * Fetch GPU offers from Vast.ai
 * No API key required for public offers
 */
export async function fetchVastAiPrices(): Promise<VastAiOffer[]> {
  try {
    const response = await fetch('https://console.vast.ai/api/v0/bundles/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Vast.ai API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // The API returns an array of offers directly
    const offers = Array.isArray(data) ? data : data.offers || []
    
    console.log(`[Vast.ai] Fetched ${offers.length} GPU offers`)
    
    return offers
  } catch (error) {
    console.error('[Vast.ai] Failed to fetch prices:', error)
    throw error
  }
}

/**
 * Normalize Vast.ai GPU name to match our database format
 */
export function normalizeVastAiGPUName(gpuName: string): { brand: string; model: string } {
  const name = gpuName.toUpperCase().trim()
  
  // Extract brand
  let brand = 'Unknown'
  if (name.includes('NVIDIA') || name.includes('RTX') || name.includes('GTX') || 
      name.includes('TESLA') || name.includes('QUADRO') || name.includes('A100') ||
      name.includes('H100') || name.includes('V100') || name.includes('A6000') ||
      name.includes('L40')) {
    brand = 'NVIDIA'
  } else if (name.includes('AMD') || name.includes('RADEON') || name.includes('MI')) {
    brand = 'AMD'
  }

  // Extract model
  let model = gpuName
  
  // Remove brand prefix if present
  model = model.replace(/nvidia\s*/i, '')
               .replace(/amd\s*/i, '')
               .replace(/geforce\s*/i, '')
               .replace(/radeon\s*/i, '')
               .trim()
  
  return { brand, model }
}

/**
 * Convert hourly price to monthly estimate
 */
export function hourlyToMonthly(dph: number): number {
  // Approximate 730 hours per month
  return Math.round(dph * 730 * 100) / 100
}

/**
 * Get unique GPU models with average pricing
 */
export function aggregateVastAiPrices(offers: VastAiOffer[]): Map<string, {
  brand: string
  model: string
  avgPricePerHour: number
  avgPricePerMonth: number
  minPrice: number
  maxPrice: number
  count: number
  avgReliability: number
}> {
  const gpuMap = new Map()

  for (const offer of offers) {
    if (!offer.gpu_name || offer.dph_total <= 0) continue

    const { brand, model } = normalizeVastAiGPUName(offer.gpu_name)
    const key = `${brand}|${model}`

    if (!gpuMap.has(key)) {
      gpuMap.set(key, {
        brand,
        model,
        prices: [],
        reliabilities: []
      })
    }

    const entry = gpuMap.get(key)
    entry.prices.push(offer.dph_total)
    if (offer.reliability2) {
      entry.reliabilities.push(offer.reliability2)
    }
  }

  // Calculate averages
  const result = new Map()
  
  for (const [key, data] of gpuMap.entries()) {
    const avgPricePerHour = data.prices.reduce((a: number, b: number) => a + b, 0) / data.prices.length
    const minPrice = Math.min(...data.prices)
    const maxPrice = Math.max(...data.prices)
    const avgReliability = data.reliabilities.length > 0 
      ? data.reliabilities.reduce((a: number, b: number) => a + b, 0) / data.reliabilities.length 
      : 0

    result.set(key, {
      brand: data.brand,
      model: data.model,
      avgPricePerHour: Math.round(avgPricePerHour * 100) / 100,
      avgPricePerMonth: hourlyToMonthly(avgPricePerHour),
      minPrice: Math.round(minPrice * 100) / 100,
      maxPrice: Math.round(maxPrice * 100) / 100,
      count: data.prices.length,
      avgReliability: Math.round(avgReliability * 100) / 100
    })
  }

  return result
}

