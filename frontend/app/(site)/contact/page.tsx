import type { Metadata } from 'next';
import { getContent, getSite } from '@/lib/api';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { ConsultationForm } from '@/components/contact/ConsultationForm';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Request a Consultation' };

export default async function ContactPage({ searchParams }: { searchParams: { service?: string } }) {
  const [site, c] = await Promise.all([getSite(), getContent('next-step')]);
  const s = site.settings;
  const options = [...site.services.map((x) => ({ value: x.slug, label: x.title })), { value: 'other', label: 'Other / Not sure yet' }];

  return (
    <>
      <Breadcrumbs items={[{ label: 'Request a Consultation' }]} />
      <section data-screen-label="Contact" aria-labelledby="contact-h1" className="wrap-n page-hero flex-wrap" style={{ paddingBottom: 'clamp(72px,9vw,120px)', gap: '48px clamp(40px,6vw,96px)', alignItems: 'flex-start' }}>
        <div className="col min0" style={{ flex: '1 1 380px', gap: 28 }}>
          <span className="eyebrow">REQUEST A CONSULTATION</span>
          <h1 id="contact-h1" className="h-page" style={{ fontSize: 'clamp(38px,4.6vw,58px)', lineHeight: 1.05, letterSpacing: '-0.03em' }}>
            Tell us what your business is working through.
          </h1>
          <p className="lead" style={{ maxWidth: '50ch' }}>
            Share a little about your business and the challenge you would like to discuss. We&apos;ll use this information to understand your enquiry and determine an appropriate next step.
          </p>
          {c['next-step'].length > 0 && (
            <ol className="qlist" style={{ borderTopColor: 'var(--ink)' }}>
              {c['next-step'].map((n) => (
                <li key={n.id} style={{ gridTemplateColumns: '40px minmax(0,1fr)', gap: 12, padding: '16px 0', fontSize: 15, lineHeight: 1.55, color: 'var(--text)' }}>
                  <span className="n" style={{ fontSize: 12, paddingTop: 2 }}>
                    {n.num}
                  </span>
                  <span>{n.text}</span>
                </li>
              ))}
            </ol>
          )}
          <dl className="dl" style={{ gap: '14px 24px' }}>
            <dt>CONTACT</dt>
            <dd>{s.contactName}</dd>
            {s.email && (
              <>
                <dt>EMAIL</dt>
                <dd>
                  <a href={s.mailHref || undefined}>{s.email}</a>
                </dd>
              </>
            )}
            {s.phone && (
              <>
                <dt>PHONE</dt>
                <dd>
                  <a href={s.telHref || undefined}>{s.phone}</a>
                </dd>
              </>
            )}
            {s.showAddress && s.address && (
              <>
                <dt>OFFICE</dt>
                <dd>{s.address}</dd>
              </>
            )}
          </dl>
        </div>
        <ConsultationForm options={options} presetService={searchParams.service || null} email={s.email} mailHref={s.mailHref} />
      </section>
    </>
  );
}
