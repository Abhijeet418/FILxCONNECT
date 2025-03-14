'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, UserPlus, AlertCircle, Check } from 'lucide-react';
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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '@/lib/Firebase';
import { ref, serverTimestamp, set } from 'firebase/database';
import { toast } from 'sonner';
import { apiRequest } from '@/app/apiconnector/api';
import Image from 'next/image';

const formSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' }),
});

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError('');
    console.log(values);

    try {
      localStorage.clear();
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Store user in Firebase Database
      await set(ref(database, `filxconnectusers/${user.uid}`), {
        id: user.uid,
        displayName: values.firstName + ' ' + values.lastName,
        email: values.email,
        password: values.password,
        profile_picture: "",
        bio: "",
        status: 3,
        reports: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      });


      const saveAdminToDB = {
        username: values.firstName + ' ' + values.lastName,
        email: values.email,
        password: values.password,
        profilePicture: "",
        bio: "",
        reports: 0,
      };

      const res = await apiRequest("users", "POST", saveAdminToDB);
      console.log(res);

      localStorage.setItem('userId', res.id??"BAD REQUEST");

      toast.success("User created successfully");

      setSuccess(true);

      // // Redirect after showing success message
      setTimeout(() => {
        router.push('/pending-approval');
      }, 2000);
    } catch (err: any) {
      console.log(err);
      toast.error(err.message);
      setError('An error occurred during signup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center space-y-6 animate-fade-in">
        <div className="bg-green-100 p-3 rounded-full animate-pulse-slow">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Account Created!</h1>
          <p className="text-sm text-muted-foreground max-w-sm">
            Your account has been created successfully. Redirecting you to the pending approval page...
          </p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-2xl font-bold tracking-tight animate-slide-up">Create an account</h1>
        <p className="text-sm text-muted-foreground max-w-sm text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Enter your details to get started with FILxCONNECT
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4 animate-slide-up">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-8 animate-slide-up" style={{ animationDelay: '0.2s' }}
        autoComplete="off">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="First Name"
                      disabled={isLoading}
                      className="h-11 hover-scale"
                      autoComplete='off'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Last Name"
                      disabled={isLoading}
                      className="h-11 hover-scale"
                      autoComplete='off'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
                    autoComplete='off'
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    disabled={isLoading}
                    className="h-11 hover-scale"
                    autoComplete='off'
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground mt-1">
                  Password must be at least 8 characters with uppercase, lowercase, and numbers
                </p>
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
                Creating account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create account
              </>
            )}
          </Button>
        </form>
      </Form>

      <div className="mt-6 text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <span className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline font-medium transition-all hover:text-primary/80">
            Sign in
          </Link>
        </span>
      </div>
    </>
  );
}