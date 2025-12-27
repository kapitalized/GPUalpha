import { NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '../utils/logger'

/**
 * Validation middleware for API routes
 */

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    const errors = result.error.issues.map(err => ({
      path: err.path.join('.'),
      message: err.message,
    }))
    
    logger.warn('Validation failed:', { errors, data })
    
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Validation failed',
          details: errors,
        },
        { status: 400 }
      ),
    }
  }
  
  return { success: true, data: result.data }
}

/**
 * Validate request body from JSON
 */
export async function validateBody<T>(
  schema: z.ZodSchema<T>,
  request: Request
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json()
    return validateRequest(schema, body)
  } catch (error) {
    logger.error('Failed to parse request body:', error)
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      ),
    }
  }
}

/**
 * Validate query parameters
 */
export function validateQuery<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams
): { success: true; data: T } | { success: false; response: NextResponse } {
  const params: Record<string, string> = {}
  searchParams.forEach((value, key) => {
    params[key] = value
  })
  
  return validateRequest(schema, params)
}

/**
 * Validate path parameters
 */
export function validateParams<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, string | string[]>
): { success: true; data: T } | { success: false; response: NextResponse } {
  return validateRequest(schema, params)
}


