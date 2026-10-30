'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  FolderLock,
  FileText,
  Users,
  ShieldCheck,
  LogIn,
  Clock,
  HardDrive,
  CreditCard,
  Plus,
  UserPlus,
  ScrollText,
  Upload,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardHeader } from '@/components/dashboard/card';
import {
  ActivityAreaChart,
  CategoryBarChart,
  CategoryPieChart,
  SecurityRadarChart,
} from '@/components/dashboard/charts';
import { Timeline } from '@/components/dashboard/timeline';
import { Button } from '@/components/ui/button';
import { dashboardService } from '@/services/dashboard.service';
import { timeAgo, formatDateTime, formatBytes } from '@/utils/format';
import { useMemo } from 'react';

const activityIcons: Record<string, any> = {
  login: LogIn, logout: LogIn, create: Plus, update: Activity,
  delete: Activity, share: Users, verify: ShieldCheck, download: FileText, upload: Upload,
};

const quickActions = [
  { label: 'Add asset', href: '/vault/add', icon: Plus, accent: 'from-primary/20 to-primary/5 text-primary' },
  { label: 'Add nominee', href: '/nominees/add', icon: UserPlus, accent: 'from-secondary/20 to-secondary/5 text-secondary' },
  { label: 'Upload document', href: '/documents/upload', icon: Upload, accent: 'from-accent/20 to-accent/5 text-accent' },
  { label: 'Edit will', href: '/digital-will', icon: ScrollText, accent: 'from-emerald-500/20 to-emerald-500/5 text-emerald-500' },
];

export default function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: dashboardService.stats,
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: dashboardService.activity,
  });

  // Build activity chart data from real logs
  const activityChartData = useMemo(() => {
    const months: Record<string, { date: string; logins: number; actions: number; shares: number }> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString('en', { month: 'short' });
      months[key] = { date: key, logins: 0, actions: 0, shares: 0 };
    }
    activityLogs.forEach((log: any) => {
      const key = new Date(log.timestamp).toLocaleString('en', { month: 'short' });
      if (!months[key]) return;
      if (log.type === 'login') months[key].logins++;
      else if (log.type === 'share') months[key].shares++;
      else months[key].actions++;
    });
    return Object.values(months);
  }, [activityLogs]);

  // Security radar from real stats
  const securityData = useMemo(() => {
    if (!stats) return [];
    return [
      { metric: '2FA', value: stats.twoFactorEnabled ? 100 : 0, full: 100 },
      { metric: 'Encryption', value: 95, full: 100 },
      { metric: 'Backup', value: stats.totalDocuments > 0 ? 80 : 20, full: 100 },
      { metric: 'Recovery', value: stats.totalNominees > 0 ? 88 : 30, full: 100 },
      { metric: 'Nominees', value: stats.totalNominees > 0 ? 90 : 0, full: 100 },
    ];
  }, [stats]);

  if (!stats) return (
    <DashboardShell>
      <div className="p-8 text-center text-muted-foreground">Loading…</div>
    </DashboardShell>
  );

  const storagePct = Math.round((stats.storageUsed / stats.storageTotal) * 100);
  const storageByPlan: Record<string, string> = { free: '1 GB', pro: '5 GB', legacy: '50 GB' };

  return (
    <DashboardShell>
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's your vault at a glance."
        actions={
          <Button asChild className="gradient-primary text-white">
            <Link href="/vault/add"><Plus className="mr-2 h-4 w-4" /> Add asset</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<FolderLock className="h-5 w-5" />} label="Total assets" value={stats.totalAssets} delay={0} />
        <StatCard icon={<FileText className="h-5 w-5" />} label="Total documents" value={stats.totalDocuments} accent="secondary" delay={0.05} />
        <StatCard icon={<Users className="h-5 w-5" />} label="Total nominees" value={stats.totalNominees} accent="accent" delay={0.1} />
        <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="Security score" value={stats.securityScore} accent="emerald" delay={0.15} />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((q, i) => (
          <motion.div key={q.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.05 }}>
            <Link href={q.href} className="glass-card group flex items-center gap-3 rounded-2xl p-4 transition-all hover:-translate-y-1 hover:shadow-glow">
              <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${q.accent}`}>
                <q.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium">{q.label}</span>
              <ArrowUpRight className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Activity overview" description="Logins, actions, and shares over the last 7 months" />
          <ActivityAreaChart data={activityChartData} />
        </Card>
        <Card>
          <CardHeader title="Security score breakdown" />
          <SecurityRadarChart data={securityData} />
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Assets by category" />
          <CategoryBarChart data={stats.categoryData?.length ? stats.categoryData : []} />
        </Card>
        <Card>
          <CardHeader title="Category distribution" />
          <CategoryPieChart data={stats.categoryData?.length ? stats.categoryData : []} />
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Last login" />
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                <LogIn className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{stats.lastLogin ? formatDateTime(stats.lastLogin) : '—'}</p>
                <p className="text-xs text-muted-foreground">
                  {[stats.lastLoginLocation, stats.lastLoginDevice].filter(Boolean).join(' · ') || 'Unknown device'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Storage used" description={`${formatBytes(stats.storageUsed)} of ${formatBytes(stats.storageTotal)}`} />
            <div className="flex items-end gap-2">
              <span className="text-2xl font-semibold">{storagePct}%</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-muted">
              <div className="h-full rounded-full gradient-primary" style={{ width: `${storagePct}%` }} />
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <HardDrive className="h-3.5 w-3.5" />
              {stats.subscriptionPlan} plan · {storageByPlan[stats.subscriptionPlan] ?? '5 GB'} encrypted storage
            </div>
          </Card>

          <Card>
            <CardHeader title="Subscription" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium capitalize">{stats.subscriptionPlan} plan</p>
                  <p className="text-xs text-emerald-500">
                    Active{stats.subscriptionRenewsAt ? ` · renews ${stats.subscriptionRenewsAt}` : ''}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/subscription">Manage</Link>
              </Button>
            </div>
          </Card>

          {stats.pendingVerifications > 0 && (
            <Card>
              <CardHeader title="Pending verification" description={`${stats.pendingVerifications} nominee pending`} />
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/15 text-amber-500">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">{stats.pendingNomineeName || 'Nominee'}</p>
                  <p className="text-xs text-muted-foreground">Identity verification</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
                <Link href="/nominees">Review</Link>
              </Button>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader
            title="Recent activity"
            description="Your latest actions across the vault"
            action={<Button variant="outline" size="sm" asChild><Link href="/activity">View all</Link></Button>}
          />
          {activityLogs.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <Timeline
              items={activityLogs.slice(0, 6)}
              iconFor={(item: any) => { const Icon = activityIcons[item.type] ?? Activity; return <Icon className="h-4 w-4" />; }}
              titleFor={(item: any) => item.description}
              descriptionFor={(item: any) => `${item.device} · ${item.location}`}
              metaFor={(item: any) => `${timeAgo(item.timestamp)} · ${item.ip}`}
            />
          )}
        </Card>
      </div>
    </DashboardShell>
  );
}
