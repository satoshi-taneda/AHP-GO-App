"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function ReturnButton() {
  const router = useRouter()
  return (
    <Button size="lg" variant="ghost" onClick={() => router.back()}>
      戻る
    </Button>
  )
}
