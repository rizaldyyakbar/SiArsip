import { apiClient } from './client';
import type { UserAccount } from '../types';

export interface LoginResponse {
  token: string;
  user: UserAccount;
}

const TOKEN_KEY = 'siarsip_token';
const USER_KEY = 'siarsip_user';

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await apiClient<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

  if (res.token) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
  }

  return res;
}

export async function getMe(): Promise<UserAccount> {
  const user = await apiClient<UserAccount>('/auth/me', {
    method: 'GET'
  });
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function logout(): Promise<void> {
  try {
    await apiClient('/auth/logout', { method: 'POST' });
  } catch (err) {
    console.warn('Logout API error:', err);
  } finally {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword })
  });
}

export function getStoredUser(): UserAccount | null {
  const data = localStorage.getItem(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data) as UserAccount;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
