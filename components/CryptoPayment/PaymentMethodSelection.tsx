import { motion } from "framer-motion"
import { ChevronRight } from 'lucide-react'

type PaymentMethod = 'zelcore' | 'ssp'

interface PaymentMethodSelectionProps {
  onSelect: (method: PaymentMethod) => void
}

export default function PaymentMethodSelection({ onSelect }: PaymentMethodSelectionProps) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-xl font-semibold text-green-500">Choose a Payment Method</h2>
      <PaymentMethodButton
        method="zelcore"
        onSelect={onSelect}
        logo1="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EM7X07Wto1OEqaIt9gZchjiBflwMfb.png"
        logo2="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PliJjIlUKr9SR331Z68VkxfLedA2UO.png"
        text1="Flux with"
        text2="Zelcore"
      />
      <PaymentMethodButton
        method="ssp"
        onSelect={onSelect}
        logo1="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EM7X07Wto1OEqaIt9gZchjiBflwMfb.png"
        logo2="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ssp-logo-black-TJarzjgC2Lfi5X0Tx6I8xZurPpzL0B.svg"
        text1="Flux with"
        text2="SSP"
      />
    </div>
  )
}

interface PaymentMethodButtonProps {
  method: PaymentMethod
  onSelect: (method: PaymentMethod) => void
  logo1: string
  logo2: string
  text1: string
  text2: string
}

function PaymentMethodButton({ method, onSelect, logo1, logo2, text1, text2 }: PaymentMethodButtonProps) {
  return (
    <motion.button
      onClick={() => onSelect(method)}
      className="flex items-center justify-between w-full p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center space-x-3">
        <img src={logo1 || "/placeholder.svg"} alt={`${text1} Logo`} className="w-8 h-8" />
        <span className="text-gray-600">{text1}</span>
        <img src={logo2 || "/placeholder.svg"} alt={`${text2} Logo`} className="w-8 h-8" />
        <span className="text-gray-600">{text2}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-green-500" />
    </motion.button>
  )
}

