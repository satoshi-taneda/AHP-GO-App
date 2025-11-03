"use client"

import { motion } from "framer-motion"

export default function ProgressCircle({step, total}: {step: number, total: number}) {
  // fixed top-20
  const progress = step / total;
  return (
    <div className="flex flex-col items-center">
      <motion.svg width="28" height="28" viewBox="0 0 36 36">
        <path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#e6e6e6"
          strokeWidth="3"
        />
        <motion.path
          d="M18 2.0845
            a 15.9155 15.9155 0 0 1 0 31.831
            a 15.9155 15.9155 0 0 1 0 -31.831"
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          strokeDasharray={`${progress * 100},100`}
          initial={{ strokeDasharray: "0,100"}}
          animate={{ strokeDasharray: `${progress * 100},100` }}
          transition={{ duration: 0.6 }}
        />
      </motion.svg>
      <p className="text-sm text-muted-foreground mt-1">進捗率: {Math.floor(step / total * 100)}%</p>
      <p className="text-sm text-muted-foreground">残り: {total -step}回</p>
    </div>
  )
}
