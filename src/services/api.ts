import type { Executive } from '../data/executives';
import type { HCLParameterProfile } from '../data/hcl-parameters';

const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

export async function getAllExecutives(): Promise<Executive[]> {
  if (USE_MOCK) {
    const { executives } = await import('../data/executives');
    return executives;
  }
  return fetchJSON<Executive[]>('/api/executives');
}

export async function getExecutive(id: string): Promise<Executive | undefined> {
  if (USE_MOCK) {
    const { getExecutiveById } = await import('../data/executives');
    return getExecutiveById(id);
  }
  return fetchJSON<Executive>(`/api/executives/${id}`);
}

export async function getHCLProfile(id: string): Promise<HCLParameterProfile | undefined> {
  if (USE_MOCK) {
    const { getParameterProfileById } = await import('../data/hcl-parameters');
    return getParameterProfileById(id);
  }
  return fetchJSON<HCLParameterProfile>(`/api/hcl-parameters/${id}`);
}
