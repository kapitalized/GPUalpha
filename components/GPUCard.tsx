import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"

interface GPU {
  id: string
  model: string
  brand: string
  currentPrice: number
  msrp: number
  availability: string
  predictedPrice?: number
}

interface GPUCardProps {
  gpu: GPU
  onPredict: (gpuId: string) => void
}

export function GPUCard({ gpu, onPredict }: GPUCardProps) {
  const priceChange = ((gpu.currentPrice - gpu.msrp) / gpu.msrp) * 100
  const isOverMSRP = priceChange > 0
  
  return (
    <Card className="hover:bg-slate-800/50 transition-colors">
      <CardHeader>
        <CardTitle className="flex justify-between items-start">
          <div>
            <span className="text-blue-400">{gpu.brand}</span>
            <br />
            {gpu.model}
          </div>
          <div className={`text-sm px-2 py-1 rounded ${
            gpu.availability === 'in_stock' 
              ? 'bg-green-900 text-green-300' 
              : 'bg-red-900 text-red-300'
          }`}>
            {gpu.availability.replace('_', ' ')}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Current Price:</span>
            <span className="text-white font-bold">${gpu.currentPrice}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-400">MSRP:</span>
            <span className="text-slate-300">${gpu.msrp}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-400">vs MSRP:</span>
            <span className={`font-semibold ${isOverMSRP ? 'text-red-400' : 'text-green-400'}`}>
              {isOverMSRP ? '+' : ''}{priceChange.toFixed(1)}%
            </span>
          </div>
          
          {gpu.predictedPrice && (
            <div className="flex justify-between items-center border-t border-slate-700 pt-4">
              <span className="text-slate-400">Community Prediction:</span>
              <span className="text-blue-400 font-semibold">${gpu.predictedPrice}</span>
            </div>
          )}
          
          <div className="flex space-x-2">
            <Button 
              onClick={() => onPredict(gpu.id)}
              className="flex-1"
            >
              Predict 🎯
            </Button>
            <a href={`/gpu/${(gpu as any).slug || gpu.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                Details
              </Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
