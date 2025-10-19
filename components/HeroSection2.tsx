"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export default function HeroSection2() {
  const router = useRouter()
  return (
   <section className="container mx-auto px-4 py-24 text-center bg-gradient-to-b from-white to-gray-50">
   <div className="flex justify-between gap-6">
      {/* 左側: テキスト */}
      <motion.div
        className="max-w-xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut"}}
      >
        <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-5xl font-bold text-foreground">
        {"『AHP』で最適な選択を"}
        </h2>
        <span className="text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">シンプルに</span>
        <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
          AHP-GOは、より良い意思決定のためのサポートアプリです。
        </p>
        </div>
        <Button
        size="lg"
        className="mt-8 bg-foreground text-lg px-8"
        onClick={() => router.push("/project/dashboard")}
        >
          無料で始める
        </Button>
      </motion.div>

      {/* 左側: イメージ */}
      <motion.div
        className="flex-1 flex justify-center items-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3}}
      >
        <Image
          src="/images/shinsyakaijin_building.png"
          alt="意思決定のイラスト"
          width={200}
          height={150}
          className="w-48 h-auto rounded-2xl shadow-lg"
        />
      </motion.div>
      </div>
    </section>
  )
}
