import { PredictionModal } from '../components/PredictionModal'

// Add this state
const [selectedGPU, setSelectedGPU] = useState<any>(null)
const [isModalOpen, setIsModalOpen] = useState(false)

// Update handlePredict function
const handlePredict = (gpuId: string) => {
  const gpu = sampleGPUs.find(g => g.id === gpuId)
  setSelectedGPU(gpu)
  setIsModalOpen(true)
}

const handlePredictionSubmit = (prediction: any) => {
  console.log('Prediction submitted:', prediction)
  // TODO: Save to database
  alert('Prediction saved! 🎯')
}

// Add before closing </div> of main container
<PredictionModal 
  gpu={selectedGPU}
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handlePredictionSubmit}
/>
