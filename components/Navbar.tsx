"use client"

import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { LogIn } from "lucide-react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import Image from "next/image"

function LoggedInMenu({ user, profile, router, onLogout }: {user: any, profile: any, router: any,  onLogout: () => void; }) {
  const displayName =
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "ゲスト"
  const avatarUrl = user?.user_metadata?.avatar_url

  return (
    <div className="flex justify-end gap-4">
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="p-2">
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
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300" />
        )}
          <span className="text-sm font-midium">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push("/")}>ホーム</DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/project/dashboard")}>ダッシュボード</DropdownMenuItem>
        <DropdownMenuItem onClick={onLogout}>ログアウト</DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
function LoggedOutMenu({ isAuthPage, router }: { isAuthPage: boolean, router: any }) {
  if (isAuthPage) return null
  return (
    <>
      <Button
        size="default"
        variant="ghost"
        onClick={() => router.push("/auth/login")}
      >
        <LogIn className="w-4 h-4 mr-1" />ログイン
      </Button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        className="text-sm bg-blue-500 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-600"
        onClick={() => router.push("/auth/signup")}
      >
        新規登録
      </motion.button>
    </>
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
    <div className="container mx-auto p-4 flex justify-between items-center">
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
