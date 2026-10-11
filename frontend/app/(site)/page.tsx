import Link from 'next/link';
import { getContent, getInsights, getSite } from '@/lib/api';
import { Hero } from '@/components/home/Hero';
import { PrinciplePanels } from '@/components/home/PrinciplePanels';
import { ServicesBento } from '@/components/home/ServicesBento';
import { ChallengeExplorer } from '@/components/home/ChallengeExplorer';
import { EngagementStepper } from '@/components/home/EngagementStepper';
import { InsightCard } from '@/components/insights/InsightCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [site, content, insights] = await Promise.all([
    getSite(),
    getContent('hero-focus', 'ticker', 'principle', 'challenge', 'audience', 'stage'),
    getInsights({ limit: 3 }),
  ]);
  const ticker = content.ticker.map((t) => t.label);

  return (
    <>
      <Hero areas={content['hero-focus']} rotate={site.settings.heroRotate} />

      {ticker.length > 0 && (
        <div aria-hidden="true" className="ticker">
          <div className="ticker__row">
            {[...ticker, ...ticker].map((t, i) => (
              <span key={i} className="ticker__item">
                {t}
                <span>◆</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* §01 Proposition */}
      <section data-screen-label="Home — Proposition" aria-labelledby="prop-h" className="bg-paper">
        <div className="wrap sec--lg col" style={{ gap: 48 }}>
          <span className="eyebrow">§ 01 — THE PROPOSITION</span>
          <div className="prop__row">
            <h2 id="prop-h" className="h-xl" style={{ flex: '2 1 560px' }}>
              A clearer view of the <span className="outline-text">business</span> in front of you.
            </h2>
            <p className="prop__p">
              Most organizations don&apos;t lack effort. They lack a shared, explicit picture of what matters most and why. We help leadership build that picture — then turn it into decisions the business can carry forward.
            </p>
          </div>
          <PrinciplePanels items={content.principle} />
        </div>
      </section>

      {/* §02 Services */}
      <section data-screen-label="Home — Services" aria-labelledby="home-services-h" className="bg-white">
        <div className="wrap sec">
          <div className="sec-head">
            <div className="sec-head__l">
              <span className="eyebrow">§ 02 — CONSULTING SERVICES</span>
              <h2 id="home-services-h" className="h-section">
                {site.services.length === 3 ? 'Three ways' : 'Ways'} we help a business move forward.
              </h2>
            </div>
            <Link href="/services" className="link-u">
              View All Services <span aria-hidden="true">→</span>
            </Link>
          </div>
          <ServicesBento services={site.services} />
        </div>
      </section>

      {/* §03 Challenges */}
      <section data-screen-label="Home — Challenges" aria-labelledby="home-chal-h" className="bg-paper">
        <div className="wrap sec">
          <div className="sec-head">
            <div className="sec-head__l">
              <span className="eyebrow">§ 03 — CHALLENGES WE HELP EXPLORE</span>
              <h2 id="home-chal-h" className="h-section">
                Situations a business may recognize.
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--muted)', maxWidth: '36ch' }}>
              Select one to see the service it most often relates to. A starting point for conversation — not an assessment.
            </p>
          </div>
          <ChallengeExplorer items={content.challenge} />
        </div>
      </section>

      {/* §04 Audiences */}
      {content.audience.length > 0 && (
        <section data-screen-label="Home — Who we work with" aria-labelledby="home-who-h" className="bg-white">
          <div className="wrap sec">
            <div className="sec-head" style={{ marginBottom: 40 }}>
              <div className="sec-head__l">
                <span className="eyebrow">§ 04 — WHO WE WORK WITH</span>
                <h2 id="home-who-h" className="h-section">
                  Built for the people who make the call.
                </h2>
              </div>
            </div>
            <div className="aud">
              {content.audience.map((a) => (
                <Link key={a.id} href="/services">
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, opacity: 0.7 }}>{a.num}</span>
                  <span className="flex-wrap" style={{ alignItems: 'baseline', gap: '6px 28px' }}>
                    <span className="aud__t">{a.title}</span>
                    <span style={{ fontSize: 15, opacity: 0.8, maxWidth: '34ch' }}>{a.note}</span>
                  </span>
                  <span aria-hidden="true" style={{ fontSize: 22 }}>
                    →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* §05 Process */}
      {content.stage.length > 0 && (
        <section data-screen-label="Home — Process" aria-labelledby="home-proc-h" className="bg-ink" style={{ position: 'relative', overflow: 'hidden' }}>
          <div aria-hidden="true" className="grid-lines-dark" />
          <div className="wrap sec" style={{ position: 'relative' }}>
            <div className="sec-head" style={{ marginBottom: 0 }}>
              <div className="sec-head__l">
                <span className="eyebrow eyebrow--gold">§ 05 — HOW AN ENGAGEMENT BEGINS</span>
                <h2 id="home-proc-h" className="h-section" style={{ color: 'inherit' }}>
                  What happens after you get in touch.
                </h2>
              </div>
              <Link href="/approach" className="link-u" style={{ color: 'var(--paper)' }}>
                Learn About Our Approach <span aria-hidden="true">→</span>
              </Link>
            </div>
            <EngagementStepper stages={content.stage} />
          </div>
        </section>
      )}

      {/* Insights preview */}
      <section data-screen-label="Home — Insights" aria-labelledby="home-ins-h" className="bg-paper">
        <div className="wrap" style={{ paddingTop: 'clamp(56px,7vw,88px)', paddingBottom: 'clamp(56px,7vw,88px)' }}>
          <div className="flex-wrap" style={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 20, paddingBottom: 24, borderBottom: '1px solid var(--ink)' }}>
            <h2 id="home-ins-h" style={{ margin: 0, fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 'clamp(28px,3vw,40px)', letterSpacing: '-0.025em', color: 'var(--ink)' }}>
              Insights
            </h2>
            <Link href="/insights" className="link-u">
              Visit Insights →
            </Link>
          </div>
          {insights.items.length > 0 ? (
            <div className="cards3">
              {insights.items.map((i) => (
                <InsightCard key={i.id} item={i} />
              ))}
            </div>
          ) : (
            <div className="flex-wrap" style={{ justifyContent: 'space-between', gap: 16, padding: '28px 0', alignItems: 'center' }}>
              <p className="lead" style={{ maxWidth: '60ch', lineHeight: 1.6 }}>
                Practical perspectives on strategy, operations, and process will be published here.
              </p>
              <span className="pill-tag">FORTHCOMING</span>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
