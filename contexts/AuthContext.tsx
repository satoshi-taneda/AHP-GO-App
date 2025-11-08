"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type User = any
type AuthContextType = {
  user: User | null
  profile: any | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

// 認証情報（ログイン状態やプロフィール）をアプリ全体に提供する
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  // --プロフィール取得を共通化--
  const fetchOrCreateProfile = async (user: any | null) => {
    if (!user || !user.id) {
      console.warn("fetchOrCreateProfile: ユーザ情報が存在しません。")
      return null
    }
    const { data: existingProfile, error: existingProfileError } = await supabase.from("customer").select("*").eq("customer_id", user.id).single()

    if (existingProfileError) console.log("プロフィール取得エラー:", existingProfileError)
    if (existingProfile) return existingProfile

    // ない場合は新規作成
    const { data, error } = await supabase
      .from("customer")
      .insert([
        {
          customer_id: user.id,
          name: user.user_metadata.full_name || user.email
        }
      ]).select().single()

    if (error) console.log("プロフィール自動作成エラー:", error)
    return data

  }

  // --サインアウトを共通化--
  const router = useRouter()
  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.replace("/auth/login")
    toast.success("ログアウトしました!")
  }

  // 初回読み込み時に実行される処理
  useEffect(() => {
    const getSession = async () => {
      try {
        // 現在のセッション情報（ログイン情報）をSupabaseクライアントから取得
        const { data: { session } } = await supabase.auth.getSession()
        if(session && session?.user) {
          setUser(session.user)
          const profileData = await fetchOrCreateProfile(session.user)
          setProfile(profileData)
        }
      } catch (error) {
        console.error("認証情報取得エラー:", error)
      } finally {
        setLoading(false)
      }
    }
    getSession()

    // 認証状態の変更を監視
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log("Auth event:", event)
      if (session && session?.user) {
        setUser(session.user)
        if(event === "INITIAL_SESSION") {
          const profileData = await fetchOrCreateProfile(session.user)
          setProfile(profileData)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
    })
    return () => {
      // console.log("AuthProvider unmounted")
      authListener.subscription.unsubscribe()
    }

  }, [])

  //子コンポーネントに対して、ユーザー情報やログアウト関数などを提供。layout.tsxに反映する
  return (
    <AuthContext.Provider value={{user, profile, loading, signOut}}>
    {children}
    </AuthContext.Provider>
  )
}
