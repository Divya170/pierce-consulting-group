import Link from 'next/link';
import type { PublicService, PublicSettings } from '@/lib/types';
import { NAV } from './nav';

export function Footer({ settings, services }: { settings: PublicSettings; services: PublicService[] }) {
  return (
    <footer className="footer">
      <div className="wrap footer__in">
        <div className="footer__cols">
          <div className="col min0" style={{ flex: '1.4 1 300px', gap: 20 }}>
            <p style={{ margin: 0, fontFamily: 'var(--f-display)', fontWeight: 500, fontSize: 'clamp(24px,2.4vw,32px)', lineHeight: 1.2, letterSpacing: '-0.02em', maxWidth: '22ch' }}>
              Business consulting for strategy, operations, and process clarity.
            </p>
            <Link href="/contact" className="btn btn-gold btn--self" style={{ gap: 12 }}>
              Request a Consultation <span aria-hidden="true">→</span>
            </Link>
          </div>
          <nav aria-label="Footer" className="col" style={{ flex: '1 1 160px', gap: 2 }}>
            <span className="footer__lab">PAGES</span>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="footer__link">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="col" style={{ flex: '1 1 200px', gap: 2 }}>
            <span className="footer__lab">SERVICES</span>
            {services.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="footer__link">
                {s.title}
              </Link>
            ))}
          </div>
          <div className="col min0" style={{ flex: '1 1 240px', gap: 12 }}>
            <span className="footer__lab" style={{ marginBottom: 4 }}>
              CONTACT
            </span>
            {settings.email && (
              <a href={settings.mailHref || undefined} className="light">
                {settings.email}
              </a>
            )}
            {settings.phone && (
              <a href={settings.telHref || undefined} className="light">
                {settings.phone}
              </a>
            )}
            {settings.showAddress && settings.address && (
              <address style={{ fontStyle: 'normal', fontSize: 15, lineHeight: 1.5, color: 'var(--on-dark)' }}>{settings.address}</address>
            )}
          </div>
        </div>
        <div aria-hidden="true" className="footer__word">
          PIERCE
        </div>
        <div className="footer__bar">
          <span>© {new Date().getFullYear()} Pierce Consulting Group. All rights reserved.</span>
          <Link href="/privacy" style={{ color: 'var(--on-dark)' }}>
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
