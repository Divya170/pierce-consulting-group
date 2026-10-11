import Link from 'next/link';
import { getContent, getSite } from '@/lib/api';
import type { ContentBundle, PublicService } from '@/lib/types';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { ServiceStickyNav, ServiceTiles } from './ServiceNav';
import { BeforeAfter, PriorityMatrix, WorkflowFigure } from './Figures';

const ctaBtn = 'btn btn-dark btn--self';

export async function ServicesView({ activeSlug }: { activeSlug: string | null }) {
  const [site, figs] = await Promise.all([getSite(), getContent('matrix-item', 'ops-node', 'process-before', 'process-after')]);
  const services = site.services;
  const active = activeSlug && services.some((s) => s.slug === activeSlug) ? activeSlug : null;

  return (
    <>
      <Breadcrumbs items={[{ label: 'Services' }]} />
      <section data-screen-label="Services — Hero" aria-labelledby="svc-h1" className="wrap-n page-hero">
        <div className="flex-wrap" style={{ gap: '32px 80px', alignItems: 'flex-end', paddingBottom: 48 }}>
          <h1 id="svc-h1" className="h-page" style={{ flex: '1.4 1 520px' }}>
            Practical consulting for the challenges that matter.
          </h1>
          <div className="col min0" style={{ flex: '1 1 340px', gap: 22 }}>
            <p className="lead" style={{ maxWidth: '50ch' }}>
              {serviceAreasLead(services)}
            </p>
            <Link href="/contact" className={ctaBtn}>
              Discuss Your Requirements
            </Link>
          </div>
        </div>
        {services.length > 0 && <ServiceTiles services={services} />}
      </section>

      {services.length === 0 ? (
        <section className="wrap-n sec--sm">
          <div className="state-box">
            <h2 className="h-3">Service details are being finalized.</h2>
            <p className="lead">Share your business challenge and we can begin by understanding what you need.</p>
            <Link href="/contact?service=other" className={ctaBtn}>
              Request a Consultation
            </Link>
          </div>
        </section>
      ) : (
        <>
          <ServiceStickyNav services={services} initial={active} />
          {services.map((s, i) => (
            <ServiceSection key={s.slug} s={s} index={i} figs={figs} />
          ))}
        </>
      )}

      <section data-screen-label="Services — CTA" className="bg-ink">
        <div className="wrap-n flex-wrap" style={{ paddingTop: 'clamp(64px,8vw,104px)', paddingBottom: 'clamp(64px,8vw,104px)', gap: '28px 64px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div className="col min0" style={{ flex: '1 1 480px', gap: 16 }}>
            <h2 style={{ margin: 0, fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 'clamp(30px,3.4vw,44px)', letterSpacing: '-0.025em', lineHeight: 1.1 }}>
              Not sure which service fits your situation?
            </h2>
            <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: 'var(--on-dark)', maxWidth: '52ch' }}>
              Share your business challenge, and we can begin by understanding what you need.
            </p>
          </div>
          <Link href="/contact?service=other" className="btn btn-cream" style={{ minHeight: 52, padding: '0 26px' }}>
            Request a Consultation
          </Link>
        </div>
      </section>
    </>
  );
}

type Figs = ContentBundle<'matrix-item' | 'ops-node' | 'process-before' | 'process-after'>;

const WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];
const SHORT: Record<string, string> = { strategy: 'strategy', operations: 'operations', process: 'process' };

/** "Three service areas — strategy, operations, and process — each scoped around…" */
function serviceAreasLead(services: PublicService[]) {
  if (!services.length) return 'Each engagement is scoped around the specific situation your business is working through.';
  const names = services.map((s) => SHORT[s.slug] || s.title.toLowerCase());
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')}${names.length > 2 ? ',' : ''} and ${names[names.length - 1]}` : names[0];
  const n = WORDS[services.length] || String(services.length);
  return `${n} service area${services.length === 1 ? '' : 's'} — ${list} — each scoped around the specific situation your business is working through.`;
}

