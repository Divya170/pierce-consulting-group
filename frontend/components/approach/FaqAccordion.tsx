'use client';

import { useState } from 'react';
import type { Faq } from '@/lib/types';

export function FaqAccordion({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState(-1);
  if (!items.length) return <p className="lead">Frequently asked questions will be published here.</p>;
  return (
    <div className="min0" style={{ flex: '1.6 1 520px', borderTop: '1px solid var(--ink)' }}>
      {items.map((q, i) => {
        const expanded = open === i;
        return (
          <div key={q.id} style={{ borderBottom: '1px solid var(--line-2)' }}>
            <h3 style={{ margin: 0 }}>
              <button
                type="button"
                id={`faq-b-${i}`}
                className="faq__btn"
                aria-expanded={expanded}
                aria-controls={`faq-p-${i}`}
                onClick={() => setOpen(expanded ? -1 : i)}
              >
                <span>{q.question}</span>
                <span aria-hidden="true" className="faq__icon">
                  +
                </span>
              </button>
            </h3>
            <div id={`faq-p-${i}`} role="region" aria-labelledby={`faq-b-${i}`} hidden={!expanded} style={{ padding: '0 48px 24px 0' }}>
              <p className="body" style={{ maxWidth: '62ch' }}>
                {q.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
