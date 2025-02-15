"use client"

import { useState } from "react"
import axios from "axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Image from "next/image"

export default function Deploy() {
  const [isLoading, setIsLoading] = useState(false)
  const [deployStatus, setDeployStatus] = useState<string | null>(null)

  const handleFluxDeploy = async () => {
    setIsLoading(true)
    setDeployStatus(null)
    try {
      const response = await axios.post("http://localhost:3002/flux/deploy")
      console.log(response)
      setDeployStatus("Deployment successful!")
    } catch (error) {
      console.error("Error during deployment:", error)
      setDeployStatus("Deployment failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-[400px] shadow-lg">
        <CardHeader className="space-y-3 text-center pb-8">
          <CardTitle className="text-2xl font-semibold tracking-tight">Deploy on Flux</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-8">
          <Button
            onClick={handleFluxDeploy}
            disabled={isLoading}
            className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Image src="/images.jpg" alt="Flux Logo" width={24} height={24} className="mr-2" />
                Deploy to Flux
              </>
            )}
          </Button>
          {deployStatus && (
            <p className={`text-center ${deployStatus.includes("successful") ? "text-green-600" : "text-red-600"}`}>
              {deployStatus}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

