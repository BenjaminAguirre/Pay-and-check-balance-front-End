'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Transaction {
  id: string
  amount: string
  txId: string
  date_: string,
  payment_Method: string
  estado: string
}

interface PaymentHistoryProps {
  transactions: Transaction[]
}

export default function PaymentHistory({ transactions }: PaymentHistoryProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.txId.toLowerCase().includes(search.toLowerCase()) ||
      transaction.id.toLowerCase().includes(search.toLowerCase())

    if (filter === 'all') return matchesSearch
    return matchesSearch && transaction.estado.toLowerCase() === filter.toLowerCase()
  })

  const truncateString = (str: string, num: number) => {
    if (str.length <= num) return str;
    return str.slice(0, num) + '...';
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Payment history</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">FILTER</span>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[120px] h-8 text-sm">
                  <SelectValue placeholder="Show all" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Show all</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-[200px] h-8 pl-8 text-sm"
              />
              <svg
                className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment Method</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.amount}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.estado.toLowerCase() === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {transaction.estado}
                  </span>
                </TableCell>
                <TableCell>
                <a 
                href={`https://explorer.runonflux.io/tx/${transaction.txId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-500 hover:text-green-600 transition-colors duration-200 font-mono text-sm"
              >
                {truncateString(transaction.txId, transaction.txId.length / 4)}
                </a>
                </TableCell>
                <TableCell>{transaction.date_}</TableCell>
                <TableCell>
                  <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-EM7X07Wto1OEqaIt9gZchjiBflwMfb.png" alt={transaction.payment_Method} className="w-6 h-6 inline-block" />
                  {transaction.payment_Method}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

