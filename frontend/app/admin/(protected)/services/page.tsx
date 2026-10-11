'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ClientApiError } from '@/lib/client-api';
import type { AdminService } from '@/lib/types';
import { AdminHeader, ConfirmDialog, EmptyBox, ErrorBox, Field, LoadingRows, Modal, StatusTag } from '@/components/admin/ui';
import { useAdmin } from '@/components/admin/AdminContext';

type Draft = Omit<AdminService, 'id' | 'sortOrder' | 'updatedAt' | 'focusAreas'> & { id?: number; focusText: string };

const EMPTY: Draft = { slug: '', title: '', kicker: '', summary: '', purpose: '', body: '', focusText: '', visual: 'none', ctaLabel: '', status: 'draft' };
const STATUS_LABEL = { published: 'PUBLISHED', draft: 'DRAFT', 'awaiting-confirmation': 'AWAITING CONFIRMATION' } as const;
const VISUALS = [
  ['matrix', 'Priority matrix (strategy figure)'],
  ['workflow', 'Workflow stages (operations figure)'],
  ['before-after', 'Before / after process (process figure)'],
  ['none', 'No figure — text and focus areas only'],
] as const;

export default function ServicesAdminPage() {
  const { toast } = useAdmin();
  const [rows, setRows] = useState<AdminService[] | null>(null);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [del, setDel] = useState<AdminService | null>(null);

  const load = useCallback(() => {
    setError('');
    api<AdminService[]>('/services/admin/all', { admin: true })
      .then(setRows)
      .catch((e: ClientApiError) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const open = (s?: AdminService) => {
    setErrors({});
    setEdit(s ? { ...s, focusText: s.focusAreas.join('\n') } : { ...EMPTY });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!edit) return;
    const fe: Record<string, string> = {};
    if (edit.title.trim().length < 2) fe.title = 'Enter a service title.';
    if (!edit.id && edit.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(edit.slug)) fe.slug = 'Use lowercase letters, numbers and hyphens only.';
    if (edit.status === 'published' && !edit.purpose.trim()) fe.purpose = 'Required to publish.';
    if (edit.status === 'published' && !edit.body.trim()) fe.body = 'Required to publish.';
    setErrors(fe);
    if (Object.keys(fe).length) return;
    setSaving(true);
    const body = {
      title: edit.title,
      kicker: edit.kicker,
      summary: edit.summary,
      purpose: edit.purpose,
      body: edit.body,
      focusAreas: edit.focusText.split('\n').map((x) => x.trim()).filter(Boolean),
      visual: edit.visual,
      ctaLabel: edit.ctaLabel,
      status: edit.status,
      ...(edit.id ? {} : edit.slug ? { slug: edit.slug } : {}),
    };
    try {
      if (edit.id) await api(`/services/${edit.id}`, { method: 'PATCH', body, admin: true });
      else await api('/services', { method: 'POST', body, admin: true });
      toast(edit.id ? 'Service saved.' : 'Service created.');
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

  const move = async (i: number, dir: -1 | 1) => {
    if (!rows) return;
    const next = [...rows];
    const j = i + dir;
    [next[i], next[j]] = [next[j], next[i]];
    setRows(next);
    try {
      setRows(await api<AdminService[]>('/services/admin/reorder', { method: 'POST', body: { ids: next.map((r) => r.id) }, admin: true }));
    } catch (e) {
      toast((e as ClientApiError).message, true);
      load();
    }
  };

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setEdit((d) => (d ? { ...d, [k]: v } : d));

  return (
    <>
      <AdminHeader eyebrow="CONTENT" title="Services">
        <button type="button" className="btn btn--sm btn-dark" onClick={() => open()}>
          + New service
        </button>
      </AdminHeader>
      <p className="small" style={{ marginBottom: 16 }}>
        Published services appear in the navigation, home page, services page and the consultation form. Order here is the order on the site.
      </p>

      <div className="adm-panel tbl-wrap">
        {error ? (
          <ErrorBox message={error} onRetry={load} />
        ) : !rows ? (
          <LoadingRows />
        ) : rows.length === 0 ? (
          <EmptyBox>No services yet. Create the first one.</EmptyBox>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>SERVICE</th>
                <th>SLUG</th>
                <th>STATUS</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {rows.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button type="button" className="iconbtn" aria-label={`Move ${s.title} up`} disabled={i === 0} onClick={() => move(i, -1)}>
                      ↑
                    </button>{' '}
                    <button type="button" className="iconbtn" aria-label={`Move ${s.title} down`} disabled={i === rows.length - 1} onClick={() => move(i, 1)}>
                      ↓
                    </button>
                  </td>
                  <td>
                    <strong style={{ fontWeight: 500 }}>{s.title}</strong>
                    <div className="small">{s.purpose || 'No purpose statement yet'}</div>
                  </td>
                  <td className="mono-xs">{s.slug}</td>
                  <td>
                    <StatusTag kind={s.status === 'published' ? undefined : 'draft'}>{STATUS_LABEL[s.status]}</StatusTag>
                  </td>
                  <td style={{ whiteSpace: 'nowrap', textAlign: 'right' }}>
                    <button type="button" className="iconbtn" onClick={() => open(s)}>
                      Edit
                    </button>{' '}
                    <button type="button" className="iconbtn" style={{ color: 'var(--error)' }} onClick={() => setDel(s)}>
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
        <Modal title={edit.id ? `Edit — ${edit.title}` : 'New service'} onClose={() => setEdit(null)}>
          <form onSubmit={save} noValidate className="adm-form">
            <div className="form-grid">
              <Field id="s-title" label="Title *" error={errors.title}>
                <input id="s-title" className="control" value={edit.title} maxLength={120} onChange={(e) => set('title', e.target.value)} />
              </Field>
              {edit.id ? (
                <Field id="s-slug" label="Slug (fixed)" help="Used in URLs and enquiries, so it can't change.">
                  <input id="s-slug" className="control" value={edit.slug} disabled />
                </Field>
              ) : (
                <Field id="s-slug" label="Slug" error={errors.slug} help="Leave blank to generate from the title.">
                  <input id="s-slug" className="control" value={edit.slug} maxLength={60} onChange={(e) => set('slug', e.target.value.toLowerCase())} />
                </Field>
              )}
              <Field id="s-kicker" label="Kicker" help='Short label on the home card, e.g. "DIRECTION".' error={errors.kicker}>
                <input id="s-kicker" className="control" value={edit.kicker} maxLength={40} onChange={(e) => set('kicker', e.target.value)} />
              </Field>
              <Field id="s-status" label="Status" error={errors.status}>
                <select id="s-status" className="control" value={edit.status} onChange={(e) => set('status', e.target.value as Draft['status'])}>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="awaiting-confirmation">Awaiting confirmation</option>
                </select>
              </Field>
            </div>
            <Field id="s-summary" label="Home card summary" error={errors.summary}>
              <textarea id="s-summary" className="control" rows={2} maxLength={400} value={edit.summary} onChange={(e) => set('summary', e.target.value)} />
            </Field>
            <Field id="s-purpose" label="Purpose (italic lead)" error={errors.purpose}>
              <textarea id="s-purpose" className="control" rows={2} maxLength={400} value={edit.purpose} onChange={(e) => set('purpose', e.target.value)} />
            </Field>
            <Field id="s-body" label="Description" error={errors.body}>
              <textarea id="s-body" className="control" rows={4} maxLength={4000} value={edit.body} onChange={(e) => set('body', e.target.value)} />
            </Field>
            <Field id="s-focus" label="Focus areas (one per line)" error={errors.focusAreas}>
              <textarea id="s-focus" className="control" rows={4} value={edit.focusText} onChange={(e) => set('focusText', e.target.value)} />
            </Field>
            <div className="form-grid">
              <Field id="s-visual" label="Figure on services page" error={errors.visual}>
                <select id="s-visual" className="control" value={edit.visual} onChange={(e) => set('visual', e.target.value as Draft['visual'])}>
                  {VISUALS.map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </Field>
              <Field id="s-cta" label="Button label" help={`Defaults to "Discuss ${edit.title || '…'}".`} error={errors.ctaLabel}>
                <input id="s-cta" className="control" value={edit.ctaLabel} maxLength={80} onChange={(e) => set('ctaLabel', e.target.value)} />
              </Field>
            </div>
            <div className="adm-actions">
              <button type="submit" className="btn btn--sm btn-dark" disabled={saving}>
                {saving ? 'Saving…' : 'Save service'}
              </button>
              <button type="button" className="btn btn--sm btn-outline" onClick={() => setEdit(null)}>
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {del && (
        <ConfirmDialog
          title="Delete service?"
          message={`"${del.title}" will be removed from the site. Existing enquiries keep their service name. Content linked to it will fall back to the services page. Consider setting it to Draft instead.`}
          onCancel={() => setDel(null)}
          onConfirm={async () => {
            try {
              await api(`/services/${del.id}`, { method: 'DELETE', admin: true });
              toast('Service deleted.');
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
