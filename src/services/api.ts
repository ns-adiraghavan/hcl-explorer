// /src/services/api.ts

// Backend connection stubs for CXOWorld × HCL frontend
// 
// CURRENT STATE: All pages import directly from /data/executives.ts (static mock)
// TO MIGRATE: Replace those imports with calls to these functions
// Each function signature matches what the UI expects — only the data source changes
//
// Assumed backend endpoints (align with your existing DB schema):
//   GET /api/executives          → Executive[]
//   GET /api/executives/:id      → Executive
//   GET /api/hcl-parameters/:id  → HCLParameterProfile
//   GET /api/executives/:id/posts → SocialPost[]
//
// Auth: Add Bearer token to headers once auth layer is ready

import type { Executive } from '../data/executives';
import type { HCLParameterProfile } from '../data/hcl-parameters';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      // 'Authorization': `Bearer ${getToken()}`, // Uncomment when auth is ready
    }
  });
  if (!res.ok) throw new Error(`API error ${res.status} on ${path}`);
  return res.json();
}

// Replace: import { executives } from '../data/executives'
export async function getAllExecutives(): Promise<Executive[]> {
  // MOCK FALLBACK (remove when backend is live):
  const { executives } = await import('../data/executives');
  return executives;
  // REAL CALL (uncomment):
  // return fetchJSON<Executive[]>('/api/executives');
}

// Replace: import { getExecutiveById } from '../data/executives'
export async function getExecutiveById(id: string): Promise<Executive | undefined> {
  // MOCK FALLBACK:
  const { getExecutiveById: getMock } = await import('../data/executives');
  return getMock(id);
  // REAL CALL:
  // return fetchJSON<Executive>(`/api/executives/${id}`);
}

// Replace: import { getParameterProfileById } from '../data/hcl-parameters'
export async function getHCLProfile(executiveId: string): Promise<HCLParameterProfile | undefined> {
  // MOCK FALLBACK:
  const { getParameterProfileById } = await import('../data/hcl-parameters');
  return getParameterProfileById(executiveId);
  // REAL CALL:
  // return fetchJSON<HCLParameterProfile>(`/api/hcl-parameters/${executiveId}`);
}
