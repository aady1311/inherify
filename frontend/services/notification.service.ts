import { apiFetch } from '@/lib/api';
import { AppNotification, NotificationType } from '@/types';

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    return apiFetch('/notifications');
  },
  async markAsRead(id: string): Promise<{ id: string; read: true }> {
    return apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
  },
  async markAllAsRead(): Promise<{ success: boolean }> {
    return apiFetch('/notifications/read-all', { method: 'PATCH' });
  },
  async delete(id: string): Promise<{ id: string }> {
    return apiFetch(`/notifications/${id}`, { method: 'DELETE' });
  },
  async filter(type: NotificationType | 'all'): Promise<AppNotification[]> {
    return apiFetch(`/notifications${type !== 'all' ? `?type=${type}` : ''}`);
  },
};
