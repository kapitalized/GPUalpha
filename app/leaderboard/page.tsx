import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

// Sample leaderboard data - replace with real data later
const leaderboardData = [
  { rank: 1, username: "GPUOracle", predictions: 147, accuracy: 89.2, points: 2847, streak: 12 },
  { rank: 2, username: "ChipTrader", predictions: 203, accuracy: 86.7, points: 2634, streak: 8 },
  { rank: 3, username: "AlphaGamer", predictions: 89, accuracy: 91.0, points: 2456, streak: 15 },
  { rank: 4, username: "TechPredictor", predictions: 156, accuracy: 84.6, points: 2298, streak: 5 },
  { rank: 5, username: "MarketMaven", predictions: 178, accuracy: 83.1, points: 2187, streak: 7 },
  { rank: 6, username: "PriceWatcher", predictions: 134, accuracy: 87.3, points: 2089, streak: 3 },
  { rank: 7, username: "GPUGuru", predictions: 98, accuracy: 88.8, points: 1967, streak: 9 },
  { rank: 8, username: "DataDriven", predictions: 167, accuracy: 81.4, points: 1845, streak: 4 },
]

export default function Leaderboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <a href="/" className="text-3xl font-bold text-white">⚡ GPUAlpha</a>
            </div>
            <div className="flex space-x-4">
              <Button variant="ghost">Dashboard</Button>
              <Button variant="ghost">Predictions</Button>
              <Button variant="outline">Sign In</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">🏆 Leaderboard</h1>
          <p className="text-xl text-slate-300 mb-8">Top GPU prediction experts</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-400">2,847</div>
              <div className="text-slate-400 text-sm">Total Predictions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-400">156</div>
              <div className="text-slate-400 text-sm">Active Predictors</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-400">73.2%</div>
              <div className="text-slate-400 text-sm">Avg Accuracy</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-yellow-400">15</div>
              <div className="text-slate-400 text-sm">Best Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle>🎯 Top Predictors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 text-left">
                    <th className="pb-3 text-slate-400 font-medium">Rank</th>
                    <th className="pb-3 text-slate-400 font-medium">Predictor</th>
                    <th className="pb-3 text-slate-400 font-medium">Predictions</th>
                    <th className="pb-3 text-slate-400 font-medium">Accuracy</th>
                    <th className="pb-3 text-slate-400 font-medium">Points</th>
                    <th className="pb-3 text-slate-400 font-medium">Streak</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((user) => (
                    <tr key={user.rank} className="border-b border-slate-800 hover:bg-slate-800/50">
                      <td className="py-4">
                        <div className="flex items-center">
                          {user.rank <= 3 && (
                            <span className="mr-2">
                              {user.rank === 1 && "🥇"}
                              {user.rank === 2 && "🥈"}
                              {user.rank === 3 && "🥉"}
                            </span>
                          )}
                          <span className="text-white font-semibold">#{user.rank}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-white font-medium">{user.username}</span>
                      </td>
                      <td className="py-4 text-slate-300">{user.predictions}</td>
                      <td className="py-4">
                        <span className={`font-semibold ${
                          user.accuracy >= 85 ? 'text-green-400' : 
                          user.accuracy >= 75 ? 'text-yellow-400' : 
                          'text-red-400'
                        }`}>
                          {user.accuracy}%
                        </span>
                      </td>
                      <td className="py-4">
                        <span className="text-blue-400 font-semibold">{user.points.toLocaleString()}</span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center">
                          <span className="text-orange-400 font-medium">{user.streak}</span>
                          {user.streak >= 10 && <span className="ml-1">🔥</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Join CTA */}
        <div className="text-center mt-12">
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-white mb-4">Want to Join the Leaderboard?</h3>
              <p className="text-slate-300 mb-6">Start making predictions and climb the rankings</p>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600">
                Start Predicting 🎯
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
