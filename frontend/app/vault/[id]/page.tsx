'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Lock, Star, Pencil, Trash2, Share2, Copy, Eye, EyeOff,
  ShieldCheck, Calendar, User, Link as LinkIcon, Users, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader } from '@/components/dashboard/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { vaultService } from '@/services/vault.service';
import { nomineeService } from '@/services/nominee.service';
import { formatDate, timeAgo, initials } from '@/utils/format';

export default function VaultDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showSecret, setShowSecret] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareSelection, setShareSelection] = useState<string[]>([]);
  const [savingShare, setSavingShare] = useState(false);

  const { data: asset, isLoading } = useQuery({
    queryKey: ['vault-asset', params.id],
    queryFn: () => vaultService.getAsset(params.id as string),
  });

  const { data: allNominees = [] } = useQuery({
    queryKey: ['nominees'],
    queryFn: nomineeService.list,
  });

  if (isLoading) return (
    <DashboardShell>
      <div className="p-8 text-center text-muted-foreground">Loading…</div>
    </DashboardShell>
  );

  if (!asset) return (
    <DashboardShell>
      <PageHeader title="Asset not found" />
      <Card>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <AlertCircle className="h-5 w-5" /> This asset could not be found.
          <Button asChild variant="outline" size="sm"><Link href="/vault">Back to vault</Link></Button>
        </div>
      </Card>
    </DashboardShell>
  );

  const sharedNominees = allNominees.filter((n: any) =>
    (asset.sharedWithNomineeIds ?? []).includes(n.id)
  );

  async function handleDelete() {
    try {
      await vaultService.deleteAsset(asset.id);
      queryClient.invalidateQueries({ queryKey: ['vault-assets'] });
      toast.success('Asset deleted');
      router.push('/vault');
    } catch { toast.error('Failed to delete asset'); }
  }

  function openShare() {
    setShareSelection(asset.sharedWithNomineeIds ?? []);
    setShareOpen(true);
  }

  async function handleSaveShare() {
    setSavingShare(true);
    try {
      await vaultService.updateAsset(asset.id, { sharedWithNomineeIds: shareSelection });
      queryClient.invalidateQueries({ queryKey: ['vault-asset', asset.id] });
      toast.success('Sharing updated');
      setShareOpen(false);
    } catch {
      toast.error('Failed to update sharing');
    } finally {
      setSavingShare(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(asset.notes ?? asset.username ?? '');
    toast.success('Copied to clipboard');
  }

  return (
    <DashboardShell>
      <PageHeader
        title={asset.title}
        description={`Category · ${asset.category}`}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href={`/vault/${asset.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Edit</Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-rose-500"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this asset?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove "{asset.title}" from your vault. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-rose-500 hover:bg-rose-600">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="Asset details" />
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow icon={User} label="Username" value={asset.username ?? '—'} />
              <DetailRow icon={LinkIcon} label="URL" value={asset.url ? <a href={asset.url} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate block">{asset.url}</a> : '—'} />
              <DetailRow icon={Calendar} label="Created" value={formatDate(asset.createdAt)} />
              <DetailRow icon={Calendar} label="Updated" value={formatDate(asset.updatedAt)} />
              <DetailRow icon={Calendar} label="Last accessed" value={asset.lastAccessedAt ? formatDate(asset.lastAccessedAt) : 'Never'} />
              <DetailRow icon={ShieldCheck} label="Status" value={<Badge variant="secondary" className="capitalize">{asset.status}</Badge>} />
            </div>
          </Card>

          {asset.notes && (
            <Card>
              <CardHeader title="Notes / Secret" description="Sensitive information stored encrypted" />
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <code className="font-mono text-sm break-all">
                    {showSecret ? asset.notes : '••••••••••••••••••••'}
                  </code>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setShowSecret((v) => !v)}>
                      {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={handleCopy}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader
              title="Shared nominees"
              description={`${sharedNominees.length} nominee${sharedNominees.length === 1 ? '' : 's'} with access`}
              action={<Button size="sm" variant="outline" onClick={openShare}><Share2 className="mr-2 h-4 w-4" /> Share</Button>}
            />
            {sharedNominees.length === 0 ? (
              <p className="text-sm text-muted-foreground">Not shared with any nominee yet.</p>
            ) : (
              <div className="space-y-2">
                {sharedNominees.map((n: any) => (
                  <div key={n.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                    <Avatar>
                      <AvatarFallback className="gradient-primary text-white">{initials(n.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{n.name}</p>
                      <p className="text-xs text-muted-foreground">{n.relation} · {n.email}</p>
                    </div>
                    <Badge className={n.verificationStatus === 'verified' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'}>
                      {n.verificationStatus ?? n.verification_status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Security" />
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><Lock className="h-4 w-4" /> Encryption</span>
                <Badge className="bg-emerald-500/15 text-emerald-500">AES-256</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><Star className="h-4 w-4" /> Favorite</span>
                <span>{asset.favorite ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> Shared with</span>
                <span>{(asset.sharedWithNomineeIds ?? []).length} nominees</span>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Activity" />
            <ul className="space-y-3 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formatDate(asset.createdAt)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span>{timeAgo(asset.updatedAt)}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-muted-foreground">Last accessed</span>
                <span>{asset.lastAccessedAt ? timeAgo(asset.lastAccessedAt) : 'Never'}</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share &ldquo;{asset.title}&rdquo;</DialogTitle>
            <DialogDescription>Choose which nominees can access this asset.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {allNominees.length === 0 && (
              <p className="text-sm text-muted-foreground">No nominees yet. Add one first to share this asset.</p>
            )}
            {allNominees.map((n: any) => {
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
            <Button variant="outline" onClick={() => setShareOpen(false)}>Cancel</Button>
            <Button className="gradient-primary text-white" disabled={savingShare} onClick={handleSaveShare}>
              {savingShare ? 'Saving…' : 'Save sharing'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" /> {label}
      </p>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
