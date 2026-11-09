import { SITE } from './guides';
import { guideMetadata, renderMetadata } from './guide-seo';

// Titles and descriptions reuse the corresponding pages' existing hero copy.
const pageCopy: Record<string, [string, string]> = {
  "/": [
    "Stop Losing Money to Hidden Fees",
    "We audit your processing statements, show you exactly where the money is leaking, and fix it. Then we reinvest those savings into websites and systems that make the phone ring."
  ],
  "/services": [
    "Services: Turn Savings Into Something That Pays You Back",
    "Once we find the money you're overpaying, these are the systems we put it into. One connected growth engine, not a random menu of add-ons."
  ],
  "/work": [
    "Selected Work",
    "Websites and custom software that make the phone ring, fill the calendar, and keep customers finding you on Google. Built for small businesses that can't afford to wait."
  ],
  "/privacy": [
    "Privacy Policy",
    "We take your privacy seriously. Here is how KCG handles your personal and business information."
  ],
  "/terms": [
    "Terms of Service",
    "These terms apply to your use of this website. Separate signed service agreements remain subject to their own terms."
  ],
  "/dashboard": [
    "Dashboard",
    "KCG dashboard."
  ],
  "/services/web-design": [
    "Website Builds",
    "Most sites sit there looking nice while the phone stays quiet. We build the other kind. The kind that stops the scroll, answers questions at 2 AM, and books the appointment before you ever pick up the phone."
  ],
  "/services/crm": [
    "CRM Systems",
    "Your team should be able to open the pipeline and know what happens next. We build custom CRMs or configure the HubSpot, Salesforce or GoHighLevel you already pay for. The aim is simple: keep customer history and follow-up with the business, instead of scattered across phones and notebooks."
  ],
  "/services/automations": [
    "AI Implementations",
    "Every hour someone spends copying data between tools is an hour nobody spent selling. We hand the busywork to AI agents so your people can do the things only people can do."
  ],
  "/services/consulting": [
    "Consulting Services",
    "You can have customers, capable staff and a full calendar while every decision still comes back to you. We find where time and money leak, choose the changes worth making, and put them in an order your team can deliver. Advisory work should end in decisions you can act on."
  ],
  "/services/prep-to-sell": [
    "Prep To Sell",
    "A buyer needs to understand what they are buying and what keeps working after you leave. We help reduce owner dependence, document operations and organise the evidence behind revenue. For owners three to ten years from exit, preparation leaves time to test that independence."
  ],
  "/services/seo": [
    "SEO Services",
    "A website cannot generate enquiries from people who never find it. We improve the technical foundations and service pages that help search engines understand your business. Then we track relevant searches and enquiries so you can see what moved. SEO takes time, and its value needs to show up beyond a rankings report."
  ],
  "/services/google-business": [
    "Google My Business Profile",
    "When someone needs a business nearby, your profile may be the first thing they inspect. We help you claim and complete Google Business Profile, keep the information accurate, and build a practical review routine. Customers should be able to see what you do, when you are available and how to take the next step."
  ],
  "/services/bpo": [
    "BPO Services",
    "You already paid to make the phone ring. When nobody can answer or follow up, that opportunity may disappear before you finish the job in front of you. We arrange business process outsourcing for inbound lead handling, appointment setting and quote follow-up, with clear rules for what the person answering can promise."
  ],
  "/services/consumer-financing": [
    "Consumer Financing",
    "A customer can want the work and still be unable to pay the whole invoice today. We help you evaluate pay-over-time options and fit an application flow into quoting or checkout. Customers see the available terms, and your staff understand what approval and funding actually mean before promising a start date."
  ],
  "/services/business-loans": [
    "Business Loans",
    "Steady demand does not always arrive with the cash needed to fulfil it. We help you assess working capital or funding for equipment and expansion, match the request to suitable products, and organise the paperwork. The right money should support the business through repayment. Clearing an immediate cash shortage is only the start."
  ],
  "/services/pos-placement": [
    "POS Placement",
    "Replace the outdated terminal slowing your line without writing a check for hardware. We put modern payment equipment in your business at no upfront cost. Free install, free training. You process with KCG, and the equipment stays. We explain the processing commitment before you decide."
  ],
  "/restaurants": [
    "Restaurants & Food Service",
    "Processing fees, third-party commissions, and slow service quietly shrink every night. We cut the waste, speed up the table, and put growth systems behind the kitchen door."
  ],
  "/grocery": [
    "Grocery & Supermarkets",
    "Grocery margins leave no room for fat processing fees or slow lanes. We cut you to wholesale rates, speed up checkout, and tighten inventory so shrink stops eating the profit."
  ],
  "/healthcare": [
    "Healthcare & Medical",
    "Billing friction costs you collections and goodwill. Patient-friendly payments, financing for bigger procedures, and systems that sync with your practice so money stops getting stuck."
  ],
  "/ecommerce": [
    "E-Commerce & Online Business",
    "Online buyers leave in a heartbeat. Smooth checkout, real fraud protection, and honest rates mean more completed orders and less of each sale disappearing into fees and chargebacks."
  ],
  "/salons": [
    "Salons & Spas",
    "A $150 color shouldn't lose $4 to fees. Modern terminals, gift cards, deposits, and retention tools that match the experience you already deliver in the chair."
  ],
  "/auto-repair": [
    "Auto Repair & Service",
    "A $2,000 repair used to lose $60+ to fees, and plenty of customers walked because they couldn't pay today. Zero-fee processing and financing change both of those conversations."
  ],
  "/gas-stations": [
    "Gas Stations & C-Stores",
    "Fuel margins are thin enough without fat interchange and split systems. EMV at the pump, one POS for fuel and c-store, and pricing that doesn't erase the penny you make per gallon."
  ],
  "/high-risk": [
    "High-Risk Merchants",
    "CBD, vape, smoke, supplements. You've been dropped before. We place you with banks that understand your vertical, fight chargebacks early, and keep the account stable."
  ],
  "/nonprofits": [
    "Nonprofits & Churches",
    "Processing fees shouldn't shrink a donation before it does any good. Lower rates, recurring giving, and modern ways to donate so generosity turns into predictable impact."
  ],
  "/b2b": [
    "B2B & Professional Services",
    "Large B2B payments shouldn't cost 3% or take 60 days. Level 2/3 savings, pay-now invoices, and ACH options that get clients to pay faster with less admin."
  ],
  "/real-estate": [
    "Real Estate",
    "Earnest money, commissions, rent, HOA dues. High-ticket payments and recurring collections that used to mean checks and bank runs now happen from a phone."
  ],
  "/retail": [
    "Retail Stores",
    "Retail margins vanish into processing fees and slow lines. Zero-fee programs, tap-to-pay that clears in under two seconds, and inventory that finally matches what's on the floor."
  ]
};

