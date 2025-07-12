import { type NextRequest, NextResponse } from "next/server"
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage } = await request.json()

    const { text: translatedText } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Translate the following text to ${targetLanguage}. Only return the translation, nothing else: "${text}"`,
    })

    return NextResponse.json({ translatedText })
  } catch (error) {
    console.error("Translation error:", error)
    return NextResponse.json({ error: "Translation failed" }, { status: 500 })
  }
}
