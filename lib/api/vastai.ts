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
  cpu_ram: number
  cpu_name: string
  disk_space: number
  disk_name: string
  verification: string
  dlperf: number
  dlperf_per_dphtotal: number
  machine_id: number
  cuda_max_good: number
  gpu_frac: number
  min_bid: number
  rentable: boolean
  geolocation: string
  pcie_bw: number
  direct_port_count: number
  external: boolean
  gpu_display_active: boolean
  storage_cost: number
  inet_up_cost: number
  inet_down_cost: number
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
 * Get unique GPU models with average pricing and detailed specs
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
  // Extended specs
  avgCpuCores: number
  avgCpuRam: number
  avgDiskSpace: number
  avgInetDown: number
  avgInetUp: number
  avgDlperf: number
  maxCudaVersion: number
  commonCpuName: string
  providers: number
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
        reliabilities: [],
        cpuCores: [],
        cpuRams: [],
        diskSpaces: [],
        inetDowns: [],
        inetUps: [],
        dlperfs: [],
        cudaVersions: [],
        cpuNames: [],
        machineIds: new Set()
      })
    }

    const entry = gpuMap.get(key)
    entry.prices.push(offer.dph_total)
    
    if (offer.reliability2) entry.reliabilities.push(offer.reliability2)
    if (offer.cpu_cores_effective) entry.cpuCores.push(offer.cpu_cores_effective)
    if (offer.cpu_ram) entry.cpuRams.push(offer.cpu_ram)
    if (offer.disk_space) entry.diskSpaces.push(offer.disk_space)
    if (offer.inet_down) entry.inetDowns.push(offer.inet_down)
    if (offer.inet_up) entry.inetUps.push(offer.inet_up)
    if (offer.dlperf) entry.dlperfs.push(offer.dlperf)
    if (offer.cuda_max_good) entry.cudaVersions.push(offer.cuda_max_good)
    if (offer.cpu_name) entry.cpuNames.push(offer.cpu_name)
    if (offer.machine_id) entry.machineIds.add(offer.machine_id)
  }

  // Calculate averages
  const result = new Map()
  
  for (const [key, data] of gpuMap.entries()) {
    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0
    const avgPricePerHour = avg(data.prices)
    
    // Find most common CPU name
    const cpuNameCounts = data.cpuNames.reduce((acc: any, name: string) => {
      acc[name] = (acc[name] || 0) + 1
      return acc
    }, {})
    const commonCpuName = Object.entries(cpuNameCounts).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'Various'

    result.set(key, {
      brand: data.brand,
      model: data.model,
      avgPricePerHour: Math.round(avgPricePerHour * 100) / 100,
      avgPricePerMonth: hourlyToMonthly(avgPricePerHour),
      minPrice: Math.round(Math.min(...data.prices) * 100) / 100,
      maxPrice: Math.round(Math.max(...data.prices) * 100) / 100,
      count: data.prices.length,
      avgReliability: Math.round(avg(data.reliabilities) * 100) / 100,
      // Extended specs
      avgCpuCores: Math.round(avg(data.cpuCores)),
      avgCpuRam: Math.round(avg(data.cpuRams)),
      avgDiskSpace: Math.round(avg(data.diskSpaces)),
      avgInetDown: Math.round(avg(data.inetDowns)),
      avgInetUp: Math.round(avg(data.inetUps)),
      avgDlperf: Math.round(avg(data.dlperfs) * 10) / 10,
      maxCudaVersion: data.cudaVersions.length > 0 ? Math.max(...data.cudaVersions) : 0,
      commonCpuName,
      providers: data.machineIds.size
    })
  }

  return result
}

