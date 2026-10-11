/** Primary site navigation (structure, not CMS content). */
export const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Industries', href: '/industries' },
  { label: 'Our Approach', href: '/approach' },
  { label: 'Team', href: '/team' },
  { label: 'Insights', href: '/insights' },
] as const;

export function isCurrent(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}
