import { motion } from "framer-motion"

interface TransactionSuccessProps {
  transactionId: string
  amount: number
  onClose: () => void
}

export default function TransactionSuccess({ transactionId, amount, onClose }: TransactionSuccessProps) {
  return (
    <div className="flex flex-col items-center space-y-4 p-6">
      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
        <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-xl font-medium text-gray-900">
        Transaction Successful
      </h2>
      <a 
        href={`https://explorer.runonflux.io/tx/${transactionId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-500 hover:text-green-600 transition-colors duration-200"
      >
        View Transaction
      </a>
      {/* <div className="w-full flex items-center justify-between bg-gray-50 p-3 rounded-lg text-sm"> */}
        {/* <span className="text-gray-600 font-medium truncate flex-1">{transactionId}</span> */}
        {/* <span className="text-gray-900 font-medium ml-2">{amount} FLU</span> */}
      {/* </div> */}
      <button 
        onClick={onClose}
        className="w-full mt-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
      >
        Close
      </button>
    </div>
  )
}

