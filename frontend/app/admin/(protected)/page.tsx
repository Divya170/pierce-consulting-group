'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api, ClientApiError } from '@/lib/client-api';
import type { Inquiry } from '@/lib/types';
import { formatDateTime, INQUIRY_STATUS_LABEL } from '@/lib/format';
import { AdminHeader, EmptyBox, ErrorBox, LoadingRows, StatusTag } from '@/components/admin/ui';
import { useAdmin } from '@/components/admin/AdminContext';

interface Stats {
  counts: Record<'all' | 'new' | 'review' | 'contacted' | 'closed', number>;
  last30: number;
  byService: { service: string; count: number }[];
  recent: Inquiry[];
}

export default function DashboardPage() {
  const { admin } = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);
  const [insightsCount, setInsightsCount] = useState<{ published: number; drafts: number } | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setError('');
    setStats(null);
    Promise.all([
      api<Stats>('/inquiries/stats', { admin: true }),
      api<{ status: string; isSample: boolean }[]>('/insights/admin/all', { admin: true }),
    ])
      .then(([s, ins]) => {
        setStats(s);
        const real = ins.filter((i) => !i.isSample);
        setInsightsCount({ published: real.filter((i) => i.status === 'published').length, drafts: real.filter((i) => i.status === 'draft').length });
      })
      .catch((e: ClientApiError) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const max = Math.max(1, ...(stats?.byService.map((b) => b.count) || [1]));

  return (
    <>
      <AdminHeader eyebrow="DASHBOARD" title={`Welcome back${admin?.name ? `, ${admin.name.split(' ')[0]}` : ''}`} />
      {error && <ErrorBox message={error} onRetry={load} />}

      <div className="adm-stats">
        {(
          [
            ['New enquiries', stats?.counts.new, '/admin/enquiries?status=new'],
            ['In review', stats?.counts.review, '/admin/enquiries?status=review'],
            ['Last 30 days', stats?.last30, '/admin/enquiries'],
            ['All enquiries', stats?.counts.all, '/admin/enquiries'],
            ['Published insights', insightsCount?.published, '/admin/insights'],
            ['Draft insights', insightsCount?.drafts, '/admin/insights?status=draft'],
          ] as const
        ).map(([label, v, href]) => (
          <Link key={label} href={href} className="adm-stat">
            <span className="mono-xs">{label.toUpperCase()}</span>
            {v === undefined ? <span className="skel" style={{ height: 34, width: 60 }} /> : <span className="v">{v}</span>}
          </Link>
        ))}
      </div>

      <div className="adm-split">
        <div className="l adm-panel">
          <div className="adm-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--line)' }}>
            <h2 className="h-card" style={{ fontSize: 20 }}>
              Latest enquiries
            </h2>
            <Link href="/admin/enquiries" className="link-plain">
              View all →
            </Link>
          </div>
          {!stats && !error ? (
            <LoadingRows rows={4} />
          ) : stats && stats.recent.length === 0 ? (
            <EmptyBox>No enquiries yet. Submissions from the consultation form appear here.</EmptyBox>
          ) : (
            stats?.recent.map((x) => (
              <Link key={x.id} href={`/admin/enquiries?id=${x.id}`} className="adm-row" style={{ textDecoration: 'none' }}>
                <span className="col min0" style={{ gap: 3 }}>
                  <span className="t">{x.fullName}</span>
                  <span className="s">{x.company}</span>
                </span>
                <span className="col min0" style={{ gap: 3 }}>
                  <span className="s" style={{ color: 'var(--text)' }}>
                    {x.serviceTitle}
                  </span>
                  <span className="mono-xs">{formatDateTime(x.createdAt)}</span>
                </span>
                <StatusTag kind={x.status === 'new' ? 'new' : undefined}>{INQUIRY_STATUS_LABEL[x.status]}</StatusTag>
              </Link>
            ))
          )}
        </div>
        <div className="r adm-panel adm-pad col" style={{ gap: 14 }}>
          <h2 className="h-card" style={{ fontSize: 20 }}>
            Enquiries by service
          </h2>
          {!stats ? (
            <LoadingRows rows={3} />
          ) : stats.byService.length === 0 ? (
            <p className="small">No data yet.</p>
          ) : (
            stats.byService.map((b) => (
              <div key={b.service} className="col" style={{ gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span>{b.service}</span>
                  <span className="mono-xs">{b.count}</span>
                </div>
                <div style={{ height: 6, background: 'var(--sand)' }}>
                  <div style={{ height: 6, width: `${(b.count / max) * 100}%`, background: 'var(--ink)' }} />
                </div>
              </div>
            ))
          )}
          <div className="col" style={{ gap: 8, borderTop: '1px solid var(--line)', paddingTop: 14, marginTop: 6 }}>
            <span className="mono-xs">QUICK ACTIONS</span>
            <Link href="/admin/insights?new=1" className="link-plain">
              + Write an insight
            </Link>
            <Link href="/admin/content?type=faq" className="link-plain">
              Edit FAQ
            </Link>
            <Link href="/admin/settings" className="link-plain">
              Contact details &amp; site settings
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
