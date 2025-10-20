"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import Image from "next/image"

function LoggedInMenu({ user, profile, onLogout }: {user: any, profile: any, onLogout: () => void; }) {
  const displayName =
    profile?.name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    "ゲスト"
  const avatarUrl = user?.user_metadata?.avatar_url
  const router = useRouter()

  return (
    <>
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
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
          <span className="text-sm font-midium">{displayName}さん</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push("/")}>ホーム</DropdownMenuItem>
        <DropdownMenuItem onClick={onLogout}>ログアウト</DropdownMenuItem>
      </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
function LoggedOutMenu({ isAuthPage }: { isAuthPage: boolean }) {
  if (isAuthPage) return null
  return (
    <>
      <Link href="/auth/login">
        <Button size="lg" variant="ghost">
          ログイン
        </Button>
      </Link>
      <Link href="/auth/signup">
        <Button size="lg" className="bg-foreground px-4 overflow-hidden">
          新規登録
        </Button>
      </Link>
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
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <h1 className="flex items-center gap-2">
        <div className="inline-block relative group">
        {loading ? null : user ? (
          <Button
            className="text-xl font-semibold overflow-hidden relative"
            size="sm"
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
            size="sm"
            variant="ghost"
            onClick={() => router.replace("/")}
          >
          AHP-GO
          </Button>
        )}
        </div>
      </h1>
      <nav className="flex items-center gap-2">
        {loading ? null : user ? (
          <LoggedInMenu user={user} profile={profile ?? null} onLogout={handleLogout} />
        ) : (
          <LoggedOutMenu isAuthPage={isAuthPage} />
        )}
      </nav>
    </div>
  )
}
