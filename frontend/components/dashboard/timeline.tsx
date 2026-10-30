'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const config: Record<string, { color: string; icon?: any }> = {
  login: { color: 'bg-sky-500/15 text-sky-500' },
  logout: { color: 'bg-muted text-muted-foreground' },
  create: { color: 'bg-emerald-500/15 text-emerald-500' },
  update: { color: 'bg-amber-500/15 text-amber-500' },
  delete: { color: 'bg-rose-500/15 text-rose-500' },
  share: { color: 'bg-violet-500/15 text-violet-500' },
  verify: { color: 'bg-primary/15 text-primary' },
  download: { color: 'bg-cyan-500/15 text-cyan-500' },
  upload: { color: 'bg-teal-500/15 text-teal-500' },
};

export function Timeline({
  items,
  iconFor,
  titleFor,
  descriptionFor,
  metaFor,
  emptyMessage = 'No activity yet',
}: {
  items: any[];
  iconFor: (item: any) => ReactNode;
  titleFor: (item: any) => string;
  descriptionFor: (item: any) => string;
  metaFor: (item: any) => string;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-border py-12 text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  return (
    <div className="relative">
      <div className="absolute bottom-0 left-[18px] top-2 w-px bg-border" />
      <ul className="space-y-5">
        {items.map((item, i) => (
          <motion.li
            key={item.id ?? i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
            className="relative flex gap-4"
          >
            <div className="z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-card">
              {iconFor(item)}
            </div>
            <div className="flex-1 pt-1">
              <p className="text-sm font-medium">{titleFor(item)}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{descriptionFor(item)}</p>
              <p className="mt-1 text-xs text-muted-foreground/80">{metaFor(item)}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

export function TimelineDot({ type, children }: { type: string; children?: ReactNode }) {
  const c = config[type] ?? config.update;
  return (
    <span className={cn('grid h-9 w-9 place-items-center rounded-full', c.color)}>
      {children}
    </span>
  );
}
