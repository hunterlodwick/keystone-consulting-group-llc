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
    image: "/images/services/web-design.jpg",
    imageAlt: "Modern dark monitor displaying a website glow",
    tagline: "Your website should be your best salesperson.",
    heroDesc: "Most sites sit there looking nice while the phone stays quiet. We build the other kind. The kind that stops the scroll, answers questions at 2 AM, and books the appointment before you ever pick up the phone.",
    sections: [
      {
        title: "3D Animated Websites",
        icon: Layers,
        desc: "You get about three seconds before a visitor bounces. Animations that move as they scroll buy you the next thirty. By then they've stopped comparing you to the other three tabs they have open."
      },
      {
        title: "AI Voice Chatbots",
        icon: Mic,
        desc: "Your website answers the phone now. It greets people, handles the same five questions you answer every day, and books the appointment. At 2 AM. On a Sunday. While you sleep."
      },
      {
        title: "High-Conversion Landing Pages",
        icon: TrendingUp,
        desc: "Traffic that doesn't convert is just a bigger hosting bill. Every headline, button, and proof point on the page exists to move one visitor one step closer to calling you."
      },
      {
        title: "Mobile-First & Lightning Fast",
        icon: Globe,
        desc: "Over half your visitors are standing in a parking lot on their phone, and they leave if it takes more than three seconds. Ours load in under two, and Google pushes you up the rankings for it."
      }
    ],
    features: ["Animations that stop the scroll", "A site that answers at 2 AM", "Appointments booked while you sleep", "Every page built to make the phone ring", "Fast on the phone in their hand", "Found on Google without paying per click", "A brand that looks bigger than you are", "You see exactly where leads come from"]
  },
  {
    id: "crm",
    title: "CRM Systems",
    icon: LayoutDashboard,
    image: "/images/services/crm.jpg",
    imageAlt: "Laptop with dark CRM screen glow and teal accents",
    tagline: "A CRM your team actually opens.",
    heroDesc: "Most CRMs get bought, half set up, then quietly abandoned. We build yours around the way your team already sells, so deals stop living in someone's head and a notebook in a truck.",
    sections: [
      {
        title: "Custom-Built Platforms",
        icon: Database,
        desc: "If your software makes your team work backwards, you bought the wrong software. We build the pipeline, the dashboard, and the reports around how you already sell. Nothing to work around."
      },
      {
        title: "Platform Configuration",
        icon: Workflow,
        desc: "You're already paying for HubSpot, Go High Level, or Salesforce, and using maybe a quarter of it. We clean up the mess and turn the thing you pay for into the thing you actually use."
      },
      {
        title: "Pipeline & Deal Tracking",
        icon: LineChart,
        desc: "Open one screen and see every deal, who owns it, and what it's worth. No Monday meeting just to find out where things stand. No spreadsheet somebody forgot to update on Thursday."
      },
      {
        title: "Automated Follow-Ups",
        icon: MessageSquare,
        desc: "Most leads go cold in 48 hours, and the business that follows up first usually wins. Texts, emails, and reminders fire the second a lead moves. Nobody has to remember anything."
      }
    ],
    features: ["A CRM shaped around how you sell", "Real value from the HubSpot you pay for", "Salesforce that finally makes sense", "Every deal on one screen", "No lead goes cold again", "Follow-up texts and emails on autopilot", "Know who is actually closing", "Know your month before it ends"]
  },
  {
    id: "automations",
    title: "AI & Automations",
    icon: Zap,
    image: "/images/services/automations.jpg",
    imageAlt: "Connected hardware nodes with teal light paths",
    tagline: "Stop paying people to do what software does for free.",
    heroDesc: "Every hour someone spends copying data between tools is an hour nobody spent selling. We hand the busywork to AI agents so your people can do the things only people can do.",
    sections: [
      {
        title: "AI Lead Qualification",
        icon: Bot,
        desc: "Your closers burn half their day on people who were never going to buy. AI scores and routes every lead the second it lands, so the only calls on the calendar are with people who have a budget and a deadline."
      },
      {
        title: "Customer Service Agents",
        icon: MessageSquare,
        desc: "The same eight questions, all day, every day. An AI agent handles them at midnight on a holiday, solves what it can, and passes you only the ones that need a human. No new hire, no payroll."
      },
      {
        title: "Workflow Automation",
        icon: Workflow,
        desc: "Nobody should be retyping the same customer into four different tools. We connect your CRM, invoicing, email, and calendar so the handoffs just happen. Three hours of daily busywork drops to zero."
      },
      {
        title: "System Integrations",
        icon: Layers,
        desc: "You bought good tools that refuse to speak to each other. We wire them together so one number lives in one place, and you stop wondering which report is telling the truth."
      }
    ],
    features: ["Your team only talks to real buyers", "Customers get answers at midnight", "Hours of data entry gone every week", "Your tools finally talk to each other", "One set of numbers you can trust", "Busywork handled before you ask", "Alerts the moment something needs you", "AI built for your business, not generic"]
  },
  {
    id: "consulting",
    title: "Business Consulting",
    icon: Compass,
    image: "/images/services/consulting.jpg",
    imageAlt: "Documents and calculator on a dark professional desk",
    tagline: "Find every dollar you're leaving on the table.",
    heroDesc: "You know something's leaking. You just can't see where. We go through the books, the tools, and the day-to-day until the waste is obvious. Then we build a plan to put that money back into growth.",
    sections: [
      {
        title: "Operational Audits",
        icon: Target,
        desc: "Most owners are too close to notice the $400/month tool nobody opens, or the process that takes four people when two would do. We find it. Line by line."
      },
      {
        title: "Revenue Leak Identification",
        icon: TrendingUp,
        desc: "Hidden fees, redundant subscriptions, pricing that hasn't moved in three years. These don't show up as a crisis. They just quietly shrink every paycheck until someone points them out."
      },
      {
        title: "Growth Strategy",
        icon: Rocket,
        desc: "Saving money feels good. Putting it somewhere that pays you back feels better. We build the reinvestment plan so every freed-up dollar has a job."
      },
      {
        title: "Fractional Advisory",
        icon: Shield,
        desc: "You don't need a full-time COO on payroll. You need someone who shows up monthly, looks at the numbers, and tells you what to do next. That's us."
      }
    ],
    features: ["Every profit leak on the table", "Know which tools are wasting money", "A plan for every saved dollar", "Growth roadmap you can actually follow", "Strategic advice without the full-time salary", "Monthly check-ins that keep you honest", "Vendors renegotiated or cut", "Processes that run without you"]
  },
  {
    id: "prep-to-sell",
    title: "Prep-to-Sell",
    icon: Target,
    image: "/images/services/prep-to-sell.jpg",
    imageAlt: "Abstract upward growth forms on a dark background",
    tagline: "Make your business worth more before you sell it.",
    heroDesc: "Buyers pay more for businesses that run without the owner. We help you clean the books, document the systems, and build the kind of company that sells for a multiple, not a discount.",
    sections: [
      {
        title: "Exit Strategy Planning",
        icon: Compass,
        desc: "What's your number, and when do you want it? We work backwards from that date and build a timeline that gets the business there, not a binder that sits on a shelf."
      },
      {
        title: "Financial Cleanup",
        icon: LineChart,
        desc: "Buyers open the books first. Messy personal expenses and unexplained costs kill deals or kill the price. We get the numbers clean so an acquirer sees a business, not a hobby."
      },
      {
        title: "Operational Systematization",
        icon: Workflow,
        desc: "If the business dies when you take a vacation, it isn't an asset. We document how everything gets done so someone else can run it, and buyers pay for that independence."
      },
      {
        title: "Valuation Maximization",
        icon: Rocket,
        desc: "A few points of recurring revenue or retention can add a full multiple to your sale price. We find the highest-leverage moves and help you hit them before you go to market."
      }
    ],
    features: ["A clear exit date and number", "Books that survive a buyer's review", "SOPs so the business runs without you", "Systems that outlive the founder", "Recurring revenue that raises the multiple", "Customers who stick around after you leave", "Owner-independence built in", "A valuation you can defend"]
  },
  {
    id: "seo",
    title: "SEO Services",
    icon: Search,
    image: "/images/services/seo.jpg",
    imageAlt: "Smartphone with soft search results glow",
    tagline: "Show up where your customers are already looking.",
    heroDesc: "People are searching for what you sell right now. If you're not on page one, they're calling your competitor. We get you ranking for the searches that actually turn into appointments, without paying for every click.",
    sections: [
      {
        title: "Local SEO & Map Pack",
        icon: MapPin,
        desc: "When someone types \"near me,\" three businesses get the call. Everyone else gets ignored. We get you into that map pack so the phone rings from people who were already ready to buy."
      },
      {
        title: "On-Page Optimization",
        icon: Code,
        desc: "Google decides in milliseconds whether your page is the answer. We tune every headline, meta tag, and structure so the engine trusts you enough to put you in front of the people who matter."
      },
      {
        title: "Content Strategy & Blogging",
        icon: PenTool,
        desc: "One good article can send you leads for years. We write the pages your customers are already googling, so traffic shows up month after month without another ad spend."
      },
      {
        title: "Technical SEO & Site Speed",
        icon: Zap,
        desc: "If Google can't crawl it or it loads too slow, you don't rank. We fix the invisible stuff under the hood so every page gets a fair shot at showing up."
      }
    ],
    features: ["Found on page one for the searches that convert", "Map pack visibility when they search near you", "Keywords your customers actually type", "Pages built to rank, not just look pretty", "A site Google can crawl and trust", "Content that keeps sending leads", "Backlinks that build real authority", "Monthly reports that show the climb"]
  },
  {
    id: "google-business",
    title: "Google My Business",
    icon: MapPin,
    image: "/images/services/google-business.jpg",
    imageAlt: "Smartphone with soft map glow in a dark environment",
    tagline: "Be the first name they see on the map.",
    heroDesc: "Before anyone hits your website, they check Google. Photos, stars, hours, reviews. We make that first look so strong that half your new customers never bother comparing anyone else.",
    sections: [
      {
        title: "Profile Optimization",
        icon: Settings,
        desc: "A half-filled profile looks like a half-serious business. We fill every category, photo, and detail so Google ranks you higher and searchers trust you enough to call."
      },
      {
        title: "Review Management",
        icon: Star,
        desc: "Five-star reviews close the deal before you ever pick up the phone. We set up automatic requests so happy customers leave them, and we help you respond so the next visitor sees you're paying attention."
      },
      {
        title: "Google Posts & Updates",
        icon: MessageSquare,
        desc: "A dead profile tells Google you've gone quiet. Weekly posts keep you active, surface your offers, and give someone scrolling Maps one more reason to choose you today."
      },
      {
        title: "Local Citation Building",
        icon: Globe,
        desc: "Wrong address on one directory, wrong phone on another, and Google gets confused. We clean up your name, address, and phone across 50+ listings so local search finally trusts you."
      }
    ],
    features: ["A profile that ranks and converts", "Reviews that show up without you asking", "Responses that build trust fast", "Weekly posts that keep you visible", "Photos that make them stop scrolling", "Q&A answered before they call", "Consistent listings across 50+ directories", "Monthly proof the map pack is moving"]
  },
  {
    id: "bpo",
    title: "BPO - Lead Generation",
    icon: Headphones,
    image: "/images/services/bpo.jpg",
    imageAlt: "Professional headset on a dark desk",
    tagline: "Your calendar fills up. You just show up and close.",
    heroDesc: "Prospecting eats the hours your closers should spend selling. We find the right people, warm them up, and put qualified appointments on your calendar. Your team only talks to buyers who are ready.",
    sections: [
      {
        title: "Outbound Prospecting",
        icon: Target,
        desc: "Cold outreach is a grind most teams abandon by week three. We build the list, write the messages, and run the emails, LinkedIn, and calls so conversations start without your people burning out."
      },
      {
        title: "Appointment Setting",
        icon: LayoutDashboard,
        desc: "No more chasing \"let me check my calendar.\" We handle the back-and-forth, lock the meeting, and send a brief so your closer walks in knowing who they're talking to and why."
      },
      {
        title: "Lead Nurturing Sequences",
        icon: MessageSquare,
        desc: "Not ready today doesn't mean never. Warm prospects stay in a nurture sequence until they are, then we book the call. You stop losing deals that just needed another touch."
      },
      {
        title: "Campaign Reporting & Optimization",
        icon: BarChart3,
        desc: "You'll know what got opened, who replied, and which appointments turned into pipeline. We tighten the message every month so next month's results beat this one's."
      }
    ],
    features: ["Prospects who match who you sell to", "Outreach that runs while you sell", "Appointments on the calendar, not maybes", "Warm leads that don't go cold", "Handoffs that land in your CRM", "Clear numbers on what's working", "Messaging tested until it converts", "A campaign manager who owns the results"]
  },
  {
    id: "consumer-financing",
    title: "Consumer Financing",
    icon: Banknote,
    image: "/images/services/consumer-financing.jpg",
    imageAlt: "Matte black credit card on a dark surface",
    tagline: "They say yes to the big ticket. You get paid today.",
    heroDesc: "Price is the objection that kills most sales. Financing turns a $1,500 no into a $125/month yes. You close more deals, raise the average ticket, and get the full amount upfront. No chasing payments.",
    sections: [
      {
        title: "Point-of-Sale Financing",
        icon: CreditCard,
        desc: "The customer applies in under two minutes at checkout. Instant approval, and the full payment hits your account in a day or two. They walk out with the service. You walk out paid."
      },
      {
        title: "Increase Average Ticket Size",
        icon: TrendingUp,
        desc: "When $125 a month feels easier than $1,500 today, people pick the premium option. Merchants who add financing typically see average tickets jump 30-50%."
      },
      {
        title: "Zero Risk to Your Business",
        icon: Shield,
        desc: "You get paid in full. The lender takes the risk. No chargebacks, no collections, no bad debt sitting on your books if someone stops paying."
      },
      {
        title: "Multi-Industry Support",
        icon: Store,
        desc: "Auto repair, healthcare, home services, salons, retail. We match you with lenders built for your ticket size so approvals actually happen, not just applications."
      }
    ],
    features: ["Approval in under two minutes", "Full funding to you upfront", "Terms that make big tickets feel small", "No collections or bad debt on you", "Rates customers will actually take", "Works in-store and online", "Multiple lenders for better approval odds", "Tied into the POS you already use"]
  },
  {
    id: "business-loans",
    title: "Business Loans & Capital",
    icon: DollarSign,
    image: "/images/services/business-loans.jpg",
    imageAlt: "Currency and calculator on a dark wooden desk",
    tagline: "Cash in days, not weeks of paperwork.",
    heroDesc: "Payroll doesn't wait for a six-week SBA decision. Neither does a deal that needs inventory tomorrow. We connect you with lenders who fund in days so you can move while the opportunity is still open.",
    sections: [
      {
        title: "Working Capital Loans",
        icon: Banknote,
        desc: "Cover payroll, stock the shelves, or ride out a slow month without raiding your personal account. Approvals in 24 hours, money in 1-3 days, paid back against how revenue actually comes in."
      },
      {
        title: "Equipment Financing",
        icon: Settings,
        desc: "Need a new oven, truck, or POS system? Finance it instead of draining cash reserves. Keep the money for operations while the equipment starts paying for itself."
      },
      {
        title: "Revenue-Based Financing",
        icon: BarChart3,
        desc: "Slow month? Your payment shrinks with sales. Busy month? You pay a bit more. No rigid fixed payment that punches a hole in cash flow when business dips."
      },
      {
        title: "SBA & Term Loans",
        icon: FileText,
        desc: "Bigger moves need longer money. We connect you with SBA and term lenders when you're ready for lower rates and a structure built for a real investment, not a stopgap."
      }
    ],
    features: ["A yes or no in 24 hours", "Money in your account in 1-3 days", "From $5K to $500K+ when you need it", "Capital for payroll, inventory, or growth", "Equipment without draining reserves", "Payments that flex with your sales", "SBA options for the bigger bets", "No fees just to apply"]
  },
  {
    id: "pos-placement",
    title: "POS Placement",
    icon: MonitorSmartphone,
    image: "/images/services/pos-placement.jpg",
    imageAlt: "Modern black POS terminal on a dark countertop",
    tagline: "New hardware. Zero check written.",
    heroDesc: "That outdated terminal is slowing down your line and embarrassing your brand. We put modern payment hardware in your business free. Free install, free training. You process with us, and the equipment stays.",
    sections: [
      {
        title: "Smart Terminals",
        icon: CreditCard,
        desc: "Tap, chip, swipe, Apple Pay. Under two seconds. The customer-facing screen handles tips and receipts so your staff isn't fumbling with paper while the next person waits."
      },
      {
        title: "Full POS Systems",
        icon: LayoutDashboard,
        desc: "Register, scanner, printer, cash drawer. Set up for how your industry actually sells, so your team isn't fighting the software during a rush."
      },
      {
        title: "Kitchen Display Systems",
        icon: Layers,
        desc: "Paper tickets get lost, smeared, and misread. Digital kitchen screens route every order the second it rings up, with timers that keep the line honest."
      },
      {
        title: "Mobile & Wireless Readers",
        icon: Globe,
        desc: "Tableside, job site, front door, pop-up event. Take the payment where the customer is standing, just as fast as the terminal on your counter."
      }
    ],
    features: ["Hardware that costs you nothing upfront", "Installed and ready without your IT guy", "Staff trained before the first rush", "Every way a customer wants to pay", "Tip screens that raise the average", "Full POS when a terminal isn't enough", "Kitchen screens that kill paper tickets", "Deposits that hit the same day"]
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
              Where Your Savings Go to Work
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-[1.1]">
              Turn Savings Into<br/>
              <span className="text-teal">Something That Pays You Back.</span>
            </h1>
            <p className="text-offwhite/70 text-lg md:text-xl font-light max-w-2xl mx-auto mb-10 leading-relaxed">
              Once we find the money you're overpaying, these are the systems we put it into. One connected growth engine, not a random menu of add-ons.
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
                <div className="relative h-[350px] md:h-[400px] rounded-2xl overflow-hidden border border-white/10 bg-slate-dark/30 group shadow-[0_20px_50px_rgba(0,0,0,0.4)] hover:shadow-[0_0_50px_rgba(0,128,128,0.15)] transition-all duration-500">
                  <img
                    src={service.image}
                    alt={service.imageAlt}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                    width={800}
                    height={600}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent pointer-events-none"></div>
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
              <h3 className="text-lg font-medium text-white mb-6">What You Walk Away With</h3>
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
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">What Would You Do With an Extra $2,000 a Month?</h2>
            <p className="text-offwhite/70 text-lg font-light max-w-2xl mx-auto mb-10 leading-relaxed">
              Most owners we talk to put it into the systems that bring in more customers. Book a call and we'll map out what that looks like for your numbers.
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
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
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
            {service.image && (
              <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video max-w-3xl mx-auto shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                <img
                  src={service.image}
                  alt={service.imageAlt}
                  className="absolute inset-0 w-full h-full object-cover"
                  width={800}
                  height={450}
                />
              </div>
            )}
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
            <h3 className="text-lg font-medium text-white mb-6">What You Walk Away With</h3>
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
