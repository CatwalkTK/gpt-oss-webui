import { NextRequest, NextResponse } from 'next/server'
// pdf-parse's top-level entry runs a debug routine that tries to read a test file when bundled
// so we import the library module directly.
import pdf from 'pdf-parse/lib/pdf-parse.js'

export async function POST(request: NextRequest) {
  try {
    const { base64Data, fileName } = await request.json()

    if (!base64Data) {
      return NextResponse.json(
        { error: 'No PDF data provided' },
        { status: 400 }
      )
    }

    try {
      // Convert base64 to buffer
      const pdfBuffer = Buffer.from(base64Data, 'base64')

      // Extract text from PDF
      const data = await pdf(pdfBuffer)

      // Clean up extracted text
      let extractedText = data.text.trim()

      if (!extractedText || extractedText.length < 10) {
        extractedText = `PDFファイル（${fileName || 'document.pdf'}）からテキストを抽出できませんでした。このPDFには画像のみが含まれているか、テキストが埋め込まれていない可能性があります。ページ数: ${data.numpages}`
      } else {
        // Limit text length to prevent overwhelming the AI
        if (extractedText.length > 8000) {
          extractedText = extractedText.substring(0, 8000) + '...\n\n[注：テキストが長いため、最初の8000文字のみを表示しています]'
        }
      }

      return NextResponse.json({
        text: extractedText,
        pages: data.numpages,
        metadata: data.metadata || {},
        requiresClientSideProcessing: false,
        wordCount: extractedText.split(/\s+/).length
      })

    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError)

      // Fallback: provide basic info about the PDF
      return NextResponse.json({
        text: `PDFファイル（${fileName || 'document.pdf'}）の解析中にエラーが発生しました。このファイルは暗号化されているか、特殊な形式の可能性があります。ファイル名やコンテキストから推測して回答します。`,
        pages: 0,
        metadata: {},
        requiresClientSideProcessing: false,
        error: 'PDF parsing failed'
      })
    }

  } catch (error) {
    console.error('PDF processing failed:', error)
    return NextResponse.json(
      {
        error: 'Failed to process PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
