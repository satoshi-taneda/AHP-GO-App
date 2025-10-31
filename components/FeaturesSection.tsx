"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { BarChart2, Star, Zap } from "lucide-react"

export default function FeaturesSection() {
  const features = [
    {
      icon: <BarChart2 className="w-6 h-6 text-primary" />,
      bg: "bg-primary/10",
      title: "AHPによる分析",
      text: "『AHP - 階層分析法』を用いた分析をAIに相談しながら手軽に体験できます。"
    },
    {
      icon: <Zap className="w-6 h-6 text-primary" />,
      bg: "bg-primary/10",
      title: "直感的な操作が可能",
      text: "スライダー操作で入力の手間を省きました。"
    },
    {
      icon: <Star className="w-6 h-6 text-primary" />,
      bg: "bg-primary/10",
      title: "シンプルなUI",
      text: "広告なし、余白を活かしたデザイン、思考を邪魔しません。"
    }
  ]

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((feature, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.6, ease: "easeOut" }}
        >
          <Card className="p-6 space-y-4 relative overflow-hidden bg-gradient-to-r from-muted/50">
            <div className={`w-12 h-12 rounded-lg ${feature.bg} flex items-center justify-center`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              {feature.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {feature.text}
            </p>
          </Card>
        </motion.div>
        ))}
      </div>
    </section>
  )
}
