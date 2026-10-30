'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Upload,
  Search,
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  Download,
  Trash2,
  Share2,
  Lock,
  Eye,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader } from '@/components/dashboard/card';
import { EmptyState } from '@/components/dashboard/states';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/dashboard/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { vaultService } from '@/services/vault.service';
import { nomineeService } from '@/services/nominee.service';
import { Nominee, VaultDocument } from '@/types';
import { formatDate, formatBytes } from '@/utils/format';
import { toast } from 'sonner';

const iconForType: Record<string, any> = {
  pdf: FileText,
  image: FileImage,
  doc: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: FileText,
  other: File,
};

function openBlob(blob: Blob, filename: string, mode: 'preview' | 'download') {
  const url = URL.createObjectURL(blob);
  if (mode === 'preview') {
    window.open(url, '_blank');
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export default function DocumentsPage() {
  const [query, setQuery] = useState('');
  const [shareDoc, setShareDoc] = useState<VaultDocument | null>(null);
  const [shareSelection, setShareSelection] = useState<string[]>([]);
  const [savingShare, setSavingShare] = useState(false);
  const queryClient = useQueryClient();
  const { data: docs = [] } = useQuery<VaultDocument[]>({
    queryKey: ['documents'],
    queryFn: vaultService.listDocuments,
  });

  const { data: allNominees = [] } = useQuery<Nominee[]>({
    queryKey: ['nominees'],
    queryFn: nomineeService.list,
  });

  async function handleDelete(id: string) {
    try {
      await vaultService.deleteDocument(id);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Document deleted');
    } catch {
      toast.error('Failed to delete document');
    }
  }

  async function handlePreview(id: string) {
    try {
      const { blob, filename } = await vaultService.previewDocument(id);
      openBlob(blob, filename, 'preview');
    } catch {
      toast.error('Failed to preview document');
    }
  }

  async function handleDownload(id: string) {
    try {
      const { blob, filename } = await vaultService.downloadDocument(id);
      openBlob(blob, filename, 'download');
      toast.success('Download started');
    } catch {
      toast.error('Failed to download document');
    }
  }

  function openShare(d: VaultDocument) {
    setShareDoc(d);
    setShareSelection(d.sharedWithNomineeIds ?? []);
  }

  async function handleSaveShare() {
    if (!shareDoc) return;
    setSavingShare(true);
    try {
      await vaultService.updateDocumentShare(shareDoc.id, shareSelection);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Sharing updated');
      setShareDoc(null);
    } catch {
      toast.error('Failed to update sharing');
    } finally {
      setSavingShare(false);
    }
  }

  const filtered = useMemo<VaultDocument[]>(() => {
    if (!query.trim()) return docs as VaultDocument[];
    const q = query.toLowerCase();
    return docs.filter((d: VaultDocument) => d.name.toLowerCase().includes(q));
  }, [docs, query]);
 
  const columns: Column<VaultDocument>[] = [
    {
      key: 'name',
      header: 'Document',
      sortValue: (d: VaultDocument) => d.name,
      cell: (d: VaultDocument) => {
        const Icon = iconForType[d.type] ?? File;
        return (
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">{d.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{d.category}</p>
            </div>
          </div>
        );
      },
    },
    { key: 'size', header: 'Size', sortValue: (d: VaultDocument) => d.size, cell: (d: VaultDocument) => formatBytes(d.size) },
    { key: 'uploaded', header: 'Uploaded', sortValue: (d: VaultDocument) => d.uploadedAt, cell: (d: VaultDocument) => formatDate(d.uploadedAt) },
    {
      key: 'shared',
      header: 'Shared',
      cell: (d: VaultDocument) => <Badge variant="outline">{d.sharedWithNomineeIds.length} nominees</Badge>,
    },
    {
      key: 'status',
      header: 'Status',
      cell: (d: VaultDocument) =>
        d.encrypted ? (
          <Badge className="bg-emerald-500/15 text-emerald-500"><Lock className="mr-1 h-3 w-3" /> Encrypted</Badge>
        ) : (
          <Badge variant="secondary">Unencrypted</Badge>
        ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (d: VaultDocument) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => handlePreview(d.id)}><Eye className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => handleDownload(d.id)}><Download className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => openShare(d)}><Share2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="text-rose-500" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardShell>
      <PageHeader
        title="Documents"
        description="Encrypted documents stored in your vault."
        actions={
          <Button asChild className="gradient-primary text-white">
            <Link href="/documents/upload"><Upload className="mr-2 h-4 w-4" /> Upload</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader title="Total documents" /><p className="text-2xl font-semibold">{docs.length}</p></Card>
        <Card><CardHeader title="Total size" /><p className="text-2xl font-semibold">{formatBytes(docs.reduce((a: number, d: VaultDocument) => a + d.size, 0))}</p></Card>
        <Card><CardHeader title="Encrypted" /><p className="text-2xl font-semibold text-emerald-500">{docs.filter((d: VaultDocument) => d.encrypted).length}</p></Card>
        <Card><CardHeader title="Shared" /><p className="text-2xl font-semibold">{docs.filter((d: VaultDocument) => d.sharedWithNomineeIds.length > 0).length}</p></Card>
      </div>

      <div className="mt-6">
        <div className="mb-4 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search documents…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="No documents found"
            description="Upload your first encrypted document to your vault."
            action={<Button asChild className="gradient-primary text-white"><Link href="/documents/upload"><Upload className="mr-2 h-4 w-4" /> Upload document</Link></Button>}
          />
        ) : (
          <DataTable data={filtered} columns={columns} />
        )}
      </div>

      <Dialog open={!!shareDoc} onOpenChange={(open) => !open && setShareDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share &ldquo;{shareDoc?.name}&rdquo;</DialogTitle>
            <DialogDescription>Choose which nominees can access this document.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {allNominees.length === 0 && (
              <p className="text-sm text-muted-foreground">No nominees yet. Add one first to share this document.</p>
            )}
            {allNominees.map((n: Nominee) => {
              const checked = shareSelection.includes(n.id);
              return (
                <label key={n.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted/40">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(v) =>
                      setShareSelection((s) => (v ? [...s, n.id] : s.filter((id) => id !== n.id)))
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDoc(null)}>Cancel</Button>
            <Button className="gradient-primary text-white" disabled={savingShare} onClick={handleSaveShare}>
              {savingShare ? 'Saving…' : 'Save sharing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
