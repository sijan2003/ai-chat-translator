import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key") as any

    const { email } = await request.json()

    // Mock friend request logic
    console.log(`Friend request sent from ${decoded.email} to ${email}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Send friend request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
