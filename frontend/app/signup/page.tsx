'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import { AuthLayout, AuthFooterLink } from '@/components/auth/auth-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { authService } from '@/services/auth.service';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';

const schema = z.object({
  name: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Min 8 characters'),
  terms: z.boolean().refine((v) => v, 'You must accept the terms'),
});

type Values = z.infer<typeof schema>;

const checklist = [
  { label: '8+ characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Number', test: (v: string) => /[0-9]/.test(v) },
];

export default function SignupPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', terms: false },
  });
  const password = form.watch('password');

  async function onSubmit(values: Values) {
    setLoading(true);
    try {
      const data = await authService.signup(values.name, values.email, values.password);
      localStorage.setItem('otp_email', values.email);
      localStorage.setItem('otp_purpose', 'signup');
      toast.success(data.resent ? 'Account exists but unverified. New OTP sent!' : 'Account created. Verify your email to continue.');
      router.push('/verify-otp');
    } catch (e: any) {
      toast.error(e.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your vault" description="Start securing your digital legacy in minutes." side="right">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9" placeholder="Aarav Mehta" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
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
          )} />
          <FormField control={form.control} name="password" render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9 pr-9" type={show ? 'text' : 'password'} placeholder="••••••••" {...field} />
                  <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <div className="mt-2 flex flex-wrap gap-2">
                {checklist.map((c) => {
                  const ok = c.test(password ?? '');
                  return (
                    <span key={c.label} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${ok ? 'bg-emerald-500/15 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                      {ok && <Check className="h-3 w-3" />}{c.label}
                    </span>
                  );
                })}
              </div>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="terms" render={({ field }) => (
            <div className="flex items-start gap-2">
              <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} className="mt-0.5" />
              <span className="text-sm text-muted-foreground">
                I agree to the{' '}
                <Link href="#" className="text-primary hover:underline">Terms</Link> and{' '}
                <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>.
              </span>
              <FormMessage />
            </div>
          )} />
          <Button type="submit" disabled={loading} className="w-full gradient-primary text-white">
            {loading ? 'Creating vault…' : (<>Create vault <ArrowRight className="ml-2 h-4 w-4" /></>)}
          </Button>
        </form>
      </Form>
      <AuthFooterLink text="Already have an account?" href="/login" label="Sign in" />
    </AuthLayout>
  );
}
