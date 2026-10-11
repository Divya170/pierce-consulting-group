'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function SiteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section role="alert" className="wrap-n" style={{ paddingTop: 'clamp(48px,7vw,96px)', paddingBottom: 'clamp(72px,9vw,120px)' }}>
      <div className="col" style={{ gap: 20, maxWidth: 640 }}>
        <span className="eyebrow">SOMETHING WENT WRONG</span>
        <h1 className="h-3">This page couldn&apos;t be loaded.</h1>
        <p className="body">Please try again. If the problem continues, you can still reach us through the consultation form.</p>
        <div className="flex-wrap" style={{ gap: 12 }}>
          <button type="button" className="btn btn-dark" onClick={reset}>
            Try again
          </button>
          <Link href="/contact" className="btn btn-outline">
            Request a Consultation
          </Link>
        </div>
      </div>
    </section>
  );
}
