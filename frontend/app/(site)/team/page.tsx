import type { Metadata } from 'next';
import Link from 'next/link';
import { getContent, getSite } from '@/lib/api';
import { Breadcrumbs } from '@/components/site/Breadcrumbs';
import { TemplateBanner } from '@/components/site/TemplateBanner';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Team' };

export default async function TeamPage() {
  const [site, c] = await Promise.all([getSite(), getContent('team-member')]);
  const team = c['team-member'];
  const s = site.settings;

  return (
    <>
      <Breadcrumbs items={[{ label: 'Team' }]} />
      <section data-screen-label="Team — Hero" aria-labelledby="team-h1" className="wrap-n page-hero flex-wrap" style={{ paddingBottom: 'clamp(64px,8vw,104px)', gap: 'clamp(40px,6vw,88px)', alignItems: 'flex-end' }}>
        <div className="col min0" style={{ flex: '1.3 1 480px', gap: 24 }}>
          <span className="eyebrow">TEAM</span>
          <h1 id="team-h1" className="h-page h-page--lg">
            The people behind the conversation.
          </h1>
        </div>
        <p className="lead" style={{ flex: '1 1 340px', maxWidth: '48ch' }}>
          Consulting is a working relationship. When you get in touch, you speak directly with the people who would be involved in understanding your business.
        </p>
      </section>

      <section data-screen-label="Team — Profiles" className="bg-white bordered-y">
        <div className="wrap-n sec--sm">
          {team.length > 0 ? (
            <>
              {team.some((m) => m.isSample) && <TemplateBanner>profile layout only. Publish only verified names, roles, biographies and approved portraits.</TemplateBanner>}
              <div style={{ borderTop: '1px solid var(--ink)' }}>
                {team.map((m) => (
                  <article key={m.id} className="flex-wrap" style={{ gap: '32px clamp(32px,5vw,72px)', padding: '40px 0', borderBottom: '1px solid var(--line)' }}>
                    {m.portrait ? (
                      <div className="img-box" style={{ flex: '0 1 300px', aspectRatio: '4/5' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.portrait} alt={`Portrait of ${m.name}`} loading="lazy" />
                      </div>
                    ) : (
                      <div aria-label="Portrait placeholder" className="portrait-ph">
                        APPROVED PORTRAIT
                      </div>
                    )}
                    <div className="col min0" style={{ flex: '1 1 380px', gap: 14 }}>
                      <span className="eyebrow" style={{ letterSpacing: '0.12em' }}>
                        {m.role}
                      </span>
                      <h2 className="h-3">{m.name}</h2>
                      <p className="body" style={{ maxWidth: '60ch', whiteSpace: 'pre-line' }}>
                        {m.bio}
                      </p>
                      {m.credentials && <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)' }}>{m.credentials}</p>}
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-wrap" style={{ gap: '40px clamp(40px,6vw,96px)', alignItems: 'stretch' }}>
              <div className="img-box min0" style={{ flex: '1 1 380px', aspectRatio: '4/3' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/hero-glass-office.jpg" alt="" loading="lazy" style={{ objectPosition: '30% center' }} />
              </div>
              <div className="col min0" style={{ flex: '1 1 380px', justifyContent: 'center', gap: 22 }}>
                <span className="eyebrow">BUSINESS CONTACT</span>
                <h2 className="h-2">{s.contactName}</h2>
                <p className="body" style={{ maxWidth: '52ch' }}>
                  Enquiries to Pierce Consulting Group are received by {s.contactName}. Get in touch directly, or use the consultation form to share some context first.
                </p>
                {(s.email || s.phone) && (
                  <dl className="dl" style={{ borderTop: '1px solid var(--line)', paddingTop: 20 }}>
                    {s.email && (
                      <>
                        <dt>EMAIL</dt>
                        <dd>
                          <a href={s.mailHref || undefined}>{s.email}</a>
                        </dd>
                      </>
                    )}
                    {s.phone && (
                      <>
                        <dt>PHONE</dt>
                        <dd>
                          <a href={s.telHref || undefined}>{s.phone}</a>
                        </dd>
                      </>
                    )}
                  </dl>
                )}
                <Link href="/contact" className="btn btn-dark btn--self" style={{ whiteSpace: 'normal', textAlign: 'center' }}>
                  Connect With Pierce Consulting Group
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
