'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldCheck, Clock, XCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardHeader } from '@/components/dashboard/card';
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
import { VerificationRequest } from '@/types';
import { formatDate } from '@/utils/format';

export default function AdminVerificationsPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const queryClient = useQueryClient();
  const { data: requests = [] } = useQuery<VerificationRequest[]>({
    queryKey: ['admin-verifications'],
    queryFn: adminService.verificationRequests,
  });

  const filtered = useMemo<VerificationRequest[]>(() => {
    let l: VerificationRequest[] = requests as VerificationRequest[];
    if (status !== 'all') l = l.filter((r: VerificationRequest) => r.status === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      l = l.filter((r: VerificationRequest) => (r.userName ?? '').toLowerCase().includes(q));
    }
    return l;
  }, [requests, query, status]);

  async function handleApprove(id: string) {
    try {
      await adminService.approveVerification(id);
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      toast.success('Verification approved');
    } catch { toast.error('Failed to approve'); }
  }

  async function handleReject(id: string) {
    try {
      await adminService.rejectVerification(id);
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      toast.success('Verification rejected');
    } catch { toast.error('Failed to reject'); }
  }

  return (
    <AdminShell>
      <PageHeader title="Verification Requests" description="Review and process inheritance verifications." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<ShieldCheck className="h-5 w-5" />} label="Total requests" value={requests.length} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Pending" value={requests.filter((r: VerificationRequest) => r.status === 'pending').length} accent="amber" delay={0.05} />
        <StatCard icon={<CheckCircle2 className="h-5 w-5" />} label="Verified" value={requests.filter((r: VerificationRequest) => r.status === 'verified').length} accent="emerald" delay={0.1} />
        <StatCard icon={<XCircle className="h-5 w-5" />} label="Rejected" value={requests.filter((r: VerificationRequest) => r.status === 'rejected').length} accent="rose" delay={0.15} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by user or nominee…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {filtered.map((r: VerificationRequest) => (
          <Card key={r.id}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{r.userName ?? 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">Type: {r.type}</p>
              </div>
              <Badge className={r.status === 'verified' ? 'bg-emerald-500/15 text-emerald-500' : r.status === 'rejected' ? 'bg-rose-500/15 text-rose-500' : 'bg-amber-500/15 text-amber-500'}>
                {r.status}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="capitalize">{r.type}</Badge>
              <span>Submitted {formatDate(r.submittedAt)}</span>
            </div>
            <div className="mt-4 flex gap-2 border-t border-border pt-3">
              <Button size="sm" className="gradient-primary text-white" onClick={() => handleApprove(r.id)}>Approve</Button>
              <Button size="sm" variant="outline" className="text-rose-500" onClick={() => handleReject(r.id)}>Reject</Button>
            </div>
          </Card>
        ))}
      </div>
    </AdminShell>
  );
}
