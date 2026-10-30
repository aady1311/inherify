'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
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
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Min 6 characters'),
  remember: z.boolean().optional(),
});

type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', remember: false },
  });

  async function onSubmit(values: Values) {
    setLoading(true);
    try {
      const data = await authService.login(values.email, values.password);
      toast.success(`Welcome back, ${data.user.name}`);
      router.push('/dashboard');
    } catch (e: any) {
      if (e.message?.includes('verify your email')) {
        localStorage.setItem('otp_email', values.email);
        localStorage.setItem('otp_purpose', 'signup');
        toast.error('Please verify your email first.');
        router.push('/verify-otp');
      } else if (e.message?.includes('admin sign in')) {
        toast.error('This account is an admin. Please use the Admin sign in page.');
        router.push('/admin/login');
      } else {
        toast.error(e.message || 'Invalid credentials');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" description="Sign in to access your encrypted vault.">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <FormLabel>Password</FormLabel>
                <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">Forgot?</Link>
              </div>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="pl-9 pr-9" type={show ? 'text' : 'password'} placeholder="••••••••" {...field} />
                  <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="remember" render={({ field }) => (
            <div className="flex items-center gap-2">
              <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
              <span className="text-sm text-muted-foreground">Keep me signed in</span>
            </div>
          )} />
          <Button type="submit" disabled={loading} className="w-full gradient-primary text-white">
            {loading ? 'Signing in…' : (<>Sign in <ArrowRight className="ml-2 h-4 w-4" /></>)}
          </Button>
        </form>
      </Form>
      <AuthFooterLink text="Don't have an account?" href="/signup" label="Create one" />
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Are you an admin?{' '}
        <Link href="/admin/login" className="font-medium text-primary hover:underline">Admin sign in</Link>
      </p>
    </AuthLayout>
  );
}
