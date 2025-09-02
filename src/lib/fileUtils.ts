export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = (e) => reject(e)
    reader.readAsText(file)
  })
}

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(file)
  })
}

export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return '🖼️'
  if (fileType === 'application/pdf') return '📄'
  if (fileType.startsWith('text/') || fileType.includes('document')) return '📝'
  if (fileType.includes('spreadsheet') || fileType.includes('excel')) return '📊'
  if (fileType.includes('presentation') || fileType.includes('powerpoint')) return '📈'
  return '📎'
}

export function isImageFile(fileType: string): boolean {
  return fileType.startsWith('image/')
}

export function isPDFFile(fileType: string): boolean {
  return fileType === 'application/pdf'
}

export function isTextFile(fileType: string, fileName?: string): boolean {
  return fileType.startsWith('text/') || 
         fileType.includes('document') ||
         fileType.includes('markdown') ||
         fileName?.endsWith('.md') ||
         fileName?.endsWith('.txt')
}

export function isOfficeDocument(fileName: string): boolean {
  return !!fileName.match(/\.(docx?|xlsx?|pptx?)$/i)
}

export function extractTextFromFile(file: File): Promise<string> {
  if (isTextFile(file.type, file.name)) {
    return readFileAsText(file)
  }
  
  // For non-text files, return basic info
  return Promise.resolve(`[${getFileIcon(file.type)} ${file.name} - ${file.type}]`)
}