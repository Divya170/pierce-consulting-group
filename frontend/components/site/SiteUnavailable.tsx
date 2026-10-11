import { Brand } from './Brand';

/** Rendered when the API cannot be reached at all (error state for the whole site). */
export function SiteUnavailable() {
  return (
    <div className="login-wrap">
      <div aria-hidden="true" className="grid-lines-dark" />
      <div className="login-card" role="alert">
        <div style={{ background: 'var(--ink)', padding: 12, alignSelf: 'flex-start' }}>
          <Brand />
        </div>
        <h1 className="h-3">We&apos;ll be right back.</h1>
        <p className="body">The website is temporarily unavailable. Please try again in a moment.</p>
        <a href="" className="btn btn-dark btn--self">
          Try again
        </a>
      </div>
    </div>
  );
}
