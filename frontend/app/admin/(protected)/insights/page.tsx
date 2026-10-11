'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { api, ClientApiError } from '@/lib/client-api';
import type { AdminInsight, AdminService } from '@/lib/types';
import { formatDateTime } from '@/lib/format';
import { useDebounced } from '@/lib/hooks';
import { AdminHeader, ConfirmDialog, EmptyBox, ErrorBox, Field, ImageField, LoadingRows, Modal, StatusTag } from '@/components/admin/ui';
import { useAdmin } from '@/components/admin/AdminContext';

type Draft = Omit<AdminInsight, 'id' | 'publishedAt' | 'updatedAt'> & { id?: number };
const EMPTY: Draft = { slug: '', title: '', category: '', serviceSlug: null, image: '', excerpt: '', bodyText: '', author: '', status: 'draft', featured: false, isSample: false };

function InsightsAdminInner() {
  const params = useSearchParams();
  const { toast } = useAdmin();
  const [rows, setRows] = useState<AdminInsight[] | null>(null);
  const [services, setServices] = useState<AdminService[]>([]);
  const [status, setStatus] = useState(params.get('status') || 'all');
  const [query, setQuery] = useState('');
  const q = useDebounced(query.trim(), 300);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState<Draft | null>(params.get('new') ? { ...EMPTY } : null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState<AdminInsight | null>(null);

  const load = useCallback(() => {
    setError('');
    setRows(null);
    const qs = new URLSearchParams();
    if (status !== 'all') qs.set('status', status);
    if (q) qs.set('q', q);
    api<AdminInsight[]>(`/insights/admin/all?${qs}`, { admin: true })
      .then(setRows)
      .catch((e: ClientApiError) => setError(e.message));
  }, [status, q]);
  useEffect(load, [load]);
  useEffect(() => {
    api<AdminService[]>('/services/admin/all', { admin: true }).then(setServices).catch(() => {});
  }, []);

  const categories = Array.from(new Set((rows || []).map((r) => r.category)));
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setEdit((d) => (d ? { ...d, [k]: v } : d));

  const save = async (e: React.FormEvent, publish?: boolean) => {
    e.preventDefault();
    if (!edit) return;
    const st = publish === undefined ? edit.status : publish ? 'published' : 'draft';
    const fe: Record<string, string> = {};
    if (edit.title.trim().length < 4) fe.title = 'Enter a title of at least 4 characters.';
    if (edit.category.trim().length < 2) fe.category = 'Enter a category.';
    if (edit.excerpt.trim().length < 10) fe.excerpt = 'Write a short excerpt (at least 10 characters).';
    if (edit.bodyText.trim().length < 20) fe.body = 'Write the article body (at least 20 characters).';
    if (edit.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(edit.slug)) fe.slug = 'Use lowercase letters, numbers and hyphens only.';
    setErrors(fe);
    if (Object.keys(fe).length) return;
    setSaving(true);
    const body = {
      title: edit.title.trim(),
      ...(edit.slug ? { slug: edit.slug } : {}),
      category: edit.category.trim(),
      serviceSlug: edit.serviceSlug || null,
      image: edit.image || null,
      excerpt: edit.excerpt.trim(),
      body: edit.bodyText,
      author: edit.author?.trim() || null,
      status: st,
      featured: edit.featured,
      isSample: edit.isSample,
    };
    try {
      if (edit.id) await api(`/insights/${edit.id}`, { method: 'PATCH', body, admin: true });
      else await api('/insights', { method: 'POST', body, admin: true });
      toast(st === 'published' ? 'Article saved and published.' : 'Draft saved.');
      setEdit(null);
      load();
    } catch (err) {
      const ce = err as ClientApiError;
      setErrors(ce.errors);
      if (!Object.keys(ce.errors).length) toast(ce.message, true);
    } finally {
      setSaving(false);
    }
  };

  const quick = async (r: AdminInsight, body: Partial<AdminInsight>, msg: string) => {
    try {
      await api(`/insights/${r.id}`, { method: 'PATCH', body, admin: true });
      toast(msg);
      load();
    } catch (e) {
      toast((e as ClientApiError).message, true);
    }
  };

  return (
    <>
      <AdminHeader eyebrow="CONTENT" title="Insights">
        <label className="searchbox" style={{ flex: '0 1 240px' }}>
          Search
          <input type="search" className="input" placeholder="Title or category" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <button
          type="button"
          className="btn btn--sm btn-dark"
          onClick={() => {
            setErrors({});
            setEdit({ ...EMPTY });
          }}
        >
          + New article
        </button>
      </AdminHeader>
      <div role="group" aria-label="Filter by status" className="adm-filters">
        {(
          [
            ['all', 'All'],
            ['published', 'Published'],
            ['draft', 'Drafts'],
          ] as const
        ).map(([v, l]) => (
          <button key={v} type="button" className="chipbtn" style={{ minHeight: 40, fontSize: 13 }} aria-pressed={status === v} onClick={() => setStatus(v)}>
            {l}
          </button>
        ))}
      </div>
      <p className="small" style={{ marginBottom: 16 }}>
        Articles marked <strong>Sample</strong> are the design template&apos;s placeholders — they only show on the site when “Template preview” is on in Settings. Uncheck “Sample” to treat an article as real.
      </p>

      <div className="adm-panel tbl-wrap">
        {error ? (
          <ErrorBox message={error} onRetry={load} />
        ) : !rows ? (
          <LoadingRows />
        ) : rows.length === 0 ? (
          <EmptyBox>{q || status !== 'all' ? 'No articles match.' : 'No articles yet. Write the first insight.'}</EmptyBox>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th aria-label="Image" />
                <th>ARTICLE</th>
                <th>CATEGORY</th>
                <th>STATUS</th>
                <th>UPDATED</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image} alt="" className="thumb" />
                    ) : (
                      <span className="thumb" style={{ display: 'inline-block' }} />
                    )}
                  </td>
                  <td style={{ minWidth: 220 }}>
                    <strong style={{ fontWeight: 500 }}>{r.title}</strong>
                    <div className="small">/insights/{r.slug}</div>
                  </td>
                  <td>{r.category}</td>
                  <td>
                    <div className="flex-wrap" style={{ gap: 6 }}>
                      <StatusTag kind={r.status === 'draft' ? 'draft' : undefined}>{r.status.toUpperCase()}</StatusTag>
                      {r.featured && <StatusTag kind="new">FEATURED</StatusTag>}
                      {r.isSample && <StatusTag kind="sample">SAMPLE</StatusTag>}
                    </div>
                  </td>
                  <td className="mono-xs" style={{ whiteSpace: 'nowrap' }}>
                    {formatDateTime(r.updatedAt)}
                  </td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                    {r.status === 'published' && (
                      <a className="iconbtn" style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }} href={`/insights/${r.slug}`} target="_blank" rel="noreferrer">
                        View
                      </a>
                    )}{' '}
                    <button type="button" className="iconbtn" onClick={() => quick(r, { status: r.status === 'published' ? 'draft' : 'published' }, r.status === 'published' ? 'Moved to drafts.' : 'Published.')}>
                      {r.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>{' '}
                    <button
                      type="button"
                      className="iconbtn"
                      onClick={() => {
                        setErrors({});
                        setEdit({ ...r, image: r.image || '', author: r.author || '' });
                      }}
                    >
                      Edit
                    </button>{' '}
                    <button type="button" className="iconbtn" style={{ color: 'var(--error)' }} onClick={() => setDel(r)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {edit && (
        <Modal title={edit.id ? 'Edit article' : 'New article'} onClose={() => setEdit(null)}>
          <form onSubmit={(e) => save(e)} noValidate className="adm-form">
            <Field id="i-title" label="Title *" error={errors.title}>
              <input id="i-title" className="control" maxLength={160} value={edit.title} onChange={(e) => set('title', e.target.value)} />
            </Field>
            <div className="form-grid">
              <Field id="i-slug" label="Slug" error={errors.slug} help="Leave blank to generate from the title.">
                <input id="i-slug" className="control" maxLength={80} value={edit.slug} onChange={(e) => set('slug', e.target.value.toLowerCase())} />
              </Field>
              <Field id="i-cat" label="Category *" error={errors.category} help="Used for the category filter.">
                <input id="i-cat" className="control" list="i-cats" maxLength={40} value={edit.category} onChange={(e) => set('category', e.target.value)} />
                <datalist id="i-cats">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field id="i-svc" label="Related service" error={errors.serviceSlug}>
                <select id="i-svc" className="control" value={edit.serviceSlug || ''} onChange={(e) => set('serviceSlug', e.target.value || null)}>
                  <option value="">None</option>
                  {services.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.title}
                      {s.status !== 'published' ? ' (not published)' : ''}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="i-author" label="Author" error={errors.author}>
                <input id="i-author" className="control" maxLength={120} value={edit.author || ''} onChange={(e) => set('author', e.target.value)} />
              </Field>
            </div>
            <ImageField id="i-image" label="Cover image" value={edit.image || ''} onChange={(v) => set('image', v)} error={errors.image} />
            <Field id="i-excerpt" label="Excerpt *" error={errors.excerpt}>
              <textarea id="i-excerpt" className="control" rows={2} maxLength={400} value={edit.excerpt} onChange={(e) => set('excerpt', e.target.value)} />
            </Field>
            <Field id="i-body" label="Body *" error={errors.body} help='Separate paragraphs with a blank line. Start a line with "## " for a section heading.'>
              <textarea id="i-body" className="control" rows={12} value={edit.bodyText} onChange={(e) => set('bodyText', e.target.value)} style={{ fontFamily: 'var(--f-body)' }} />
            </Field>
            <div className="flex-wrap" style={{ gap: 20 }}>
              <label className="adm-check">
                <input type="checkbox" checked={edit.featured} onChange={(e) => set('featured', e.target.checked)} />
                Featured (shown first on Insights)
              </label>
              <label className="adm-check">
                <input type="checkbox" checked={edit.isSample} onChange={(e) => set('isSample', e.target.checked)} />
                Sample (template preview only)
              </label>
            </div>
            <div className="adm-actions">
              <button type="button" className="btn btn--sm btn-dark" disabled={saving} onClick={(e) => save(e, true)}>
                {saving ? 'Saving…' : edit.status === 'published' ? 'Save & keep published' : 'Publish'}
              </button>
              <button type="button" className="btn btn--sm btn-outline" disabled={saving} onClick={(e) => save(e, false)}>
                {edit.status === 'published' ? 'Unpublish & save as draft' : 'Save draft'}
              </button>
              <button type="button" className="textbtn" onClick={() => setEdit(null)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {del && (
        <ConfirmDialog
          title="Delete article?"
          message={`"${del.title}" will be permanently deleted.`}
          onCancel={() => setDel(null)}
          onConfirm={async () => {
            try {
              await api(`/insights/${del.id}`, { method: 'DELETE', admin: true });
              toast('Article deleted.');
              setDel(null);
              load();
            } catch (e) {
              toast((e as ClientApiError).message, true);
            }
          }}
        />
      )}
    </>
  );
}

export default function InsightsAdminPage() {
  return (
    <Suspense fallback={<LoadingRows />}>
      <InsightsAdminInner />
    </Suspense>
  );
}
