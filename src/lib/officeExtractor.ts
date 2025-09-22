import { REGEX_PATTERNS } from './constants'

export interface OfficeExtractionMetadata {
  paragraphs?: number
  sheetNames?: string[]
  rowCount?: number
  slideCount?: number
  detectedTables?: number
  summary?: string
}

export interface OfficeExtractionResult {
  text: string
  wordCount?: number
  metadata?: OfficeExtractionMetadata
}

export async function extractOfficeDocumentFromBase64(
  base64Data: string | null | undefined,
  fileName: string,
  fileType?: string
): Promise<OfficeExtractionResult | null> {
  if (!base64Data || base64Data.trim().length === 0) {
    return null
  }

  try {
    const response = await fetch('/api/document-extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        base64Data,
        fileName,
        fileType
      })
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'unknown error')
      console.warn(`Office extraction failed (${response.status}):`, errorText)
      return {
        text: `【${fileName}】のテキスト抽出に失敗しました（ステータス: ${response.status}）。ファイルの形式や内容を確認してください。`
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Office document extraction error:', error)
    return {
      text: `【${fileName}】の解析中にエラーが発生しました。添付されたドキュメントから直接内容を要約するか、必要であればファイル形式（${fileType || '不明'}）を再確認してください。`
    }
  }
}

export function isSupportedOfficeFile(fileName: string): boolean {
  return REGEX_PATTERNS.OFFICE_FILES.test(fileName)
}
