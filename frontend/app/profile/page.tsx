'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, ShieldCheck, CreditCard, Pencil } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader } from '@/components/dashboard/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { userService } from '@/services/user.service';
import { dashboardService } from '@/services/dashboard.service';
import { currentUser } from '@/data/mock';
import { initials, formatDate, timeAgo } from '@/utils/format';

export default function ProfilePage() {
  const { data: user = currentUser } = useQuery({
    queryKey: ['me'],
    queryFn: userService.me,
  });

  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: dashboardService.stats,
  });

  const { data: activityLogs = [] } = useQuery({
    queryKey: ['activity'],
    queryFn: dashboardService.activity,
  });

  return (
    <DashboardShell>
      <PageHeader
        title="Profile"
        description="Your account overview"
        actions={<Button variant="outline" asChild><Link href="/settings"><Pencil className="mr-2 h-4 w-4" /> Edit profile</Link></Button>}
      />

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card relative overflow-hidden rounded-3xl p-6">
        <div className="pointer-events-none absolute inset-0 -z-10 gradient-primary opacity-10" />
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="gradient-primary text-2xl font-semibold text-white">{initials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="bg-emerald-500/15 text-emerald-500"><ShieldCheck className="mr-1 h-3 w-3" /> {user.status}</Badge>
              <Badge variant="outline" className="capitalize"><CreditCard className="mr-1 h-3 w-3" /> {user.plan} plan</Badge>
              {user.twoFactorEnabled && <Badge className="bg-primary/15 text-primary">2FA on</Badge>}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow icon={Mail} label="Email" value={user.email} />
          <InfoRow icon={Phone} label="Phone" value={user.phone ?? '—'} />
          <InfoRow icon={Calendar} label="Joined" value={formatDate(user.joinedAt)} />
          <InfoRow icon={Calendar} label="Last login" value={user.lastLogin ? timeAgo(user.lastLogin) : '—'} />
        </div>
      </motion.div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card><CardHeader title="Assets" /><p className="text-2xl font-semibold">{stats?.totalAssets ?? 0}</p></Card>
        <Card><CardHeader title="Nominees" /><p className="text-2xl font-semibold">{stats?.totalNominees ?? 0}</p></Card>
        <Card><CardHeader title="Activities" /><p className="text-2xl font-semibold">{activityLogs.length}</p></Card>
      </div>
    </DashboardShell>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-3">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}
