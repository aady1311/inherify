import { apiFetch } from '@/lib/api';
import { User, AdminReport, VerificationRequest } from '@/types';

export const adminService = {
  async users(): Promise<User[]> {
    return apiFetch('/admin/users');
  },
  async updateUserStatus(id: string, status: string) {
    return apiFetch(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  },
  async updateUserRole(id: string, role: string) {
    return apiFetch(`/admin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
  },
  async reports(): Promise<AdminReport[]> {
    return apiFetch('/admin/reports');
  },
  async verificationRequests(): Promise<VerificationRequest[]> {
    return apiFetch('/admin/verifications');
  },
  async analytics() {
    return apiFetch('/admin/analytics');
  },
  async resolveReport(id: string) {
    return apiFetch(`/admin/reports/${id}/resolve`, { method: 'PATCH' });
  },
  async approveVerification(id: string) {
    return apiFetch(`/admin/verifications/${id}/approve`, { method: 'PATCH' });
  },
  async rejectVerification(id: string) {
    return apiFetch(`/admin/verifications/${id}/reject`, { method: 'PATCH' });
  },
};
