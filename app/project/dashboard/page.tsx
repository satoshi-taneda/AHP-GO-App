"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Info, Plus } from "lucide-react"
import Link from "next/link"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function DashBoard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [project, setProject] = useState<any>([])
  const [loading, setLoading] = useState(true)

  // プロジェクト一覧表示
  useEffect(() => {
    if (authLoading) return
    if (!user) router.push("/auth/login")
    Promise.resolve (
    supabase.from("project")
      .select("*, customer(name)")
      .order("updated_at", { ascending: false })
    )
    .then(({ data }) => {
      setProject(data || [])
    })
    .finally(() => setLoading(false))
  }, [user, authLoading, router])

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl text-foreground font-semibold">履歴</h1>
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/project/new")}
          >
          <Plus className="w-4 h-4 mr-1" /> 新しいプロジェクト
          </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4">
        {project.length > 0 ? (
          project.map((p: any) => (
            <div key={p.project_id} className="space-y-1">
                <div className="relative overflow-hidden bg-gradient-to-r from-muted/30
                                p-4 border rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-500 transition-shadow">
                  <Link href={`/project/${p.project_id}`}>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <p>{new Date(p.updated_at).toLocaleString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                      </p>
                      <p>{p.customer.name || "ゲスト"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                    <Info />
                    <h2 className="font-semibold text-lg mt-2">{p.goal}</h2>
                    </div>
                  </Link>
                </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">現在プロジェクトがありません。</p>
        )}
      </div>
    </div>
  )
}
