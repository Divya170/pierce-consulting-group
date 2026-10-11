'use client';

import { useState } from 'react';
import type { Principle } from '@/lib/types';

export function PrinciplePanels({ items }: { items: Principle[] }) {
  const [active, setActive] = useState(0);
  if (!items.length) return null;
  return (
    <div role="tablist" aria-label="Working principles" className="panels">
      {items.map((p, i) => {
        const on = i === active;
        const pick = () => {
          if (!on) setActive(i);
        };
        return (
          <button key={p.id} type="button" role="tab" aria-selected={on} onClick={pick} onMouseEnter={pick} onFocus={pick} className="panel">
            <span className="panel__top">
              <span className="panel__num">{p.num}</span>
              <span aria-hidden="true" className="panel__icon">
                {p.icon}
              </span>
            </span>
            <span className="col" style={{ gap: 12 }}>
              <span className="panel__title">{p.title}</span>
              <span className="panel__text">{p.text}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
