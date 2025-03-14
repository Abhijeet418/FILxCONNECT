'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, LogIn, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/Firebase';
import { toast } from 'sonner';
import { apiRequest } from '@/app/apiconnector/api';
import Image from 'next/image';
import { ForgotPasswordDialog } from '@/components/forgot-password-dialog'; 

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError('');

    try {
      localStorage.clear();
      // // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await signInWithEmailAndPassword(auth, values.email, values.password);
      if (res.user.uid === null) {
        toast.error("Invalid email or password. Please try again.");
        throw new Error('Invalid email or password. Please try again.');
      }

      console.log(res);

      toast.message("Login Successful");
      const user = await apiRequest(`users/getByEmail/${values.email}`, 'GET');
      // Check the user with the mail from the that is from the firebase and in the db and get the userId from the database and check the status of the user and redirect to the respective page
      // const res = await apiRequest(`users/${values.email}`, 'GET');
      localStorage.setItem("userId", user.id);
      console.log(user.id);
      if (user?.status === 1) {
        router.push('/home');
      } else if (user?.status === 0) {
        router.push('/blocked');
      }else{
        router.push('/pending-approval');
      }
      // // For demo purposes, always redirect to pending-approval
      // router.push('/pending-approval');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center space-y-4 animate-fade-in">
        <div className="flex items-center gap-4 mb-2">
          <Image
            src="/logo.png"
            alt="FILxCONNECT Logo"
            width={48}
            height={48}
            className="object-contain"
          />
          <span className="text-2xl font-bold text-primary">FILxCONNECT</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight animate-slide-up">Welcome back</h1>
        <p className="text-sm text-muted-foreground max-w-sm text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Enter your credentials to access your account
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4 animate-slide-up">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}
         className="space-y-4 mt-8 animate-slide-up" 
         style={{ animationDelay: '0.2s' }}
         autoComplete="off"
         >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="m@example.com"
                    disabled={isLoading}
                    className="h-11 hover-scale"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Button
                    type="button"
                    variant="link"
                    className="px-0 font-normal"
                    onClick={() => setForgotPasswordOpen(true)}
                  >
                    Forgot password?
                  </Button>
                </div>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    disabled={isLoading}
                    className="h-11 hover-scale"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            className="w-full h-11 hover-scale transition-all"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </span>
                Signing in...
              </>
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Sign in
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <span className="text-sm text-muted-foreground">
          Don`t have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline font-medium transition-all hover:text-primary/80">
            Sign up
          </Link>
        </span>
      </div>

      <ForgotPasswordDialog
        open={forgotPasswordOpen}
        onOpenChange={setForgotPasswordOpen}
      />
    </>
  );
}