'use client';

import { motion } from 'framer-motion';
import { UserPlus, FolderLock, Users, ShieldCheck } from 'lucide-react';
import { Section, SectionHeading } from '@/components/motion/section';

const steps = [
  {
    icon: UserPlus,
    title: 'Create your vault',
    desc: 'Sign up, set a master password, and generate your recovery key in under two minutes.',
  },
  {
    icon: FolderLock,
    title: 'Add your assets',
    desc: 'Import passwords, upload documents, and connect wallets across 12 categories.',
  },
  {
    icon: Users,
    title: 'Assign nominees',
    desc: 'Choose trusted people, set share percentages, and define access rules.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified inheritance',
    desc: 'When the time comes, nominees complete verification and inherit access — securely.',
  },
];

export function LandingHowItWorks() {
  return (
    <Section id="how" className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/10 blur-[140px]" />
      </div>
      <SectionHeading
        eyebrow="How it works"
        title={<>Four steps to a lasting digital legacy</>}
        description="Designed to be set up in an afternoon and trusted for a lifetime."
      />
      <div className="relative mt-16 grid gap-6 md:grid-cols-4">
        <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent md:block" />
        {steps.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative"
          >
            <div className="glass-card rounded-2xl p-6 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-white shadow-glow">
                <s.icon className="h-6 w-6" />
              </div>
              <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-primary">
                Step {i + 1}
              </div>
              <h3 className="mt-1 text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
