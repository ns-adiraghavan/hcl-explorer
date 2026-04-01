import type { Executive } from '@/types/executive';
import type { HCLParameterProfile } from '@/types/hcl-parameters';

async function loadJSON<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json() as Promise<T>;
}

export async function getAllExecutives(): Promise<Executive[]> {
  const index = await loadJSON<{ executives: { id: string; name: string }[] }>(
    '/data/index.json'
  );
  const profiles = await Promise.all(
    index.executives.map(e =>
      loadJSON<Executive>(`/data/executives/${e.id}.json`)
    )
  );
  return profiles;
}

export async function getExecutive(id: string): Promise<Executive | undefined> {
  const normalised = id.replace(/-[a-z0-9]{5,}$/, '');
  try {
    return await loadJSON<Executive>(`/data/executives/${normalised}.json`);
  } catch {
    try {
      return await loadJSON<Executive>(`/data/executives/${id}.json`);
    } catch {
      return undefined;
    }
  }
}

export async function getHCLProfile(id: string): Promise<HCLParameterProfile | undefined> {
  const normalised = id.replace(/-[a-z0-9]{5,}$/, '');
  try {
    return await loadJSON<HCLParameterProfile>(`/data/hcl/${normalised}.json`);
  } catch {
    try {
      return await loadJSON<HCLParameterProfile>(`/data/hcl/${id}.json`);
    } catch {
      return undefined;
    }
  }
}
