'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { HeroFocus } from '@/lib/types';
import { usePrefersReducedMotion } from '@/lib/hooks';

const ROTATE_MS = 7000;

export function Hero({ areas, rotate }: { areas: HeroFocus[]; rotate: boolean }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const reduced = usePrefersReducedMotion();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = areas.length;
  const canRotate = rotate && !reduced && count > 1;

  useEffect(() => {
    if (!canRotate || paused || hover) return;
    const t = setInterval(() => {
      if (!document.hidden) setIdx((i) => (i + 1) % count);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [canRotate, paused, hover, count]);

  const select = useCallback((i: number, focus = false) => {
    setIdx(i);
    setPaused(true);
    if (focus) tabRefs.current[i]?.focus();
  }, []);

  const onSpot = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const b = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - b.left}px`);
    el.style.setProperty('--y', `${e.clientY - b.top}px`);
  };

  const onTabKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    select((idx + (e.key === 'ArrowRight' ? 1 : count - 1)) % count, true);
  };

  const focus = areas[idx];

  return (
    <section data-screen-label="Home — Hero" aria-labelledby="home-h1" className="hero" onMouseMove={onSpot}>
      <div aria-hidden="true" className="grid-lines-dark" />
      <div aria-hidden="true" className="hero__spot" />
      <div className="wrap hero__in">
        <div className="hero__meta">
          <span style={{ color: 'var(--gold)' }}>BUSINESS CONSULTING · BOSTON, MASSACHUSETTS</span>
          <span style={{ color: 'var(--on-dark-2)' }}>42.3601° N — 71.0589° W</span>
        </div>
        <h1 id="home-h1" className="h-hero hero__h1">
          Make your next business decision with <em>greater clarity.</em>
        </h1>
        <div className="hero__row">
          <div className="hero__copy">
            <p className="hero__lead">
              Pierce Consulting Group works with businesses to evaluate the challenges in front of them, improve how operations run, and plan practical next steps their teams can act on.
            </p>
            <div className="flex-wrap" style={{ gap: 12 }}>
              <Link href="/contact" className="btn btn--lg btn-gold btn--grow">
                Request a Consultation <span aria-hidden="true">→</span>
              </Link>
              <Link href="/services" className="btn btn--lg btn-ghost-light">
                Explore Our Services
              </Link>
            </div>
          </div>

          {count > 0 && focus && (
            <div
              className="hero__map-wrap"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              onFocus={() => setHover(true)}
              onBlur={() => setHover(false)}
            >
              <div role="region" aria-label="Challenge map" className="cmap">
                <div className="cmap__top">
                  <span className="mono-xs" style={{ letterSpacing: '0.16em' }}>
                    CHALLENGE MAP · AREA {focus.num} / {String(count).padStart(2, '0')}
                  </span>
                  {canRotate && (
                    <button
                      type="button"
                      className="cmap__toggle"
                      onClick={() => setPaused((p) => !p)}
                      aria-label={paused ? 'Resume automatic cycling' : 'Pause automatic cycling'}
                    >
                      {paused ? 'PLAY' : 'PAUSE'}
                    </button>
                  )}
                </div>
                <p className="cmap__q">Where is the pressure coming from?</p>
                <div
                  role="tablist"
                  aria-label="Challenge area"
                  onKeyDown={onTabKey}
                  className="cmap__tabs"
                  style={{ gridTemplateColumns: `repeat(${Math.min(count, 3)}, minmax(0,1fr))` }}
                >
                  {areas.map((a, i) => (
                    <button
                      key={a.id}
                      ref={(el) => {
                        tabRefs.current[i] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`hero-tab-${i}`}
                      aria-selected={i === idx}
                      aria-controls="hero-panel"
                      tabIndex={i === idx ? 0 : -1}
                      onClick={() => select(i)}
                      className="cmap__tab"
                    >
                      <span className="n">{a.num}</span>
                      <span className="l">{a.tab}</span>
                    </button>
                  ))}
                </div>
                <div id="hero-panel" role="tabpanel" aria-labelledby={`hero-tab-${idx}`} aria-live="polite" className="col">
                  <ol className="qlist">
                    {focus.questions.map((q, i) => (
                      <li key={i}>
                        <span className="n">{String(i + 1).padStart(2, '0')}</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ol>
                  {focus.serviceTitle && (
                    <Link href={focus.contactHref || '/contact'} className="cmap__link">
                      <span className="col" style={{ gap: 2 }}>
                        <span className="k">OFTEN RELATED TO</span>
                        <span style={{ fontSize: 16, fontWeight: 500 }}>{focus.serviceTitle}</span>
                      </span>
                      <span aria-hidden="true" style={{ fontSize: 20 }}>
                        →
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
