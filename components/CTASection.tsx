"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export default function CTASection() {
  const router = useRouter()
  return (
    <section className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }} // スクロール時に一度だけ発火
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Card className="max-3xl mx-auto p-12 text-center space-y-6 border-foreground/20
                         relative overflow-hidden bg-gradient-to-r from-muted/50">
          <h3 className="text-3xl font-bold text-foreground text-balance">
             高額商品の購入・重大な決断に！
          </h3>
          <p className="text-lg text-muted-foreground">
            まずは主観的な判断を数値化してみませんか？
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700"
            onClick={() => router.push("/project/dashboard")}
          >
            無料で始める
          </motion.button>
        </Card>
      </motion.div>
    </section>
  )
}
