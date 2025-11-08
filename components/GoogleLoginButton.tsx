"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { FcGoogle } from "react-icons/fc"
import { motion, AnimatePresence } from "framer-motion"

interface GoogleLoginProps {
  onClick: () => Promise<void>
}


export default function GoogleLoginButton({ onClick }: GoogleLoginProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      await new Promise((r) => setTimeout(r, 1000))
      await onClick()
    } finally {
      setLoading(false)
    }
  }

 return (
   <div className="relative">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 1.05 } }
      onClick={handleClick}
      disabled={loading}
      className="w-full py-2 flex items-center justify-center gap-2 border bg-white text-gray-700 hover:bg-gray-50 transition-all duration-300"
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Googleでログイン中...</span>
        </>
      ) : (
        <>
          <FcGoogle className="w-5 h-5" />
          <span>Googleでログイン</span>
        </>
      )}
    </motion.button>
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-white rounded-lg"
        />
      )}
    </AnimatePresence>
   </div>
  )
}
