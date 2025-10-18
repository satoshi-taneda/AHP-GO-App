"use client"
import type { Alternative } from "@/lib/types"
import { useState } from "react"
import { useAHP } from "@/contexts/AHPContext"
import { fetchRakutenItems } from "@/lib/rakutenApi"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Plus, Search,  Trash2, Edit, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import ProductCard from "@/components/ProductCard"

export function AlternativesManager() {
  // コンテキスト使用
  const { project, addAlternative, updateAlternative, deleteAlternative } = useAHP()

  // 新規追加フォーム
  const [newAlternativeName, setNewAlternativeName] = useState("")
  const [newAlternativeDescription, setNewAlternativeDescription] = useState("")
  const [newAlternativeImage, setNewAlternativeImage] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isSearching, setIsSearching] = useState(false)


  // 検索フォーム
  const [keyword, setKeyword] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

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

  // 楽天検索追加
  const handleAddAlternative2 = (keyword: string, item: any) => {
      addAlternative (
        keyword,
        `${item.price.toLocaleString()}円 ` + item.name,
        item.image || "",
      )
      // setKeyword("")
      setResults([])
      setIsSearching(false)
  }

  // 楽天検索
  const handleSearch = async () => {
    if (!keyword) return
      setSearchLoading(true)
    try {
      const items = await fetchRakutenItems(keyword)
      setResults(items)
    } catch (err) {
      console.error(err)
      alert("データ取得に失敗しました")
    } finally {
      setSearchLoading(false)
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
          <h3 className="mb-2 text-xl font-semibold">候補(Alternatives)</h3>
          {project?.alternatives ? project.alternatives.length < 3
            ? (
                <div className="flex items-center text-sm gap-2 p-1 border border-destructive/30 bg-destructive/5 text-destructive rounded-lg">
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
        </div>
          {!isAdding &&  !isSearching  && (
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setIsAdding(false)
                  setIsSearching(true)
                }}
                size="sm"
                variant="ghost"
              >
                <Search className="w-4 h-4 mr-1" />楽天検索
              </Button>
              <Button
                onClick={() => {
                  setIsAdding(true)
                  setIsSearching(false)
                }}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-1" />追加
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
            placeholder="例) 25,000円 ブラック 省電力 A社 ..."
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
      {/* 検索フォーム */}
      {isSearching && (
      <div>
        <div className="flex gap-2 p-4 bg-muted/50 rounded-lg">
          <input
            className="text-sm border px-3 py-2 flex-1 rounded"
            placeholder="例) 冷蔵庫 一人暮らし"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Button
            onClick={handleSearch}
            disabled={searchLoading}
            variant="default"
          >
            {searchLoading ? "検索中..." : "検索"}
          </Button>
          <Button
            onClick={() => {
              setKeyword("")
              setResults([])
              setIsSearching(false)
            }}
            size="sm"
            variant="ghost"
          >
            キャンセル
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {results.map((item, i) => (
            <ProductCard key={i} item={item} onSave={() => handleAddAlternative2(keyword, item)} />
          ))}
        </div>
      </div>
      )}
      {/* 登録済み候補リスト */}
      {project?.alternatives.length === 0 && !isAdding && !isSearching ? (
        <p className="text-center text-sm py-2 text-muted-foreground">
          候補を追加してください。
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
                          <div className="text-sm text-muted-foreground">
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
