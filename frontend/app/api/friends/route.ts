import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Mock database - replace with your actual database
const friends: any[] = []

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    // Return mock friends data
    const userFriends = [
      {
        id: "2",
        name: "Alice Johnson",
        email: "alice@example.com",
        isOnline: true,
        lastSeen: new Date(),
      },
      {
        id: "3",
        name: "Bob Smith",
        email: "bob@example.com",
        isOnline: false,
        lastSeen: new Date(Date.now() - 3600000), // 1 hour ago
      },
    ]

    return NextResponse.json(userFriends)
  } catch (error) {
    console.error("Friends fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
