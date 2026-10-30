'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  FolderLock,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  UserCheck,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardHeader } from '@/components/dashboard/card';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { adminService } from '@/services/admin.service';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, Column } from '@/components/dashboard/data-table';
import { formatDate, timeAgo } from '@/utils/format';
import { VerificationRequest } from '@/types';

const tooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 12,
  color: 'hsl(var(--popover-foreground))',
  fontSize: 12,
  padding: '8px 12px',
};

export default function AdminDashboardPage() {
  const { data: analytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: adminService.analytics,
  });
  const { data: verifications = [] } = useQuery({
    queryKey: ['admin-verifications'],
    queryFn: adminService.verificationRequests,
  });
  const { data: reports = [] } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: adminService.reports,
  });

  if (!analytics) return <AdminShell><div className="p-8 text-center text-muted-foreground">Loading…</div></AdminShell>;

  return (
    <AdminShell>
      <PageHeader
        title="Admin Dashboard"
        description="Platform overview and operations."
        actions={<Button variant="outline" asChild><Link href="/admin/reports">View reports</Link></Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total users" value={analytics.totalUsers.toLocaleString()} trend={{ value: '+8.4%', positive: true }} />
        <StatCard icon={<UserCheck className="h-5 w-5" />} label="Active users" value={analytics.activeUsers.toLocaleString()} accent="accent" delay={0.05} />
        <StatCard icon={<FolderLock className="h-5 w-5" />} label="Total assets" value={analytics.totalAssets.toLocaleString()} accent="secondary" delay={0.1} />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="MRR" value={`$${analytics.revenue.toLocaleString()}`} accent="emerald" trend={{ value: '+12%', positive: true }} delay={0.15} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="User growth" description="Total users vs paying users" />
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={analytics.userGrowth} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="users" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#ag1)" />
              <Area type="monotone" dataKey="paying" stroke="hsl(var(--chart-3))" strokeWidth={2} fill="url(#ag2)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Plan distribution" />
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={analytics.planDistribution} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3} stroke="none">
                {analytics.planDistribution.map((d: { name: string; value: number; color: string }, i: number) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-4 text-xs">
            {analytics.planDistribution.map((d: { name: string; value: number; color: string }) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Pending verifications" description={`${verifications.filter((v: any) => v.status === 'pending' || v.status === 'reviewing').length} awaiting review`} action={<Button size="sm" variant="outline" asChild><Link href="/admin/verifications">Review all</Link></Button>} />
          <div className="space-y-2">
            {verifications.slice(0, 4).map((v: any) => (
              <div key={v.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{v.user_name ?? 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground capitalize">{v.type?.replace('-', ' ')}</p>
                </div>
                <Badge className={v.status === 'verified' ? 'bg-emerald-500/15 text-emerald-500' : v.status === 'rejected' ? 'bg-rose-500/15 text-rose-500' : 'bg-amber-500/15 text-amber-500'}>
                  {v.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent reports" action={<Button size="sm" variant="outline" asChild><Link href="/admin/reports">View all</Link></Button>} />
          <div className="space-y-2">
            {reports.slice(0, 4).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{r.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{r.type} · {timeAgo(r.createdAt)}</p>
                </div>
                <Badge className={r.status === 'resolved' ? 'bg-emerald-500/15 text-emerald-500' : r.status === 'reviewing' ? 'bg-amber-500/15 text-amber-500' : 'bg-muted text-muted-foreground'}>
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
