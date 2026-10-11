'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Challenge } from '@/lib/types';

export function ChallengeExplorer({ items }: { items: Challenge[] }) {
  const [active, setActive] = useState(0);
  if (!items.length) return <p className="lead">Challenge examples will be published here.</p>;
  const ch = items[Math.min(active, items.length - 1)];
  return (
    <div className="chal">
      <div id="challenge-detail" aria-live="polite" className="chal__detail">
        <span aria-hidden="true" className="chal__num">
          {ch.num}
        </span>
        <h3 style={{ margin: 0, fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 'clamp(26px,2.6vw,36px)', lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          {ch.title}
        </h3>
        <p className="lead" style={{ maxWidth: '48ch' }}>
          {ch.desc}
        </p>
        <div className="flex-wrap" style={{ gap: 12, marginTop: 8 }}>
          <Link href={ch.contactHref || '/contact'} className="btn btn-dark" style={{ minHeight: 52, gap: 12 }}>
            Discuss Your Business Challenge <span aria-hidden="true">→</span>
          </Link>
          {ch.serviceTitle && (
            <Link href={ch.serviceHref || '/services'} className="btn btn-outline" style={{ minHeight: 52, padding: '0 20px' }}>
              {ch.serviceTitle}
            </Link>
          )}
        </div>
      </div>
      <div role="group" aria-label="Business challenges" className="chal__list">
        {items.map((c, i) => (
          <button key={c.id} type="button" onClick={() => setActive(i)} aria-pressed={i === active} aria-controls="challenge-detail" className="chal__btn">
            <span className="n">{c.num}</span>
            <span>{c.title}</span>
            <span aria-hidden="true" className="m">
              {i === active ? '→' : ''}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