export function siteMetadata(path: string) {
  if (path === '/guides' || path.startsWith('/guides/')) return guideMetadata(path);
  const copy = pageCopy[path];
  if (!copy) throw new Error(`Missing SEO metadata: ${path}`);
  const [name, description] = copy;
  const canonical = SITE + path;
  const organization = { '@type': 'Organization', '@id': SITE + '/#organization', name: 'Keystone Consulting Group', url: SITE, areaServed: { '@type': 'Country', name: 'United States' }, sameAs: ['https://linkedin.com/company/keystone-consulting-group-1'] };
  const graph: Record<string, unknown>[] = [organization];
  if (path === '/') graph.push({ ...organization, '@type': 'ProfessionalService', '@id': SITE + '/#service' });
  else {
    const service = path === '/services' || path.startsWith('/services/') || !['/work', '/privacy', '/terms', '/dashboard'].includes(path);
    graph.push({ '@type': service ? 'Service' : 'WebPage', name, description, url: canonical, ...(service ? { provider: { '@id': organization['@id'] }, areaServed: organization.areaServed } : {}) });
    const crumbs = [{ name: 'Home', item: SITE + '/' }];
    if (path.startsWith('/services/')) crumbs.push({ name: 'Services', item: SITE + '/services' });
    crumbs.push({ name, item: canonical });
    graph.push({ '@type': 'BreadcrumbList', itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, ...c })) });
  }
  return { title: `${name} | KCG`, description, canonical, type: 'website', jsonLd: { '@context': 'https://schema.org', '@graph': graph } };
}
export function siteMetadataMarkup(path: string) {
  return renderMetadata(siteMetadata(path)) + (path === '/dashboard' ? '\n<meta name="robots" content="noindex" />' : '');
}
