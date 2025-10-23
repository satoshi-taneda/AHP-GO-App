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
import { Award, BarChart3, Pencil } from "lucide-react"
import ReturnButton from "@/components/ReturnButton"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function ProjectPage() {
  const [project, setProject] = useState<AHPProject>()
  const [customerId, setCustomerId] = useState("")
  const [owner, setOwner] = useState("")
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState(true)
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const projectId = params?.id as string

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
        .order("no")
      const { data: alternativesData } = await supabase
        .from("alternatives")
        .select("*")
        .eq("project_id", projectId)
        .order("no")
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
        })) || [],
        alternatives: alternativesData?.map(a => ({
          id: a.alternatives_id,
          name: a.name,
          description: a.description,
          imageUrl: a.image_url,
        })) || [],
        createdAt: projectData.created_at,
        updatedAt: projectData.updated_at,
      })
      setLoading(false)
    }
    fetchData()
  }, [authLoading, projectId, setProject, router])

  console.log(project)
  if (loading || !project) return <LoadingSpinner />

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <Card className="relative overflow-hidden p-8 bg-gradient-to-r from-muted/50">
        <div className="flex justify-between items-top">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{project.goal}</h1>
            <p className="text-muted-foreground">
              更新日: {new Date(project.updatedAt).toLocaleDateString("ja-JP", {
              year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
              })}
            </p>
            <p className="text-sm text-muted-foreground mt-1">作成者: {owner || "匿名"}</p>
          </div>
          {user?.id === customerId && (
            <Button
              size="sm"
              variant="ghost"
              onClick={ () => router.push(`/project/edit/${project.id}`) }
            >
              <Pencil className="w-4 h-4 mr-2" />編集
            </Button>
          )}
        </div>
        <div className="flex justify-end items-end gap-2 mt-2">
            {result ? (
              <>
                <Button variant="outline" size="sm" disabled>
                  <Award className="w-4 h-4 mr-1" />結果を見る
                </Button>
                <Button variant="outline" size="sm" onClick={() =>  setResult(false)}>
                  <BarChart3 className="w-4 h-4 mr-1" />グラフ
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => {setResult(true)}}>
                  <Award className="w-4 h-4 mr-1" />結果を見る
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <BarChart3 className="w-4 h-4 mr-1" />グラフ
                </Button>
              </>
            )}
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
              {project.alternatives.map((alt) => (
                <Card key={alt.id} className="p-4 hover:scale-[1.01] transition-transform">
                  {alt.imageUrl && (
                    <img src={alt.imageUrl} alt={alt.name} className="rounded-lg object-cover w-full mt-3" />
                  )}
                  <h3 className="text-lg font-semibold">{alt.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1 whitespace-pre-line">{alt.description}</p>
                </Card>
              ))}
            </div>
          </div>
        ) : null}
      </Card>
      <ReturnButton />
    </div>
  )
}
