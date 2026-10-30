'use client';

import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { testimonials } from '@/data/mock';
import { Section, SectionHeading } from '@/components/motion/section';

export function LandingTestimonials() {
  return (
    <Section id="testimonials">
      <SectionHeading
        eyebrow="Loved by families"
        title={<>Trusted by people who plan ahead</>}
        description="From estate attorneys to founders, families rely on InHerify to protect what matters."
      />
      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="glass-card flex h-full flex-col rounded-2xl p-6"
          >
            <Quote className="h-6 w-6 text-primary/60" />
            <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/90">
              "{t.content}"
            </p>
            <div className="mt-4 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={
                    idx < t.rating
                      ? 'h-4 w-4 fill-amber-400 text-amber-400'
                      : 'h-4 w-4 text-muted-foreground/30'
                  }
                />
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
              <div className="grid h-10 w-10 place-items-center rounded-full gradient-primary text-sm font-semibold text-white">
                {t.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.role}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}
