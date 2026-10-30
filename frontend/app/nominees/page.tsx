'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, Users, ShieldCheck, PieChart } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { NomineeCard } from '@/components/dashboard/nominee-card';
import { StatCard } from '@/components/dashboard/stat-card';
import { EmptyState } from '@/components/dashboard/states';
import { Button } from '@/components/ui/button';
import { nomineeService } from '@/services/nominee.service';
import { Nominee } from '@/types';

export default function NomineesPage() {
  const { data: list = [] } = useQuery<Nominee[]>({
    queryKey: ['nominees'],
    queryFn: nomineeService.list,
  });

  const totalShare = list.reduce((total: number, n: Nominee) => total + (n.sharePercentage ?? 0), 0);
  const verified = list.filter((n: Nominee) => n.verificationStatus === 'verified').length;

  return (
    <DashboardShell>
      <PageHeader
        title="Nominees & Beneficiaries"
        description="Trusted people designated to inherit access to your encrypted vault."
        actions={
          <Button asChild className="gradient-primary text-white shadow-glow">
            <Link href="/nominees/add"><UserPlus className="mr-2 h-4 w-4" /> Add nominee</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Nominees"
          value={list.length}
          hint="Active designated beneficiaries"
          accent="primary"
        />
        <StatCard
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Identity Verified"
          value={verified}
          hint={`${verified} of ${list.length} fully verified`}
          accent="emerald"
        />
        <StatCard
          icon={<PieChart className="h-5 w-5" />}
          label="Total Allocated Share"
          value={`${totalShare}%`}
          hint={totalShare === 100 ? '100% estate share allocated' : `${100 - totalShare}% unallocated`}
          accent="secondary"
        />
      </div>

      {list.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="No nominees yet"
            description="Add a trusted person to start sharing your digital legacy."
            action={<Button asChild className="gradient-primary text-white"><Link href="/nominees/add"><UserPlus className="mr-2 h-4 w-4" /> Add nominee</Link></Button>}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((n: Nominee, i: number) => (
            <NomineeCard key={n.id} nominee={n} index={i} />
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
