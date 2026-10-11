'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { InsightCard as Card, InsightList } from '@/lib/types';
import { api, ClientApiError } from '@/lib/client-api';
import { useDebounced } from '@/lib/hooks';
import { formatDate } from '@/lib/format';
import { InsightCard } from './InsightCard';
import { TemplateBanner } from '@/components/site/TemplateBanner';

const FIRST_PAGE = 7;
const MORE = 6;

export function InsightsBrowser({ initial, initialCategory, initialQuery }: { initial: InsightList; initialCategory: string; initialQuery: string }) {
  const [category, setCategory] = useState(initialCategory || 'All');
  const [query, setQuery] = useState(initialQuery);
  const q = useDebounced(query.trim(), 300);
  const [items, setItems] = useState<Card[]>(initial.items);
  const [total, setTotal] = useState(initial.total);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [nonce, setNonce] = useState(0);
  const first = useRef(true);
  const reqId = useRef(0);
  const categories = ['All', ...initial.categories];

  const fetchPage = async (offset: number, limit: number) => {
    const qs = new URLSearchParams({ offset: String(offset), limit: String(limit) });
    if (category !== 'All') qs.set('category', category);
    if (q) qs.set('q', q);
    return api<InsightList>(`/insights?${qs}`);
  };

  // Refetch when filters change (skip the very first render — server already did it)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const id = ++reqId.current;
    setLoading(true);
    setError('');
    // keep the URL shareable
    const url = new URL(window.location.href);
    if (category !== 'All') url.searchParams.set('category', category);
    else url.searchParams.delete('category');
    if (q) url.searchParams.set('q', q);
    else url.searchParams.delete('q');
    window.history.replaceState(null, '', url.toString());

    fetchPage(0, FIRST_PAGE)
      .then((r) => {
        if (id !== reqId.current) return;
        setItems(r.items);
        setTotal(r.total);
      })
      .catch((e: ClientApiError) => id === reqId.current && setError(e.message))
      .finally(() => id === reqId.current && setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, q, nonce]);

  const loadMore = async () => {
    setLoadingMore(true);
    setError('');
    try {
      const r = await fetchPage(items.length, MORE);
      setItems((prev) => [...prev, ...r.items.filter((x) => !prev.some((p) => p.id === x.id))]);
      setTotal(r.total);
    } catch (e) {
      setError((e as ClientApiError).message);
    } finally {
      setLoadingMore(false);
    }
  };

  const clear = () => {
    setCategory('All');
    setQuery('');
  };

  const [featured, ...rest] = items;

  return (
    <section aria-label="Articles" className="wrap-n" style={{ paddingTop: 32, paddingBottom: 'clamp(64px,8vw,104px)' }}>
      {initial.hasSamples && <TemplateBanner>sample articles show the layout only and are not company publications.</TemplateBanner>}
      <div className="flex-wrap" style={{ gap: 16, justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div role="group" aria-label="Filter by category" className="flex-wrap" style={{ gap: 8 }}>
          {categories.map((c) => (
            <button key={c} type="button" className="chipbtn" style={{ padding: '0 16px' }} aria-pressed={category === c} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <label className="searchbox">
          Search insights
          <input type="search" className="input" value={query} onChange={(e) => setQuery(e.target.value)} maxLength={100} />
        </label>
      </div>

      <div aria-live="polite" aria-busy={loading}>
        {error && (
          <div role="alert" className="alert-err" style={{ marginBottom: 24 }}>
            <strong>We couldn&apos;t load articles.</strong>
            <p>
              {error}{' '}
              <button type="button" className="textbtn" style={{ minHeight: 0, fontSize: 14 }} onClick={() => setNonce((n) => n + 1)}>
                Retry
              </button>
            </p>
          </div>
        )}

        {loading ? (
          <ListSkeleton />
        ) : items.length === 0 ? (
          <p style={{ padding: '32px 0', margin: 0, fontSize: 16, color: 'var(--text-2)' }}>
            No articles match that search.{' '}
            <button type="button" className="textbtn" style={{ fontSize: 16, padding: 0 }} onClick={clear}>
              Clear filters
            </button>
          </p>
        ) : (
          <>
            {featured && (
              <article className="featured flex-wrap" style={{ gap: '32px 64px', padding: '32px 0 48px', borderTop: '1px solid var(--ink)', borderBottom: '1px solid var(--line)' }}>
                <div className="img-box min0" style={{ flex: '1.2 1 420px', aspectRatio: '16/10' }}>
                  {featured.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={featured.image} alt="" loading="lazy" />
                  )}
                </div>
                <div className="col min0" style={{ flex: '1 1 360px', gap: 16, justifyContent: 'center' }}>
                  <span className="icard__meta">
                    FEATURED · {featured.category} · {formatDate(featured.publishedAt, featured.isSample)}
                  </span>
                  <h2 className="h-3" style={{ fontSize: 'clamp(28px,3vw,40px)', lineHeight: 1.12 }}>
                    <Link href={`/insights/${featured.slug}`}>{featured.title}</Link>
                  </h2>
                  <p className="body" style={{ lineHeight: 1.65, maxWidth: '52ch' }}>
                    {featured.excerpt}
                  </p>
                  <Link href={`/insights/${featured.slug}`} className="link-plain" style={{ fontSize: 15 }}>
                    Read the Insight →
                  </Link>
                </div>
              </article>
            )}
            <div className="cards-fill">
              {rest.map((i) => (
                <InsightCard key={i.id} item={i} />
              ))}
            </div>
            {items.length < total && (
              <button type="button" className="btn btn-outline" style={{ marginTop: 32, minHeight: 48 }} onClick={loadMore} disabled={loadingMore} aria-disabled={loadingMore}>
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}

function ListSkeleton() {
  return (
    <div aria-label="Loading articles" className="col" style={{ gap: 24, paddingTop: 32, borderTop: '1px solid var(--ink)' }}>
      <div className="flex-wrap" style={{ gap: 32 }}>
        <div className="skel" style={{ flex: '1.2 1 420px', aspectRatio: '16/10' }} />
        <div className="col" style={{ flex: '1 1 360px', gap: 14, justifyContent: 'center' }}>
          <div className="skel" style={{ height: 12, width: '40%' }} />
          <div className="skel" style={{ height: 36, width: '90%' }} />
          <div className="skel" style={{ height: 16, width: '75%' }} />
        </div>
      </div>
      <div className="cards-fill">
        {[0, 1, 2].map((i) => (
          <div key={i} className="col" style={{ gap: 12, padding: '28px 0' }}>
            <div className="skel" style={{ height: 12, width: '45%' }} />
            <div className="skel" style={{ height: 22, width: '85%' }} />
            <div className="skel" style={{ height: 14, width: '70%' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
