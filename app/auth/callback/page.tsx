"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function AuthCallback() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    // 認証状態のロード中なら何もしない
    if (authLoading) return
    if (!user) router.push("/auth/login")
  }, [user, authLoading, router])

  useEffect(() => {
    router.push("/")
  }, [])

  return <LoadingSpinner />
}
