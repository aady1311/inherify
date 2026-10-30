'use client';

import { useQuery } from '@tanstack/react-query';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardHeader } from '@/components/dashboard/card';
import { adminService } from '@/services/admin.service';

const tooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: 12,
  color: 'hsl(var(--popover-foreground))',
  fontSize: 12,
  padding: '8px 12px',
};

export default function AdminAnalyticsPage() {
  const { data: a } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: adminService.analytics,
  });

  if (!a) return <AdminShell><div className="p-8 text-center text-muted-foreground">Loading…</div></AdminShell>;

  const conversionData = a.userGrowth.map((g: { month: string; users: number; paying: number }) => ({
    month: g.month,
    rate: g.users > 0 ? +((g.paying / g.users) * 100).toFixed(1) : 0,
  }));

  return (
    <AdminShell>
      <PageHeader title="Analytics" description="Platform performance and growth metrics." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total users" value={a.totalUsers.toLocaleString()} trend={{ value: '+8.4%', positive: true }} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Conversion rate" value={`${a.conversionRate}%`} accent="accent" delay={0.05} />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="MRR" value={`$${a.revenue.toLocaleString()}`} accent="emerald" trend={{ value: '+12%', positive: true }} delay={0.1} />
        <StatCard icon={<Activity className="h-5 w-5" />} label="Pending verifications" value={a.pendingVerifications} accent="amber" delay={0.15} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="User growth" description="Total users vs paying users" />
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={a.userGrowth} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="x1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="x2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--chart-3))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="users" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#x1)" />
              <Area type="monotone" dataKey="paying" stroke="hsl(var(--chart-3))" strokeWidth={2} fill="url(#x2)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Plan distribution" />
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={a.planDistribution} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={3} stroke="none">
                {a.planDistribution.map((d: { name: string; value: number; color: string }) => <Cell key={d.name} fill={d.color} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 flex justify-center gap-4 text-xs">
            {a.planDistribution.map((d: { name: string; value: number; color: string }) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Conversion rate" description="Paying / total users" />
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={conversionData} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="rate" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Paying users by month" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={a.userGrowth} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar dataKey="paying" radius={[6, 6, 0, 0]} fill="hsl(var(--chart-1))" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </AdminShell>
  );
}
