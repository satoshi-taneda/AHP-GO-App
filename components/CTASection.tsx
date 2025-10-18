"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CTASection() {
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
            高額商品の購入、重要な決断に！
          </h3>
          <p className="text-lg text-muted-foreground">
            ご検討の程よろしく願いします。
          </p>
          <Link href="/auth/login" className="flex gap-4 justify-center pt-4">
            <Button size="lg" className="bg-foreground text-lg px-8">
              無料で始める
            </Button>
          </Link>
        </Card>
      </motion.div>
    </section>
  )
}
