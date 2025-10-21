"use client"
import type { AHPProject } from "@/lib/types"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useAHP, createDefaultProject } from "@/contexts/AHPContext"
import { supabase } from "@/lib/supabaseClient"
import { GoalInput } from "@/components/GoalInput"
import { CriteriaManager } from "@/components/CriteriaManager"
import { AlternativesManager } from "@/components/AlternativesManager"
import ReturnButton from "@/components/ReturnButton"

export default function NewProjectPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const { project, setProject } = useAHP()

  // 認証チェック
  useEffect(() => {
    if (authLoading) return
    if (!user) router.push("/auth/login")
  }, [user, authLoading, router])

  // 初期化
  useEffect(() => {
    setProject(createDefaultProject())
  }, [])

  const handleSaveAll = async (user: any, project: AHPProject | null) => {
    if (!user) return
    if (!project) return
    setIsSaving(true)
    try {
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

      // 2. project(goal)を保存
      const { data, error: customerError } = await supabase
        .from("customer")
        .select("name")
        .eq("customer_id", user?.id)
        .single()
      if (customerError) throw customerError

      const { error: projectError } = await supabase
        .from("project")
        .upsert([{
            customer_id: user?.id,
            project_id: project.id,
            goal: project.goal,
            created_at: project.createdAt,
            updated_at: project.updatedAt,
            owner: data.name
          }])
      if (projectError) throw projectError

      // 3. criteriaを保存
      const { error: criteriaError } = await supabase
        .from("criteria")
        .upsert(
          project.criteria.map((c, i) => ({
            criteria_id: c.id,
            project_id: project.id,
            customer_id: user?.id,
            name: c.name,
            weight: 0.0,
            no: i + 1,
          }))
        )
        if (criteriaError) throw criteriaError

      // 4. alternativesを保存
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
            weight: 0.0,
            no: i + 1,
          }))
        )
        if (alternativesError) throw alternativesError

        // 4. 成功トースト
        toast.success("保存しました!")

        // 5. プロジェクトごとの一対比較画面へ遷移
        router.replace(`/project/pairwise/${project.id}`)

    } catch(err) {
      console.error(err)
      toast.error("保存に失敗しました")
    } finally {
      setIsSaving(false)
  }}
  if (!project) return <div>Loading...</div>

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-6">新しいプロジェクト</h1>
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
        <ReturnButton />
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
              保存中...
            </>
          ) : (
            <>
              保存
            </>
          )}
        </Button>
        ) : (
          <Button variant="secondary" disabled>保存</Button>
        ) }
      </div>
    </div>
  )
}
