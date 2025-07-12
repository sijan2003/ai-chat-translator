"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import ChatLayout from "@/components/chat/chat-layout"
import { Loader2 } from "lucide-react"

export default function ChatPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // useEffect(() => {
  //   if (!loading && !user) {
  //     router.push("/auth/login")
  //   }
  // }, [user, loading, router])

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <Loader2 className="h-8 w-8 animate-spin" />
  //     </div>
  //   )
  // }
  //
  // if (!user) {
  //   return null
  // }

  return <ChatLayout />
}
