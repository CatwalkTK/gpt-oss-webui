import './globals.css'
import LicenseNotice from '@/components/LicenseNotice'
import ToastContainer from '@/components/ToastContainer'
import { SettingsProvider } from '@/context/SettingsContext'

export const metadata = {
  title: 'Clavi Local Mining with Vector Search RAG',
  description: 'Clavi Local Mining pairs ChatGPT-style conversations with advanced Vector Search RAG for local document indexing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SettingsProvider>
          {children}
          <LicenseNotice />
          <ToastContainer />
        </SettingsProvider>
      </body>
    </html>
  )
}
