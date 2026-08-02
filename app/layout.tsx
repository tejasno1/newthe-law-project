import type { Metadata } from "next"
import "./globals.css"
import WhatsAppWidget from "@/components/WhatsAppWidget"
import { ThemeProvider } from "@/components/ThemeProvider"
import SessionGuard from "@/components/SessionGuard"

export const metadata: Metadata = {
  metadataBase: new URL("https://the-law-project.vercel.app"),
  title: {
    default: "The Law Project",
    template: "%s | The Law Project",
  },
  description: "Expert-led legal education for CLAT, internships, and legal careers. Practical courses built by top lawyers.",
  openGraph: {
    title: "The Law Project",
    description: "Expert-led legal education for CLAT, internships, and legal careers.",
    url: "https://the-law-project.vercel.app",
    siteName: "The Law Project",
    images: [
      {
        url: "/lightmodelogotlp.png",
        width: 1200,
        height: 630,
        alt: "The Law Project",
      },
    ],
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Law Project",
    description: "Expert-led legal education for CLAT, internships, and legal careers.",
    images: ["/lightmodelogotlp.png"],
  },
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
          <SessionGuard />
          {children}
          <WhatsAppWidget />
        </ThemeProvider>
      </body>
    </html>
  )
}
