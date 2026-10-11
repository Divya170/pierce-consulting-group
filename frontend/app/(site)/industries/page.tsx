import type { Metadata } from 'next';
import Link from 'next/link';
import { getContent } from '@/lib/api';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { AreaQuestions } from '@/components/industries/AreaQuestions';
import { TemplateBanner } from '@/components/site/TemplateBanner';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Industries' };

export default async function IndustriesPage() {
  const c = await getContent('industry-area', 'industry', 'cross-challenge');
  const industries = c.industry;
  const hasSamples = industries.some((i) => i.isSample);

  return (
    <>
      <Breadcrumbs items={[{ label: 'Industries' }]} />
      <section data-screen-label="Industries — Hero" aria-labelledby="ind-h1" className="wrap-n page-hero flex-wrap" style={{ paddingBottom: 'clamp(64px,8vw,104px)', gap: 'clamp(40px,6vw,88px)', alignItems: 'center' }}>
        <div className="col min0" style={{ flex: '1.2 1 480px', gap: 24 }}>
          <span className="eyebrow">INDUSTRIES</span>
          <h1 id="ind-h1" className="h-page">
            Business challenges are specific. <em style={{ fontWeight: 400 }}>The right questions matter.</em>
          </h1>
          <p className="lead" style={{ maxWidth: '54ch' }}>
            Every organization operates within its own market, constraints, and history. Rather than start from a sector template, we start by understanding yours.
          </p>
        </div>
        <AreaQuestions areas={c['industry-area']} />
      </section>

      <section data-screen-label="Industries — Directory" aria-labelledby="ind-dir-h" className="bg-white bordered-y">
        <div className="wrap-n sec--sm">
          {industries.length > 0 ? (
            <div className="col" style={{ gap: 12 }}>
              {hasSamples && <TemplateBanner>sample entries show the layout only. Replace with industries approved by the business.</TemplateBanner>}
              <h2 id="ind-dir-h" className="h-3" style={{ marginBottom: 24 }}>
                Industries
              </h2>
              <div style={{ borderTop: '1px solid var(--ink)' }}>
                {industries.map((ind) => (
                  <article key={ind.id} className="flex-wrap" style={{ gap: '12px 48px', padding: '28px 0', borderBottom: '1px solid var(--line)' }}>
                    <h3 style={{ flex: '1 1 240px', margin: 0, fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 24, color: 'var(--ink)' }}>{ind.name}</h3>
                    <p style={{ flex: '2 1 360px', margin: 0, fontSize: 16, lineHeight: 1.6, color: 'var(--text-2)' }}>{ind.desc}</p>
                    {ind.serviceTitle && (
                      <Link href={ind.serviceHref || '/services'} className="link-plain" style={{ flex: '0 1 auto' }}>
                        {ind.serviceTitle} →
                      </Link>
                    )}
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-wrap" style={{ gap: '32px 80px', alignItems: 'flex-start' }}>
              <h2 id="ind-dir-h" className="h-3" style={{ flex: '1 1 380px' }}>
                Tell us about your industry, and the challenge in front of you.
              </h2>
              <div className="col min0" style={{ flex: '1 1 380px', gap: 20 }}>
                <p className="body" style={{ maxWidth: '56ch' }}>
                  An initial conversation is the best way to establish whether our services are relevant to your organization. Share your sector, the context you operate in, and what you&apos;d like to work through.
                </p>
                <Link href="/contact" className="btn btn-dark btn--self">
                  Discuss Your Industry and Needs
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {c['cross-challenge'].length > 0 && (
        <section data-screen-label="Industries — Cross-industry" aria-labelledby="ind-x-h" className="wrap-n sec--sm">
          <div className="col" style={{ gap: 16, marginBottom: 40, maxWidth: 720 }}>
            <span className="eyebrow">GENERAL BUSINESS CHALLENGES</span>
            <h2 id="ind-x-h" className="h-3">
              Questions that arise across sectors.
            </h2>
          </div>
          <div className="flex-wrap" style={{ borderTop: '1px solid var(--ink)' }}>
            {c['cross-challenge'].map((x) => (
              <article key={x.id} className="col min0" style={{ flex: '1 1 300px', padding: '28px 28px 32px 0', gap: 14, borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--bronze)' }}>{x.num}</span>
                <h3 className="h-card">{x.title}</h3>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--text-2)', maxWidth: '40ch' }}>{x.text}</p>
                {x.serviceTitle && (
                  <Link href={x.serviceHref || '/services'} className="link-plain">
                    {x.serviceTitle} →
                  </Link>
                )}
              </article>
            ))}
          </div>
          <Link href="/contact" className="btn btn-outline" style={{ marginTop: 40 }}>
            Discuss Your Industry and Needs
          </Link>
        </section>
      )}
    </>
  );
}
