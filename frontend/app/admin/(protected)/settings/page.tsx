'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, ClientApiError } from '@/lib/client-api';
import type { AdminSettings } from '@/lib/types';
import { formatDateTime } from '@/lib/format';
import { AdminHeader, ErrorBox, Field, LoadingRows } from '@/components/admin/ui';
import { useAdmin } from '@/components/admin/AdminContext';

export default function SettingsPage() {
  const { toast } = useAdmin();
  const [s, setS] = useState<AdminSettings | null>(null);
  const [orig, setOrig] = useState<AdminSettings | null>(null);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setError('');
    api<AdminSettings>('/settings/admin', { admin: true })
      .then((x) => {
        setS(x);
        setOrig(x);
      })
      .catch((e: ClientApiError) => setError(e.message));
  }, []);
  useEffect(load, [load]);

  const set = <K extends keyof AdminSettings>(k: K, v: AdminSettings[K]) => setS((p) => (p ? { ...p, [k]: v } : p));
  const dirty = JSON.stringify(s) !== JSON.stringify(orig);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!s) return;
    const fe: Record<string, string> = {};
    if (s.contactName.trim().length < 2) fe.contactName = 'Enter the contact name.';
    if (s.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.email.trim())) fe.email = 'Enter an email address in the format name@company.com.';
    if (s.phone && !/^[+()\d\s.-]{7,40}$/.test(s.phone.trim())) fe.phone = 'Use digits, spaces, and + ( ) - only.';
    if (s.showAddress && !s.address?.trim()) fe.address = 'Add the address, or turn off "Show office address".';
    setErrors(fe);
    if (Object.keys(fe).length) return;
    setSaving(true);
    try {
      const x = await api<AdminSettings>('/settings', {
        method: 'PATCH',
        admin: true,
        body: {
          contactName: s.contactName,
          email: s.email || null,
          phone: s.phone || null,
          address: s.address || null,
          showAddress: s.showAddress,
          heroRotate: s.heroRotate,
          templatePreview: s.templatePreview,
          privacyPolicy: s.privacyPolicy,
        },
      });
      setS(x);
      setOrig(x);
      toast('Settings saved. Changes are live on the site.');
    } catch (err) {
      const ce = err as ClientApiError;
      setErrors(ce.errors);
      toast(ce.message, true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <AdminHeader eyebrow="CONFIGURATION" title="Settings" />
      {error ? (
        <ErrorBox message={error} onRetry={load} />
      ) : !s ? (
        <div className="adm-panel">
          <LoadingRows />
        </div>
      ) : (
        <form onSubmit={save} noValidate className="adm-form" style={{ maxWidth: 820 }}>
          <div className="adm-panel adm-pad adm-form">
            <h2 className="h-card" style={{ fontSize: 20 }}>
              Contact details
            </h2>
            <p className="small">Shown in the header menu, footer, Team, Contact and Privacy pages. Leave email or phone empty to hide it.</p>
            <div className="form-grid">
              <Field id="st-name" label="Contact name *" error={errors.contactName}>
                <input id="st-name" className="control" value={s.contactName} maxLength={120} onChange={(e) => set('contactName', e.target.value)} />
              </Field>
              <Field id="st-email" label="Email" error={errors.email}>
                <input id="st-email" type="email" className="control" value={s.email || ''} maxLength={254} onChange={(e) => set('email', e.target.value)} />
              </Field>
              <Field id="st-phone" label="Phone" error={errors.phone}>
                <input id="st-phone" type="tel" className="control" value={s.phone || ''} maxLength={40} onChange={(e) => set('phone', e.target.value)} />
              </Field>
              <Field id="st-addr" label="Office address" error={errors.address}>
                <input id="st-addr" className="control" value={s.address || ''} maxLength={240} onChange={(e) => set('address', e.target.value)} />
              </Field>
            </div>
            <label className="adm-check">
              <input type="checkbox" checked={s.showAddress} onChange={(e) => set('showAddress', e.target.checked)} />
              Show office address on the site
            </label>
          </div>

          <div className="adm-panel adm-pad adm-form">
            <h2 className="h-card" style={{ fontSize: 20 }}>
              Behaviour
            </h2>
            <label className="adm-check">
              <input type="checkbox" checked={s.heroRotate} onChange={(e) => set('heroRotate', e.target.checked)} />
              Auto-cycle the home “Challenge map” every 7 seconds
            </label>
            <label className="adm-check">
              <input type="checkbox" checked={s.templatePreview} onChange={(e) => set('templatePreview', e.target.checked)} />
              Template preview — show sample insights, team profile and industries (with a “TEMPLATE PREVIEW” banner)
            </label>
            <p className="small">Keep template preview off on the live site. Use it to see how the layouts look before real content is approved.</p>
          </div>

          <div className="adm-panel adm-pad adm-form">
            <h2 className="h-card" style={{ fontSize: 20 }}>
              Privacy policy
            </h2>
            <Field id="st-priv" label="Policy text" help="Separate paragraphs with a blank line." error={errors.privacyPolicy}>
              <textarea id="st-priv" className="control" rows={8} value={s.privacyPolicy} onChange={(e) => set('privacyPolicy', e.target.value)} />
            </Field>
          </div>

          <div className="adm-actions">
            <button type="submit" className="btn btn--sm btn-dark" disabled={saving || !dirty}>
              {saving ? 'Saving…' : 'Save settings'}
            </button>
            {dirty && (
              <button type="button" className="btn btn--sm btn-outline" onClick={() => setS(orig)}>
                Discard changes
              </button>
            )}
            <span className="small">Last saved {formatDateTime(orig?.updatedAt)}</span>
          </div>
        </form>
      )}
    </>
  );
}
