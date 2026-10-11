import type { Metadata } from 'next';
import { ServicesView } from '@/components/services/ServicesView';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Services' };

export default function ServicesPage() {
  return <ServicesView activeSlug={null} />;
}
