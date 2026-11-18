// Fixed reviewed excerpts. Build input only; never a runtime source reader.
export const LEGACY_PASSAGES = [
  {
    id: "services.overview", sourceId: "home#what-we-actually-build", route: "/", href: "/", label: "Payments, Websites and AI",
    passage: "Payments first. Then websites and AI you can actually run. Here's exactly what each one looks like.",
  },
  {
    id: "payments.workflow", sourceId: "home#statement-review-then-payments-that-match-how-yo", route: "/", href: "/", label: "Statement review and POS",
    passage: "We start with your processing statement, then choose and configure POS around how you actually sell: dining rooms, service jobs, or retail counters. Fees stay readable. Equipment matches the floor.",
  },
  {
    id: "payments.restaurant", sourceId: "home#statement-review-then-payments-that-match-how-yo", route: "/", href: "/", label: "Restaurant POS",
    passage: "Restaurant POS: tables, split checks, tips, and kitchen tickets",
  },
  {
    id: "payments.retail", sourceId: "home#statement-review-then-payments-that-match-how-yo", route: "/", href: "/", label: "Retail POS",
    passage: "Retail POS: inventory counts, returns, and counter checkout",
  },
  {
    id: "payments.trade", sourceId: "home#statement-review-then-payments-that-match-how-yo", route: "/", href: "/", label: "Service POS",
    passage: "Service POS: deposits, invoices, and mobile take-payment on site",
  },
  {
    id: "payments.placement", sourceId: "services#pos-placement", route: "/services", href: "/services#pos-placement", label: "POS placement and processing commitment",
    passage: "We put modern payment equipment in your business at no upfront cost. Free install, free training. You process with KCG, and the equipment stays. We explain the processing commitment before you decide.",
  },
  {
    id: "websites.overview", sourceId: "home#website-builds", route: "/", href: "/", label: "Website builds",
    passage: "Websites built around how your customers decide, not a template. Business sites, stores, bookings and AI chat.",
  },
  {
    id: "websites.search", sourceId: "home#a-website-that-works-while-you-work", route: "/", href: "/", label: "Website design and search visibility",
    passage: "Every site is designed around what your customers actually need to decide, then built so search engines and people can find clear answers. Business sites, stores, booking flows, and AI chat when it earns its keep.",
  },
  {
    id: "websites.enquiry", sourceId: "home#a-website-that-works-while-you-work", route: "/", href: "/", label: "Booking and enquiry flows",
    passage: "Booking, quote and enquiry flows that land in your inbox",
  },
  {
    id: "ai.overview", sourceId: "services-ai-agents#hub", route: "/services/ai-agents", href: "/services/ai-agents", label: "Virtual assistants and human review",
    passage: "KCG configures named virtual assistants that keep doing a real job in the apps you already run: sales follow-up, customer service, scheduling, and ops. You keep a named reviewer before irreversible sends, publishes, or spend.",
  },
  {
    id: "financing.scope", sourceId: "services-consumer-financing#match-the-program-to-what-you-sell", route: "/services/consumer-financing", href: "/services/consumer-financing", label: "Consumer financing scope",
    passage: "We compare available programs against those requirements and review merchant charges. Approval criteria and customer pricing belong to the provider; we do not promise that every applicant will qualify.",
  },
  {
    id: "privacy.collection", sourceId: "privacy#what-we-collect", route: "/privacy", href: "/privacy", label: "Information submitted to KCG",
    passage: "When you contact Keystone Consulting Group LLC (KCG) or book a call, we collect the information you submit: your name, email address, phone number, business information, and any message or notes. Booking also includes the date and time you choose. Only send information we need to help you. Do not put card numbers, passwords, or other sensitive account details in these forms.",
  },
] as const;

