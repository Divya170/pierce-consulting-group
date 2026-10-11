import type { Metadata } from 'next';
import { ServicesView } from '@/components/services/ServicesView';
import { getSite } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const site = await getSite();
    const s = site.services.find((x) => x.slug === params.slug);
    return { title: s ? `${s.title} — Services` : 'Services', description: s?.purpose };
  } catch {
    return { title: 'Services' };
  }
}

/** /services/strategy renders the services page and scrolls to that section. */
export default function ServiceDeepLinkPage({ params }: { params: { slug: string } }) {
  return <ServicesView activeSlug={params.slug} />;
}
