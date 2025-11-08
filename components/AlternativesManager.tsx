"use client"
import type { Alternative } from "@/lib/types"
import { useState } from "react"
import { useAHP } from "@/contexts/AHPContext"
import { fetchRakutenItems } from "@/lib/rakutenApi"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Plus, Search,  Trash2, Edit, AlertTriangle, ArrowRight, ArrowLeft, Bot, Copy } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import LoadingSpinner from "@/components/LoadingSpinner"
import ProductCard from "@/components/ProductCard"

type Summary = {
  name: string
  description: string
}

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
  const [itemCount, setItemCount] = useState(0)
  const [isSearched, setIsSearched] = useState(false)

  // 編集フォーム
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")
  const [editingDescription, setEditingDescription] = useState("")
  const [editingImage, setEditingImage] = useState<string | null>(null)

  // GeminiAPI
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<Summary[]>([])

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

  // Gemini APIでの商品情報の要約
  const handleSummarize = async () => {
    if (!editingDescription) {
      toast("未入力検知",
            {description: "候補の要約には名前と説明が必要です。",
            icon: <AlertTriangle className="text-yellow-500" />,
            className: "border-yellow-300 bg-yellow-50 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700",
      })
      return
    }
    setLoading(true)
    const description = "名前: " + editingName  + " 説明:  " + editingDescription 
    const res = await fetch("/api/summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    })

    const data = await res.json()
    setSummary(data.summary || [])
    setLoading(false)
  }

  // 楽天検索追加
  const handleAddAlternativeRakuten = (keyword: string, item: any) => {
      const desc = `${item.price.toLocaleString()}円 ` + item.name
      addAlternative (
        keyword,
        desc,
        item.image || "",
      )
      // setKeyword("")
      setResults([])
      setIsSearching(false)
      setIsSearched(false)
  }

  // 楽天検索
  const handleSearch = async () => {
    if (!keyword) return
    try {
      setSearchLoading(true)
      const items = await fetchRakutenItems(keyword)
      setResults(items.slice(0, 2))
      setIsSearched(true)
    } catch (err) {
      console.error(err)
      alert("データ取得に失敗しました")
    } finally {
      setSearchLoading(false)
      setItemCount(0)
    }
  }

  async function handleArrowRight() {
    if (!keyword) return
    if (itemCount < 30) {
      try {
        setSearchLoading(true)
        const items = await fetchRakutenItems(keyword)
        setItemCount((prev: number) => {
          const nextCount = prev + 2
          setResults(items.slice(nextCount, nextCount + 2))
          return nextCount
        })
      } catch (err) {
        console.error(err)
        alert("データ取得に失敗しました")
      } finally {
        setSearchLoading(false)
      }
    }
  }
  async function handleArrowLeft() {
    if (!keyword) return
    if (itemCount > 0) {
      try {
        setSearchLoading(true)
        const items = await fetchRakutenItems(keyword)
        setItemCount((prev: number) => {
          const newCount = prev - 2
          setResults(items.slice(newCount, newCount + 2))
          return newCount
        })
      } catch (err) {
        console.error(err)
        alert("データ取得に失敗しました")
      } finally {
        setSearchLoading(false)
      }
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
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">候補</h3>
        {project?.alternatives ? project.alternatives.length < 3
          ? (
              <div className="flex items-center text-sm gap-2 p-1 border border-destructive/30 bg-destructive/5 text-destructive rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                 <span>3つ以上追加してください</span>
              </div>
            )
          : project?.alternatives ?  project.alternatives.length > 5
          ? (
              <div className="flex items-center text-sm gap-2 p-2 border border-destructive/30 bg-destructive/5 text-destructive rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                 <span>5より大きいと比較回数が膨大になります</span>
              </div>
            ) : null : null : null}
      </div>
      {!isAdding &&  !isSearching  && (
        <div className="flex justify-end items-center gap-2">
          <Button
            onClick={() => {
              setIsAdding(false)
              setIsSearching(true)
            }}
            size="sm"
            variant="ghost"
          >
            <Search className="w-4 h-4 mr-1" />楽天で探す
          </Button>
          <Button
            onClick={() => {
              setIsAdding(true)
              setIsSearching(false)
            }}
            size="sm"
            variant="ghost"
          >
            <Plus className="w-4 h-4 mr-1" />追加
          </Button>
        </div>
      )}
      {/* 新規追加フォーム */}
      {isAdding && (
        <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg">
          <label>名前:</label>
          <Input
            className="flex-1"
            placeholder="例) dynabook XZ/HY"
            value={newAlternativeName}
            onChange={(e) => setNewAlternativeName(e.target.value)}
          />
          <label>説明:</label>
          <Textarea
            className="flex-1"
            rows={5}
            placeholder="例) 価格: 132,600円 詳細: 13.3インチ Core i5 16GB SSD 512GB TOSHIBA"
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
        <div className="flex flex-wrap items-center gap-2 p-4 bg-muted/50 rounded-lg">
          <input
            className="flex-1 mr-2 p-2"
            placeholder="例) ノートPC おすすめ"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-500"
            disabled={searchLoading && !isSearched}
            onClick={handleSearch}
          >
            検索
          </motion.button>
          <Button
            onClick={() => {
              setKeyword("")
              setResults([])
              setIsSearching(false)
              setIsSearched(false)
              setItemCount(0)
            }}
            size="sm"
            variant="ghost"
          >
            キャンセル
          </Button>
        </div>
        <div className="h-[300px] overflow-y-auto grid grid-cols-2 gap-4">
          {results.map((item, i) => (
            <ProductCard key={i} item={item} onSave={() => handleAddAlternativeRakuten(keyword, item)} />
          ))}
        </div>
        {isSearched  && (
          <>
            <div className="max-w-sm mx-auto mt-4 flex justify-between items-center">
              <Button
                size="sm"
                variant="ghost"
                disabled={searchLoading || itemCount === 0}
                onClick={handleArrowLeft}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />前のページ
              </Button>
              <p className="text-center text-xs mt-2">{itemCount / 2 + 1} / 15</p>
              <Button
               size="sm"
               variant="ghost"
               disabled={searchLoading || itemCount === 28}
               onClick={handleArrowRight}
              >
                次のページ<ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}
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
                   <label>名前:</label>
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="候補名"
                    />
                   <label>説明:</label>
                    <Textarea
                      value={editingDescription}
                      rows={5}
                      onChange={(e) => setEditingDescription(e.target.value)}
                      placeholder="説明"
                    />
                    {summary.map((s: Summary, i: number) => (
                      <label
                        key={i}
                        className="flex items-start space-x-2 border rounded-lg p-3 bg-muted"
                      >
                        <div>
                          <div className="flex justify-between items-center">
                            <p className="font-medium">{s.name}</p>
                            <Button
                              onClick={() => {
                                setEditingName(s.name)
                                setEditingDescription(s.description)
                                toast.success("名前と説明へ適用しました！")
                              }}
                              variant="ghost"
                              size="sm"
                              className="flex items-center"
                            >
                            <Copy className="h-4 w-4 mr-1" />適用
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600">{s.description}</p>
                        </div>
                      </label>
                    ))}
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        onClick={handleSummarize}
                        disabled={loading}
                        variant="ghost"
                        size="sm"
                        className="flex items-center"
                      >
                      {loading ? <LoadingSpinner /> : <Bot className="h-4 w-4 mr-1" /> }
                      {loading ? "回答中" : "候補の要約" }
                      </Button>
                    </div>
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
                      <Button size="sm" variant="default" onClick={() => {
                        handleEditSave()
                        setSummary([])
                        }}
                      >
                        変更
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                          handleEditCancel()
                          setSummary([])
                        }}
                      >
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
