'use client';

import { useState } from 'react';
import type { IndustryArea } from '@/lib/types';

export function AreaQuestions({ areas }: { areas: IndustryArea[] }) {
  const [idx, setIdx] = useState(0);
  if (!areas.length) return null;
  const area = areas[Math.min(idx, areas.length - 1)];
  return (
    <div className="col min0" style={{ flex: '1 1 400px', background: '#fff', border: '1px solid var(--line-2)', padding: 'clamp(20px,3vw,32px)', gap: 20 }}>
      <div className="mono-xs flex-wrap" style={{ justifyContent: 'space-between', gap: 12 }}>
        <span>QUESTIONS BY AREA</span>
        <span>FIG. 01</span>
      </div>
      <div role="group" aria-label="Business area" className="flex-wrap" style={{ gap: 8 }}>
        {areas.map((a, i) => (
          <button key={a.id} type="button" className="chipbtn" onClick={() => setIdx(i)} aria-pressed={i === idx}>
            {a.label}
          </button>
        ))}
      </div>
      <ol aria-live="polite" className="qlist qlist--sm">
        {area.questions.map((q, i) => (
          <li key={i}>
            <span className="n" style={{ paddingTop: 3 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            <span>{q}</span>
          </li>
        ))}
      </ol>
      <p className="small">Examples of questions an initial conversation may cover.</p>
    </div>
  );
}
