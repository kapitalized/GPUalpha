import { Button } from './ui/button'

export function Navigation() {
  return (
    <header className="border-b border-slate-800 sticky top-0 bg-slate-950/80 backdrop-blur-md z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <a href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-white">⚡ GPUAlpha</span>
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">BETA</span>
            </a>
            <nav className="hidden md:flex space-x-6">
              <a href="/" className="text-slate-300 hover:text-white transition-colors">Dashboard</a>
              <a href="/leaderboard" className="text-slate-300 hover:text-white transition-colors">Leaderboard</a>
              <a href="/predictions" className="text-slate-300 hover:text-white transition-colors">My Predictions</a>
            </nav>
          </div>
          <div className="flex space-x-3">
            <Button variant="ghost" size="sm">Sign In</Button>
            <Button size="sm">Get Alpha Access</Button>
          </div>
        </div>
      </div>
    </header>
  )
}
