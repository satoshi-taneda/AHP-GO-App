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
  ci: number
}
type Weight = {
  weightCriteria: number[]
  weightAlternatives: number[][]
}

type Pairwise = {
  criteriaName: { a: string, b: string }
  altImage: { a: string, b: string }
  altName: { a: string, b: string }
  altDescription: { a: string, b: string }
}

function importance(selected: number) {
  // 重要度を言葉で表現
  const num = Math.abs(selected) + 1
  if (num === 3) {
    return '"少し"'
  } else if (num === 5) {
    return '"かなり"'
  } else if (num === 7) {
    return '"うんと"'
  } else if (num === 2) {
    return '"1-3の中間"'
  } else if (num === 4) {
    return '"3-5の中間"'
  } else {
    return ''
  }
}

function handleSelected(a: string, b: string, selected: number) {
  if (selected < 0) {
    return `${a}の方が${importance(selected)}重要`
  } else if (selected > 0) {
    return `${b}の方が${importance(selected)}重要`
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
  const [ahpLoading, setAhpLoading] = useState(true)
  const [prevFlag, setPrevFlag] = useState(false)
  const [selected, setSelected] = useState<number>(9)
  const [numCriteria, setNumCriteria] = useState<number>(0)
  const [numAlternatives, setNumAlternatives] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)
  const [matrixNum, setMatrixNum] = useState<number>(0)
  const [counter, setCounter] = useState<number>(1)
  const [row, setRow] = useState<number>(0)
  const [column, setColumn] = useState<number>(1)
  const [matrices, setMatrices] = useState<ComparisonMatrix[]>([])
  const [weight, setWeight] = useState<Weight>({
    weightCriteria: [],
    weightAlternatives: [[]]
  })
  const [pairwise, setPairwise] = useState<Pairwise>({
    criteriaName: {a: "", b: "" },
    altImage: {a: "", b: "" },
    altName: {a: "", b: "" },
    altDescription: {a: "", b: "" },
  })
  const projectId = params?.id as string
  const marks = [-6, -4, -2, 0, 2, 4, 6]  // 奇数目盛り
  const marks2 = [-3, -1, 1, 3]           // 偶数目盛り

  // 一対比較行列の更新用関数
  const updateMatrixValue = (id: string, row: number, col: number, value: number) => {
    setMatrices((prev: ComparisonMatrix[]) =>
      prev.map((item: ComparisonMatrix) =>
        item.id === id
          ? {
              ...item,
              matrix: item.matrix.map((r, i) =>
                i === row ? r.map((c, j) => (j === col ? value : c)) : r
              )
            }
          : item
  ))}

  const updateCI = (id: string, value: number) => {
    setMatrices((prev: ComparisonMatrix[]) =>
      prev.map((item: ComparisonMatrix) =>
        item.id === id
          ? {
              ...item,
              ci: value
            }
          : item
  ))}
  const calcWeight = () => {
    if (matrixNum === 0 || row !== 0 || column !== 1) return
    const arr = matrices[matrixNum-1].matrix
    let num = 0
    let lambdaMax = 0
    let diff = 0
    let ci = 0
    console.log(arr)
    if (matrixNum - 1 === 0) {
      num = numCriteria
    } else {
      num = numAlternatives
    }
    const v = new Array(num).fill(0)
    const v2 = new Array(num).fill(0)
    const w = new Array(num).fill(0)
    for (let i = 0; i < num; i++) {
      v[i] = (1 / num)
    }

    // 固有ベクトル計算
    for (let k = 0; k < 10000; k++) {
      for (let i = 0; i < num; i++)
        for (let j = 0; j < num; j++)
          v2[i] += arr[i][j] * v[j]

      lambdaMax = 0
      for (let i = 0; i < num; i++)
        lambdaMax += v2[i]

      for (let i = 0; i < num; i++)
        w[i] = v2[i] / lambdaMax

      diff = 0
      for (let i = 0; i < num; i++)
        diff += Math.abs(w[i] - v[i])
      if (diff < 0.00001) {
        ci = (lambdaMax - num) / (num - 1)
        break
      }
      // 次の計算の準備
      for (let i = 0; i < num; i++) {
        v[i] = w[i]
        v2[i] = 0
      }
    }
    // 固有ベクトル(ウェイト)をセット
    setWeight(prev => ({
      ...prev,
      weightCriteria: w
    }))

    if (ci) {
      if (ci > 0.00001) updateCI(matrices[matrixNum-1].id, ci)
      if (ci < 0.1) {
        toast.success("C.I.チェック正常!")
      } else {
        let message = ""
        if (matrixNum - 1 === 0) {
          message = matrices[matrixNum-1].id
        } else {
          message = `候補の${matrices[matrixNum-1].id}の観点`
        }
        toast.error(`C.I.チェック異常(${message}の比較を見直してください)`)
      }
    }
    if (ahpLoading) return
    console.log("入力終了")
    setAhpLoading(true)
  }

  const handlePrev = (num: number) =>  {
    let prevRow = row
    let prevCol = column
    let prevMatrixNum = matrixNum
    while (true) {
      if (prevCol > prevRow) {
        prevCol -= 1
      } else if (prevRow > 0) {
        prevRow = prevRow - 1
        prevCol = num - 1
      } else {
        prevRow = num - 2
        prevCol = num - 1
        if (prevMatrixNum === 1) {
          prevRow = numCriteria - 2
          prevCol = numCriteria - 1
        }
        if (prevMatrixNum > 0) {
          prevMatrixNum -= 1
          setMatrixNum(prevMatrixNum)
        }
        break
      }
      if (prevRow !== prevCol) break
    }
    setRow(prevRow)
    setColumn(prevCol)
    setCounter(prev => prev - 1)
    setPrevFlag(true)
    const prevSelected = matrices[prevMatrixNum].matrix[prevRow][prevCol]
    const prevSelectedT = matrices[prevMatrixNum].matrix[prevCol][prevRow]
    if (prevSelected > 1) {
      setSelected(prevSelected * -1 + 1)
    } else {
      setSelected(prevSelectedT - 1)
    }
  }

  const handleNext = (num: number) =>  {
    // 選択した値を一対比較行列の成分としてセット
    if (selected < 0) {
      updateMatrixValue(matrices[matrixNum].id, row, column, Math.abs(selected) + 1)
      updateMatrixValue(matrices[matrixNum].id, column, row, 1 / (Math.abs(selected) + 1))
    } else {
      updateMatrixValue(matrices[matrixNum].id, column, row, Math.abs(selected) + 1)
      updateMatrixValue(matrices[matrixNum].id, row, column, 1 / (Math.abs(selected) + 1))
    }
    // 次の一対比較行列の成分へ移動
    let nextRow = row
    let nextCol = column
    let nextMatrixNum = matrixNum
    while (true) {
      if (nextCol < num - 1) {
        nextCol += 1
      } else if (nextRow < num - 1) {
        nextCol = nextRow + 1
        nextRow += 1
      } else {
        nextRow = 0
        nextCol = 1
        if (matrixNum < num) {
          nextMatrixNum += 1
          setMatrixNum(nextMatrixNum)
        }
        break
      }
      if (nextRow !== nextCol ) break
    }

    // 次の一対比較行列の成分をセット
    setRow(nextRow)
    setColumn(nextCol)
    setCounter(prev => prev + 1)

    // 次の値が既にセットされている場合は、実施済みとして処理
    const nextSelected = matrices[nextMatrixNum].matrix[nextRow][nextCol]
    const nextSelectedT = matrices[nextMatrixNum].matrix[nextCol][nextRow]
    if (nextSelected > 0) {
      if (nextSelected > 1) {
        setSelected(nextSelected * -1 + 1)
      } else {
        setSelected(nextSelectedT - 1)
      }
    } else {
      setPrevFlag(false)
      setSelected(9)
    }
  }

  const handleExec = () =>  {
    // 選択した値を一対比較行列の成分としてセット
    if (selected < 0) {
      updateMatrixValue(matrices[matrixNum].id, row, column, Math.abs(selected) + 1)
      updateMatrixValue(matrices[matrixNum].id, column, row, 1 / (Math.abs(selected) + 1))
    } else {
      updateMatrixValue(matrices[matrixNum].id, column, row, Math.abs(selected) + 1)
      updateMatrixValue(matrices[matrixNum].id, row, column, 1 / (Math.abs(selected) + 1))
    }
    // 一対比較行列確定
    setRow(0)
    setColumn(1)
    setAhpLoading(false)
  }

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
    if (!project) return
    const criteriaCount = project.criteria.length
    const altCount = project.alternatives.length
    const num = (criteriaCount - 1) * criteriaCount / 2 + criteriaCount * (altCount - 1) * altCount / 2
    setNumCriteria(criteriaCount)
    setNumAlternatives(altCount)
    setTotal(num)
    // 各評価基準を基にした一対比較行列を作成
    const newMatrices: ComparisonMatrix[] = project.criteria.map((c) => ({
      id: c.name,
      matrix: Array.from({ length: altCount }, (_, i) =>
        Array.from({ length: altCount }, (_, j) => (i === j ? 1 : 0))
      ),
      ci: 0
    }))
    setMatrices(newMatrices)
    setMatrices(prev => [
      {
       id: "評価基準",
       matrix: Array.from({ length: criteriaCount }, (_, i) =>
         Array.from({ length: criteriaCount }, (_, j) => (i === j ? 1 : 0))
        ),
        ci: 0
      },
      ...prev
    ])
  }, [project])

  useEffect(() => {
    if (loading) return
    // ウェイトと整合度の計算
    calcWeight()
    console.log(matrices)
    console.log(weight)
  }, [row, column])

  // レンダリング用のペア配列作成
  useEffect(() => {
    if (row < numCriteria && column < numCriteria && matrixNum === 0 && project) {
      const names = {
        a: project.criteria[row].name,
        b: project.criteria[column].name,
      }
      setPairwise((prev: any) => ({
        ...prev,
        criteriaName: {...names},
      }))
    }
    if (row < numAlternatives && column < numAlternatives && matrixNum > 0 && project) {
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
      setPairwise((prev: any) => ({
        ...prev,
        altImage: {...altImages},
        altName: {...altNames},
        altDescription: {...altDescriptions},
      }))
    }
  }, [row, column, project])


  // Supabaseから取得中であればローディングスピナーを表示
  if (loading) return <LoadingSpinner />

  return (
    <>
      <div className="h-[70vh] overflow-y-auto max-w-5xl mx-auto space-y-6">
          {matrixNum > 0
            ? (
              <h3 className="flex text-3xl font-semibold">
                候補の
                <span className="text-blue-500 font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  {matrices[matrixNum].id}
                </span>
                の観点の比較
              </h3>
              )
            :<h3 className="flex text-3xl font-semibold">評価基準の比較</h3>
          }
        <div className="p-6 bg-muted/30 rounded-xl shadow">
          <div className="text-xl text-center text-muted-foreground font-semibold">
            {/* 重要度を言葉で表現 */}
            {matrixNum > 0
              ? handleSelected(pairwise.altName.a, pairwise.altName.b, selected)
              : handleSelected(pairwise.criteriaName.a, pairwise.criteriaName.b, selected)
            }
          </div>
          {/* 目盛りボタン */}
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-center flex-1">
              {matrixNum > 0 ? (
                <>
                  <div className="relative inline-block group">
                    {pairwise.altImage.a ? (
                      <Image
                        src={pairwise.altImage.a}
                        alt={pairwise.altName.a}
                        width={120}
                        height={120}
                        className="rounded-lg group-hover:scale-125 transition-transform duration-300"
                      />) : (
                      <Image
                        src="/images/noimage_w.png"
                        alt="No Image"
                        width={120}
                        height={120}
                        className="rounded-lg group-hover:scale-125 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mb-3
                      w-64 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      whitespace-pre-line z-50 pointer-events-none"
                    >
                      <p>{pairwise.altDescription.a}</p>
                      {/* 吹き出しの三角形 */}
                      <div
                        className="absolute left-1/2 bottom-full -translate-x-1/2
                          w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent
                          border-b-8 border-b-gray-800"
                      ></div>
                    </div>
                  </div>
                  <h3 className="font-semibold mt-2">{pairwise.altName.a}</h3>
                </>
                ) : (
                  <div className="flex text-3xl font-bold">
                    {pairwise.criteriaName.a}
                  </div>
                )
              }
            </div>
            <span className="text-3xl  px-4 text-muted-foreground">vs</span>
            <div className="flex flex-col items-center flex-1">
              {matrixNum > 0 ? (
                <>
                  <div className="relative inline-block group">
                    {pairwise.altImage.b ? (
                      <Image
                        src={pairwise.altImage.b}
                        alt={pairwise.altName.b}
                        width={120}
                        height={120}
                        className="rounded-lg group-hover:scale-125 transition-transform duration-300"
                      />) : (
                      <Image
                        src="/images/noimage_b.png"
                        alt="No Image"
                        width={120}
                        height={120}
                      />
                    )}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mb-3
                      w-64 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      whitespace-pre-line z-50 pointer-events-none"
                    >
                      <p>{pairwise.altDescription.b}</p>
                      {/* 吹き出しの三角形 */}
                      <div
                        className="absolute left-1/2 bottom-full -translate-x-1/2
                          w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent
                          border-b-8 border-b-gray-800"
                      ></div>
                    </div>
                  </div>
                  <h3 className="font-semibold mt-2">{pairwise.altName.b}</h3>
                </>
                ) : (
                  <div className="flex text-3xl font-bold p-12">
                    {pairwise.criteriaName.b}
                  </div>
                )
              }
            </div>
          </div>

          <div className="flex flex-col gap-4 text-center text-xl text-muted-foreground">
            <div className="flex justify-center text-xs text-muted-foreground gap-32">
              {marks2.map((mark2: number) => (
                <motion.div
                  key={mark2}
                  whileTap={{ scale: 0.9 }}
                  animate={{
                    scale: mark2 === selected ? 1.15 : 1,
                    rotate: mark2 === selected ? 2 : 0
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 15}}
                >
                  <Button
                    className={
                      `rounded-full transition-all duration-200
                      ${mark2 === selected
                        ? prevFlag ? "shadow-lg text-white bg-muted-foreground hover:bg-muted-foreground hover:text-white"
                        : "shadow-lg text-white bg-green-500 hover:bg-green-500 hover:text-white"
                        : "bg-muted"}`
                    }
                    size="icon"
                    variant="ghost"
                    onClick={() => setSelected(mark2)}
                  >
                    {Math.abs(mark2) + 1}
                  </Button>
                </motion.div>
              ))}
            </div>
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
                        ? prevFlag ? "shadow-lg text-white bg-muted-foreground hover:bg-muted-foreground hover:text-white"
                        : "shadow-lg text-white bg-green-500 hover:bg-green-500 hover:text-white"
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
            {matrixNum > 0 ? (
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>←{pairwise.altName.a}寄り</span>
                <span>{pairwise.altName.b}寄り→</span>
              </div>
            ) : (
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>←{pairwise.criteriaName.a}寄り</span>
                <span>{pairwise.criteriaName.b}寄り→</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="max-w-lg mx-auto flex justify-between items-center">
        <Button
          size="default"
          variant="ghost"
          disabled={loading || counter === 1}
          onClick={() => {matrixNum > 0 ? handlePrev(numAlternatives) : handlePrev(numCriteria)}}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />戻る
        </Button>
        <p className="text-sm text-center text-muted-foreground">
          {counter} / {total}
        </p>
        <Button
          size="default"
          variant="ghost"
          disabled={loading || selected === 9 || counter === total}
          onClick={() => {matrixNum > 0 ? handleNext(numAlternatives) : handleNext(numCriteria)}}
        >
          次へ<ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
      <div className="max-w-3xl mx-auto flex justify-end mt-4">
        <Button
          size="lg"
          variant="secondary"
          onClick={handleExec}
        >
          実行
        </Button>
      </div>
    </>
  )
}
