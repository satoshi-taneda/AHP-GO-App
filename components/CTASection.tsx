"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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
            高額な商品、カートに入れる前に！
          </h3>
          <p className="text-lg text-muted-foreground">
          </p>
            <Button
              size="lg"
              className="bg-foreground text-lg px-8"
              onClick={() => router.push("/project/dashboard")}
            >
              無料で始める
            </Button>
        </Card>
      </motion.div>
    </section>
  )
}
