'use client';

import Link from 'next/link';
import { Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';

export function AuthNavbar() {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="container mx-auto px-4 pt-4">
        <nav className="glass-card flex items-center justify-between rounded-2xl px-4 py-3 shadow-glow">
          <Link href="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl gradient-primary text-white">
              <Shield className="h-5 w-5" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              InHer<span className="gradient-text">ify</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
