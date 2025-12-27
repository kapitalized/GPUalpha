import { MetadataRoute } from 'next'
import { supabase, GPU } from '../lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gpualpha.com'
  const currentDate = new Date().toISOString().split('T')[0]

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/overview`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gpu-info`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/history`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/analytics`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/predictions`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/info`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // Dynamic GPU pages
  try {
    const { data: gpus, error } = await supabase
      .from('gpus')
      .select('id, updated_at')
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching GPUs for sitemap:', error)
      return staticPages
    }

    const gpuPages: MetadataRoute.Sitemap = (gpus || []).map((gpu: { id: string; updated_at?: string }) => ({
      url: `${baseUrl}/gpu/${gpu.id}`,
      lastModified: gpu.updated_at ? new Date(gpu.updated_at).toISOString().split('T')[0] : currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.6,
    }))

    return [...staticPages, ...gpuPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}



