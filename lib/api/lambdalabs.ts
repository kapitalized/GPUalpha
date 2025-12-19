/**
 * Lambda Labs API Integration
 * Fetches GPU instance pricing from Lambda Cloud
 * API Docs: https://cloud.lambdalabs.com/api/v1/docs
 */

export interface LambdaInstanceType {
  instance_type_name: string
  description: string
  price_cents_per_hour: number
  specs: {
    vcpus: number
    memory_gib: number
    storage_gib: number
  }
  regions: Array<{
    name: string
    description: string
  }>
}

export interface LambdaResponse {
  data: {
    [key: string]: LambdaInstanceType
  }
}

/**
 * Fetch GPU instance types from Lambda Labs
 * Requires API key in environment: LAMBDA_API_KEY
 */
export async function fetchLambdaLabsPrices(): Promise<LambdaInstanceType[]> {
  const apiKey = process.env.LAMBDA_API_KEY

  if (!apiKey) {
    console.warn('[Lambda Labs] API key not configured, skipping...')
    return []
  }

  try {
    const response = await fetch('https://cloud.lambdalabs.com/api/v1/instance-types', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json',
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error(`Lambda Labs API error: ${response.status} ${response.statusText}`)
    }

    const result: LambdaResponse = await response.json()
    
    // Convert object to array
    const instances = Object.values(result.data || {})
    
    console.log(`[Lambda Labs] Fetched ${instances.length} instance types`)
    
    return instances
  } catch (error) {
    console.error('[Lambda Labs] Failed to fetch prices:', error)
    throw error
  }
}

/**
 * Extract GPU information from Lambda instance type name
 * Examples: "gpu_1x_a100", "gpu_8x_v100", "gpu_1x_rtx6000"
 */
export function parseLambdaInstanceName(instanceName: string): { 
  brand: string
  model: string
  count: number
} | null {
  const name = instanceName.toLowerCase()
  
  // Extract GPU count
  const countMatch = name.match(/(\d+)x/)
  const count = countMatch ? parseInt(countMatch[1]) : 1
  
  // Determine brand and model
  let brand = 'NVIDIA' // Lambda primarily offers NVIDIA GPUs
  let model = 'Unknown'
  
  if (name.includes('a100')) {
    model = 'A100'
  } else if (name.includes('a6000')) {
    model = 'A6000'
  } else if (name.includes('a10')) {
    model = 'A10'
  } else if (name.includes('v100')) {
    model = 'V100'
  } else if (name.includes('rtx6000')) {
    model = 'RTX 6000'
  } else if (name.includes('h100')) {
    model = 'H100'
  } else if (name.includes('rtx')) {
    const rtxMatch = name.match(/rtx\s*(\d+)/)
    if (rtxMatch) {
      model = `RTX ${rtxMatch[1]}`
    }
  } else {
    return null // Unknown GPU type
  }
  
  return { brand, model, count }
}

/**
 * Convert cents per hour to dollars per month
 */
export function centsPerHourToMonthly(centsPerHour: number): number {
  const dollarsPerHour = centsPerHour / 100
  // 730 hours per month average
  return Math.round(dollarsPerHour * 730 * 100) / 100
}

/**
 * Aggregate Lambda Labs pricing by GPU model
 */
export function aggregateLambdaPrices(instances: LambdaInstanceType[]): Map<string, {
  brand: string
  model: string
  pricePerHour: number
  pricePerMonth: number
  instanceType: string
  vcpus: number
  memoryGib: number
  regions: number
}> {
  const gpuMap = new Map()

  for (const instance of instances) {
    const gpuInfo = parseLambdaInstanceName(instance.instance_type_name)
    
    if (!gpuInfo) continue

    const key = `${gpuInfo.brand}|${gpuInfo.model}`
    const pricePerHour = instance.price_cents_per_hour / 100
    const pricePerMonth = centsPerHourToMonthly(instance.price_cents_per_hour)

    // If multiple configs exist for same GPU, keep the cheapest
    if (!gpuMap.has(key) || gpuMap.get(key).pricePerMonth > pricePerMonth) {
      gpuMap.set(key, {
        brand: gpuInfo.brand,
        model: gpuInfo.model,
        pricePerHour: Math.round(pricePerHour * 100) / 100,
        pricePerMonth,
        instanceType: instance.instance_type_name,
        vcpus: instance.specs.vcpus,
        memoryGib: instance.specs.memory_gib,
        regions: instance.regions?.length || 0
      })
    }
  }

  return gpuMap
}

