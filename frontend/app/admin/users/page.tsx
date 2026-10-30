'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, Users, UserCheck, UserX, Clock, ShieldCheck, ShieldOff } from 'lucide-react';
import { toast } from 'sonner';
import { AdminShell } from '@/components/layout/admin-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader } from '@/components/dashboard/card';
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
import { User } from '@/types';
import { formatDate, timeAgo, initials } from '@/utils/format';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function AdminUsersPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<string>('all');
  const queryClient = useQueryClient();
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: adminService.users,
  });

  async function handleStatus(id: string, status: string) {
    try {
      await adminService.updateUserStatus(id, status);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(`User ${status}`);
    } catch { toast.error('Failed to update status'); }
  }

  async function handleRole(id: string, role: string) {
    try {
      await adminService.updateUserRole(id, role);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(role === 'admin' ? 'User promoted to admin' : 'Admin role removed');
    } catch { toast.error('Failed to update role'); }
  }

  const filtered = useMemo<User[]>(() => {
    let l: User[] = users as User[];
    if (status !== 'all') l = l.filter((u: User) => u.status === status);
    if (query.trim()) {
      const q = query.toLowerCase();
      l = l.filter((u: User) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return l;
  }, [users, query, status]);

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      sortValue: (u: User) => u.name,
      cell: (u: User) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9"><AvatarFallback className="gradient-primary text-xs font-semibold text-white">{initials(u.name)}</AvatarFallback></Avatar>
          <div>
            <p className="font-medium">{u.name}</p>
            <p className="text-xs text-muted-foreground">{u.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'plan', header: 'Plan', sortValue: (u: User) => u.plan, cell: (u: User) => <Badge variant="outline" className="capitalize">{u.plan}</Badge> },
    { key: 'status', header: 'Status', sortValue: (u: User) => u.status, cell: (u: User) => (
      <Badge className={u.status === 'active' ? 'bg-emerald-500/15 text-emerald-500' : u.status === 'pending' ? 'bg-amber-500/15 text-amber-500' : 'bg-rose-500/15 text-rose-500'}>
        {u.status}
      </Badge>
    ) },
    { key: '2fa', header: '2FA', cell: (u: User) => u.twoFactorEnabled ? <Badge className="bg-primary/15 text-primary">On</Badge> : <Badge variant="secondary">Off</Badge> },
    { key: 'joined', header: 'Joined', sortValue: (u: User) => u.joinedAt, cell: (u: User) => formatDate(u.joinedAt) },
    { key: 'lastLogin', header: 'Last login', sortValue: (u: User) => u.lastLogin ?? '', cell: (u: User) => u.lastLogin ? timeAgo(u.lastLogin) : '—' },
    {
      key: 'role',
      header: 'Role',
      cell: (u: User) => (
        <Badge className={u.role === 'admin' ? 'bg-violet-500/15 text-violet-500' : 'bg-muted text-muted-foreground'}>
          {u.role ?? 'user'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      className: 'text-right',
      cell: (u: User) => (
        <div className="flex justify-end gap-1">
          {u.role === 'admin' ? (
            <Button variant="ghost" size="sm" className="text-violet-500" onClick={() => handleRole(u.id, 'user')}>
              <ShieldOff className="mr-1 h-3 w-3" /> Remove Admin
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="text-violet-500" onClick={() => handleRole(u.id, 'admin')}>
              <ShieldCheck className="mr-1 h-3 w-3" /> Make Admin
            </Button>
          )}
          {u.status === 'suspended' ? (
            <Button variant="ghost" size="sm" className="text-emerald-500" onClick={() => handleStatus(u.id, 'active')}>Activate</Button>
          ) : (
            <Button variant="ghost" size="sm" className="text-rose-500" onClick={() => handleStatus(u.id, 'suspended')}>Suspend</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <AdminShell>
      <PageHeader title="Users" description="All registered users on the platform." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5" />} label="Total users" value={users.length} />
        <StatCard icon={<UserCheck className="h-5 w-5" />} label="Active" value={users.filter((u: User) => u.status === 'active').length} accent="emerald" delay={0.05} />
        <StatCard icon={<Clock className="h-5 w-5" />} label="Pending" value={users.filter((u: User) => u.status === 'pending').length} accent="amber" delay={0.1} />
        <StatCard icon={<UserX className="h-5 w-5" />} label="Suspended" value={users.filter((u: User) => u.status === 'suspended').length} accent="rose" delay={0.15} />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search users…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-5">
        <DataTable data={filtered} columns={columns} />
      </div>
    </AdminShell>
  );
}
