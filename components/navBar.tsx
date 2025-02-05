"use client"

import { useState, useEffect } from "react"
import { User } from "lucide-react"

interface NavbarProps {
  zelid: string
}

export default function Navbar({ zelid }: NavbarProps) {

  return (
    <nav className="w-full bg-white border-b border-gray-100">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex justify-between h-14">
          <div className="flex-shrink-0 flex items-center">
            <span className="text-base font-medium text-gray-900">Pay with Flux</span>
          </div>
          <div className="flex items-center space-x-1">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-600">User: {zelid}</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

