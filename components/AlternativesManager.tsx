"use client"
import { useState } from "react"
import { useAHP } from "@/contexts/AHPContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, Edit, AlertTriangle } from "lucide-react"
import type { Alternative } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"

export function AlternativesManager() {
  // コンテキスト使用
  const { project, addAlternative, updateAlternative, deleteAlternative } = useAHP()

  // 新規追加フォーム
  const [newAlternativeName, setNewAlternativeName] = useState("")
  const [newAlternativeDescription, setNewAlternativeDescription] = useState("")
  const [newAlternativeImage, setNewAlternativeImage] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  // 編集フォーム
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [editingDescription, setEditingDescription] = useState("")
  const [editingImage, setEditingImage] = useState<string | null>(null)

  // 新規追加
  const handleAddAlternative = () => {
    if (newAlternativeName.trim()) {
      addAlternative (
        newAlternativeName.trim(),
        newAlternativeDescription.trim(),
        newAlternativeImage || "",
      )
      setNewAlternativeName("")
      setNewAlternativeDescription("")
      setNewAlternativeImage(null)
      setIsAdding(false)
    }
  }

  // 編集開始
  const handleEditStart = (alt: Alternative) => {
    setEditingId(alt.id)
    setEditingName(alt.name)
    setEditingDescription(alt.description || "")
    setEditingImage(alt.imageUrl || null)
  }
  // 編集保存
  const handleEditSave = () => {
    if (!editingId || !editingName?.trim()) return
    updateAlternative(editingId, {
      name: editingName.trim(),
      description: editingDescription || "",
      imageUrl: editingImage,
    })
    setEditingId(null)
    setEditingName("")
    setEditingDescription("")
    setEditingImage(null)
  }
  // 編集キャンセル
  const handleEditCancel = () => {
    setEditingId(null)
    setEditingName("")
    setEditingDescription("")
    setEditingImage(null)
  }

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold">候補(Alternatives)</h3>
          <p className="text-sm py-2 text-muted-foreground">
            -- 比較する候補を入力 --
          </p>
        </div>
          {!isAdding && (
            <div className="flex items-center gap-4">
              {project?.alternatives ? project.alternatives.length < 3
                ? (
                    <div className="flex items-center text-sm gap-2 p-2 border border-destructive/30 bg-destructive/5 text-destructive rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                       <span>重要: 3つ以上追加してください</span>
                    </div>
                  )
                : project?.alternatives ?  project.alternatives.length > 5
                ? (
                    <div className="flex items-center text-sm gap-2 p-2 border border-destructive/30 bg-destructive/5 text-destructive rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                       <span>重要: 5より大きいと比較回数が膨大になります</span>
                    </div>
                  ) : null : null : null}
              <Button onClick={() => setIsAdding(true)} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />追加する
              </Button>
            </div>
          )}
      </div>
      {/* 新規追加フォーム */}
      {isAdding && (
        <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg">
          <Input
            className="flex-1"
            placeholder="例) 商品1"
            value={newAlternativeName}
            onChange={(e) => setNewAlternativeName(e.target.value)}
          />
          <Input
            className="flex-1"
            placeholder="例) 1000円 ブラック 携帯可 A社 ..."
            value={newAlternativeDescription}
            onChange={(e) => setNewAlternativeDescription(e.target.value)}
          />
          <label className="flex flex-col items-center  justify-center w-full p-4 border border-dashed border-gray-30
                          cursor-pointer bg-white hover:bg-muted">
            <span className="text-sm text-muted-foreground">クリックして画像を選択</span>
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const imageUrl = URL.createObjectURL(file) // 仮URL(プレビュー用)
                  setNewAlternativeImage(imageUrl)
                }
              }}
            />
          </label>
          {newAlternativeImage && (
            <img
              src={newAlternativeImage}
              alt="プレビュー"
              className="w-32 h-32 object-cover rounded-lg border"
            />
          )}
          <div className="flex gap-2">
            <Button onClick={handleAddAlternative} size="sm">追加</Button>
            <Button
              onClick={() => {
                setIsAdding(false)
                setNewAlternativeName("")
              }}
              size="sm"
              variant="ghost"
            >
            キャンセル
            </Button>
          </div>
        </div>
      )}
      {/* 登録済み候補リスト */}
      {project?.alternatives.length === 0 && !isAdding ? (
        <p className="text-center text-sm py-2 text-muted-foreground">
          未選択
        </p>
      ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {project?.alternatives.map((alt: Alternative) => (
                <motion.div
                  key={alt.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0}}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center justify-between p-2 bg-card border border-border rounded-lg"
                >
                  {editingId === alt.id ? (
                    <div className="flex flex-col w-full p-4 gap-2 bg-muted/50">
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        placeholder="候補名"
                      />
                      <Input
                        value={editingDescription}
                        onChange={(e) => setEditingDescription(e.target.value)}
                        placeholder="説明"
                      />
                      <label className="flex flex-col items-center justify-center w-full p-4 border border-dashed border-gray-30
                                        cursor-pointer bg-white hover:bg-muted">
                        <span className="text-sm text-muted-foreground">クリックして画像を選択</span>
                        <Input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const url = URL.createObjectURL(file)
                              setEditingImage(url)
                            }
                          }}
                        />
                      </label>
                      {editingImage && (
                        <img
                          src={editingImage}
                          alt="編集プレビュー"
                          className="w-24 h-24 object-cover rounded border"
                        />
                      )}
                      <div className="flex gap-2 items-center justify-end">
                        <Button size="sm" variant="default" onClick={handleEditSave}>
                          変更
                        </Button>
                        <Button size="sm" variant="ghost" onClick={handleEditCancel}>
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* 画像プレビュー(存在する場合) */}
                      <div className="flex items-center gap-3 w-full">
                      {alt.imageUrl ? (
                        <img
                          src={alt.imageUrl}
                          alt={alt.name}
                          className="w-12 h-12 rounded object-cover border"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-muted-foreground/10 flex items-center justify-center text-xs text-muted-foreground border">
                          No Image
                        </div>
                      )}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{alt.name}</div>
                      {alt.description && (
                        <div className="text-sm text-muted-foreground truncate">
                          {alt.description}
                        </div>
                      )}
                    </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditStart(alt)}
                      >
                        <Edit className="w-4 h-4 text-green-700" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteAlternative(alt.id)}
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
