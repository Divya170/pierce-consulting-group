import Link from 'next/link';
import { Brand } from '@/components/site/Brand';

export default function NotFound() {
  return (
    <div className="login-wrap">
      <div aria-hidden="true" className="grid-lines-dark" />
      <div className="login-card">
        <div style={{ background: 'var(--ink)', padding: 12, alignSelf: 'flex-start' }}>
          <Brand />
        </div>
        <span className="eyebrow">404 — PAGE NOT FOUND</span>
        <h1 className="h-3">We couldn&apos;t find that page.</h1>
        <p className="body">The link may be out of date. Try one of these instead.</p>
        <div className="flex-wrap" style={{ gap: 12 }}>
          <Link href="/" className="btn btn-dark">
            Return to Home
          </Link>
          <Link href="/contact" className="btn btn-outline">
            Request a Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}
