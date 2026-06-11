import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, Shield, X, ArrowRight, MonitorSmartphone, 
  CreditCard, BarChart3, Percent, DollarSign, Zap, Globe, 
  TrendingUp, Layers, Users, Clock, Star, Smartphone,
  Wifi, ShoppingCart, Utensils, Heart, Scissors, Wrench,
  Fuel, AlertTriangle, HandHeart, Briefcase, Building2,
  Store, Bot, LayoutDashboard, Search, Headphones, Code,
  Receipt, Banknote, ChevronRight, Sparkles, Lock, LineChart,
  PieChart, Target, Truck, Package, Calendar, MessageSquare,
  FileText, Settings, Database, Rocket
} from 'lucide-react';
import { ContactForm } from '../App';

// Scroll animation hook
function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export const INDUSTRY_LANDING_PAGES: Record<string, any> = {
  'restaurants': {
    title: 'Restaurants & Food Service',
    headline: 'The All-in-One Growth System for Restaurants',
    subheadline: 'From tableside payments to online ordering, kitchen displays to loyalty programs — Keystone gives restaurants the tools to cut costs, speed up service, and grow revenue.',
    badge: 'Restaurant Solutions',
    solutionCards: [
      { title: 'Zero-Fee Payment Processing', desc: 'Eliminate up to 100% of credit card processing fees with our Edge Program. On a $50 average ticket, that\'s thousands back every month.', icon: CreditCard },
      { title: 'Smart POS & Kitchen Displays', desc: 'Modern POS systems with integrated kitchen display screens, table management, and split-check capabilities — all free with our placement program.', icon: MonitorSmartphone },
      { title: 'Online Ordering & Delivery', desc: 'Launch your own branded online ordering system. No third-party commissions eating into your margins — you own the customer relationship.', icon: Globe },
      { title: 'Consumer Financing', desc: 'Let customers pay for catering, large party tabs, and private events over time. You get paid immediately, they pay on their terms.', icon: Banknote },
      { title: 'Website & Google Presence', desc: 'Custom website with built-in menus, reservations, and SEO optimization. Plus Google My Business setup to dominate local search.', icon: Code },
      { title: 'Loyalty & Marketing', desc: 'Turn first-time diners into regulars with automated loyalty programs, email campaigns, and targeted promotions based on visit history.', icon: Star },
    ],
    features: [
      { title: 'Tableside Payments in Under 2 Seconds', desc: 'Contactless tap-to-pay, Apple Pay, Google Pay, and chip — process payments right at the table. Faster turns, happier guests, bigger tips. Our terminals process in under 2 seconds so you never have a line.', icon: Zap },
      { title: 'One Dashboard for Every Channel', desc: 'See dine-in, takeout, delivery, and online orders in a single real-time dashboard. Track daily deposits, compare day-over-day revenue, and identify your busiest hours — all without spreadsheets.', icon: BarChart3 },
      { title: 'AI-Powered Customer Insights', desc: 'Know what your best customers order, when they visit, and how much they spend. Our CRM builds customer profiles automatically so you can send targeted offers that actually drive repeat visits.', icon: Bot },
    ],
    benefits: ['Zero processing fees with Edge Program', 'Free POS terminal & kitchen display placement', 'Online ordering with no commission fees', 'Same-day deposits on all transactions', 'Contactless & mobile payments', 'Loyalty program integration', 'Real-time sales reporting', '24/7 dedicated support'],
    painPoints: ['Processing fees eating 2.9-3.5% of every transaction', 'Outdated POS slowing down table turns', 'Third-party delivery apps taking 15-30% commissions'],
    solutions: ['Edge Program eliminates up to 100% of processing fees', 'Modern smart terminals with sub-2-second tap payments', 'Branded online ordering — zero commissions, you own the data'],
    calculatorDefault: 45000,
    testimonial: { quote: "Keystone saved us over $14,000 in our first year. The POS upgrade was free and our kitchen tickets are 40% faster. I wish we'd switched sooner.", name: "Maria R.", business: "Bella's Italian Kitchen" }
  },

  'grocery': {
    title: 'Grocery & Supermarkets',
    headline: 'Payment Solutions Built for High-Volume Grocery Operations',
    subheadline: 'Thin margins demand maximum efficiency. Keystone cuts your processing costs to wholesale rates, speeds up checkout, and gives you inventory tools that prevent shrink.',
    badge: 'Grocery Solutions',
    solutionCards: [
      { title: 'Wholesale Interchange Rates', desc: 'Interchange-plus pricing at true wholesale rates. On $100K+/month in volume, even a fraction of a percent saves thousands.', icon: Percent },
      { title: 'High-Speed Checkout Terminals', desc: 'EMV + contactless terminals that process in under 2 seconds. Reduce checkout times, cut lines, and improve customer satisfaction scores.', icon: Zap },
      { title: 'Integrated POS & Inventory', desc: 'POS systems that sync with your inventory and vendor management. Real-time stock levels, automatic reorder alerts, and shrink tracking.', icon: ShoppingCart },
      { title: 'Self-Checkout Integration', desc: 'Support self-checkout kiosks and scan-and-go solutions that reduce labor costs while maintaining loss prevention controls.', icon: MonitorSmartphone },
      { title: 'EBT & SNAP Acceptance', desc: 'Full EBT/SNAP processing with compliant terminals and seamless integration into your existing checkout flow.', icon: CreditCard },
      { title: 'Customer Loyalty Programs', desc: 'Build loyalty with digital punch cards, points-based rewards, and personalized weekly specials based on purchase history.', icon: Star },
    ],
    features: [
      { title: 'Process $100K+/Month at Wholesale Rates', desc: 'Your volume gives you leverage — we make sure you use it. Interchange-plus pricing ensures you pay the actual card network rate with a thin, transparent markup. No bundled pricing tricks.', icon: TrendingUp },
      { title: 'Inventory Sync Across Every Register', desc: 'Every scan updates inventory in real time. Know exactly what\'s on your shelves, what\'s running low, and what\'s moving fast — across every register and every department.', icon: Database },
      { title: 'Multi-Lane & Multi-Department Reporting', desc: 'Track performance by department, by lane, by hour. See which departments are driving margin and which are costing you money. Make data-driven decisions about staffing and layout.', icon: PieChart },
    ],
    benefits: ['True interchange-plus wholesale pricing', 'Sub-2-second contactless checkout', 'Real-time inventory management', 'EBT/SNAP compliant terminals', 'Multi-lane & department reporting', 'Self-checkout kiosk support', 'Vendor management integration', 'Shrink & loss prevention tracking'],
    painPoints: ['Razor-thin margins eaten by 2.5%+ processing fees', 'Slow checkout lines losing customers to competitors', 'Inventory blind spots causing overstock and shrink'],
    solutions: ['Interchange-plus pricing saves 30-50% vs bundled rates', 'Fast EMV + contactless terminals with under 2-second processing', 'POS systems that sync inventory, vendors, and reorder points in real time'],
    calculatorDefault: 120000,
    testimonial: { quote: "We process over $100K/month and Keystone cut our fees by 40%. The inventory integration alone paid for the switch in the first month.", name: "Tom H.", business: "FreshMart Grocery" }
  },

  'healthcare': {
    title: 'Healthcare & Medical',
    headline: 'Secure, HIPAA-Friendly Payment Solutions for Healthcare',
    subheadline: 'Patient-friendly payment processing that integrates with your practice management software. Secure, compliant, and designed to reduce billing friction.',
    badge: 'Healthcare Solutions',
    solutionCards: [
      { title: 'PCI-Compliant Terminals', desc: 'End-to-end encrypted, PCI DSS compliant hardware that protects patient payment data. Tokenization ensures card numbers never touch your systems.', icon: Lock },
      { title: 'Patient Financing', desc: 'Offer flexible payment plans for procedures, treatments, and copays. Patients pay over 3-12 months, you get paid in full upfront.', icon: Banknote },
      { title: 'Recurring & Subscription Billing', desc: 'Set up automatic recurring payments for membership-based practices, concierge medicine, and ongoing treatment plans.', icon: Calendar },
      { title: 'Online Payment Portal', desc: 'Let patients pay bills online before, during, or after their visit. Reduce front-desk bottlenecks and collect faster.', icon: Globe },
      { title: 'Practice Website & SEO', desc: 'Custom medical website with appointment booking, provider bios, and local SEO to attract new patients searching in your area.', icon: Search },
      { title: 'Custom Patient CRM', desc: 'Track patient interactions, automate appointment reminders, and manage referral pipelines with a CRM built for healthcare workflows.', icon: LayoutDashboard },
    ],
    features: [
      { title: 'Zero-Touch Patient Payments', desc: 'Contactless tap-to-pay at check-in, automated copay collection, and text-to-pay invoicing. Patients love the convenience, your front desk loves the reduced workload. Everyone wins.', icon: Smartphone },
      { title: 'Integrated Billing & Reconciliation', desc: 'Payment data syncs with your practice management software. No more manual reconciliation, no more mismatched ledgers. Every payment is automatically matched to the right patient account.', icon: FileText },
      { title: 'Revenue Cycle Optimization', desc: 'Identify where money is leaking in your billing cycle. We help you reduce days-to-pay, increase collection rates, and automate follow-up on outstanding balances.', icon: LineChart },
    ],
    benefits: ['PCI DSS compliant hardware', 'End-to-end encryption & tokenization', 'Patient financing with immediate payout', 'Recurring billing for memberships', 'Online patient payment portal', 'Automated appointment reminders', 'Practice management integration', 'HIPAA-friendly data handling'],
    painPoints: ['Complex billing with high processing costs eating into reimbursements', 'Patients frustrated by confusing payment experiences', 'Security and compliance risks with outdated systems'],
    solutions: ['Transparent interchange-plus pricing with no hidden surcharges', 'Patient-facing terminals with contactless, mobile pay, and text-to-pay', 'PCI-compliant hardware with end-to-end encryption and tokenization'],
    calculatorDefault: 35000,
    testimonial: { quote: "Our patients love the tap-to-pay option and we love paying zero in processing fees with The Edge Program. The online portal cut our billing calls in half.", name: "Dr. Lisa M.", business: "Summit Family Practice" }
  },

  'ecommerce': {
    title: 'E-Commerce & Online Business',
    headline: 'E-Commerce Payment Processing That Scales With You',
    subheadline: 'Seamless checkout, gateway integration, fraud protection, and unified reporting — everything you need to convert more visitors and keep more revenue.',
    badge: 'E-Commerce Solutions',
    solutionCards: [
      { title: 'Low-Rate Online Processing', desc: 'Competitive e-commerce rates with interchange-plus pricing. No inflated card-not-present premiums — just transparent, honest pricing.', icon: CreditCard },
      { title: 'Gateway Integrations', desc: 'Plug into Shopify, WooCommerce, BigCommerce, or any custom cart with our gateway integrations. NMI, PayTrace, and Authorize.net compatible.', icon: Layers },
      { title: 'Fraud Prevention', desc: 'AI-powered fraud detection, AVS, CVV verification, and velocity filters that block chargebacks before they happen — without blocking good customers.', icon: Shield },
      { title: 'Subscription & Recurring Billing', desc: 'Built-in subscription management for SaaS, memberships, and subscription boxes. Auto-retry failed payments and reduce involuntary churn.', icon: Calendar },
      { title: 'Custom Storefront Website', desc: 'High-conversion custom website with product pages, checkout optimization, and mobile-first design that turns browsers into buyers.', icon: Code },
      { title: 'Unified Omnichannel Dashboard', desc: 'See online, in-person, and marketplace sales in one dashboard. Unified inventory, unified reporting, one source of truth.', icon: BarChart3 },
    ],
    features: [
      { title: 'Checkout Conversion Optimization', desc: 'Hosted payment pages, one-click checkout, and saved card tokens reduce friction at the most critical step. Our merchants see 10-20% higher checkout completion rates versus standard gateway setups.', icon: TrendingUp },
      { title: 'Multi-Channel Inventory Sync', desc: 'Sell on your website, Amazon, Etsy, and in-person — and never oversell. Inventory updates in real time across every channel so you never have to manually reconcile stock.', icon: Package },
      { title: 'Chargeback Prevention & Recovery', desc: 'Our fraud tools catch suspicious transactions before they become chargebacks. When disputes do happen, we provide the evidence and tools to win them back.', icon: Lock },
    ],
    benefits: ['Interchange-plus e-commerce rates', 'Gateway integration (NMI, PayTrace)', 'AI-powered fraud prevention', 'Subscription billing & auto-retry', 'Shopify & WooCommerce compatible', 'One-click checkout tokens', 'Real-time inventory sync', 'Chargeback prevention tools'],
    painPoints: ['High online processing rates eating into margins', 'Cart abandonment from clunky, slow checkout flows', 'Chargebacks and fraud draining revenue'],
    solutions: ['Interchange-plus pricing — no inflated card-not-present premiums', 'Hosted payment pages with one-click checkout and saved cards', 'AI fraud detection with AVS, CVV, and velocity filters'],
    calculatorDefault: 30000,
    testimonial: { quote: "Keystone integrated with our Shopify store in a day. Our checkout conversion went up 12% and chargebacks dropped by 60%.", name: "Rachel W.", business: "ThreadLine Apparel" }
  },

  'salons': {
    title: 'Salons & Spas',
    headline: 'Beautifully Simple Payment Solutions for Salons & Spas',
    subheadline: 'Sleek terminals, gift card programs, appointment-driven payments, and loyalty tools that match the premium experience you deliver to every client.',
    badge: 'Salon & Spa Solutions',
    solutionCards: [
      { title: 'Zero-Fee Processing', desc: 'The Edge Program means you keep 100% of every service. On a $150 color and cut, that\'s $4.35 you used to lose — now it stays in your pocket.', icon: DollarSign },
      { title: 'Sleek Smart Terminals', desc: 'Modern, countertop-friendly terminals with tap, chip, and swipe. They look as good as your salon does — no clunky hardware ruining your aesthetic.', icon: Smartphone },
      { title: 'Gift Cards & Memberships', desc: 'Sell digital and physical gift cards, manage memberships, and track balances — all integrated into your payment system.', icon: Star },
      { title: 'Appointment-Based Payments', desc: 'Collect deposits at booking, process payments at checkout, and send text-to-pay receipts — all tied to your appointment schedule.', icon: Calendar },
      { title: 'Salon Website & Booking', desc: 'Custom website with online booking, service menu, stylist profiles, and before/after galleries that attract new clients.', icon: Code },
      { title: 'Client Retention CRM', desc: 'Track client preferences, visit history, and product purchases. Automate rebooking reminders and birthday offers to drive repeat visits.', icon: Users },
    ],
    features: [
      { title: 'Tip-Friendly Payment Experience', desc: 'Customizable tip prompts on the terminal screen make it easy for clients to add gratuity. Our merchants see 15-20% higher tip averages compared to paper receipt tipping.', icon: Heart },
      { title: 'Integrated Booking & Payment Flow', desc: 'Client books online → deposit is charged → service is performed → remaining balance is processed at checkout. One seamless flow from appointment to payment with no manual steps.', icon: Layers },
      { title: 'Retail Product Sales', desc: 'Track retail product inventory alongside service revenue. See which stylists are selling the most product, set up retail commission structures, and auto-reorder bestsellers.', icon: ShoppingCart },
    ],
    benefits: ['Zero processing fees with Edge Program', 'Sleek, modern terminal hardware', 'Digital & physical gift card system', 'Appointment deposit collection', 'Custom tip prompts', 'Online booking integration', 'Client preference tracking', 'Retail inventory management'],
    painPoints: ['Processing fees eating into service revenue — $800+/month', 'Outdated terminal doesn\'t match your brand experience', 'No easy way to sell gift cards, memberships, or retail products'],
    solutions: ['Edge Program means you keep 100% of every service payment', 'Sleek smart terminals with tap, chip, and swipe — hardware you\'re proud to display', 'Built-in gift card, membership, and retail POS with inventory tracking'],
    calculatorDefault: 20000,
    testimonial: { quote: "We went from paying $800/mo in fees to zero with The Edge Program. Plus our clients love the new gift card system — we sold $12K in gift cards last holiday season.", name: "Sarah K.", business: "Glow Wellness Spa" }
  },

  'auto-repair': {
    title: 'Auto Repair & Service',
    headline: 'Payment Processing Built for Auto Repair Shops',
    subheadline: 'High-ticket transactions deserve low-cost processing. We help shops keep more of every repair ticket and close more big jobs with consumer financing.',
    badge: 'Auto Repair Solutions',
    solutionCards: [
      { title: 'Zero Fees on Big Tickets', desc: 'On a $2,000 transmission job, you used to lose $60+ in fees. The Edge Program eliminates those fees entirely — you keep every dollar.', icon: DollarSign },
      { title: 'Consumer Financing', desc: 'Close more big jobs by offering customers 3-12 month payment plans. You get paid in full immediately, they pay on their schedule.', icon: Banknote },
      { title: 'Shop Management Integration', desc: 'POS that syncs with Mitchell, ShopWare, and other shop management systems. Invoicing, estimates, and payments in one flow.', icon: Settings },
      { title: 'Text-to-Pay Invoicing', desc: 'Send invoices via text message. Customer reviews the estimate, approves the work, and pays — all from their phone. No more phone tag.', icon: MessageSquare },
      { title: 'Shop Website & Local SEO', desc: 'Custom website with service listings, online appointment requests, and Google SEO to show up when drivers search "auto repair near me."', icon: Search },
      { title: 'Fleet & B2B Invoicing', desc: 'Set up fleet accounts with monthly invoicing, purchase order tracking, and Level 2/3 processing for lower corporate card rates.', icon: Truck },
    ],
    features: [
      { title: 'Close More Big Jobs With Financing', desc: 'When a customer needs a $3,000 engine repair but doesn\'t have the cash, financing turns a "not right now" into a "let\'s do it." You get paid in full today, they pay $125/month. Win-win.', icon: TrendingUp },
      { title: 'Digital Estimates → Approval → Payment', desc: 'Send a digital estimate via text. Customer reviews and approves. Work gets done. Payment is processed — all in one digital workflow. No paper, no phone calls, no chasing payments.', icon: FileText },
      { title: 'Real-Time Shop Performance Tracking', desc: 'See average ticket value, technician productivity, parts-to-labor ratios, and daily revenue at a glance. Identify which services are most profitable and where you\'re leaving money on the table.', icon: BarChart3 },
    ],
    benefits: ['Zero fees on $500+ repair tickets', 'Consumer financing for big jobs', 'Shop management software integration', 'Digital estimates & text-to-pay', 'Fleet & B2B invoicing', 'Level 2/3 corporate card processing', 'Local SEO for "near me" searches', 'Same-day deposits'],
    painPoints: ['Losing $60+ in processing fees on every major repair ticket', 'Customers declining big jobs because they can\'t pay upfront', 'Manual invoicing and payment collection slowing down operations'],
    solutions: ['Edge Program eliminates fees on every ticket — small and large', 'Consumer financing lets customers pay over time while you get paid today', 'Text-to-pay invoicing and digital estimate approval eliminate paperwork'],
    calculatorDefault: 40000,
    testimonial: { quote: "On a $2,000 transmission job, I used to lose $60+ in fees. Now I keep every dollar. The financing option alone increased our average ticket by 35%.", name: "James T.", business: "Peak Auto Repair" }
  },

  'gas-stations': {
    title: 'Gas Stations & C-Stores',
    headline: 'Fuel & C-Store Payment Solutions Under One Roof',
    subheadline: 'Outdoor EMV compliance, pump integration, and c-store POS — all from one provider with transparent pricing that protects your razor-thin fuel margins.',
    badge: 'Fuel & C-Store Solutions',
    solutionCards: [
      { title: 'Outdoor EMV Compliance', desc: 'Get EMV-ready at the pump with compliant outdoor payment terminals. Avoid fraud liability shifts and protect your station from counterfeit card losses.', icon: Shield },
      { title: 'Unified Fuel + C-Store POS', desc: 'One system for pumps and indoor sales. Track fuel volume, c-store inventory, lottery, and tobacco — all on one dashboard.', icon: MonitorSmartphone },
      { title: 'Interchange-Plus Fuel Pricing', desc: 'On $150K+/month in fuel volume, even 0.1% savings is $150/month. We pass through true interchange with a transparent, thin markup.', icon: Percent },
      { title: 'Loyalty & Fuel Rewards', desc: 'Build loyalty with cents-off-per-gallon rewards, c-store purchase incentives, and digital loyalty cards that drive repeat visits.', icon: Star },
      { title: 'Fleet Card Acceptance', desc: 'Accept WEX, Voyager, and other fleet cards with Level 3 data capture for optimized interchange rates on commercial fueling.', icon: Truck },
      { title: 'Station Website & Google Profile', desc: 'Custom station website with fuel prices, c-store specials, and optimized Google profile to show up in local map searches.', icon: Globe },
    ],
    features: [
      { title: 'Pump-to-POS Integration', desc: 'Fuel transactions flow directly into your POS system. See real-time fuel volume by grade, track tank levels, and reconcile fuel sales with c-store transactions — all in one place.', icon: Database },
      { title: 'Fraud Protection at the Pump', desc: 'EMV chip reading at the pump prevents counterfeit card fraud. Combined with velocity limits and fraud alerts, you\'re protected from the most common sources of pump-side losses.', icon: Lock },
      { title: 'C-Store Inventory & Margin Tracking', desc: 'Track c-store inventory down to the SKU level. Know your margins on every category — tobacco, snacks, beverages, lottery — and make stocking decisions based on data, not guesswork.', icon: PieChart },
    ],
    benefits: ['Outdoor EMV-ready payment terminals', 'Unified fuel + c-store POS system', 'True interchange-plus fuel pricing', 'Fleet card acceptance (WEX, Voyager)', 'Fuel rewards & loyalty programs', 'Real-time tank level monitoring', 'C-store inventory tracking', 'Fraud protection at the pump'],
    painPoints: ['EMV compliance deadline creating liability risk at the pump', 'Separate systems for fuel and c-store sales creating blind spots', 'Interchange fees destroying already-thin fuel margins'],
    solutions: ['EMV-ready outdoor terminals that eliminate fraud liability', 'Unified POS for fuel + c-store on one integrated dashboard', 'Interchange-plus pricing that maximizes per-gallon profit'],
    calculatorDefault: 150000,
    testimonial: { quote: "Keystone got us EMV compliant at the pump, unified our fuel and c-store POS, and cut our indoor processing fees in half. Best decision we made this year.", name: "Mike D.", business: "QuickFuel Express" }
  },

  'high-risk': {
    title: 'High-Risk Merchants',
    headline: 'Reliable Payment Processing for High-Risk Businesses',
    subheadline: 'CBD, vape, smoke shops, supplements, and other high-risk verticals — we specialize in getting you approved, keeping you processing, and protecting you from account freezes.',
    badge: 'High-Risk Solutions',
    solutionCards: [
      { title: 'Stable Merchant Accounts', desc: 'We work with banks and processors that understand high-risk verticals. No surprise freezes, no random holds, no account terminations. Stability you can count on.', icon: Shield },
      { title: 'Competitive High-Risk Rates', desc: 'High-risk doesn\'t have to mean highway robbery. We negotiate competitive rates and pass through transparent pricing with no hidden fees.', icon: Percent },
      { title: 'Chargeback Prevention', desc: 'Proactive chargeback alerts, dispute management, and fraud tools that keep your chargeback ratio low and your account in good standing.', icon: Lock },
      { title: 'Dedicated Account Manager', desc: 'A human who understands your industry, answers your calls, and advocates for you when issues arise. Not a generic support ticket queue.', icon: Users },
      { title: 'Compliant Website & SEO', desc: 'Custom website built with payment processor compliance requirements in mind. Product descriptions, disclaimers, and terms that keep you approved.', icon: Code },
      { title: 'Age Verification & ID Scanning', desc: 'Integrated age verification at the point of sale for regulated products. Stay compliant with local and federal requirements.', icon: FileText },
    ],
    features: [
      { title: 'We Specialize in "Hard to Place" Merchants', desc: 'If you\'ve been turned down or terminated by other processors, we get it. We work with a network of acquiring banks that specifically underwrite high-risk verticals. Our approval rate is 90%+ for merchants with clean processing history.', icon: Target },
      { title: 'Chargeback Ratio Management', desc: 'We don\'t just process your payments — we actively monitor your chargeback ratio and intervene before it hits dangerous levels. Prevention tools, alerts, and dispute management keep your ratio under 1%.', icon: BarChart3 },
      { title: 'Multi-Processor Redundancy', desc: 'We can set up backup processing accounts so if one processor has issues, your business doesn\'t stop. Failover routing ensures you never miss a sale due to processor downtime.', icon: Layers },
    ],
    benefits: ['90%+ approval rate for clean merchants', 'Stable, long-term merchant accounts', 'Transparent high-risk pricing', 'Proactive chargeback prevention', 'Dedicated account manager', 'Multi-processor redundancy', 'Compliance-ready website', 'Age verification integration'],
    painPoints: ['Constant account freezes, holds, and unexpected terminations', 'Sky-high processing rates because you\'re classified as "high-risk"', 'Difficulty finding a reliable processor who understands your business'],
    solutions: ['Stable accounts through banks that specialize in your vertical', 'Competitive, transparent rates — no "risk premium" gouging', 'A dedicated account manager who knows CBD, vape, and supplements inside and out'],
    calculatorDefault: 25000,
    testimonial: { quote: "Three processors dropped us before Keystone. We've been stable for 14 months and counting. Our account manager actually understands the CBD industry.", name: "Alex P.", business: "Green Leaf CBD" }
  },

  'nonprofits': {
    title: 'Nonprofits & Churches',
    headline: 'Lower Costs on Every Donation So More Goes to Your Mission',
    subheadline: 'Nonprofit-friendly payment processing, recurring giving, tap-to-donate kiosks, and online donation pages — everything you need to maximize the impact of every gift.',
    badge: 'Nonprofit Solutions',
    solutionCards: [
      { title: 'Nonprofit-Friendly Rates', desc: 'Interchange-plus pricing with nonprofit-specific rate optimization. Every basis point saved is more money going directly to your mission.', icon: Percent },
      { title: 'Recurring Giving', desc: 'Set up automatic monthly, weekly, or custom recurring donations with online giving pages. Donors set it and forget it — your revenue becomes predictable.', icon: Calendar },
      { title: 'Tap-to-Give Kiosks', desc: 'Modern, touchscreen donation kiosks for lobbies, events, and services. Customizable donation amounts and fund designations on a beautiful interface.', icon: Smartphone },
      { title: 'Online Donation Pages', desc: 'Branded donation pages that embed on your website. Mobile-optimized, secure, and customizable with fund designations, tribute gifts, and matching.', icon: Globe },
      { title: 'Organization Website', desc: 'Custom website with mission storytelling, event calendars, volunteer sign-ups, and integrated donation buttons on every page.', icon: Code },
      { title: 'Donor CRM & Reporting', desc: 'Track every donor, every gift, and every interaction. Generate tax receipts automatically and segment donors for targeted outreach campaigns.', icon: LayoutDashboard },
    ],
    features: [
      { title: 'Maximize the Impact of Every Dollar', desc: 'When a donor gives $100, you should keep as close to $100 as possible. Our nonprofit rates are 30-60% lower than standard processing, and the Edge Program can eliminate fees entirely.', icon: Heart },
      { title: 'Automatic Tax Receipts & Year-End Statements', desc: 'Every donation triggers an automatic tax receipt via email. At year-end, generate comprehensive giving statements for every donor — no manual work required.', icon: FileText },
      { title: 'Event & Campaign Fundraising', desc: 'Create dedicated fundraising pages for campaigns, events, and capital drives. Track progress toward goals in real time and share with your congregation or community.', icon: Target },
    ],
    benefits: ['Nonprofit-optimized interchange rates', 'Recurring giving with automatic billing', 'Modern tap-to-donate kiosks', 'Branded online giving pages', 'Automatic tax receipts', 'Donor CRM & segmentation', 'Fund designation & tribute gifts', 'Year-end giving statements'],
    painPoints: ['Processing fees reducing the impact of every donation', 'No easy way to set up and manage recurring giving', 'Outdated donation kiosks that donors don\'t want to use'],
    solutions: ['Nonprofit-optimized rates that keep more of every gift', 'Online recurring giving pages with set-it-and-forget-it monthly donations', 'Modern touchscreen kiosks with custom amounts and fund designations'],
    calculatorDefault: 15000,
    testimonial: { quote: "Every dollar matters for our church. Keystone cut our processing fees by 60% and the online recurring giving page tripled our monthly committed givers.", name: "Pastor David R.", business: "Grace Community Church" }
  },

  'b2b': {
    title: 'B2B & Professional Services',
    headline: 'Payment Solutions for Businesses That Bill Other Businesses',
    subheadline: 'Invoice payments, ACH processing, virtual terminals, and Level 2/3 data capture — built for companies that process large B2B transactions.',
    badge: 'B2B Solutions',
    solutionCards: [
      { title: 'Level 2/3 Processing', desc: 'Unlock reduced interchange rates on corporate, purchasing, and government cards by automatically capturing Level 2/3 transaction data. Saves 0.5-1.0% per transaction.', icon: Percent },
      { title: 'Email Invoice & Pay-Now Links', desc: 'Send professional invoices via email with embedded pay-now links. Clients click, pay by card or ACH, and you get notified instantly. No more waiting for checks.', icon: Receipt },
      { title: 'ACH & Bank Transfer', desc: 'Offer clients the option to pay by ACH bank transfer at lower rates than card processing. Ideal for large invoices where card fees add up fast.', icon: Banknote },
      { title: 'Virtual Terminal', desc: 'Process payments from anywhere — your office, the job site, or your phone. Key in card numbers manually for phone orders and remote payments.', icon: MonitorSmartphone },
      { title: 'Professional Website', desc: 'Custom B2B website with service descriptions, case studies, team bios, and integrated payment portal for client convenience.', icon: Code },
      { title: 'CRM & Pipeline Tracking', desc: 'Manage leads, track proposals, and monitor your sales pipeline with a CRM configured for your B2B sales process.', icon: LayoutDashboard },
    ],
    features: [
      { title: 'Save Big With Level 2/3 Data Capture', desc: 'Corporate and government cards qualify for significantly lower interchange rates when Level 2/3 data is submitted. On a $5,000 invoice, that\'s $25-50 saved per transaction. We configure your terminal to capture this data automatically.', icon: DollarSign },
      { title: 'Automated Invoice Reminders', desc: 'Set up automatic payment reminders at 30, 60, and 90 days past due. Reduce your days-to-pay without uncomfortable follow-up calls. Let the system do the chasing.', icon: Clock },
      { title: 'Accounting Software Integration', desc: 'Payment data syncs with QuickBooks, Xero, and FreshBooks. Invoices are automatically marked as paid, reconciliation happens in the background, and your books are always up to date.', icon: Database },
    ],
    benefits: ['Level 2/3 interchange optimization', 'Email invoicing with pay-now links', 'ACH bank transfer processing', 'Virtual terminal for remote payments', 'Automated payment reminders', 'QuickBooks & Xero integration', 'Recurring billing for retainers', 'Same-day deposits available'],
    painPoints: ['Losing 2.5-3.5% on large invoice payments via credit card', 'Clients slow to pay because you don\'t offer convenient options', 'Manual invoicing and reconciliation consuming admin hours'],
    solutions: ['Level 2/3 processing saves 0.5-1.0% on every corporate card payment', 'Email invoices with embedded pay-now links — clients pay in 2 clicks', 'Accounting integration eliminates manual reconciliation entirely'],
    calculatorDefault: 50000,
    testimonial: { quote: "Our average invoice is $5,000. Level 2/3 processing through Keystone saves us hundreds every month. The QuickBooks integration was the cherry on top.", name: "David M.", business: "Boxed Logistics" }
  },

  'real-estate': {
    title: 'Real Estate',
    headline: 'Payment Processing Built for Real Estate Professionals',
    subheadline: 'Earnest money deposits, commission splits, rental collections, and online payment portals — streamline every financial transaction in your real estate business.',
    badge: 'Real Estate Solutions',
    solutionCards: [
      { title: 'High-Ticket Payment Processing', desc: 'Interchange-plus pricing optimized for large transactions. Earnest deposits, commission payments, and closing fees processed at the lowest possible rates.', icon: DollarSign },
      { title: 'Online Payment Portals', desc: 'Tenant payment portals for rent collection, HOA dues, and property management fees. Automatic receipts and late fee tracking built in.', icon: Globe },
      { title: 'Virtual Terminal & Invoicing', desc: 'Process payments remotely for deposits, fees, and services. Send professional invoices with pay-now links for fast, hands-off collection.', icon: MonitorSmartphone },
      { title: 'ACH Rent Collection', desc: 'Lower-cost ACH bank transfers for recurring rent payments. Auto-debit on the 1st of every month with automatic late fee calculation.', icon: Calendar },
      { title: 'Agent & Brokerage Website', desc: 'Custom real estate website with property listings, agent profiles, market reports, and integrated contact forms that generate leads.', icon: Code },
      { title: 'Lead Management CRM', desc: 'Track buyer and seller leads, automate follow-up sequences, and manage your pipeline from first contact to closing.', icon: LayoutDashboard },
    ],
    features: [
      { title: 'Collect Deposits & Fees Without the Hassle', desc: 'Send a payment link via text or email. Your client pays the earnest deposit, application fee, or commission split from their phone. No checks to deposit, no wire transfer coordination, no bank runs.', icon: Smartphone },
      { title: 'Automated Rent Collection', desc: 'Tenants set up autopay once. Rent is collected on the 1st, late fees are applied automatically on the 5th, and you get a deposit the next business day. Property management on autopilot.', icon: Clock },
      { title: 'Commission & Split Tracking', desc: 'Track commission splits between agents, referral partners, and brokerages. Automated payouts and reporting so everyone gets paid accurately and on time.', icon: PieChart },
    ],
    benefits: ['Optimized rates for high-ticket transactions', 'Tenant online payment portal', 'ACH rent auto-collection', 'Automated late fee calculation', 'Virtual terminal & email invoicing', 'Commission split tracking', 'Lead management CRM', 'Property listing website'],
    painPoints: ['High processing fees on large earnest money and commission payments', 'Chasing tenants for rent checks every month', 'Manual invoicing and payment tracking slowing down operations'],
    solutions: ['Interchange-plus pricing saves significantly on $1,000+ transactions', 'Automated rent collection with ACH auto-debit and late fee management', 'Email & text invoicing with pay-now links for instant remote collection'],
    calculatorDefault: 60000,
    testimonial: { quote: "Keystone set us up with a virtual terminal and tenant portal. Collecting rent and deposits is now completely hands-off. We manage 40 units and haven't written a single receipt in months.", name: "Jennifer L.", business: "Summit Realty Group" }
  },

  'retail': {
    title: 'Retail Stores',
    headline: 'Payment Solutions That Keep Your Checkout Fast & Your Margins Healthy',
    subheadline: 'Modern POS systems, contactless payments, inventory management, and zero-fee programs — everything a retail store needs to compete in today\'s market.',
    badge: 'Retail Solutions',
    solutionCards: [
      { title: 'Zero Processing Fees', desc: 'The Edge Program can eliminate up to 100% of your credit card processing fees. Every dollar your customer pays is a dollar you keep.', icon: DollarSign },
      { title: 'Fast Tap-to-Pay Terminals', desc: 'Sub-2-second contactless payments with Apple Pay, Google Pay, and tap-enabled cards. Faster checkout lines, happier customers.', icon: Zap },
      { title: 'Retail POS & Inventory', desc: 'Full-featured POS with barcode scanning, inventory tracking, purchase orders, and automatic reorder alerts when stock runs low.', icon: ShoppingCart },
      { title: 'E-Commerce Integration', desc: 'Sell online and in-store from one unified system. Inventory syncs across both channels so you never oversell or understock.', icon: Globe },
      { title: 'Retail Website', desc: 'Custom website with product catalog, online ordering, store locator, and brand storytelling that drives foot traffic and online sales.', icon: Code },
      { title: 'Customer Loyalty Program', desc: 'Points-based rewards, digital punch cards, and VIP tiers that turn first-time shoppers into loyal regulars who spend more per visit.', icon: Star },
    ],
    features: [
      { title: 'Checkout in Under 2 Seconds', desc: 'Contactless tap payments process in under 2 seconds. No signatures, no PINs on small transactions, no friction. Your line moves faster, your customers are happier, and your hourly throughput increases.', icon: Clock },
      { title: 'Smart Inventory Management', desc: 'Know exactly what\'s on your shelves at all times. Set reorder points, track bestsellers vs slow movers, and generate purchase orders with one click. No more counting inventory by hand.', icon: Package },
      { title: 'Unified In-Store & Online Sales', desc: 'Whether a customer buys in your store or on your website, it\'s one transaction, one inventory count, one customer profile. Unified reporting gives you the full picture of your retail business.', icon: Layers },
    ],
    benefits: ['Zero processing fees with Edge Program', 'Sub-2-second contactless payments', 'Full retail POS with barcode scanning', 'Inventory management & auto-reorder', 'Online + in-store inventory sync', 'Customer loyalty programs', 'Real-time sales reporting', 'Same-day deposits'],
    painPoints: ['Processing fees cutting into already-thin retail margins', 'Outdated POS causing slow checkout and lost sales', 'No unified view of in-store and online inventory'],
    solutions: ['Edge Program eliminates up to 100% of processing fees', 'Fast tap-to-pay terminals with Apple Pay and Google Pay', 'Unified POS with real-time inventory sync across all channels'],
    calculatorDefault: 35000,
    testimonial: { quote: "We switched to The Edge Program and our processing cost dropped to zero. The new POS with inventory tracking saves us 5 hours a week on manual counts.", name: "Carlos M.", business: "Westside Home Goods" }
  }
};


