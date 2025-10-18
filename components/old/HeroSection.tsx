"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section className="container mx-auto px-4 py-24 text-center bg-gradient-to-b from-white to-gray-50">
      <motion.div
        className="max-w-3xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut"}}
      >
        <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-5xl font-bold text-foreground">
          AHPで最適な選択を
          <span className="text-primary">シンプルに</span>
        </h2>
        <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
          AHP-GOは最終目標へのサポートアプリです。
        </p>
        </div>
        <Link href="/auth/login" className="flex gap-4 justify-center pt-4">
          <Button size="lg" className="bg-foreground text-lg px-8 hover:bg-foreground/60">
            無料で始める
          </Button>
        </Link>
      </motion.div>
    </section>
  )
}
