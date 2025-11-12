"use client"
import { useState } from "react"
import { useAHP } from "@/contexts/AHPContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { Plus, Trash2, Edit, AlertTriangle, Bot } from "lucide-react"
import type { Criterion } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import LoadingSpinner from "@/components/LoadingSpinner"

type Criteria = {
  name: string
  description: string
}

export function CriteriaManager() {
  const { project, addCriterion, updateCriterion, deleteCriterion } = useAHP()
  const [newCriterionName, setNewCriterionName] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  // 編集用ステート
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  // Gemini相談
  const [loading, setLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [criteria, setCriteria] = useState<Criteria[]>([])
  const [selected, setSelected] = useState<string[]>([])

  const handleAddCriterion = () => {
    const criterionName = newCriterionName.trim()
    if (criterionName === "") return
    if (!project?.criteria.map(c => c.name).includes(criterionName)) {
      addCriterion(criterionName)
      setNewCriterionName("")
      setIsAdding(false)
    }
  }
  const handleAddCriterion2 = () => {
    for (const criterionName of selected) {
      if (!project?.criteria.map(c => c.name).includes(criterionName))
        addCriterion(criterionName.trim())
    }
    setIsGenerating(false)
  }

  const handleEditStart = (criterion: Criterion) => {
    setEditingId(criterion.id)
    setEditingName(criterion.name)
  }
  const handleEditSave = () => {
    if (!editingId || !editingName?.trim()) return
    if (!project?.criteria.map(c => c.name).includes(editingName))
      updateCriterion(editingId, { name: editingName.trim() })
    setEditingId(null)
    setEditingName("")
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditingName("")
  }

  // Geminiでの評価基準の提案
  const handleGenerate = async () => {
    if (!project?.goal) {
      toast("未入力検知",
            {description: "相談には最終目標が必要です。",
            icon: <AlertTriangle className="text-yellow-500" />,
            className: "border-yellow-300 bg-yellow-50 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700",
      })
      setIsGenerating(false)
      return
    }
    const goal = project.goal
    setLoading(true)
    const res = await fetch("/api/generate-criteria", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal }),
    })
    if (!res.ok) {
      const text = await res.text()
      console.error("API error", text)
      toast("APIエラー", { description: "サーバ側でエラーが発生しました。" })
      setLoading(false)
      return
    }
    const data = await res.json()
    setCriteria(data.criteria || [])
    setLoading(false)
  }

  // チェックボックス切り替え
  const handleToggle = (name: string) => {
    setSelected((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    )
  }

  return (
    <Card className="p-6 space-y-4 bg-gradient-to-r from-muted/50">
      <div className="flex justify-between">
        <h3 className="text-xl font-semibold">2. 評価基準</h3>
        {project?.criteria ? project.criteria.length < 3
          ? (
              <div className="flex items-center text-sm gap-2 p-1 border border-destructive/30 bg-destructive/5 text-destructive rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                 <span>3つ以上追加してください</span>
              </div>
            )
          : project?.criteria ? project.criteria.length > 5
          ? (
              <div className="flex items-center text-sm gap-2 p-2 border border-destructive/30 bg-destructive/5 text-destructive rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                 <span>重要: 5より大きいと比較回数が膨大になります</span>
              </div>
            )
          : null : null : null}
      </div>
      {!isAdding && (
        <div className="flex justify-end items-center gap-2">
          <Button
            onClick={() => {
              setSelected([])
              setCriteria([])
              setIsGenerating(true)
              handleGenerate()
            }}
            disabled={loading}
            variant="ghost"
            size="sm"
            className="flex items-center"
          >
          {loading ? <LoadingSpinner /> : <Bot className="h-4 w-4 mr-1" /> }
          {loading ? "回答中" : "相談" }
          </Button>
          <Button onClick={() => setIsAdding(true)} size="sm" variant="ghost">
            <Plus className="w-4 h-4 mr-1" />追加
          </Button>
        </div>
      )}
      {/* 提案フォーム */}
      {!loading && isGenerating && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-2">
            {criteria.map((c: Criteria, i: number) => (
              <label
                key={i}
                className="flex items-start space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(c.name)}
                  onChange={() => handleToggle(c.name)}
                  className="mt-1"
                />
                <div>
                  <p className="font-midium">{c.name}</p>
                  <p className="text-sm text-gray-600">{c.description}</p>
                </div>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-500"
              onClick={handleAddCriterion2}
            >
              追加
            </motion.button>
            <Button
              onClick={() => {
                setIsGenerating(false)
                setSelected([])
                setCriteria([])
              }}
              size="sm"
              variant="ghost"
            >
              キャンセル
            </Button>
          </div>
      </div>
      )}
      {isAdding && (
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
          <div className="flex flex-col gap-2">
            <label className="mr-2">名前:</label>
            <Input
              className="flex-1"
              placeholder="例) 性能"
              value={newCriterionName}
              onChange={(e) => setNewCriterionName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCriterion()
                if (e.key === "Escape") {
                  setIsAdding(false)
                  setNewCriterionName("")
                }
              }}
            />
            <div className="flex gap-2">
              <Button onClick={handleAddCriterion} size="sm">
                追加
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(false)
                  setNewCriterionName("")
                }}
                size="sm"
                variant="ghost"
              >
                キャンセル
              </Button>
            </div>
          </div>
        </div>
      )}

      {project?.criteria.length === 0 && !isAdding
        ?
          <p className="text-center text-sm py-6 text-muted-foreground">
            評価基準を追加してください。
          </p>
        : (
          <div className="space-y-2">
            <AnimatePresence>
              {project?.criteria.map((criterion: Criterion) => (
                <motion.div
                  key={criterion.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0}}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.4 }}
                  className="flex items-center justify-between p-1 bg-card border border-border rounded-lg"
                >
                  {editingId === criterion.id ? (
                    <div className="flex items-center gap-4">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 mr-2"
                        autoFocus
                      />
                        <Button size="sm" variant="default" onClick={handleEditSave}>
                          変更
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleEditCancel}>
                          キャンセル
                        </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-medium">{criterion.name}</span>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditStart(criterion)}
                        >
                          <Edit className="w-4 h-4 text-green-800" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteCriterion(criterion.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
      )}
    </Card>
  )
}
