"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/contexts/AuthContext"
import { GoalInput } from "@/components/GoalInput"
import { CriteriaManager } from "@/components/CriteriaManager"
import { AlternativesManager } from "@/components/AlternativesManager"

type Project = {
  project_id: string
  goal: string
}

export default function ProjectForm({ project }: { project?: Project }) {
  const [goal, setGoal] = useState(project?.goal || "")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const isEditing = !!project
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // バリデーション
      if (!goal.trim()) {
        throw new Error("タイトルは必須です")
      }

      if (!goal.trim()) {
        throw new Error("内容は必須です")
      }

      // 直接Supabaseクライアントを使用
      if (isEditing) {
        // 編集の場合
        if (!project?.project_id) {
          throw new Error("プロジェクトIDが不正です")
        }

        console.log(`プロジェクト更新: ID=${project.project_id}, タイトル=${goal}, 内容長=${goal.length}文字`)

        const { data, error } = await supabase
          .from("project")
          .update({ goal })
          .eq("project_id", project.project_id)
          .select()

        if (error) {
          console.error("Supabase更新エラー:", error)
          throw new Error(`プロジェクトの更新に失敗しました: ${error.message}`)
        }

        console.log("更新成功:", data)
      } else {
        // 新規作成の場合
        console.log(`プロジェクト作成: タイトル=${goal}, 内容長=${goal.length}文字`)

        const { data, error } = await supabase
          .from("project")
          .insert([{ goal, customer_id: user.id }])
          .select()

        if (error) {
          console.error("Supabase挿入エラー:", error)
          throw new Error(`プロジェクトの作成に失敗しました: ${error.message}`)
        }

        console.log("作成成功:", data)
      }
      router.replace("/")

    } catch (error: any) {
      console.error("フォーム送信エラー:", error)
      setError(error.message || "エラーが発生しました")
    } finally {
      setLoading(false)
    }
  }

  return (
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
  )
}
