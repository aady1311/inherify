'use client';

import { motion } from 'framer-motion';
import {
  FolderLock,
  Star,
  MoreHorizontal,
  Pencil,
  Trash2,
  Share2,
  Eye,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { VaultAsset } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { vaultService } from '@/services/vault.service';
import { cn } from '@/lib/utils';
import { formatDate, timeAgo } from '@/utils/format';

const categoryConfig: Record<string, { label: string; color: string; icon: any }> = {
  passwords: { label: 'Passwords', color: 'from-indigo-500/30 to-indigo-500/5 text-indigo-400', icon: Lock },
  email: { label: 'Email', color: 'from-sky-500/30 to-sky-500/5 text-sky-400', icon: FolderLock },
  bank: { label: 'Bank', color: 'from-emerald-500/30 to-emerald-500/5 text-emerald-400', icon: FolderLock },
  crypto: { label: 'Crypto', color: 'from-amber-500/30 to-amber-500/5 text-amber-400', icon: FolderLock },
  insurance: { label: 'Insurance', color: 'from-rose-500/30 to-rose-500/5 text-rose-400', icon: FolderLock },
  property: { label: 'Property', color: 'from-cyan-500/30 to-cyan-500/5 text-cyan-400', icon: FolderLock },
  medical: { label: 'Medical', color: 'from-pink-500/30 to-pink-500/5 text-pink-400', icon: FolderLock },
  identity: { label: 'Identity', color: 'from-violet-500/30 to-violet-500/5 text-violet-400', icon: FolderLock },
  notes: { label: 'Notes', color: 'from-teal-500/30 to-teal-500/5 text-teal-400', icon: FolderLock },
  custom: { label: 'Custom', color: 'from-slate-500/30 to-slate-500/5 text-slate-400', icon: FolderLock },
};

export function AssetCard({ asset, index = 0 }: { asset: VaultAsset; index?: number }) {
  const cfg = categoryConfig[asset.category] ?? categoryConfig.custom;
  const Icon = cfg.icon;
  const queryClient = useQueryClient();

  async function handleDelete() {
    try {
      await vaultService.deleteAsset(asset.id);
      queryClient.invalidateQueries({ queryKey: ['vault-assets'] });
      toast.success('Asset deleted');
    } catch {
      toast.error('Failed to delete asset');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="glass-card group relative overflow-hidden rounded-2xl p-5"
    >
      <div className="flex items-start justify-between">
        <Link href={`/vault/${asset.id}`} className="flex items-center gap-3">
          <div className={cn('grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br', cfg.color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium leading-tight">{asset.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{cfg.label}</p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          {asset.favorite && (
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/vault/${asset.id}`}><Eye className="mr-2 h-4 w-4" /> View</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/vault/${asset.id}/edit`}><Pencil className="mr-2 h-4 w-4" /> Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/vault/${asset.id}`}><Share2 className="mr-2 h-4 w-4" /> Share</Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-rose-500" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {asset.notes && (
        <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{asset.notes}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="capitalize">{asset.status}</Badge>
        {asset.encrypted && (
          <Badge className="bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/20">
            <Lock className="mr-1 h-3 w-3" /> Encrypted
          </Badge>
        )}
        {asset.sharedWithNomineeIds.length > 0 && (
          <Badge variant="outline">Shared · {asset.sharedWithNomineeIds.length}</Badge>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <span>Updated {timeAgo(asset.updatedAt)}</span>
        <span>{formatDate(asset.createdAt)}</span>
      </div>
    </motion.div>
  );
}
