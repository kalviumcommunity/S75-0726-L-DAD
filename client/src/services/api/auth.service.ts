
import httpClient from '../http/httpClient';

export interface NotificationPreferences {
  emailAlerts: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  theme?: 'light' | 'dark';
  notificationPreferences?: NotificationPreferences;
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
    const response = await httpClient.get<{ success: boolean; data: { user: User } }>('/auth/me');
    return response.data.data.user;
  },

  updateProfile: async (fullName: string, email: string) => {
    const response = await httpClient.patch<{ success: boolean; data: { user: User } }>('/auth/me', {
      fullName,
      email,
    });
    return response.data.data.user;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await httpClient.patch<{ success: boolean; data: { message: string } }>('/auth/me/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  updatePreferences: async (theme: 'light' | 'dark', notificationPreferences: NotificationPreferences) => {
    const response = await httpClient.patch<{ success: boolean; data: { user: User } }>('/auth/me/preferences', {
      theme,
      notificationPreferences,
    });
    return response.data.data.user;
  },
};
