import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'

const TEXT_LIMIT = 20_000

export async function POST(request: NextRequest) {
  try {
    const { base64Data, fileName, fileType } = await request.json()
    if (!base64Data || !fileName) {
      return NextResponse.json({ error: 'Missing file payload' }, { status: 400 })
    }

    const extension = getExtension(fileName)
    const buffer = Buffer.from(base64Data, 'base64')

    let text = ''
    let metadata: Record<string, unknown> | undefined

    switch (extension) {
      case 'docx':
        ({ text, metadata } = await extractDocx(buffer))
        break
      case 'xlsx':
      case 'xlsm':
        ({ text, metadata } = await extractXlsx(buffer))
        break
      case 'pptx':
        ({ text, metadata } = await extractPptx(buffer))
        break
      case 'doc':
        text = legacyDocFallback(fileName)
        break
      case 'ppt':
      case 'xls':
        text = legacyBinaryFallback(fileName)
        break
      default:
        return NextResponse.json({
          error: `Unsupported file type: ${extension}`
        }, { status: 415 })
    }

    if (!text || text.trim().length === 0) {
      text = `${fileName} から有効なテキストを抽出できませんでした。ファイルが画像のみ、または暗号化されている可能性があります。`
    }

    const normalized = normalizeWhitespace(text)
    const truncated = normalized.length > TEXT_LIMIT
      ? `${normalized.slice(0, TEXT_LIMIT)}\n\n[注: 先頭${TEXT_LIMIT}文字のみを表示しています]`
      : normalized

    const wordCount = countWords(truncated)

    return NextResponse.json({
      text: truncated,
      wordCount,
      metadata: {
        ...metadata,
        extension,
        originalType: fileType
      }
    })
  } catch (error) {
    console.error('Document extraction failed:', error)
    return NextResponse.json({
      error: 'Failed to extract document content'
    }, { status: 500 })
  }
}

function getExtension(fileName: string): string {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)
  return match ? match[1] : ''
}

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function normalizeWhitespace(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[\t\f\v]+/g, ' ')
    .replace(/\u0000/g, ' ')
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function countWords(text: string): number {
  if (!text.trim()) return 0
  return text.split(/\s+/).filter(Boolean).length
}

async function extractDocx(buffer: Buffer): Promise<{ text: string; metadata?: Record<string, unknown> }> {
  const zip = await JSZip.loadAsync(buffer)
  const targets = Object.keys(zip.files).filter(name =>
    name.startsWith('word/') && name.endsWith('.xml') &&
    (name.includes('document') || name.includes('header') || name.includes('footer') || name.includes('footnotes') || name.includes('endnotes') || name.includes('comments'))
  )

  const segments: string[] = []
  let paragraphCount = 0

  for (const target of targets) {
    const xml = await zip.file(target)?.async('string')
    if (!xml) continue

    const matches = extractByTag(xml, 'w:t')
    if (matches.length > 0) {
      paragraphCount += matches.length
      segments.push(matches.join(' '))
    }
  }

  return {
    text: segments.join('\n\n'),
    metadata: {
      paragraphCount
    }
  }
}

async function extractXlsx(buffer: Buffer): Promise<{ text: string; metadata?: Record<string, unknown> }> {
  const zip = await JSZip.loadAsync(buffer)
  const sharedStrings = await loadSharedStrings(zip)
  const sheetFiles = Object.keys(zip.files).filter(name => name.startsWith('xl/worksheets/sheet') && name.endsWith('.xml'))

  const sheetTexts: string[] = []
  const sheetNames: string[] = []
  let totalRows = 0

  for (let i = 0; i < sheetFiles.length; i++) {
    const sheetName = sheetFiles[i]
    const xml = await zip.file(sheetName)?.async('string')
    if (!xml) continue

    const rows = extractRowsFromSheet(xml, sharedStrings)
    if (rows.length === 0) continue

    totalRows += rows.length
    sheetNames.push(`Sheet ${i + 1}`)
    sheetTexts.push(`Sheet ${i + 1}\n${rows.join('\n')}`)
  }

  return {
    text: sheetTexts.join('\n\n'),
    metadata: {
      sheetNames,
      rowCount: totalRows
    }
  }
}

async function extractPptx(buffer: Buffer): Promise<{ text: string; metadata?: Record<string, unknown> }> {
  const zip = await JSZip.loadAsync(buffer)
  const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'))

  const slides: string[] = []

  for (let i = 0; i < slideFiles.length; i++) {
    const xml = await zip.file(slideFiles[i])?.async('string')
    if (!xml) continue

    const textRuns = extractByTag(xml, 'a:t')
    if (textRuns.length === 0) continue

    slides.push(`Slide ${i + 1}\n${textRuns.join(' ')}`)
  }

  return {
    text: slides.join('\n\n'),
    metadata: {
      slideCount: slides.length
    }
  }
}

function extractByTag(xml: string, tag: string): string[] {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi')
  const results: string[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(xml)) !== null) {
    const value = decodeEntities(match[1]).replace(/<[^>]+>/g, '').trim()
    if (value) {
      results.push(value)
    }
  }

  return results
}

async function loadSharedStrings(zip: JSZip): Promise<string[]> {
  const file = zip.file('xl/sharedStrings.xml')
  if (!file) return []

  const xml = await file.async('string')
  const entries = extractByTag(xml, 't')
  return entries
}

function extractRowsFromSheet(xml: string, sharedStrings: string[]): string[] {
  const rows: string[] = []
  const rowRegex = /<row[^>]*>([\s\S]*?)<\/row>/gi
  let rowMatch: RegExpExecArray | null

  while ((rowMatch = rowRegex.exec(xml)) !== null) {
    const rowXml = rowMatch[1]
    const cellValues: string[] = []

    const cellRegex = /<c([^>]*)>([\s\S]*?)<\/c>/gi
    let cellMatch: RegExpExecArray | null

    while ((cellMatch = cellRegex.exec(rowXml)) !== null) {
      const attributes = cellMatch[1]
      const cellContent = cellMatch[2]
      const type = getAttribute(attributes, 't')

      if (type === 'inlineStr') {
        const inlineText = extractByTag(cellContent, 't').join(' ')
        cellValues.push(inlineText)
        continue
      }

      const valueMatch = cellContent.match(/<v>([\s\S]*?)<\/v>/)
      if (!valueMatch) {
        cellValues.push('')
        continue
      }

      const rawValue = decodeEntities(valueMatch[1])
      if (type === 's') {
        const index = Number(rawValue)
        cellValues.push(sharedStrings[index] || '')
      } else {
        cellValues.push(rawValue)
      }
    }

    const rowText = cellValues.map(value => value.trim()).filter(Boolean).join('\t')
    if (rowText) {
      rows.push(rowText)
    }
  }

  return rows
}

function getAttribute(source: string, attribute: string): string | undefined {
  const match = source.match(new RegExp(`${attribute}="([^"]+)"`, 'i'))
  return match ? match[1] : undefined
}

function legacyDocFallback(fileName: string): string {
  return `DOC形式のファイル（${fileName}）はバイナリ形式のため、ブラウザ内での直接テキスト抽出に対応していません。可能であればDOCX形式へ変換して再度アップロードしてください。`
}

function legacyBinaryFallback(fileName: string): string {
  return `${fileName} は旧形式のOfficeバイナリファイルです。現在のバージョンでは自動テキスト抽出に対応していません。最新のOffice形式に保存し直してから再度お試しください。`
}
