import { motion } from "framer-motion"
import { useState } from "react"
import axios from "axios"
interface PaymentFormProps {
  amount: number
  setAmount: (amount: number) => void
  onPayment: () => void
  isLoading: boolean
}

export default function PaymentForm({ amount, setAmount, onPayment, isLoading }: PaymentFormProps) {
  const [fluxPrice, setFluxPrice] = useState<number | null>(null)
  const [error, setError] = useState("")

  const getFluxPrice = async() =>{
    try {
      const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=flux&x_cg_demo_api_key=CG-RQncGHBskvoYNYQzYyPLajQL")
      const data = await response.json()
      const price = data[0].current_price
      setFluxPrice(price)
    } catch (error) {
    // const [error, setError] = useState("")  
    }
  }
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center text-gray-700">Enter Amount</h2>
      <div className="relative">
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(Number(e.target.value))}
          min="1" 
          step="0.01" 
          placeholder="0.00" 
          className="w-full p-4 bg-white border border-gray-200 rounded-xl text-gray-700 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">FLUX</span>
      </div>
      <div className="grid grid-cols-1 justify-items-center gap-3">
        <motion.button 
          onClick={onPayment} 
          className="w-full p-4 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors duration-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isLoading}
        >
          Pay
        </motion.button>
      </div>
    </div>
  )
}

