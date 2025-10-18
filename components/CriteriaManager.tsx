"use client"
import { useState } from "react"
import { useAHP } from "@/contexts/AHPContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, Edit, AlertTriangle } from "lucide-react"
import type { Criterion } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"

export function CriteriaManager() {
  const { project, addCriterion, updateCriterion, deleteCriterion } = useAHP()
  const [newCriterionName, setNewCriterionName] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  // 編集用ステート
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  
  const handleAddCriterion = () => {
    if (newCriterionName.trim()) {
      addCriterion(newCriterionName.trim())
      setNewCriterionName("")
      setIsAdding(false)
    }
  }
  const handleEditStart = (criterion: Criterion) => {
    setEditingId(criterion.id)
    setEditingName(criterion.name)
  }
  const handleEditSave = () => {
    if (!editingId || !editingName?.trim()) return
    updateCriterion(editingId, { name: editingName.trim() })
    setEditingId(null)
    setEditingName("")
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditingName("")
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="mb-2 text-xl font-semibold">評価基準(Criteria)</h3>
          {project?.criteria ? project.criteria.length < 3
            ? (
                <div className="flex items-center text-sm gap-2 p-1 border border-destructive/30 bg-destructive/5 text-destructive rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                   <span>重要: 3つ以上追加してください</span>
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
            <div className="flex items-center gap-4">
              <Button onClick={() => setIsAdding(true)} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-1" />追加
              </Button>
            </div>
          )}
      </div>
      {isAdding && (
        <div className="flex gap-2 p-4 bg-muted/50 rounded-lg">
          <Input
            className="flex-1 mr-2"
            placeholder="例) 価格、デザイン、性能など"
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
                    <>
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 mr-2"
                        autoFocus
                      />
                      <div className="flex gap-2 items-center justify-end">
                        <Button size="sm" variant="default" onClick={handleEditSave}>
                          変更
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleEditCancel}>
                          キャンセル
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{criterion.name}</span>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditStart(criterion)}
                        >
                          <Edit className="w-4 h-4 text-green-700" />
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
