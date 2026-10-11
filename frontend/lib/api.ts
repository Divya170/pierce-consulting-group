/**
 * Server-side data access for public pages (React Server Components).
 * Always uncached so CMS edits appear immediately.
 */
import type { ContentBundle, ContentType, InsightArticle, InsightList, SiteData } from './types';

const BACKEND = (process.env.BACKEND_URL || 'http://localhost:4000').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function get<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND}/api${path}`, { cache: 'no-store', headers: { Accept: 'application/json' } });
  } catch {
    throw new ApiError(503, 'The site service is unavailable. Please try again shortly.');
  }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) msg = Array.isArray(body.message) ? body.message[0] : body.message;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, msg);
  }
  return res.json() as Promise<T>;
}

export const getSite = () => get<SiteData>('/site');

export function getContent<K extends ContentType>(...types: K[]): Promise<ContentBundle<K>> {
  return get<ContentBundle<K>>(`/content?types=${types.join(',')}`);
}

export function getInsights(params: { category?: string; q?: string; offset?: number; limit?: number } = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.q) qs.set('q', params.q);
  qs.set('offset', String(params.offset ?? 0));
  qs.set('limit', String(params.limit ?? 7));
  return get<InsightList>(`/insights?${qs}`);
}

/** Returns null when the article does not exist or is not published. */
export async function getInsight(slug: string): Promise<InsightArticle | null> {
  try {
    return await get<InsightArticle>(`/insights/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}
