"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import { io, type Socket } from "socket.io-client"

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  translatedContent?: string
  timestamp: Date
  isTranslated: boolean
}

interface Friend {
  id: string
  name: string
  email: string
  avatar?: string
  isOnline: boolean
  lastSeen?: Date
}

interface FriendRequest {
  id: string
  senderId: string
  receiverId: string
  senderName: string
  senderEmail: string
  status: "pending" | "accepted" | "rejected"
  createdAt: Date
}

interface ChatContextType {
  messages: Message[]
  friends: Friend[]
  friendRequests: FriendRequest[]
  activeChat: string | null
  socket: Socket | null
  sendMessage: (receiverId: string, content: string) => void
  setActiveChat: (friendId: string | null) => void
  sendFriendRequest: (email: string) => Promise<boolean>
  acceptFriendRequest: (requestId: string) => Promise<boolean>
  rejectFriendRequest: (requestId: string) => Promise<boolean>
  loadMessages: (friendId: string) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
        auth: {
          token: localStorage.getItem("token"),
        },
      })

      newSocket.on("connect", () => {
        console.log("Connected to socket server")
      })

      newSocket.on("message", (message: Message) => {
        setMessages((prev) => [...prev, message])
      })

      newSocket.on("friendsUpdate", (updatedFriends: Friend[]) => {
        setFriends(updatedFriends)
      })

      newSocket.on("friendRequestUpdate", (requests: FriendRequest[]) => {
        setFriendRequests(requests)
      })

      setSocket(newSocket)
      loadFriends()
      loadFriendRequests()

      return () => {
        newSocket.close()
      }
    }
  }, [user])

  const loadFriends = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/friends", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const friendsData = await response.json()
        setFriends(friendsData)
      }
    } catch (error) {
      console.error("Failed to load friends:", error)
    }
  }

  const loadFriendRequests = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/friends/requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const requestsData = await response.json()
        setFriendRequests(requestsData)
      }
    } catch (error) {
      console.error("Failed to load friend requests:", error)
    }
  }

  const loadMessages = async (friendId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/messages/${friendId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const messagesData = await response.json()
        setMessages(messagesData)
      }
    } catch (error) {
      console.error("Failed to load messages:", error)
    }
  }

  const sendMessage = (receiverId: string, content: string) => {
    if (socket && user) {
      const message = {
        senderId: user.id,
        receiverId,
        content,
        timestamp: new Date(),
      }
      socket.emit("sendMessage", message)
    }
  }

  const sendFriendRequest = async (email: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      })
      return response.ok
    } catch (error) {
      console.error("Failed to send friend request:", error)
      return false
    }
  }

  const acceptFriendRequest = async (requestId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/friends/requests/${requestId}/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        loadFriends()
        loadFriendRequests()
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to accept friend request:", error)
      return false
    }
  }

  const rejectFriendRequest = async (requestId: string): Promise<boolean> => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/friends/requests/${requestId}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        loadFriendRequests()
        return true
      }
      return false
    } catch (error) {
      console.error("Failed to reject friend request:", error)
      return false
    }
  }

  return (
    <ChatContext.Provider
      value={{
        messages,
        friends,
        friendRequests,
        activeChat,
        socket,
        sendMessage,
        setActiveChat,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        loadMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
