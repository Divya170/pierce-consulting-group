'use client';

import { useState } from 'react';
import type { Stage } from '@/lib/types';

export function EngagementStepper({ stages }: { stages: Stage[] }) {
  const [step, setStep] = useState(0);
  if (!stages.length) return null;
  const n = stages.length;
  const stage = stages[Math.min(step, n - 1)];
  return (
    <>
      <div className="steps">
        <div aria-hidden="true" className="steps__track" />
        <div aria-hidden="true" className="steps__fill" style={{ transform: `scaleX(${n > 1 ? step / (n - 1) : 1})` }} />
        <div role="tablist" aria-label="Engagement stages" className="steps__grid" style={{ gridTemplateColumns: `repeat(${n}, minmax(0,1fr))` }}>
          {stages.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === step}
              aria-controls="home-step-panel"
              onClick={() => setStep(i)}
              className={`steps__btn${i <= step ? ' is-done' : ''}`}
            >
              <span className="steps__dot">{s.num}</span>
              <span className="steps__title">{s.title}</span>
            </button>
          ))}
        </div>
      </div>
      <div id="home-step-panel" role="tabpanel" aria-live="polite" className="steps__panel">
        <div className="min0" style={{ flex: '1 1 360px', display: 'flex', alignItems: 'baseline', gap: 24 }}>
          <span aria-hidden="true" className="steps__big">
            {stage.num}
          </span>
          <span style={{ fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 'clamp(28px,3vw,42px)', lineHeight: 1.05, letterSpacing: '-0.025em' }}>{stage.title}</span>
        </div>
        <div className="col min0" style={{ flex: '1 1 360px', gap: 14 }}>
          {stage.points.map((pt, i) => (
            <p key={i} style={{ margin: 0, fontSize: 17, lineHeight: 1.6, color: 'var(--on-dark)', maxWidth: '52ch' }}>
              {pt}
            </p>
          ))}
          <p style={{ margin: '8px 0 0', fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--on-dark-2)' }}>
            SCOPE AND SEQUENCE DEPEND ON EACH CLIENT&apos;S NEEDS.
          </p>
        </div>
      </div>
    </>
  );
}
