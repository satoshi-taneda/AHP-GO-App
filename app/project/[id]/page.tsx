"use client"
import type { AHPProject } from "@/lib/types"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import { Award, BarChart3, Pencil, Trash, Crown } from "lucide-react"
import { helpTexts } from "@/data/helpTexts"
import { Help } from "@/components/Help"
import ReturnButton from "@/components/ReturnButton"
import LoadingSpinner from "@/components/LoadingSpinner"
import AHPResultCharts from "@/components/AHPResultCharts"

export default function ProjectPage() {
  const [project, setProject] = useState<AHPProject>()
  const [customerId, setCustomerId] = useState("")
  const [owner, setOwner] = useState("")
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { user, loading: authLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  const projectId = params?.id as string
  const rankColors = [
    "text-yellow-400",
    "text-gray-400",
    "text-amber-700"
  ] as const

  useEffect(() => {
    // 認証チェック
    if (authLoading || !user) return
    if (!user) router.push("/auth/login")

    // データ取得
    const fetchData = async () => {
      const { data: projectData, error: projectError } = await supabase
        .from("project")
        .select("*")
        .eq("project_id", projectId)
        .single()
      const { data: criteriaData } = await supabase
        .from("criteria")
        .select("*")
        .eq("project_id", projectId)
        .order("weight", { ascending: false })
      const { data: alternativesData } = await supabase
        .from("alternatives")
        .select("*")
        .eq("project_id", projectId)
        .order("weight", { ascending: false })
      if (projectError || !projectData ) {
        toast.error("プロジェクトが見つかりませんでした")
        router.push("/project/dashboard")
        return
      }

      setOwner(projectData.owner)
      setCustomerId(projectData.customer_id)

      setProject({
        id: projectData.project_id,
        goal: projectData.goal,
        criteria: criteriaData?.map(c => ({
          id: c.criteria_id,
          name: c.name,
          weight: c.weight,
        })) || [],
        alternatives: alternativesData?.map(a => ({
          id: a.alternatives_id,
          name: a.name,
          description: a.description,
          weight: a.weight,
          imageUrl: a.image_url,
        })) || [],
        createdAt: projectData.created_at,
        updatedAt: projectData.updated_at,
        completed: projectData.completed,
        published: projectData.published,
      })
      setLoading(false)
    }
    fetchData()
  }, [authLoading, projectId, setProject, router])

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
  const handleEdit = (projectId: string) => {
    if (!confirm("注意: 更新するとスコアはリセットされます。")) {
      return
    }
    router.push(`/project/edit/${projectId}`)

  }
  const handleDelete = async (userId: string, id: string) => {
    if (!confirm("本当にこのプロジェクトを削除しますか？\n※この操作は元に戻せません。")) {
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

      // 成功トースト
      toast.success("削除しました!")
      router.replace("/project/dashboard")

    } catch (error) {
      console.error("削除エラー:", error)
      toast.error("削除に失敗しました")
    } finally {
      setDeletingId(null)
    }
  }
  if (loading || !project) return <LoadingSpinner />

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Card className="relative overflow-hidden p-4 bg-gradient-to-r from-muted/50">
        {user?.id === customerId && projectId !== "1762139916553-bblcw9fd3" && (
          <div className="flex justify-end gap-2">
            <Button
              className="text-green-800"
              disabled={loading}
              size="sm"
              variant="ghost"
              onClick={() => handleEdit(projectId)}
            >
              <Pencil className="w-4 h-4 mr-2" />更新する
            </Button>
            <Button
              onClick={() => handleDelete(user.id, projectId)}
              className="text-destructive"
              disabled={loading}
              size="sm"
              variant="ghost"
            >
              {deletingId === projectId ? <LoadingSpinner /> : <Trash className="h-4 w-4 mr-1" /> }
              {deletingId === projectId ? "削除中" : "削除" }
            </Button>
          </div>
        )}
        <div className="flex justify-between items-top">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-foreground mb-2">{project.goal}</h1>
            <p className="text-muted-foreground">ステータス: {project.completed ? "完了" : "実施中"}</p>
            <p className="text-muted-foreground">公開設定: {project.published ? "公開中" : "非公開"}</p>
            <p className="text-muted-foreground">
              更新日: {new Date(project.updatedAt).toLocaleDateString("ja-JP", {
              timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
              })}
            </p>
            <p className="text-muted-foreground">
              作成日: {new Date(project.createdAt).toLocaleDateString("ja-JP", {
              timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
              })}
            </p>
            <p className="text-muted-foreground">作成者: {owner || "匿名"}</p>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold flex items-center">
              結果について
              <Help text={helpTexts.result.short} title="結果について" more={helpTexts.result.long} />
            </h2>
          </div>
          <div className="flex justify-end items-end gap-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={result}
              onClick={() =>  setResult(true)}
            >
              <Award className="w-4 h-4 mr-1" />総合評価
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!result}
              onClick={() =>  setResult(false)}
            >
              <BarChart3 className="w-4 h-4 mr-1" />グラフ
            </Button>
          </div>
        </div>
        {result ? (
          <div>
            <div className="grid md:grid-cols-5 gap-4 mt-8">
              {project.criteria.map((c) => (
                <Card key={c.id} className="p-4 hover:shadow-md transition-all">
                  <h3 className="font-semibold text-foreground">{c.name}</h3>
                </Card>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {project.alternatives.map((alt, i) => (
                <Card key={alt.id} className="p-4 hover:scale-[1.01] transition-transform">
                  {project.completed && (
                    <div className ="flex items-center gap-1">
                      {i < 3 && (
                        <Crown className={`${rankColors[i]} mr-2 size={20}`} />
                      )}
                      <span className="text-lg font-semibold mr-2">{i + 1}位</span>
                      <p className="text-lg text-blue-500">{alt.weight.toFixed(3)}</p>
                    </div>
                  )}
                  <h3 className="text-lg font-semibold">{alt.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1 whitespace-pre-line">{alt.description}</p>
                  {alt.imageUrl && (
                    <img src={alt.imageUrl} alt={alt.name} className="rounded-lg object-cover w-full mt-3" />
                  )}
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <AHPResultCharts project={project} />
        )}
      </Card>
      <ReturnButton />
    </div>
  )
}
