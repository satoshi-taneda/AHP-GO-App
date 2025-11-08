"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Bot } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function ChatBox() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAsk = async () => {
    if (!question.trim()) return
    setLoading(true)
    setAnswer("")
    const res = await fetch("/api/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    })
    const data = await res.json()
    setAnswer(data.answer)
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4 bg-white rounded-xl shadow mt-8">
    <textarea
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
      placeholder="例) AHPにおける一対比較とは何ですか？"
      className="w-full p-2 border rounded-md"
      rows={2}
    />
    <div className="flex justify-end">
      <Button
        onClick={handleAsk}
        disabled={loading}
        variant="ghost"
      >
        {loading ? <LoadingSpinner /> : <Bot className="h-4 w-4 mr-1" /> }
        {loading ? "回答中" : "質問" }
      </Button>
    </div>
    {answer && (
      <div className="p-4 bg-gray-50 border rounded-md text-sm">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {answer}
        </ReactMarkdown>
      </div>
    )}
  </div>
  )
}
