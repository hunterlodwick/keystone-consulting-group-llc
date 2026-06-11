import React, { useEffect } from 'react';
import { 
  Code, 
  LayoutDashboard, 
  Zap, 
  Compass, 
  Target,
  CheckCircle,
  ArrowRight,
  Globe,
  Mic,
  Bot,
  Workflow,
  PenTool,
  LineChart,
  Layers,
  Database,
  MessageSquare,
  Rocket,
  TrendingUp,
  Shield,
  Search,
  CreditCard,
  MonitorSmartphone,
  Headphones,
  DollarSign,
  Banknote,
  Store,
  Users,
  Star,
  BarChart3,
  FileText,
  Settings,
  MapPin,
  Phone
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

const SERVICES_DETAIL = [
  {
    id: "web-design",
    title: "Custom Web Design",
    icon: Code,
    tagline: "Websites that work as hard as you do.",
    heroDesc: "We don't build templates. We build immersive, high-performance digital experiences — from 3D animated sites to AI-powered talking websites that schedule appointments, answer questions, and convert visitors into customers while you sleep.",
    sections: [
      {
        title: "3D Animated Websites",
        icon: Layers,
        desc: "Stand out from every competitor in your industry with cinematic, scroll-driven animations, parallax effects, and interactive 3D elements that make visitors stop scrolling and start engaging."
      },
      {
        title: "AI Voice Chatbots",
        icon: Mic,
        desc: "Your website talks back. We embed intelligent AI voice agents that greet visitors, answer FAQs, schedule appointments, fill out intake forms, and qualify leads — all without you lifting a finger."
      },
      {
        title: "High-Conversion Landing Pages",
        icon: TrendingUp,
        desc: "Every pixel is intentional. We design conversion-optimized pages with strategic CTAs, trust signals, and persuasive copy frameworks that turn traffic into revenue."
      },
      {
        title: "Mobile-First & Lightning Fast",
        icon: Globe,
        desc: "Built for speed on every device. Our sites score 90+ on Google PageSpeed, are fully responsive, and optimized for SEO so you rank higher and load faster than the competition."
      }
    ],
    features: ["3D scroll-driven animations", "AI voice chatbot integration", "Appointment scheduling built in", "Conversion-optimized design", "Mobile-first responsive", "SEO-optimized architecture", "Custom branding & identity", "Analytics & tracking setup"]
  },
  {
    id: "crm",
    title: "CRM Systems",
    icon: LayoutDashboard,
    tagline: "Your business, your workflow, your CRM.",
    heroDesc: "Whether you need a CRM built from scratch or want to squeeze more value out of HubSpot, Go High Level, or Salesforce — we design systems around how your team actually works. No more fighting your tools.",
    sections: [
      {
        title: "Custom-Built Platforms",
        icon: Database,
        desc: "When off-the-shelf doesn't cut it, we build your CRM from the ground up. Custom pipelines, dashboards, reporting, and automations designed specifically for your sales process and team structure."
      },
      {
        title: "Platform Configuration",
        icon: Workflow,
        desc: "Already using HubSpot, GHL, or Salesforce? We optimize what you have — cleaning up messy pipelines, building custom automations, and configuring it so your team actually uses it instead of working around it."
      },
      {
        title: "Pipeline & Deal Tracking",
        icon: LineChart,
        desc: "See every deal, every lead, every dollar in your pipeline at a glance. We build visual dashboards that give you real-time visibility into your revenue without digging through spreadsheets."
      },
      {
        title: "Automated Follow-Ups",
        icon: MessageSquare,
        desc: "Never let a lead go cold. We set up intelligent follow-up sequences — email, SMS, tasks — that trigger automatically based on lead behavior and pipeline stage."
      }
    ],
    features: ["Custom CRM development", "HubSpot & GHL optimization", "Salesforce configuration", "Visual pipeline dashboards", "Automated lead nurturing", "Email & SMS sequences", "Team activity tracking", "Revenue forecasting"]
  },
  {
    id: "automations",
    title: "AI & Automations",
    icon: Zap,
    tagline: "Stop doing manually what a machine can do better.",
    heroDesc: "We build AI agents and workflow automations that handle lead qualification, customer service, internal operations, and everything in between. Your team focuses on high-value work while the systems handle the rest.",
    sections: [
      {
        title: "AI Lead Qualification",
        icon: Bot,
        desc: "Not all leads are created equal. Our AI agents score, qualify, and route leads automatically — so your sales team only talks to people who are ready to buy, not tire-kickers."
      },
      {
        title: "Customer Service Agents",
        icon: MessageSquare,
        desc: "24/7 intelligent support without the payroll. AI agents that handle common questions, troubleshoot issues, process requests, and escalate to humans only when it matters."
      },
      {
        title: "Workflow Automation",
        icon: Workflow,
        desc: "Connect your tools and eliminate manual handoffs. We build automations between your CRM, email, invoicing, scheduling, and any other platform — so data flows and tasks complete themselves."
      },
      {
        title: "System Integrations",
        icon: Layers,
        desc: "Your tech stack should talk to itself. We build custom API integrations, webhook automations, and data sync pipelines that connect every tool in your business into one seamless ecosystem."
      }
    ],
    features: ["AI lead scoring & routing", "Intelligent chatbots", "Workflow automation", "API integrations", "Data sync pipelines", "Internal ops automation", "Smart notifications & alerts", "Custom AI agent buildouts"]
  },
  {
    id: "consulting",
    title: "Business Consulting",
    icon: Compass,
    tagline: "The strategy behind the systems.",
    heroDesc: "Our consulting is the backbone of everything we do. We embed with your team, audit your operations, identify where money is leaking, eliminate waste, and build a roadmap to reinvest savings into growth. Think of us as your fractional COO.",
    sections: [
      {
        title: "Operational Audits",
        icon: Target,
        desc: "We go line by line through your operations — payment processing, subscriptions, overhead, manual processes, missed revenue opportunities — and find every dollar you're losing unnecessarily."
      },
      {
        title: "Revenue Leak Identification",
        icon: TrendingUp,
        desc: "Most businesses don't know where they're bleeding money until someone shows them. We identify hidden costs, redundant tools, inefficient workflows, and pricing gaps that are silently eating your margins."
      },
      {
        title: "Growth Strategy",
        icon: Rocket,
        desc: "Once we've freed up capital, we don't just hand you a report. We build a reinvestment roadmap — where to spend, what to build, and how to scale — so every saved dollar compounds into growth."
      },
      {
        title: "Fractional Advisory",
        icon: Shield,
        desc: "Don't need a full-time COO? We act as your strategic partner on an ongoing basis — monthly check-ins, quarterly planning, and on-demand advisory for critical decisions."
      }
    ],
    features: ["Profit leak analysis", "Operational efficiency audits", "Revenue optimization", "Growth strategy & roadmapping", "Fractional COO advisory", "Monthly strategic check-ins", "Vendor & tool evaluation", "Process systematization"]
  },
  {
    id: "prep-to-sell",
    title: "Prep-to-Sell",
    icon: Target,
    tagline: "Build today for the exit you want tomorrow.",
    heroDesc: "Whether you're selling next year or in ten years, the businesses that command the highest valuations are the ones that prepared early. We help you systematize operations, clean up financials, and position your business as an asset — not just a job.",
    sections: [
      {
        title: "Exit Strategy Planning",
        icon: Compass,
        desc: "When do you want to exit? What's your target number? We work backwards from your goals to build a concrete timeline and action plan that maximizes your business's value at sale."
      },
      {
        title: "Financial Cleanup",
        icon: LineChart,
        desc: "Buyers look at your books first. We help you clean up financials, normalize expenses, separate personal from business, and present numbers that make acquirers confident in the opportunity."
      },
      {
        title: "Operational Systematization",
        icon: Workflow,
        desc: "A business that runs without the owner is worth significantly more than one that doesn't. We document processes, build SOPs, and create systems so the business operates independently."
      },
      {
        title: "Valuation Maximization",
        icon: Rocket,
        desc: "Small improvements in recurring revenue, customer retention, and operational efficiency can add multiples to your valuation. We identify the highest-leverage moves and help you execute them."
      }
    ],
    features: ["Exit strategy & timeline", "Financial cleanup & normalization", "SOP documentation", "Process systematization", "Recurring revenue optimization", "Customer retention strategy", "Owner-independence planning", "Valuation modeling"]
  },
  {
    id: "seo",
    title: "SEO Services",
    icon: Search,
    tagline: "Get found by the customers already searching for you.",
    heroDesc: "Search engine optimization isn't a luxury — it's the foundation of sustainable growth. We help businesses rank on the first page of Google for the terms their customers are actually searching, driving organic traffic that converts without paying for every click.",
    sections: [
      {
        title: "Local SEO & Map Pack",
        icon: MapPin,
        desc: "Dominate the local 3-pack in Google Maps. We optimize your Google Business Profile, build local citations, manage reviews, and ensure your business shows up when people search 'near me' in your area."
      },
      {
        title: "On-Page Optimization",
        icon: Code,
        desc: "Title tags, meta descriptions, header structure, schema markup, internal linking, and content optimization — we fine-tune every page on your site to signal relevance and authority to search engines."
      },
      {
        title: "Content Strategy & Blogging",
        icon: PenTool,
        desc: "We research the keywords your customers are typing into Google and create high-quality, SEO-optimized content that ranks. Blog posts, service pages, and landing pages that drive traffic month after month."
      },
      {
        title: "Technical SEO & Site Speed",
        icon: Zap,
        desc: "Core Web Vitals, page speed, mobile usability, crawlability, indexing issues — we audit and fix the technical foundation of your site so Google can find, crawl, and rank every page."
      }
    ],
    features: ["Google first-page ranking strategy", "Local SEO & Google Maps optimization", "Keyword research & targeting", "On-page optimization", "Technical SEO audits", "Monthly content creation", "Backlink building", "Monthly ranking reports"]
  },
  {
    id: "google-business",
    title: "Google My Business",
    icon: MapPin,
    tagline: "Own your local search presence.",
    heroDesc: "Your Google Business Profile is often the first thing potential customers see. We optimize every aspect of your profile — photos, categories, posts, reviews, Q&A — so you show up in the map pack and convert searchers into customers before they even visit your website.",
    sections: [
      {
        title: "Profile Optimization",
        icon: Settings,
        desc: "We fully build out your Google Business Profile with the right categories, attributes, service descriptions, and business info. A complete, optimized profile ranks higher and converts better than a half-filled one."
      },
      {
        title: "Review Management",
        icon: Star,
        desc: "Reviews are the #1 local ranking factor. We set up automated review request systems, help you respond to reviews professionally, and build a strategy to consistently grow your 5-star count."
      },
      {
        title: "Google Posts & Updates",
        icon: MessageSquare,
        desc: "Weekly Google Posts keep your profile active and signal to Google that your business is engaged. We create and schedule posts featuring offers, events, updates, and product highlights."
      },
      {
        title: "Local Citation Building",
        icon: Globe,
        desc: "Your business name, address, and phone number need to be consistent across 50+ directories. We build and clean up citations on Yelp, Apple Maps, Bing, Facebook, and industry-specific directories."
      }
    ],
    features: ["Full profile optimization", "Review request automation", "Professional review responses", "Weekly Google Posts", "Photo & video optimization", "Q&A management", "Citation building (50+ directories)", "Monthly performance reports"]
  },
  {
    id: "bpo",
    title: "BPO — Lead Generation",
    icon: Headphones,
    tagline: "Leads delivered. Appointments booked. Hands off.",
    heroDesc: "Our BPO lead generation service does the prospecting for you. We build targeted outbound campaigns, qualify leads through multi-touch sequences, and book appointments directly on your calendar — so your sales team only talks to people who are ready to buy.",
    sections: [
      {
        title: "Outbound Prospecting",
        icon: Target,
        desc: "We build targeted prospect lists based on your ideal customer profile and run multi-channel outreach — cold email, LinkedIn, and phone — to generate interest and start conversations on your behalf."
      },
      {
        title: "Appointment Setting",
        icon: LayoutDashboard,
        desc: "Qualified prospects are booked directly onto your sales team's calendar. We handle the back-and-forth, confirm the meeting, and send a brief on the prospect so your closer walks in prepared."
      },
      {
        title: "Lead Nurturing Sequences",
        icon: MessageSquare,
        desc: "Not every lead is ready today. We build automated nurture sequences that keep your brand top-of-mind with warm prospects until they're ready to have the conversation — then we book the call."
      },
      {
        title: "Campaign Reporting & Optimization",
        icon: BarChart3,
        desc: "Full transparency on every campaign. Open rates, reply rates, appointments booked, pipeline generated. We continuously optimize messaging, targeting, and timing to improve results month over month."
      }
    ],
    features: ["Targeted prospect list building", "Multi-channel outreach (email, LinkedIn, phone)", "Qualified appointment setting", "Automated lead nurturing sequences", "CRM integration & lead handoff", "Monthly campaign performance reports", "A/B tested messaging", "Dedicated campaign manager"]
  },
  {
    id: "consumer-financing",
    title: "Consumer Financing",
    icon: Banknote,
    tagline: "Your customers pay over time. You get paid now.",
    heroDesc: "Consumer financing removes the biggest objection in sales: price. By offering flexible payment plans at the point of sale, you close more deals, increase average ticket sizes, and never chase a payment — because you get funded in full upfront.",
    sections: [
      {
        title: "Point-of-Sale Financing",
        icon: CreditCard,
        desc: "Offer 3, 6, or 12-month payment plans right at checkout. The customer applies in under 2 minutes, gets approved instantly, and you receive the full payment within 1-2 business days."
      },
      {
        title: "Increase Average Ticket Size",
        icon: TrendingUp,
        desc: "When customers can pay $125/month instead of $1,500 upfront, they say yes to the premium option. Our merchants see 30-50% increases in average transaction value after adding financing."
      },
      {
        title: "Zero Risk to Your Business",
        icon: Shield,
        desc: "You get paid in full — the financing company assumes all the risk. No chargebacks, no collections, no bad debt. If the customer defaults, that's between them and the lender."
      },
      {
        title: "Multi-Industry Support",
        icon: Store,
        desc: "Financing for auto repair, healthcare, home services, salons, retail, and more. We match you with the right lending partners for your industry and average ticket size."
      }
    ],
    features: ["Instant customer approval (2 min)", "Full upfront funding to you", "3, 6, and 12-month terms", "No risk or collections for you", "Competitive interest rates", "In-store & online financing", "Multi-lender marketplace", "Integration with your POS"]
  },
  {
    id: "business-loans",
    title: "Business Loans & Capital",
    icon: DollarSign,
    tagline: "Fast capital when you need it.",
    heroDesc: "Whether you need working capital, equipment financing, or growth funding — we connect you with lending partners who fund in days, not months. No jumping through hoops, no waiting 6 weeks for an SBA decision. Fast, flexible capital for businesses that can't afford to wait.",
    sections: [
      {
        title: "Working Capital Loans",
        icon: Banknote,
        desc: "Short-term capital to cover payroll, inventory, marketing, or seasonal dips. Approvals in 24 hours, funding in 1-3 days. Flexible repayment terms based on your daily or weekly revenue."
      },
      {
        title: "Equipment Financing",
        icon: Settings,
        desc: "Finance POS systems, kitchen equipment, vehicles, medical devices, or any business equipment. Keep your cash reserves intact while getting the tools you need to grow."
      },
      {
        title: "Revenue-Based Financing",
        icon: BarChart3,
        desc: "Repay as a small percentage of daily sales — when business is slow, your payments are lower. No fixed monthly payments that strain your cash flow during off-seasons."
      },
      {
        title: "SBA & Term Loans",
        icon: FileText,
        desc: "For larger, longer-term needs, we connect you with SBA lenders and traditional term loan providers. Lower rates, longer terms, and the structure for major investments."
      }
    ],
    features: ["24-hour approval decisions", "Funding in 1-3 business days", "$5K - $500K+ available", "Working capital & lines of credit", "Equipment financing", "Revenue-based repayment", "SBA loan connections", "No upfront fees"]
  },
  {
    id: "pos-placement",
    title: "POS Placement",
    icon: MonitorSmartphone,
    tagline: "Free hardware. Zero upfront cost.",
    heroDesc: "We place modern, smart POS terminals and payment hardware at your business at no cost. Free equipment, free installation, free training. You just process with us and the hardware is yours to use — from countertop terminals to full restaurant POS systems with kitchen displays.",
    sections: [
      {
        title: "Smart Terminals",
        icon: CreditCard,
        desc: "Sleek, countertop-ready terminals with tap-to-pay, chip, swipe, and mobile wallet support. Process in under 2 seconds. Dual screens for customer-facing tip prompts and receipts."
      },
      {
        title: "Full POS Systems",
        icon: LayoutDashboard,
        desc: "Complete point-of-sale systems with touchscreen registers, barcode scanners, receipt printers, and cash drawers. Pre-configured for your industry — restaurant, retail, salon, or service."
      },
      {
        title: "Kitchen Display Systems",
        icon: Layers,
        desc: "For restaurants: digital kitchen displays that replace paper tickets. Orders route automatically from the POS to the kitchen, with bump functionality, timers, and order prioritization."
      },
      {
        title: "Mobile & Wireless Readers",
        icon: Globe,
        desc: "Take payments anywhere — tableside, at events, on the job site, or at the door. Compact wireless readers that connect via Bluetooth or WiFi and process just as fast as countertop terminals."
      }
    ],
    features: ["Free terminal placement", "Free installation & setup", "Free staff training", "Tap, chip, swipe & mobile pay", "Customer-facing tip screens", "Full POS system options", "Kitchen display integration", "Same-day deposit available"]
  }
];

interface ServicesPageProps {
  onOpenModal: (title: string, content: React.ReactNode) => void;
  onNavigate: (path: string) => void;
}

export default function ServicesPage({ onOpenModal, onNavigate }: ServicesPageProps) {
  useScrollAnimation();

  // Handle hash scrolling on mount
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, []);

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center relative z-10">
          <div className="animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 border border-teal/20 text-teal text-xs font-medium uppercase tracking-wider mb-8">
              <Zap className="w-3.5 h-3.5" />
              The "Grow" Step of Our System
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-[1.1]">
              Built to Grow.<br/>
              <span className="text-teal">Engineered to Scale.</span>
            </h1>
            <p className="text-offwhite/70 text-lg md:text-xl font-light max-w-2xl mx-auto mb-10 leading-relaxed">
              Once we uncover your savings, these are the systems we help you reinvest into. Every service is part of one unified growth engine — not a disconnected menu.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => onOpenModal("Book a Call", <ContactForm />)}
                className="inline-flex items-center justify-center px-8 py-4 bg-teal text-white font-medium rounded-sm transition-all duration-300 ease-custom hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,128,128,0.4)]"
              >
                Book a Call
              </button>
              <a 
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-white/20 text-white font-medium rounded-sm transition-all duration-300 hover:bg-white/5 hover:border-white/40"
              >
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Nav */}
      <section className="border-y border-white/5 bg-charcoal-dark/50 sticky top-[72px] z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-hide">
            {SERVICES_DETAIL.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-offwhite/70 text-sm font-medium hover:bg-teal/10 hover:border-teal/30 hover:text-teal transition-all duration-300"
              >
                <s.icon className="w-4 h-4" />
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Service Sections */}
      {SERVICES_DETAIL.map((service, idx) => (
        <section 
          key={service.id} 
          id={service.id}
          className={`py-24 md:py-32 relative overflow-hidden ${idx % 2 === 0 ? 'bg-charcoal' : 'bg-charcoal-dark/50'} border-b border-white/5`}
        >
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            {/* Section Header */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-20 ${idx % 2 !== 0 ? 'lg:grid-flow-dense' : ''}`}>
              <div className={`animate-on-scroll ${idx % 2 !== 0 ? 'lg:col-start-2' : ''}`}>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal text-xs font-medium uppercase tracking-wider mb-6">
                  <service.icon className="w-4 h-4" />
                  {`0${idx + 1}`}
                </div>
                <h2 className="font-serif text-4xl md:text-5xl text-white mb-4 leading-tight">{service.title}</h2>
                <p className="text-teal text-lg font-medium mb-4">{service.tagline}</p>
                <p className="text-offwhite/70 text-lg font-light leading-relaxed mb-8">{service.heroDesc}</p>
                <button 
                  onClick={() => onOpenModal(`Get Started with ${service.title}`, <ContactForm />)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal text-white font-medium rounded-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,128,128,0.4)]"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Visual */}
              <div className={`animate-on-scroll ${idx % 2 !== 0 ? 'lg:col-start-1' : ''}`} style={{ transitionDelay: '0.2s' }}>
                <div className="relative h-[350px] md:h-[400px] rounded-2xl overflow-hidden border border-white/10 bg-slate-dark/30 backdrop-blur-md flex items-center justify-center group shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:shadow-[0_0_50px_rgba(0,128,128,0.15)] transition-all duration-500">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,128,128,0.15)_0%,transparent_70%)] opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* Icon cluster */}
                  <div className="relative flex items-center justify-center">
                    <service.icon className="w-24 h-24 text-teal/30 group-hover:text-teal/50 group-hover:scale-110 transition-all duration-700" strokeWidth={0.75} />
                    {service.sections.slice(0, 3).map((sub, si) => {
                      const angles = [-40, 40, 0];
                      const distances = [100, 100, 120];
                      const angle = (angles[si] * Math.PI) / 180;
                      const x = Math.cos(angle) * distances[si];
                      const y = Math.sin(angle) * distances[si] - 40;
                      return (
                        <div 
                          key={si}
                          className="absolute w-12 h-12 rounded-xl bg-charcoal-dark/80 border border-white/10 flex items-center justify-center text-teal/60 group-hover:text-teal group-hover:border-teal/30 transition-all duration-500 shadow-lg"
                          style={{ 
                            transform: `translate(${x}px, ${y}px)`,
                            transitionDelay: `${si * 100}ms`
                          }}
                        >
                          <sub.icon className="w-5 h-5" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Capability Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 stagger-children">
              {service.sections.map((sub, si) => (
                <div 
                  key={si}
                  className="animate-on-scroll bg-slate-dark/30 border border-white/5 rounded-2xl p-8 hover:bg-slate-dark/50 hover:border-teal/20 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <sub.icon className="w-6 h-6 text-teal" />
                  </div>
                  <h3 className="text-xl text-white font-medium mb-3 group-hover:text-teal transition-colors">{sub.title}</h3>
                  <p className="text-offwhite/60 font-light leading-relaxed">{sub.desc}</p>
                </div>
              ))}
            </div>

            {/* Feature List */}
            <div className="animate-on-scroll bg-charcoal-dark/60 border border-white/5 rounded-2xl p-8 md:p-10">
              <h3 className="text-lg font-medium text-white mb-6">What's Included</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {service.features.map((feat, fi) => (
                  <div key={fi} className="flex items-start gap-3 text-sm text-offwhite/70">
                    <CheckCircle className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                    {feat}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Final CTA */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-teal/10 border-t border-teal/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,128,128,0.15)_0%,transparent_70%)]"></div>
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10">
          <div className="animate-on-scroll">
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">Ready to Reinvest Your Savings Into Growth?</h2>
            <p className="text-offwhite/70 text-lg font-light max-w-2xl mx-auto mb-10 leading-relaxed">
              Every dollar we save you on processing fees is a dollar you can put into the systems that scale your business. Let's talk about what that looks like for you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => onOpenModal("Book a Call", <ContactForm />)}
                className="cta-button-pulse inline-flex items-center justify-center px-8 py-4 bg-white text-charcoal font-medium rounded-sm transition-all duration-300 hover:scale-[1.02]"
              >
                Book a Call
              </button>
              <a 
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-white/20 text-white font-medium rounded-sm transition-all duration-300 hover:bg-white/5 hover:border-white/40"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export { SERVICES_DETAIL };

// Single-service standalone page (for individual routes like /services/web-design)
export function SingleServicePage({ serviceId, onOpenModal, onNavigate }: { serviceId: string, onOpenModal: (title: string, content: React.ReactNode) => void, onNavigate: (path: string) => void }) {
  useScrollAnimation();
  const service = SERVICES_DETAIL.find(s => s.id === serviceId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [serviceId]);

  if (!service) {
    return <div className="min-h-screen flex items-center justify-center text-white">Service not found.</div>;
  }

  const idx = SERVICES_DETAIL.indexOf(service);

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-6 md:px-12 text-center relative z-10">
          <div className="animate-on-scroll">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 border border-teal/20 text-teal text-xs font-medium uppercase tracking-wider mb-8">
              <service.icon className="w-3.5 h-3.5" />
              {service.title}
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-[1.1]">
              {service.title}
            </h1>
            <p className="text-teal text-lg md:text-xl font-medium mb-4">{service.tagline}</p>
            <p className="text-offwhite/70 text-lg font-light max-w-2xl mx-auto mb-10 leading-relaxed">
              {service.heroDesc}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => onOpenModal(`Get Started with ${service.title}`, <ContactForm />)}
                className="cta-button-pulse inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal text-white font-medium rounded-sm transition-all duration-300 ease-custom hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,128,128,0.4)]"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
              <a 
                href="/services"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-white/20 text-white font-medium rounded-sm transition-all duration-300 hover:bg-white/5 hover:border-white/40"
              >
                ← All Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Capability Cards */}
      <section className="py-20 md:py-28 bg-charcoal-dark/40 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 animate-on-scroll">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-4">What We Deliver</h2>
            <p className="text-offwhite/60 text-lg font-light max-w-xl mx-auto">Deep expertise across every aspect of {service.title.toLowerCase()}.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
            {service.sections.map((sub: any, si: number) => (
              <div 
                key={si}
                className="animate-on-scroll bg-slate-dark/30 border border-white/5 rounded-2xl p-8 hover:bg-slate-dark/50 hover:border-teal/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <sub.icon className="w-6 h-6 text-teal" />
                </div>
                <h3 className="text-xl text-white font-medium mb-3 group-hover:text-teal transition-colors">{sub.title}</h3>
                <p className="text-offwhite/60 font-light leading-relaxed">{sub.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature List */}
      <section className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="animate-on-scroll bg-charcoal-dark/60 border border-white/5 rounded-2xl p-8 md:p-10">
            <h3 className="text-lg font-medium text-white mb-6">What's Included</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {service.features.map((feat: string, fi: number) => (
                <div key={fi} className="flex items-start gap-3 text-sm text-offwhite/70">
                  <CheckCircle className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                  {feat}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-teal/10 border-t border-teal/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,128,128,0.15)_0%,transparent_70%)]"></div>
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10">
          <div className="animate-on-scroll">
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">Ready to Get Started?</h2>
            <p className="text-offwhite/70 text-lg font-light max-w-2xl mx-auto mb-10 leading-relaxed">
              Book a call and let's talk about how {service.title.toLowerCase()} can transform your business.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => onOpenModal(`Get Started with ${service.title}`, <ContactForm />)}
                className="cta-button-pulse inline-flex items-center justify-center px-8 py-4 bg-white text-charcoal font-medium rounded-sm transition-all duration-300 hover:scale-[1.02]"
              >
                Book a Call
              </button>
              <a 
                href="/"
                className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-white/20 text-white font-medium rounded-sm transition-all duration-300 hover:bg-white/5 hover:border-white/40"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
