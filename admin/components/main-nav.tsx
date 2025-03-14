"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, AlertTriangle } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Posts",
    href: "/posts",
    icon: FileText,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: AlertTriangle,
  },
]

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
}

export function MainNav() {
  const pathname = usePathname()

  return (
    <motion.nav 
      className="flex flex-col gap-2"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {navItems.map((navItem, index) => (
        <motion.div
          key={navItem.href}
          variants={item}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button
            asChild
            variant={pathname === navItem.href ? "default" : "ghost"}
            className="w-full justify-start gap-3 transition-colors duration-200 ease-in-out hover:bg-accent text-base font-medium"
          >
            <Link href={navItem.href} className="flex items-center">
              <navItem.icon className="h-5 w-5 mr-2" />
              {navItem.title}
            </Link>
          </Button>
        </motion.div>
      ))}
    </motion.nav>
  )
}

