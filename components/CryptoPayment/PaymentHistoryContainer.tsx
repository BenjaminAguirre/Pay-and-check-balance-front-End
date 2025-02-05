"use client"

import { useEffect, useState } from "react"
import { io } from "socket.io-client"
import PaymentHistory from "./PaymentHistory"

const socket = io("http://localhost:3001" || process.env.URL)

interface Transaction {
  id: string
  amount: string
  txId: string
  date_: string
  payment_Method: string
  estado: string
}

export default function PaymentHistoryContainer() {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    const storedZelid = localStorage.getItem("zelid")
    const zelidData = storedZelid ? JSON.parse(storedZelid) : null
    const zelid = zelidData?.zelid || ""

    if (zelid) {
      socket.emit("requestTransactionHistory", { zelid })
    }

    socket.on("transactionData", handleTransactionData)
    socket.on("transactionError", handleTransactionError)

    return () => {
      socket.off("transactionData", handleTransactionData)
      socket.off("transactionError", handleTransactionError)
    }
  }, [])

  const handleTransactionData = (data: Transaction[]) => {
    setTransactions(data)
  }

  const handleTransactionError = (data: { error: string }) => {
    console.error("Error fetching transactions:", data.error)
  }

  return <PaymentHistory transactions={transactions} />
}
