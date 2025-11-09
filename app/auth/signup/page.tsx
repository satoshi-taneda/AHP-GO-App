"use client"
import type React from "react"
import LoadingSpinner from "@/components/LoadingSpinner"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
 
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // 1. ユーザー登録
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`, // ←これを追加
        }
      })

      if (authError) throw authError
      if (!data.user) throw new Error("ユーザー登録に失敗しました。")

      // 2. プロフィール作成
      const { error: profileError } = await supabase.from("customer").insert([
        {
          customer_id: data.user.id,         // SupabaseのユーザIDを使用
          name: name || email.split("@")[0]  // 名前が空の場合はメールアドレスの@前を使用
        }
      ])

      if (profileError) {
        throw profileError
      }

      console.log("登録成功")

      // 少し遅延させてからリダイレクト
      setTimeout(() => {
        router.push("/auth/complete")
      }, 1000)
    } catch (error: any) {
      console.error("登録エラー:", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6">新規登録</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSignup} className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="block">
            表示名:
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
          <label htmlFor="email" className="block">
            メールアドレス:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
          <label htmlFor="password" className="block mb-1">
            パスワード:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          className="w-full text-lg bg-blue-500 text-white p-2 rounded shadow hover:bg-blue-600"
        >
          {loading ? (
            <div className="flex justify-center items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>登録中</span>
            </div>
          ) : (
              <span>登録する</span>
          )}
        </motion.button>
      </form>

      <div className="mt-8 flex justify-center items-center">
        <p>すでにアカウントをお持ちの方は</p>
        <Button
          className="text-md"
          size="sm"
          variant="link"
          onClick={() => router.push("/auth/login")}>
            ログイン
        </Button>
      </div>
    </div>
  )
}
