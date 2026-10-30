import { apiFetch } from '@/lib/api';
import { Nominee } from '@/types';

export const nomineeService = {
  async list(): Promise<Nominee[]> {
    return apiFetch('/nominees');
  },
  async create(input: Partial<Nominee>): Promise<Nominee> {
    return apiFetch('/nominees', { method: 'POST', body: JSON.stringify(input) });
  },
  async update(id: string, input: Partial<Nominee>): Promise<Nominee> {
    return apiFetch(`/nominees/${id}`, { method: 'PUT', body: JSON.stringify(input) });
  },
  async remove(id: string): Promise<{ id: string }> {
    return apiFetch(`/nominees/${id}`, { method: 'DELETE' });
  },
  async requestVerification(id: string): Promise<{ id: string; status: 'pending' }> {
    return apiFetch(`/nominees/${id}/verify`, { method: 'POST' });
  },
};
