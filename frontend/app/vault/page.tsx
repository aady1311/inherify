'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  Star,
  LayoutGrid,
  List,
  FolderLock,
  Lock,
  Mail,
  CreditCard,
  Wallet,
  ShieldCheck,
  Home,
  HeartPulse,
  IdCard,
  StickyNote,
  Boxes,
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { AssetCard } from '@/components/dashboard/asset-card';
import { EmptyState } from '@/components/dashboard/states';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { vaultService } from '@/services/vault.service';
import { AssetCategory, VaultAsset } from '@/types';
import { cn } from '@/lib/utils';

const categories: { key: AssetCategory | 'all' | 'favorites'; label: string; icon: any }[] = [
  { key: 'all', label: 'All', icon: Boxes },
  { key: 'favorites', label: 'Favorites', icon: Star },
  { key: 'passwords', label: 'Passwords', icon: Lock },
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'bank', label: 'Bank', icon: CreditCard },
  { key: 'crypto', label: 'Crypto', icon: Wallet },
  { key: 'insurance', label: 'Insurance', icon: ShieldCheck },
  { key: 'property', label: 'Property', icon: Home },
  { key: 'medical', label: 'Medical', icon: HeartPulse },
  { key: 'identity', label: 'Identity', icon: IdCard },
  { key: 'notes', label: 'Notes', icon: StickyNote },
  { key: 'custom', label: 'Custom', icon: FolderLock },
];

export default function VaultPage() {
  const [active, setActive] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const { data: assets = [] } = useQuery<VaultAsset[]>({
    queryKey: ['vault-assets'],
    queryFn: () => vaultService.listAssets(),
  });

  const filtered = useMemo<VaultAsset[]>(() => {
    let list: VaultAsset[] = assets as VaultAsset[];
    if (active === 'favorites') list = list.filter((a: VaultAsset) => a.favorite);
    else if (active !== 'all') list = list.filter((a: VaultAsset) => a.category === active);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (a: VaultAsset) =>
          a.title.toLowerCase().includes(q) ||
          a.username?.toLowerCase().includes(q) ||
          a.notes?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [assets, active, query]);

  return (
    <DashboardShell>
      <PageHeader
        title="Vault"
        description="All your encrypted assets in one place."
        actions={
          <Button asChild className="gradient-primary text-white">
            <Link href="/vault/add"><Plus className="mr-2 h-4 w-4" /> Add asset</Link>
          </Button>
        }
      />

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => {
          const Icon = c.icon;
          const isActive = active === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setActive(c.key)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
                isActive
                  ? 'border-transparent gradient-primary text-white shadow-glow'
                  : 'border-border bg-card/50 text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" /> {c.label}
            </button>
          );
        })}
      </div>

      {/* Search + view toggle */}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search assets, usernames, notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-card/50 p-1">
          <button
            onClick={() => setView('grid')}
            className={cn('grid h-8 w-8 place-items-center rounded-full', view === 'grid' ? 'gradient-primary text-white' : 'text-muted-foreground')}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={cn('grid h-8 w-8 place-items-center rounded-full', view === 'list' ? 'gradient-primary text-white' : 'text-muted-foreground')}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="mt-5">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FolderLock className="h-6 w-6" />}
            title="No assets found"
            description="Try adjusting your filters or add a new asset to your vault."
            action={<Button asChild className="gradient-primary text-white"><Link href="/vault/add"><Plus className="mr-2 h-4 w-4" /> Add asset</Link></Button>}
          />
        ) : view === 'grid' ? (
          <motion.div layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a: VaultAsset, i: number) => (
              <AssetCard key={a.id} asset={a} index={i} />
            ))}
          </motion.div>
        ) : (
          <div className="space-y-2">
            {filtered.map((a: VaultAsset, i: number) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.02 }}
                className="glass-card flex items-center gap-3 rounded-xl p-3"
              >
                <Link href={`/vault/${a.id}`} className="flex flex-1 items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                    <FolderLock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{a.title}</p>
                    <p className="truncate text-xs text-muted-foreground capitalize">{a.category}</p>
                  </div>
                </Link>
                {a.favorite && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                <Badge variant="secondary" className="capitalize">{a.status}</Badge>
                <Badge className="bg-emerald-500/15 text-emerald-500"><Lock className="mr-1 h-3 w-3" /> Encrypted</Badge>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
