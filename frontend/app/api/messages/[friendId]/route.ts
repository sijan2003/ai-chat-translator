import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest, { params }: { params: { friendId: string } }) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    // Return mock messages
    const messages = [
      {
        id: "1",
        senderId: decoded.userId,
        receiverId: params.friendId,
        content: "Hello! How are you?",
        timestamp: new Date(Date.now() - 3600000),
        isTranslated: false,
      },
      {
        id: "2",
        senderId: params.friendId,
        receiverId: decoded.userId,
        content: "Hi! I'm doing great, thanks for asking!",
        translatedContent: "Hola! Me va muy bien, gracias por preguntar!",
        timestamp: new Date(Date.now() - 3000000),
        isTranslated: true,
      },
    ]

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Messages fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
