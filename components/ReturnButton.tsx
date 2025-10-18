"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function ReturnButton() {
  const router = useRouter()
  return (
    <Button size="lg" variant="ghost" onClick={() => router.back()}>
      <ArrowLeft className="w-4 h-4 mr-2" />戻る
    </Button>
  )
}
