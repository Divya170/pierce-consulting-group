import type { Metadata } from 'next';
import Link from 'next/link';
import { getInsight } from '@/lib/api';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { TemplateBanner } from '@/components/site/TemplateBanner';
import { formatDate } from '@/lib/format';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const a = await getInsight(params.slug).catch(() => null);
  return a ? { title: a.title, description: a.excerpt } : { title: 'Article not available' };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getInsight(params.slug);

  if (!article) {
    return (
      <>
        <Breadcrumbs items={[{ label: 'Insights', href: '/insights' }, { label: 'Article' }]} />
        <article data-screen-label="Article" className="wrap-n page-hero" style={{ paddingBottom: 'clamp(64px,8vw,104px)' }}>
          <h1 style={{ margin: '0 0 16px', fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 40, color: 'var(--ink)' }}>This article isn&apos;t available.</h1>
          <Link href="/insights" style={{ fontSize: 16 }}>
            Return to Insights
          </Link>
        </article>
      </>
    );
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Insights', href: '/insights' }, { label: article.title }]} />
      <article data-screen-label="Article" className="wrap-n page-hero" style={{ paddingBottom: 'clamp(64px,8vw,104px)' }}>
        {article.isSample && <TemplateBanner>sample text, not a company publication.</TemplateBanner>}
        <header className="col" style={{ maxWidth: 860, gap: 20 }}>
          <span className="eyebrow" style={{ letterSpacing: '0.12em' }}>
            {article.category}
          </span>
          <h1 style={{ margin: 0, fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 'clamp(36px,4.8vw,60px)', lineHeight: 1.06, letterSpacing: '-0.03em', color: 'var(--ink)', textWrap: 'balance' }}>
            {article.title}
          </h1>
          <p className="lead-italic" style={{ lineHeight: 1.5 }}>
            {article.excerpt}
          </p>
          <div className="flex-wrap" style={{ gap: '8px 24px', padding: '16px 0', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', fontSize: 14, color: 'var(--muted)' }}>
            {article.author && <span>{article.author}</span>}
            <span>Published {article.isSample ? 'date on publish' : formatDate(article.publishedAt).toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}</span>
          </div>
        </header>
        {article.image && (
          <div className="img-box" style={{ marginTop: 40, aspectRatio: '21/9' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.image} alt="" loading="lazy" />
          </div>
        )}
        <div className="flex-wrap" style={{ gap: '48px clamp(40px,6vw,96px)', marginTop: 48 }}>
          <div className="col min0" style={{ flex: '2 1 520px', maxWidth: '68ch', gap: 22 }}>
            {article.body.map((b, i) =>
              b.type === 'h' ? (
                <h2 key={i} style={{ margin: '16px 0 0', fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 28, letterSpacing: '-0.015em', color: 'var(--ink)' }}>
                  {b.text}
                </h2>
              ) : (
                <p key={i} style={{ margin: 0, fontSize: 18, lineHeight: 1.75, color: 'var(--text)', textWrap: 'pretty' }}>
                  {b.text}
                </p>
              ),
            )}
          </div>
          <aside className="col min0" style={{ flex: '1 1 260px', gap: 16, alignSelf: 'flex-start', borderTop: '1px solid var(--ink)', paddingTop: 20 }}>
            {article.serviceTitle && (
              <>
                <span className="mono-xs">RELATED SERVICE</span>
                <Link href={article.serviceHref} style={{ fontFamily: 'var(--f-display)', fontSize: 22, fontWeight: 500, color: 'var(--ink)' }}>
                  {article.serviceTitle} →
                </Link>
              </>
            )}
            <Link href={article.contactHref} className="btn btn-dark" style={{ padding: '0 22px' }}>
              Request a Consultation
            </Link>
            <Link href="/insights" className="link-plain">
              ← All insights
            </Link>
          </aside>
        </div>
      </article>
    </>
  );
}
