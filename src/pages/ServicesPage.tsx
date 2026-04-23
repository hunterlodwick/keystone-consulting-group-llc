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
  Shield
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
