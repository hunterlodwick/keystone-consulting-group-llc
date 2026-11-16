import { guides, guidePath } from '../src/content/guides';
const industries = ['restaurants', 'grocery', 'healthcare', 'ecommerce', 'salons', 'auto-repair', 'gas-stations', 'high-risk', 'nonprofits', 'b2b', 'real-estate', 'retail'];
const services = ['edge-program', 'payment-processing', 'web-design', 'crm', 'automations', 'consulting', 'prep-to-sell', 'seo', 'google-business', 'bpo', 'consumer-financing', 'business-loans', 'pos-placement'];
export const existingRoutes = [
  { path: '/', file: 'src/App.tsx' },
  { path: '/services', file: 'src/pages/ServicesPage.tsx' },
  { path: '/work', file: 'src/pages/WorkPage.tsx' },
  { path: '/privacy', file: 'src/pages/LegalPage.tsx' },
  { path: '/terms', file: 'src/pages/LegalPage.tsx' },
  ...services.map(slug => ({ path: `/services/${slug}`, file: ['edge-program', 'payment-processing'].includes(slug) ? 'src/content/payment-services.ts' : 'src/pages/ServicesPage.tsx' })),
  ...industries.map(slug => ({ path: `/${slug}`, file: 'src/pages/IndustryPageTemplate.tsx' })),
];
export const newRoutes = ['/guides', ...guides.map(g => guidePath(g.slug))];

export const publicRoutes = [...existingRoutes.map(r => r.path), ...newRoutes];
export const staticFile = (path: string) => path === '/' ? '/index.html' : `${path}.html`;
