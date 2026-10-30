'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { authService } from '@/services/auth.service';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

export default function VerifyOtpPage() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [email, setEmail] = useState('');
  const [purpose, setPurpose] = useState<'signup' | 'forgot'>('signup');

  useEffect(() => {
    const e = localStorage.getItem('otp_email') || '';
    const p = localStorage.getItem('otp_purpose') || 'signup';
    setEmail(e);
    setPurpose(p as 'signup' | 'forgot');
  }, []);

  async function onSubmit() {
    if (value.length !== 6) { toast.error('Enter the 6-digit code'); return; }
    setLoading(true);
    try {
      if (purpose === 'signup') {
        await authService.verifyEmail(email, value);
        toast.success('Email verified! Welcome to InHerify.');
        localStorage.removeItem('otp_purpose');
        router.push('/dashboard');
      } else {
        await authService.verifyOtp(email, value);
        toast.success('OTP verified. Set your new password.');
        localStorage.removeItem('otp_purpose');
        router.push('/reset-password');
      }
    } catch (e: any) {
      toast.error(e.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (!email) { toast.error('Email not found. Please go back.'); return; }
    setResending(true);
    try {
      if (purpose === 'signup') {
        await authService.resendVerification(email);
      } else {
        await authService.resendOtp(email);
      }
      toast.success('New code sent to your email');
    } catch (e: any) {
      toast.error(e.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  }

  return (
    <AuthLayout
      title="Verify your email"
      description={email ? `We sent a 6-digit code to ${email}` : 'Enter the code sent to your email'}
    >
      <div className="flex flex-col items-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-primary text-white shadow-glow">
          <Mail className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">Enter your verification code</p>
        <InputOTP maxLength={6} value={value} onChange={(v) => setValue(v)} className="mt-4">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <Button onClick={onSubmit} disabled={loading} className="mt-6 w-full gradient-primary text-white">
          {loading ? 'Verifying…' : (<>Verify <ArrowRight className="ml-2 h-4 w-4" /></>)}
        </Button>
        <button
          onClick={onResend}
          disabled={resending}
          className="mt-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
          {resending ? 'Sending…' : 'Resend code'}
        </button>
      </div>
    </AuthLayout>
  );
}
