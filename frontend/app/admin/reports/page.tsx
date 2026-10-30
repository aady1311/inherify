'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, FileBarChart, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { DataTable, Column } from '@/components/dashboard/data-table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminService } from '@/services/admin.service';
import { AdminReport } from '@/types';
import { timeAgo } from '@/utils/format';

export default function AdminReportsPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const queryClient = useQueryClient();
  const { data: reports = [] } = useQuery<AdminReport[]>({
    queryKey: ['admin-reports'],
    queryFn: adminService.reports,
  });

  async function handleResolve(id: string) {
    try {
      await adminService.resolveReport(id);
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      toast.success('Report resolved');
    } catch { toast.error('Failed to resolve'); }
  }

  const filtered = useMemo<AdminReport[]>(() => {
    let l: AdminReport[] = reports as AdminReport[];
    if (status !== 'all') l = l.filter((r: AdminReport) => r.status === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      l = l.filter((r: AdminReport) => r.title.toLowerCase().includes(q) || r.type.toLowerCase().includes(q));
    }
    return l;
  }, [reports, query, status]);

  const columns: Column<AdminReport>[] = [
    { key: 'title', header: 'Report', sortValue: (r: AdminReport) => r.title, cell: (r: AdminReport) => (
      <div>
        <p className="font-medium">{r.title}</p>
        <p className="text-xs text-muted-foreground capitalize">{r.type}</p>
      </div>
    ) },
    { key: 'priority', header: 'Priority', sortValue: (r: AdminReport) => r.priority, cell: (r: AdminReport) => (
      <Badge className={r.priority === 'high' ? 'bg-rose-500/15 text-rose-500' : r.priority === 'medium' ? 'bg-amber-500/15 text-amber-500' : 'bg-muted text-muted-foreground'}>
        {r.priority}
      </Badge>
    ) },
    { key: 'assignee', header: 'Assignee', cell: (r: AdminReport) => r.assignee ?? 'Unassigned' },
    { key: 'status', header: 'Status', sortValue: (r: AdminReport) => r.status, cell: (r: AdminReport) => (
      <Badge className={r.status === 'resolved' ? 'bg-emerald-500/15 text-emerald-500' : r.status === 'reviewing' ? 'bg-amber-500/15 text-amber-500' : 'bg-muted text-muted-foreground'}>
        {r.status}
      </Badge>
    ) },
    { key: 'created', header: 'Created', sortValue: (r: AdminReport) => r.createdAt, cell: (r: AdminReport) => timeAgo(r.createdAt) },
    { key: 'actions', header: '', className: 'text-right', cell: (r: AdminReport) => (
      <div className="flex justify-end gap-1">
        <Button variant="ghost" size="sm" onClick={() => toast.success('Report opened')}>Open</Button>
        <Button variant="ghost" size="sm" className="text-emerald-500" onClick={() => handleResolve(r.id)}>Resolve</Button>
      </div>
    ) },
  ];

  return (
    <AdminShell>
      <PageHeader title="Reports" description="Security, billing, and user reports." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<FileBarChart className="h-5 w-5" />} label="Total reports" value={reports.length} />
        <StatCard icon={<AlertTriangle className="h-5 w-5" />} label="Open" value={reports.filter((r: AdminReport) => r.status === 'open').length} accent="rose" delay={0.05} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Reviewing" value={reports.filter((r: AdminReport) => r.status === 'reviewing').length} accent="amber" delay={0.1} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Resolved" value={reports.filter((r: AdminReport) => r.status === 'resolved').length} accent="emerald" delay={0.15} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search reports…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-5"><DataTable data={filtered} columns={columns} /></div>
    </AdminShell>
  );
}
