import type { Metadata } from 'next';
import { getSite } from '@/lib/api';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Privacy Policy' };

export default async function PrivacyPage() {
  const { settings: s } = await getSite();
  const paragraphs = (s.privacyPolicy || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <>
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />
      <section data-screen-label="Privacy" aria-labelledby="priv-h1" className="col" style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(36px,5vw,64px) var(--gutter) clamp(72px,9vw,120px)', gap: 22 }}>
        <h1 id="priv-h1" style={{ margin: 0, fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 'clamp(36px,4.4vw,52px)', letterSpacing: '-0.03em', color: 'var(--ink)' }}>
          Privacy Policy
        </h1>
        {paragraphs.map((p, i) => (
          <p key={i} className="lead" style={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}>
            {p}
          </p>
        ))}
        {s.email && (
          <p className="lead" style={{ lineHeight: 1.7 }}>
            For any question about how your information is handled, contact{' '}
            <a href={s.mailHref || undefined} style={{ overflowWrap: 'anywhere' }}>
              {s.email}
            </a>
            .
          </p>
        )}
      </section>
    </>
  );
}
