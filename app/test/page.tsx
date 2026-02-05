/**
 * Minimal test page - no Supabase, no env, no external deps.
 * Use to verify production is serving: https://gpualpha.com/test
 * Safe to delete once 404 is resolved.
 */
export default function TestPage() {
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>GPUalpha test</h1>
      <p>If you see this, the deployment is serving correctly.</p>
      <p><small>{new Date().toISOString()}</small></p>
    </div>
  )
}
