'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  FolderLock,
  KeyRound,
  PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const stats = [
  { label: 'Assets secured', value: '14M+' },
  { label: 'Families protected', value: '38K' },
  { label: 'Avg. security score', value: '94' },
  { label: 'Uptime', value: '99.99%' },
];

const float = {
  animate: {
    y: [0, -12, 0],
    transition: { duration: 6, repeat: Infinity, ease: 'easeInOut' as const },
  },
};

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-12 md:pt-20">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
        <div className="absolute left-1/2 top-0 h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-10 top-40 h-[320px] w-[320px] rounded-full bg-accent/20 blur-[120px]" />
        <div className="absolute left-10 top-60 h-[280px] w-[280px] rounded-full bg-secondary/20 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Now with AI-assisted digital will builder
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl"
          >
            Secure your <span className="gradient-text">digital legacy</span>{' '}
            for the people you love.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg"
          >
            Store passwords, documents, crypto wallets, and personal notes in an
            encrypted vault. Assign trusted nominees and let a verified
            inheritance process pass it on — exactly as you intended.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Button asChild size="lg" className="gradient-primary text-white shadow-glow">
              <Link href="/signup">
                Create your vault <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass-card">
              <Link href="/dashboard">
                <PlayCircle className="mr-2 h-4 w-4" /> View demo dashboard
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-14 grid grid-cols-2 gap-4 md:grid-cols-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="glass-card rounded-2xl px-4 py-5">
                <div className="text-2xl font-semibold md:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          <motion.div {...float} className="glass-card rounded-3xl p-4 md:p-6 shadow-glow">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: ShieldCheck, title: 'AES-256 encryption', desc: 'Zero-knowledge architecture' },
                { icon: Users, title: 'Verified nominees', desc: 'Identity-checked inheritance' },
                { icon: FolderLock, title: '12 asset categories', desc: 'From passwords to property' },
              ].map((c) => (
                <div key={c.title} className="rounded-2xl border border-border bg-card/60 p-4">
                  <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-white">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-sm font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card/60 p-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <KeyRound className="h-4 w-4" /> Security score
                </div>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-4xl font-semibold">92</span>
                  <span className="mb-1 text-xs text-emerald-500">+4 this month</span>
                </div>
                <div className="mt-3 h-2 w-full rounded-full bg-muted">
                  <div className="h-full w-[92%] rounded-full gradient-primary" />
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card/60 p-5">
                <p className="text-sm text-muted-foreground">Recent activity</p>
                <ul className="mt-2 space-y-2 text-sm">
                  <li>Signed in from MacBook Pro</li>
                  <li>Updated MetaMask wallet notes</li>
                  <li>Shared 3 documents with Priya</li>
                </ul>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
