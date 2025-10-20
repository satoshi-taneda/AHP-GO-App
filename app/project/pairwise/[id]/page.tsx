"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useAHP } from "@/contexts/AHPContext"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import LoadingSpinner from "@/components/LoadingSpinner"

function importance(value: number) {
  const num = Math.abs(value) + 1
  if (num === 3) {
    return "少し"
  } else if (num === 5) {
    return "かなり"
  } else {
    return "うんと"
  }
}


function handleValue(value: number) {
  if (value < 0) {
    return `「A」が${importance(value)}重要`
  } else if (value > 0) {
    return `「B」が${importance(value)}重要`

  } else {
    return "同じくらい重要"
  }
          {value < 0
            ? `Aを${Math.abs(value)+1} 段階 優先`
            : value > 0
            ? `Bを${value+1} 段階 優先`
            : "同じくらい重要"
          }
}

export default function PairWiseComparison() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const { project, setProject } = useAHP()
  const [loading, setLoading] = useState(true)
  const [value, setValue] = useState(0)
  const projectId = params?.id as string
  const marks = [-6, -4, -2, 0, 2, 4, 6] // 目盛り位置

  // 認証チェック
  useEffect(() => {
    if (authLoading) return
    if (!user) router.push("/auth/login")
  }, [user, authLoading, router])

  // Supabaseからのデータ取得
  useEffect(() => {
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
  }, [projectId, setProject, router])

  // Supabaseから取得中であればローディングスピナーを表示
  if (loading) return <LoadingSpinner />

  // 一対比較の準備
  console.log(project)
  console.log(value)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-6">評価基準「A」と「B」の比較</h1>
      <div className="p-6 bg-muted/30 rounded-xl shadow">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center flex-1 text-center">
            <Image
              src="/images/shinsyakaijin_building.png"
              alt="test"
              width={120}
              height={120}
              className="rounded-lg" />
            <h3 className="font-semibold mt-2">A: 価格重視モデル</h3>
          </div>

          <span className="text-xl text-muted-foreground px-4">vs</span>
          <div className="flex flex-col items-center flex-1 text-center">
            <Image
              src="/images/shinsyakaijin_building.png"
              alt="test"
              width={120}
              height={120}
              className="rounded-lg" />
            <h3 className="font-semibold mt-2">B: 価格重視モデル</h3>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-center text-xl text-muted-foreground">
          {/* 値を表示 */}
          {handleValue(value)}
          {/* 目盛りラベル */}
          <div className="flex justify-between text-xs text-muted-foreground px-4">
            {marks.map((mark: number) => (
              <motion.div
                key={mark}
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: mark === value ? 1.15 : 1,
                  rotate: mark === value ? 2 : 0 
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15}}
              >
                <Button
                  className={
                    `rounded-full transition-all duration-200
                    ${mark === value
                      ? "shadow-lg text-white bg-blue-500 hover:bg-blue-500 hover:text-white" 
                      : "bg-muted"}`
                  }
                  size="icon"
                  variant="ghost"
                  onClick={() => setValue(mark)}
                >
                  {Math.abs(mark) + 1}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-lg mx-auto flex justify-between">
        <Button
          size="lg"
          variant="ghost"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />戻る
        </Button>
        <Button
         size="lg"
         variant="ghost"
         onClick={() => console.log(value+1)}
        >
          次へ<ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
