'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Check,
  Eye,
  Pencil,
  Download,
  History,
  ShieldCheck,
  PenLine,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader } from '@/components/dashboard/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { willService } from '@/services/dashboard.service';
import { DigitalWill } from '@/types';
import { formatDate, timeAgo } from '@/utils/format';
import { cn } from '@/lib/utils';

const emptyWill: DigitalWill = {
  id: '',
  title: 'My Digital Will',
  content: '',
  status: 'draft',
  updatedAt: new Date().toISOString(),
  versions: [],
  signedAt: undefined,
  signatureHash: undefined,
};

export default function DigitalWillPage() {
  const queryClient = useQueryClient();
  const { data: will } = useQuery<DigitalWill | null>({
    queryKey: ['will'],
    queryFn: async () => {
      const result = await willService.get();
      return result ?? null;
    },
  });

  const current: DigitalWill = will ?? emptyWill;
  const [content, setContent] = useState(current.content);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [signing, setSigning] = useState(false);
  const signed = !!current.signedAt;

  useEffect(() => {
    setContent(current.content);
  }, [current.content]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveDraft() {
    setSaving(true);
    try {
      await willService.saveDraft(content);
      queryClient.invalidateQueries({ queryKey: ['will'] });
      toast.success('Draft saved');
    } catch {
      toast.error('Failed to save draft');
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!signed) {
      toast.error('Please sign your will before publishing');
      return;
    }
    setPublishing(true);
    try {
      await willService.publish(content);
      queryClient.invalidateQueries({ queryKey: ['will'] });
      toast.success('Digital will published');
    } catch {
      toast.error('Failed to publish will');
    } finally {
      setPublishing(false);
    }
  }

  async function sign() {
    setSigning(true);
    try {
      await willService.sign(content);
      queryClient.invalidateQueries({ queryKey: ['will'] });
      toast.success('Will digitally signed');
    } catch {
      toast.error('Failed to sign will');
    } finally {
      setSigning(false);
    }
  }

  function downloadText() {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${current.title || 'digital-will'}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Digital Will"
        description="Draft, version, and publish your digital legacy."
        actions={
          <>
            <Button variant="outline" onClick={downloadText}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button onClick={publish} disabled={publishing} className="gradient-primary text-white">
              <Check className="mr-2 h-4 w-4" /> {publishing ? 'Publishing…' : 'Publish'}
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader
              title={current.title}
              description={`Last updated ${timeAgo(current.updatedAt)}`}
              action={
                <div className="flex items-center gap-1 rounded-full border border-border p-1">
                  <button
                    onClick={() => setMode('edit')}
                    className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs', mode === 'edit' ? 'gradient-primary text-white' : 'text-muted-foreground')}
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => setMode('preview')}
                    className={cn('inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs', mode === 'preview' ? 'gradient-primary text-white' : 'text-muted-foreground')}
                  >
                    <Eye className="h-3 w-3" /> Preview
                  </button>
                </div>
              }
            />

            <AnimatePresence mode="wait">
              {mode === 'edit' ? (
                <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={16}
                    className="font-mono text-sm leading-relaxed"
                    placeholder="Write your digital will…"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{content.length} characters · auto-saved</p>
                    <Button variant="outline" size="sm" onClick={saveDraft} disabled={saving}>
                      <Save className="mr-2 h-4 w-4" /> {saving ? 'Saving…' : 'Save draft'}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="prose prose-sm dark:prose-invert max-w-none rounded-2xl border border-border bg-card/40 p-6"
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                    {content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          <Card>
            <CardHeader title="Digital signature" description="Sign your will to make it publishable" />
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className={cn('grid h-12 w-12 place-items-center rounded-xl', signed ? 'bg-emerald-500/15 text-emerald-500' : 'bg-muted text-muted-foreground')}>
                  {signed ? <ShieldCheck className="h-6 w-6" /> : <PenLine className="h-6 w-6" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{signed ? 'Signed' : 'Awaiting signature'}</p>
                  <p className="text-xs text-muted-foreground">
                    {signed && current.signedAt ? `Signed ${formatDate(current.signedAt)}` : 'Sign with your master password'}
                  </p>
                </div>
              </div>
              <Button onClick={sign} disabled={signing || signed} variant={signed ? 'outline' : 'default'} className={signed ? '' : 'gradient-primary text-white'}>
                <PenLine className="mr-2 h-4 w-4" /> {signed ? 'Signed' : signing ? 'Signing…' : 'Sign will'}
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Version history" description="Every saved draft is preserved" />
            <div className="relative">
              <div className="absolute bottom-0 left-[18px] top-2 w-px bg-border" />
              {current.versions.length === 0 && (
                <p className="text-sm text-muted-foreground">No versions yet. Save a draft to start version history.</p>
              )}
              <ul className="space-y-4">
                {current.versions.map((v: { id: string; version: number; updatedAt: string; updatedBy: string; summary: string; published: boolean }, i: number) => (
                  <motion.li
                    key={v.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative flex gap-3"
                  >
                    <div className="z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-card">
                      <History className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">v{v.version}</p>
                        {v.published && <Badge className="bg-emerald-500/15 text-emerald-500">Published</Badge>}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{v.summary}</p>
                      <p className="mt-1 text-xs text-muted-foreground/80">{formatDate(v.updatedAt)} · {v.updatedBy}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </Card>

          <Card>
            <CardHeader title="Status" />
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" /> Current
              </span>
              <Badge variant="secondary" className="capitalize">{current.status}</Badge>
            </div>
          </Card>
        </div>
      </div>
    </DashboardShell>
  );
}
