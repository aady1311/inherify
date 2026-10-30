import { apiFetch, apiFetchBlob } from '@/lib/api';
import { VaultAsset, VaultDocument, AssetCategory } from '@/types';

export const vaultService = {
  async listAssets(category?: AssetCategory): Promise<VaultAsset[]> {
    const q = category ? `?category=${category}` : '';
    return apiFetch(`/vault/assets${q}`);
  },
  async getAsset(id: string): Promise<VaultAsset> {
    return apiFetch(`/vault/assets/${id}`);
  },
  async createAsset(input: Partial<VaultAsset>): Promise<VaultAsset> {
    return apiFetch('/vault/assets', { method: 'POST', body: JSON.stringify(input) });
  },
  async updateAsset(id: string, input: Partial<VaultAsset>): Promise<VaultAsset> {
    return apiFetch(`/vault/assets/${id}`, { method: 'PUT', body: JSON.stringify(input) });
  },
  async deleteAsset(id: string): Promise<{ id: string }> {
    return apiFetch(`/vault/assets/${id}`, { method: 'DELETE' });
  },
  async toggleFavorite(id: string): Promise<{ id: string; favorite: boolean }> {
    return apiFetch(`/vault/assets/${id}/favorite`, { method: 'PATCH' });
  },
  async listDocuments(): Promise<VaultDocument[]> {
    return apiFetch('/vault/documents');
  },
  async uploadDocument(input: { file: File; category?: string; sharedWithNomineeIds?: string[] }): Promise<VaultDocument> {
    const fd = new FormData();
    fd.append('file', input.file);
    if (input.category) fd.append('category', input.category);
    if (input.sharedWithNomineeIds) fd.append('sharedWithNomineeIds', JSON.stringify(input.sharedWithNomineeIds));
    return apiFetch('/vault/documents/upload', { method: 'POST', body: fd });
  },
  async previewDocument(id: string) {
    return apiFetchBlob(`/vault/documents/${id}/file?mode=preview`);
  },
  async downloadDocument(id: string) {
    return apiFetchBlob(`/vault/documents/${id}/file?mode=download`);
  },
  async updateDocumentShare(id: string, sharedWithNomineeIds: string[]): Promise<VaultDocument> {
    return apiFetch(`/vault/documents/${id}`, { method: 'PUT', body: JSON.stringify({ sharedWithNomineeIds }) });
  },
  async deleteDocument(id: string): Promise<{ id: string }> {
    return apiFetch(`/vault/documents/${id}`, { method: 'DELETE' });
  },
};
