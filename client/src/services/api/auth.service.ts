
import httpClient from '../http/httpClient';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await httpClient.post<{ success: boolean; data: LoginResponse }>('/auth/login', {
      email,
      password,
    });
    return response.data.data;
  },

  getMe: async () => {
    const response = await httpClient.get<{ success: boolean; data: User }>('/auth/me');
    return response.data.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await httpClient.patch('/auth/me/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};
