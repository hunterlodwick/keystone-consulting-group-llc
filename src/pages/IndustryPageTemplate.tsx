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

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

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
    headline: 'Keep More of Every Check. Fill More Seats.',
    subheadline: 'Processing fees, third-party commissions, and slow service quietly shrink every night. We cut the waste, speed up the table, and put growth systems behind the kitchen door.',
    badge: 'Restaurant Solutions',
    heroImage: '/images/industries/restaurants.jpg',
    heroImageAlt: 'Empty cozy restaurant interior at night',
    solutionCards: [
      { title: 'Zero-Fee Payment Processing', desc: 'On a $50 ticket, 3% is $1.50 walking out the door. Edge brings that to zero. Over a busy month, that\'s thousands that stay in your drawer.', icon: CreditCard },
      { title: 'Smart POS & Kitchen Displays', desc: 'Paper tickets get lost in the rush. Digital screens route every order the second it rings up, so the line moves and the food comes out hot.', icon: MonitorSmartphone },
      { title: 'Online Ordering & Delivery', desc: 'DoorDash keeps 15-30% of every order and owns your customer. Your own ordering page means you keep the margin and the relationship.', icon: Globe },
      { title: 'Consumer Financing', desc: 'Catering and private events die on sticker shock. Let them pay over time, get funded in full today, and close the bookings you used to lose.', icon: Banknote },
      { title: 'Website & Google Presence', desc: 'Hungry people search, look at photos, and call. A site with menus and reservations, plus a strong Google profile, turns those searches into tables.', icon: Code },
      { title: 'Loyalty & Marketing', desc: 'First-timers forget you by next week. Automated loyalty and visit-based offers bring them back before the habit forms somewhere else.', icon: Star },
    ],
    features: [
      { title: 'Tableside Payments in Under 2 Seconds', desc: 'Guests hate waiting for the check. Tap-to-pay at the table turns them faster, tips go up, and your next party sits down sooner.', icon: Zap },
      { title: 'One Dashboard for Every Channel', desc: 'Dine-in, takeout, delivery, online. One screen shows what sold, what\'s depositing, and when you\'re slammed. No spreadsheet at midnight.', icon: BarChart3 },
      { title: 'AI-Powered Customer Insights', desc: 'Know who orders the ribeye every Friday and what brings them back. Targeted offers land with people who already like you, not strangers.', icon: Bot },
    ],
    benefits: ['Keep 100% of every card payment', 'Free POS and kitchen screens on placement', 'Online ordering with zero commission', 'Deposits that hit the same day', 'Tap and mobile pay at the table', 'Loyalty that brings them back', 'Sales numbers you can trust tonight', 'Someone to call at 10 PM if it breaks'],
    painPoints: ['2.9-3.5% of every ticket disappearing into processing fees', 'An old POS that turns a 90-minute table into two hours', 'Delivery apps taking 15-30% and owning your guests'],
    solutions: ['Edge cuts processing fees to zero so every check stays yours', 'Smart terminals under two seconds and kitchen screens that kill paper tickets', 'Your own online ordering. No commissions. You keep the customer.'],
    calculatorDefault: 45000,
    testimonial: { quote: "We got $14,000 back in year one. The free POS upgrade alone made kitchen tickets about 40% faster. I keep wondering why we waited.", name: "Maria R.", business: "Bella's Italian Kitchen" }
  },

  'grocery': {
    title: 'Grocery & Supermarkets',
    headline: 'Protect Every Penny on High-Volume Margins.',
    subheadline: 'Grocery margins leave no room for fat processing fees or slow lanes. We cut you to wholesale rates, speed up checkout, and tighten inventory so shrink stops eating the profit.',
    badge: 'Grocery Solutions',
    heroImage: '/images/industries/grocery.jpg',
    heroImageAlt: 'Grocery store aisle with dark moody lighting',
    solutionCards: [
      { title: 'Wholesale Interchange Rates', desc: 'At $100K a month, a fraction of a percent is real money. Interchange-plus means you pay the network rate plus a thin markup, not a bundled surprise.', icon: Percent },
      { title: 'High-Speed Checkout Terminals', desc: 'Slow lanes send shoppers to the next store. Terminals that clear in under two seconds keep the line moving and the carts finishing.', icon: Zap },
      { title: 'Integrated POS & Inventory', desc: 'Guessing what\'s on the shelf costs you twice. Real-time stock, reorder alerts, and shrink tracking so you catch the leak before the audit does.', icon: ShoppingCart },
      { title: 'Self-Checkout Integration', desc: 'Labor is expensive. Self-checkout handles the easy baskets so your people cover the complicated ones, without giving up loss prevention.', icon: MonitorSmartphone },
      { title: 'EBT & SNAP Acceptance', desc: 'Families who shop with benefits need a smooth checkout. Compliant terminals that just work keep that volume in your store, not across the street.', icon: CreditCard },
      { title: 'Customer Loyalty Programs', desc: 'Weekly specials only work if the right people see them. Digital rewards based on what they already buy bring them back for the next trip.', icon: Star },
    ],
    features: [
      { title: 'Process $100K+/Month at Wholesale Rates', desc: 'Your volume is leverage. We make sure you use it. Transparent interchange-plus, no bundled tricks that hide what you\'re really paying.', icon: TrendingUp },
      { title: 'Inventory Sync Across Every Register', desc: 'Every scan updates the count. Know what\'s low, what\'s flying, and what\'s dying across every lane and department before the truck arrives.', icon: Database },
      { title: 'Multi-Lane & Multi-Department Reporting', desc: 'See which departments make money and which burn it. Staff and layout decisions stop being gut calls when the numbers are this clear.', icon: PieChart },
    ],
    benefits: ['True wholesale rates, not bundled fluff', 'Checkout cleared in under two seconds', 'Inventory you can trust by the hour', 'EBT and SNAP without the headache', 'Reports by lane, hour, and department', 'Self-checkout that still catches shrink', 'Vendors tied into the same system', 'Shrink spotted before it becomes a write-off'],
    painPoints: ['2.5%+ fees chewing through already-thin grocery margins', 'Checkout lines long enough that shoppers bail mid-cart', 'Blind spots in inventory that show up as overstock and shrink'],
    solutions: ['Interchange-plus typically cuts fees 30-50% versus bundled rates', 'EMV and contactless terminals that finish in under two seconds', 'POS that syncs inventory, vendors, and reorder points in real time'],
    calculatorDefault: 120000,
    testimonial: { quote: "We run over $100K a month. Keystone cut our fees about 40%. The inventory piece alone paid for the switch in the first month.", name: "Tom H.", business: "FreshMart Grocery" }
  },

  'healthcare': {
    title: 'Healthcare & Medical',
    headline: 'Get Paid Faster Without Frustrating Patients.',
    subheadline: 'Billing friction costs you collections and goodwill. Patient-friendly payments, financing for bigger procedures, and systems that sync with your practice so money stops getting stuck.',
    badge: 'Healthcare Solutions',
    heroImage: '/images/industries/healthcare.jpg',
    heroImageAlt: 'Clean modern medical reception area',
    solutionCards: [
      { title: 'PCI-Compliant Terminals', desc: 'Patient card data should never sit on your hard drive. Encrypted, tokenized hardware keeps you compliant and keeps that risk off your plate.', icon: Lock },
      { title: 'Patient Financing', desc: 'A $3,000 procedure becomes a no when it\'s due today. 3-12 month plans get them to yes, and you still get paid in full upfront.', icon: Banknote },
      { title: 'Recurring & Subscription Billing', desc: 'Membership and concierge practices live on predictable cash. Automatic billing means fewer awkward front-desk conversations and fewer missed months.', icon: Calendar },
      { title: 'Online Payment Portal', desc: 'Patients who can pay from the couch pay sooner. Fewer front-desk bottlenecks, fewer billing calls, cash in faster.', icon: Globe },
      { title: 'Practice Website & SEO', desc: 'New patients search locally before they call. A site with booking and strong local SEO fills the schedule with people already looking for care.', icon: Search },
      { title: 'Custom Patient CRM', desc: 'Reminders, referrals, and follow-ups stop living in sticky notes. A CRM built for how a practice actually runs keeps the pipeline warm.', icon: LayoutDashboard },
    ],
    features: [
      { title: 'Zero-Touch Patient Payments', desc: 'Tap at check-in, text-to-pay for balances, automated copays. Patients feel taken care of. Your front desk stops drowning in payment chatter.', icon: Smartphone },
      { title: 'Integrated Billing & Reconciliation', desc: 'Every payment lands on the right patient account automatically. No more end-of-day matching that somehow never quite matches.', icon: FileText },
      { title: 'Revenue Cycle Optimization', desc: 'Find where balances stall, shorten days-to-pay, and automate the follow-up so outstanding money doesn\'t quietly age into write-offs.', icon: LineChart },
    ],
    benefits: ['Hardware that stays PCI-safe', 'Encryption so card numbers never touch your system', 'Financing that pays you in full today', 'Recurring billing for memberships', 'Patients paying online on their schedule', 'Reminders that cut no-shows', 'Payments syncing with your practice software', 'Data handling that respects HIPAA expectations'],
    painPoints: ['Processing costs eating into already-thin reimbursements', 'Patients confused or annoyed by how hard it is to pay', 'Old systems that keep you up at night on compliance'],
    solutions: ['Clear interchange-plus pricing with no surprise surcharges', 'Contactless, mobile, and text-to-pay that patients actually use', 'PCI-compliant hardware with encryption and tokenization baked in'],
    calculatorDefault: 35000,
    testimonial: { quote: "Patients love tap-to-pay, and we love paying zero processing fees with Edge. The online portal cut our billing calls roughly in half.", name: "Dr. Lisa M.", business: "Summit Family Practice" }
  },

  'ecommerce': {
    title: 'E-Commerce & Online Business',
    headline: 'Convert More Carts. Keep More Margin.',
    subheadline: 'Online buyers leave in a heartbeat. Smooth checkout, real fraud protection, and honest rates mean more completed orders and less of each sale disappearing into fees and chargebacks.',
    badge: 'E-Commerce Solutions',
    heroImage: '/images/industries/ecommerce.jpg',
    heroImageAlt: 'E-commerce shipping boxes on a dark surface',
    solutionCards: [
      { title: 'Low-Rate Online Processing', desc: 'Card-not-present shouldn\'t mean getting gouged. Interchange-plus keeps online rates honest so growth doesn\'t quietly raise your effective cost.', icon: CreditCard },
      { title: 'Gateway Integrations', desc: 'Shopify, WooCommerce, BigCommerce, or custom. Plug in once and stop duct-taping checkout together every time you change tools.', icon: Layers },
      { title: 'Fraud Prevention', desc: 'Chargebacks feel like theft after the fact. AI filters, AVS, and CVV catch the bad ones early without blocking the good customers mid-purchase.', icon: Shield },
      { title: 'Subscription & Recurring Billing', desc: 'Failed cards kill subscriptions quietly. Auto-retry and billing built for recurring revenue keep members paying without a manual chase.', icon: Calendar },
      { title: 'Custom Storefront Website', desc: 'Pretty product pages that don\'t convert are expensive art. Mobile-first design and checkout flow built to turn browsers into buyers.', icon: Code },
      { title: 'Unified Omnichannel Dashboard', desc: 'Website, marketplace, and in-person sales in one place. One inventory number. One report you can trust when you ask how you\'re doing.', icon: BarChart3 },
    ],
    features: [
      { title: 'Checkout Conversion Optimization', desc: 'One-click checkout and saved cards remove the friction that kills carts. Merchants typically see 10-20% more completions versus a generic gateway setup.', icon: TrendingUp },
      { title: 'Multi-Channel Inventory Sync', desc: 'Sell on your site, Amazon, Etsy, and in-store without overselling. Stock updates everywhere so you stop apologizing for orders you can\'t fulfill.', icon: Package },
      { title: 'Chargeback Prevention & Recovery', desc: 'Catch suspicious orders before they become disputes. When one slips through, you have the evidence and tools to fight it instead of writing it off.', icon: Lock },
    ],
    benefits: ['Honest interchange-plus online rates', 'Works with the gateway you already use', 'Fraud tools that stop chargebacks early', 'Subscriptions that recover failed payments', 'Shopify and WooCommerce ready', 'One-click checkout that finishes the sale', 'Inventory synced across every channel', 'Tools to win disputes when they happen'],
    painPoints: ['Online rates high enough to erase thin product margins', 'Carts abandoned because checkout feels slow or clunky', 'Fraud and chargebacks quietly draining what you already earned'],
    solutions: ['Interchange-plus with no inflated card-not-present markup', 'Hosted checkout with one-click and saved cards that finish the sale', 'AI fraud filters with AVS, CVV, and velocity checks before the loss'],
    calculatorDefault: 30000,
    testimonial: { quote: "They plugged into our Shopify store in a day. Checkout conversion jumped about 12%, and chargebacks dropped roughly 60%. That was enough for me.", name: "Rachel W.", business: "ThreadLine Apparel" }
  },

  'salons': {
    title: 'Salons & Spas',
    headline: 'Keep Every Dollar From Every Appointment.',
    subheadline: 'A $150 color shouldn\'t lose $4 to fees. Modern terminals, gift cards, deposits, and retention tools that match the experience you already deliver in the chair.',
    badge: 'Salon & Spa Solutions',
    heroImage: '/images/industries/salons.jpg',
    heroImageAlt: 'Empty upscale salon interior with warm lighting',
    solutionCards: [
      { title: 'Zero-Fee Processing', desc: 'Edge means you keep 100% of every service. On a $150 color and cut, that\'s $4.35 that used to vanish and now stays yours.', icon: DollarSign },
      { title: 'Sleek Smart Terminals', desc: 'Your space looks intentional. Your checkout should too. Modern tap-and-chip terminals that don\'t clash with the brand you built.', icon: Smartphone },
      { title: 'Gift Cards & Memberships', desc: 'Holiday traffic and memberships are recurring revenue waiting to happen. Sell, track, and redeem without a separate clunky system.', icon: Star },
      { title: 'Appointment-Based Payments', desc: 'Deposits at booking stop no-shows. Balance at checkout. Text receipt after. One flow tied to the appointment, not a pile of sticky notes.', icon: Calendar },
      { title: 'Salon Website & Booking', desc: 'New clients judge you online before they ever sit in the chair. Booking, menus, stylist profiles, and galleries that fill the calendar.', icon: Code },
      { title: 'Client Retention CRM', desc: 'Know their color formula, last visit, and favorite product. Rebooking reminders and birthday offers bring them back before they book elsewhere.', icon: Users },
    ],
    features: [
      { title: 'Tip-Friendly Payment Experience', desc: 'On-screen tip prompts make gratuity easy. Merchants typically see tip averages climb 15-20% versus paper receipts and awkward cash asks.', icon: Heart },
      { title: 'Integrated Booking & Payment Flow', desc: 'Book online, charge the deposit, finish the service, collect the rest. No manual steps between the appointment and getting paid.', icon: Layers },
      { title: 'Retail Product Sales', desc: 'See which stylists sell product, track what\'s on the shelf, and reorder bestsellers before you run out mid-Saturday.', icon: ShoppingCart },
    ],
    benefits: ['Keep 100% of every service payment', 'Hardware that looks like it belongs', 'Gift cards clients actually buy', 'Deposits that protect your chair time', 'Tip prompts that raise the average', 'Online booking that fills gaps', 'Client preferences remembered', 'Retail inventory that doesn\'t run dry'],
    painPoints: ['$800+ a month in fees disappearing from service revenue', 'A terminal that looks cheap next to the space you invested in', 'No clean way to sell gift cards, memberships, or retail'],
    solutions: ['Edge keeps 100% of every service payment in your pocket', 'Sleek smart terminals you\'re not embarrassed to put on the desk', 'Gift cards, memberships, and retail POS with inventory in one place'],
    calculatorDefault: 20000,
    testimonial: { quote: "We went from about $800 a month in fees to zero with Edge. Clients love the gift cards. We sold $12K of them last holiday season alone.", name: "Sarah K.", business: "Glow Wellness Spa" }
  },

  'auto-repair': {
    title: 'Auto Repair & Service',
    headline: 'Close the Big Jobs. Keep Every Dollar.',
    subheadline: 'A $2,000 repair used to lose $60+ to fees, and plenty of customers walked because they couldn\'t pay today. Zero-fee processing and financing change both of those conversations.',
    badge: 'Auto Repair Solutions',
    heroImage: '/images/industries/auto-repair.jpg',
    heroImageAlt: 'Auto repair shop bay with dark moody lighting',
    solutionCards: [
      { title: 'Zero Fees on Big Tickets', desc: 'On a $2,000 transmission job, $60+ used to vanish into fees. Edge eliminates that. You keep the whole ticket.', icon: DollarSign },
      { title: 'Consumer Financing', desc: '\"I can\'t pay that today\" becomes \"$125 a month works.\" You get paid in full immediately. They get the repair they need.', icon: Banknote },
      { title: 'Shop Management Integration', desc: 'Estimates, invoices, and payments in one flow with Mitchell, ShopWare, and the tools you already live in. Less double entry, fewer mistakes.', icon: Settings },
      { title: 'Text-to-Pay Invoicing', desc: 'Send the estimate by text. They approve. They pay. No phone tag, no paper on the counter, no chasing a check next week.', icon: MessageSquare },
      { title: 'Shop Website & Local SEO', desc: 'Drivers search \"auto repair near me\" with a broken car and a short fuse. Show up first, look trustworthy, and take the appointment request online.', icon: Search },
      { title: 'Fleet & B2B Invoicing', desc: 'Fleet accounts want monthly invoices and clean PO tracking. Level 2/3 processing also drops the rate on those corporate cards.', icon: Truck },
    ],
    features: [
      { title: 'Close More Big Jobs With Financing', desc: 'A $3,000 engine job that used to get a polite no turns into a yes when it\'s $125 a month. You fund today. They drive out repaired.', icon: TrendingUp },
      { title: 'Digital Estimates → Approval → Payment', desc: 'Text the estimate, get the approval, finish the work, collect payment. One digital path. No paper, no phone chase, no unpaid RO sitting open.', icon: FileText },
      { title: 'Real-Time Shop Performance Tracking', desc: 'Average ticket, tech productivity, parts-to-labor, daily revenue. See which services make money and where you\'re leaving it on the bay floor.', icon: BarChart3 },
    ],
    benefits: ['Zero fees on big repair tickets', 'Financing that closes the expensive jobs', 'Works with the shop software you use', 'Estimates and payments by text', 'Fleet and B2B invoicing handled', 'Lower rates on corporate cards', 'Found when drivers search near you', 'Same-day deposits on every ticket'],
    painPoints: ['Losing $60+ in fees on every major repair', 'Customers walking away from big jobs they can\'t pay upfront', 'Paper estimates and payment chase slowing the whole shop'],
    solutions: ['Edge kills fees on every ticket, small and large', 'Financing lets them pay over time while you get paid today', 'Text-to-pay and digital approvals end the paperwork chase'],
    calculatorDefault: 40000,
    testimonial: { quote: "On a $2,000 transmission, I used to lose $60-plus in fees. Now I keep every dollar. Financing alone bumped our average ticket about 35%.", name: "James T.", business: "Peak Auto Repair" }
  },

  'gas-stations': {
    title: 'Gas Stations & C-Stores',
    headline: 'Protect Fuel Margins. Speed Up the Store.',
    subheadline: 'Fuel margins are thin enough without fat interchange and split systems. EMV at the pump, one POS for fuel and c-store, and pricing that doesn\'t erase the penny you make per gallon.',
    badge: 'Fuel & C-Store Solutions',
    heroImage: '/images/industries/gas-stations.jpg',
    heroImageAlt: 'Gas station at night with atmospheric lighting',
    solutionCards: [
      { title: 'Outdoor EMV Compliance', desc: 'Fraud liability at the pump is a nightmare you don\'t want. EMV-ready outdoor terminals shift that risk off your station.', icon: Shield },
      { title: 'Unified Fuel + C-Store POS', desc: 'Two systems means blind spots. One dashboard for pumps, inventory, lottery, and tobacco so you finally see the whole station.', icon: MonitorSmartphone },
      { title: 'Interchange-Plus Fuel Pricing', desc: 'At $150K a month in fuel, 0.1% is $150. True interchange with a thin markup protects what little margin fuel leaves you.', icon: Percent },
      { title: 'Loyalty & Fuel Rewards', desc: 'Cents off per gallon and c-store incentives turn one-time fill-ups into a habit. Digital loyalty that brings them back next week.', icon: Star },
      { title: 'Fleet Card Acceptance', desc: 'Commercial drivers bring volume. WEX, Voyager, and Level 3 capture keep those fleet cards accepted and the rates optimized.', icon: Truck },
      { title: 'Station Website & Google Profile', desc: 'Drivers search Maps for the closest open station. Fuel prices, specials, and a clean Google profile put you in that decision.', icon: Globe },
    ],
    features: [
      { title: 'Pump-to-POS Integration', desc: 'Fuel sales flow into the same system as the store. Volume by grade, tank levels, and reconciliation without stitching two reports together.', icon: Database },
      { title: 'Fraud Protection at the Pump', desc: 'Chip reading plus velocity limits and alerts stop the counterfeit-card hits that used to show up as ugly chargebacks days later.', icon: Lock },
      { title: 'C-Store Inventory & Margin Tracking', desc: 'Know your margin on tobacco, snacks, drinks, and lottery by SKU. Stock what sells. Stop guessing from the back room.', icon: PieChart },
    ],
    benefits: ['EMV-ready terminals at the pump', 'Fuel and c-store on one POS', 'True interchange-plus on fuel volume', 'Fleet cards accepted the right way', 'Rewards that bring drivers back', 'Tank levels you can see in real time', 'C-store inventory down to the SKU', 'Fraud protection where it matters most'],
    painPoints: ['EMV deadlines turning pump fraud into your liability', 'Separate fuel and store systems hiding what\'s really happening', 'Interchange fees wiping out already-thin fuel margins'],
    solutions: ['EMV outdoor terminals that pull fraud liability off your books', 'One POS for fuel and c-store on a single dashboard', 'Interchange-plus pricing that protects every penny per gallon'],
    calculatorDefault: 150000,
    testimonial: { quote: "Keystone got us EMV compliant at the pump, put fuel and c-store on one system, and cut our indoor fees in half. Best call we made all year.", name: "Mike D.", business: "QuickFuel Express" }
  },

  'high-risk': {
    title: 'High-Risk Merchants',
    headline: 'Stay Approved. Keep Processing. Sleep at Night.',
    subheadline: 'CBD, vape, smoke, supplements. You\'ve been dropped before. We place you with banks that understand your vertical, fight chargebacks early, and keep the account stable.',
    badge: 'High-Risk Solutions',
    heroImage: '/images/industries/high-risk.jpg',
    heroImageAlt: 'Abstract vault lock representing security and stability',
    solutionCards: [
      { title: 'Stable Merchant Accounts', desc: 'Surprise freezes kill payroll. We work with banks that underwrite high-risk on purpose so you\'re not waiting to see if the account survives the weekend.', icon: Shield },
      { title: 'Competitive High-Risk Rates', desc: 'High-risk doesn\'t have to mean getting robbed. Transparent pricing, negotiated rates, and no junk fees hiding in the fine print.', icon: Percent },
      { title: 'Chargeback Prevention', desc: 'Your ratio is your lifeline. Alerts, dispute help, and fraud tools that keep it low before a processor starts looking for the exit.', icon: Lock },
      { title: 'Dedicated Account Manager', desc: 'Not a ticket queue that has never heard of your product. A person who knows your vertical, picks up, and fights for you when something goes sideways.', icon: Users },
      { title: 'Compliant Website & SEO', desc: 'Processor underwriters read your site. Descriptions, disclaimers, and terms built so compliance doesn\'t become the reason you get shut off.', icon: Code },
      { title: 'Age Verification & ID Scanning', desc: 'Regulated products need proof at the register. Integrated age checks that keep you compliant without slowing every sale to a crawl.', icon: FileText },
    ],
    features: [
      { title: 'We Specialize in "Hard to Place" Merchants', desc: 'Turned down or terminated elsewhere? We place with acquiring banks that underwrite high-risk verticals. 90%+ approval for merchants with clean history.', icon: Target },
      { title: 'Chargeback Ratio Management', desc: 'We watch the ratio and step in before it gets dangerous. Prevention, alerts, and disputes aimed at keeping you under 1%.', icon: BarChart3 },
      { title: 'Multi-Processor Redundancy', desc: 'If one processor hiccups, sales shouldn\'t stop. Backup routing so a bank issue doesn\'t become a closed sign on your door.', icon: Layers },
    ],
    benefits: ['90%+ approval for clean high-risk merchants', 'Accounts built to last, not freeze Friday night', 'Transparent rates without the risk gouge', 'Chargebacks caught before they sink you', 'A real person who knows your industry', 'Backup processing if one bank stumbles', 'Websites built to pass underwriting', 'Age verification at the point of sale'],
    painPoints: ['Random freezes, holds, and terminations that stop sales overnight', 'Rates so high \"high-risk\" feels like a penalty, not a category', 'Processors who don\'t understand CBD, vape, or supplements'],
    solutions: ['Stable accounts through banks that specialize in your vertical', 'Competitive, transparent rates without fake risk premiums', 'An account manager who actually knows your product line'],
    calculatorDefault: 25000,
    testimonial: { quote: "Three processors dropped us before Keystone. Fourteen months later we\'re still processing. Our account manager actually knows CBD. That matters.", name: "Alex P.", business: "Green Leaf CBD" }
  },

  'nonprofits': {
    title: 'Nonprofits & Churches',
    headline: 'More of Every Gift Reaches the Mission.',
    subheadline: 'Processing fees shouldn\'t shrink a donation before it does any good. Lower rates, recurring giving, and modern ways to donate so generosity turns into predictable impact.',
    badge: 'Nonprofit Solutions',
    heroImage: '/images/industries/nonprofits.jpg',
    heroImageAlt: 'Empty community gathering space with warm lighting',
    solutionCards: [
      { title: 'Nonprofit-Friendly Rates', desc: 'Every basis point you save is ministry, meals, or programs that actually happen. Nonprofit-optimized rates keep more of the gift intact.', icon: Percent },
      { title: 'Recurring Giving', desc: 'One-time gifts are great. Monthly givers change the budget. Set-it-and-forget-it recurring donations make revenue something you can plan on.', icon: Calendar },
      { title: 'Tap-to-Give Kiosks', desc: 'Awkward cash baskets leave money on the table. Touchscreen kiosks with clear amounts and fund choices make giving easy in the lobby or at events.', icon: Smartphone },
      { title: 'Online Donation Pages', desc: 'People give when it\'s simple. Branded, mobile pages with fund designations and tributes that work on the phone in their hand.', icon: Globe },
      { title: 'Organization Website', desc: 'Tell the story, show the calendar, take the gift. A site with donation buttons on every page so inspiration can turn into action immediately.', icon: Code },
      { title: 'Donor CRM & Reporting', desc: 'Know who gave, when, and how to thank them. Automatic receipts and segments so outreach feels personal, not mass-mailed.', icon: LayoutDashboard },
    ],
    features: [
      { title: 'Maximize the Impact of Every Dollar', desc: 'When someone gives $100, you should keep as close to $100 as you can. Nonprofit rates run 30-60% lower, and Edge can bring fees to zero.', icon: Heart },
      { title: 'Automatic Tax Receipts & Year-End Statements', desc: 'Every gift triggers a receipt. Year-end statements go out without a volunteer living in a spreadsheet for two weeks in December.', icon: FileText },
      { title: 'Event & Campaign Fundraising', desc: 'Dedicated pages for campaigns and capital drives. Watch progress in real time and share the goal with the people who care most.', icon: Target },
    ],
    benefits: ['Rates built for nonprofits, not retail', 'Monthly giving that runs on autopilot', 'Kiosks donors actually want to use', 'Branded pages that make giving easy', 'Tax receipts without the manual work', 'A donor list you can actually use', 'Fund designations and tribute gifts', 'Year-end statements ready on time'],
    painPoints: ['Fees quietly reducing what every donation can do', 'No clean system for recurring monthly givers', 'Old kiosks and forms donors avoid using'],
    solutions: ['Nonprofit rates that leave more of every gift for the mission', 'Online recurring giving pages donors set once and forget', 'Modern kiosks with custom amounts and clear fund choices'],
    calculatorDefault: 15000,
    testimonial: { quote: "Every dollar matters here. Keystone cut our processing fees about 60%, and the recurring giving page roughly tripled our monthly committed givers.", name: "Pastor David R.", business: "Grace Community Church" }
  },

  'b2b': {
    title: 'B2B & Professional Services',
    headline: 'Get Paid on Big Invoices Without the Chase.',
    subheadline: 'Large B2B payments shouldn\'t cost 3% or take 60 days. Level 2/3 savings, pay-now invoices, and ACH options that get clients to pay faster with less admin.',
    badge: 'B2B Solutions',
    heroImage: '/images/industries/b2b.jpg',
    heroImageAlt: 'Modern empty office conference room at dusk',
    solutionCards: [
      { title: 'Level 2/3 Processing', desc: 'Corporate and government cards cost less when the right data is sent. Automatic Level 2/3 capture typically saves 0.5-1.0% on every one of those payments.', icon: Percent },
      { title: 'Email Invoice & Pay-Now Links', desc: 'Send the invoice. They click and pay by card or ACH. You get notified. Checks in the mail become a story you tell about the old days.', icon: Receipt },
      { title: 'ACH & Bank Transfer', desc: 'On a $10,000 invoice, card fees add up fast. ACH gives clients a cheaper way to pay and you a cleaner hit to the bank.', icon: Banknote },
      { title: 'Virtual Terminal', desc: 'Phone order? Job site? Home office? Key the card from anywhere and get paid without dragging a terminal around.', icon: MonitorSmartphone },
      { title: 'Professional Website', desc: 'B2B buyers research before they reply. A site with services, proof, and a payment portal that makes you look as solid as your work.', icon: Code },
      { title: 'CRM & Pipeline Tracking', desc: 'Proposals and follow-ups stop living in email threads. A CRM shaped around how you sell so nothing falls through after the first meeting.', icon: LayoutDashboard },
    ],
    features: [
      { title: 'Save Big With Level 2/3 Data Capture', desc: 'On a $5,000 invoice, Level 2/3 can save $25-50. We configure capture automatically so you get the lower rate without extra busywork.', icon: DollarSign },
      { title: 'Automated Invoice Reminders', desc: '30, 60, 90 days past due without the awkward call. The system nudges. You stay the professional, not the collections desk.', icon: Clock },
      { title: 'Accounting Software Integration', desc: 'Payments sync to QuickBooks, Xero, or FreshBooks. Invoices mark paid on their own. Reconciliation stops eating your Fridays.', icon: Database },
    ],
    benefits: ['Lower rates on corporate card invoices', 'Invoices clients can pay in two clicks', 'ACH for the big payments', 'Virtual terminal for remote collections', 'Reminders that chase so you don\'t', 'Books that update when money lands', 'Recurring billing for retainers', 'Same-day deposits when you need cash'],
    painPoints: ['Losing 2.5-3.5% on large invoices paid by credit card', 'Clients slow to pay because paying you is inconvenient', 'Manual invoicing and reconciliation eating admin hours'],
    solutions: ['Level 2/3 processing saves 0.5-1.0% on every corporate card payment', 'Email invoices with pay-now links clients finish in two clicks', 'Accounting sync that ends manual reconciliation'],
    calculatorDefault: 50000,
    testimonial: { quote: "Our average invoice is $5,000. Level 2/3 through Keystone saves us hundreds a month. QuickBooks syncing was the part that sold my bookkeeper.", name: "David M.", business: "Boxed Logistics" }
  },

  'real-estate': {
    title: 'Real Estate',
    headline: 'Collect Deposits, Rent, and Fees Without the Chase.',
    subheadline: 'Earnest money, commissions, rent, HOA dues. High-ticket payments and recurring collections that used to mean checks and bank runs now happen from a phone.',
    badge: 'Real Estate Solutions',
    heroImage: '/images/industries/real-estate.jpg',
    heroImageAlt: 'Modern house exterior at dusk',
    solutionCards: [
      { title: 'High-Ticket Payment Processing', desc: 'Large deposits and fees deserve honest rates. Interchange-plus keeps the cost of moving big money from eating the deal.', icon: DollarSign },
      { title: 'Online Payment Portals', desc: 'Tenants pay rent, HOA, and fees online with receipts and late-fee tracking built in. You stop being the landlord who texts about checks.', icon: Globe },
      { title: 'Virtual Terminal & Invoicing', desc: 'Send a pay link for deposits and fees. Collect remotely without coordinating a wire or making another bank run.', icon: MonitorSmartphone },
      { title: 'ACH Rent Collection', desc: 'Auto-debit on the 1st. Late fees on the 5th. Lower cost than cards for recurring rent, and a deposit the next business day.', icon: Calendar },
      { title: 'Agent & Brokerage Website', desc: 'Listings, agent profiles, and market content that generate leads instead of a brochure site that just sits there looking pretty.', icon: Code },
      { title: 'Lead Management CRM', desc: 'Buyer and seller leads from first inquiry to closing, with follow-up that fires so hot prospects don\'t cool off in your inbox.', icon: LayoutDashboard },
    ],
    features: [
      { title: 'Collect Deposits & Fees Without the Hassle', desc: 'Text or email a payment link. Earnest money, application fees, splits. Paid from their phone. No checks, no wire theater, no bank lobby.', icon: Smartphone },
      { title: 'Automated Rent Collection', desc: 'Tenants set autopay once. Rent hits on the 1st, late fees apply on the 5th, and you\'re funded the next business day. Property management on rails.', icon: Clock },
      { title: 'Commission & Split Tracking', desc: 'Agents, referrals, brokerages. Track who gets what and pay it accurately without a spreadsheet argument after every closing.', icon: PieChart },
    ],
    benefits: ['Honest rates on high-ticket payments', 'Tenants paying through a real portal', 'ACH rent on autopilot', 'Late fees that apply themselves', 'Remote invoicing that gets paid', 'Commission splits that add up right', 'Leads tracked to closing', 'A site that generates inquiries'],
    painPoints: ['Fat fees on large earnest and commission payments', 'Chasing tenants for rent checks every month', 'Manual invoices and payment tracking slowing everything down'],
    solutions: ['Interchange-plus that saves real money on $1,000+ transactions', 'ACH auto-debit rent with late fees handled automatically', 'Email and text pay links for instant remote collection'],
    calculatorDefault: 60000,
    testimonial: { quote: "Virtual terminal plus the tenant portal made rent and deposits hands-off. Forty units, and I haven\'t written a receipt in months.", name: "Jennifer L.", business: "Summit Realty Group" }
  },

  'retail': {
    title: 'Retail Stores',
    headline: 'Faster Checkout. Healthier Margins. Same Shelf.',
    subheadline: 'Retail margins vanish into processing fees and slow lines. Zero-fee programs, tap-to-pay that clears in under two seconds, and inventory that finally matches what\'s on the floor.',
    badge: 'Retail Solutions',
    heroImage: '/images/industries/retail.jpg',
    heroImageAlt: 'Empty retail store interior after hours',
    solutionCards: [
      { title: 'Zero Processing Fees', desc: 'Edge can bring card fees to zero. Every dollar the customer pays is a dollar that stays in the business, not the processor\'s.', icon: DollarSign },
      { title: 'Fast Tap-to-Pay Terminals', desc: 'Lines kill impulse buys. Apple Pay, Google Pay, and tap cards cleared in under two seconds keep people moving and buying.', icon: Zap },
      { title: 'Retail POS & Inventory', desc: 'Scan, sell, reorder. Know what\'s low before the weekend rush, and stop counting stock by hand after close.', icon: ShoppingCart },
      { title: 'E-Commerce Integration', desc: 'One inventory for the floor and the website. Sell both places without overselling the last unit to two different people.', icon: Globe },
      { title: 'Retail Website', desc: 'Product catalog, online orders, and a story that makes someone drive to the store. Foot traffic and online sales from the same brand.', icon: Code },
      { title: 'Customer Loyalty Program', desc: 'Points and VIP tiers that turn a one-time shopper into someone who comes back and spends more each visit.', icon: Star },
    ],
    features: [
      { title: 'Checkout in Under 2 Seconds', desc: 'No signatures, no friction on small tickets, no staring at a spinning screen. Faster lines, happier customers, more sales per hour.', icon: Clock },
      { title: 'Smart Inventory Management', desc: 'Reorder points, bestsellers versus dead stock, purchase orders in one click. You stop finding out you\'re out of something when a customer asks.', icon: Package },
      { title: 'Unified In-Store & Online Sales', desc: 'One customer, one inventory count, one report. Whether they bought in the aisle or on their phone, you see the whole business.', icon: Layers },
    ],
    benefits: ['Keep every dollar with Edge', 'Checkout cleared in under two seconds', 'POS with scanning that just works', 'Inventory that reorders before you\'re empty', 'Online and in-store stock in sync', 'Loyalty that raises visit frequency', 'Sales numbers you can trust today', 'Deposits that hit the same day'],
    painPoints: ['Processing fees cutting into margins that were already thin', 'An old POS that makes checkout feel like 2009', 'No single view of in-store and online inventory'],
    solutions: ['Edge eliminates up to 100% of processing fees', 'Tap-to-pay with Apple Pay and Google Pay that clears in under two seconds', 'Unified POS with inventory synced across every channel'],
    calculatorDefault: 35000,
    testimonial: { quote: "We switched to Edge and processing dropped to zero. The POS inventory tracking saves us about five hours a week we used to burn on hand counts.", name: "Carlos M.", business: "Westside Home Goods" }
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
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
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
            {data.heroImage && (
              <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video max-w-4xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                <img
                  src={data.heroImage}
                  alt={data.heroImageAlt || data.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  width={1200}
                  height={675}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 2. SOLUTIONS GRID ───────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-charcoal-dark/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">What Actually Moves the Needle for Your {data.title.split(' &')[0].split(' -')[0]} Business</h2>
            <p className="text-offwhite/60 text-lg font-light max-w-2xl mx-auto">Processing, marketing, CRM, financing. One partner so nothing falls through the cracks.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {data.solutionCards.map((card: any, i: number) => (
              <div 
                key={i}
                className="animate-on-scroll bg-slate-dark/30 border border-white/5 rounded-2xl overflow-hidden hover:bg-slate-dark/50 hover:border-teal/20 transition-all duration-300 group"
              >
                <div className="aspect-square overflow-hidden border-b border-white/5">
                  <img src={`/images/industries/sub/${slugify(card.title)}.jpg`} alt={card.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <card.icon className="w-5 h-5 text-teal flex-shrink-0" strokeWidth={1.5} />
                    <h3 className="text-base text-white font-medium">{card.title}</h3>
                  </div>
                  <p className="text-offwhite/60 font-light leading-relaxed text-sm">{card.desc}</p>
                </div>
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
                <div className="relative h-[280px] md:h-[340px] rounded-2xl overflow-hidden border border-white/10 bg-slate-dark/30 group shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-500">
                  <img src={`/images/industries/sub/${slugify(feature.title)}.jpg`} alt={feature.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 4. WHY KEYSTONE - Benefits Checklist ────────────────────────────── */}
      <section className="py-20 md:py-28 bg-charcoal-dark/40 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">Why {data.title.split(' &')[0].split(' -')[0]} Owners Stick With Keystone</h2>
            <p className="text-offwhite/60 text-lg font-light max-w-xl mx-auto">Built around how your industry actually makes money, not a one-size-fits-all kit.</p>
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
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">What's Costing You Money. And How to Stop It.</h2>
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
            <h2 className="font-serif text-3xl text-white mb-2 relative z-10">See What You're Leaving on the Table</h2>
            <p className="text-offwhite/50 mb-8 relative z-10">Drag the slider. Watch the number that should be yours.</p>
            
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
              <p className="text-lg text-white">That's <span className="font-mono text-teal font-medium text-2xl">${monthlySavings.toLocaleString(undefined, {maximumFractionDigits:0})}</span> staying in your business every month</p>
              <p className="text-offwhite/40 text-sm mt-1">Over a year, that's <span className="text-teal">${(monthlySavings * 12).toLocaleString(undefined, {maximumFractionDigits:0})}</span> you get to keep</p>
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
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-white mb-6">Ready to Stop Leaving Money on the Table?</h2>
          <p className="text-offwhite/60 text-lg font-light max-w-xl mx-auto mb-10 leading-relaxed">
            Send us a statement. We'll show you exactly what you're overpaying and what to do about it. No pitch, no pressure.
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
