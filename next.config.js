// Sentry configuration (optional - only needed for source map uploads)
const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile Supabase package
  transpilePackages: ['@supabase/supabase-js'],
  
  // Note: Request size limits are enforced at the route level
  // See lib/middleware/requestSizeLimit.ts for implementation
}

// Only wrap with Sentry if org/project are configured (for source maps)
// Error tracking works without this - it's just for better stack traces
if (process.env.SENTRY_ORG && process.env.SENTRY_PROJECT) {
  module.exports = withSentryConfig(
    nextConfig,
    {
      silent: true,
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
    },
    {
      widenClientFileUpload: true,
      transpileClientSDK: true,
      hideSourceMaps: true,
      disableLogger: true,
    }
  )
} else {
  // Basic config without source map uploads (error tracking still works)
  module.exports = nextConfig
}
