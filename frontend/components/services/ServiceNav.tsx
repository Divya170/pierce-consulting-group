'use client';

import { useEffect, useState } from 'react';
import type { PublicService } from '@/lib/types';

function scrollToService(slug: string, smooth = true) {
  const el = document.getElementById(`svc-${slug}`);
  if (!el) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: smooth && !reduced ? 'smooth' : 'auto', block: 'start' });
}

function go(slug: string) {
  window.history.replaceState(null, '', `/services/${slug}`);
  window.dispatchEvent(new CustomEvent('pcg:service', { detail: slug }));
  scrollToService(slug);
}

/** Summary tiles under the services hero ("Jump to section ↓"). */
export function ServiceTiles({ services }: { services: PublicService[] }) {
  return (
    <div className="tiles">
      {services.map((s) => (
        <button key={s.slug} type="button" className="tile" onClick={() => go(s.slug)}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--bronze)' }}>{s.num}</span>
          <span style={{ fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 500, letterSpacing: '-0.015em', color: 'var(--ink)' }}>{s.title}</span>
          <span style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-2)' }}>{s.purpose}</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--ink)', textDecoration: 'underline', textUnderlineOffset: 3 }}>Jump to section ↓</span>
        </button>
      ))}
    </div>
  );
}

/** Sticky section tabs with scroll-spy. `initial` comes from /services/[slug]. */
export function ServiceStickyNav({ services, initial }: { services: PublicService[]; initial: string | null }) {
  const [current, setCurrent] = useState<string | null>(initial);

  // Deep link: /services/operations → scroll to that section on load
  useEffect(() => {
    if (initial) {
      const t = setTimeout(() => scrollToService(initial, false), 40);
      return () => clearTimeout(t);
    }
  }, [initial]);

  useEffect(() => {
    const onPick = (e: Event) => setCurrent((e as CustomEvent<string>).detail);
    window.addEventListener('pcg:service', onPick);
    const els = services.map((s) => document.getElementById(`svc-${s.slug}`)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (vis) setCurrent(vis.target.id.replace(/^svc-/, ''));
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      window.removeEventListener('pcg:service', onPick);
      io.disconnect();
    };
  }, [services]);

  return (
    <nav aria-label="Service sections" className="svc-nav">
      <div className="wrap-n svc-nav__in">
        {services.map((s) => (
          <button key={s.slug} type="button" className="svc-nav__btn" aria-current={current === s.slug ? 'true' : undefined} onClick={() => go(s.slug)}>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--bronze)' }}>{s.num}</span>
            {s.title}
          </button>
        ))}
      </div>
    </nav>
  );
}
