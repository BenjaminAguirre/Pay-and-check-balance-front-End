"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Login from "./login"
import { Loader2 } from "lucide-react"
import ConnectionsPage from "./accountSetting"

export default function LoginAndPayment() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState("")

  const checkLoginStatus = async () => { 
    const storedZelid = localStorage.getItem("zelid")

    if (storedZelid) {
      try {
        const zelidData = JSON.parse(storedZelid)
        const response = await axios.post(
          "https://api.runonflux.io/id/checkprivilege",
          {
            zelid: zelidData.zelid,
            signature: zelidData.signature,
            loginPhrase: zelidData.loginPhrase,
          },
          {
            headers: {
              "Content-Type": "text/plain",
            },
          },
        )

        if (response.data.status === "success") {
          setIsLoggedIn(true)
          setUserId(zelidData.zelid)
        } else {
          localStorage.removeItem("zelid")
        }
      } catch (error) {
        console.error("Error checking login status:", error)
        localStorage.removeItem("zelid")
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    checkLoginStatus()
  }, []) //Fixed: Added empty dependency array to useEffect

  const handleSuccessfulLogin = async () => {
    const storedZelid = localStorage.getItem("zelid")
    if (storedZelid) {
      const zelidData = JSON.parse(storedZelid)
      setUserId(zelidData.zelid)
      setIsLoggedIn(true)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return <Login onSuccessfulLogin={handleSuccessfulLogin} />
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-col items-center justify-center p-3">
       <ConnectionsPage/>
      </div>
    </div>
  )
}

