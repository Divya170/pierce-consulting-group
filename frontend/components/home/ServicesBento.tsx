import Link from 'next/link';
import type { PublicService } from '@/lib/types';

/** Home §02. First service = large dark card, second = gold, the rest = sand. */
export function ServicesBento({ services }: { services: PublicService[] }) {
  if (!services.length) {
    return (
      <div className="bento">
        <Link href="/contact?service=other" className="bento__cta">
          <span style={{ fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 'clamp(20px,2vw,26px)', letterSpacing: '-0.015em' }}>
            Service details are being finalized. Start with the situation, not the service.
          </span>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Talk it through →</span>
        </Link>
      </div>
    );
  }
  const [first, ...rest] = services;
  return (
    <div className="bento">
      <Link href={`/services/${first.slug}`} className="bento__card bento__big">
        <div aria-hidden="true" className="bento__deco">
          <i style={{ left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(247,245,239,.3)' }} />
          <i style={{ top: '50%', left: 0, right: 0, height: 1, background: 'rgba(247,245,239,.3)' }} />
          <i style={{ left: '24%', top: '22%', width: 14, height: 14, borderRadius: '50%', background: 'var(--gold)', boxShadow: '0 0 0 8px rgba(201,176,127,.18)' }} />
          <i style={{ left: '70%', top: '30%', width: 10, height: 10, borderRadius: '50%', border: '1px solid var(--paper)' }} />
          <i style={{ left: '36%', top: '68%', width: 10, height: 10, borderRadius: '50%', border: '1px solid var(--paper)' }} />
          <i style={{ left: '74%', top: '74%', width: 10, height: 10, borderRadius: '50%', border: '1px solid var(--paper)' }} />
        </div>
        <span style={{ position: 'relative', fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--gold)' }}>
          {first.num} / {first.kicker}
        </span>
        <div className="col" style={{ position: 'relative', gap: 18 }}>
          <span className="bento__title-lg">{first.title}</span>
          <span style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--on-dark)', maxWidth: '42ch' }}>{first.summary || first.purpose}</span>
          {first.focusAreas.length > 0 && (
            <span className="flex-wrap" style={{ gap: 8 }}>
              {first.focusAreas.map((f) => (
                <span key={f} className="chip">
                  {f}
                </span>
              ))}
            </span>
          )}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 15, fontWeight: 600, color: 'var(--gold)' }}>
            Explore Service <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>

      {rest.map((s, i) => {
        const gold = i === 0;
        return (
          <Link key={s.slug} href={`/services/${s.slug}`} className={`bento__card ${gold ? 'bento__gold' : 'bento__sand'}`}>
            <div className="flex-wrap" style={{ justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: gold ? undefined : 'var(--bronze)' }}>
                {s.num} / {s.kicker}
              </span>
              {gold ? <FlowDeco /> : <TagDeco />}
            </div>
            <div className="col" style={{ gap: 12 }}>
              <span className="bento__title">{s.title}</span>
              <span style={{ fontSize: 16, lineHeight: 1.55, maxWidth: '44ch', color: gold ? undefined : 'var(--text-2)' }}>{s.summary || s.purpose}</span>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Explore Service →</span>
            </div>
          </Link>
        );
      })}

      <Link href="/contact?service=other" className="bento__cta">
        <span style={{ fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 'clamp(20px,2vw,26px)', letterSpacing: '-0.015em' }}>
          Not sure which fits? Start with the situation, not the service.
        </span>
        <span style={{ fontSize: 15, fontWeight: 600 }}>Talk it through →</span>
      </Link>
    </div>
  );
}

function FlowDeco() {
  const ring = { width: 10, height: 10, border: '1px solid var(--ink)', borderRadius: '50%' } as const;
  const line = { flex: 1, height: 1, background: 'var(--ink)' } as const;
  return (
    <span aria-hidden="true" style={{ display: 'flex', alignItems: 'center', flex: '0 1 200px' }}>
      <span style={ring} />
      <span style={line} />
      <span style={{ width: 18, height: 18, border: '1px dashed var(--ink)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ width: 6, height: 6, background: 'var(--ink)', borderRadius: '50%' }} />
      </span>
      <span style={line} />
      <span style={ring} />
    </span>
  );
}

function TagDeco() {
  const tags = ['MAP', 'ASSESS', 'SIMPLIFY', 'SUSTAIN'];
  return (
    <span aria-hidden="true" style={{ display: 'flex', gap: 4, fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '0.08em' }}>
      {tags.map((t, i) => (
        <span
          key={t}
          style={{ padding: '5px 7px', border: '1px solid var(--ink)', ...(i === tags.length - 1 ? { background: 'var(--ink)', color: 'var(--paper)' } : {}) }}
        >
          {t}
        </span>
      ))}
    </span>
  );
}
