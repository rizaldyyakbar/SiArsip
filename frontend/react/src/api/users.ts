import { apiClient } from './client';
import type { UserAccount, UserRole } from '../types';

export async function fetchUsers(): Promise<UserAccount[]> {
  return apiClient<UserAccount[]>('/users');
}

export interface CreateUserData {
  username: string;
  password: string;
  name: string;
  role: UserRole;
  nip?: string;
  email?: string;
  phone?: string;
}

export async function createUser(data: CreateUserData): Promise<{ message: string; id: number }> {
  return apiClient<{ message: string; id: number }>('/users', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateUser(
  id: number,
  data: {
    name?: string;
    role?: UserRole;
    nip?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
  }
): Promise<{ message: string; id: number }> {
  return apiClient<{ message: string; id: number }>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function resetUserPassword(id: number, newPassword: string): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/users/${id}/password`, {
    method: 'PATCH',
    body: JSON.stringify({ newPassword })
  });
}

export async function deleteUser(id: number): Promise<{ message: string }> {
  return apiClient<{ message: string }>(`/users/${id}`, {
    method: 'DELETE'
  });
}
