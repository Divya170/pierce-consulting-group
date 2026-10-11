'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, ClientApiError, downloadCsv } from '@/lib/client-api';
import type { Inquiry, InquiryStatus } from '@/lib/types';
import { formatDateTime, INQUIRY_STATUS_LABEL } from '@/lib/format';
import { useDebounced } from '@/lib/hooks';
import { AdminHeader, ConfirmDialog, EmptyBox, ErrorBox, LoadingRows, StatusTag } from '@/components/admin/ui';
import { useAdmin } from '@/components/admin/AdminContext';

interface ListResponse {
  items: Inquiry[];
  total: number;
  page: number;
  pages: number;
  counts: Record<string, number>;
}

const FILTERS: [string, string][] = [
  ['all', 'All'],
  ['new', 'New'],
  ['review', 'In Review'],
  ['contacted', 'Contacted'],
  ['closed', 'Closed'],
];

function EnquiriesInner() {
  const params = useSearchParams();
  const { toast, refreshCounts } = useAdmin();
  const [filter, setFilter] = useState(params.get('status') || 'all');
  const [query, setQuery] = useState('');
  const q = useDebounced(query.trim(), 300);
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selId, setSelId] = useState<string | null>(params.get('id'));
  const [sel, setSel] = useState<Inquiry | null>(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const req = useRef(0);

  const load = useCallback(() => {
    const id = ++req.current;
    setLoading(true);
    setError('');
    const qs = new URLSearchParams({ page: String(page), limit: '25', sort });
    if (filter !== 'all') qs.set('status', filter);
    if (q) qs.set('q', q);
    api<ListResponse>(`/inquiries?${qs}`, { admin: true })
      .then((r) => id === req.current && setData(r))
      .catch((e: ClientApiError) => id === req.current && setError(e.message))
      .finally(() => id === req.current && setLoading(false));
  }, [filter, q, sort, page]);

  useEffect(load, [load]);
  useEffect(() => setPage(1), [filter, q, sort]);

  // Load the selected record (also supports deep links from the dashboard)
  useEffect(() => {
    if (!selId) {
      setSel(null);
      return;
    }
    api<Inquiry>(`/inquiries/${selId}`, { admin: true })
      .then((x) => {
        setSel(x);
        setNotes(x.notes);
      })
      .catch((e: ClientApiError) => {
        toast(e.message, true);
        setSelId(null);
      });
  }, [selId, toast]);

  const patch = async (body: Partial<Pick<Inquiry, 'status' | 'notes'>>, msg: string) => {
    if (!sel) return;
    setSaving(true);
    try {
      const x = await api<Inquiry>(`/inquiries/${sel.id}`, { method: 'PATCH', body, admin: true });
      setSel(x);
      setNotes(x.notes);
      setData((d) => (d ? { ...d, items: d.items.map((i) => (i.id === x.id ? x : i)) } : d));
      toast(msg);
      if (body.status) {
        refreshCounts();
        load();
      }
    } catch (e) {
      toast((e as ClientApiError).message, true);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!sel) return;
    try {
      await api(`/inquiries/${sel.id}`, { method: 'DELETE', admin: true });
      toast('Enquiry deleted.');
      setConfirmDel(false);
      setSelId(null);
      refreshCounts();
      load();
    } catch (e) {
      toast((e as ClientApiError).message, true);
    }
  };

  const exportCsv = async () => {
    try {
      await downloadCsv(`/inquiries/export.csv${filter !== 'all' ? `?status=${filter}` : ''}`, `pcg-enquiries-${new Date().toISOString().slice(0, 10)}.csv`);
    } catch (e) {
      toast((e as ClientApiError).message, true);
    }
  };

  const counts = data?.counts || {};

  return (
    <>
      <AdminHeader eyebrow="ADMIN" title="Consultation enquiries">
        <label className="searchbox" style={{ flex: '0 1 260px' }}>
          Search
          <input type="search" className="input" placeholder="Name, company, email, ref" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <label className="searchbox" style={{ flex: '0 0 auto' }}>
          Sort
          <select className="input" value={sort} onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
        <button type="button" className="btn btn--sm btn-outline" onClick={exportCsv}>
          Export CSV
        </button>
      </AdminHeader>

      <div role="group" aria-label="Filter by status" className="adm-filters">
        {FILTERS.map(([v, l]) => (
          <button key={v} type="button" className="chipbtn" style={{ minHeight: 40, fontSize: 13 }} aria-pressed={filter === v} onClick={() => setFilter(v)}>
            {l} · {counts[v] ?? 0}
          </button>
        ))}
      </div>

      <div className="adm-split">
        <div className="l adm-panel">
          {error ? (
            <ErrorBox message={error} onRetry={load} />
          ) : loading && !data ? (
            <LoadingRows />
          ) : data && data.items.length === 0 ? (
            <EmptyBox>{q || filter !== 'all' ? 'No enquiries match. Try a different search or filter.' : 'No enquiries yet. Submissions from the contact page appear here.'}</EmptyBox>
          ) : (
            <div style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 150ms' }}>
              {data?.items.map((x) => (
                <button key={x.id} type="button" className="adm-row" aria-pressed={selId === x.id} onClick={() => setSelId(x.id)}>
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
                </button>
              ))}
            </div>
          )}
          {data && data.pages > 1 && (
            <div className="adm-pad" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="iconbtn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Prev
              </button>
              <span className="mono-xs">
                PAGE {data.page} / {data.pages} · {data.total} TOTAL
              </span>
              <button type="button" className="iconbtn" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
                Next →
              </button>
            </div>
          )}
        </div>

        <aside className="r adm-panel adm-pad col" style={{ gap: 16 }}>
          {!selId ? (
            <p className="small" style={{ fontSize: 15 }}>
              Select an enquiry to view details.
            </p>
          ) : !sel ? (
            <LoadingRows rows={3} />
          ) : (
            <>
              <div className="col" style={{ gap: 6 }}>
                <span className="mono-xs">{sel.reference}</span>
                <h2 className="h-card" style={{ fontSize: 24 }}>
                  {sel.fullName}
                </h2>
              </div>
              <dl className="dl" style={{ gap: '10px 16px', fontSize: 14 }}>
                <dt>COMPANY</dt>
                <dd>{sel.company}</dd>
                <dt>EMAIL</dt>
                <dd>
                  <a href={`mailto:${sel.email}`}>{sel.email}</a>
                </dd>
                <dt>PHONE</dt>
                <dd>{sel.phone ? <a href={`tel:${sel.phone.replace(/[^\d+]/g, '')}`}>{sel.phone}</a> : '—'}</dd>
                <dt>SERVICE</dt>
                <dd>{sel.serviceTitle}</dd>
                <dt>PREFERS</dt>
                <dd>{sel.preferredContact ? sel.preferredContact[0].toUpperCase() + sel.preferredContact.slice(1) : 'No preference'}</dd>
                <dt>SUBMITTED</dt>
                <dd>{formatDateTime(sel.createdAt)}</dd>
                <dt>UPDATED</dt>
                <dd>{formatDateTime(sel.updatedAt)}</dd>
              </dl>
              <div style={{ padding: 14, background: 'var(--paper)', fontSize: 15, lineHeight: 1.6, color: 'var(--text)', whiteSpace: 'pre-wrap' }}>{sel.challenge}</div>
              <label className="field" style={{ fontSize: 13 }}>
                <span style={{ fontWeight: 500, color: 'var(--ink)' }}>Status</span>
                <select className="input" value={sel.status} disabled={saving} onChange={(e) => patch({ status: e.target.value as InquiryStatus }, 'Status updated.')}>
                  <option value="new">New</option>
                  <option value="review">In Review</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>
              </label>
              <label className="field" style={{ fontSize: 13 }}>
                <span style={{ fontWeight: 500, color: 'var(--ink)' }}>Internal notes</span>
                <textarea className="control" rows={4} maxLength={5000} value={notes} onChange={(e) => setNotes(e.target.value)} style={{ fontSize: 15, minHeight: 100 }} />
              </label>
              <div className="adm-actions">
                <button type="button" className="btn btn--sm btn-dark" disabled={saving || notes === sel.notes} onClick={() => patch({ notes }, 'Notes saved.')}>
                  {saving ? 'Saving…' : 'Save notes'}
                </button>
                <a className="btn btn--sm btn-outline" href={`mailto:${sel.email}?subject=${encodeURIComponent('Your consultation request — Pierce Consulting Group')}`}>
                  Reply by email
                </a>
                <button type="button" className="iconbtn" style={{ marginLeft: 'auto', color: 'var(--error)' }} onClick={() => setConfirmDel(true)}>
                  Delete
                </button>
              </div>
            </>
          )}
        </aside>
      </div>

      {confirmDel && sel && (
        <ConfirmDialog
          title="Delete enquiry?"
          message={`This permanently removes ${sel.fullName}'s enquiry (${sel.reference}). This cannot be undone.`}
          onConfirm={remove}
          onCancel={() => setConfirmDel(false)}
        />
      )}
    </>
  );
}

export default function EnquiriesPage() {
  return (
    <Suspense fallback={<LoadingRows />}>
      <EnquiriesInner />
    </Suspense>
  );
}
