'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Star, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader } from '@/components/dashboard/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { vaultService } from '@/services/vault.service';
import { nomineeService } from '@/services/nominee.service';
import { AssetCategory, VaultAsset } from '@/types';

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  category: z.enum([
    'passwords',
    'email',
    'bank',
    'crypto',
    'insurance',
    'property',
    'medical',
    'identity',
    'notes',
    'custom',
  ]),
  username: z.string().optional(),
  url: z.string().optional(),
  secret: z.string().optional(),
  notes: z.string().optional(),
  favorite: z.boolean().optional(),
});

type Values = z.infer<typeof schema>;

const categoryOptions: { value: AssetCategory; label: string }[] = [
  { value: 'passwords', label: 'Passwords' },
  { value: 'email', label: 'Email Accounts' },
  { value: 'bank', label: 'Bank Accounts' },
  { value: 'crypto', label: 'Crypto Wallets' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'property', label: 'Property Documents' },
  { value: 'medical', label: 'Medical Records' },
  { value: 'identity', label: 'Identity Documents' },
  { value: 'notes', label: 'Personal Notes' },
  { value: 'custom', label: 'Custom Category' },
];

export function AssetForm({ mode }: { mode: 'add' | 'edit' }) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedNominees, setSelectedNominees] = useState<string[]>([]);

  const { data: allNominees = [] } = useQuery({
    queryKey: ['nominees'],
    queryFn: nomineeService.list,
  });

  const { data: existingAsset } = useQuery({
    queryKey: ['vault-asset', params.id],
    queryFn: () => vaultService.getAsset(params.id as string),
    enabled: mode === 'edit' && !!params.id,
  });

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      category: 'passwords',
      username: '',
      url: '',
      secret: '',
      notes: '',
      favorite: false,
    },
  });

  useEffect(() => {
    if (!existingAsset) return;
    form.reset({
      title: existingAsset.title,
      category: existingAsset.category,
      username: existingAsset.username ?? '',
      url: existingAsset.url ?? '',
      secret: '',
      notes: existingAsset.notes ?? '',
      favorite: existingAsset.favorite ?? false,
    });
    setSelectedNominees(existingAsset.sharedWithNomineeIds ?? []);
  }, [existingAsset]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(values: Values) {
    setLoading(true);
    try {
      const payload: Partial<VaultAsset> = {
        title: values.title,
        category: values.category,
        username: values.username || undefined,
        url: values.url || undefined,
        notes: values.notes || undefined,
        favorite: values.favorite,
        sharedWithNomineeIds: selectedNominees,
      };
      if (mode === 'edit' && params.id) {
        await vaultService.updateAsset(params.id, payload);
        queryClient.invalidateQueries({ queryKey: ['vault-asset', params.id] });
      } else {
        await vaultService.createAsset(payload);
      }
      queryClient.invalidateQueries({ queryKey: ['vault-assets'] });
      toast.success(mode === 'add' ? 'Asset added to vault' : 'Asset updated');
      router.push('/vault');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save asset');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        title={mode === 'add' ? 'Add asset' : 'Edit asset'}
        description={mode === 'add' ? 'Add a new encrypted asset to your vault.' : 'Update your encrypted asset.'}
        actions={
          <Button variant="outline" asChild>
            <Link href="/vault"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader title="General" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" className="mt-1.5" placeholder="e.g. Gmail — Primary" {...form.register('title')} />
                {form.formState.errors.title && (
                  <p className="mt-1 text-xs text-rose-500">{form.formState.errors.title.message}</p>
                )}
              </div>
              <div>
                <Label>Category</Label>
                <Select value={form.watch('category')} onValueChange={(v) => form.setValue('category', v as AssetCategory)}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" className="mt-1.5" placeholder="username or email" {...form.register('username')} />
              </div>
              <div>
                <Label htmlFor="url">URL</Label>
                <Input id="url" className="mt-1.5" placeholder="https://" {...form.register('url')} />
              </div>
              <div>
                <Label htmlFor="secret">Secret / Password</Label>
                <Input id="secret" type="password" className="mt-1.5" placeholder="••••••••" {...form.register('secret')} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" className="mt-1.5" rows={4} placeholder="Recovery info, references, instructions…" {...form.register('notes')} />
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Preferences" />
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3">
              <Checkbox
                checked={form.watch('favorite')}
                onCheckedChange={(v) => form.setValue('favorite', !!v)}
              />
              <Star className="h-4 w-4 text-amber-400" />
              <span className="text-sm">Mark as favorite</span>
            </label>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-500">
              <Lock className="h-4 w-4" /> Encrypted with AES-256 automatically
            </div>
          </Card>

          <Card>
            <CardHeader title="Share with nominees" description="Choose who can inherit this asset" />
            <div className="space-y-2">
              {allNominees.length === 0 && (
                <p className="text-sm text-muted-foreground">No nominees yet. Add one first to share this asset.</p>
              )}
              {allNominees.map((n: any) => {
                const checked = selectedNominees.includes(n.id);
                return (
                  <label
                    key={n.id}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 hover:bg-muted/40"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        if (v) setSelectedNominees((s) => [...s, n.id]);
                        else setSelectedNominees((s) => s.filter((id) => id !== n.id));
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{n.name}</p>
                      <p className="text-xs text-muted-foreground">{n.relation}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{n.sharePercentage}%</span>
                  </label>
                );
              })}
            </div>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1 gradient-primary text-white">
              <Save className="mr-2 h-4 w-4" /> {loading ? 'Saving…' : mode === 'add' ? 'Add asset' : 'Save changes'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href="/vault">Cancel</Link>
            </Button>
          </div>
        </div>
      </form>
    </DashboardShell>
  );
}
