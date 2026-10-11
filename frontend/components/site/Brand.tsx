import Link from 'next/link';

export function Brand({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} aria-label="Pierce Consulting Group — home" className="brand">
      <span aria-hidden="true" className="brand__mark">
        P
      </span>
      <span className="col" style={{ gap: 4 }}>
        <span className="brand__name">PIERCE</span>
        <span className="brand__sub">CONSULTING GROUP</span>
      </span>
    </Link>
  );
}
