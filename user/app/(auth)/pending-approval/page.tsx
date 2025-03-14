'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Share2, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { apiRequest } from '@/app/apiconnector/api';

export default function PendingApprovalPage() {
  const [dots, setDots] = useState('.');
  const [progress, setProgress] = useState(0);
  const router = useRouter(); 
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const Id = localStorage.getItem('userId') || "Bad Request";
    setUserId(Id);

    const checkApproval = async () => {
      try {
        const res = await apiRequest(`users/${userId}`, 'GET');
        console.log('Current status:', res.status);
        if (res?.status === 1) {
          router.push('/home');
        } else if(res?.status === 0) {
          router.push('/blocked');
        }
      } catch (error) {
        console.error('Error fetching approval status:', error);
      }
    };

    // Initial check
    checkApproval();

    // Set up intervals
    const statusInterval = setInterval(checkApproval, 5000); // Check every 5 seconds
    const dotInterval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : '.'));
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + Math.random() * 5;
        return newProgress > 100 ? 100 : newProgress;
      });
    }, 1000);

    // Cleanup intervals
    return () => {
      clearInterval(statusInterval);
      clearInterval(dotInterval);
      clearInterval(progressInterval);
    };
  }, [router, userId]);

  return (
    <div className="flex flex-col items-center space-y-4 p-6 animate-fade-in max-h-screen">
      <div className="bg-primary/10 p-3 rounded-full animate-pulse-slow">
        <Clock className="h-8 w-8 text-primary" />
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight animate-slide-up">Account Pending Approval</h1>
        <p className="text-sm text-muted-foreground max-w-sm animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Your account is being reviewed. We`ll notify you once approved.
        </p>
      </div>

      <div className="w-full max-w-sm bg-secondary rounded-full h-3 overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div
          className="bg-primary h-full transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="text-primary text-sm font-medium animate-slide-up" style={{ animationDelay: '0.3s' }}>
        Reviewing your information{dots}
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-sm animate-slide-up" style={{ animationDelay: '0.4s' }}>
        <div className="bg-card p-4 rounded-lg shadow-sm border hover-scale">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-sm">What`s Next?</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Once approved, you`ll get full access to your personalized feed.
          </p>
        </div>

        <div className="bg-card p-4 rounded-lg shadow-sm border hover-scale">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h3 className="font-semibold text-sm">Need Help?</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Contact our support team for any questions.
          </p>
        </div>
      </div>

      <div className="flex gap-3 animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <Button variant="outline" size="sm" asChild className="hover-scale">
          <Link href="/contact-support">Contact Support</Link>
        </Button>
        <Button variant="outline" size="sm" asChild className="hover-scale">
          <Link href="/login">Back to Login</Link>
        </Button>
      </div>
    </div>
  );
}
