import { apiClient } from './client';
import type { AcademicYearMaster } from '../types';

export interface BackendAcademicYear {
  id: number;
  year: string;
  semester: 'Ganjil' | 'Genap';
  label: string;
  is_active: boolean;
  doc_count?: number;
}

export function mapBackendAYToMaster(item: BackendAcademicYear): AcademicYearMaster {
  return {
    id: String(item.id),
    year: item.year,
    semester: item.semester,
    label: item.label,
    isActive: item.is_active
  };
}

export async function fetchAcademicYears(): Promise<BackendAcademicYear[]> {
  return apiClient<BackendAcademicYear[]>('/academic-years');
}

export async function createAcademicYear(
  year: string,
  semester: 'Ganjil' | 'Genap'
): Promise<{ id: number; label: string }> {
  return apiClient('/academic-years', {
    method: 'POST',
    body: JSON.stringify({ year, semester })
  });
}

export async function updateAcademicYearStatus(
  id: number | string,
  isActive: boolean
): Promise<{ message: string }> {
  return apiClient(`/academic-years/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: isActive })
  });
}

export async function deleteAcademicYear(
  id: number | string
): Promise<{ message: string }> {
  return apiClient(`/academic-years/${id}`, {
    method: 'DELETE'
  });
}
