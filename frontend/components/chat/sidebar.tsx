"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useChat } from "@/contexts/chat-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { User, Settings, UserPlus, MessageCircle, Menu, X, Check, UserX } from "lucide-react"
import Link from "next/link"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()
  const {
    friends,
    friendRequests,
    activeChat,
    setActiveChat,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    loadMessages,
  } = useChat()
  const [newFriendEmail, setNewFriendEmail] = useState("")
  const [showAddFriend, setShowAddFriend] = useState(false)
  const { toast } = useToast()

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFriendEmail.trim()) return

    const success = await sendFriendRequest(newFriendEmail)
    if (success) {
      toast({
        title: "Friend Request Sent",
        description: `Friend request sent to ${newFriendEmail}`,
      })
      setNewFriendEmail("")
      setShowAddFriend(false)
    } else {
      toast({
        title: "Failed to Send Request",
        description: "Please check the email and try again",
        variant: "destructive",
      })
    }
  }

  const handleAcceptRequest = async (requestId: string) => {
    const success = await acceptFriendRequest(requestId)
    if (success) {
      toast({
        title: "Friend Request Accepted",
        description: "You are now friends!",
      })
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    const success = await rejectFriendRequest(requestId)
    if (success) {
      toast({
        title: "Friend Request Rejected",
        description: "Request has been rejected",
      })
    }
  }

  const handleChatSelect = (friendId: string) => {
    setActiveChat(friendId)
    loadMessages(friendId)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:relative inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${!isOpen ? "lg:w-0 lg:overflow-hidden" : ""}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{user?.name}</h2>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onToggle} className="lg:hidden">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex space-x-2 mt-3">
              <Link href="/profile" className="flex-1">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => setShowAddFriend(!showAddFriend)}>
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>

            {/* Add Friend Form */}
            {showAddFriend && (
              <form onSubmit={handleAddFriend} className="mt-3 space-y-2">
                <Input
                  type="email"
                  placeholder="Enter friend's email"
                  value={newFriendEmail}
                  onChange={(e) => setNewFriendEmail(e.target.value)}
                  required
                />
                <div className="flex space-x-2">
                  <Button type="submit" size="sm" className="flex-1">
                    Send Request
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddFriend(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Friend Requests */}
          {friendRequests.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Friend Requests</h3>
              <div className="space-y-2">
                {friendRequests.map((request) => (
                  <Card key={request.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{request.senderName}</p>
                        <p className="text-xs text-gray-500">{request.senderEmail}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline" onClick={() => handleAcceptRequest(request.id)}>
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleRejectRequest(request.id)}>
                          <UserX className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Friends</h3>
              <div className="space-y-2">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className={`
                      p-3 rounded-lg cursor-pointer transition-colors
                      ${activeChat === friend.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"}
                    `}
                    onClick={() => handleChatSelect(friend.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                        {friend.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{friend.name}</p>
                        <p className="text-sm text-gray-500 truncate">{friend.isOnline ? "Online" : "Offline"}</p>
                      </div>
                      <MessageCircle className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button variant="outline" onClick={logout} className="w-full bg-transparent">
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile toggle button */}
      {!isOpen && (
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="fixed top-4 left-4 z-40 lg:hidden bg-transparent"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
    </>
  )
}
