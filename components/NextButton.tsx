"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function NextButton() {
  return (
    <Button size="lg" variant="ghost">
      次へ<ArrowRight className="w-4 h-4 ml-2" />
    </Button>
  )
}
