"use client"

import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { LogIn } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import Image from "next/image"

function LoggedInMenu({ user, profile, router, onLogout }: {user: any, profile: any, router: any,  onLogout: () => void; }) {
  const [loading, setLoading] = useState(false)
  const displayName =
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "ゲスト"
  const avatarUrl = user?.user_metadata?.avatar_url

  const deleteAccount = async () => {
    const confirmed = window.confirm("本当に退会しますか？")
    if (!confirmed) return
    setLoading(true)

    if (!user) {
      alert("ログインしていません")
      setLoading(false)
      return
    }

    const { error } =
      await supabase.functions.invoke(
        "delete-user",
        {
          body: { userId: user.id }
        }
      )
    if (error) {
      console.error(error)
      alert("削除失敗")
      setLoading(false)
      return
    }

    const { error: error2 } = await supabase
      .from("customer")
      .delete()
      .eq("customer_id", user.id)

    if (error2) {
      console.error(error2)
    }

    await supabase.auth.signOut()
    alert("退会しました")

    router.replace("/")
  }

  return (
    <div className="flex justify-end gap-4">
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-2">
        {avatarUrl ? (
          <>
            <div className="rounded-full overflow-hidden">
              <Image
                src={avatarUrl || "/placeholder-user.jpg"}
                alt="User Avator"
                width={25}
                height={25} />
            </div>
          </>
        ) : (
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300" />
        )}
          <span className="text-sm font-midium">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push("/")}>ホーム</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/project/dashboard")}>ダッシュボード</DropdownMenuItem>
        <DropdownMenuItem onClick={onLogout}>ログアウト</DropdownMenuItem>
        <DropdownMenuItem onClick={deleteAccount} disabled={loading || user.id === "a623f996-e0b0-4de0-9782-71313b0b4840"}>退会</DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
function LoggedOutMenu({ isAuthPage, router }: { isAuthPage: boolean, router: any }) {
  if (isAuthPage) return null
  return (
    <Button
      size="default"
      variant="ghost"
      onClick={() => router.push("/auth/login")}
    >
      <LogIn className="w-4 h-4 mr-1" />ログイン
    </Button>
  )
}

export default function Navbar() {
  const { user, profile, signOut, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  // 認証関連のページかどうか
  const isAuthPage = pathname?.startsWith("/auth")

  // ログアウト処理
  const handleLogout = async () => {
    await signOut()
  }
  // ヘッダの左右配置
  return (
    <div className="container mx-auto p-4 flex justify-between items-center shadow-sm rounded-lg">
      <h1 className="flex items-center gap-2">
        <div className="inline-block relative group">
        {loading ? null : user ? (
          <Button
            className="text-xl font-semibold overflow-hidden relative"
            size="default"
            variant="ghost"
            onClick={() => router.replace("/project/dashboard")}
          >
            AHP-GO
            {/* 光のエフェクト */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/90 to-transparent
            translate-x-[-100%] group-hover:translate-x-[100%]
            transition-transform duration-700 ease-out" />
          </Button>
        ) : (
          <Button
            className="text-xl font-semibold overflow-hidden relative"
            size="default"
            variant="ghost"
            onClick={() => router.replace("/")}
          >
          AHP-GO
          </Button>
        )}
        </div>
      </h1>
      <nav className="flex items-center gap-1">
        {loading ? null : user ? (
          <LoggedInMenu user={user} profile={profile ?? null} router={router} onLogout={handleLogout} />
        ) : (
          <LoggedOutMenu isAuthPage={isAuthPage} router={router} />
        )}
      </nav>
    </div>
  )
}
