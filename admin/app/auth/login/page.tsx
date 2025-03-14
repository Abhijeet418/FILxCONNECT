"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { motion } from "framer-motion"
import { Mail, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ForgotPasswordDialog } from "@/components/auth/forgot-password-dialog"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, database } from "@/lib/Firebase"
import signup from "@/public/signup.jpg"
import Image from "next/image"

import { toast } from "sonner"
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast.success("Login successful");
      console.log("Login successful");
      router.push("/dashboard");

    } catch (error: any) {
      toast.error("Login Failed! Try Again!");
      console.error("Login failed:", error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="min-h-screen grid lg:grid-cols-2">
        {/* Left side - Image */}
        <div className="hidden lg:block relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-primary/40 z-10" />
          <img
            src="/placeholder.svg?height=1080&width=1080"
            alt="Login"
            className="absolute inset-0 object-cover w-full h-full"
          />
          <div className="relative z-20 flex flex-col h-full p-12">
            <div className="flex items-center gap-2">
              <Image src={'/new logo.png'} width={50} height={20} alt="Logo" className="rounded" />
              <h1 className="text-2xl font-bold text-blue">FILxCONNECT</h1>
            </div>
            <div
              className="relative z-20 mt-20 flex justify-center"
            >
              <Image src={signup} alt="signup" width={500} height={500} className="rounded-lg" />

            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md space-y-8"
          >
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground">Sign in to access your admin dashboard</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input placeholder="Enter your email" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input type="password" placeholder="Enter your password" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-4"
                >
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Signing in...
                      </motion.div>
                    ) : (
                      "Sign in"
                    )}
                  </Button>

                  <div className="flex flex-col gap-2 text-center">
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm text-muted-foreground hover:text-primary"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot your password?
                    </Button>
                    {/* <Link href="/auth/signup" className="text-sm text-muted-foreground hover:text-primary">
                      Don&apos;t have an account? Sign up
                    </Link> */}
                  </div>
                </motion.div>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>

      <ForgotPasswordDialog open={showForgotPassword} onOpenChange={setShowForgotPassword} />
    </>
  )
}

