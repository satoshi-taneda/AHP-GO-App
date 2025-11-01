"use client"
import type { AHPProject } from "@/lib/types"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { useAHP, createDefaultProject } from "@/contexts/AHPContext"
import { supabase } from "@/lib/supabaseClient"
import { GoalInput } from "@/components/GoalInput"
import { CriteriaManager } from "@/components/CriteriaManager"
import { AlternativesManager } from "@/components/AlternativesManager"
import CancelButton from "@/components/CancelButton"

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
        toast.success("作成しました!")

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
    <div className="max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold mb-6">プロジェクトを新しく作成する</h1>
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
        {(project.goal !== "" && project.criteria.length > 2 && project.alternatives.length > 2) && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            disabled={isSaving}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600"
            onClick={() => handleSaveAll(user, project)}
          >
            {isSaving ? (
              <div className="flex justify-center items-center gap-2">
                <div className="animate-spin mr-2 w-4 h-4 border-2 border-t-transparent rounded-full border-primary">
                </div>
                  作成中...
              </div>
            ) : (
              <>
                作成
              </>
            )}
          </motion.button>
        )}
      </div>
    </div>
  )
}
