"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import GoogleLoginButton from "@/components/GoogleLoginButton"
import { motion, AnimatePresence, useAnimation } from "framer-motion"
import { AlertTriangle, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const controls = useAnimation()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // 成功したらフェードアウト
      await controls.start({
        opacity: 0,
        y: -20,
        transition: {duration: 0.6, ease: "easeOut" },
      })

      toast.success("ログインしました!")
      router.replace("/")
      await new Promise(() => setTimeout(() => {
        window.location.reload()
      }, 500))

    } catch (error: any) {
      if (error instanceof Error) setError(error.message)
      else setError("不明なエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }
  const handleGoogleLogin = async () => {
    const redirectURL = process.env.NEXT_PUBLIC_SITE_URL || `${window.location.origin}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectURL
      }
    })
    if (error) console.error("Googleログインエラー:", error)
  }

  return (
    <motion.div
      className="max-w-md mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6">ログイン</h1>

        <AnimatePresence>
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
            >
              <AlertTriangle className="w-5 h-5 mr-2 text-destructive" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
            <label htmlFor="password" className="block mb-1">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full py-4 text-lg font-medium bg-foreground"
            disabled={loading}
          >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              ログイン中...
            </div>
            ) : (
              "ログイン"
          )}
        </Button>
        </form>
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">または</span>
          </div>
        </div>
        <GoogleLoginButton onClick={handleGoogleLogin} />
        <p className="mt-8 text-center">
          アカウントをお持ちでない方は
          <Link
            href="/auth/signup"
            className="text-foreground hover:underline hover:text-blue-500 ml-1"
          >
            新規登録
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
