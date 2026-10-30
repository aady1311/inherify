'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CreditCard, Download, Sparkles, Zap, Crown, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardHeader } from '@/components/dashboard/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { dashboardService } from '@/services/dashboard.service';
import { userService } from '@/services/user.service';
import { pricingPlans } from '@/data/mock';
import { formatBytes } from '@/utils/format';
import { cn } from '@/lib/utils';

const planIcons: Record<string, any> = { free: Sparkles, pro: Zap, legacy: Crown };

type Stage = 'confirm' | 'processing' | 'success';

function PaymentModal({
  open,
  onOpenChange,
  title,
  amountLabel,
  confirmLabel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  amountLabel: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
}) {
  const [stage, setStage] = useState<Stage>('confirm');

  function handleClose(v: boolean) {
    if (!v) setStage('confirm');
    onOpenChange(v);
  }

  async function handlePay() {
    setStage('processing');
    try {
      await new Promise((r) => setTimeout(r, 1100));
      await onConfirm();
      setStage('success');
      setTimeout(() => handleClose(false), 1100);
    } catch {
      toast.error('Payment failed. Please try again.');
      setStage('confirm');
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <AnimatePresence mode="wait">
          {stage === 'confirm' && (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>Secure checkout, powered by RezoPay.</DialogDescription>
              </DialogHeader>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-border p-4">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="text-lg font-semibold">{amountLabel}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-border p-3 text-xs text-muted-foreground">
                <CreditCard className="h-4 w-4" /> Visa •••• 4242
              </div>
              <Button onClick={handlePay} className="mt-4 w-full gradient-primary text-white">
                {confirmLabel}
              </Button>
            </motion.div>
          )}
          {stage === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="mt-4 text-sm font-medium">Processing payment…</p>
              <p className="mt-1 text-xs text-muted-foreground">Do not close this window.</p>
            </motion.div>
          )}
          {stage === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <CheckCircle2 className="h-14 w-14 text-emerald-500" />
              </motion.div>
              <p className="mt-4 text-sm font-medium">Payment successful</p>
              <p className="mt-1 text-xs text-muted-foreground">Your account has been updated.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export default function SubscriptionPage() {
  const queryClient = useQueryClient();
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: dashboardService.stats,
  });

  const [payTarget, setPayTarget] = useState<{ id: string; name: string; price: number } | null>(null);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  if (!stats) {
    return (
      <DashboardShell>
        <PageHeader title="Subscription" description="Manage your plan, billing, and storage." />
        <div className="py-10 text-center text-sm text-muted-foreground">Loading…</div>
      </DashboardShell>
    );
  }

  const currentPlan = stats.subscriptionPlan;
  const storagePct = Math.round((stats.storageUsed / stats.storageTotal) * 100);

  async function switchPlan(planId: string) {
    await userService.updateSubscription(planId as 'free' | 'pro' | 'legacy');
    queryClient.invalidateQueries({ queryKey: ['stats'] });
    toast.success(`Switched to ${planId} plan`);
  }

  async function cancelPlan() {
    try {
      await userService.updateSubscription('free');
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Subscription cancelled — moved to the free plan');
    } catch {
      toast.error('Failed to cancel plan');
    }
  }

  return (
    <DashboardShell>
      <PageHeader title="Subscription" description="Manage your plan, billing, and storage." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Current plan" description="Your subscription details" />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-white shadow-glow">
                {(() => {
                  const Icon = planIcons[currentPlan] ?? Sparkles;
                  return <Icon className="h-6 w-6" />;
                })()}
              </div>
              <div>
                <p className="text-lg font-semibold capitalize">{currentPlan} plan</p>
                <p className="text-sm text-muted-foreground">
                  {currentPlan === 'free' ? 'Free forever' : currentPlan === 'pro' ? '$19 / month' : '$49 / month'}
                </p>
                <Badge className="mt-1 bg-emerald-500/15 text-emerald-500 capitalize">
                  {stats.subscriptionStatus}
                  {stats.subscriptionRenewsAt ? ` · renews ${stats.subscriptionRenewsAt}` : ''}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => toast.success('Invoice downloaded')}><Download className="mr-2 h-4 w-4" /> Invoice</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" disabled={currentPlan === 'free'}>Cancel plan</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You'll be moved to the free plan immediately. You can re-subscribe anytime.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep plan</AlertDialogCancel>
                    <AlertDialogAction className="bg-rose-500 hover:bg-rose-600" onClick={cancelPlan}>
                      Yes, cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Assets</p>
              <p className="mt-1 text-xl font-semibold">{stats.totalAssets}</p>
              <p className="text-xs text-muted-foreground">Unlimited</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Nominees</p>
              <p className="mt-1 text-xl font-semibold">{stats.totalNominees}</p>
              <p className="text-xs text-muted-foreground">5 max</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs text-muted-foreground">Storage</p>
              <p className="mt-1 text-xl font-semibold">{formatBytes(stats.storageUsed)}</p>
              <p className="text-xs text-muted-foreground">of {formatBytes(stats.storageTotal)}</p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                <div className="h-full rounded-full gradient-primary" style={{ width: `${storagePct}%` }} />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Payment method" />
          <div className="flex items-center gap-3 rounded-xl border border-border p-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Visa •••• 4242</p>
              <p className="text-xs text-muted-foreground">Expires 09/27</p>
            </div>
          </div>
          <Button variant="outline" className="mt-3 w-full" onClick={() => setUpdatingPayment(true)}>Update payment</Button>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="mb-4 text-lg font-semibold">Available plans</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {pricingPlans.map((plan, i) => {
            const Icon = planIcons[plan.id] ?? Sparkles;
            const isCurrent = plan.id === currentPlan;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn('glass-card relative flex flex-col rounded-2xl p-6', plan.highlighted && 'shadow-glow ring-1 ring-primary/40')}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-3 py-1 text-xs font-medium text-white">
                    Most popular
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                </div>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-3xl font-semibold">${plan.price}</span>
                  <span className="mb-1 text-sm text-muted-foreground">/{plan.period}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 text-emerald-500" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={isCurrent ? 'outline' : plan.highlighted ? 'default' : 'outline'}
                  disabled={isCurrent}
                  onClick={() => (plan.price === 0 ? switchPlan(plan.id) : setPayTarget(plan))}
                  className={cn('mt-6 w-full', plan.highlighted && !isCurrent ? 'gradient-primary text-white' : '')}
                >
                  {isCurrent ? 'Current plan' : `Switch to ${plan.name}`}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <PaymentModal
        open={!!payTarget}
        onOpenChange={(v) => !v && setPayTarget(null)}
        title={`Upgrade to ${payTarget?.name ?? ''}`}
        amountLabel={`$${payTarget?.price ?? 0}.00`}
        confirmLabel={`Pay $${payTarget?.price ?? 0}.00`}
        onConfirm={async () => {
          if (payTarget) await switchPlan(payTarget.id);
        }}
      />

      <PaymentModal
        open={updatingPayment}
        onOpenChange={setUpdatingPayment}
        title="Update payment method"
        amountLabel="$0.00 (verification)"
        confirmLabel="Save card"
        onConfirm={async () => {
          toast.success('Payment method updated');
        }}
      />
    </DashboardShell>
  );
}
