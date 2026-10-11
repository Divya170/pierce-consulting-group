'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { PublicSettings } from '@/lib/types';
import { NAV, isCurrent } from './nav';
import { Brand } from './Brand';

export function Header({ settings }: { settings: PublicSettings }) {
  const pathname = usePathname() || '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Compact header after scrolling; expose its height for sticky sub-navs
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    const el = headerRef.current;
    const ro = el
      ? new ResizeObserver(() => document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`))
      : null;
    if (el && ro) ro.observe(el);
    return () => {
      window.removeEventListener('scroll', onScroll);
      ro?.disconnect();
    };
  }, []);

  // Close menu on navigation
  useEffect(() => setOpen(false), [pathname]);

  // Esc to close, lock scroll, focus management
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      menuBtnRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <header ref={headerRef} className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="wrap site-header__in">
          <Brand />
          <nav aria-label="Primary" className="nav-desktop">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} aria-current={isCurrent(pathname, n.href) ? 'page' : undefined}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link href="/contact" className="header-cta">
              <span className="long">Request a Consultation</span>
              <span className="short">Consult</span> <span aria-hidden="true">→</span>
            </Link>
            <button
              ref={menuBtnRef}
              type="button"
              className="menu-btn"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              <span aria-hidden="true" className="menu-btn__bars">
                <span />
                <span />
                <span />
              </span>
              Menu
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Site menu" className="mmenu">
          <div className="mmenu__top">
            <span className="eyebrow eyebrow--gold">MENU</span>
            <button ref={closeRef} type="button" className="mmenu__close" onClick={() => setOpen(false)}>
              Close <span aria-hidden="true">×</span>
            </button>
          </div>
          <nav aria-label="Mobile">
            {NAV.map((n, i) => (
              <Link key={n.href} href={n.href} aria-current={isCurrent(pathname, n.href) ? 'page' : undefined} onClick={() => setOpen(false)}>
                <span>{n.label}</span>
                <span className="num">{String(i + 1).padStart(2, '0')}</span>
              </Link>
            ))}
          </nav>
          <Link href="/contact" className="mmenu__cta" onClick={() => setOpen(false)}>
            Request a Consultation
          </Link>
          <div className="mmenu__contact">
            {settings.email && <a href={settings.mailHref || undefined}>{settings.email}</a>}
            {settings.phone && <a href={settings.telHref || undefined}>{settings.phone}</a>}
          </div>
        </div>
      )}
    </>
  );
}
