'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { api, ClientApiError } from '@/lib/client-api';
import { ConsultationForm as Form, errorSummary, FIELD_ORDER, FormErrors, validateConsultation } from '@/lib/validation';
import { SuccessCard } from '@/components/site/SuccessCard';

type Status = 'idle' | 'submitting' | 'error' | 'success';
const EMPTY: Form = { name: '', email: '', company: '', phone: '', service: '', challenge: '', contact: '', website: '' };
const SERVICE_KEY = 'pcg-service';

interface Props {
  options: { value: string; label: string }[];
  presetService: string | null;
  email: string | null;
  mailHref: string | null;
}

function newRequestId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function ConsultationForm({ options, presetService, email, mailHref }: Props) {
  const values = useMemo(() => options.map((o) => o.value), [options]);
  const [form, setForm] = useState<Form>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<keyof Form, boolean>>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>('idle');
  const [summary, setSummary] = useState('');
  const [live, setLive] = useState('');
  const [reference, setReference] = useState<string | null>(null);
  const [serverMsg, setServerMsg] = useState('');
  const requestId = useRef<string | null>(null);

  // Pre-select service: ?service=… wins, then the last choice kept for this session
  useEffect(() => {
    let svc = presetService && values.includes(presetService) ? presetService : null;
    if (!svc) {
      try {
        const saved = sessionStorage.getItem(SERVICE_KEY);
        if (saved && values.includes(saved)) svc = saved;
      } catch {
        /* storage unavailable */
      }
    }
    if (svc) {
      setForm((f) => ({ ...f, service: svc as string }));
      try {
        sessionStorage.setItem(SERVICE_KEY, svc);
      } catch {
        /* ignore */
      }
    }
  }, [presetService, values]);

  const setField = (k: keyof Form, v: string) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (touched[k]) {
      const ne = validateConsultation(next, values);
      setErrors((e) => {
        const copy = { ...e };
        if (ne[k] && !(k === 'phone' && !next.phone)) copy[k] = ne[k];
        else delete copy[k];
        return copy;
      });
    }
    if (k === 'service') {
      try {
        sessionStorage.setItem(SERVICE_KEY, v);
      } catch {
        /* ignore */
      }
    }
  };

  const blurField = (k: keyof Form) => {
    setTouched((t) => ({ ...t, [k]: true }));
    const ne = validateConsultation(form, values);
    setErrors((e) => {
      const copy = { ...e };
      if (ne[k] && !(k === 'phone' && !form.phone)) copy[k] = ne[k];
      else delete copy[k];
      return copy;
    });
  };

  const focusFirst = (errs: FormErrors) => {
    const first = FIELD_ORDER.find((k) => errs[k]);
    if (first) setTimeout(() => document.getElementById(`f-${first}`)?.focus(), 0);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;
    if (form.website) return; // honeypot — silently ignore bots

    const errs = validateConsultation(form, values);
    const n = Object.keys(errs).length;
    if (n) {
      const all: Partial<Record<keyof Form, boolean>> = {};
      FIELD_ORDER.forEach((k) => (all[k] = true));
      setTouched(all);
      setErrors(errs);
      const msg = errorSummary(n);
      setSummary(msg);
      setLive(msg);
      focusFirst(errs);
      return;
    }

    requestId.current = requestId.current || newRequestId();
    setStatus('submitting');
    setSummary('');
    setServerMsg('');
    setLive('Sending your request…');
    try {
      const res = await api<{ reference: string }>('/inquiries', {
        method: 'POST',
        headers: { 'Idempotency-Key': requestId.current },
        body: {
          clientRequestId: requestId.current,
          fullName: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          company: form.company.trim(),
          phone: form.phone.trim() || null,
          serviceInterest: form.service,
          challenge: form.challenge.trim(),
          preferredContact: form.contact || null,
          website: form.website,
        },
      });
      try {
        sessionStorage.removeItem(SERVICE_KEY);
      } catch {
        /* ignore */
      }
      requestId.current = null;
      setReference(res.reference);
      setForm(EMPTY);
      setTouched({});
      setErrors({});
      setStatus('success');
      setLive('Your consultation request has been received.');
    } catch (err) {
      const ce = err as ClientApiError;
      // Server-side validation → show inline like client validation
      if (ce.status === 400 && ce.errors && Object.keys(ce.errors).length) {
        const fieldErrs: FormErrors = {};
        for (const [k, v] of Object.entries(ce.errors)) {
          const key = (k === 'contactMethod' ? 'contact' : k) as keyof Form;
          fieldErrs[key] = v;
        }
        setErrors(fieldErrs);
        setStatus('idle');
        const msg = ce.message || errorSummary(Object.keys(fieldErrs).length);
        setSummary(msg);
        setLive(msg);
        focusFirst(fieldErrs);
        return;
      }
      setServerMsg(ce.message);
      setStatus('error');
      setLive('We couldn’t send your request. Your details are still in the form.');
    }
  };

  const fieldProps = (k: keyof Form, help?: string) => {
    const err = errors[k];
    const describedBy = [help, err ? `f-${k}-err` : ''].filter(Boolean).join(' ') || undefined;
    return {
      id: `f-${k}`,
      name: k,
      value: form[k],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setField(k, e.target.value),
      onBlur: () => blurField(k),
      'aria-invalid': err ? (true as const) : undefined,
      'aria-describedby': describedBy,
      className: 'control',
    };
  };

  const FieldError = ({ k }: { k: keyof Form }): JSX.Element | null =>
    errors[k] ? (
      <p id={`f-${k}-err`} className="field-err">
        <span aria-hidden="true">!</span>
        {errors[k]}
      </p>
    ) : null;

  const submitting = status === 'submitting';

  return (
    <div className="form-card">
      <div aria-live="polite" role="status" className="sr-only">
        {live}
      </div>

      {status === 'success' ? (
        <SuccessCard
          title="Thank you for contacting Pierce Consulting Group. Your consultation request has been received."
          reference={reference}
          actions={[
            { label: 'Return to Home', href: '/' },
            { label: 'Review Our Services', href: '/services', variant: 'secondary' },
            {
              label: 'Send another enquiry',
              variant: 'text',
              onClick: () => {
                setStatus('idle');
                setLive('');
                setReference(null);
              },
            },
          ]}
        >
          <p className="body" style={{ lineHeight: 1.65 }}>
            We&apos;ll review the details you shared and reply using your preferred contact method. No meeting has been scheduled yet.
          </p>
        </SuccessCard>
      ) : (
        <form onSubmit={submit} noValidate aria-labelledby="form-h" className="form">
          <div className="flex-wrap" style={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
            <h2 id="form-h" style={{ margin: 0, fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 24, color: 'var(--ink)' }}>
              Consultation request
            </h2>
            <span className="small">* Required</span>
          </div>

          {status === 'error' && (
            <div role="alert" className="alert-err">
              <strong>We couldn&apos;t send your request.</strong>
              <p>
                {serverMsg && serverMsg !== 'Network error — check your connection and try again.' ? `${serverMsg} ` : ''}
                Your details are still here. Please try again{email ? ', or email ' : '.'}
                {email && (
                  <>
                    <a href={mailHref || undefined} style={{ overflowWrap: 'anywhere' }}>
                      {email}
                    </a>{' '}
                    directly.
                  </>
                )}
              </p>
            </div>
          )}
          {summary && Object.keys(errors).length > 0 && <p className="err-summary">{summary}</p>}

          <div className="form-grid">
            <div className="field">
              <label htmlFor="f-name">Full name *</label>
              <input type="text" autoComplete="name" required maxLength={120} {...fieldProps('name')} />
              <FieldError k="name" />
            </div>
            <div className="field">
              <label htmlFor="f-email">Business email *</label>
              <input type="email" autoComplete="email" inputMode="email" required maxLength={254} {...fieldProps('email')} />
              <FieldError k="email" />
            </div>
            <div className="field">
              <label htmlFor="f-company">Company name *</label>
              <input type="text" autoComplete="organization" required maxLength={160} {...fieldProps('company')} />
              <FieldError k="company" />
            </div>
            <div className="field">
              <label htmlFor="f-phone">
                Phone number <span className="opt">(optional)</span>
              </label>
              <input type="tel" autoComplete="tel" inputMode="tel" maxLength={40} {...fieldProps('phone')} />
              <FieldError k="phone" />
            </div>
          </div>

          <div className="field">
            <label htmlFor="f-service">Service interest *</label>
            <select required {...fieldProps('service', 'f-service-help')}>
              <option value="">Select a service</option>
              {options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p id="f-service-help" className="help">
              Choose “Other / Not sure yet” if you&apos;d prefer to talk it through.
            </p>
            <FieldError k="service" />
          </div>

          <div className="field">
            <label htmlFor="f-challenge">Business challenge *</label>
            <textarea rows={6} required maxLength={4000} {...fieldProps('challenge', 'f-challenge-help')} />
            <div className="help" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span id="f-challenge-help">A few sentences on the situation and what you&apos;d like to achieve.</span>
              <span aria-hidden="true">{form.challenge.length} / 4000</span>
            </div>
            <FieldError k="challenge" />
          </div>

          <fieldset className="field" style={{ margin: 0, padding: 0, border: 0, gap: 10 }}>
            <legend style={{ marginBottom: 10, padding: 0 }}>
              Preferred contact method <span className="opt">(optional)</span>
            </legend>
            <div className="flex-wrap" style={{ gap: 10 }}>
              {(
                [
                  ['email', 'Email'],
                  ['phone', 'Phone'],
                ] as const
              ).map(([v, l]) => (
                <label key={v} className={`radio-opt${form.contact === v ? ' is-on' : ''}`}>
                  <input type="radio" name="contactMethod" value={v} checked={form.contact === v} onChange={() => setField('contact', v)} />
                  {l}
                </label>
              ))}
            </div>
            <FieldError k="contact" />
          </fieldset>

          <div aria-hidden="true" className="honeypot">
            <label htmlFor="f-website">Website</label>
            <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setField('website', e.target.value)} />
          </div>

          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--muted)' }}>
            We use these details only to respond to your enquiry. See our <Link href="/privacy">Privacy Policy</Link>.
          </p>

          <button
            type="submit"
            className="btn btn-dark"
            disabled={submitting}
            aria-disabled={submitting}
            style={{ minHeight: 54, padding: '0 28px', fontSize: 16, gap: 12, background: submitting ? 'var(--muted)' : undefined, opacity: 1 }}
          >
            {submitting && <span className="spinner" aria-hidden="true" />}
            {submitting ? 'Sending…' : status === 'error' ? 'Try Again' : 'Send Consultation Request'}
          </button>
        </form>
      )}
    </div>
  );
}
