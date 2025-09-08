import './globals.css'
import LicenseNotice from '@/components/LicenseNotice'

export const metadata = {
  title: 'GPT-OSS WebUI with Vector Search RAG',
  description: 'A modern ChatGPT clone with advanced Vector Search RAG capabilities for local document indexing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <LicenseNotice />
      </body>
    </html>
  )
}