import './globals.css'

export const metadata = {
  title: 'GPT-OSS Chat',
  description: 'ChatGPT-like interface for GPT-OSS models',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}