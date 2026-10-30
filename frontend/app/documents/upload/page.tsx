'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader } from '@/components/dashboard/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { vaultService } from '@/services/vault.service';
import { nomineeService } from '@/services/nominee.service';
import { formatBytes } from '@/utils/format';

interface PendingFile {
  file: File;
  progress: number;
}

export default function UploadDocumentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [category, setCategory] = useState('identity');
  const [selectedNominees, setSelectedNominees] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: allNominees = [] } = useQuery({
    queryKey: ['nominees'],
    queryFn: nomineeService.list,
  });

  function addFiles(list: FileList) {
    const incoming = Array.from(list).map((file) => ({ file, progress: 0 }));
    setFiles((prev) => [...prev, ...incoming]);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  }

  async function upload() {
    if (files.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await new Promise<void>((resolve) => {
          let p = 0;
          const interval = setInterval(() => {
            p += 12 + Math.random() * 18;
            if (p >= 100) {
              p = 100;
              clearInterval(interval);
              resolve();
            }
            setFiles((prev) => prev.map((f, idx) => (idx === i ? { ...f, progress: Math.min(100, p) } : f)));
          }, 120);
        });
        const f = files[i].file;
        await vaultService.uploadDocument({
          file: f,
          category,
          sharedWithNomineeIds: selectedNominees,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success(`${files.length} document${files.length === 1 ? '' : 's'} uploaded and encrypted`);
      router.push('/documents');
    } catch (e: any) {
      toast.error(e.message || 'Failed to upload documents');
    } finally {
      setUploading(false);
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Upload documents"
        description="Drag, drop, and encrypt your documents."
        actions={
          <Button variant="outline" asChild>
            <Link href="/documents"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Upload area" />
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
                dragging ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <motion.div
                animate={{ y: dragging ? -4 : 0 }}
                className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-white shadow-glow"
              >
                <Upload className="h-6 w-6" />
              </motion.div>
              <p className="mt-4 text-sm font-medium">Drag and drop files here</p>
              <p className="mt-1 text-xs text-muted-foreground">or click to browse · max 100MB per file</p>
              <input
                ref={inputRef}
                type="file"
                multiple
                hidden
                onChange={(e) => e.target.files && addFiles(e.target.files)}
              />
            </div>

            <AnimatePresence>
              {files.length > 0 && (
                <motion.div layout className="mt-4 space-y-2">
                  {files.map((f, i) => (
                    <motion.div
                      key={f.file.name + i}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 rounded-xl border border-border p-3"
                    >
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{f.file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatBytes(f.file.size)}</p>
                        {uploading && <Progress value={f.progress} className="mt-2 h-1" />}
                      </div>
                      {f.progress === 100 ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Category" />
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['identity', 'property', 'insurance', 'medical', 'crypto', 'custom'].map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card>
            <CardHeader title="Share with nominees" />
            <div className="space-y-2">
              {allNominees.length === 0 && (
                <p className="text-sm text-muted-foreground">No nominees yet.</p>
              )}
              {allNominees.map((n: any) => {
                const checked = selectedNominees.includes(n.id);
                return (
                  <label key={n.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted/40">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) =>
                        setSelectedNominees((s) => (v ? [...s, n.id] : s.filter((id) => id !== n.id)))
                      }
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{n.name}</p>
                      <p className="text-xs text-muted-foreground">{n.relation}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </Card>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-500">
            <Lock className="h-4 w-4" /> Files are encrypted before upload
          </div>

          <Button onClick={upload} disabled={files.length === 0 || uploading} className="w-full gradient-primary text-white">
            <Upload className="mr-2 h-4 w-4" /> {uploading ? 'Uploading…' : 'Upload & encrypt'}
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
