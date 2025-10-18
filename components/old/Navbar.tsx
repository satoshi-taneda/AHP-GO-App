"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/lib/AuthContext"

type Profile = {
  name?: string
  [key: string]: any
}

function LoggedInMenu({ onLogout, profile }: { onLogout: () => void; profile: Profile }) {
  return (
    <>
      <li>
        <Link href="/">
          <Button onClick={onLogout} className="bg-white text-black hover:bg-gray-100">
            ログアウト
          </Button>
        </Link>
      </li>
      {profile?.name && (
        <li>
          <p className="text-sm text-gray-700">こんにちは、{profile.name}さん!</p>
        </li>
      )}
    </>
  )
}
function LoggedOutMenu({ isAuthPage }: { isAuthPage: boolean }) {
  if (isAuthPage) return null
  return (
    <>
      <li>
        <Link href="/auth/login">
          <Button className="bg-white text-black hover:bg-gray-100">ログイン</Button>
        </Link>
      </li>
      <li>
        <Link href="/auth/signup">
          <Button className="bg-black">新規登録</Button>
        </Link>
      </li>
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

  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-xl font-bold text-foreground">AHP-GO</h1>
        </Link>

        <nav>
          <ul className="flex items-center gap-4">
            {loading ? null : user ? (
              <LoggedInMenu onLogout={handleLogout} profile={profile} />
            ) : (
              <LoggedOutMenu isAuthPage={isAuthPage} />
            )}
          </ul>
        </nav>
      </div>
    </header>
  )
}
