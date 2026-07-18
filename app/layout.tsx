import type { Metadata } from "next"
import "./globals.css"
import WhatsAppWidget from "@/components/WhatsAppWidget"
import { ThemeProvider } from "@/components/ThemeProvider"

export const metadata: Metadata = {
  title: "The Law Project",
  description: "Master design skills with expert-led courses",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Radio+Canada+Big:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-white dark:bg-gray-900 transition-colors duration-300">
        <ThemeProvider>
          {children}
          <WhatsAppWidget />
        </ThemeProvider>
      </body>
    </html>
  )
}
