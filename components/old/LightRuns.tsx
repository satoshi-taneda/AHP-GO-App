"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function LightRuns({ name, path }: { name: string, path: string } ) {
  return (
    <Link href={path ? path : "/" } className="inline-block relative group">
      <Button
        size="lg"
        className="bg-foreground px-4 overflow-hidden relative hover:bg-blue-500"
      >
        <Plus className="w-4 h-4 mr-1" />
        {name}
        {/* 光のエフェクト */}
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent 
          translate-x-[-100%] group-hover:translate-x-[100%]
          transition-transform duration-700 ease-out" />
      </Button>
    </Link>
  )
}
