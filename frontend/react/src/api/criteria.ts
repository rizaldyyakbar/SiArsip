import { apiClient } from './client';
import type { LamInfokomCriterion } from '../types';

export async function fetchCriteria(): Promise<LamInfokomCriterion[]> {
  return apiClient<LamInfokomCriterion[]>('/criteria');
}
