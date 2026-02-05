/**
 * Application-wide constants
 */

// Refresh intervals (in milliseconds)
export const REFRESH_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes

// Index calculation constants
export const BASE_INDEX = 100
export const HIGH_END_PRICE_THRESHOLD = 1000
export const MID_RANGE_MIN_PRICE = 400
export const MID_RANGE_MAX_PRICE = 1000

// High-end GPU model identifiers
export const HIGH_END_MODELS = ['4090', 'A100', 'H100', '7900 XTX']

// Leaderboard limits
export const LEADERBOARD_LIMIT = 20

// Cache durations (in seconds)
export const CACHE_DURATION_SHORT = 30
export const CACHE_DURATION_MEDIUM = 60
export const CACHE_DURATION_LONG = 300
export const STALE_WHILE_REVALIDATE_MULTIPLIER = 5


