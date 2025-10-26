"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function CancelButton() {
  const router = useRouter()
  return (
    <Button size="lg" variant="ghost" onClick={() => router.back()}>
      キャンセル
    </Button>
  )
}
