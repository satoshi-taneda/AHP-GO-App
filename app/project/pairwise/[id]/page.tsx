"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, Check, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { useAHP } from "@/contexts/AHPContext"
import { supabase } from "@/lib/supabaseClient"
import Image from "next/image"
import LoadingSpinner from "@/components/LoadingSpinner"
import AhpCompaisonSlider from "@/components/AhpComparisonSlider"
import ProgressCircle from "@/components/ProgressCircle"

type ComparisonMatrix = {
  id: string
  matrix: number[][]
  ci: number
}
type Weight = {
  weightCriteria: number[]
  weightAlternatives: number[][]
  score: number[]
}

type Pairwise = {
  criteriaName: { a: string, b: string }
  altImage: { a: string, b: string }
  altName: { a: string, b: string }
  altDescription: { a: string, b: string }
}

export default function PairWiseComparison() {
  let totalLoop = 0
  const router = useRouter()
  const params = useParams()
  const projectId = params?.id as string
  const { user, loading: authLoading } = useAuth()
  const { project, setProject } = useAHP()
  const [loading, setLoading] = useState(true)
  const [ahpLoading, setAhpLoading] = useState(true)
  const [complete, setComplete] = useState(false)
  const [ciCheck, setCiCheck] = useState(false)
  const [selected, setSelected] = useState<number>(0)
  const [numCriteria, setNumCriteria] = useState<number>(0)
  const [numAlternatives, setNumAlternatives] = useState<number>(0)
  const [total, setTotal] = useState<number>(0)
  const [numMatrix, setNumMatrix] = useState<number>(0)
  const [counter, setCounter] = useState<number>(1)
  const [counterLoop, setCounterLoop] = useState<number>(1)
  const [row, setRow] = useState<number>(0)
  const [column, setColumn] = useState<number>(1)
  const [matrices, setMatrices] = useState<ComparisonMatrix[]>([])
  const [weight, setWeight] = useState<Weight>({
    weightCriteria: [],
    weightAlternatives: [],
    score: []
  })

  if (numMatrix > 0) {
    totalLoop = (numAlternatives - 1) * numAlternatives / 2
  } else {
    totalLoop = (numCriteria - 1) * numCriteria / 2
  }

  const [pairwise, setPairwise] = useState<Pairwise>({
    criteriaName: {a: "", b: "" },
    altImage: {a: "", b: "" },
    altName: {a: "", b: "" },
    altDescription: {a: "", b: "" },
  })

  // 一対比較行列成分更新
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

  // ウェイト更新
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

  const handlePrev = (num: number) =>  {
    let prevRow = row
    let prevCol = column
    let prevMatrixNum = numMatrix
    setCounter(prev => prev - 1)
    setCounterLoop(prev => prev - 1)
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
          setNumMatrix(prevMatrixNum)
        }
        if (prevMatrixNum > 0) {
          setCounterLoop(numAlternatives * (numAlternatives - 1) / 2)
        } else {
          setCounterLoop(numCriteria * (numCriteria - 1) / 2)
        }
        break
      }
      if (prevRow !== prevCol) break
    }
    setRow(prevRow)
    setColumn(prevCol)

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
    if (selected < 0 && !ciCheck) {
      updateMatrixValue(matrices[numMatrix].id, row, column, Math.abs(selected) + 1)
      updateMatrixValue(matrices[numMatrix].id, column, row, 1 / (Math.abs(selected) + 1))
    } else {
      updateMatrixValue(matrices[numMatrix].id, column, row, Math.abs(selected) + 1)
      updateMatrixValue(matrices[numMatrix].id, row, column, 1 / (Math.abs(selected) + 1))
    }
    // 次の一対比較行列の成分へ移動
    let nextRow = row
    let nextCol = column
    let nextNumMatrix = numMatrix
    while (true) {
      if (nextCol < num - 1) {
        nextCol += 1
      } else if (nextRow < num - 1) {
        nextCol = nextRow + 1
        nextRow += 1
      } else {
        nextRow = 0
        nextCol = 1
        if (numMatrix < numCriteria + 1) {
          nextNumMatrix += 1
          setNumMatrix(nextNumMatrix)
        }
        break
      }
      if (nextRow !== nextCol ) break
    }

    // 次の一対比較行列の成分をセット
    setRow(nextRow)
    setColumn(nextCol)
    setCounter(prev => prev + 1)
    setCounterLoop(prev => prev + 1)

    // 最終比較ページであればそのまま終了
    if (total === counter) return

    // 次の値が既にセットされている場合は、実施済みとして処理
    const nextSelected = matrices[nextNumMatrix].matrix[nextRow][nextCol]
    const nextSelectedT = matrices[nextNumMatrix].matrix[nextCol][nextRow]
    if (nextSelected > 0) {
      if (nextSelected > 1) {
        setSelected(nextSelected * -1 + 1)
      } else {
        setSelected(nextSelectedT - 1)
      }
    } else {
      setSelected(0)
    }
  }

  const handleExec = () =>  {
    // 選択した値を一対比較行列の成分としてセット
    if (selected < 0) {
      updateMatrixValue(matrices[numMatrix].id, row, column, Math.abs(selected) + 1)
      updateMatrixValue(matrices[numMatrix].id, column, row, 1 / (Math.abs(selected) + 1))
    } else {
      updateMatrixValue(matrices[numMatrix].id, column, row, Math.abs(selected) + 1)
      updateMatrixValue(matrices[numMatrix].id, row, column, 1 / (Math.abs(selected) + 1))
    }
    // 次の一対比較行列の成分へ移動
    setRow(0)
    setColumn(1)
    setAhpLoading(false)
    setCounter(prev => prev + 1)
    setCounterLoop(prev => prev + 1)
    let nextNumMatrix = numMatrix
    if (numMatrix < numCriteria + 1) {
      nextNumMatrix += 1
      setNumMatrix(nextNumMatrix)
    }
  }

  // ウェイトとC.I.計算
  const calcWeight = () => {
    if (numMatrix === 0 || row !== 0 || column !== 1) return
    let num = 0
    if (numMatrix - 1 === 0) {
      num = numCriteria
    } else {
      num = numAlternatives
    }
    let lambdaMax = 0
    let diff = 0
    let ci = 0
    const v = new Array(num).fill(0)
    const v2 = new Array(num).fill(0)
    const w = new Array(num).fill(0)
    const arr = matrices[numMatrix-1].matrix
    const weightArray = weight.weightAlternatives
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
      // 次の計算準備
      for (let i = 0; i < num; i++) {
        v[i] = w[i]
        v2[i] = 0
      }
    }

    // 整合度チェック
    if (ci) {
      if (ci < 0.1) {
        if (ciCheck) {
          toast.success(`CIチェック OK!`)
        }
      } else {
        if (ciCheck) {
          toast.error(`CIチェック 比較に整合性がない可能性があります`)
        }
      }
      if (ci >= 0.00001) updateCI(matrices[numMatrix-1].id, ci)
    } else {
      toast.error(`データを入力してください`)
    }

    // CIチェック中であれば一つ前に戻って終了
    if (ciCheck) {
      handlePrev(num)
      return
    }

    // 固有ベクトル(ウェイト)をセット
    if (numMatrix - 1 === 0) {
      setWeight(prev => ({
        ...prev,
        weightCriteria: w
      }))
    } else {
      for (let i = 0; i < numAlternatives; i++)
        weightArray[i][numMatrix-2] = w[i]
      setWeight(prev => ({
        ...prev,
        weightAlternatives: weightArray
      }))
    }

    // 次の一対比較行列の入力のためカウンターを1にセット
    setCounterLoop(1)

    // アンケート回答中であれば終了
    if (ahpLoading) return

    // 総合評価の計算
    const score = new Array(numAlternatives).fill(0)
    for (let i = 0; i < numAlternatives; i++)
      for (let j = 0; j < numCriteria; j++)
        score[i] += weight.weightAlternatives[i][j] * weight.weightCriteria[j]

    // スコアをセット
    setWeight(prev => ({
      ...prev,
      score: score
    }))

    // 完了フラグ
    setComplete(true)
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
        .order("no", { ascending: true })
      const { data: alternativesData } = await supabase
        .from("alternatives")
        .select("*")
        .eq("project_id", projectId)
        .order("no", { ascending: true })
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

  // 一対比較行列とウェイトの初期化
  useEffect(() => {
    if (!project) return
    const criteriaCount = project.criteria.length
    const altCount = project.alternatives.length
    const num = (criteriaCount - 1) * criteriaCount / 2 + criteriaCount * (altCount - 1) * altCount / 2
    setNumCriteria(criteriaCount)
    setNumAlternatives(altCount)
    setTotal(num)
    // ウェイト用の行列作成
    setWeight({
      weightCriteria: new Array(criteriaCount).fill(0),
      weightAlternatives: Array.from({ length: altCount }, () => Array(criteriaCount).fill(0)),
      score: new Array(altCount).fill(0)
    })
    // 各評価基準を基にした一対比較行列作成
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

  // ウェイトと整合度の計算
  useEffect(() => {
    if (loading) return
    calcWeight()
  }, [numMatrix])

  // 評価値を変えた時はCIの再計算準備
  useEffect(() => {
    setCiCheck(false)
  }, [row, column, selected])

  // レンダリング用のペア配列作成
  useEffect(() => {
    if (row < numCriteria && column < numCriteria && numMatrix === 0 && project) {
      const names = {
        a: project.criteria[row].name,
        b: project.criteria[column].name,
      }
      setPairwise((prev: any) => ({
        ...prev,
        criteriaName: {...names},
      }))
    }
    if (row < numAlternatives && column < numAlternatives && numMatrix > 0 && project) {
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

  useEffect(() => {
    if (!complete || !project) return
    console.log(weight)
    const updateWeight = async () => {

      // Supabase-criteriaテーブルのcompleted更新
      const { error } = await supabase
        .from('project')
        .update({completed: true})
        .eq('project_id', projectId)
      if (error) {
        console.error(`完了フラグ更新失敗`)
      }

      // Supabase-criteriaテーブルのweight更新
      for (let i = 0; i < numCriteria; i++) {
        const { error } = await supabase
          .from('criteria')
          .update({weight: weight.weightCriteria[i]})
          .eq('project_id', projectId)
          .eq('no', i + 1)
        if (error) {
          console.error(`${project.criteria[i].name}のウェイト更新失敗`)
          break
        }
      }
      // Supabase-alternativesテーブルのweight更新
      for (let i = 0; i < numAlternatives; i++) {
        const { error } = await supabase
          .from('alternatives')
          .update({weight: weight.score[i]})
          .eq('project_id', projectId)
          .eq('no', i + 1)
        if (error) {
          console.error(`${project.alternatives[i].name}のウェイト更新失敗`)
          break
        }
      }
    }
    setLoading(true)
    updateWeight()
    setLoading(false)
  }, [complete])

  // ロード中の場合は、ローディングスピナーを表示
  if (loading) return <LoadingSpinner />

  return (
    <>
      {counter <= total ? (
        <>
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex justify-between items-center">
              {numMatrix > 0
                ? (
                  <h3 className="text-3xl font-semibold">
                    候補の
                    <span className="text-blue-500 font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      {matrices[numMatrix].id}
                    </span>
                    の観点の比較
                  </h3>
                  )
                : <h3 className="text-3xl font-semibold">評価基準の比較</h3>
              }
              <div>
                {matrices[numMatrix].ci ? matrices[numMatrix].ci < 0.1 ?  (
                  <AnimatePresence>
                    <motion.div
                      key="warning-banner"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex px-2 items-center border-b-2 border-green-600/20 bg-green-600/10 rounded-sm shadow-md">
                      <p className="text-green-600 italic">C.I.(整合度): {matrices[numMatrix].ci.toFixed(3)}</p>
                      <Check className="ml-2 p-1 bg-green-500 rounded-full font-bold text-white shadow-sm" />
                   </motion.div>
                 </AnimatePresence>
                ) : (
                  <AnimatePresence>
                    <motion.div
                      key="warning-banner"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="flex px-2 items-center border-b-2 border-destructive/20 bg-destructive/10 rounded-sm shadow-md">
                      <p className="text-destructive italic">C.I.(整合度): {matrices[numMatrix].ci.toFixed(3)}</p>
                      <AlertTriangle className="w-6 h-6 ml-2 p-1 font-bold text-yellow-600" />
                   </motion.div>
                 </AnimatePresence>
                ) :
                  <></>
                }
              </div>
            </div>
            <div className="p-8 bg-muted/30 rounded-xl shadow-lg space-y-4">
              {/* アイテム詳細 */}
              <div className="flex justify-end">
                <ProgressCircle step={counter} total={total} />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex flex-col items-center flex-1 justify-center">
                  {numMatrix > 0 ? (
                    <div className="relative inline-block group">
                      {pairwise.altName.a}
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
                    ) : (
                      <div className="p-8 flex text-2xl font-semibold">
                        {pairwise.criteriaName.a}
                      </div>
                    )
                  }
                </div>
                <span>VS</span>
                <div className="flex flex-col items-center flex-1 justify-center">
                  {numMatrix > 0 ? (
                    <div className="relative inline-block group">
                      {pairwise.altName.b}
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
                          className="rounded-lg group-hover:scale-125 transition-transform duration-300"
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
                    ) : (
                      <div className="p-8 flex text-2xl font-semibold">
                        {pairwise.criteriaName.b}
                      </div>
                    )
                  }
                </div>
              </div>
              {numMatrix > 0 ? (
                <AhpCompaisonSlider itemA={pairwise.altName.a} itemB={pairwise.altName.b} value={selected} onValueChange={setSelected} />
              ) :  (
                <AhpCompaisonSlider itemA={pairwise.criteriaName.a} itemB={pairwise.criteriaName.b} value={selected} onValueChange={setSelected} />
              )}
            </div>
          </div>
          <div className="max-w-lg mx-auto flex justify-between items-center mt-4">
            <Button
              size="default"
              variant="ghost"
              disabled={loading || counter === 1}
              onClick={() => {numMatrix > 0 ? handlePrev(numAlternatives) : handlePrev(numCriteria)}}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />前の比較
            </Button>
            <p>{counterLoop} / {totalLoop}</p>
            <Button
              size="default"
              variant="ghost"
              disabled={loading || counter === total}
              onClick={() => {numMatrix > 0 ? handleNext(numAlternatives) : handleNext(numCriteria)}}
            >
              次の比較<ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="max-w-4xl mx-auto flex justify-end items-center gap-4">
            {counterLoop === totalLoop && (
              <Button
                size="sm"
                variant="outline"
                onClick={
                  () => {
                    setCiCheck(true)
                    numMatrix > 0 ? handleNext(numAlternatives) : handleNext(numCriteria)
                  }
                }
              >
                <Check className="h-4 w-4 mr-1" /> CIチェック
              </Button>
            )}
            {counter === total  && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-500"
                onClick={handleExec}
              >
                AHP計算
              </motion.button>
            )}
          </div>
        </>
      ) : (
        <div className="flex flex-col tems-center justify-center h-screen text-center bg-gradient-to-b from-blue-50 to-white">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl font-bold text-blue-600"
          >
            🎉お疲れ様でした!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4 text-gray-600"
          >
            これでAHPは終わりです。
          </motion.p>
            <div className="max-w-xl mx-auto flex justify-between items-center mt-8">
              <Button
                size="lg"
                variant="ghost"
                disabled={loading || counter === 1}
                onClick={() => {
                  handlePrev(numAlternatives)
                  setAhpLoading(true)
                }}
              >
                やり直す
              </Button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600"
                onClick={() => router.push(`/project/${projectId}`)}
              >
                結果をみる
              </motion.button>
            </div>
          </div>
      )}
    </>
  )
}
