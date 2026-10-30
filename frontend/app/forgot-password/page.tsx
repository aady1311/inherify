'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';
import { AuthLayout, AuthFooterLink } from '@/components/auth/auth-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

type Values = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  async function onSubmit(values: Values) {
    setLoading(true);
    try {
      await authService.forgotPassword(values.email);
      if (typeof window !== 'undefined') {
        localStorage.setItem('otp_email', values.email);
        localStorage.setItem('otp_purpose', 'forgot');
      }
      setSent(true);
      toast.success('Recovery code sent to your email');
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Forgot password"
      description="We'll email you a secure recovery code."
    >
      {sent ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm">
          <p className="font-medium text-emerald-500">Check your inbox</p>
          <p className="mt-1 text-muted-foreground">
            We sent a recovery code to your email. Use it to reset your master
            password.
          </p>
          <Button asChild className="mt-4 w-full gradient-primary text-white">
            <Link href="/verify-otp">Enter code <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input className="pl-9" placeholder="you@example.com" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full gradient-primary text-white">
              {loading ? 'Sending…' : 'Send recovery code'}
            </Button>
          </form>
        </Form>
      )}

      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>
    </AuthLayout>
  );
}
