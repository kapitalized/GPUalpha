export default function AuthError() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-8 max-w-md mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-4">Verification Failed</h1>
          <p className="text-slate-300 mb-6">
            There was an issue verifying your email. The link may have expired or been used already.
          </p>
          <a 
            href="/"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  )
}