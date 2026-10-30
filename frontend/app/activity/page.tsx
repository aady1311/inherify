'use client';

import { useQuery } from '@tanstack/react-query';
import {
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Share2,
  ShieldCheck,
  Download,
  Upload,
  Activity,
  Search,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardHeader } from '@/components/dashboard/card';
import { DataTable, Column } from '@/components/dashboard/data-table';
import { Timeline } from '@/components/dashboard/timeline';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { dashboardService } from '@/services/dashboard.service';
import { ActivityLog } from '@/types';
import { formatDateTime, timeAgo } from '@/utils/format';

const icons: Record<string, any> = {
  login: LogIn,
  logout: LogOut,
  create: Plus,
  update: Pencil,
  delete: Trash2,
  share: Share2,
  verify: ShieldCheck,
  download: Download,
  upload: Upload,
};

const colors: Record<string, string> = {
  login: 'text-sky-500',
  logout: 'text-muted-foreground',
  create: 'text-emerald-500',
  update: 'text-amber-500',
  delete: 'text-rose-500',
  share: 'text-violet-500',
  verify: 'text-primary',
  download: 'text-cyan-500',
  upload: 'text-teal-500',
};

export default function ActivityPage() {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'timeline' | 'table'>('timeline');
  const { data: logs = [] } = useQuery({
    queryKey: ['activity'],
    queryFn: dashboardService.activity,
  });

  const filtered = useMemo(() => {
    if (!query.trim()) return logs;
    const q = query.toLowerCase();
    return logs.filter((l: ActivityLog) =>
      l.description.toLowerCase().includes(q) ||
      l.device.toLowerCase().includes(q) ||
      l.location.toLowerCase().includes(q)
    );
  }, [logs, query]);

  const columns: Column<ActivityLog>[] = [
    {
      key: 'description',
      header: 'Activity',
      sortValue: (l) => l.description,
      cell: (l) => (
        <div className="flex items-center gap-2">
          {(() => {
            const Icon = icons[l.type] ?? Activity;
            return <Icon className={`h-4 w-4 ${colors[l.type]}`} />;
          })()}
          <span className="font-medium">{l.description}</span>
        </div>
      ),
    },
    { key: 'device', header: 'Device', sortValue: (l) => l.device, cell: (l) => <span className="text-muted-foreground">{l.device}</span> },
    { key: 'location', header: 'Location', sortValue: (l) => l.location, cell: (l) => <span className="text-muted-foreground">{l.location}</span> },
    { key: 'ip', header: 'IP', cell: (l) => <code className="text-xs text-muted-foreground">{l.ip}</code> },
    { key: 'time', header: 'When', sortValue: (l) => l.timestamp, cell: (l) => <span className="text-muted-foreground">{timeAgo(l.timestamp)}</span> },
  ];

  return (
    <DashboardShell>
      <PageHeader title="Activity Logs" description="Every action across your vault, with full audit trail." />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Total Events"
          value={logs.length}
          hint="All recorded audit events"
          accent="primary"
        />
        <StatCard
          icon={<LogIn className="h-5 w-5" />}
          label="Logins"
          value={logs.filter((l: ActivityLog) => l.type === 'login').length}
          hint="Successful authentications"
          accent="accent"
        />
        <StatCard
          icon={<Share2 className="h-5 w-5" />}
          label="Shares & Releases"
          value={logs.filter((l: ActivityLog) => l.type === 'share').length}
          hint="Nominee transfers & shares"
          accent="secondary"
        />
        <StatCard
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Unique Devices"
          value={new Set(logs.map((l: ActivityLog) => l.device)).size}
          hint="Distinct hardware sessions"
          accent="emerald"
        />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search activity…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-1 rounded-full border border-border bg-card/50 p-1">
          <button onClick={() => setView('timeline')} className={`rounded-full px-3 py-1 text-xs ${view === 'timeline' ? 'gradient-primary text-white' : 'text-muted-foreground'}`}>Timeline</button>
          <button onClick={() => setView('table')} className={`rounded-full px-3 py-1 text-xs ${view === 'table' ? 'gradient-primary text-white' : 'text-muted-foreground'}`}>Table</button>
        </div>
      </div>

      <div className="mt-5">
        {view === 'timeline' ? (
          <Card>
            <CardHeader title="Activity timeline" />
            <Timeline
              items={filtered}
              iconFor={(item) => {
                const Icon = icons[item.type] ?? Activity;
                return <Icon className={`h-4 w-4 ${colors[item.type]}`} />;
              }}
              titleFor={(item) => item.description}
              descriptionFor={(item) => `${item.device} · ${item.location}`}
              metaFor={(item) => `${formatDateTime(item.timestamp)} · ${item.ip}`}
              emptyMessage="No matching activity"
            />
          </Card>
        ) : (
          <DataTable data={filtered} columns={columns} />
        )}
      </div>
    </DashboardShell>
  );
}
