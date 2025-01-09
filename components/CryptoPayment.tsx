'use client'

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { generateUniqueId } from "../utils/id";
import { ChevronRight } from 'lucide-react';
import dotenv from "dotenv";


dotenv.config()

type Step = 'select' | 'payment' | 'success';

export default function CryptoPayment() {
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(1);
  const [message, setMessage] = useState<React.ReactNode>('');
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<Step>('select');
  const [transactionId, setTransactionId] = useState<string>('');

  const createTransaction = () => {
    const generatedMessage = generateUniqueId();
    setMessage(generatedMessage);
    const url = `zel:?action=pay&coin=zelcash&address=t3ZDschNfmy78dNzEiBNBc1xB1GdGsuwu14&amount=${amount}&message=${generatedMessage}&icon=https%3A%2F%2Fraw.githubusercontent.com%2Frunonflux%2Fflux%2Fmaster%2Fflux_banner.png`;

    if (typeof window !== 'undefined') {
      const opened = window.open(url, '_blank');
      if (!opened) {
        setError('Unable to open Zel wallet. Please ensure it\'s installed or try copying this link: ' + url);
      }
    } else {
      setError('This function can only be executed in a browser environment.');
    }
  };

  const submitTransaction = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const url = process.env.URL;
      if (!url) {
        throw new Error('API URL is not defined in the environment variables.');
      }
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id: message,
          value: amount.toString(), 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error in transaction');
      }
      
      const result = await response.json();
      
      if (response.status === 200) {
        setTransactionId(result.txId);
        setCurrentStep('success');
      } else {
        setError("Unexpected response: " + response.status);
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'select':
        return (
          <div className="flex flex-col items-center space-y-4">
            <h2 className="text-xl font-semibold text-green-500">Choose a Cryptocurrency</h2>
            <motion.button
              onClick={() => setCurrentStep('payment')}
              className="flex items-center justify-between w-full p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-center space-x-3">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EM7X07Wto1OEqaIt9gZchjiBflwMfb.png"
                  alt="Flux Logo"
                  className="w-8 h-8"
                />
                <span className="text-gray-600">Flux with</span>
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-PliJjIlUKr9SR331Z68VkxfLedA2UO.png"
                  alt="Zelcore Logo"
                  className="w-8 h-8"
                />
                <span className="text-gray-600">Zelcore</span>
              </div>
              <ChevronRight className="w-5 h-5 text-green-500" />
            </motion.button>
          </div>
        );

      case 'payment':
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
            <div className="grid grid-cols-2 gap-3">
              <motion.button 
                onClick={createTransaction} 
                className="p-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                Pay
              </motion.button>
              <motion.button 
                onClick={submitTransaction} 
                className="p-3 bg-green-500 text-white font-medium rounded-xl hover:bg-green-600 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Submit'}
              </motion.button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full p-6 bg-white rounded-2xl">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-700 mb-2">
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
              </div>
            </div>
            <motion.button 
              onClick={() => {
                setShowPopup(false);
                setCurrentStep('select');
              }}
              className="px-6 py-3 bg-gray-100 text-gray-600 font-medium rounded-xl hover:bg-gray-200 transition-colors duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Close
            </motion.button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <motion.button 
        onClick={() => setShowPopup(true)} 
        className="px-6 py-3 bg-green-500 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-lg font-medium"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Pay with Crypto
      </motion.button>
      <AnimatePresence>
        {showPopup && (
          <motion.div 
            className="fixed inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-white p-6 rounded-3xl shadow-lg max-w-sm w-full mx-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              {renderStepContent()}
              {error && (
                <motion.div 
                  className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {error}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

