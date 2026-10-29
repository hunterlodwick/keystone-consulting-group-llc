export const sources = {
  "visa": {
    "label": "Visa: US merchant surcharge Q&A",
    "url": "https://usa.visa.com/dam/VCOM/global/support-legal/documents/merchant-surcharging-qa-for-web.pdf",
    "note": "Credit only; lower of MDR or 3%; 30 days acquirer notice; disclosures; cash discount display."
  },
  "mastercard": {
    "label": "Mastercard: merchant surcharge rules",
    "url": "https://www.mastercard.com/us/en/business/support/merchant-surcharge-rules.html",
    "note": "Credit only; cost-based cap up to 4%; disclosures and notice."
  },
  "mastercardNotice": {
    "label": "Mastercard: current registration notice",
    "url": "https://www.mastercard.com/us/en/business/support/merchant-surcharge-rules/form.html",
    "note": "Web registration temporarily not required; conflicts with older summary, confirm acquirer process."
  },
  "ca": {
    "label": "California DOJ: SB 478 FAQ",
    "url": "https://oag.ca.gov/hiddenfees",
    "note": "July 1 2024; mandatory all-in price, optional card fee exception, credit-only mandatory; SB1524 food exceptions."
  },
  "ct": {
    "label": "Connecticut DCP: surcharges",
    "url": "https://portal.ct.gov/dcp/legal/credit-card-surcharge",
    "note": "Prohibition, genuine discounts and dual posted prices; government exceptions."
  },
  "ctLaw": {
    "label": "Connecticut General Statutes §42-133ff",
    "url": "https://www.cga.ct.gov/current/pub/chap_739.htm#sec_42-133ff",
    "note": "Statutory source linked by DCP."
  },
  "ma": {
    "label": "Massachusetts General Laws 140D §28A",
    "url": "https://malegislature.gov/Laws/GeneralLaws/PartI/TitleXX/Chapter140D/Section28A",
    "note": "Surcharge prohibition; clearly disclosed discount offered to all prospective buyers."
  },
  "me": {
    "label": "Maine Title 9-A §8-509",
    "url": "https://legislature.maine.gov/statutes/9-a/title9-Asec8-509.html",
    "note": "Credit/debit surcharge prohibition; discount exclusion; government exception."
  },
  "co": {
    "label": "Colorado SB21-091, enacted summary",
    "url": "https://leg.colorado.gov/bills/sb21-091",
    "note": "2% or actual merchant discount fee; disclosure; debit/gift exclusion."
  },
  "ny": {
    "label": "New York General Business Law §518",
    "url": "https://www.nysenate.gov/legislation/laws/GBS/518",
    "note": "Full credit price posted; acceptance-cost limit; two prices permitted."
  },
  "nyGuide": {
    "label": "New York: surcharge display guidance",
    "url": "https://www.governor.ny.gov/news/governor-hochul-announces-new-law-clarify-disclosure-credit-card-surcharges-goes-effect-sunday",
    "note": "February 11 2024 effective date; percentage-only sign insufficient."
  },
  "nj": {
    "label": "New Jersey Consumer Affairs: surcharge FAQ",
    "url": "https://www.njconsumeraffairs.gov/News/Consumer%20Briefs/credit-card-surcharges-faq.pdf",
    "note": "Actual cost cap; restaurant menus, entry/POS, online and telephone disclosure."
  },
  "stripe": {
    "label": "Stripe US public pricing",
    "url": "https://stripe.com/pricing",
    "note": "Standard domestic online cards 2.9% + 30¢; other products separately priced."
  },
  "square": {
    "label": "Square US public pricing",
    "url": "https://squareup.com/us/en/pricing",
    "note": "Free/Plus/Premium plans; Free no monthly subscription, processing applies; channel differences."
  },
  "clover": {
    "label": "Clover public pricing",
    "url": "https://www.clover.com/pricing",
    "note": "Industry packages; software plus processing; hardware subscription terms distinct."
  },
  "migration": {
    "label": "Stripe payment data export",
    "url": "https://docs.stripe.com/get-started/data-migrations/pan-export",
    "note": "Secure provider transfer; Link excluded; subscription/history objects not in export."
  },
  "checkout": {
    "label": "Stripe Checkout documentation",
    "url": "https://docs.stripe.com/payments/checkout",
    "note": "Embedded and hosted checkout; integration distinction."
  },
  "funding": {
    "label": "Stripe next-day settlement documentation",
    "url": "https://docs.stripe.com/payouts/next-day-settlement",
    "note": "Business-day settlement versus payout/bank timing. Used for definitions, not KCG eligibility."
  },
  "flexxbuy": {
    "label": "Flexxbuy official website",
    "url": "https://www.flexxbuy.com/",
    "note": "Customer financing; multi-lender platform; not every business qualifies for every program. User spelling Flexxbuy retained."
  },
  "local": {
    "label": "Google: local ranking",
    "url": "https://support.google.com/business/answer/7091",
    "note": "Relevance, distance, prominence; no paying for improved organic local rank."
  },
  "profile": {
    "label": "Google: represent your business",
    "url": "https://support.google.com/business/answer/3038177",
    "note": "Actual locations, service-area rules, no unstaffed virtual offices."
  },
  "reviews": {
    "label": "Google Maps contribution policy",
    "url": "https://support.google.com/contributionpolicy/answer/7400114",
    "note": "Genuine reviews; no incentives or selective positive solicitation."
  },
  "googleAI": {
    "label": "Google Search: AI features",
    "url": "https://developers.google.com/search/docs/appearance/ai-features",
    "note": "Standard SEO applies; indexed/snippet-eligible; no special AI schema or files required."
  },
  "faq": {
    "label": "Google: FAQ structured data",
    "url": "https://developers.google.com/search/docs/appearance/structured-data/faqpage",
    "note": "FAQ rich results restricted to well-known authoritative government/health sites."
  },
  "bots": {
    "label": "OpenAI crawlers",
    "url": "https://platform.openai.com/docs/bots",
    "note": "OAI-SearchBot search; GPTBot model training; independent controls."
  },
  "chatgpt": {
    "label": "OpenAI: ChatGPT search",
    "url": "https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt",
    "note": "Search placement is not guaranteed."
  },
  "nist": {
    "label": "NIST AI Risk Management Framework",
    "url": "https://www.nist.gov/itl/ai-risk-management-framework",
    "note": "Voluntary framework for evaluating and managing AI risks; not evidence of KCG performance."
  }
} as const;
export type SourceId = keyof typeof sources;
