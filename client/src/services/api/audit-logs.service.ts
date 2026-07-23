import httpClient from '../http/httpClient';

export type AuditLog = {
  _id: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  user: { _id: string; fullName: string; email: string; role: string } | null;
};

export type AuditLogMeta = { page: number; limit: number; totalItems: number; totalPages: number };

export const auditLogsApi = {
  getAuditLogs: async (params: { page?: number; limit?: number; action?: string; sortBy?: 'createdAt' | 'action'; sortOrder?: 'asc' | 'desc' } = {}) => {
    const response = await httpClient.get<{ success: boolean; data: AuditLog[]; meta: AuditLogMeta }>('/audit-logs', { params });
    return response.data;
  },
};