// ─── Template Component ─────────────────────────────────────────────────────────

export default function IndustryPageTemplate({ industryPath, onNavigate, onOpenModal }: { industryPath: string, onNavigate: (path: string) => void, onOpenModal: (title: string, content: React.ReactNode) => void }) {
  const data = INDUSTRY_LANDING_PAGES[industryPath];
  const [volume, setVolume] = useState(data?.calculatorDefault || 25000);
  useScrollAnimation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [industryPath]);

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-white">Industry not found.</div>;
  }

  const currentFees = volume * 0.029;
  const keystoneFees = volume * 0.00;
  const monthlySavings = currentFees - keystoneFees;

  return (
    <>
      {/* ─── 1. HERO ─────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-teal/10 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/10 border border-teal/20 text-teal text-xs font-medium uppercase tracking-wider mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              {data.badge}
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white mb-6 max-w-4xl mx-auto leading-[1.1]">
              {data.headline}
            </h1>
            <p className="text-offwhite/70 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed mb-10">
              {data.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => onOpenModal(`Free ${data.title} Analysis`, <ContactForm />)} 
                className="cta-button-pulse inline-flex items-center justify-center px-8 py-4 bg-teal text-white font-medium rounded-sm transition-all duration-300 ease-custom hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,128,128,0.4)]"
              >
                Get Your Free Statement Analysis
              </button>
              <a 
                href="tel:801-360-9156"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-white/20 text-white font-medium rounded-sm transition-all duration-300 hover:bg-white/5 hover:border-white/40"
              >
                Call (801) 360-9156
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. SOLUTIONS GRID ───────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-charcoal-dark/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Everything Your {data.title.split(' &')[0].split(' -')[0]} Business Needs</h2>
            <p className="text-offwhite/60 text-lg font-light max-w-2xl mx-auto">From payment processing to marketing, CRM to financing — one partner for every system in your business.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {data.solutionCards.map((card: any, i: number) => (
              <div 
                key={i}
                className="animate-on-scroll bg-slate-dark/30 border border-white/5 rounded-2xl p-8 hover:bg-slate-dark/50 hover:border-teal/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-teal/20 transition-all duration-300">
                  <card.icon className="w-6 h-6 text-teal" />
                </div>
                <h3 className="text-lg text-white font-medium mb-3 group-hover:text-teal transition-colors">{card.title}</h3>
                <p className="text-offwhite/60 font-light leading-relaxed text-sm">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 3. FEATURE SHOWCASE (Alternating) ───────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-24 md:space-y-32">
          {data.features.map((feature: any, i: number) => (
            <div 
              key={i}
              className={`animate-on-scroll grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${i % 2 !== 0 ? 'lg:grid-flow-dense' : ''}`}
            >
              {/* Text */}
              <div className={i % 2 !== 0 ? 'lg:col-start-2' : ''}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal text-xs font-medium uppercase tracking-wider mb-6">
                  <feature.icon className="w-3.5 h-3.5" />
                  Feature {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="font-serif text-3xl md:text-4xl text-white mb-4 leading-tight">{feature.title}</h3>
                <p className="text-offwhite/70 text-lg font-light leading-relaxed">{feature.desc}</p>
              </div>
              {/* Visual */}
              <div className={i % 2 !== 0 ? 'lg:col-start-1' : ''}>
                <div className="relative h-[280px] md:h-[340px] rounded-2xl overflow-hidden border border-white/10 bg-slate-dark/30 flex items-center justify-center group shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_0_50px_rgba(0,128,128,0.15)] transition-all duration-500">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,128,128,0.12)_0%,transparent_70%)] opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <feature.icon className="w-20 h-20 text-teal/25 group-hover:text-teal/50 group-hover:scale-110 transition-all duration-700" strokeWidth={0.75} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. WHY KEYSTONE — Benefits Checklist ────────────────────────────── */}
      <section className="py-20 md:py-28 bg-charcoal-dark/40 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Why {data.title.split(' &')[0].split(' -')[0]} Businesses Choose Keystone</h2>
            <p className="text-offwhite/60 text-lg font-light max-w-xl mx-auto">Every feature, every service, every system — designed specifically for your industry.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto animate-on-scroll">
            {data.benefits.map((benefit: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-dark/20 border border-white/5 hover:border-teal/20 hover:bg-teal/5 transition-all duration-300 group">
                <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                <span className="text-offwhite/80 font-light text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5. PAIN POINTS vs SOLUTIONS ──────────────────────────────────── */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">The Problems You're Facing — And How We Fix Them</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div className="animate-on-scroll">
              <h3 className="font-serif text-xl text-white/60 mb-8 uppercase tracking-wider text-sm">The Problems</h3>
              <div className="space-y-5">
                {data.painPoints.map((point: string, i: number) => (
                  <div key={i} className="bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 p-6 rounded-xl flex items-start gap-4 transition-all duration-300 group">
                    <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <p className="text-offwhite/80 font-light">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="animate-on-scroll" style={{ transitionDelay: '200ms' }}>
              <h3 className="font-serif text-xl text-teal/60 mb-8 uppercase tracking-wider text-sm">The Keystone Solution</h3>
              <div className="space-y-5">
                {data.solutions.map((point: string, i: number) => (
                  <div key={i} className="bg-teal/5 hover:bg-teal/10 border border-teal/20 hover:border-teal/40 p-6 rounded-xl flex items-start gap-4 transition-all duration-300 group">
                    <CheckCircle className="w-5 h-5 text-teal flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <p className="text-white font-light">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6. SAVINGS CALCULATOR ────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-charcoal-dark/40 border-y border-white/5">
        <div className="max-w-4xl mx-auto px-6 md:px-12">
          <div className="animate-on-scroll bg-slate-dark/40 border border-white/10 rounded-2xl p-8 md:p-12 shadow-[0_0_40px_rgba(0,0,0,0.4)] hover:shadow-[0_0_50px_rgba(0,128,128,0.15)] transition-all duration-500 relative overflow-hidden text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,128,128,0.1)_0%,transparent_70%)] opacity-50 hover:opacity-100 transition-opacity duration-500"></div>
            <h2 className="font-serif text-3xl text-white mb-2 relative z-10">Calculate Your Savings</h2>
            <p className="text-offwhite/50 mb-8 relative z-10">See how much you could save by switching to Keystone</p>
            
            <div className="relative z-10 max-w-lg mx-auto mb-10">
              <div className="flex justify-between items-end mb-4">
                <label className="text-offwhite/80 font-medium text-sm">Monthly Volume</label>
                <div className="text-2xl font-mono text-teal">${volume.toLocaleString()}</div>
              </div>
              <input 
                type="range" min="5000" max="500000" step="5000" 
                value={volume} onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-2 bg-charcoal rounded-lg appearance-none cursor-pointer accent-teal"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10 mb-8">
              <div className="p-6 bg-charcoal/50 rounded-xl border border-white/5">
                <div className="text-sm text-offwhite/50 mb-2">Current Fees (2.9%)</div>
                <div className="text-xl font-mono text-white/50 line-through">${currentFees.toLocaleString(undefined, {maximumFractionDigits:0})}/mo</div>
              </div>
              <div className="p-6 bg-teal/10 rounded-xl border border-teal/30">
                <div className="text-sm text-teal mb-2">With Keystone Edge Program</div>
                <div className="text-2xl font-mono text-teal font-medium">$0/mo</div>
              </div>
            </div>
            
            <div className="relative z-10 mb-8">
              <p className="text-lg text-white">You save <span className="font-mono text-teal font-medium text-2xl">${monthlySavings.toLocaleString(undefined, {maximumFractionDigits:0})}</span> per month</p>
              <p className="text-offwhite/40 text-sm mt-1">That's <span className="text-teal">${(monthlySavings * 12).toLocaleString(undefined, {maximumFractionDigits:0})}</span> back in your pocket every year</p>
            </div>

            <button 
              onClick={() => onOpenModal(`Free ${data.title} Analysis`, <ContactForm />)} 
              className="relative z-10 inline-flex items-center gap-2 px-8 py-4 bg-teal text-white font-medium rounded-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,128,128,0.4)]"
            >
              Get Your Free Analysis <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── 7. TESTIMONIAL ──────────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center animate-on-scroll">
          <div className="mb-8">
            <QuoteIcon className="w-12 h-12 text-teal/20 mx-auto" />
          </div>
          <p className="font-serif text-2xl md:text-3xl text-white leading-relaxed mb-8">
            "{data.testimonial.quote}"
          </p>
          <div className="inline-flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-teal/20 border border-teal/40 flex items-center justify-center text-teal font-serif text-xl group-hover:bg-teal group-hover:text-white transition-all duration-300">
              {data.testimonial.name.charAt(0)}
            </div>
            <div className="text-left">
              <div className="text-white font-medium group-hover:text-teal transition-colors">{data.testimonial.name}</div>
              <div className="text-sm text-offwhite/50 uppercase tracking-widest">{data.testimonial.business}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 8. BOTTOM CTA ───────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-teal/5 border-t border-teal/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,128,128,0.1)_0%,transparent_70%)]"></div>
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10 animate-on-scroll">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-6">Ready to Upgrade Your {data.title.split(' &')[0].split(' -')[0]} Business?</h2>
          <p className="text-offwhite/60 text-lg font-light max-w-xl mx-auto mb-10 leading-relaxed">
            Get a free, no-obligation analysis of your current processing statement. We'll show you exactly how much you're overpaying and how to fix it.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => onOpenModal(`Free ${data.title} Analysis`, <ContactForm />)} 
              className="cta-button-pulse inline-flex items-center justify-center px-8 py-4 bg-white text-charcoal font-medium rounded-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              Get Your Free Statement Analysis
            </button>
            <a 
              href="/"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-white/20 text-white font-medium rounded-sm transition-all duration-300 hover:bg-white/5 hover:border-white/40"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

const QuoteIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
  </svg>
);
