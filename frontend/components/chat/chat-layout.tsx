"use client"

import { useState } from "react"
import Sidebar from "./sidebar"
import ChatWindow from "./chat-window"
import { useChat } from "@/contexts/chat-context"

export default function ChatLayout() {
  const { activeChat } = useChat()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col">
        {activeChat ? (
          <ChatWindow />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-white">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome to AI Chat Translator</h2>
              <p className="text-black">Select a friend to start chatting with real-time translation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
