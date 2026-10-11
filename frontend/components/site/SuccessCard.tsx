'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export interface SuccessAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'text';
}

/** Shown after every successful submission — always offers a clear next action. */
export function SuccessCard({ title, children, reference, actions }: { title: string; children?: React.ReactNode; reference?: string | null; actions: SuccessAction[] }) {
  const h = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    h.current?.focus();
  }, []);
  return (
    <div className="success">
      <span aria-hidden="true" className="success__check">
        ✓
      </span>
      <h2 ref={h} id="success-h" tabIndex={-1} style={{ margin: 0, fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 'clamp(26px,2.6vw,32px)', lineHeight: 1.2, letterSpacing: '-0.015em', color: 'var(--ink)', outline: 'none' }}>
        {title}
      </h2>
      {children}
      {reference && <span className="success__ref">REFERENCE · {reference}</span>}
      <div className="flex-wrap" style={{ gap: 12 }}>
        {actions.map((a) => {
          const cls = a.variant === 'secondary' ? 'btn btn--md btn-outline' : a.variant === 'text' ? 'textbtn' : 'btn btn--md btn-dark';
          return a.href ? (
            <Link key={a.label} href={a.href} className={cls}>
              {a.label}
            </Link>
          ) : (
            <button key={a.label} type="button" className={cls} onClick={a.onClick}>
              {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
