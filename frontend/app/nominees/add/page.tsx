'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Mail, Phone, User, Heart } from 'lucide-react';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader } from '@/components/dashboard/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { nomineeService } from '@/services/nominee.service';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(6, 'Enter a valid phone'),
  relation: z.string().min(2, 'Relation is required'),
  sharePercentage: z.number().min(0).max(100),
});

type Values = z.infer<typeof schema>;

const relations = ['Spouse', 'Son', 'Daughter', 'Father', 'Mother', 'Brother', 'Sister', 'Legal Counsel', 'Friend', 'Other'];

export default function AddNomineePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const { data: existing = [] } = useQuery({
    queryKey: ['nominees'],
    queryFn: nomineeService.list,
  });

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', relation: 'Spouse', sharePercentage: 0 },
  });

  const totalAllocated = existing.reduce((a: any, n: any) => a + (n.sharePercentage ?? 0), 0);
  const remaining = Math.max(0, 100 - totalAllocated);

  async function onSubmit(values: Values) {
    setLoading(true);
    try {
      await nomineeService.create(values);
      queryClient.invalidateQueries({ queryKey: ['nominees'] });
      toast.success('Nominee added. Verification email sent.');
      router.push('/nominees');
    } catch (e: any) {
      toast.error(e.message || 'Failed to add nominee');
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell>
      <PageHeader
        title="Add nominee"
        description="Add a trusted person who can inherit access to your vault."
        actions={
          <Button variant="outline" asChild>
            <Link href="/nominees"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
          </Button>
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Nominee details" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Full name</Label>
                <div className="relative mt-1.5">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder="e.g. Priya Mehta" {...form.register('name')} />
                </div>
                {form.formState.errors.name && <p className="mt-1 text-xs text-rose-500">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label>Email</Label>
                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder="you@example.com" {...form.register('email')} />
                </div>
                {form.formState.errors.email && <p className="mt-1 text-xs text-rose-500">{form.formState.errors.email.message}</p>}
              </div>
              <div>
                <Label>Phone</Label>
                <div className="relative mt-1.5">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder="+1 415 555 0100" {...form.register('phone')} />
                </div>
                {form.formState.errors.phone && <p className="mt-1 text-xs text-rose-500">{form.formState.errors.phone.message}</p>}
              </div>
              <div>
                <Label>Relation</Label>
                <Select defaultValue="Spouse" onValueChange={(v) => form.setValue('relation', v)}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {relations.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Share percentage</Label>
                <Input
                  type="number"
                  min={0}
                  max={remaining}
                  className="mt-1.5"
                  {...form.register('sharePercentage', { valueAsNumber: true })}
                />
                <p className="mt-1 text-xs text-muted-foreground">{remaining}% available to allocate</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Current allocation" />
            {existing.length === 0 ? (
              <p className="text-sm text-muted-foreground">No nominees yet.</p>
            ) : (
              <div className="space-y-2">
                {existing.map((n: any) => (
                  <div key={n.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{n.name}</span>
                    <span className="font-medium">{n.sharePercentage}%</span>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
                  <span className="text-muted-foreground">Allocated</span>
                  <span className="font-semibold">{totalAllocated}%</span>
                </div>
              </div>
            )}
          </Card>

          <div className="flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs text-primary">
            <Heart className="h-4 w-4" /> Nominee will receive a verification email
          </div>

          <Button type="submit" disabled={loading} className="w-full gradient-primary text-white">
            <Save className="mr-2 h-4 w-4" /> {loading ? 'Saving…' : 'Add nominee'}
          </Button>
        </div>
      </form>
    </DashboardShell>
  );
}
