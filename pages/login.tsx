"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Image from "next/image"
import { Loader2 } from "lucide-react"
import { ethers } from "ethers"

interface LoginProps {
  onSuccessfulLogin: () => void
}

export default function Web3Login({ onSuccessfulLogin }: LoginProps) {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeWallet, setActiveWallet] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchMessage()
  }, [])

  const fetchMessage = async () => {
    setIsLoading(true)
    setError("")
    try {
      const result = await axios.get("https://api.runonflux.io/id/loginphrase")
      setMessage(result.data.data)
    } catch (err) {
      setError("Failed to fetch login message. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSspRequest = async () => {
    if (!message) {
      setError("No message available")
      return
    }

    setIsLoading(true)
    setActiveWallet("ssp")
    setError("")

    try {
      if (typeof window !== "undefined" && window.ssp) {
        const result = await window.ssp.request("sspwid_sign_message", { message })
        const obj = {
          zelid: result.address,
          signature: result.signature,
          loginPhrase: result.message,
        }

        localStorage.setItem("zelid", JSON.stringify(obj))
        const verifyResponse = await axios.post("http://localhost:8000/api/verifyLogin", obj, { withCredentials: true })

        if (verifyResponse.data.data.message === "Successfully logged in") {
          onSuccessfulLogin()
        }
      } else {
        throw new Error("SSP Wallet extension is not installed")
      }
    } catch (err) {
      setError("Failed to connect with SSP Wallet. Please ensure the extension is installed and try again.")
    } finally {
      setIsLoading(false)
      setActiveWallet(null)
    }
  }

  const handleMetamaskRequest = async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed")
      return
    }

    setIsLoading(true)
    setActiveWallet("metamask")
    setError("")

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const accounts = await provider.send("eth_requestAccounts", [])
      const address = accounts[0]
      const signature = await signer.signMessage(message)

      const obj = {
        zelid: address,
        signature,
        loginPhrase: message,
      }

      localStorage.setItem("zelid", JSON.stringify(obj))
      const verifyResponse = await axios.post("http://localhost:8000/api/verifyLogin", obj, { withCredentials: true })

      if (verifyResponse.status === 200) {
        onSuccessfulLogin()
      }
    } catch (err) {
      setError("Failed to connect with MetaMask. Please try again.")
    } finally {
      setIsLoading(false)
      setActiveWallet(null)
    }
  }

  const handleZelcoreRequest = async () => {
    if (!message) {
      setError("No message available")
      return
    }

    setIsLoading(true)
    setActiveWallet("zelcore")
    setError("")

    try {
      const socketURL = `wss://api.runonflux.io/ws/id/${message}`
      const url = `zel:?action=sign&message=${message}&icon=https%3A%2F%2Fraw.githubusercontent.com%2Frunonflux%2Fflux%2Fmaster%2FzelID.svg&callback=https://api.runonflux.io/id/verifylogin`

      window.open(url, "_blank")
      const zelcoreWebSocket = new WebSocket(socketURL)

      zelcoreWebSocket.onmessage = async (event) => {
        const params = new URLSearchParams(event.data)
        const status = params.get("status") ?? ""
        const data: Record<string, string> = {}

        for (const [key, value] of params.entries()) {
          if (key.startsWith("data[")) {
            const cleanKey = key.replace(/^data\[(.*?)\]$/, "$1")
            data[cleanKey] = decodeURIComponent(value)
          }
        }

        if (status === "success" && Object.keys(data).length > 0) {
          const extractedData = {
            zelid: data.zelid ?? "",
            signature: data.signature ?? "",
            loginPhrase: data.loginPhrase ?? "",
          }

          localStorage.setItem("zelid", JSON.stringify(extractedData))
          const verifyResponse = await axios.post("https://api.runonflux.io/api/verifyLogin", extractedData, {
            withCredentials: true,
          })

          if (verifyResponse.status === 200) {
            onSuccessfulLogin()
          }
        }
      }
    } catch (err) {
      setError("Failed to connect with Zelcore. Please try again.")
    } finally {
      setIsLoading(false)
      setActiveWallet(null)
    }
  }

  const wallets = [
    {
      id: "ssp",
      name: "SSP Wallet",
      logo: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ssp-logo-white-4JUiplWpSEhBnbmXPV88Tk6C8ExvlR.svg",
      handler: handleSspRequest,
    },
    {
      id: "zelcore",
      name: "Zelcore",
      logo: "/unnamed.png",
      handler: handleZelcoreRequest,
    },
    {
      id: "metamask",
      name: "MetaMask",
      logo: "/images.png",
      handler: handleMetamaskRequest,
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">Web3 Login</h1>
          <p className="text-gray-500">Connect your wallet to continue</p>
        </div>

        <div className="space-y-4">
          {wallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={wallet.handler}
              disabled={isLoading || !message}
              className={`w-full px-4 py-3 flex items-center justify-center text-gray-700 bg-white border-2 border-gray-200 rounded-xl font-medium text-base transition-all duration-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                activeWallet === wallet.id ? "border-blue-500 bg-blue-50" : ""
              }`}
            >
              {isLoading && activeWallet === wallet.id ? (
                <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              ) : (
                <Image
                  src={wallet.logo || "/placeholder.svg"}
                  alt={`${wallet.name} Logo`}
                  width={24}
                  height={24}
                  className="mr-3"
                />
              )}
              Login with {wallet.name}
            </button>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

