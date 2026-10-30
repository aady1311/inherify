'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-[400px] w-[700px] -translate-x-1/2 rounded-full bg-primary/20 blur-[140px]" />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="glass-card rounded-3xl p-10 md:p-16"
        >
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-primary text-white shadow-glow">
            <ShieldQuestion className="h-8 w-8" />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 text-6xl font-semibold gradient-text md:text-7xl"
          >
            404
          </motion.h1>
          <p className="mt-3 text-lg font-medium">Page not found</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            The page you're looking for might have been moved, deleted, or never existed.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="gradient-primary text-white"><Link href="/"><Home className="mr-2 h-4 w-4" /> Back home</Link></Button>
            <Button asChild variant="outline"><Link href="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" /> Go to dashboard</Link></Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
