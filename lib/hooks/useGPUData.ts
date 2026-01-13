'use client'

import { useState, useEffect, useCallback } from 'react'

export function useGPUData() {
  const [gpus, setGpus] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGPUs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/prices')
      if (!response.ok) throw new Error('Failed to fetch GPU data')
      
      const data = await response.json()
      setGpus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGPUs()
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchGPUs, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [fetchGPUs])

  return { gpus, loading, error, refetch: fetchGPUs }
}
