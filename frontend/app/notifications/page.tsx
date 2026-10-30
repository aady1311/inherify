'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Bell,
  Search,
  Check,
  Trash2,
  ShieldCheck,
  Users,
  FolderLock,
  CreditCard,
  Settings,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card } from '@/components/dashboard/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { notificationService } from '@/services/notification.service';
import { AppNotification, NotificationType } from '@/types';
import { timeAgo } from '@/utils/format';
import { cn } from '@/lib/utils';

const typeConfig: Record<NotificationType, { icon: any; color: string; label: string }> = {
  security: { icon: ShieldCheck, color: 'bg-rose-500/15 text-rose-500', label: 'Security' },
  nominee: { icon: Users, color: 'bg-violet-500/15 text-violet-500', label: 'Nominee' },
  asset: { icon: FolderLock, color: 'bg-primary/15 text-primary', label: 'Asset' },
  system: { icon: Settings, color: 'bg-muted text-muted-foreground', label: 'System' },
  billing: { icon: CreditCard, color: 'bg-amber-500/15 text-amber-500', label: 'Billing' },
  verification: { icon: CheckCircle2, color: 'bg-emerald-500/15 text-emerald-500', label: 'Verification' },
};

const filters: (NotificationType | 'all')[] = ['all', 'security', 'nominee', 'asset', 'billing', 'verification', 'system'];

export default function NotificationsPage() {
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');
  const [query, setQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: list = [] } = useQuery<AppNotification[]>({
    queryKey: ['notifications'],
    queryFn: notificationService.list,
    refetchInterval: 30_000,
  });

  const filtered = useMemo<AppNotification[]>(() => {
    let l: AppNotification[] = list as AppNotification[];
    if (filter !== 'all') l = l.filter((n: AppNotification) => n.type === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      l = l.filter((n: AppNotification) => n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q));
    }
    return l;
  }, [list, filter, query]);

  const unread = list.filter((n: AppNotification) => !n.read).length;

  async function handleMarkRead(id: string) {
    try {
      await notificationService.markAsRead(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch { toast.error('Failed to mark as read'); }
  }

  async function handleDelete(id: string) {
    try {
      await notificationService.delete(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Notification deleted');
    } catch { toast.error('Failed to delete'); }
  }

  async function handleMarkAllRead() {
    try {
      await notificationService.markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All marked as read');
    } catch { toast.error('Failed to mark all as read'); }
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Notifications"
        description={`${unread} unread notification${unread === 1 ? '' : 's'}`}
        actions={
          <Button variant="outline" onClick={handleMarkAllRead} disabled={unread === 0}>
            <Check className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-all',
                filter === f
                  ? 'border-transparent gradient-primary text-white'
                  : 'border-border bg-card/50 text-muted-foreground hover:text-foreground'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search notifications…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {filtered.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center py-10 text-center">
              <Bell className="h-8 w-8 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No notifications</p>
              <p className="mt-1 text-xs text-muted-foreground">You're all caught up.</p>
            </div>
          </Card>
        ) : (
          filtered.map((n: AppNotification, i: number) => {
            const cfg = typeConfig[n.type] ?? typeConfig.system;
            const Icon = cfg.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  'glass-card flex items-start gap-3 rounded-2xl p-4 transition-colors',
                  !n.read && 'ring-1 ring-primary/30'
                )}
              >
                <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-xl', cfg.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                    <Badge variant="outline" className="ml-auto">{cfg.label}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground/80">{timeAgo(n.createdAt)}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {!n.read && (
                    <Button variant="ghost" size="icon" onClick={() => handleMarkRead(n.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="text-rose-500" onClick={() => handleDelete(n.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </DashboardShell>
  );
}
