"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { Send, User, Globe } from "lucide-react"
import { format } from "date-fns"

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
]

export default function ChatWindow() {
  const { user } = useAuth()
  const { messages, friends, activeChat, sendMessage } = useChat()
  const [newMessage, setNewMessage] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState(user?.preferredLanguage || "en")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const activeFriend = friends.find((f) => f.id === activeChat)
  const chatMessages = messages.filter(
    (m) =>
      (m.senderId === user?.id && m.receiverId === activeChat) ||
      (m.senderId === activeChat && m.receiverId === user?.id),
  )

  useEffect(() => {
    scrollToBottom()
  }, [chatMessages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat) return

    sendMessage(activeChat, newMessage)
    setNewMessage("")
  }

  if (!activeFriend) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Select a friend to start chatting</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-600" />
              </div>
              {activeFriend.isOnline && (
                <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">{activeFriend.name}</h2>
              <p className="text-sm text-gray-500">{activeFriend.isOnline ? "Online" : "Offline"}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {chatMessages.map((message) => {
          const isOwn = message.senderId === user?.id
          return (
            <div key={message.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md ${isOwn ? "order-2" : "order-1"}`}>
                <Card className={`p-3 ${isOwn ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"}`}>
                  <div className="space-y-2">
                    <p className="text-sm">{message.content}</p>
                    {message.isTranslated && message.translatedContent && (
                      <div className={`text-xs p-2 rounded ${isOwn ? "bg-blue-400 bg-opacity-50" : "bg-gray-200"}`}>
                        <div className="flex items-center space-x-1 mb-1">
                          <Globe className="h-3 w-3" />
                          <span>Translated:</span>
                        </div>
                        <p>{message.translatedContent}</p>
                      </div>
                    )}
                  </div>
                  <p className={`text-xs mt-2 ${isOwn ? "text-blue-100" : "text-gray-500"}`}>
                    {format(new Date(message.timestamp), "HH:mm")}
                  </p>
                </Card>
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  )
}
