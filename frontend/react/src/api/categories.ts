import { apiClient } from './client';
import type { CategoryItem } from '../types';

export async function fetchCategories(): Promise<CategoryItem[]> {
  return apiClient<CategoryItem[]>('/categories');
}

export async function createCategory(data: {
  name: string;
  code: string;
  description: string;
  colorBg: string;
  colorText: string;
}): Promise<{ id: number; message: string }> {
  return apiClient('/categories', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateCategory(
  id: number,
  data: {
    name: string;
    code: string;
    description: string;
    colorBg: string;
    colorText: string;
  }
): Promise<{ message: string }> {
  return apiClient(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function deleteCategory(
  id: number
): Promise<{ message: string }> {
  return apiClient(`/categories/${id}`, {
    method: 'DELETE'
  });
}
