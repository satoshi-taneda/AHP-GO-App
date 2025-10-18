"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { fetchRakutenItems } from "@/lib/rakutenApi"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/ProductCard"

export const dynamic = "force-dynamic"
export default function RakutenPage() {
  const router = useRouter()
  const [keyword, setKeyword] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()

  // 認証チェック
  useEffect(() => {
    if (authLoading) return
    if (!user) router.push("/auth/login")
  }, [user, authLoading, router])

  const handleSearch = async () => {
    if (!keyword) return
      setLoading(true)
    try {
      const items = await fetchRakutenItems(keyword)
      setResults(items)
    } catch (err) {
      console.error(err)
      alert("データ取得に失敗しました")
    } finally {
      setLoading(false)
    }
  }
  const handleSave = async (item: any) => {
    const { error } = await supabase.from("product").insert({
      user_id: user.id,
      name: item.name,
      image: item.image,
      url: item.url,
      price: item.price
    })
    if (error) console.error(error)
    else alert("保存しました!")
  }
  return (
    <main className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">商品検索</h1>
      <div className="flex gap-2">
        <input
          className="border px-3 py-2 flex-1 rounded"
          placeholder="例) 冷蔵庫"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <Button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "検索中..." : "検索"}
        </Button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {results.map((item, i) => (
          <ProductCard key={i} item={item} onSave={() => handleSave(item)} />
        ))}
      </div>
    </main>
  )
}
