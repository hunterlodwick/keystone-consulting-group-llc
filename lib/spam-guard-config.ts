import type { SpamGuardConfig } from './spam-guard.js';

export const CONFIG: SpamGuardConfig = {
  disablePhrases: [
    'seo', 'search engine optimization', 'marketing agency', 'digital marketing services',
    'lead generation services', 'web design services', 'website redesign services',
    'business funding', 'merchant cash advance', 'crypto', 'outsourc', 'rank higher',
    'google rankings', 'ranking on google',
  ],
  extraPhrases: [
    'i noticed your website', 'first page of google', 'guest post', 'backlinks',
    'we are a seo agency', 'our seo team', 'we can rank your website',
  ],
};
