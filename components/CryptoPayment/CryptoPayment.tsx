'use client'

import { useState, useEffect } from "react"
import { io } from "socket.io-client"
import { generateUniqueId } from "../../utils/id"
import PaymentMethodSelection from "./PaymentMethodSelection"
import PaymentForm from "./PaymentForm"
import TransactionSuccess from "./TransactionSuccess"
import PaymentHistory from "./PaymentHistory"

type Step = 'select' | 'payment' | 'success'
type PaymentMethod = 'zelcore' | 'ssp'

const socket = io("http://localhost:3001" || process.env.URL)

interface Transaction {
    id: string
    amount: string
    txId: string
    created: string
    payment_Method: string
    estado: string
}

export default function CryptoPayment() {
    const [error, setError] = useState<string | null>(null)
    const [amount, setAmount] = useState<number>(1)
    const [message, setMessage] = useState<string>('')
    const [showPopup, setShowPopup] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [currentStep, setCurrentStep] = useState<Step>('select')
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('zelcore')
    const [transactionId, setTransactionId] = useState<string>('')
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const storedZelid = localStorage.getItem("zelid");
    const zelidData = storedZelid ? JSON.parse(storedZelid) : null;
    const zelid = zelidData?.zelid || "";
    
    useEffect(() => {
        socket.on("transactionResponse", handleTransactionResponse)
        socket.on("transactionData", handleTransactionData)
        socket.on("transactionError", handleTransactionError)
        
        // Solicitar historial de pagos al iniciar sesión
        if (zelid) {
            socket.emit("getTransactions", { zelid })
        }

        return () => {
            socket.off("transactionResponse", handleTransactionResponse)
            socket.off("transactionData", handleTransactionData)
            socket.off("transactionError", handleTransactionError)
        }
    }, [zelid])

    const handleTransactionResponse = (response: any) => {
        setIsLoading(false)
        if (typeof response === "string") {
            setError(response)
        } else {
            const { txId } = response
            setTransactionId(txId)
            setCurrentStep("success")
        }
    }

    const handleTransactionData = (data: Transaction[]) => {
        setIsLoading(false)
        setTransactions(data)
    }

    const handleTransactionError = (data: { error: string }) => {
        setIsLoading(false)
        setError(data.error)
    }

    const handlePayment = async () => {
        setIsLoading(true)
        setError(null)
        const generatedMessage = generateUniqueId()
        setMessage(generatedMessage)

        try {
            if (selectedMethod === 'ssp') {
                await handleSSPPayment(generatedMessage)
            } else {
                await handleZelcorePayment(generatedMessage)
            }
        } catch (error) {
            setError((error as Error).message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSSPPayment = async (generatedMessage: string) => {
        const response = await window.ssp.request('pay', {
            message: generatedMessage,
            amount: amount.toString(),
            address: 't3ZDschNfmy78dNzEiBNBc1xB1GdGsuwu14',
            chain: 'flux'
        })

        if (response.status === 'SUCCESS' && response.txid) {
            setTransactionId(response.txid)
            setCurrentStep('success')  
            emitTransaction(generatedMessage, amount.toString(), zelid)
        } else {
            throw new Error('Payment failed')
        }
    }

    const handleZelcorePayment = async (generatedMessage: string) => {
        const url = `zel:?action=pay&coin=zelcash&address=t3ZDschNfmy78dNzEiBNBc1xB1GdGsuwu14&amount=${amount}&message=${generatedMessage}&speed=fast&icon=https%3A%2F%2Fraw.githubusercontent.com%2Frunonflux%2Fflux%2Fmaster%2Fflux_banner.png`
        const opened = window.open(url, '_blank')
        emitTransaction(generatedMessage, amount.toString(), zelid)
        if (!opened) {
            throw new Error('Unable to open Zel wallet. Please ensure it\'s installed or try copying this link: ' + url)
        }
    }

    const emitTransaction = (message: string, amount: string, zelid: string) => {
        socket.emit("message", {
            transactionId: message,
            amount,
            zelid
        })
    }

    const renderStepContent = () => {
        switch (currentStep) {
            case 'select':
                return <PaymentMethodSelection onSelect={(method) => {
                    setSelectedMethod(method)
                    setCurrentStep('payment')
                }} />
            case 'payment':
                return <PaymentForm
                    amount={amount}
                    setAmount={setAmount}
                    onPayment={handlePayment}
                    isLoading={isLoading}
                />
            case 'success':
                return <TransactionSuccess
                    transactionId={transactionId}
                    amount={amount}
                    onClose={() => {
                        setShowPopup(false)
                        setCurrentStep('select')
                    }}
                />
        }
    }

    return (
        <div className="justify-center min-h-screen bg-gray-50 p-6">
            <button
                onClick={() => setShowPopup(true)}
                className="px-6 py-3 bg-green-500 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-lg font-medium"
            >
                Pay with Flux
            </button>
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-xl w-[90%] max-w-lg shadow-lg">
                        {renderStepContent()}
                    </div>
                </div>
            )}
          
        </div>
    )
}
