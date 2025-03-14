'use client';

import { ThemeToggle } from '@/components/theme-toggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <div className="bg-background rounded-xl shadow-2xl p-8 space-y-8 ring-1 ring-border/10">
          {children}
        </div>
      </div>
    </div>
  );
}