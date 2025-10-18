import "./globals.css"
import type React from "react"
import Image from "next/image"
import Navbar from "@/components/Navbar"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/AuthContext"
import { AHPProvider } from "@/contexts/AHPContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AHP-GO - 意思決定サポートアプリ",
  description: "AHP法に基づいた合理的な意思決定をサポート",
  generator: "v0.app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className={`${inter.className} text-black dark:text-white bg-white dark:bg-black`}>
        <AuthProvider>
          <header className="border-b border-border">
            <Navbar />
          </header>
          <main className="container mx-auto px-4 py-8">
            <AHPProvider>
              {children}
              <Toaster richColors position="top-center" />
            </AHPProvider>
          </main>
          <footer className="border-t border-border mt-20">
            <div className="flex justify-center items-center gap-4 py-8 text-muted-foreground">
              <p>&copy; 2025 AHP-GO. All rights reserved.</p>
              <Image
                src="/images/credit_31130.gif"
                alt="Supported by Rakuten Developers."
                width={0}
                height={0}
                className="w-48 h-auto rounded-sm shadow"
              />
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
