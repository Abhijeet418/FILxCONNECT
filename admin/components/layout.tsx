"use client"

import type React from "react"
import Image from "next/image"

import { motion } from "framer-motion"
import { MainNav } from "@/components/main-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { RefreshIndicator } from "@/components/refresh-indicator"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

export function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-background">
        <div className="flex h-16 items-center justify-center px-6 gap-3">
          <Image
            src="/new logo.png"
            alt="FILxCONNECT Logo"
            width={50}
            height={50}
            className="object-contain"
          />
          <h1 className="text-xl font-bold select-none">
            FILxCONNECT
          </h1>
        </div>
        <motion.div
          className="p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <MainNav />
        </motion.div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <header className="sticky top-0 z-50 bg-background">
          <div className="flex h-16 items-center justify-between px-6">
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
            <div className="flex items-center gap-4">
              <Button 
                variant="outline"
                onClick={() => router.push("/auth/signup")}
                className="flex items-center gap-2"
              >
                Add Admin
              </Button>
              <ThemeToggle />
              <UserNav />
            </div>
          </div>
        </header>
        <motion.main
          className="p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.main>
      </div>
      <RefreshIndicator />
    </div>
  )
}

