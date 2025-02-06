"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Image from "next/image"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

interface LoginProps {
  onSuccessfulLogin: () => void
}

export default function Login({ onSuccessfulLogin }: LoginProps) {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [verificationResponse, setVerificationResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)
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
      console.error("Error fetching message:", err)
      setError("Failed to fetch message")
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
    setError("")
    setResponse("")
    setVerificationResponse("")
    try {
      if (typeof window !== "undefined" && window.ssp) {
        const result = await window.ssp.request("sspwid_sign_message", { message: message })
        setResponse(JSON.stringify(result, null, 2))
        const obj = {
          zelid: result.address,
          signature: result.signature,
          loginPhrase: result.message,
        }
        localStorage.setItem("zelid", JSON.stringify(obj))
        const verifyResponse = await axios.post("http://localhost:8000/api/verifyLogin", obj, {
          withCredentials: true,
        })
        console.log(verifyResponse)

        setVerificationResponse(JSON.stringify(verifyResponse.data, null, 2))

        if (verifyResponse.data.data.message === "Successfully logged in") {
          onSuccessfulLogin()
        }
      } else {
        throw new Error("SSP Wallet extension is not available")
      }
    } catch (err) {
      console.error("Error:", err)
      setError("An unknown error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleZelcoreRequest = async () => {
    if (!message) {
      setError("No message available")
      return
    }

    setIsLoading(true)
    try {

      const socketURL = `wss://api.runonflux.io/ws/id/${message}`;

      console.log("Connecting to WebSocket:", socketURL);
      const url = `zel:?action=sign&message=${message}&icon=https%3A%2F%2Fraw.githubusercontent.com%2Frunonflux%2Fflux%2Fmaster%2FzelID.svg&callback=https://api.runonflux.io/id/verifylogin`
      const open = window.open(url, "_blank")
      if (!open) {
        throw new Error("Unable to open Zel wallet. Please ensure it's installed or try copying this link: " + url)
      }

      const zelcoreWebSocket = new WebSocket(socketURL);

      zelcoreWebSocket.onopen = (event) => {
        console.log(event);
      };

      if (zelcoreWebSocket) {
        zelcoreWebSocket.onmessage = async (event) => {
          console.log(event.data);
          // Convertir el mensaje en un objeto de parámetros
          const params = new URLSearchParams(event.data);
          console.log(params);
          

          // Obtener el status
          const status = params.get("status") ?? ""; // Manejar `null`
          console.log("Status:", status);

          // Definir data con un tipo adecuado
          const data: Record<string, string> = {};

          // Extraer los datos anidados
          for (const [key, value] of params.entries()) {
            if (key.startsWith("data[")) {
              const cleanKey = key.replace(/^data\[(.*?)\]$/, "$1");
              data[cleanKey] = decodeURIComponent(value);
            }
          }

          console.log("Parsed Data:", data);

          // Verificar si el status es "success" y si hay datos
          if (status === "success" && Object.keys(data).length > 0) {
            const extractedData = {
              zelid: data.zelid ?? "",   // Manejar `undefined`
              signature: data.signature ?? "",
              loginPhrase: data.loginPhrase ?? ""
            };
            localStorage.setItem("zelid", JSON.stringify(extractedData))
            console.log("Extracted Data:", extractedData);
            const verifyResponse = await axios.post("http://localhost:8000/api/verifyLogin", extractedData, {
              withCredentials: true,
            })
            
            if (verifyResponse.status === 200) {
              onSuccessfulLogin()
            }
          }
        };
      } else {
        console.error("Error: `zelcoreWebSocket` es null o undefined.");
      }
      zelcoreWebSocket.onerror = (error) => console.error("WebSocket Error:", error);
      zelcoreWebSocket.onclose = () => console.log("WebSocket connection closed.");

    } catch (err) {
      console.error("Error:", err);
    }finally {
      setIsLoading(false)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <Card className="w-full max-w-[400px] shadow-lg">
        <CardHeader className="space-y-3 text-center pb-8">
          <CardTitle className="text-2xl font-semibold tracking-tight">Web3 Login</CardTitle>
          <CardDescription className="text-base text-gray-500">Choose your preferred wallet to sign in</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pb-8">
          <div className="space-y-3">
            <Button
              onClick={handleSspRequest}
              disabled={isLoading || !message}
              variant="outline"
              className="w-full h-12 text-base font-medium border-2 hover:bg-gray-50 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ssp-logo-white-4JUiplWpSEhBnbmXPV88Tk6C8ExvlR.svg"
                  alt="SSP Wallet Logo"
                  width={24}
                  height={24}
                  className="mr-3"
                />
              )}
              Login with SSP Wallet
            </Button>

            <Button
              onClick={handleZelcoreRequest}
              disabled={isLoading || !message}
              variant="outline"
              className="w-full h-12 text-base font-medium border-2 hover:bg-gray-50 transition-colors"
            >
              {isLoading ? (
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
              ) : (
                <Image src="/unnamed.png" alt="Zelcore Wallet Logo" width={24} height={24} className="mr-3" />
              )}
              Login with Zelcore
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {(response || verificationResponse) && (
            <div className="mt-6 space-y-4">
              {response && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">SSP Response:</h3>
                  <pre className="p-3 bg-gray-50 rounded-lg overflow-x-auto text-sm">{response}</pre>
                </div>
              )}
              {verificationResponse && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700">Verification Response:</h3>
                  <pre className="p-3 bg-gray-50 rounded-lg overflow-x-auto text-sm">{verificationResponse}</pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

