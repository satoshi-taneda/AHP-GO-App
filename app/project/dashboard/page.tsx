"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Info, Plus, Trash } from "lucide-react"
import Link from "next/link"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function DashBoard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [project, setProject] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // 認証チェック
  useEffect(() => {
    if (authLoading) return
    if (!user) router.push("/auth/login")
  }, [user, authLoading, router])

  // プロジェクト一覧表示
  useEffect(() => {
    Promise.resolve (
    supabase.from("project")
      .select("*, customer(name)")
      .order("updated_at", { ascending: false })
    )
    .then(({ data }) => {
      setProject(data || [])
    })
    .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  // 削除処理
  async function deleteFolder(userId: string, projectId: string) {
    const folderPath = `alternatives/${userId}/${projectId}`
    // 1. フォルダ内のファイル一覧を取得
    const { data: files, error: listError} = await supabase.storage
      .from("images")
      .list(folderPath, { limit: 100 })
      console.log(files)
    if (listError) {
      console.error("List error:", listError)
      return
    }
    if (!files || files.length === 0) {
      return
    }
    // 2. ファイルパスを全て削除
    const filePaths = files.map((file) => `${folderPath}/${file.name}`)
    const { error: deleteError } = await supabase.storage
      .from("images")
      .remove(filePaths)
    if (deleteError) {
      console.error("Delete error:", deleteError)
    } else {
      console.log("フォルダを削除しました:", folderPath)
    }
  }

  const handleDelete = async (userId: string, id: string) => {
    if (!confirm("本当にこのプロジェクトを削除しますか？\n※この操作は元に戻せません")) {
      return
    }
    setDeletingId(id)

    try {
      // alternativesテーブルにあるプロジェクト削除
      deleteFolder(userId, id)
      const { error: alternativesError } = await supabase.from("alternatives").delete().eq("project_id", id)
      if (alternativesError) throw alternativesError

      // criteriaテーブルにあるプロジェクト削除
      const { error: criteriaError } = await supabase.from("criteria").delete().eq("project_id", id)
      if (criteriaError) throw criteriaError

      // projectテーブルにあるプロジェクト削除
      const { error } = await supabase.from("project").delete().eq("project_id", id)
      if (error) throw error

      // 削除後に state を更新
      setProject((prev: any) => prev.filter((p: any) => p.project_id !== id))

      // 成功トースト
      toast.success("削除しました!")

    } catch (error) {
      console.error("削除エラー:", error)
      toast.error("削除に失敗しました")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-freground text-2xl font-bold">プロジェクト一覧</h1>
          <Button
            size="sm"
            className="bg-foreground px-4 overflow-hidden relative hover:bg-blue-500"
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
                  {authLoading ? null : user ? user.id === p.customer_id
                    ? (
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleDelete(user.id, p.project_id)}
                            disabled={loading}
                            className="mt-1 text-destructive hover:text-destructive"
                            size="sm"
                            variant="ghost"
                          >
                            {deletingId === p.project_id ? <LoadingSpinner /> : <Trash className="h-4 w-4 mr-1" /> }
                            {deletingId === p.project_id ? "削除中..." : "削除" }
                          </Button>
                        </div>
                      )
                    : null : null
                  }
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
