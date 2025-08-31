export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">⚡ GPUAlpha</span>
            </div>
            <button className="text-white border border-slate-700 px-4 py-2 rounded-lg hover:bg-slate-800">
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm mb-8">
            🚀 Coming Soon
          </div>
          <h1 className="text-6xl font-bold text-white mb-6">
            Generate Alpha in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">GPU Markets</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
            The world's first gamified GPU prediction marketplace. Get real-time pricing intelligence, 
            supply chain insights, and market forecasts to gain the alpha edge in graphics card markets.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg text-lg font-semibold">
            Join Waitlist
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-white text-xl font-semibold mb-2">Real-Time Intelligence</h3>
            <p className="text-slate-400">
              Live GPU pricing, availability tracking, and supply chain monitoring across 50+ retailers globally.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-white text-xl font-semibold mb-2">Predictive Analytics</h3>
            <p className="text-slate-400">
              AI-powered forecasting for GPU prices, demand cycles, and market opportunities.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl">
            <div className="text-4xl mb-4">🎮</div>
            <h3 className="text-white text-xl font-semibold mb-2">Gamified Predictions</h3>
            <p className="text-slate-400">
              Compete with other users, build reputation, and earn rewards for accurate market predictions.
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-white text-xl font-semibold mb-2">Fractional GPU Access</h3>
            <p className="text-slate-400">
              Buy fractional shares in high-end GPUs and get access to computing power without full ownership costs.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
