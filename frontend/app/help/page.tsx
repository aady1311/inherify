'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LifeBuoy, Search, Plus, Minus, BookOpen, MessageSquare, Mail } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader } from '@/components/dashboard/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { faqItems } from '@/data/mock';
import { cn } from '@/lib/utils';

const categories = ['All', 'Security', 'Nominees', 'Billing', 'Digital Will'];

export default function HelpPage() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState<string | null>(faqItems[0].id);

  const filtered = useMemo(() => {
    let l = faqItems;
    if (cat !== 'All') l = l.filter((f) => f.category === cat);
    if (query.trim()) {
      const q = query.toLowerCase();
      l = l.filter((f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q));
    }
    return l;
  }, [query, cat]);

  return (
    <DashboardShell>
      <PageHeader title="Help Center" description="Find answers, browse guides, and reach support." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Search articles" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search for help…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                  cat === c ? 'border-transparent gradient-primary text-white' : 'border-border bg-card/50 text-muted-foreground hover:text-foreground'
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            {filtered.map((item) => {
              const isOpen = open === item.id;
              return (
                <div key={item.id} className={cn('glass-card overflow-hidden rounded-2xl', isOpen && 'ring-1 ring-primary/40')}>
                  <button onClick={() => setOpen(isOpen ? null : item.id)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
                    <span className="text-sm font-medium">{item.question}</span>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <p className="px-5 pb-5 text-sm text-muted-foreground">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Quick links" />
            <div className="space-y-2">
              <Link href="/settings" className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm hover:bg-muted/40">
                <BookOpen className="h-4 w-4 text-primary" /> Account settings
              </Link>
              <Link href="/subscription" className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm hover:bg-muted/40">
                <LifeBuoy className="h-4 w-4 text-primary" /> Billing & plans
              </Link>
              <Link href="/emergency-contacts" className="flex items-center gap-3 rounded-xl border border-border p-3 text-sm hover:bg-muted/40">
                <Mail className="h-4 w-4 text-primary" /> Emergency contacts
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader title="Need more help?" />
            <p className="text-sm text-muted-foreground">Our support team is available 24/7 on the Legacy plan.</p>
            <Button asChild className="mt-3 w-full gradient-primary text-white">
              <a href="mailto:aadityayadav7656@gmail.com?subject=InHerify%20Support%20request">
                <MessageSquare className="mr-2 h-4 w-4" /> Contact support
              </a>
            </Button>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
