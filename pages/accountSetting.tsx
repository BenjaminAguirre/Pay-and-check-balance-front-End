"use client"

import { useState, useEffect } from "react"

export default function ConnectionsPage() {
    const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState<boolean>(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [isConnecting, setIsConnecting] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const storedZelid = localStorage.getItem("zelid")
    const zelidData = storedZelid ? JSON.parse(storedZelid) : null
    const zelid = zelidData?.zelid || ""

    useEffect(() => {
        if (typeof window.ethereum !== "undefined") {
            setIsMetaMaskInstalled(true)
        }
    }, [])

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
            console.log(initialized.data.initialized);

            if (initialized.data.initialized === false) {
                console.log("hola");

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
        <div className="p-4 space-y-4">
            <div>
                <div>ZelId</div>
                <h1 className="px-2 py-0.5 text-sm border rounded">{zelid}</h1>
            </div>

            <div>
                <div>Zelcore</div>
                <div className="text-sm text-gray-600">Flux</div>
                <button className="px-2 py-0.5 text-sm border rounded">Connect</button>
            </div>
            <div className="text-sm text-gray-600">Akash</div>
            <div>
                <div className="text-sm text-gray-600">Metamask Cosmos snap</div>

                {!isMetaMaskInstalled ? (
                    <div className="text-sm text-red-500">MetaMask no está instalado</div>
                ) : (
                    <button
                        onClick={connectMetaMaskCosmos}
                        disabled={isConnecting}
                        className="px-2 py-0.5 text-sm border rounded disabled:opacity-50"
                    >
                        {isConnecting ? "Conectando..." : "Connect"}
                    </button>
                )}
                {error && <div className="text-sm text-red-500 mt-1">{error}</div>}
                {userId && <div className="text-sm text-green-500 mt-1">Conectado: {userId}</div>}
            </div>
        </div>
    )
}

