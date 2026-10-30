'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { faqItems } from '@/data/mock';
import { Section, SectionHeading } from '@/components/motion/section';
import { cn } from '@/lib/utils';

export function LandingFAQ() {
  const [open, setOpen] = useState<string | null>(faqItems[0].id);
  return (
    <Section id="faq">
      <SectionHeading
        eyebrow="FAQ"
        title={<>Frequently asked questions</>}
        description="Everything you need to know about securing your digital legacy."
      />
      <div className="mx-auto mt-12 max-w-3xl space-y-3">
        {faqItems.map((item) => {
          const isOpen = open === item.id;
          return (
            <div
              key={item.id}
              className={cn(
                'glass-card overflow-hidden rounded-2xl transition-all',
                isOpen && 'ring-1 ring-primary/40'
              )}
            >
              <button
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-sm font-medium md:text-base">{item.question}</span>
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="px-5 pb-5 text-sm text-muted-foreground">{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
