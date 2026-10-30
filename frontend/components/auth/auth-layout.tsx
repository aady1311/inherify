'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Shield, Quote } from 'lucide-react';
import { AuthNavbar } from '@/components/layout/auth-navbar';
import { motion } from 'framer-motion';

export function AuthLayout({
  children,
  title,
  description,
  side,
}: {
  children: ReactNode;
  title: string;
  description: string;
  side?: 'left' | 'right';
}) {
  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="mx-auto grid max-w-5xl items-stretch gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`glass-card rounded-3xl p-8 md:p-10 ${side === 'right' ? 'md:order-2' : ''}`}
          >
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <div className="mt-6">{children}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`relative overflow-hidden rounded-3xl gradient-primary p-8 text-white md:p-10 ${side === 'right' ? 'md:order-1' : ''}`}
          >
            <div className="pointer-events-none absolute inset-0 opacity-30 grid-bg" />
            <div className="relative flex h-full flex-col">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                <span className="text-sm font-medium">InHerify</span>
              </div>
              <div className="mt-auto">
                <Quote className="h-8 w-8 text-white/60" />
                <p className="mt-3 text-lg leading-relaxed text-white/95">
                  "I sleep better knowing my family will be able to access my
                  digital life — passwords, wallets, and memories — through a
                  process I trust."
                </p>
                <p className="mt-4 text-sm text-white/80">
                  — James Okafor, Founder, Nebula Labs
                </p>
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {[
                    { v: '14M+', l: 'Assets secured' },
                    { v: '38K', l: 'Families' },
                    { v: '99.99%', l: 'Uptime' },
                  ].map((s) => (
                    <div key={s.l} className="rounded-2xl bg-white/10 p-3 text-center">
                      <div className="text-lg font-semibold">{s.v}</div>
                      <div className="text-xs text-white/70">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function AuthFooterLink({
  text,
  href,
  label,
}: {
  text: string;
  href: string;
  label: string;
}) {
  return (
    <p className="mt-6 text-center text-sm text-muted-foreground">
      {text}{' '}
      <Link href={href} className="font-medium text-primary hover:underline">
        {label}
      </Link>
    </p>
  );
}
