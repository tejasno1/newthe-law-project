import type { Metadata } from "next"
import { Space_Grotesk } from "next/font/google"
import "./globals.css"
import WhatsAppWidget from "@/components/WhatsAppWidget"
import { ThemeProvider } from "@/components/ThemeProvider"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-space-grotesk",
})

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
    <html lang="en" suppressHydrationWarning className={spaceGrotesk.variable}>
      <body className={`${spaceGrotesk.className} antialiased bg-white dark:bg-gray-900 transition-colors duration-300`}>
        <ThemeProvider>
          {children}
          <WhatsAppWidget />
        </ThemeProvider>
      </body>
    </html>
  )
}
