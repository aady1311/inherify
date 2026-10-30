'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar';

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 right-[-10%] h-[550px] w-[550px] rounded-full bg-primary/10 blur-[130px] dark:bg-primary/[0.12]" />
        <div className="absolute top-[35%] -left-32 h-[450px] w-[450px] rounded-full bg-secondary/10 blur-[120px] dark:bg-secondary/[0.08]" />
        <div className="absolute bottom-[-10%] right-[20%] h-[400px] w-[400px] rounded-full bg-accent/10 blur-[140px] dark:bg-accent/[0.07]" />
        <div className="absolute inset-0 bg-grid-white/[0.015] bg-[size:40px_40px] dark:bg-grid-white/[0.02]" />
      </div>

      <DashboardSidebar />
      <main className="relative z-10 md:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
