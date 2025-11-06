import "./globals.css"
import type React from "react"
import Image from "next/image"
import Link  from "next/link"
import Navbar from "@/components/Navbar"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { AuthProvider } from "@/contexts/AuthContext"
import { AHPProvider } from "@/contexts/AHPContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AHP-GO - 意思決定サポートアプリ",
  description: "AHP(階層分析法)に基づいた合理的な意思決定をサポート",
  generator: "v0.app",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico"
  },
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
          <footer className="mx-auto text-sm border-t border-border mt-64">
            <p className="m-2 text-center text-muted-foreground">&copy; 2025 AHP-GO v5.4.1. All rights reserved.</p>
            <div className="flex flex-col justify-center items-center gap-2 py-2 text-muted-foreground">
              <p>本サイトの回答機能はGoogle Gemini APIを利用しています。 Powered by Google Gemini</p>
              <div className="flex">
                <p>本サイトの検索機能はRakuten APIを利用しています。</p>
                <Link href="https://webservice.rakuten.co.jp/" target="_blank">
                  <Image
                    src="/images/credit_31130.gif"
                    alt="Supported by Rakuten Developers."
                    width={50}
                    height={50}
                    className="w-auto h-6 rounded-sm"
                  />
                </Link>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  )
}
