import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, source_lang, target_lang } = body

    if (!message || !source_lang || !target_lang) {
      return NextResponse.json(
        { error: 'Missing required fields: message, source_lang, target_lang' },
        { status: 400 }
      )
    }

    // Call Django backend translation API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/translate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('authorization') || '',
      },
      body: JSON.stringify({
        message,
        source_lang,
        target_lang,
      }),
    })

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Translation error:', error)
    return NextResponse.json(
      { error: 'Translation service unavailable' },
      { status: 500 }
    )
  }
}
