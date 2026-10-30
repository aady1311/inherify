'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function StatCard({
  icon,
  label,
  value,
  hint,
  trend,
  delay = 0,
  accent = 'primary',
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  hint?: string;
  trend?: { value: string; positive: boolean };
  delay?: number;
  accent?: 'primary' | 'secondary' | 'accent' | 'emerald' | 'amber' | 'rose';
}) {
  const accents: Record<string, string> = {
    primary: 'from-primary/20 to-primary/5 text-primary',
    secondary: 'from-secondary/20 to-secondary/5 text-secondary',
    accent: 'from-accent/20 to-accent/5 text-accent',
    emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-500',
    amber: 'from-amber-500/20 to-amber-500/5 text-amber-500',
    rose: 'from-rose-500/20 to-rose-500/5 text-rose-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex items-start justify-between">
        <div className={cn('grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br', accents[accent])}>
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              trend.positive
                ? 'bg-emerald-500/15 text-emerald-500'
                : 'bg-rose-500/15 text-rose-500'
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
      {hint && <p className="mt-2 text-xs text-muted-foreground/80">{hint}</p>}
    </motion.div>
  );
}
