const links = [
  { href: '/', label: 'Home' },
  { href: '/services', label: 'Services' },
  { href: '/services/payment-processing', label: 'Low-rate payment processing' },
  { href: '/guides', label: 'Business guides' },
];

export default function NotFoundPage() {
  return <div className="guides-layout"><div className="guides-container">
    <header className="guide-hero"><span className="guide-eyebrow">404</span><h1>Page not found</h1><p className="guide-answer">The page you requested does not exist or has moved.</p></header>
    <article className="guide-article"><section className="guide-section"><h2>Try one of these instead</h2><ul>{links.map(link => <li key={link.href}><a href={link.href}>{link.label}</a></li>)}</ul></section></article>
  </div></div>;
}
