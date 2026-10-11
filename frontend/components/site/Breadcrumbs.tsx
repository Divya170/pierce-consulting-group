import Link from 'next/link';

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="wrap-n crumbs">
      <ol>
        <li>
          <Link href="/">Home</Link>
        </li>
        {items.map((c, i) => (
          <li key={i}>
            <span aria-hidden="true">/</span>
            {c.href ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
