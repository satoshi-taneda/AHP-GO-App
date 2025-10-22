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

type ComparisonMatrix = {
  id: string
  matrix: number[][]
}
type pairwiseInfo = {
  criteriaName: { a: string, b: string }
  altImage: { a: string, b: string }
  altName: { a: string, b: string }
  altDescription: { a: string, b: string }
}

function importance(selected: number) {
  // 重要度を言葉で表現
  const num = Math.abs(selected) + 1
  if (num === 3) {
    return "少し"
  } else if (num === 5) {
    return "かなり"
  } else {
    return "うんと"
  }
}

function handleSelected(selected: number) {
  if (selected < 0) {
    return `Aの方が${importance(selected)}重要`
  } else if (selected > 0) {
    return `Bの方が${importance(selected)}重要`

  } else {
    return "同じくらい重要"
  }
}

export default function PairWiseComparison() {
  const router = useRouter()
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const { project, setProject } = useAHP()
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<number>(0)
  const [totalCriteria, setTotalCriteria] = useState<number>(0)
  const [totalAlternatives, setTotalAlternatives] = useState<number>(0)
  const [totalPage, setTotalPage] = useState<number>(0)
  const [matrixNum, setMatrixNum] = useState<number>(0)
  const [row, setRow] = useState<number>(0)
  const [column, setColumn] = useState<number>(1)
  const [counter, setCounter] = useState<number>(1)
  const [matrices, setMatrices] = useState<ComparisonMatrix[]>([])
  const [info, setInfo] = useState<pairwiseInfo>({
    criteriaName: {a: "", b: "" },
    altImage: {a: "", b: "" },
    altName: {a: "", b: "" },
    altDescription: {a: "", b: "" },
  })
  const projectId = params?.id as string
  const marks = [-6, -4, -2, 0, 2, 4, 6] // 目盛り位置

  // Supabaseからのデータ取得
  useEffect(() => {
    // 認証チェック
    if (authLoading || !user) return
    if (!user) router.push("/auth/login")

    const fetchData = async () => {
      const { data: projectData, error: projectError } = await supabase
        .from("project")
        .select("*")
        .eq("project_id", projectId)
        .single()

      // ユーザチェック
      const customerId = projectData.customer_id
      if (user?.id !== customerId) router.push(`/project/${projectId}`)

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
  }, [authLoading, router])

  // 一対比較行列の初期化
  useEffect(() => {
    if (project) {
      const criteriaCount = project.criteria.length
      setTotalCriteria(criteriaCount)
      const altCount = project.alternatives.length
      setTotalAlternatives(altCount)
      const total = (criteriaCount - 1) * criteriaCount / 2 + criteriaCount * (altCount - 1) * altCount / 2
      setTotalPage(total)
      // 各評価基準を基にした一対比較行列を作成
      const newMatrices: ComparisonMatrix[] = project.criteria.map((c) => ({
        id: c.name,
        matrix: Array.from({ length: altCount }, (_, i) =>
          Array.from({ length: altCount }, (_, j) => (i === j ? 1 : 0))
      )}))
      setMatrices(newMatrices)
      setMatrices(prev => [
        {
         id: "評価基準",
         matrix: Array.from({ length: criteriaCount }, (_, i) =>
           Array.from({ length: criteriaCount }, (_, j) => (i === j ? 1 : 0))
        )},
        ...prev
      ])
    }
  }, [project, counter])

  const handlePrev = (total: number) =>  {
    let prevRow = row
    let prevCol = column
    let prevMatrixNum = matrixNum
    while (true) {
      if (prevCol > prevRow) {
        prevCol -= 1
      } else if (prevRow > 0) {
        prevRow = prevRow - 1
        prevCol = total - 1
      } else {
        prevRow = total - 2
        prevCol = total - 1
        if (prevMatrixNum === 1) {
          prevRow = totalCriteria - 2
          prevCol = totalCriteria - 1
        }
        if (prevMatrixNum > 0) {
          prevMatrixNum -= 1
          setMatrixNum(prevMatrixNum)
        }
        break
      }
      if (prevRow !== prevCol ) break
    }
    setRow(prevRow)
    setColumn(prevCol)
    setCounter(prev => prev - 1)
  }

  const handleNext = (total: number) =>  {
    let nextRow = row
    let nextCol = column
    let prevMatrixNum = matrixNum
    while (true) {
      if (nextCol < total - 1) {
        nextCol += 1
      } else if (nextRow < total - 1) {
        nextCol = nextRow + 1
        nextRow += 1
      } else {
        nextRow = 0
        nextCol = 1
        if (matrixNum < total - 1 + 1) {
          prevMatrixNum += 1
          setMatrixNum(prevMatrixNum)
        }
        break
      }
      if (nextRow !== nextCol ) break
    }
    setRow(nextRow)
    setColumn(nextCol)
    setCounter(prev => prev + 1)
  }

  useEffect(() => {
    if (row < totalCriteria && column < totalCriteria && matrixNum === 0 && project) {
      const names = {
        a: project.criteria[row].name,
        b: project.criteria[column].name,
      }
      setInfo((prev: any) => ({
        ...prev,
        criteriaName: {...names},
      }))
    }
    if (row < totalAlternatives && column < totalAlternatives && matrixNum > 0 && project) {
      const altImages = {
        a: project.alternatives[row].imageUrl,
        b: project.alternatives[column].imageUrl,
      }
      const altNames = {
        a: project.alternatives[row].name,
        b: project.alternatives[column].name,
      }
      const altDescriptions = {
        a: project.alternatives[row].description,
        b: project.alternatives[column].description,
      }
      setInfo((prev: any) => ({
        ...prev,
        altImage: {...altImages},
        altName: {...altNames},
        altDescription: {...altDescriptions},
      }))
    }
  }, [row, column, project])

  console.log(info)

  // Supabaseから取得中であればローディングスピナーを表示
  if (loading) return <LoadingSpinner />

  return (
    <>
    <div className="h-[55vh] overflow-y-auto max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold mb-6">
        {matrixNum > 0
          ? `候補の『${matrices[matrixNum].id}』の観点の比較`
          : "評価基準の比較"
        }
      </h1>
      <div className="p-6 bg-muted/30 rounded-xl shadow">
        <div className="flex justify-between items-center">
          <div className="flex flex-col items-center flex-1 text-center">
            {matrixNum > 0 ? (
              <>
              {info.altImage.a ? (
                  <div className="relative group w-64 h-40 overflow-hidden rounded-lg">
                    <Image
                        src={info.altImage.a}
                        alt="No Image"
                        width={120}
                        height={120}
                        className="rounded-lg group-hover:scale-110" />
                    <div className="absolute inset-0 bg-black/50 text-white
                      flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <p className="text-sm">{info.altDescription.a}</p>
                    </div>
                  </div>

                  ) : (
                  <div className="relative group w-64 h-40 overflow-hidden rounded-lg">
                    <div className="w-12 h-12 rounded bg-muted-foreground/10 group-hover:scale-110
                      flex items-center justify-center text-xs text-muted-foreground border">
                      No Image
                    </div>
                    <div className="absolute inset-0 bg-black/50 text-white
                      flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                        <p className="text-sm">{info.altDescription.a}</p>
                    </div>
                  </div>
                )
              }
                <h3 className="font-semibold mt-2">A: {info.altName.a}</h3>
              </>

              ) : (
              <div className="w-32 h-24 rounded bg-muted-foreground/10
                flex items-center justify-center text-3xl text-foreground border">
                {info.criteriaName.a}
              </div>
              )
            }
          </div>
          <span className="text-xl text-muted-foreground px-4">vs</span>
          <div className="flex flex-col items-center flex-1 text-center">
            {matrixNum > 0 ? (
              <>
               {info.altImage.b ? (
                    <Image
                      src={info.altImage.b || ""}
                      alt="No Image"
                      width={120}
                      height={120}
                      className="rounded-lg" />
                  ) : (
                  <div className="w-12 h-12 rounded bg-muted-foreground/10 flex items-center justify-center text-xs text-muted-foreground border">
                    No Image
                  </div>)
               }
               <h3 className="font-semibold mt-2">B: {info.altName.b}</h3>
              </>
              ) : (
              <div className="w-32 h-24 rounded bg-muted-foreground/10
                flex items-center justify-center text-3xl text-foreground border">
                {info.criteriaName.b}
              </div>
              )
            }
          </div>
        </div>

        <div className="flex flex-col gap-2 text-center text-xl text-muted-foreground">
          {/* 重要度を言葉で表現 */}
          {handleSelected(selected)}
          {/* 目盛りボタン */}
          <div className="flex justify-between text-xs text-muted-foreground px-4">
            {marks.map((mark: number) => (
              <motion.div
                key={mark}
                whileTap={{ scale: 0.9 }}
                animate={{
                  scale: mark === selected ? 1.15 : 1,
                  rotate: mark === selected ? 2 : 0
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15}}
              >
                <Button
                  className={
                    `rounded-full transition-all duration-200
                    ${mark === selected
                      ? "shadow-lg text-white bg-blue-500 hover:bg-blue-500 hover:text-white" 
                      : "bg-muted"}`
                  }
                  size="icon"
                  variant="ghost"
                  onClick={() => setSelected(mark)}
                >
                  {Math.abs(mark) + 1}
                </Button>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>←Aの方が重要</span>
            <span>Bの方が重要→</span>
          </div>
        </div>
      </div>
    </div>
    <div className="max-w-lg mx-auto flex justify-between items-center">
      <Button
        size="lg"
        variant="ghost"
        disabled={loading || counter === 1}
        onClick={() => {matrixNum > 0 ? handlePrev(totalAlternatives) : handlePrev(totalCriteria)}}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />戻る
      </Button>
      <p className="text-sm text-center text-muted-foreground">
        {counter} / {totalPage}
      </p>
      <Button
        size="lg"
        variant="ghost"
        disabled={loading || counter === totalPage}
        onClick={() => {matrixNum > 0 ? handleNext(totalAlternatives) : handleNext(totalCriteria)}}
      >
        次へ<ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
    </>
  )
}