function Intro({ s, maxW = '40ch' }: { s: PublicService; maxW?: string }) {
  return (
    <>
      <span className="eyebrow">SERVICE {s.num}</span>
      <h2 id={`svc-${s.slug}-h`} style={{ margin: 0, fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 'clamp(32px,3.6vw,46px)', lineHeight: 1.08, letterSpacing: '-0.025em', color: 'var(--ink)' }}>
        {s.title}
      </h2>
      <p className="lead-italic" style={{ maxWidth: maxW }}>
        {s.purpose}
      </p>
    </>
  );
}

function ServiceSection({ s, index, figs }: { s: PublicService; index: number; figs: Figs }) {
  const cta = (
    <Link href={`/contact?service=${s.slug}`} className={ctaBtn}>
      {s.ctaLabel}
    </Link>
  );

  if (s.visual === 'workflow') {
    return (
      <section id={`svc-${s.slug}`} aria-labelledby={`svc-${s.slug}-h`} className="svc-sec bg-white bordered-y">
        <div className="wrap-n flex-wrap" style={{ flexWrap: 'wrap-reverse', padding: 'clamp(72px,9vw,120px) var(--gutter)', gap: 'clamp(40px,6vw,96px)', alignItems: 'center' }}>
          <WorkflowFigure nodes={figs['ops-node']} />
          <div className="col min0" style={{ flex: '1 1 380px', gap: 22 }}>
            <Intro s={s} />
            <p className="body" style={{ maxWidth: '56ch' }}>
              {s.body}
            </p>
            {s.focusAreas.length > 0 && (
              <ul className="focus-list">
                {s.focusAreas.map((f) => (
                  <li key={f}>
                    <span>{f}</span>
                    <span aria-hidden="true" style={{ color: 'var(--gold-deep)' }}>
                      —
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {cta}
          </div>
        </div>
      </section>
    );
  }

  if (s.visual === 'before-after') {
    return (
      <section id={`svc-${s.slug}`} aria-labelledby={`svc-${s.slug}-h`} className="svc-sec wrap-n" style={{ paddingTop: 'clamp(72px,9vw,120px)', paddingBottom: 'clamp(72px,9vw,120px)' }}>
        <div className="flex-wrap" style={{ gap: '24px 80px', alignItems: 'flex-end', marginBottom: 48 }}>
          <div className="col min0" style={{ flex: '1 1 420px', gap: 22 }}>
            <Intro s={s} maxW="44ch" />
          </div>
          <div className="col min0" style={{ flex: '1 1 380px', gap: 20 }}>
            <p className="body" style={{ maxWidth: '56ch' }}>
              {s.body}
            </p>
            {s.focusAreas.length > 0 && <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}>Focus areas: {s.focusAreas.join(' · ')}</p>}
          </div>
        </div>
        <BeforeAfter before={figs['process-before']} after={figs['process-after']} />
        <div style={{ marginTop: 36 }}>{cta}</div>
      </section>
    );
  }

  // 'matrix' and 'none' share the text + figure row; 'none' alternates row direction and shows the focus grid only
  const reverse = s.visual === 'none' && index % 2 === 1;
  return (
    <section
      id={`svc-${s.slug}`}
      aria-labelledby={`svc-${s.slug}-h`}
      className={`svc-sec ${s.visual === 'none' && index % 2 === 1 ? 'bg-white bordered-y' : ''}`}
    >
      <div className="wrap-n flex-wrap" style={{ padding: 'clamp(72px,9vw,120px) var(--gutter)', gap: 'clamp(40px,6vw,96px)', alignItems: 'center', flexDirection: reverse ? 'row-reverse' : 'row' }}>
        <div className="col min0" style={{ flex: '1 1 420px', gap: 22 }}>
          <Intro s={s} />
          <p className="body" style={{ maxWidth: '56ch' }}>
            {s.body}
          </p>
          {s.focusAreas.length > 0 && (
            <div style={{ borderTop: '1px solid var(--ink)', paddingTop: 18 }}>
              <span className="mono-xs">POTENTIAL FOCUS AREAS</span>
              <ul className="focus-grid">
                {s.focusAreas.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          {cta}
        </div>
        {s.visual === 'matrix' && <PriorityMatrix items={figs['matrix-item']} />}
      </div>
    </section>
  );
}
