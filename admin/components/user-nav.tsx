"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut, User, Settings, Bell } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { auth, database } from "@/lib/Firebase" // Ensure Firebase is correctly set up
import { onAuthStateChanged, signOut } from "firebase/auth"
import { ref, onValue } from "firebase/database"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const dropdownAnimation = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
  transition: { duration: 0.2 }
}

export function UserNav() {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string | null; email: string | null }>({
    name: null,
    email: null,
  })

  // Fetch the logged-in user from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // Get additional user data from Realtime Database
        const userRef = ref(database, `users/${currentUser.uid}`)
        onValue(userRef, (snapshot) => {
          const userData = snapshot.val()
          setUser({
            name: userData?.fullName || currentUser.displayName || "Admin User",
            email: currentUser.email || "admin@filxconnect.com",
          })
        })
      } else {
        router.push("/auth/login");
      }
    })
    return () => unsubscribe() // Cleanup listener on unmount
  }, [])

  const handleSignOut = async () => {
    await signOut(auth)
    router.push("/auth/login")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            variant="ghost"
            className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-primary/20"
          >
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <User className="h-5 w-5" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-500 ring-2 ring-white"
              animate={{ 
                scale: [1, 1.2, 1],
                backgroundColor: ["#22c55e", "#15803d", "#22c55e"]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </Button>
        </motion.div>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        className="w-80 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm border border-gray-200/20 dark:border-gray-800/20" 
        align="end" 
        forceMount
      >
        <AnimatePresence>
          <motion.div {...dropdownAnimation}>
            <div className="flex items-center gap-4 p-4">
              <motion.div 
                className="flex-shrink-0 h-14 w-14 rounded-full overflow-hidden border-2 border-primary/20 bg-white dark:bg-gray-950"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-7 w-7" />
                </div>
              </motion.div>
              <div className="flex flex-col min-w-0">
                <p className="font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                <motion.span 
                  className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 w-fit mt-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Online
                </motion.span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-red-600 hover:text-red-700 focus:bg-red-50/50 focus:text-red-600 p-3"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </motion.div>
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
