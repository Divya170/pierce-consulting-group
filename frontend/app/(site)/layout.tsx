import { getSite } from '@/lib/api';
import { Header } from '@/components/site/Header';
import { Footer } from '@/components/site/Footer';
import { ClosingCta } from '@/components/site/ClosingCta';
import { SiteUnavailable } from '@/components/site/SiteUnavailable';

export const dynamic = 'force-dynamic';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  let site;
  try {
    site = await getSite();
  } catch {
    return <SiteUnavailable />;
  }
  const { settings, services } = site;

  return (
    <>
      <a href="#main" className="skip">
        Skip to content
      </a>
      <Header settings={settings} />
      <main id="main" tabIndex={-1} style={{ outline: 'none', display: 'block' }}>
        {children}
        <ClosingCta />
      </main>
      <Footer settings={settings} services={services} />
    </>
  );
}
