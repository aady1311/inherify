import { apiFetch } from '@/lib/api';
import { ActivityLog, DashboardStats, DigitalWill } from '@/types';

export const dashboardService = {
  async stats(): Promise<DashboardStats> {
    return apiFetch('/dashboard/stats');
  },
  async activity(): Promise<ActivityLog[]> {
    return apiFetch('/dashboard/activity');
  },
};

export const willService = {
  async get(): Promise<DigitalWill | null> {
    return apiFetch('/will');
  },
  async saveDraft(content: string): Promise<DigitalWill> {
    return apiFetch('/will/draft', { method: 'POST', body: JSON.stringify({ content }) });
  },
  async publish(content: string): Promise<DigitalWill> {
    return apiFetch('/will/publish', { method: 'POST', body: JSON.stringify({ content }) });
  },
  async sign(content: string): Promise<DigitalWill> {
    return apiFetch('/will/sign', { method: 'POST', body: JSON.stringify({ content }) });
  },
};
