"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { CheckCircle2, Globe, Plus } from "lucide-react"
import Link from "next/link"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function DashBoard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [project, setProject] = useState<any>([])
  const [projectPublic, setProjectPublic] = useState<any>([])
  const [loading, setLoading] = useState(true)

  // プロジェクト一覧表示
  useEffect(() => {
    if (authLoading) return
    if (!user) router.push("/auth/login")
    Promise.resolve (
    supabase.from("project")
      .select("*, customer(name)")
      .eq("customer_id", user?.id)
      .order("updated_at", { ascending: false })
    )
    .then(({ data }) => {
      setProject(data || [])
    })
    .finally(() => setLoading(false))

    Promise.resolve (
    supabase.from("project")
      .select("*, customer(name)")
      .neq("customer_id", user?.id)
      .eq("published", true)
      .order("updated_at", { ascending: false })
    )
    .then(({ data }) => {
      setProjectPublic(data || [])
    })
    .finally(() => setLoading(false))
  }, [user, authLoading, router])

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Button
          size="default"
          variant="ghost"
          onClick={() => router.push("/project/new")}
        >
        <Plus className="w-4 h-4 mr-1" />新しく作成する
        </Button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-600"
          onClick={() => router.push(`/project/pairwise/1762139916553-bblcw9fd3`)}
        >
          チュートリアル開始
        </motion.button>
      </div>

      <h2 className="text-lg">Projects</h2>
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
                      <div className="flex justify-end items-center gap-2">
                        {p.published && (
                          <Globe size={20} />
                        )}
                        {p.completed && (
                          <CheckCircle2 size={20} />
                        )}
                      </div>
                    </div>
                    <h2 className="font-semibold text-lg mt-2">{p.goal}</h2>
                    <p className="text-foreground text-xs text-end">{p.customer.name || "匿名"}</p>
                  </Link>
                </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">現在、プロジェクトがありません。</p>
        )}
      </div>
      <div className="max-w-4xl mx-auto relative py-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
      </div>
      <h2 className="text-lg">Public</h2>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4">
        {projectPublic.length > 0 ? (
          projectPublic.map((p: any) => (
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
                      <div className="flex justify-end items-center gap-2">
                        {p.published && (
                          <Globe size={20} />
                        )}
                        {p.completed && (
                          <CheckCircle2 size={20} />
                        )}
                      </div>
                    </div>
                    <h2 className="font-semibold text-lg mt-2">{p.goal}</h2>
                    <p className="text-foreground text-xs text-end">{p.customer.name || "匿名"}</p>
                  </Link>
                </div>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground">現在、他のユーザーの公開中のプロジェクトがありません。</p>
        )}
      </div>
    </div>
  )
}
