const { createServer } = require("http")
const { Server } = require("socket.io")
const jwt = require("jsonwebtoken")

const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Mock database for messages
const messages = []
const connectedUsers = new Map()

// Authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) {
    return next(new Error("Authentication error"))
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
    socket.userId = decoded.userId
    socket.userEmail = decoded.email
    next()
  } catch (err) {
    next(new Error("Authentication error"))
  }
})

io.on("connection", (socket) => {
  console.log(`User ${socket.userEmail} connected`)

  // Store connected user
  connectedUsers.set(socket.userId, {
    socketId: socket.id,
    email: socket.userEmail,
    isOnline: true,
  })

  // Broadcast online status update
  socket.broadcast.emit("userOnline", {
    userId: socket.userId,
    isOnline: true,
  })

  // Handle sending messages
  socket.on("sendMessage", async (messageData) => {
    try {
      const message = {
        id: Date.now().toString(),
        senderId: socket.userId,
        receiverId: messageData.receiverId,
        content: messageData.content,
        timestamp: new Date(),
        isTranslated: false,
      }

      // Check if translation is needed
      const receiverSocket = Array.from(io.sockets.sockets.values()).find((s) => s.userId === messageData.receiverId)

      if (receiverSocket) {
        // Get receiver's preferred language (mock - in real app, fetch from database)
        const receiverLanguage = "es" // Mock preferred language

        if (receiverLanguage !== "en") {
          // Translate message using AI
          const response = await fetch("http://localhost:3000/api/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: messageData.content,
              targetLanguage: receiverLanguage,
            }),
          })

          if (response.ok) {
            const { translatedText } = await response.json()
            message.translatedContent = translatedText
            message.isTranslated = true
          }
        }

        // Send to receiver
        receiverSocket.emit("message", message)
      }

      // Send back to sender
      socket.emit("message", message)

      // Store message (in real app, save to database)
      messages.push(message)
    } catch (error) {
      console.error("Message sending error:", error)
      socket.emit("messageError", { error: "Failed to send message" })
    }
  })

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User ${socket.userEmail} disconnected`)
    connectedUsers.delete(socket.userId)

    // Broadcast offline status
    socket.broadcast.emit("userOffline", {
      userId: socket.userId,
      isOnline: false,
    })
  })
})

const PORT = process.env.SOCKET_PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`)
})
