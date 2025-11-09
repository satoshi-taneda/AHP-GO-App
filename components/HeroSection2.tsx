"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
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
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-5xl font-bold text-foreground">
          AHPで最適な選択を
          </h2>
          <span className="text-5xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">シンプルに</span>
          <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
            AHP-GOはより良い意思決定のサポートアプリです！
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700"
          onClick={() => router.push("/project/dashboard")}
        >
          無料で始める
        </motion.button>
      </motion.div>

      {/* 左側: イメージ */}
      <motion.div
        className="flex-1 flex justify-center items-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3}}
      >
        <Image
          src="/images/pcm.png"
          alt="意思決定のイラスト"
          width={320}
          height={320}
          className="h-auto w-auto rounded-2xl shadow-lg"
        />
      </motion.div>
      </div>
    </section>
  )
}
