"use client"
import type { AHPProject } from "@/lib/types"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAHP } from "@/contexts/AHPContext"
import { supabase } from "@/lib/supabaseClient"
import { GoalInput } from "@/components/GoalInput"
import { CriteriaManager } from "@/components/CriteriaManager"
import { AlternativesManager } from "@/components/AlternativesManager"
import CancelButton from "@/components/CancelButton"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const { project, setProject } = useAHP()
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const projectId = params?.id as string

  // 候補画像削除処理
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
      console.log("画像フォルダ削除完了:", folderPath)
    }
  }

  useEffect(() => {
    // 認証チェック
    if (authLoading || !user) return
    if (!user) router.push("/auth/login")

    // Supabaseからのデータ取得
    const fetchData = async () => {
      const { data: projectData, error: projectError } = await supabase
        .from("project")
        .select("*")
        .eq("project_id", projectId)
        .single()

      // ユーザチェック
      if (user?.id !== projectData.customer_id) router.push(`/project/${projectId}`)

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
        router.push("/")
        return
      }
      setProject({
        id: projectData.project_id,
        goal: projectData.goal,
        criteria: criteriaData?.map(c => ({
          id: c.criteria_id,
          name: c.name,
          weight: 0,
        })) || [],
        alternatives: alternativesData?.map(a => ({
          id: a.alternatives_id,
          name: a.name,
          description: a.description,
          weight: 0,
          imageUrl: a.image_url,
        })) || [],
        createdAt: projectData.created_at,
        updatedAt: projectData.updated_at,
      })
      setLoading(false)
    }
    fetchData()
  }, [authLoading, projectId, setProject, router])

  const handleSaveAll = async (user: any, project: AHPProject | null) => {
    if (!user) return
    if (!project) return
    setIsSaving(true)

    try {
      // alternativesテーブルにあるプロジェクト削除
      deleteFolder(user.id, project.id)
      const { error: alternativesDeleteError } = await supabase.from("alternatives").delete().eq("project_id", project.id)
      if (alternativesDeleteError) throw alternativesDeleteError

      // criteriaテーブルにあるプロジェクト削除
      const { error: criteriaDeleteError } = await supabase.from("criteria").delete().eq("project_id", project.id)
      if (criteriaDeleteError) throw criteriaDeleteError

      // projectテーブルにあるプロジェクト削除
      const { error: deleteError } = await supabase.from("project").delete().eq("project_id", project.id)
      if (deleteError) throw deleteError

      // 1. Supabase Storageへ画像アップロード
      const uploadedAlternatives = await Promise.all (
        project.alternatives.map(async (alt, i) => {
          let imageUrl = alt.imageUrl
          // 画像がローカルURL(blob)の場合のみアップロード
          if (alt.imageUrl?.startsWith("blob:")) {
            const blob = await fetch(alt.imageUrl).then(res => res.blob())
            const filePath = `alternatives/${user?.id}/${project.id}/${Date.now()}_${i}.jpg`
            const { error: uploadError } = await supabase.storage
              .from("images") // あらかじめ作ったバケット
             .upload(filePath, blob, { contentType: "image/jpeg", upsert: true })
            if (uploadError) throw uploadError
            const { data: urlData }  = supabase.storage.from("images").getPublicUrl(filePath)
            imageUrl = `${urlData.publicUrl}?t=${Date.now()}`
          }
          return {...alt, imageUrl}
        })
      )

      // 2. project(goal)を更新
      const { data, error: customerError } = await supabase
        .from("customer")
        .select("name")
        .eq("customer_id", user?.id)
        .single()
      if (customerError) throw customerError
      const { error: error } = await supabase
        .from("project")
        .upsert([{
            customer_id: user?.id,
            project_id: project.id,
            goal: project.goal,
            created_at: project.createdAt,
            updated_at: project.updatedAt,
            owner: data.name
          }])
      if (error) throw error

      // 3. criteriaを更新
      const { error: criteriaError } = await supabase
        .from("criteria")
        .upsert(
          project.criteria.map((c, i) => ({
            criteria_id: c.id,
            customer_id: user?.id,
            project_id: project.id,
            name: c.name,
            weight: 0,
            no: i + 1,
          }))
        )
        if (criteriaError) throw criteriaError

      // 4. alternativesを更新
      const { error: alternativesError } = await supabase
        .from("alternatives")
        .upsert(
          uploadedAlternatives.map((a, i) => ({
            alternatives_id: a.id,
            project_id: project.id,
            customer_id: user?.id,
            name: a.name,
            description: a.description,
            image_url: a.imageUrl,
            weight: 0,
            no: i + 1,
          }))
        )
        if (alternativesError) throw alternativesError

        // 4.成功トースト
        toast.success("更新しました!")

        // 5. プロジェクトごとの一対比較画面へ遷移
        router.replace(`/project/pairwise/${project.id}`)

    } catch(err) {
      console.error(err)
      toast.error("更新に失敗しました")
    } finally {
      setIsSaving(false)
  }}
  if (!project) return <div>Loading...</div>
  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-6">プロジェクトを更新する</h1>
      <div className="flex flex-col gap-4">
        <section>
          <GoalInput />
        </section>
        <section>
          <CriteriaManager />
        </section>
        <section>
          <AlternativesManager />
        </section>
      </div>
      <div className="flex justify-between">
        <CancelButton />
        {(project.goal !== "" && project.criteria.length > 2 && project.alternatives.length > 2) ? (
          <Button
            size="lg"
            variant="secondary"
            onClick={() => handleSaveAll(user, project)}
            disabled={isSaving}
            className="hover:bg-muted/50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin mr-2 w-4 h-4 border-2 border-t-transparent rounded-full border-primary"></div>
                更新中...
              </>
            ) : (
              <>
                更新
              </>
            )}
          </Button>
        ) : (
          <Button
            size="lg"
            variant="secondary"
            disabled
          >
            更新
          </Button>
        ) }
      </div>
    </div>
  )
}
