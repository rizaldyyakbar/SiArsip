import { apiClient } from './client';
import type { Lecturer } from '../types';

export async function fetchLecturers(): Promise<Lecturer[]> {
  return apiClient<Lecturer[]>('/lecturers');
}

export async function createLecturer(data: {
  nip: string;
  name: string;
  email: string;
  phone: string;
  position: string;
}): Promise<{ id: number; message: string }> {
  return apiClient('/lecturers', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateLecturer(
  id: number,
  data: {
    nip: string;
    name: string;
    email: string;
    phone: string;
    position: string;
  }
): Promise<{ message: string }> {
  return apiClient(`/lecturers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function toggleLecturerStatus(
  id: number
): Promise<{ id: number; isActive: boolean; message: string }> {
  return apiClient(`/lecturers/${id}/status`, {
    method: 'PATCH'
  });
}

export async function deleteLecturer(
  id: number
): Promise<{ message: string }> {
  return apiClient(`/lecturers/${id}`, {
    method: 'DELETE'
  });
}
