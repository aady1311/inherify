'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Fingerprint, EyeOff, KeyRound, FileCheck } from 'lucide-react';
import { Section, SectionHeading } from '@/components/motion/section';

const pillars = [
  { icon: Lock, title: 'AES-256 encryption', desc: 'Every asset encrypted at rest with industry-grade ciphers.' },
  { icon: EyeOff, title: 'Zero-knowledge', desc: 'Your master password never leaves your device. We cannot read your data.' },
  { icon: Fingerprint, title: 'Biometric 2FA', desc: 'Face ID, Touch ID, and hardware key support out of the box.' },
  { icon: KeyRound, title: 'Offline recovery', desc: 'Generate a recovery key and store it in a physical safe.' },
  { icon: FileCheck, title: 'Audit trail', desc: 'Every action is logged with IP, device, and location.' },
  { icon: ShieldCheck, title: 'Verified inheritance', desc: 'Nominees must complete identity and legal verification.' },
];

export function LandingSecurity() {
  return (
    <Section id="security">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            center={false}
            eyebrow="Security"
            title={<>Security that respects your privacy</>}
            description="We built InHerify so that even we cannot read your data. Your secrets stay yours — forever."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {pillars.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="glass-card rounded-2xl p-4"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                  <p.icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-medium">{p.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="glass-card rounded-3xl p-8 shadow-glow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Security score</span>
              </div>
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-5xl font-semibold gradient-text">92</span>
              <span className="mb-2 text-sm text-emerald-500">Excellent</span>
            </div>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: '92%' }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded-full gradient-primary"
              />
            </div>
            <div className="mt-6 space-y-3">
              {[
                { label: '2FA enabled', value: '100%' },
                { label: 'Encryption', value: '95%' },
                { label: 'Recovery key', value: '80%' },
                { label: 'Nominees verified', value: '90%' },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
