"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ethers } from "ethers"
import axios from "axios"

const MetaMaskConnect: React.FC = () => {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false)
  const [message, setMessage] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setIsMetaMaskInstalled(true)
      fetchMessage()
    }
  }, [])

  const fetchMessage = async () => {
    setIsLoading(true)
    setError("")
    try {
      const result = await axios.get("https://api.runonflux.io/id/loginphrase")
      setMessage(result.data.data)
      console.log(result.data.data)
    } catch (err) {
      console.error("Error fetching message:", err)
      setError("Failed to fetch message")
    } finally {
      setIsLoading(false)
    }
  }



  const connectMetaMaskCosmos = async () => {
    if (!window.ethereum) {
      setError("MetaMask no está instalado.")
      return
    }
    setIsConnecting(true)
    setError(null)
    try {
      console.log("Iniciando conexión con MetaMask Cosmos...")

      const snaps = await window.ethereum.request({ method: "wallet_getSnaps" })
      console.log("Snaps instalados:", snaps)

      const cosmosSnapId = "npm:@cosmsnap/snap"
      const isInstalled = Object.keys(snaps).includes(cosmosSnapId)
      console.log("¿Cosmos Snap está instalado?", isInstalled)

      if (!isInstalled) {
        console.log("Instalando Cosmos Snap...")
        const installResult = await window.ethereum.request({
          method: "wallet_requestSnaps",
          params: {
            [cosmosSnapId]: { version: "^0.1.0" },
          },
        })
        console.log("Resultado de la instalación:", installResult)
      }

      console.log("Inicializando Cosmos Snap...")
      const initialized = await window.ethereum.request({
        method: "wallet_invokeSnap",
        params: {
          snapId: cosmosSnapId,
          request: { method: "initialized" },
        },
      })
      console.log("¿Cosmos Snap inicializado?", initialized)
      if(!initialized){
        await new Promise((resolve) => setTimeout(resolve, 10000))
      }
      if (initialized) {
        console.log("Obteniendo dirección de Akash...")
        const response = await window.ethereum.request({
          method: "wallet_invokeSnap",
          params: {
            snapId: cosmosSnapId,
            request: {
              method: "getChainAddress",
              params: { chain_id: "akashnet-2" },
            },
          },
        })
        console.log("Respuesta de getChainAddress:", response)

        if (response) {
          setUserId(response.data.address.address)
          console.log("User ID establecido:", response.data.address)
        } 
      } else {
        throw new Error("No se pudo inicializar Cosmos Snap")
      }
    } catch (error) {
      console.error("Error detallado al conectar MetaMask Cosmos:", error)
      setError(`Error al conectar con MetaMask Cosmos: ${error}`)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-bold mb-4">Conexión MetaMask</h1>
      {!isMetaMaskInstalled ? (
        <p className="text-red-500">MetaMask no está instalado. Por favor, instálalo para continuar.</p>
      ) : (
        <>
          {!userId ? (
            <>
              <button
                onClick={connectMetaMaskCosmos}
                disabled={isConnecting}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {isConnecting ? "Conectando..." : "Conectar MetaMask Akash"}
              </button>
            </>
          ) : (
            <div>
              <p className="text-green-500 mb-2">Conectado con éxito!</p>
              <p className="break-all">User ID: {userId}</p>
            </div>
          )}
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </>
      )}
    </div>
  )
}

export default MetaMaskConnect

