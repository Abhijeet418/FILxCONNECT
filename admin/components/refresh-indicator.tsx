"use client"

import { RefreshCw } from "lucide-react"
import { motion } from "framer-motion"

export function RefreshIndicator() {
  return (
    <motion.div
      className="fixed bottom-4 right-4 flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <RefreshCw className="h-3 w-3" />
      </motion.div>
      
    </motion.div>
  )
}