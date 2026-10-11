'use client';

import { useState } from 'react';
import type { Stage } from '@/lib/types';

export function StageNodes({ stages }: { stages: Stage[] }) {
  const [idx, setIdx] = useState(0);
  if (!stages.length) return null;
  const cur = stages[Math.min(idx, stages.length - 1)];
  return (
    <div className="col" style={{ marginTop: 56, borderTop: '1px solid rgba(23,36,43,.12)', paddingTop: 28, gap: 24 }}>
      <div role="group" aria-label="Engagement stages" className="ap-nodes">
        {stages.map((s, i) => {
          const last = i === stages.length - 1;
          return (
            <div key={s.id} style={{ flex: last ? 'none' : 1, display: 'flex', alignItems: 'center', minWidth: 0 }}>
              <button type="button" className="ap-node" onClick={() => setIdx(i)} aria-pressed={i === idx} aria-label={`Stage ${s.num}: ${s.title}`}>
                {s.num}
              </button>
              {!last && <span aria-hidden="true" className={`ap-line${i < idx ? ' is-done' : ''}`} />}
            </div>
          );
        })}
      </div>
      <div aria-live="polite" className="flex-wrap" style={{ gap: '8px 32px', alignItems: 'baseline' }}>
        <span style={{ fontFamily: 'var(--f-display)', fontSize: 24, fontWeight: 500, color: 'var(--ink)' }}>
          {cur.num} — {cur.title}
        </span>
        <span style={{ fontSize: 16, color: 'var(--text-2)' }}>{cur.short}</span>
      </div>
    </div>
  );
}
