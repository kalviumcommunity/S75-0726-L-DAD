import httpClient from '../http/httpClient';

export type ManagedUser = {
  _id: string;
  fullName: string;
  email: string;
  role: 'Manager' | 'Analyst' | 'Coordinator';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UsersMeta = { page: number; limit: number; totalItems: number; totalPages: number };

export const usersApi = {
  getUsers: async (params: { page?: number; limit?: number; search?: string; role?: string } = {}) => {
    const response = await httpClient.get<{ success: boolean; data: ManagedUser[]; meta: UsersMeta }>('/users', { params });
    return response.data;
  },
  updateUser: async (id: string, data: Pick<ManagedUser, 'fullName' | 'email' | 'role'>) => {
    const response = await httpClient.patch<{ success: boolean; data: ManagedUser }>(`/users/${id}`, data);
    return response.data.data;
  },
  updateStatus: async (id: string, isActive: boolean) => {
    const response = await httpClient.patch<{ success: boolean; data: ManagedUser }>(`/users/${id}/status`, { isActive });
    return response.data.data;
  },
};
