"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"

export default function CopyTextButton({ text }: { text: string}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000) // 2秒後に戻す
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="flex items-center space-x-2"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span>OK!</span>
        </>
      ):(
        <>
          <Copy className="w-4 h-4" />
          <span>コピー</span>
        </>
      )}
    </Button>
  )
}
