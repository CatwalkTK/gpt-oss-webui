import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const transformedBody = {
      ...body,
      messages: (body.messages || []).map((message: any) => convertMessageForOllama(message))
    }

    // Forward the request to Ollama
    const response = await fetch('http://localhost:11434/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedBody),
    })

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`)
    }

    // Handle streaming response
    if (response.body) {
      // Return the stream directly
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    )
  }
}

function convertMessageForOllama(message: any) {
  if (!message || typeof message !== 'object') {
    return message
  }

  if (typeof message.content === 'string') {
    return message
  }

  const texts: string[] = []
  const images: string[] = []

  if (Array.isArray(message.content)) {
    for (const part of message.content) {
      if (!part) continue
      if (typeof part === 'string') {
        texts.push(part)
        continue
      }

      if (part.type === 'text' && typeof part.text === 'string') {
        texts.push(part.text)
        continue
      }

      if (part.type === 'image_url' && part.image_url?.url) {
        const url: string = part.image_url.url
        images.push(extractBase64FromUrl(url))
        continue
      }

      if (part.type === 'input_text' && typeof part.text === 'string') {
        texts.push(part.text)
        continue
      }

      if (part.type === 'input_image' && part.image_base64) {
        images.push(part.image_base64)
        continue
      }
    }
  }

  const mergedContent = texts.filter(Boolean).join('\n\n').trim()
  const result: any = {
    ...message,
    content: mergedContent
  }

  const cleanImages = images.filter(img => typeof img === 'string' && img.trim().length > 0)
  if (cleanImages.length > 0) {
    result.images = cleanImages
  }

  return result
}

function extractBase64FromUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('data:')) {
    const commaIndex = url.indexOf(',')
    return commaIndex >= 0 ? url.slice(commaIndex + 1) : url
  }
  return url
}
