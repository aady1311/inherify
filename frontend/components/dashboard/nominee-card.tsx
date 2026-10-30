'use client';

import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MoreHorizontal,
  Pencil,
  Trash2,
  Send,
  ShieldCheck,
  Clock,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Nominee } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { nomineeService } from '@/services/nominee.service';
import { initials, timeAgo } from '@/utils/format';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; cls: string; icon: any }> = {
  verified: { label: 'Verified', cls: 'bg-emerald-500/15 text-emerald-500', icon: ShieldCheck },
  pending: { label: 'Pending', cls: 'bg-amber-500/15 text-amber-500', icon: Clock },
  rejected: { label: 'Rejected', cls: 'bg-rose-500/15 text-rose-500', icon: XCircle },
  expired: { label: 'Expired', cls: 'bg-muted text-muted-foreground', icon: Clock },
};

export function NomineeCard({ nominee, index = 0 }: { nominee: any; index?: number }) {
  const s = statusConfig[nominee.verificationStatus] ?? statusConfig.pending;
  const queryClient = useQueryClient();

  async function handleNotify() {
    try {
      await nomineeService.requestVerification(nominee.id);
      queryClient.invalidateQueries({ queryKey: ['nominees'] });
      toast.success('Verification email resent');
    } catch {
      toast.error('Failed to send verification email');
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl p-5"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-full gradient-primary text-sm font-semibold text-white">
            {initials(nominee.name)}
          </div>
          <div>
            <p className="font-medium leading-tight">{nominee.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{nominee.relation}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={`/nominees/${nominee.id}`}><Pencil className="mr-2 h-4 w-4" /> Edit</a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleNotify}><Send className="mr-2 h-4 w-4" /> Notify</DropdownMenuItem>
            <DropdownMenuItem className="text-rose-500"><Trash2 className="mr-2 h-4 w-4" /> Remove</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="h-3.5 w-3.5" /> {nominee.email}
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="h-3.5 w-3.5" /> {nominee.phone}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Badge className={cn('gap-1', s.cls)}>
          <s.icon className="h-3 w-3" /> {s.label}
        </Badge>
        <span className="text-xs text-muted-foreground">
          Added {timeAgo(nominee.addedAt ?? nominee.added_at)}
        </span>
      </div>

      <div className="mt-4 border-t border-border pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Share</span>
          <span className="font-semibold">{nominee.sharePercentage}%</span>
        </div>
        <div className="mt-1.5 h-2 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full gradient-primary"
            style={{ width: `${nominee.sharePercentage}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {nominee.assetsShared} assets shared
        </p>
      </div>
    </motion.div>
  );
}
