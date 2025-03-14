'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XCircle, AlertCircle, Mail, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function BlockedPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center space-y-4 p-6 animate-fade-in max-h-screen">
      <div className="bg-red-500/10 p-3 rounded-full animate-pulse-slow">
        <XCircle className="h-8 w-8 text-red-500" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight animate-slide-up">Account Blocked</h1>
        <p className="text-sm text-muted-foreground max-w-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Your account has been blocked due to violation of our community guidelines.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-[420px] animate-slide-up" style={{ animationDelay: '0.2s' }}> {/* Changed from max-w-sm (384px) to max-w-[420px] */}
        <div className="bg-card p-5 rounded-lg shadow-sm border hover-scale"> {/* Changed from p-4 to p-5 */}
          <div className="flex items-center justify-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-sm">What Happened?</h3>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Your account has been blocked for violating our community guidelines.
          </p>
        </div>

        <div className="bg-card p-5 rounded-lg shadow-sm border hover-scale"> {/* Changed from p-4 to p-5 */}
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Mail className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-sm">Need Help?</h3>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Contact our support team to appeal this decision.
          </p>
        </div>
      </div>

      <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <Button variant="outline" size="sm" asChild className="hover-scale">
          <Link href="mailto:admin@filxconnect.com">Contact Support</Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="hover-scale">
          <Link href="/login">Back to Login</Link>
        </Button>
      </div>
    </div>
  );
}