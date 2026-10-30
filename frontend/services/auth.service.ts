import { apiFetch } from '@/lib/api';
import { User } from '@/types';

export const authService = {
  async signup(name: string, email: string, password: string) {
    return apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
  },
  async verifyEmail(email: string, code: string) {
    const data = await apiFetch('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    if (data.token && typeof window !== 'undefined') localStorage.setItem('token', data.token);
    return data;
  },
  async login(email: string, password: string) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (typeof window !== 'undefined') localStorage.setItem('token', data.token);
    return data;
  },
  async forgotPassword(email: string) {
    return apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  },
  async verifyOtp(email: string, code: string) {
    const data = await apiFetch('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
    if (data.token && typeof window !== 'undefined') localStorage.setItem('token', data.token);
    return data;
  },
  async resendOtp(email: string) {
    return apiFetch('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
  },
  async resendVerification(email: string) {
    return apiFetch('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) });
  },
  async resetPassword(password: string) {
    return apiFetch('/auth/reset-password', { method: 'POST', body: JSON.stringify({ password }) });
  },
  async me(): Promise<User> {
    return apiFetch('/auth/me');
  },
  async adminLogin(email: string, password: string) {
    const data = await apiFetch('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (typeof window !== 'undefined') localStorage.setItem('token', data.token);
    return data;
  },
  logout() {
    if (typeof window !== 'undefined') localStorage.removeItem('token');
  },
};
