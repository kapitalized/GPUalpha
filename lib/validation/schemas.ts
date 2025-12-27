import { z } from 'zod'

/**
 * Validation schemas for API requests
 */

// Prediction schemas
export const createPredictionSchema = z.object({
  user_id: z.string().uuid().optional(),
  gpu_id: z.string().uuid(),
  predicted_price: z.number().positive().max(1000000), // Max $1M
  timeframe: z.enum(['7d', '30d', '90d']),
  confidence: z.number().int().min(0).max(100),
  reasoning: z.string().max(1000).optional().nullable(),
})

// Price update schemas
export const priceUpdateSchema = z.object({
  type: z.literal('price_update'),
  gpu_id: z.string().uuid(),
  price: z.number().positive().max(1000000),
  source: z.string().max(50).default('api'),
})

export const newGpuSchema = z.object({
  type: z.literal('new_gpu'),
  gpu_data: z.object({
    model: z.string().min(1).max(100),
    brand: z.string().min(1).max(50),
    msrp: z.number().positive().max(1000000),
    current_price: z.number().positive().max(1000000),
    availability: z.enum(['in_stock', 'limited', 'out_of_stock']).optional(),
    benchmark_score: z.number().int().positive().optional(),
    power_consumption: z.number().int().positive().optional(),
  }),
})

export const priceRoutePostSchema = z.union([priceUpdateSchema, newGpuSchema])

// Query parameter schemas
export const gpuIdQuerySchema = z.object({
  id: z.string().uuid().optional(),
})

export const spotPriceQuerySchema = z.object({
  gpu_id: z.string().uuid(),
})

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
})

export const predictionsQuerySchema = z.object({
  user_id: z.string().uuid().optional(),
})

// Helper function to validate and parse
export function validateAndParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}


