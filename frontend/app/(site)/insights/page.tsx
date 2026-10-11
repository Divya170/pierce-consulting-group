import type { Metadata } from 'next';
import Link from 'next/link';
import { getInsights } from '@/lib/api';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { InsightsBrowser } from '@/components/insights/InsightsBrowser';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Insights' };

export default async function InsightsPage({ searchParams }: { searchParams: { category?: string; q?: string } }) {
  const category = (searchParams.category || '').slice(0, 40);
  const q = (searchParams.q || '').slice(0, 100);
  const initial = await getInsights({ category: category || undefined, q: q || undefined, limit: 7 });
  const empty = initial.totalVisible === 0;

  return (
    <>
      <Breadcrumbs items={[{ label: 'Insights' }]} />
      <section data-screen-label="Insights — Hero" aria-labelledby="ins-h1" className="wrap-n page-hero flex-wrap" style={{ paddingBottom: 48, gap: '24px 80px', alignItems: 'flex-end' }}>
        <div className="col min0" style={{ flex: '1.3 1 480px', gap: 22 }}>
          <span className="eyebrow">INSIGHTS</span>
          <h1 id="ins-h1" className="h-page h-page--lg">
            Perspectives for clearer business decisions.
          </h1>
        </div>
        <p className="lead" style={{ flex: '1 1 340px', maxWidth: '48ch' }}>
          Practical writing on strategy, operations, and process — intended to help leaders frame the questions in front of them.
        </p>
      </section>
      <div className="wrap-n">
        <div style={{ borderBottom: '1px solid var(--ink)' }} />
      </div>

      {empty ? (
        <section aria-labelledby="ins-empty-h" className="wrap-n flex-wrap" style={{ paddingTop: 'clamp(56px,7vw,96px)', paddingBottom: 'clamp(72px,9vw,120px)', gap: '40px clamp(40px,6vw,96px)' }}>
          <div className="col min0" style={{ flex: '1 1 380px', gap: 18 }}>
            <span className="eyebrow eyebrow--muted">NO. 00 — FORTHCOMING</span>
            <h2 id="ins-empty-h" className="h-3">
              Articles will be published here.
            </h2>
            <p className="body" style={{ maxWidth: '52ch' }}>
              In the meantime, our services and approach pages describe how we think about strategy, operations, and process.
            </p>
          </div>
          <nav aria-label="Related pages" className="navlist min0" style={{ flex: '1 1 320px', borderTop: '1px solid var(--ink)' }}>
            <Link href="/services">
              Services <span aria-hidden="true">→</span>
            </Link>
            <Link href="/approach">
              Our Approach <span aria-hidden="true">→</span>
            </Link>
            <Link href="/contact">
              Request a Consultation <span aria-hidden="true">→</span>
            </Link>
          </nav>
        </section>
      ) : (
        <InsightsBrowser initial={initial} initialCategory={category} initialQuery={q} />
      )}
    </>
  );
}
