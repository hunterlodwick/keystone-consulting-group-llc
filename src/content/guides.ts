import type { SourceId } from './guide-sources';
import { questions } from './guide-questions';
import { stateGuides } from './guide-states';
import { comparisons } from './guide-comparisons';

export const SITE = 'https://www.keystoneconsultingg.com';
export const MODIFIED = '2026-10-28';
export type Topic = 'payments' | 'websites' | 'automation' | 'visibility';
export type Section = { heading: string; body: string; sources?: SourceId[]; bullets?: string[] };
export type Guide = {
  slug: string; title: string; description: string; answer: string;
  kind: 'pillar' | 'question' | 'comparison' | 'state'; topic: Topic;
  sources: SourceId[]; sections: Section[];
  faq: { question: string; answer: string }[];
  related: string[]; legal?: boolean; stateTable?: boolean;
  table?: { headings: string[]; rows: string[][] };
};
export const topics: Record<Topic, { title: string; slug: string; service: string; description: string }> = {
  payments: { title: 'Payment processing', slug: 'payment-processing', service: '/services', description: 'Compare the full cost, protect recurring billing, and understand pricing rules.' },
  websites: { title: 'Business websites', slug: 'business-websites', service: '/services/web-design', description: 'Define the scope, own the essentials, and make it easier to enquire.' },
  automation: { title: 'AI automation & voice agents', slug: 'ai-automation', service: '/services/automations', description: 'Choose a useful first workflow and test the handoff to your team.' },
  visibility: { title: 'Google Business Profile & SEO', slug: 'local-seo', service: '/services/google-business', description: 'Help customers find accurate answers in local search and AI search.' },
};
const pillars: Guide[] = [
  {
    slug: 'payment-processing', kind: 'pillar', topic: 'payments', title: 'A business owner’s guide to payment processing',
    description: 'Compare processing options, recurring billing migrations, dual pricing, embedded checkout, Flexxbuy and next-day funding with KCG.',
    answer: 'Choose payment processing around how your customers pay, how you bill them again, and when you need funds. Compare the full written agreement, then test the checkout and reporting. KCG serves merchants nationwide, with a Fluid Pay plan at $30/month with no contract and next-day funding available.',
    sources: ['visa', 'migration', 'checkout', 'flexxbuy', 'funding'], legal: true,
    sections: [
      { heading: 'Start with your payment workflow', body: 'Bring a recent statement and a list of payment channels: counter, invoice, website, telephone, and subscriptions. Ask for one written proposal that identifies processing charges, gateway costs, equipment, optional software, support, and cancellation terms. The $30/month Fluid Pay plan is not a claim that every processing expense is included. Confirm the scope of the no-contract plan separately from equipment or other services.' },
      { heading: 'Choose between absorbing fees, discounts, and surcharges', body: 'Visa distinguishes a discount from an added card fee by how prices are displayed and charged. A label such as dual pricing does not override state law or card rules. Review the national guide and any relevant state page before changing menus, invoices, signs, or checkout logic.', sources: ['visa'] },
      { heading: 'Plan recurring billing before leaving Stripe', body: 'Stripe supports secure payment-data transfers to an eligible receiving processor, but its export does not include subscription objects or payment history, and excludes Link credentials. Inventory billing dates, balances, tax settings, retries, and customer permissions separately. Have the receiving provider confirm support before setting a cutover date.', sources: ['migration'] },
      { heading: 'Check the checkout, financing, and deposit path', body: 'An embedded checkout keeps the payment form on your site; a hosted checkout sends the customer to a provider page. Flexxbuy is an option to discuss for buy-now-pay-later and customer financing. Next-day funding is available through KCG, but ask for your eligibility, cutoff, bank timing, and any conditions in writing. Do not budget around an unconfirmed deposit date.', sources: ['checkout', 'flexxbuy', 'funding'] },
    ],
    faq: [ { question: 'Does KCG serve merchants outside Utah?', answer: 'Yes. KCG serves merchants nationwide. Discuss your locations, payment channels, and applicable state requirements during the review.' }, { question: 'Does $30/month mean all processing is included?', answer: 'No all-in processing claim is made. It is the owner-confirmed Fluid Pay plan price. Request the full processing proposal and confirm what is included.' } ],
    related: ['dual-pricing-laws', 'switch-from-stripe', 'next-day-funding', 'embedded-checkout', 'small-business-bnpl', 'fluid-pay-vs-stripe'],
  },
  {
    slug: 'business-websites', kind: 'pillar', topic: 'websites', title: 'Choose a website around the next customer decision',
    description: 'Plan a small business website around scope, ownership, enquiries, booking and a practical launch review.',
    answer: 'Start a business website project by deciding what a visitor needs to understand and do: request an estimate, book a visit, or buy. Then define the pages, content, integrations, ownership, and maintenance. Ask for a written scope and a working demonstration of the enquiry path before approving launch.',
    sources: ['googleAI', 'checkout'],
    sections: [
      { heading: 'Write the brief before comparing proposals', body: 'List the services you actually deliver, the customers you serve, the questions your team answers, and the evidence you can publish. Ask each vendor to price the same scope. Specify who writes the copy, supplies images, approves revisions, and maintains the site. Keep optional integrations separate so you can decide what to build first.' },
      { heading: 'Make the enquiry path reviewable', body: 'Choose a primary action for each page. Ask to see that path on a phone: opening the page, understanding the service, finding the contact option, and seeing the confirmation. Define who receives an enquiry and how your team handles it. A page is not ready just because it looks finished.' },
      { heading: 'Include search access in acceptance criteria', body: 'Google recommends making important content available as text, providing crawlable internal links, and keeping structured data consistent with visible content. Ask for a check of the actual HTML, page titles, canonical URLs, and redirects before replacing an existing site.', sources: ['googleAI'] },
      { heading: 'Agree ownership and maintenance', body: 'Ask who controls the domain, hosting account, website files, business email, and analytics. Document the handover and ongoing editing process. For payments, compare hosted and embedded checkout against your actual order flow and maintenance capacity.', sources: ['checkout'] },
    ],
    faq: [{ question: 'Can I get a useful proposal without naming a budget?', answer: 'You can start by defining the required outcome and scope. Ask the vendor to separate essentials from optional features so you can compare like-for-like proposals.' }, { question: 'Should I rebuild every page at once?', answer: 'Review existing pages and enquiry paths first. Decide what to retain, improve, consolidate, or redirect before approving a replacement.' }],
    related: ['website-cost', 'website-scope', 'website-ownership', 'website-leads', 'embedded-checkout'],
  },
  {
    slug: 'ai-automation', kind: 'pillar', topic: 'automation', title: 'Evaluate AI automation and voice agents for your business',
    description: 'Choose an AI pilot, test voice-agent handoffs, control CRM access and evaluate outcomes before expanding.',
    answer: 'Choose an AI automation project by finding a repeated task with clear inputs, an approved response, and a person who can handle exceptions. For voice agents, start with a narrow inbound workflow and test it against realistic calls. Decide what success means before expanding access or allowing actions without review.',
    sources: ['nist'],
    sections: [
      { heading: 'Choose a bounded first job', body: 'Consider appointment intake, routing a common enquiry, or drafting a follow-up for staff review. Write down what the system may answer and what it must pass to a person. Treat an impressive demonstration as the start of evaluation, not proof that it will handle your entire business.' },
      { heading: 'Test voice calls your team actually receives', body: 'Build a test set with unclear names, background noise, changed appointments, unavailable times, interruptions, and a request for a person. Check the resulting calendar entry or CRM record, not only the spoken response. Set a fallback when the calendar or phone integration is unavailable.' },
      { heading: 'Control access and review errors', body: 'Use the smallest access scope needed for the pilot. Require approval for financial commitments, account changes, and sensitive decisions. NIST provides a voluntary framework for evaluating and managing AI risks; it does not certify a particular voice agent or guarantee reliability.', sources: ['nist'] },
      { heading: 'Decide whether to expand', body: 'Track completed tasks, wrong answers, transfers, staff corrections, and the time spent reviewing the pilot. Compare these with the current workflow using the same definitions. Expand only after the owner agrees the results justify the cost and operational responsibility.' },
    ],
    faq: [{ question: 'Will AI replace my receptionist?', answer: 'Do not assume that. First decide which routine tasks could be delegated and which conversations should remain with staff. A pilot should include an obvious human handoff.' }, { question: 'Does KCG guarantee an automation result?', answer: 'No performance guarantee is made in this guide. Agree the scope, test cases, review process, and acceptance criteria for your proposed workflow.' }],
    related: ['ai-voice-agents', 'ai-human-handoff', 'first-automation', 'ai-crm-integration', 'measure-ai-pilot'],
  },
  {
    slug: 'local-seo', kind: 'pillar', topic: 'visibility', title: 'A practical guide to Google Business Profile and local SEO',
    description: 'Understand local ranking, service-area profiles, honest reviews and AI search visibility with official Google and OpenAI sources.',
    answer: 'Start local SEO with an accurate eligible Google Business Profile and useful website pages about the services you actually provide. Google describes local ranking through relevance, distance, and prominence. Keep information consistent, invite genuine reviews, and measure enquiries. Neither map placement nor inclusion in an AI answer can be guaranteed.',
    sources: ['local', 'profile', 'reviews', 'googleAI', 'chatgpt'],
    sections: [
      { heading: 'Fix the business information first', body: 'Check the business name, category, hours, telephone number, address or service area, and website link against Google’s guidelines. A business that travels to customers needs a profile setup that reflects that reality. Nationwide service does not justify creating profiles at virtual offices.', sources: ['profile'] },
      { heading: 'Understand what ranking work can change', body: 'Google identifies relevance, distance, and prominence as the main local factors and says businesses cannot pay for improved local ranking. Focus your review on accurate information, useful service content, and genuine customer feedback. Separate paid advertising proposals from organic ranking claims.', sources: ['local'] },
      { heading: 'Treat reviews as customer feedback', body: 'Ask customers for an honest account of their experience without incentives or selecting only those expected to be positive. Google prohibits fake engagement and rating manipulation. Give your team a review-request process that does not dictate a rating or a script.', sources: ['reviews'] },
      { heading: 'Apply the same care to AI visibility', body: 'Google says its usual SEO practices apply to AI features, with no special AI schema or file required. OpenAI states that placement in ChatGPT search is not guaranteed. Publish clear, sourced answers and make them accessible, then measure actual enquiries instead of promising mentions.', sources: ['googleAI', 'chatgpt'] },
    ],
    faq: [{ question: 'Can KCG guarantee the map pack?', answer: 'No. Google says there is no way to request or pay for a better local ranking. Work should focus on accurate information, useful content, and measurable customer actions.' }, { question: 'Is local SEO useful for a nationwide company?', answer: 'Use local profiles only for eligible real business locations or service-area operations. Use the website to explain nationwide services without inventing offices.' }],
    related: ['google-map-pack', 'service-area-profile', 'google-reviews', 'chatgpt-recommendations', 'ai-search-seo', 'faq-schema'],
  },
];
export const guides: Guide[] = [...pillars, ...questions, ...comparisons, ...stateGuides];
export const guidePath = (slug: string) => `/guides/${slug}`;
export const guideBySlug = (slug: string) => guides.find(page => page.slug === slug);
