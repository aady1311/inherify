'use client';

import {
  FolderLock,
  Users,
  ScrollText,
  ShieldCheck,
  KeyRound,
  Bell,
  FileText,
  Wallet,
  Globe,
} from 'lucide-react';
import { Section, SectionHeading } from '@/components/motion/section';
import { FadeIn } from '@/components/motion/fade-in';

const features = [
  {
    icon: FolderLock,
    title: 'Encrypted vault',
    desc: 'Store passwords, documents, wallets, and notes with AES-256 zero-knowledge encryption.',
  },
  {
    icon: Users,
    title: 'Trusted nominees',
    desc: 'Assign family, friends, or legal counsel with share percentages and access rules.',
  },
  {
    icon: ScrollText,
    title: 'Digital will builder',
    desc: 'Draft, version, sign, and publish your digital will with a rich text editor.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified inheritance',
    desc: 'Nominees complete identity verification before any access is granted.',
  },
  {
    icon: KeyRound,
    title: '2FA & recovery',
    desc: 'Hardware-key compatible 2FA and an offline recovery key for peace of mind.',
  },
  {
    icon: FileText,
    title: 'Document vault',
    desc: 'Upload, encrypt, and share deeds, insurance, medical records, and IDs.',
  },
  {
    icon: Wallet,
    title: 'Crypto inheritance',
    desc: 'Securely pass on wallet seeds and exchange accounts with time-locked access.',
  },
  {
    icon: Bell,
    title: 'Real-time alerts',
    desc: 'Get notified on logins, nominee activity, and verification milestones.',
  },
  {
    icon: Globe,
    title: 'Works everywhere',
    desc: 'Beautiful, responsive, and accessible on mobile, tablet, and desktop.',
  },
];

export function LandingFeatures() {
  return (
    <Section id="features">
      <SectionHeading
        eyebrow="Features"
        title={<>Everything you need to protect your digital life</>}
        description="A complete platform to store, organize, and pass on your digital assets — built with privacy and security at its core."
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f, i) => (
          <FadeIn key={f.title} delay={i * 0.05}>
            <div className="group glass-card h-full rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-glow">
              <div className="grid h-12 w-12 place-items-center rounded-xl gradient-primary text-white shadow-glow transition-transform group-hover:scale-110">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}
