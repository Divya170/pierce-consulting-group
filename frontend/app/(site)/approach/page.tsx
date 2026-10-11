import type { Metadata } from 'next';
import Link from 'next/link';
import { getContent } from '@/lib/api';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { StageNodes } from '@/components/approach/StageNodes';
import { FaqAccordion } from '@/components/approach/FaqAccordion';
import type { ApproachPrinciple } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Our Approach' };

const MARKS: Record<ApproachPrinciple['mark'], { w: number; h: number; r: string }> = {
  circle: { w: 20, h: 20, r: '50%' },
  wide: { w: 22, h: 10, r: '0' },
  tall: { w: 14, h: 22, r: '0' },
  square: { w: 20, h: 20, r: '0' },
};

export default async function ApproachPage() {
  const c = await getContent('stage', 'approach-principle', 'expectation', 'faq');

  return (
    <>
      <Breadcrumbs items={[{ label: 'Our Approach' }]} />
      <section data-screen-label="Approach — Hero" aria-labelledby="app-h1" className="wrap-n page-hero" style={{ paddingBottom: 'clamp(64px,8vw,104px)' }}>
        <span className="eyebrow">OUR APPROACH</span>
        <h1 id="app-h1" className="h-page h-page--lg" style={{ marginTop: 22, maxWidth: '15ch' }}>
          A clear process. A focused conversation. <em style={{ fontWeight: 400 }}>Practical next steps.</em>
        </h1>
        <div className="flex-wrap" style={{ gap: '32px 80px', marginTop: 40, alignItems: 'flex-end' }}>
          <p className="lead" style={{ flex: '1 1 380px', maxWidth: '54ch' }}>
            How we work matters as much as what we recommend. Each engagement is shaped around your situation, with clear communication about scope and next steps at every stage.
          </p>
          <Link href="/contact" className="btn btn-dark">
            Start a Conversation
          </Link>
        </div>
        <StageNodes stages={c.stage} />
      </section>

      {c['approach-principle'].length > 0 && (
        <section data-screen-label="Approach — Principles" aria-labelledby="app-pr-h" className="bg-white bordered-y">
          <div className="wrap-n sec--md">
            <h2 id="app-pr-h" className="h-2" style={{ marginBottom: 40 }}>
              Working principles
            </h2>
            <div className="pgrid">
              {c['approach-principle'].map((p, i) => {
                const m = MARKS[p.mark] || MARKS.square;
                return (
                  <article key={p.id} style={{ background: i % 3 === 0 ? 'var(--paper)' : '#fff' }}>
                    <div aria-hidden="true" className="pmark">
                      <span style={{ width: m.w, height: m.h, borderRadius: m.r }} />
                    </div>
                    <h3 className="h-card">{p.title}</h3>
                    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--text-2)' }}>{p.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {c.stage.length > 0 && (
        <section data-screen-label="Approach — Stages" aria-labelledby="app-st-h" className="stages-sec">
          <div aria-hidden="true" className="grid-lines-dark" />
          <div className="wrap-n sec--md stages-wrap">
            <div className="stages-intro min0">
              <span className="eyebrow eyebrow--gold">ENGAGEMENT STAGES</span>
              <h2 id="app-st-h" className="h-2">
                {c.stage.length === 4 ? 'Four stages' : 'Stages'}, shaped around <em>your needs.</em>
              </h2>
              <p>
                The exact scope and sequence of any engagement depend on the client&apos;s situation. Not every enquiry moves through every stage.
              </p>
              <Link href="/contact" className="btn btn-gold btn--self">
                Start with stage 01
              </Link>
            </div>
            <ol className="stages min0">
              {c.stage.map((s) => (
                <li key={s.id} className="stage">
                  <span aria-hidden="true" className="stage__node" />
                  <article className="stage__card">
                    <header className="stage__head">
                      <span className="stage__num">{s.num}</span>
                      <div className="col min0" style={{ gap: 6 }}>
                        <h3 className="stage__title">{s.title}</h3>
                        {s.short && <p className="stage__short">{s.short}</p>}
                      </div>
                    </header>
                    {s.points.length > 0 && (
                      <ul className="stage__points">
                        {s.points.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    )}
                  </article>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <section data-screen-label="Approach — Expectations" aria-labelledby="app-ex-h" className="bg-sand">
        <div className="wrap-n sec--md flex-wrap" style={{ gap: 'clamp(40px,6vw,88px)', alignItems: 'center' }}>
          <div className="img-box min0" style={{ flex: '1 1 380px', aspectRatio: '4/3', background: 'var(--sand-2)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/team-roundtable.jpg" alt="Four colleagues in conversation around a round table with laptops and notes" loading="lazy" />
          </div>
          <div className="col min0" style={{ flex: '1 1 380px', gap: 24 }}>
            <h2 id="app-ex-h" className="h-2">
              What clients can expect
            </h2>
            <ul className="checklist">
              {c.expectation.map((e) => (
                <li key={e.id}>
                  <span aria-hidden="true" style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--bronze)', paddingTop: 3 }}>
                    ✓
                  </span>
                  <span>{e.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section data-screen-label="Approach — FAQ" aria-labelledby="faq-h" className="wrap-n sec--md flex-wrap" style={{ gap: 'clamp(40px,6vw,96px)' }}>
        <div className="col min0" style={{ flex: '1 1 300px', gap: 20 }}>
          <span className="eyebrow">FREQUENTLY ASKED</span>
          <h2 id="faq-h" className="h-2">
            Questions before a first conversation.
          </h2>
          <Link href="/contact" className="btn btn-dark btn--self">
            Request a Consultation
          </Link>
        </div>
        <FaqAccordion items={c.faq} />
      </section>
    </>
  );
}
