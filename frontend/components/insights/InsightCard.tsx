import Link from 'next/link';
import type { InsightCard as Card } from '@/lib/types';
import { formatDate } from '@/lib/format';

export function InsightCard({ item }: { item: Card }) {
  return (
    <article className="icard">
      <span className="icard__meta">
        {item.category} · {formatDate(item.publishedAt, item.isSample)}
      </span>
      <h3 className="h-card">
        <Link href={`/insights/${item.slug}`}>{item.title}</Link>
      </h3>
      <p>{item.excerpt}</p>
    </article>
  );
}
