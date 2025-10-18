"use client"

import { Loader2 } from "lucide-react"
export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-40">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  )
}
