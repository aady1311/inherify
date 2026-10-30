import { apiFetch } from '@/lib/api';
import { User, UserPreferences } from '@/types';

export const userService = {
  async me(): Promise<User> {
    return apiFetch('/user/me');
  },
  async updateProfile(input: Partial<User>): Promise<User> {
    return apiFetch('/user/profile', { method: 'PUT', body: JSON.stringify(input) });
  },
  async updatePassword(input: { current: string; next: string }): Promise<{ success: boolean }> {
    return apiFetch('/user/password', { method: 'PUT', body: JSON.stringify(input) });
  },
  async toggle2FA(enabled: boolean): Promise<{ enabled: boolean }> {
    return apiFetch('/user/2fa', { method: 'PATCH', body: JSON.stringify({ enabled }) });
  },
  async deleteAccount(): Promise<{ success: boolean }> {
    return apiFetch('/user/account', { method: 'DELETE' });
  },
  async listDevices() {
    return apiFetch('/user/devices');
  },
  async revokeDevice(id: string) {
    return apiFetch(`/user/devices/${id}`, { method: 'DELETE' });
  },
  async listEmergencyContacts() {
    return apiFetch('/user/emergency-contacts');
  },
  async createEmergencyContact(input: object) {
    return apiFetch('/user/emergency-contacts', { method: 'POST', body: JSON.stringify(input) });
  },
  async updateEmergencyContact(id: string, input: object) {
    return apiFetch(`/user/emergency-contacts/${id}`, { method: 'PUT', body: JSON.stringify(input) });
  },
  async deleteEmergencyContact(id: string) {
    return apiFetch(`/user/emergency-contacts/${id}`, { method: 'DELETE' });
  },
  async getSubscription() {
    return apiFetch('/user/subscription');
  },
  async updateSubscription(plan: 'free' | 'pro' | 'legacy') {
    return apiFetch('/user/subscription', { method: 'PATCH', body: JSON.stringify({ plan }) });
  },
  async updatePreferences(input: Partial<UserPreferences>): Promise<User> {
    return apiFetch('/user/preferences', { method: 'PATCH', body: JSON.stringify(input) });
  },
  async uploadAvatar(file: File): Promise<User> {
    const fd = new FormData();
    fd.append('file', file);
    return apiFetch('/user/avatar', { method: 'POST', body: fd });
  },
};
