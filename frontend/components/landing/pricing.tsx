'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { pricingPlans } from '@/data/mock';
import { Section, SectionHeading } from '@/components/motion/section';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LandingPricing() {
  return (
    <Section id="pricing">
      <SectionHeading
        eyebrow="Pricing"
        title={<>Simple, transparent pricing</>}
        description="Start free. Upgrade when your digital life grows. Cancel anytime."
      />
      <div className="mt-14 grid gap-6 lg:grid-cols-3">
        {pricingPlans.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className={cn(
              'glass-card relative flex flex-col rounded-3xl p-7',
              plan.highlighted && 'shadow-glow ring-1 ring-primary/40'
            )}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-3 py-1 text-xs font-medium text-white">
                Most popular
              </div>
            )}
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>
            <div className="mt-5 flex items-end gap-1">
              <span className="text-4xl font-semibold tracking-tight">${plan.price}</span>
              <span className="mb-1 text-sm text-muted-foreground">/{plan.period}</span>
            </div>
            <ul className="mt-6 flex-1 space-y-3 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                    <Check className="h-3 w-3" />
                  </span>
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              className={cn(
                'mt-6 w-full',
                plan.highlighted ? 'gradient-primary text-white' : ''
              )}
              variant={plan.highlighted ? 'default' : 'outline'}
            >
              <Link href="/signup">
                {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
