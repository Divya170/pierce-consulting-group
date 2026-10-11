'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const HIDDEN_ON = ['/contact', '/privacy'];

export function ClosingCta() {
  const pathname = usePathname() || '/';
  if (HIDDEN_ON.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null;
  return (
    <section data-screen-label="Closing CTA" aria-labelledby="close-h" className="closing">
      <div aria-hidden="true" className="grid-lines-ink" />
      <div className="wrap closing__in">
        <span className="eyebrow eyebrow--ink">START A CONVERSATION</span>
        <h2 id="close-h" className="closing__h">
          Let&apos;s clarify your next business move.
        </h2>
        <div className="closing__row">
          <p style={{ margin: 0, fontSize: 18, lineHeight: 1.6, maxWidth: '50ch' }}>
            Tell us what your business is working through, and start a conversation about possible next steps.
          </p>
          <div className="flex-wrap" style={{ gap: 12 }}>
            <Link href="/contact" className="btn btn--lg btn-ink-grow">
              Request a Consultation <span aria-hidden="true">→</span>
            </Link>
            <Link href="/team" className="btn btn--lg btn-outline btn-outline-ink" style={{ padding: '0 24px' }}>
              Contact the Team
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
