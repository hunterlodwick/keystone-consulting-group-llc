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

// Contextual CTAs per service - each page's action matches what the visitor came to do.
// Mirrors the Patterson Homes pattern (home="Find your place", plans="Talk about your plan",
// move-ins="Join the interest list"): never one generic "Get Started" everywhere.
type ServiceCta = { hero: string; mid?: { label: string; after: string }; close: string; closeBody: string };

const SERVICE_CTAS: Record<string, ServiceCta> = {
  "web-design": {
    hero: "See what your site could be",
    mid: { label: "Find out how slow your site is", after: "speed" },
    close: "Talk through your site",
    closeBody: "Bring the site you have now. We will tell you what is costing you calls and what we would change first.",
  },
  automations: {
    hero: "Find out what we can automate",
    mid: { label: "Add up your team's hours", after: "hours" },
    close: "Map your first automation",
    closeBody: "Walk us through the work your team repeats every day. We will show you what can run itself.",
  },
  crm: {
    hero: "See your pipeline in one place",
    close: "Talk through your sales process",
    closeBody: "Show us how your team sells today and we will map it into a CRM they will actually open.",
  },
  consulting: {
    hero: "Find where the money is leaking",
    close: "Start with an operations review",
    closeBody: "We will go through the books, the tools, and the day-to-day until the waste is obvious.",
  },
  "prep-to-sell": {
    hero: "See what your business is worth",
    close: "Talk about your exit",
    closeBody: "Tell us your timeline and we will show you what raises the multiple before a buyer ever looks.",
  },
  seo: {
    hero: "See where you rank today",
    close: "Talk through your search visibility",
    closeBody: "We will show you the terms your customers actually search and where you stand on them.",
  },
  "google-business": {
    hero: "See how you show up locally",
    close: "Talk through your local presence",
    closeBody: "We will review your profile, your reviews, and how you compare to the shop down the street.",
  },
  bpo: {
    hero: "See what your pipeline could hold",
    close: "Talk through your lead flow",
    closeBody: "Tell us your target and we will show you how the outreach and booking would run.",
  },
  "consumer-financing": {
    hero: "See what financing would do to your close rate",
    close: "Talk through customer financing",
    closeBody: "We will show you how pay-over-time changes the size of the jobs you win.",
  },
  "business-loans": {
    hero: "See what you qualify for",
    close: "Talk through your funding options",
    closeBody: "Bring the numbers and we will show you what capital is available and what it costs.",
  },
  "pos-placement": {
    hero: "Get your counter set up",
    close: "Talk through hardware for your counter",
    closeBody: "Tell us your setup and we will show you what terminals and hardware fit it.",
  },
};

const ctaFor = (id: string, fallback: string) => SERVICE_CTAS[id] ?? {
  hero: "Talk through " + fallback.toLowerCase(),
  close: "Talk through " + fallback.toLowerCase(),
  closeBody: "Tell us what you are trying to fix and we will show you what we would do first.",
};

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

type ServiceDetail = {
  id: string; title: string; icon: typeof Code; image: string; imageAlt: string;
  tagline: string; heroDesc: string;
  sections: { title: string; image?: string; icon: typeof Code; desc: string; replaces?: string; produces?: string; audience?: string }[];
  features: string[];
  problem?: string[];
  heroNote?: string;
  statistics?: { title: string; value: string; explanation: string; arithmetic?: string; source: string; url: string }[];
  buildIncludes?: { intro: string; items: { title: string; description: string }[] };
  interactiveEvidence?: { title: string; paragraphs: string[]; sources: { label: string; url: string }[] };
  process?: { title: string; description: string }[];
  fit?: { yes: string[]; no: string[] };
  questions?: { question: string; answer: string }[];
  close?: { title: string; description: string; button: string };
};

const SERVICES_DETAIL: ServiceDetail[] = [
  {
      "id": "web-design",
      "image": "/images/services/web-design.jpg",
      "imageAlt": "Modern dark monitor displaying a website glow",
      "tagline": "Your website should be your best salesperson.",
      "heroDesc": "Most sites sit there looking nice while the phone stays quiet. We build the other kind. The kind that stops the scroll, answers questions at 2 AM, and books the appointment before you ever pick up the phone.",
      "title": "Website Builds",
      "problem": [
          "You send a prospect your website, then explain on the phone what the page should have made clear. Your work has improved. The site still describes the business you used to run.",
          "On a phone, the contact button is hard to find. A visitor has to pinch the screen to read the service details. Someone interested enough to click still has to work out how to buy.",
          "You want a site you can be proud to send people to. You also need it to answer practical questions and put an enquiry where your team will see it. A good-looking page that leaves that job unfinished is still unfinished."
      ],
      "sections": [
    {
        "title": "Turn visits into calls with a custom business website",
        "icon": Code,
        "image": "/images/services/sub/mobile-first-lightning-fast.jpg",
        "desc": "Our core offering is a custom business website. We design around how your customer decides: what you do, why they should trust you, and how to get in touch. Most clients need this foundation first.",
        "replaces": "An outdated brochure site that leaves you explaining the basics on every call, or a template that buries the contact button.",
        "produces": "Pages built to make the phone ring, with clear service details and a direct enquiry path. Mobile-first layouts and fast loading help people act from the screen they have.",
        "audience": "Local businesses, trades and professional services that need customers to understand the offer and contact the team."
    },
    {
        "title": "Turn a campaign click into a lead",
        "icon": TrendingUp,
        "image": "/images/services/sub/high-conversion-landing-pages.jpg",
        "desc": "Lead-generating landing pages focus on a single offer. The page answers the reason someone clicked your ad, campaign or service link and gives them a clear next step.",
        "replaces": "Sending paid traffic to a general homepage, where visitors have to find the offer again.",
        "produces": "A focused offer with supporting proof and a relevant enquiry form. We check that submissions reach the intended person and agree how to measure results.",
        "audience": "Businesses running ads, promoting a specific service or testing an offer with a defined audience. Conversion is the goal, not a promised rate."
    },
    {
        "title": "Let customers browse, buy and pay online",
        "icon": Store,
        "image": "/screenshots/opt/benitz-appliance.jpg",
        "desc": "E-commerce and online stores give customers a route from product catalogue to checkout. We organise products around how people shop and make the purchase steps clear.",
        "replaces": "Taking every order through messages, sending separate payment links, or making customers call to find out what you sell.",
        "produces": "Product pages, a cart and checkout, plus an order flow your team can manage. Product options, stock handling, delivery and payment connections are agreed before the build.",
        "audience": "Retailers and product businesses ready to sell online. Catalogue size and fulfilment needs determine the scope and platform."
    },
    {
        "title": "Capture the job while the customer is ready",
        "icon": FileText,
        "image": "/images/services/sub/appointment-setting.jpg",
        "desc": "Bookings, quotes and enquiries turn interest into a request your team can act on. We ask for the details you need to schedule an appointment or price the work.",
        "replaces": "Missed calls, vague contact messages and forms that land in an inbox nobody checks.",
        "produces": "Booking systems, quote requests or service enquiry flows, with forms routed to the right person. We test confirmations and the handoff into your calendar or CRM where included.",
        "audience": "Trades, clinics and appointment-based businesses, plus teams that need job details before they can quote."
    },
    {
        "title": "Answer the next customer after closing time",
        "icon": Mic,
        "image": "/images/services/sub/ai-voice-chatbots.jpg",
        "desc": "AI on the website gives visitors a chat or voice assistant that answers approved questions and captures leads outside business hours. With an agreed calendar connection, it can book appointments.",
        "replaces": "Waiting until morning to answer routine questions, or asking visitors to search through pages for a simple answer.",
        "produces": "An assistant with defined answers and a clear handoff to your team when it is unsure. We scope the knowledge, booking access and ongoing usage fees before connecting it.",
        "audience": "Businesses handling repeated pre-sale questions. Private account reviews and decisions requiring staff judgement stay with a person."
    },
    {
        "title": "Help buyers inspect the details before they decide",
        "icon": Layers,
        "image": "/images/services/sub/3d-animated-websites.jpg",
        "desc": "Interactive 3D and motion are specialist options. A customer can rotate a product or explore a space when photographs leave an important question unanswered. Scroll-driven motion can explain a product or process when movement helps.",
        "replaces": "Guessing at a product’s shape from a fixed angle, or leaving buyers without a way to explore a space they cannot visit yet.",
        "produces": "A product viewer or purposeful motion, with mobile performance checks and a readable reduced-motion experience. A simple rotate-and-look viewer is often enough. Product-viewer research does not establish a return on decorative scroll animation.",
        "audience": "E-commerce product pages, including furniture, apparel, footwear, jewellery or customisable products; real estate and property; automotive; equipment and machinery; hospitality venues. It is not right for every business. We will tell you when it is not worth the money."
    }
],
      "buildIncludes": {
    "intro": "Every build starts with a written scope. We agree which work below your project needs, who supplies what, and what costs continue after launch. This is not an unlimited package.",
    "items": [
        {
            "title": "Strategy: give the visitor a clear next step",
            "description": "We agree who the site is for, what they need to know and the main action they should take. That decision guides the pages we build."
        },
        {
            "title": "Design: look like the business customers will meet",
            "description": "We design around your brand and your actual customers, not a template. You review layouts before they become finished pages."
        },
        {
            "title": "Copy: answer the questions that hold up a sale",
            "description": "We write plain-language copy aimed at the agreed action. You confirm the facts; we remove filler and claims you cannot support."
        },
        {
            "title": "Build: make the site usable on every screen",
            "description": "Responsive pages, fast loading and accessible navigation are part of the build. We check keyboard use, readable contrast and labelled forms alongside the mobile customer path."
        },
        {
            "title": "Technical foundations: be ready to be found",
            "description": "We agree responsibility for hosting, domain setup and SSL. Analytics, SEO structure and the sitemap are scoped alongside Google Business Profile setup or updates where relevant. Account fees are identified separately."
        },
        {
            "title": "Integrations: get the enquiry where it belongs",
            "description": "We scope booking, payments, CRM and email connections around the tools you use. Forms route to the agreed people, with test submissions before launch."
        },
        {
            "title": "Handover: own it and know how to use it",
            "description": "You own the site and the accounts. We hand over access and train you to make simple edits using the agreed editing setup. Third-party services keep their own terms."
        },
        {
            "title": "After launch: know who is watching and who to call",
            "description": "We agree the monitoring and support plan before launch, including uptime, form delivery, performance and analytics checks where included. Your scope names the support contact, response arrangements and any ongoing fee; later changes are quoted separately."
        }
    ]
},
      "interactiveEvidence": {
    "title": "What the product-viewer tests actually show",
    "paragraphs": [
        "Fibbl reports a 6.3% conversion uplift for GANT at 95% statistical significance. Nubikk saw add-to-cart rise 10.9% and visitors reaching checkout rise 21%, both at 99% certainty. These are footwear/apparel brand tests, not KCG results or universal forecasts.",
        "The gains are modest overall and can be stronger on mobile. Nubikk’s desktop transactions showed no measurable effect. Samples are limited and confidence intervals are wide. Novelty may inflate early results; the lift may shrink as 3D becomes standard. Brands investing in 3D often improve the rest of their digital experience too. The simple viewer carries most usage; extra effects need their own business case."
    ],
    "sources": [
        {
            "label": "Fibbl, GANT conversion study",
            "url": "https://fibbl.com/gant-3d-first/"
        },
        {
            "label": "Fibbl, what the footwear A/B tests actually show",
            "url": "https://fibbl.com/does-3d-increase-conversion-rate-what-the-footwear-a-b-tests-actually-show/"
        }
    ]
},
      "statistics": [
          {
              "title": "A reason to take mobile loading seriously",
              "value": "53%",
              "explanation": "Think with Google reports that this share of mobile visitors leaves a page taking longer than 3 seconds to load. This is historical research, not a measurement of your customers or a KCG result.",
              "source": "Think with Google, Masters of Mobile report",
              "url": "https://www.thinkwithgoogle.com/_qs/documents/6522/TwG_AUNZ_Masters_of_Mobile_Report.pdf"
          },
          {
              "title": "Speed has a conversion cost",
              "value": "20%",
              "explanation": "The Google report describes a drop in conversions for every second of mobile loading delay. This is a historical research finding, not a universal forecast. Making a page faster does not guarantee an equal increase in sales.",
              "source": "Think with Google, Masters of Mobile report",
              "url": "https://www.thinkwithgoogle.com/_qs/documents/6522/TwG_AUNZ_Masters_of_Mobile_Report.pdf",
              "arithmetic": "Derived illustration: starting conversions × (1 − 20 / 100) = starting conversions × 0.80 after a second of delay. That leaves 80% of the starting total in this illustration."
          },
          {
              "title": "The performance targets we work toward",
              "value": "2.5 seconds",
              "explanation": "Google’s good-experience thresholds are LCP within 2.5 seconds, INP under 200 milliseconds, and CLS under 0.1. LCP measures loading. INP measures responsiveness, while CLS measures visual stability. These are targets, not a claim that an untested build passes. Good scores alone do not guarantee rankings.",
              "source": "Google Search Central, Core Web Vitals",
              "url": "https://developers.google.com/search/docs/appearance/core-web-vitals"
          }
      ],
      "process": [
          {
              "title": "Discovery: agree on the customer path",
              "description": "Show us the current site and explain what a good enquiry looks like. We review the pages you need and the material you already have. Seth and Hunter work directly with you to decide what belongs in the build."
          },
          {
              "title": "Build: review the actual pages",
              "description": "We turn the agreed scope into pages you can open and read. You check that the offer is accurate. We test the phone layout and any assistant or booking connection included in your project before asking you to approve it."
          },
          {
              "title": "Launch: check the path to your inbox",
              "description": "We verify the domain setup and submit test enquiries through the finished site. We check the agreed customer paths on mobile and desktop. Any unresolved dependency is made visible before launch."
          },
          {
              "title": "Handover: know what you own",
              "description": "You own the site, with no platform lock-in. We walk through the agreed editing setup and hand over access. Hosting and any third-party assistant fees are identified separately so you know what continues after the build."
          }
      ],
      "fit": {
          "yes": [
              "You need your site to explain the work before a prospect calls.",
              "You can supply accurate service details and approve the pages with us.",
              "You want ownership of the site and a build shaped around your actual sales process."
          ],
          "no": [
              "You need a guaranteed ranking or sales figure before anyone has measured your traffic.",
              "You want animation everywhere even when it makes the site harder to use.",
              "You need a custom application outside these capabilities without a separate scope."
          ]
      },
      "questions": [
          {
              "question": "What does a website cost?",
              "answer": "We quote after reviewing the pages and connections you need. A focused landing page and a site with a voice assistant involve different work. We identify processing savings first and discuss reinvesting verified savings into the build. Savings are not assumed to cover the whole project."
          },
          {
              "question": "How long will the build take?",
              "answer": "The schedule depends on the agreed scope and when content or account access is available. We set review points before work begins. We will not attach a stock turnaround promise to a project we have not looked at."
          },
          {
              "question": "What if we already have a website?",
              "answer": "Send it to us. We review what is useful before recommending a replacement. Existing copy or photographs may carry over if you own them and they still describe the business accurately. We agree what changes before building."
          },
          {
              "question": "Do I own it, and can I move it later?",
              "answer": "Yes. You own your site and are not locked to a KCG platform. We explain the handover and hosting arrangements in the scope. Third-party subscriptions have their own terms, which we identify before you commit."
          },
          {
              "question": "Can the site work with our current CRM?",
              "answer": "We check the form destination and the access your CRM allows before promising a connection. The goal is an enquiry arriving where the team already works. If the current system limits that handoff, we explain the options and scope the work."
          },
          {
              "question": "How soon will it bring in customers?",
              "answer": "The site can accept enquiries once it is live and the contact path is tested. Generating demand is a separate question. We cannot promise a sales date or conversion lift. Your traffic and enquiry baseline give us a starting point for measurement, so any lift we report later is measured against your own numbers rather than a promise made now."
          },
          {
              "question": "What do you need from us?",
              "answer": "An explanation of your services and access to whoever approves the content. We also need the brand material you have permission to use. For a rebuild, we identify the domain and hosting access needed before the launch date is agreed."
          }
      ],
      "close": {
          "title": "Show us the site you have outgrown.",
          "description": "Send your current website and the part of the enquiry process that frustrates you. Seth or Hunter will discuss what needs rebuilding and where processing savings might help fund it.",
          "button": "Discuss my website"
      },
      "icon": Code,
      "features": [
          "Built around your actual workflow",
          "Direct access to Seth and Hunter",
          "Processing savings considered before the build",
          "Clear ownership and handover"
      ]
  },
  {
      "id": "crm",
      "title": "CRM Systems",
      "icon": LayoutDashboard,
      "image": "/images/services/crm.jpg",
      "imageAlt": "Laptop with dark CRM screen glow and teal accents",
      "tagline": "Know who needs a call before the deal goes quiet.",
      "heroDesc": "Your team should be able to open the pipeline and know what happens next. We build custom CRMs or configure the HubSpot, Salesforce or GoHighLevel you already pay for. The aim is simple: keep customer history and follow-up with the business, instead of scattered across phones and notebooks.",
      "problem": [
          "If two or more people sell or quote, a missed handoff can leave a good prospect waiting. Trades with outstanding estimates feel this every week. So do teams whose Monday meeting exists mainly to find out where deals stand. The follow-up that never happens is money you never get the chance to earn."
      ],
      "sections": [
          {
              "title": "See every deal and its next action",
              "icon": LayoutDashboard,
              "desc": "Know which quotes need attention without asking everyone for an update. We map stages to real decisions, give each opportunity an owner, and show the next action with a due date. A stalled quote stays visible until someone resolves it."
          },
          {
              "title": "Get value from the software you own",
              "icon": Settings,
              "desc": "Keep a platform that fits and fix the setup around it. We review unused fields, confusing stages and duplicate records in your existing CRM. If your workflow needs a custom system, we explain the maintenance and ownership tradeoffs before recommending a build."
          },
          {
              "title": "Follow up while interest is still there",
              "icon": MessageSquare,
              "desc": "Give staff a prompt when an enquiry arrives or a quote needs a reply. We configure assignments and agreed messages, with stop rules when someone responds or opts out. An automatic acknowledgement supports the handoff; it does not replace a useful conversation."
          },
          {
              "title": "Run the meeting from reliable numbers",
              "icon": LineChart,
              "desc": "See open value, ageing opportunities and closed business from the same records your team works in. We agree what each report means before building it. Forecasts remain estimates, and missing data stays visible instead of making the month look healthier than it is."
          }
      ],
      "buildIncludes": {
          "intro": "The scope names the workflow and records included, along with each connection. Training is part of making the system usable.",
          "items": [
              {
                  "title": "A pipeline your team recognises",
                  "description": "Defined stages, required fields and ownership rules, reviewed with the people who actually sell."
              },
              {
                  "title": "A controlled data move",
                  "description": "An agreed import, duplicate review and spot checks against your old records. Historic notes are included where the source permits export."
              },
              {
                  "title": "Working follow-up and reporting",
                  "description": "Tested reminders and scoped integrations, plus dashboards with clear definitions and an exception queue."
              },
              {
                  "title": "Access and handover",
                  "description": "Staff permissions, practical training and written support arrangements. Platform subscriptions and later changes are priced separately."
              }
          ]
      },
      "statistics": [
          {
              "title": "Return depends on execution",
              "value": "$3.10",
              "explanation": "Nucleus Research reported this average return per dollar spent in its 2024 analysis, alongside a 37% decline over the preceding ten years. That does not prove why returns fell. Our takeaway: measure workflow improvements instead of assuming a software purchase creates value.",
              "source": "Nucleus Research, CRM benefit areas with the greatest ROI impact (2024)",
              "url": "https://nucleusresearch.com/research/single/crm-benefit-areas-with-the-greatest-roi-impact/"
          },
          {
              "title": "Speed gives follow-up a purpose",
              "value": "21x",
              "explanation": "The MIT/InsideSales lead-response research reported 21 times higher qualification odds for web leads called within five minutes versus thirty. This older finding concerns qualification, not closed sales or a promised return from your CRM.",
              "source": "MIT/InsideSales, Lead Response Management study (2007); InsideSales recap (2015)",
              "url": "https://resources.insidesales.com/blog/infographic-2/"
          }
      ],
      "process": [
          {
              "title": "Discovery: follow a real quote",
              "description": "We trace an enquiry through your current process and identify where ownership disappears. You choose a staff member to approve the new workflow."
          },
          {
              "title": "Configure: keep the useful parts",
              "description": "We build or configure the agreed stages, import a sample and test the rules. Your team checks that the system reflects the work."
          },
          {
              "title": "Launch: work real opportunities",
              "description": "Staff use the pipeline with oversight. We check assignments and follow-up delivery, including replied-to leads that should leave an automated sequence."
          },
          {
              "title": "Handover: keep it current",
              "description": "We train the process owner and agree how to review overdue work. Ongoing support and software costs are documented before handover."
          }
      ],
      "fit": {
          "yes": [
              "You have multiple people selling or quoting and need shared customer history.",
              "You can name someone to keep stages and records accurate."
          ],
          "no": [
              "You expect software to fix a sales process nobody will follow.",
              "You need a guaranteed revenue increase before measuring your current pipeline."
          ]
      },
      "questions": [
          {
              "question": "Do we have to replace our CRM?",
              "answer": "No. We inspect the current setup first. A cleaner pipeline and better handoffs may solve the problem without a migration or another subscription."
          },
          {
              "question": "Will my team actually use it?",
              "answer": "We involve the people entering the data and remove fields without a purpose. Adoption still needs an owner who uses the same system and follows up on missing records."
          },
          {
              "question": "Can you bring our old data across?",
              "answer": "We check export access and sample records before agreeing the migration. Unsupported attachments or incomplete history are identified before you rely on the new system."
          },
          {
              "question": "What does it cost?",
              "answer": "Cost depends on configuration, migration and connections. The quote separates implementation from platform fees and support so you can judge the full commitment."
          },
          {
              "question": "Can it text leads automatically?",
              "answer": "Where the platform supports it, yes. We agree permission handling, message content and stop rules. Staff retain control when a customer needs a real answer."
          }
      ],
      "close": {
          "title": "Show us the quotes nobody has followed up.",
          "description": "Bring your current pipeline, even if it is a spreadsheet. Seth or Hunter will map the next actions and discuss whether your existing CRM can handle them.",
          "button": "Discuss my sales process"
      },
      "features": [
          "Shared deal ownership",
          "Quote follow-up reminders",
          "Existing CRM configuration",
          "Custom pipeline options",
          "Useful sales dashboards",
          "Data migration and training"
      ]
  },
  {
      "id": "automations",
      "image": "/images/services/automations.jpg",
      "imageAlt": "Connected hardware nodes with teal light paths",
      "tagline": "Hand the repeat work to software that does not forget.",
      "heroDesc": "Every hour someone spends copying data between tools is an hour nobody spent selling. We hand the busywork to AI agents so your people can do the things only people can do.",
      "title": "AI Implementations",
      "heroNote": "Software can reduce repetitive work, but AI usage and connected tools can carry fees. We include those costs when deciding what is worth automating.",
      "problem": [
          "A new enquiry arrives while you are serving a customer. By the time someone replies, the prospect has already called elsewhere. The lead was there. The handoff was missing.",
          "Your team copies customer details from a message into the CRM, then repeats the entry in another tool. When something changes, someone has to remember every place it was copied.",
          "You are interested in AI, but you do not need another dashboard to babysit. You need a specific piece of work to stop landing back on your desk, with a way to see when the software needs help."
      ],
      "sections": [
          {
              "title": "AI Lead Qualification",
              "icon": Bot,
              "desc": "We build an agent around the questions your team uses to decide how to handle an enquiry. It collects the relevant details and routes the conversation according to rules you approve.",
              "replaces": "Manual sorting of enquiries and repeated introductory questions. It gives your team context before a call instead of making the prospect explain the same thing again.",
              "produces": "A lead record with the information gathered and a clear next action. Incomplete or ambiguous answers can go to a person for review. Qualification is a routing decision, not proof that someone will buy.",
              "audience": "Businesses with a repeatable enquiry process and a clear definition of a useful lead. If your criteria live only in the owner’s head, we need to make them explicit first."
          },
          {
              "title": "Customer Service Agents",
              "icon": MessageSquare,
              "desc": "We configure an agent to answer recurring questions from approved business information. You decide what it may handle and which requests must go straight to your staff.",
              "replaces": "Repeated replies written from scratch and customers waiting for information that is already documented. Your team keeps the conversations that need judgement or account-specific decisions.",
              "produces": "Answers grounded in the material you provide, with a handoff when the agent cannot resolve the request. We test uncertain questions as well as easy ones, so an unsupported answer is treated as a failure.",
              "audience": "Teams receiving recurring service questions whose answers can be kept current. If nobody can own the underlying information, the assistant will not stay useful on its own."
          },
          {
              "title": "Workflow Automation",
              "icon": Workflow,
              "desc": "We turn an agreed sequence of routine actions into a workflow. A completed form might create a record and notify its owner. Each action has a defined trigger so you can explain why it happened.",
              "replaces": "Copying data between screens and relying on someone to remember the next handoff. We start with a process that already makes sense, then remove the repeated manual steps.",
              "produces": "A workflow with clear inputs and a visible outcome. We agree what happens when information is missing or a connected tool is unavailable. Your team needs a way to catch exceptions rather than assume every run succeeded.",
              "audience": "Businesses doing the same administrative handoff repeatedly. A process that changes with every case may need human approval at key points instead of automatic execution throughout."
          },
          {
              "title": "System Integrations",
              "icon": Layers,
              "desc": "We connect the tools you already use where their supported interfaces allow it. We decide which system owns each piece of information and when changes should reach the other system.",
              "replaces": "Duplicate entry and conflicting records. A customer update should not become a guessing game about which screen contains the current information.",
              "produces": "An agreed data handoff between your tools, with field mapping and failure handling checked before use. The scope defines which direction data moves and what must remain under human control.",
              "audience": "Businesses with useful software that does not currently share the information staff need. We inspect access limits first. Paying for a tool does not necessarily mean it permits every integration you want."
          }
      ],
      "statistics": [
          {
              "title": "What enterprise users reported",
              "value": "40–60 minutes",
              "explanation": "OpenAI’s enterprise AI report says users reported this much time saved per active day. It is self-reported enterprise experience, not measured savings for KCG clients. It gives us a benchmark to investigate, not an outcome to promise.",
              "source": "OpenAI, The state of enterprise AI (2025)",
              "url": "https://cdn.openai.com/pdf/7ef17d82-96bf-4dd1-9df2-228f7f377a29/the-state-of-enterprise-ai_2025-report.pdf",
              "arithmetic": "Derived illustration, assuming use on 5 working days: 40–60 minutes × 5 = 200–300 minutes per week. Divide by 60 minutes per hour = 3 hours 20 minutes to 5 hours per week. This assumes the reported daily saving repeats each day; use your measured saving and actual days instead."
          },
          {
              "title": "Customer support research",
              "value": "14%",
              "explanation": "McKinsey describes a company with 5,000 support agents where generative AI increased issues resolved per hour by 14%. This concerns support work in that setting. It does not establish the same improvement for your team or mean staff can be removed.",
              "source": "McKinsey, The promise and the reality of gen AI agents in the enterprise (May 2024)",
              "url": "https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-promise-and-the-reality-of-gen-ai-agents-in-the-enterprise",
              "arithmetic": "Derived: baseline issues resolved per hour × (1 + 14 / 100) = baseline × 1.14. This expresses the study’s productivity change; it is not a 14% reduction in working hours."
          }
      ],
      "process": [
          {
              "title": "Discovery: watch the work happen",
              "description": "Walk Seth and Hunter through a real enquiry or repeated task. We identify where people wait and where information gets copied. We agree a baseline and choose a bounded workflow, including the cases that should stay with a person."
          },
          {
              "title": "Build: test the rules against real cases",
              "description": "We configure the agent or workflow around your approved process. You review its answers and routing decisions. We test missing information and failed connections as well as the expected path before giving it a live responsibility."
          },
          {
              "title": "Launch: introduce it with oversight",
              "description": "We agree what can run automatically and what needs approval. Your team checks early results against the original task. A fast reply that sends a lead to the wrong place is a defect, even if the automation ran successfully."
          },
          {
              "title": "Handover: give someone ownership",
              "description": "We train the people who will use the workflow and agree who maintains its business information. You see how to handle exceptions and when to pause it. Any ongoing support arrangement and software fees are specified in the scope."
          }
      ],
      "fit": {
          "yes": [
              "You can point to recurring work and show how the team handles it today.",
              "Someone can approve the answers and own changes to the process.",
              "Your existing tools permit the access needed for the agreed workflow."
          ],
          "no": [
              "You want AI to make every judgement without anyone reviewing exceptions.",
              "Your process changes constantly and nobody can define a reliable handoff.",
              "You expect a guaranteed headcount reduction or savings figure before measuring the work."
          ]
      },
      "questions": [
          {
              "question": "What does an AI implementation cost?",
              "answer": "The quote depends on the workflow and the systems it touches. We separate build work from recurring software or usage fees. KCG looks for processing savings first, then discusses reinvesting verified savings. We do not assume those savings will pay for everything."
          },
          {
              "question": "How long until it works?",
              "answer": "We agree a schedule after checking access and the process itself. A workflow is ready when it handles the agreed cases and exceptions reliably enough for its role. Measurable value takes actual use and a comparison with the baseline, not a launch announcement."
          },
          {
              "question": "Do we need to replace our CRM or website?",
              "answer": "Usually the first step is to inspect what you already have. We build around your actual workflow and check what your tools allow. If a connection is unavailable or would require a different subscription, we explain that before including it in the scope."
          },
          {
              "question": "What happens when the AI gets something wrong?",
              "answer": "We define where it must ask for help and how staff review its output. An agent should not invent an answer because the business information is missing. The launch checks include unclear requests, and your team needs a clear way to take over."
          },
          {
              "question": "Do we own the implementation?",
              "answer": "Ownership and access are written into the scope for the work we build. Third-party models and tools retain their own licenses and fees. If a website is part of the project, you own that site with no platform lock-in. We explain dependencies before you commit."
          },
          {
              "question": "How much time will we actually get back?",
              "answer": "We measure the task before and after, including the time spent correcting output or handling exceptions. That gives you a daily figure measured against your own baseline, not a projection. Recovered time can create room for other work; it is not automatically money removed from payroll."
          },
          {
              "question": "What do you need from our team?",
              "answer": "Examples of the work and an owner who can say what a correct result looks like. We identify the account access required for the agreed connections. You approve the information an agent may use and the actions it may take before it handles live work."
          }
      ],
      "close": {
          "title": "Show us the task you keep repeating.",
          "description": "Describe the handoff that keeps coming back to your desk and the tools involved. Seth or Hunter will review where automation fits and what needs to stay with your people.",
          "button": "Discuss my workflow"
      },
      "icon": Zap,
      "features": [
          "Built around your actual workflow",
          "Direct access to Seth and Hunter",
          "Processing savings considered before the build",
          "Clear ownership and handover"
      ]
  },
  {
      "id": "consulting",
      "title": "Consulting Services",
      "icon": Compass,
      "image": "/images/services/consulting.jpg",
      "imageAlt": "Documents and calculator on a dark professional desk",
      "tagline": "Know what to fix first, and who will get it done.",
      "heroDesc": "You can have customers, capable staff and a full calendar while every decision still comes back to you. We find where time and money leak, choose the changes worth making, and put them in an order your team can deliver. Advisory work should end in decisions you can act on.",
      "problem": [
          "This is for owners with a business worth growing but no room left to manage another initiative. Perhaps you bought tools that never stuck. Perhaps the same problem returns every month. We start with how work actually happens, because buying another system before understanding the problem can make it more expensive."
      ],
      "sections": [
          {
              "title": "Find the cost behind the frustration",
              "icon": Target,
              "desc": "See which problems deserve attention before spending on a fix. We review recurring costs and follow a sample of work from enquiry to payment. A subscription charge is easy to spot; duplicated effort and quotes left unanswered need a closer look at the process."
          },
          {
              "title": "Choose changes your team can use",
              "icon": Compass,
              "desc": "Get a recommendation tied to a specific business need. We compare improving the current process with configuring existing software or building something new. AI is considered where it fits. A basic checklist can be the better answer when judgement and ownership are the missing pieces."
          },
          {
              "title": "Put the work in a sensible order",
              "icon": Workflow,
              "desc": "Avoid launching changes that depend on unfinished groundwork. We identify access requirements and staff time, then sequence the work around daily operations. Each recommendation has an owner and a way to judge whether it helped, so the plan can survive a busy week."
          },
          {
              "title": "Keep decisions moving after the meeting",
              "icon": LineChart,
              "desc": "Get regular reviews of what changed and what is still stuck. We challenge assumptions against the agreed baseline and adjust the next action. If implementation is included, its scope is written down; an advisory meeting alone does not mean software or staff training has been delivered."
          }
      ],
      "buildIncludes": {
          "intro": "You receive a practical decision record and delivery plan. The engagement defines which areas we inspect and how often we meet.",
          "items": [
              {
                  "title": "An operating baseline",
                  "description": "A record of current costs and the work being reviewed, with estimates clearly distinguished from verified amounts."
              },
              {
                  "title": "A prioritised action plan",
                  "description": "Recommended changes with expected benefits and an accountable owner. Dependencies are documented. Unproven ideas stay marked as assumptions."
              },
              {
                  "title": "A tool and implementation brief",
                  "description": "Requirements you can use to compare options, including recurring costs and the time your team must contribute."
              },
              {
                  "title": "A review cadence",
                  "description": "Scheduled check-ins and a short progress record. Implementation work and specialist accounting or legal advice are scoped separately."
              }
          ]
      },
      "statistics": [
          {
              "title": "Interest is already there",
              "value": "46% + 15%",
              "explanation": "In the Federal Reserve's 2025 employer-firm survey, 46% used AI and another 15% planned to start within a year.",
              "source": "Federal Reserve, 2026 Report on Employer Firms (2025 survey)",
              "url": "https://www.fedsmallbusiness.org/reports/survey/2026/2026-report-on-employer-firms"
          },
          {
              "title": "Choosing the right tool is a barrier",
              "value": "54%",
              "explanation": "Among planned AI adopters, 54% cited finding tools that meet business needs as a challenge.",
              "source": "Federal Reserve, 2026 Report on Employer Firms (2025 survey)",
              "url": "https://www.fedsmallbusiness.org/reports/survey/2026/2026-report-on-employer-firms"
          },
          {
              "title": "Making time is another barrier",
              "value": "37%",
              "explanation": "Among those planned adopters, 37% cited implementation or employee-training time. Our interpretation: selection and delivery deserve as much attention as willingness to adopt.",
              "source": "Federal Reserve, 2026 Report on Employer Firms (2025 survey)",
              "url": "https://www.fedsmallbusiness.org/reports/survey/2026/2026-report-on-employer-firms"
          }
      ],
      "process": [
          {
              "title": "Review: see the work",
              "description": "We speak with the owner and staff doing the work, then inspect agreed records. We separate a recurring problem from an isolated bad week."
          },
          {
              "title": "Decide: rank the fixes",
              "description": "You review the evidence and choose the first priority. We record the tradeoffs and the work that should wait until prerequisites are finished."
          },
          {
              "title": "Implement: assign responsibility",
              "description": "Each action gets an owner and an agreed checkpoint. We support delivery within scope and raise blockers before they become another abandoned project."
          },
          {
              "title": "Measure: decide what comes next",
              "description": "We compare results with the baseline, including staff effort and ongoing fees. You decide whether to continue, change course or stop an initiative."
          }
      ],
      "fit": {
          "yes": [
              "You are growing but remain the approval point for routine work.",
              "You can share operating records and give staff time to change a process."
          ],
          "no": [
              "You want a presentation with no decisions or follow-through.",
              "You have already chosen a tool and only want someone to endorse it."
          ]
      },
      "questions": [
          {
              "question": "Is this only about AI?",
              "answer": "No. We look at the business problem first. The answer might involve payments, a CRM, clearer responsibilities or removing an unnecessary step from an existing process."
          },
          {
              "question": "Will you implement the recommendations?",
              "answer": "We can scope delivery separately or alongside the review. You will know which changes KCG owns and which require your team or another provider."
          },
          {
              "question": "What if we already tried consulting?",
              "answer": "Bring the old recommendations and what happened afterward. We look for missing ownership, unrealistic dependencies or a mismatch with daily work before proposing another plan."
          },
          {
              "question": "How much of my time will this take?",
              "answer": "We agree meeting time and access needs before starting. Someone inside the business must approve decisions and make staff available; we cannot discover every constraint from a spreadsheet."
          },
          {
              "question": "How do we know it paid off?",
              "answer": "We agree what to measure before the change. Reduced repeat work, lower verified costs or faster quote handling can be useful measures. Advice is not a guaranteed profit increase."
          }
      ],
      "close": {
          "title": "Bring the problem that keeps returning.",
          "description": "Tell Seth or Hunter what you have tried and where work still lands on your desk. We will discuss a bounded review and the evidence needed to choose your first fix.",
          "button": "Discuss an operations review"
      },
      "features": [
          "Operating cost review",
          "Workflow diagnosis",
          "Tool selection",
          "Prioritised implementation plan",
          "Named action owners",
          "Regular accountability reviews"
      ]
  },
  {
      "id": "prep-to-sell",
      "title": "Prep To Sell",
      "icon": Target,
      "image": "/images/services/prep-to-sell.jpg",
      "imageAlt": "Abstract upward growth forms on a dark background",
      "tagline": "Build a business someone else can take over.",
      "heroDesc": "A buyer needs to understand what they are buying and what keeps working after you leave. We help reduce owner dependence, document operations and organise the evidence behind revenue. For owners three to ten years from exit, preparation leaves time to test that independence.",
      "problem": [
          "If every important customer calls your mobile and every exception waits for your decision, the business still depends heavily on you. We turn the question of how those relationships transfer into an operating plan before a sale depends on it."
      ],
      "sections": [
          {
              "title": "Give the team responsibility they can carry",
              "icon": Users,
              "desc": "Make routine decisions possible without asking the owner. We identify where work waits for your approval and define who can act, within what limits. A planned absence then tests the arrangement. The point is to find gaps early, while you can still coach the person taking over."
          },
          {
              "title": "Make the financial story easier to verify",
              "icon": LineChart,
              "desc": "Help advisers and prospective buyers follow the numbers back to their records. We organise the operating information and flag unexplained items for your accountant. Separating personal and business costs needs proper accounting treatment; we do not reclassify expenses to manufacture a more attractive earnings figure."
          },
          {
              "title": "Document work people actually perform",
              "icon": FileText,
              "desc": "Keep essential knowledge available when someone changes roles. We capture important processes with the staff doing them, including exceptions and decision limits. Someone else then follows the instructions and reports what is missing. A folder of untested procedures does not prove the business can function independently."
          },
          {
              "title": "Keep customer history with the business",
              "icon": Database,
              "desc": "Make outstanding quotes and relationship history visible beyond the owner's phone. We improve CRM records and handoffs so staff can see commitments and next actions. A buyer can inspect the operating history, subject to appropriate access, instead of relying entirely on your recollection of each customer."
          },
          {
              "title": "Show how revenue continues",
              "icon": TrendingUp,
              "desc": "Organise evidence of repeat purchasing and genuine recurring agreements. We examine where revenue depends on a single relationship or on work only you can sell. Contract terms and transfer restrictions need adviser review. Repeat customers are valuable, but they should not be presented as contracted recurring revenue."
          }
      ],
      "buildIncludes": {
          "intro": "We scope operational preparation around your timeline. Transaction advice and formal valuation require the appropriate specialists.",
          "items": [
              {
                  "title": "An owner-dependence review",
                  "description": "A map of responsibilities and relationships that still rely on you, prioritised by the disruption your absence would cause."
              },
              {
                  "title": "A preparation roadmap",
                  "description": "Actions with owners and review dates, coordinated with your accountant and transaction advisers where they are involved."
              },
              {
                  "title": "An operating evidence set",
                  "description": "Agreed process documents, CRM improvements and supporting records. Access stays controlled as commercially sensitive material is organised."
              },
              {
                  "title": "Practical readiness checks",
                  "description": "Tests of delegation and handoffs, with gaps recorded for correction. The output is operating evidence, not a guaranteed valuation."
              }
          ]
      },
      "statistics": [
          {
              "title": "Many owners are planning a transition",
              "value": "73%",
              "explanation": "The Exit Planning Institute's 2023 State of Owner Readiness findings said 73% wanted to exit within the following ten years. This is a dated survey horizon, not a fresh ten-year forecast from today.",
              "source": "Exit Planning Institute, 2023 State of Owner Readiness findings (published 2024)",
              "url": "https://blog.exit-planning-institute.org/a-decade-of-development"
          },
          {
              "title": "The estimated scale of those transitions",
              "value": "$14 trillion",
              "explanation": "The Exit Planning Institute estimated the private-business transition opportunity at $14 trillion in its 2023 findings. This is a market estimate, not completed sale proceeds or evidence of what your business is worth.",
              "source": "Exit Planning Institute, 2023 State of Owner Readiness findings (published 2024)",
              "url": "https://blog.exit-planning-institute.org/a-decade-of-development"
          }
      ],
      "process": [
          {
              "title": "Assess: start with your intended exit",
              "description": "We discuss timing and your current role, then identify what would fail if you stepped away. Your advisers help define personal and transaction requirements."
          },
          {
              "title": "Prepare: fix the major dependencies",
              "description": "We prioritise operational changes and records that need attention. Responsibilities are assigned before new documentation or software becomes another task on your desk."
          },
          {
              "title": "Test: let the team run the work",
              "description": "Staff use the processes and customer records during agreed periods without your routine intervention. Exceptions show where decision rights or information are still missing."
          },
          {
              "title": "Maintain: keep the evidence current",
              "description": "We review progress and unresolved dependencies against your timeline. Updated records support later adviser and buyer review, with access agreed before sensitive information is shared."
          }
      ],
      "fit": {
          "yes": [
              "You are several years from exit and can delegate real responsibility now.",
              "You want records and systems that support continuity beyond the owner."
          ],
          "no": [
              "You need an immediate buyer or a guaranteed sale multiple.",
              "You want cosmetic financial changes while keeping every decision under your control."
          ]
      },
      "questions": [
          {
              "question": "How far ahead should I start?",
              "answer": "Enough time to change operations and show that the changes last. This service is aimed at owners three to ten years out, but we can discuss a shorter preparation window without promising the same scope."
          },
          {
              "question": "Will this increase my sale price?",
              "answer": "Better records and lower dependence can address concerns buyers raise. Earnings and risk still matter, as does the market. We cannot promise a multiple or a buyer's response."
          },
          {
              "question": "Are you the business broker?",
              "answer": "This engagement covers operational preparation. Listing the business, negotiating a transaction and providing formal legal, tax or valuation advice require separately appointed professionals."
          },
          {
              "question": "Do we need recurring revenue?",
              "answer": "It can improve visibility where it fits the business. We examine the revenue you actually earn and any credible opportunities for repeat work. We do not relabel ordinary repeat sales as subscriptions."
          },
          {
              "question": "What if I decide not to sell?",
              "answer": "Clear responsibilities and usable customer records still help you step back from daily firefighting. The preparation should leave a better-run operation even if your exit timeline changes."
          },
          {
              "question": "How do we protect sensitive information?",
              "answer": "We agree who can access the working records and what is needed for each stage. Preparing information does not authorise sharing it with prospective buyers or external parties."
          }
      ],
      "close": {
          "title": "Find out what still depends on you.",
          "description": "Tell Seth or Hunter your likely exit window and what happens when you take time away. We will discuss the first operational dependencies to address before a buyer reviews the business.",
          "button": "Discuss my exit preparation"
      },
      "features": [
          "Owner-dependence review",
          "Delegation and process testing",
          "Financial-record coordination",
          "CRM history and handoffs",
          "Revenue continuity review",
          "Exit preparation roadmap"
      ]
  },
  {
      "id": "seo",
      "title": "SEO Services",
      "icon": Search,
      "image": "/images/services/seo.jpg",
      "imageAlt": "Smartphone with soft search results glow",
      "tagline": "Help the right customers find you without buying every visit.",
      "heroDesc": "A website cannot generate enquiries from people who never find it. We improve the technical foundations and service pages that help search engines understand your business. Then we track relevant searches and enquiries so you can see what moved. SEO takes time, and its value needs to show up beyond a rankings report.",
      "problem": [
          "This is for businesses with a working website that stays quiet, local operators competing for nearby customers, and advertisers who want another route to demand. Paid traffic stops when the budget stops. Useful search visibility can keep working, although content, competitors and search results still need attention."
      ],
      "sections": [
          {
              "title": "Remove technical obstacles to discovery",
              "icon": Code,
              "desc": "Give important pages a fair chance to be found and used. We inspect indexing and internal links alongside redirects and mobile performance, then prioritise faults that affect your service pages. A fast page helps visitors, but a speed score by itself does not earn a ranking."
          },
          {
              "title": "Make each page answer a real search",
              "icon": Search,
              "desc": "Match your pages to the services people actually request. We organise titles and headings around customer intent, clarify the offer, and remove competing or thin pages where appropriate. Someone searching for an emergency repair needs a different answer from someone comparing long-term maintenance options."
          },
          {
              "title": "Build content from customer questions",
              "icon": PenTool,
              "desc": "Publish explanations that help people decide whether to contact you. We use search data and questions your team hears to choose topics. You review technical accuracy and service details. The aim is useful coverage of your work, rather than a calendar full of interchangeable articles."
          },
          {
              "title": "Connect local discovery with trust",
              "icon": MapPin,
              "desc": "Help nearby searchers recognise the same business across your website and listings. We review service-area information and relevant local signals, including the handoff to your Google Business Profile. Reviews matter to customer choice; consumer review surveys are not experiments proving a specific ranking increase."
          },
          {
              "title": "See whether visibility brings enquiries",
              "icon": BarChart3,
              "desc": "Understand which pages attract relevant visits and where people act. We establish a baseline in the agreed analytics tools, track enquiry paths and explain what changed. Traffic from the wrong location or a search unrelated to your services is not a useful win."
          }
      ],
      "buildIncludes": {
          "intro": "The scope identifies the pages and technical work included, plus any ongoing content or reporting schedule.",
          "items": [
              {
                  "title": "An audit with priorities",
                  "description": "A practical list of technical faults and content issues, ranked by relevance to the services you want to sell."
              },
              {
                  "title": "A search-to-page plan",
                  "description": "Target customer questions mapped to existing or proposed pages, with content briefs and responsibility for approvals."
              },
              {
                  "title": "Agreed page improvements",
                  "description": "Technical fixes and on-page edits within scope. Larger website rebuilds are identified before becoming extra work."
              },
              {
                  "title": "Measurement you can inspect",
                  "description": "Access to reporting and a plain explanation of search visibility, relevant visits and tracked enquiries. Reporting limits are made clear."
              }
          ]
      },
      "statistics": [
          {
              "title": "Reviews influence the local choice",
              "value": "97%",
              "explanation": "BrightLocal's 2026 consumer survey found that 97% read reviews for local businesses. Reputation belongs alongside local search work.",
              "source": "BrightLocal, Local Consumer Review Survey (2026)",
              "url": "https://www.brightlocal.com/research/local-consumer-review-survey/"
          },
          {
              "title": "The shortlist has a rating threshold",
              "value": "68%",
              "explanation": "BrightLocal found 68% would only use businesses rated four stars or higher. This describes consumer preference, not Google's ranking formula.",
              "source": "BrightLocal, Local Consumer Review Survey (2026)",
              "url": "https://www.brightlocal.com/research/local-consumer-review-survey/"
          },
          {
              "title": "A technical target to work toward",
              "value": "2.5 seconds",
              "explanation": "Google Search Central recommends Largest Contentful Paint within 2.5 seconds for a good user experience. Meeting that target does not guarantee search placement.",
              "source": "Google Search Central, Core Web Vitals",
              "url": "https://developers.google.com/search/docs/appearance/core-web-vitals"
          }
      ],
      "process": [
          {
              "title": "Audit: establish the starting point",
              "description": "We inspect your website and available search data, then confirm the services and locations worth targeting. Access gaps are recorded before work is promised."
          },
          {
              "title": "Plan: choose the highest-priority pages",
              "description": "We agree the fixes and content sequence. You approve the service facts, especially locations, availability and claims a prospective customer will rely on."
          },
          {
              "title": "Improve: publish and check",
              "description": "We implement scoped changes and check their crawlability and usability. Search engines decide when to recrawl and how to rank the updated pages."
          },
          {
              "title": "Review: follow the evidence",
              "description": "We review search and enquiry trends over time. Findings guide the next round of improvements instead of treating every position change as a verdict."
          }
      ],
      "fit": {
          "yes": [
              "Your site exists, but relevant customers rarely find it.",
              "You can invest over months and help approve accurate service content."
          ],
          "no": [
              "You need immediate demand and have no other acquisition channel.",
              "You expect a guaranteed first-page position within thirty days."
          ]
      },
      "questions": [
          {
              "question": "How long does SEO take?",
              "answer": "Expect progress over months, with timing affected by your starting point and competition. Anyone guaranteeing page one in thirty days is promising a result they do not control."
          },
          {
              "question": "Should I stop paying for ads?",
              "answer": "That depends on your existing results and demand needs. SEO can develop alongside paid traffic; we would not assume it can replace a channel that currently brings profitable work."
          },
          {
              "question": "Do I need a new website?",
              "answer": "Not necessarily. We inspect the existing platform first. If it prevents essential fixes or makes updates impractical, we explain the limitation and quote the options."
          },
          {
              "question": "Can you guarantee the map pack?",
              "answer": "No. Location and competition affect what each searcher sees. We can improve eligible business information and relevant pages, then measure visibility without promising a fixed position."
          },
          {
              "question": "What will the report show?",
              "answer": "The agreed searches and pages, relevant traffic trends and tracked enquiries. We explain missing attribution and separate observed changes from assumptions about what caused them."
          }
      ],
      "close": {
          "title": "Find out why your site is hard to find.",
          "description": "Send your website and the services you want more enquiries for. Seth or Hunter will discuss the search gaps and what should be fixed first.",
          "button": "Review my search visibility"
      },
      "features": [
          "Technical SEO audit",
          "Service-page structure",
          "Customer-question content",
          "Local search foundations",
          "Performance improvements",
          "Enquiry-focused reporting"
      ]
  },
  {
      "id": "google-business",
      "title": "Google My Business Profile",
      "icon": MapPin,
      "image": "/images/services/google-business.jpg",
      "imageAlt": "Smartphone with soft map glow in a dark environment",
      "tagline": "Give nearby customers a reason to choose you.",
      "heroDesc": "When someone needs a business nearby, your profile may be the first thing they inspect. We help you claim and complete Google Business Profile, keep the information accurate, and build a practical review routine. Customers should be able to see what you do, when you are available and how to take the next step.",
      "problem": [
          "Trades, clinics, salons, restaurants, dealerships and professional services all need a credible local presence. A profile is free to create, which makes getting the basics right a useful place to start. The ongoing job is keeping it current when the owner is busy serving the very customers who could leave a review."
      ],
      "sections": [
          {
              "title": "Make the first impression accurate",
              "icon": Settings,
              "desc": "Help customers reach the right business with the right expectations. We review account access and appropriate categories. Services, opening hours and contact details are checked for accuracy. Service areas reflect where you actually work. Eligibility and verification are checked before setup; Google controls its approval process."
          },
          {
              "title": "Show customers what they will find",
              "icon": Store,
              "desc": "Make your profile useful with current photographs and clear descriptions. We organise images of your actual premises, work or team, using material you have permission to publish. Posts communicate relevant updates and offers. Posting frequently is not a promise of better rankings."
          },
          {
              "title": "Make review requests part of the work",
              "icon": Star,
              "desc": "Give customers an easy route to leave honest feedback after a completed visit or job. We agree when to ask and who owns the request. The flow should reach customers consistently, without buying reviews or directing only satisfied people to the public review page."
          },
          {
              "title": "Reply like someone is listening",
              "icon": MessageSquare,
              "desc": "Show the next reader how you handle feedback. We establish a response routine and escalation path for complaints, with replies specific to the experience. Private customer details stay out of public responses. A draft can save time, but someone still needs to check what happened."
          },
          {
              "title": "Carry interest through to an enquiry",
              "icon": Globe,
              "desc": "Connect profile links to a useful service, booking or contact page. We check that the destination works on a phone and matches the offer. If your website leaves visitors unsure what to do, we can scope Website Design work alongside the profile improvements."
          }
      ],
      "buildIncludes": {
          "intro": "Setup and ongoing care are separate responsibilities. Your scope states who updates the profile after the initial work.",
          "items": [
              {
                  "title": "An access and accuracy review",
                  "description": "Ownership checks and a record of missing or conflicting business information. You retain control of the business account."
              },
              {
                  "title": "A completed profile within scope",
                  "description": "Relevant categories and services, current hours and approved photos, with verification dependencies identified."
              },
              {
                  "title": "A review and response routine",
                  "description": "Request wording, a review link and an agreed owner for replies. Sensitive or disputed feedback goes to you."
              },
              {
                  "title": "A maintenance handover",
                  "description": "Instructions for changing hours and publishing updates, plus agreed reporting. Continued management is quoted separately."
              }
          ]
      },
      "statistics": [
          {
              "title": "A small review count can exclude you",
              "value": "47%",
              "explanation": "BrightLocal found 47% would not use a business with fewer than twenty reviews. Its 2026 survey also found 97% read local-business reviews.",
              "source": "BrightLocal, Local Consumer Review Survey (2026)",
              "url": "https://www.brightlocal.com/research/local-consumer-review-survey/"
          },
          {
              "title": "Expectations are getting tougher",
              "value": "68%",
              "explanation": "BrightLocal found 68% required at least four stars, up from 55% the previous year. These are stated consumer preferences, not guaranteed booking rates.",
              "source": "BrightLocal, Local Consumer Review Survey (2026)",
              "url": "https://www.brightlocal.com/research/local-consumer-review-survey/"
          },
          {
              "title": "Replies are part of the service",
              "value": "89%",
              "explanation": "BrightLocal found 89% expected a response to their review; 81% expected it within a week. A review routine needs time for replies.",
              "source": "BrightLocal, Local Consumer Review Survey (2026)",
              "url": "https://www.brightlocal.com/research/local-consumer-review-survey/"
          },
          {
              "title": "Your website still has a job",
              "value": "54%",
              "explanation": "BrightLocal found 54% visited a business website after positive reviews. The profile and website need to make the same next step clear.",
              "source": "BrightLocal, Local Consumer Review Survey (2026)",
              "url": "https://www.brightlocal.com/research/local-consumer-review-survey/"
          }
      ],
      "process": [
          {
              "title": "Review: inspect the local presence",
              "description": "We check profile access and compare the public information with how you operate. You confirm locations, hours and the services customers should see."
          },
          {
              "title": "Complete: correct the essentials",
              "description": "We prepare the agreed edits and help with the verification steps Google requests. Ownership disputes or suspensions may require a separate resolution process."
          },
          {
              "title": "Activate: start the review routine",
              "description": "Your team tests the request link and approves response responsibilities. We check the website or booking handoff before relying on it for enquiries."
          },
          {
              "title": "Maintain: keep information useful",
              "description": "We agree who handles changed hours, new photos and review replies. Reporting follows the measures available rather than inventing a direct link from every view to a sale."
          }
      ],
      "fit": {
          "yes": [
              "You serve customers at an eligible location or within a local service area.",
              "You can provide accurate information and assign someone to handle feedback."
          ],
          "no": [
              "You want invented reviews, a fake location or a guaranteed map position.",
              "You expect a one-time setup to keep hours and customer feedback current forever."
          ]
      },
      "questions": [
          {
              "question": "Is Google My Business the same thing?",
              "answer": "Yes. Google Business Profile is the current name for the listing customers use in Search and Maps."
          },
          {
              "question": "Can you recover a profile someone else controls?",
              "answer": "We can review the ownership situation and help with Google's access process. Recovery depends on the account history and evidence; we cannot promise an approval date."
          },
          {
              "question": "Can you remove a negative review?",
              "answer": "We can flag content that appears to violate platform policy. A negative opinion alone is not grounds for removal. We help you respond clearly and take the underlying issue offline."
          },
          {
              "question": "Do we need a website as well?",
              "answer": "A profile can generate contact on its own. A useful website gives people space to inspect services and request a quote when the profile does not answer enough."
          },
          {
              "question": "What are we paying for if the profile is free?",
              "answer": "You pay for the agreed setup and management work. Google does not charge for the profile itself. Photo production, website work or ongoing care need their own scope."
          }
      ],
      "close": {
          "title": "See what nearby customers see first.",
          "description": "Send your profile link and the area you serve. Seth or Hunter will review missing information, the review routine and the path from your listing to an enquiry.",
          "button": "Review my local presence"
      },
      "features": [
          "Profile claiming and setup",
          "Accurate categories and hours",
          "Approved photos and posts",
          "Honest review requests",
          "Specific review responses",
          "Website and booking handoff"
      ]
  },
  {
      "id": "bpo",
      "title": "BPO Services",
      "icon": Headphones,
      "image": "/images/services/bpo.jpg",
      "imageAlt": "Professional headset on a dark desk",
      "tagline": "Keep the enquiry moving while you do the work.",
      "heroDesc": "You already paid to make the phone ring. When nobody can answer or follow up, that opportunity may disappear before you finish the job in front of you. We arrange business process outsourcing for inbound lead handling, appointment setting and quote follow-up, with clear rules for what the person answering can promise.",
      "problem": [
          "This is for owners who are on the tools, reception teams stretched at busy times, and businesses whose enquiries sit untouched. Trades, clinics, salons and dealers need coverage that fits their actual opening hours and workload. The purpose is to make existing demand easier to handle, not to manufacture a calendar full of buyers."
      ],
      "sections": [
          {
              "title": "Answer with enough context to help",
              "icon": Phone,
              "desc": "Give callers a useful response when your own staff are occupied. We define the questions reception can answer and the details to collect. Coverage hours and escalation contacts are agreed first, so an urgent request does not sit in the same queue as a routine enquiry."
          },
          {
              "title": "Send the right enquiries to your team",
              "icon": Target,
              "desc": "Spend less time reconstructing why someone called. We use approved qualification questions about the request, location and timing, then record the answers in the agreed system. A qualified lead meets your routing criteria; it is not a guarantee that the customer will buy."
          },
          {
              "title": "Book appointments your staff can deliver",
              "icon": LayoutDashboard,
              "desc": "Reduce the back-and-forth around availability. We define appointment types and booking rules, including travel or preparation time where relevant. Your team receives the customer's context before the visit. Requests outside those rules go to a named person instead of being forced into the calendar."
          },
          {
              "title": "Give outstanding quotes a next step",
              "icon": MessageSquare,
              "desc": "Find out whether a customer needs clarification, wants to proceed or has chosen someone else. Follow-up uses your approved wording and respects a request to stop. Responses update the pipeline, so staff can act on real interest instead of repeatedly calling the same unresolved list."
          },
          {
              "title": "Know what happened to each enquiry",
              "icon": BarChart3,
              "desc": "See handling activity and outcomes in a report you can inspect. We track agreed measures such as response time and attended appointments, with missed handoffs made visible. Reviewing the records helps distinguish a coverage problem from weak demand or a service your business cannot provide."
          }
      ],
      "buildIncludes": {
          "intro": "The scope sets coverage, volume assumptions and the handoff. Staff availability and service commitments must be confirmed before launch.",
          "items": [
              {
                  "title": "A handling playbook",
                  "description": "Approved answers and qualification questions, plus requests that must go directly to your team."
              },
              {
                  "title": "A booking and handoff setup",
                  "description": "Agreed calendar access, CRM fields and notification paths, tested with sample enquiries before real work begins."
              },
              {
                  "title": "A quote follow-up routine",
                  "description": "A defined list, contact schedule and stop conditions. Your staff handle negotiation or technical advice outside the script."
              },
              {
                  "title": "A review and coverage agreement",
                  "description": "Reporting responsibilities and a named escalation contact. Charges for extra volume or extended hours are made explicit."
              }
          ]
      },
      "statistics": [
          {
              "title": "A reason to make response time visible",
              "value": "21x",
              "explanation": "MIT/InsideSales research reported 21 times higher qualification odds when web leads were called within five minutes rather than thirty. This older finding does not establish an answer rate for inbound calls or guarantee appointments.",
              "source": "MIT/InsideSales, Lead Response Management study (2007); InsideSales recap (2015)",
              "url": "https://resources.insidesales.com/blog/infographic-2/"
          },
          {
              "title": "Coverage still has to make financial sense",
              "value": "56%",
              "explanation": "The Federal Reserve reported 60% of firms sought financing; among financing seekers, 56% cited operating expenses. This gives cost-pressure context, not evidence that outsourcing is always cheaper.",
              "source": "Federal Reserve, 2026 Report on Employer Firms (2025 survey)",
              "url": "https://www.fedsmallbusiness.org/reports/survey/2026/2026-report-on-employer-firms"
          }
      ],
      "process": [
          {
              "title": "Map: follow the inbound path",
              "description": "We review how enquiries arrive and where they wait. You choose the coverage gap to address and define which calls need your immediate attention."
          },
          {
              "title": "Prepare: approve the handling rules",
              "description": "We write the playbook and confirm access. Sample calls test booking limits and escalation before anyone makes promises on behalf of your business."
          },
          {
              "title": "Launch: inspect early handoffs",
              "description": "We start within the agreed coverage and review records with your team. Incorrect bookings or missing information lead to changes in the handling process."
          },
          {
              "title": "Review: compare cost and usefulness",
              "description": "We examine response and appointment outcomes alongside the service bill. Volume changes may call for different coverage or for improving the underlying sales process."
          }
      ],
      "fit": {
          "yes": [
              "You receive enquiries but cannot consistently answer or follow up.",
              "You can supply approved answers and a reliable staff escalation contact."
          ],
          "no": [
              "You need clinical, technical or pricing decisions made without qualified staff.",
              "You expect guaranteed sales from every booked appointment."
          ]
      },
      "questions": [
          {
              "question": "Is this a cold-calling campaign?",
              "answer": "This service focuses on inbound enquiries, reception and follow-up on existing interest. New outbound prospecting needs a separate scope and should not be confused with answering demand you already have."
          },
          {
              "question": "Can you cover evenings and weekends?",
              "answer": "We discuss the hours and likely volume first, then confirm what coverage is available and what it costs. Do not assume continuous coverage from the service name."
          },
          {
              "question": "Will callers get accurate answers?",
              "answer": "The team works from your approved information and sends unfamiliar questions to you. Someone inside your business must keep that information current when services or availability change."
          },
          {
              "question": "Is outsourcing cheaper than hiring?",
              "answer": "Sometimes, but it depends on volume and coverage. We compare the actual service cost with your staffing options, including the time needed to supervise either arrangement."
          },
          {
              "question": "How do we judge whether it works?",
              "answer": "Track meaningful contacts and attended appointments against the starting point. Arithmetic: unanswered paid enquiries still carry their acquisition cost. Recovered enquiries only add value when the follow-through is useful."
          }
      ],
      "close": {
          "title": "Show us where enquiries stop moving.",
          "description": "Bring a sample of missed calls or outstanding quotes and your busiest hours. Seth or Hunter will discuss the coverage and handoff needed to keep them moving.",
          "button": "Discuss my lead coverage"
      },
      "features": [
          "Inbound enquiry handling",
          "Reception coverage",
          "Approved qualification questions",
          "Appointment setting",
          "Outstanding quote follow-up",
          "Visible CRM handoffs"
      ]
  },
  {
      "id": "consumer-financing",
      "title": "Consumer Financing",
      "icon": Banknote,
      "image": "/images/services/consumer-financing.jpg",
      "imageAlt": "Matte black credit card on a dark surface",
      "tagline": "Give customers a clear way to spread a larger purchase.",
      "heroDesc": "A customer can want the work and still be unable to pay the whole invoice today. We help you evaluate pay-over-time options and fit an application flow into quoting or checkout. Customers see the available terms, and your staff understand what approval and funding actually mean before promising a start date.",
      "problem": [
          "This is for businesses selling larger jobs or purchases: HVAC, roofing, remodels, dental, auto repair, equipment and higher-ticket retail. Payment timing can be the obstacle even after a customer understands the value. Financing offers another route to purchase, provided the customer qualifies and the cost works for both sides."
      ],
      "sections": [
          {
              "title": "Discuss payment options before the sale stalls",
              "icon": CreditCard,
              "desc": "Let customers consider an eligible plan while reviewing the quote. We help place the application step where staff can explain it without pressuring the customer. The full purchase price stays clear alongside any monthly illustration and lender-provided terms. A smaller payment does not mean a cheaper purchase."
          },
          {
              "title": "Match the program to what you sell",
              "icon": Store,
              "desc": "Avoid offering a product that does not support your industry or typical job size. We compare available programs against those requirements and review merchant charges. Approval criteria and customer pricing belong to the provider; we do not promise that every applicant will qualify."
          },
          {
              "title": "Know when you can expect payment",
              "icon": Banknote,
              "desc": "Plan fulfilment around the actual funding conditions. We review when the provider releases funds and whether completion evidence or other steps are required. Staff should distinguish an application, an approval and a funded transaction. The applicable agreement determines settlement timing and merchant responsibilities."
          },
          {
              "title": "Fit the process into your payment setup",
              "icon": Workflow,
              "desc": "Keep applications and invoices from becoming disconnected. We scope the supported checkout, payment link or in-person flow, then define who checks status. Where a direct connection is unavailable, the written handoff tells staff what to verify before recording the sale as paid."
          }
      ],
      "buildIncludes": {
          "intro": "The project is a program review and implementation of the agreed flow. Lender approval and merchant onboarding are separate requirements.",
          "items": [
              {
                  "title": "A program comparison",
                  "description": "Available options assessed against your industry and sale size, with fees, settlement conditions and dependencies identified."
              },
              {
                  "title": "An application path",
                  "description": "A tested route from the quote or checkout to the provider's application, using its approved disclosures and materials."
              },
              {
                  "title": "A staff operating guide",
                  "description": "How to introduce the option, check status and handle a declined application without promising approval elsewhere."
              },
              {
                  "title": "A funding and refund handoff",
                  "description": "Who confirms settlement and who contacts the provider when a job changes or is cancelled. Ongoing provider costs stay visible."
              }
          ]
      },
      "statistics": [
          {
              "title": "Reviews inform purchase decisions",
              "value": "93%",
              "explanation": "BrightLocal's 2026 survey found 93% had bought after reading reviews. This supports showing credible business information alongside payment options; it does not measure financing results.",
              "source": "BrightLocal, Local Consumer Review Survey (2026)",
              "url": "https://www.brightlocal.com/research/local-consumer-review-survey/"
          },
          {
              "title": "Some reviewed purchases are substantial",
              "value": "27%",
              "explanation": "BrightLocal found 27% had spent more than $1,000 after reading reviews. That is purchase context, not evidence of financing-driven sales growth.",
              "source": "BrightLocal, Local Consumer Review Survey (2026)",
              "url": "https://www.brightlocal.com/research/local-consumer-review-survey/"
          }
      ],
      "process": [
          {
              "title": "Review: understand your sales",
              "description": "We discuss typical invoices and when payment objections arise. You provide the payment setup and the timing needed to order materials or begin work."
          },
          {
              "title": "Compare: inspect the terms",
              "description": "We review program eligibility and merchant costs. You decide whether the available options suit your margins before committing to onboarding or integration work."
          },
          {
              "title": "Implement: test the customer path",
              "description": "We configure the agreed application handoff and train staff to use approved explanations. The checks cover declines and incomplete applications as well as the expected flow."
          },
          {
              "title": "Handover: measure actual use",
              "description": "We agree how to review applications, funded sales and fees. Your own data can show whether the program helps; we do not substitute a vendor's sales-lift claim."
          }
      ],
      "fit": {
          "yes": [
              "Customers want larger purchases but sometimes need to spread payment.",
              "You have enough margin to evaluate provider fees and clear fulfilment rules."
          ],
          "no": [
              "You want guaranteed approvals or a guaranteed increase in order value.",
              "You need payment before the provider allows funding and cannot carry that gap."
          ]
      },
      "questions": [
          {
              "question": "Will this increase our close rate?",
              "answer": "It may help customers whose obstacle is payment timing, but we cannot promise a percentage. We measure completed, funded sales and the costs against your own starting point."
          },
          {
              "question": "Do we receive the full price upfront?",
              "answer": "The provider's agreement controls timing and deductions. Merchant fees, completion requirements or reserves may apply. We review those details before you plan cash flow around a financed sale."
          },
          {
              "question": "Is there any risk left with us?",
              "answer": "Yes, there can be obligations for refunds, disputes, fraud or contract breaches. Lender underwriting does not remove your responsibility to deliver the agreed goods or work."
          },
          {
              "question": "What happens if a customer is declined?",
              "answer": "Staff should explain that the provider made the decision and offer any other payment methods you accept. A different plan may have different criteria, but another approval is never assumed."
          },
          {
              "question": "Can we advertise a monthly payment?",
              "answer": "Use the provider's approved illustrations and required terms. The amount depends on the actual price, repayment period and financing cost. We avoid unsupported examples that make borrowing look free."
          },
          {
              "question": "Why offer this instead of discounting?",
              "answer": "Arithmetic: a sale that cannot proceed under payment-in-full terms contributes no sale revenue today. A funded plan may allow it to proceed, less fees and fulfilment costs. That comparison is not a study finding or a prediction that every declined quote becomes a sale."
          }
      ],
      "close": {
          "title": "Check whether financing fits your larger jobs.",
          "description": "Bring a typical invoice, your margins and when you need payment. Seth or Hunter will discuss available program requirements and the cost of adding pay-over-time.",
          "button": "Discuss customer payment options"
      },
      "features": [
          "Program suitability review",
          "Point-of-sale application flow",
          "Clear merchant cost review",
          "Staff training",
          "Funding status handoff",
          "Refund process planning"
      ]
  },
  {
      "id": "business-loans",
      "title": "Business Loans",
      "icon": DollarSign,
      "image": "/images/services/business-loans.jpg",
      "imageAlt": "Currency and calculator on a dark wooden desk",
      "tagline": "Match the funding to the work it needs to do.",
      "heroDesc": "Steady demand does not always arrive with the cash needed to fulfil it. We help you assess working capital or funding for equipment and expansion, match the request to suitable products, and organise the paperwork. The right money should support the business through repayment. Clearing an immediate cash shortage is only the start.",
      "problem": [
          "This is for businesses held back by cash timing, a necessary equipment purchase or growth that needs funding before it produces revenue. If an earlier application returned only part of what you needed, we review the gap and the repayment capacity. A larger loan is useful only if the business can carry it."
      ],
      "sections": [
          {
              "title": "Bridge a defined operating gap",
              "icon": Banknote,
              "desc": "Keep an identified cash shortfall from interrupting work you can deliver profitably. We review when customer payments arrive against upcoming expenses and discuss working-capital options. Borrowing to cover a timing gap is different from borrowing to support continuing losses; the second problem needs a wider operating review."
          },
          {
              "title": "Buy equipment without guessing at affordability",
              "icon": Settings,
              "desc": "Assess the cost of adding or replacing equipment alongside its expected use. We help organise the purchase details and compare available funding structures. The repayment period should make sense for the asset and business, with deposits and any security requirements understood before you commit."
          },
          {
              "title": "Fund growth on a realistic schedule",
              "icon": TrendingUp,
              "desc": "Make an expansion plan account for the wait before new revenue arrives. We review the amount needed and discuss suitable term or other available products. Forecasts include the slower case, because a new location or service can take longer to contribute than the sales plan assumes."
          },
          {
              "title": "Compare offers beyond the headline payment",
              "icon": FileText,
              "desc": "Know what an offer asks of the business. We organise the information needed to compare proceeds received, total repayment and payment frequency, alongside fees and security terms. A factor rate is not an annual percentage rate. We identify unclear terms for the provider to explain in writing."
          },
          {
              "title": "Present a complete funding request",
              "icon": Compass,
              "desc": "Reduce avoidable back-and-forth by preparing the documents the provider requests. We help explain the use of funds and keep missing items visible. Accurate records improve the application process; they do not override underwriting or turn a previous decline into a promised approval."
          }
      ],
      "buildIncludes": {
          "intro": "The engagement defines application support and available provider options. You review any fees and authorise submissions before they are made.",
          "items": [
              {
                  "title": "A funding-needs review",
                  "description": "The purpose, requested amount and timing, checked against current cash flow and existing repayment commitments."
              },
              {
                  "title": "A product comparison",
                  "description": "Options suited to the request, with total costs and repayment structure reviewed rather than relying on a headline rate."
              },
              {
                  "title": "A document checklist",
                  "description": "Required records and a clear list of missing information. Your accountant supplies or confirms financial statements where needed."
              },
              {
                  "title": "An offer and funding handoff",
                  "description": "Support reviewing provider questions and funding conditions. The lender makes the credit decision and controls disbursement."
              }
          ]
      },
      "statistics": [
          {
              "title": "Many applicants receive less than requested",
              "value": "42% / 36% / 22%",
              "explanation": "Among financing applicants, 42% received the full amount, 36% some or most, and 22% none. These are employer-firm outcomes, not approval odds for your application.",
              "source": "Federal Reserve, 2026 Report on Employer Firms (2025 survey)",
              "url": "https://www.fedsmallbusiness.org/reports/survey/2026/2026-report-on-employer-firms"
          },
          {
              "title": "Funding often supports day-to-day operations",
              "value": "60%",
              "explanation": "60% of firms applied for financing in the prior year. Operating expenses were cited by 56% of financing seekers; expansion or a new opportunity by 46%.",
              "source": "Federal Reserve, 2026 Report on Employer Firms (2025 survey)",
              "url": "https://www.fedsmallbusiness.org/reports/survey/2026/2026-report-on-employer-firms"
          },
          {
              "title": "The provider matters",
              "value": "57%",
              "explanation": "Applicants at small banks were most likely to receive full approval, at 57%. Different applicant groups mean this is not proof a particular bank will approve you.",
              "source": "Federal Reserve, 2026 Report on Employer Firms (2025 survey)",
              "url": "https://www.fedsmallbusiness.org/reports/survey/2026/2026-report-on-employer-firms"
          }
      ],
      "process": [
          {
              "title": "Review: define the funding job",
              "description": "We establish the use of funds and timing, then review repayment capacity. An application needs a reason for the amount beyond borrowing the maximum available."
          },
          {
              "title": "Prepare: organise the evidence",
              "description": "We compile the requested documents and flag gaps. You verify the business information and approve where an application will be submitted."
          },
          {
              "title": "Compare: understand the offer",
              "description": "We review written terms and questions for the provider. You consider total cost and the effect of payments during a slower trading period."
          },
          {
              "title": "Complete: confirm the conditions",
              "description": "We help track outstanding requirements and confirm the provider's next steps. You rely on written funding confirmation before committing money you have not received."
          }
      ],
      "fit": {
          "yes": [
              "You have steady revenue and a clear use for additional capital.",
              "You can document cash flow and assess repayment alongside existing debt."
          ],
          "no": [
              "You want guaranteed funding or a fixed approval time before underwriting.",
              "You need borrowing to hide a recurring loss with no credible repayment plan."
          ]
      },
      "questions": [
          {
              "question": "Can you guarantee an approval?",
              "answer": "No. Providers assess the business and decide what to offer. We help prepare the request and explain options; a complete application can still be declined."
          },
          {
              "question": "How quickly can funds arrive?",
              "answer": "It depends on the product and funding conditions, including any documents still needed. We confirm the provider's timetable for your case rather than advertise a blanket turnaround."
          },
          {
              "question": "Can you help after a bank decline?",
              "answer": "We can review the stated reason and whether a different product fits. More expensive money is not automatically a solution, particularly if repayment capacity caused the decline."
          },
          {
              "question": "Will I need a personal guarantee?",
              "answer": "Some products require one or other security. We identify the requirement in the offer so you can assess the obligation before signing, with professional advice where needed."
          },
          {
              "question": "What will this cost?",
              "answer": "The written offer and engagement terms should show lender charges and any KCG or referral compensation. We review total repayment and actual proceeds; we do not promise a fee-free application."
          }
      ],
      "close": {
          "title": "Bring the funding gap and the numbers behind it.",
          "description": "Tell Seth or Hunter what the capital would pay for and when revenue should follow. We will discuss the records needed to assess suitable funding options.",
          "button": "Discuss my funding needs"
      },
      "features": [
          "Working-capital review",
          "Equipment funding options",
          "Expansion funding support",
          "Application preparation",
          "Repayment and fee comparison",
          "Funding-condition tracking"
      ]
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
      {SERVICES_DETAIL.map((service, idx) => {
        const cta = ctaFor(service.id, service.title);
        return (
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
                  onClick={() => onOpenModal(cta.close, <ContactForm />)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal text-white font-medium rounded-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,128,128,0.4)]"
                >
                  {cta.close} <ArrowRight className="w-4 h-4" />
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
                  className="animate-on-scroll bg-slate-dark/30 border border-white/5 rounded-2xl overflow-hidden hover:bg-slate-dark/50 hover:border-teal/20 transition-all duration-300 group"
                >
                  <div className="aspect-square overflow-hidden border-b border-white/5">
                    <img src={sub.image ?? `/images/services/sub/${slugify(sub.title)}.jpg`} alt={sub.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <sub.icon className="w-5 h-5 text-teal flex-shrink-0" strokeWidth={1.5} />
                      <h3 className="text-lg text-white font-medium">{sub.title}</h3>
                    </div>
                    <p className="text-offwhite/60 font-light leading-relaxed text-sm">{sub.desc}</p>
                  </div>
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
        );
      })}

      {/* Final CTA */}
      <section className="py-24 md:py-32 relative overflow-hidden bg-teal/10 border-t border-teal/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,128,128,0.15)_0%,transparent_70%)]"></div>
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10">
          <div className="animate-on-scroll">
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">Tell Us What You Need Built.</h2>
            <p className="text-offwhite/70 text-lg font-light max-w-2xl mx-auto mb-10 leading-relaxed">
              Payments gets your money back. Websites and AI put it to work. Walk us through what your business actually needs and we will tell you what we would build first.
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

// Deep content is opt-in; the original renderer below remains the fallback.
function DeepServiceContent({ service, onOpenModal }: { service: ServiceDetail; onOpenModal: (title: string, content: React.ReactNode) => void }) {
  const webCta = service.id === 'web-design' ? ctaFor(service.id, service.title) : undefined;
  const heading = 'font-serif text-3xl md:text-4xl text-white leading-tight';
  const prose = 'text-offwhite/80 leading-relaxed';
  return (
    <article data-deep-service={service.id} className="pt-32 md:pt-40 pb-20">
      <style>{`[data-theme="dark"] [data-deep-service] .text-teal { color: #66B2B2; }`}</style>
      <header className="max-w-6xl mx-auto px-6 md:px-12">
        <a href="/services" className="inline-flex items-center min-h-11 text-teal underline underline-offset-4 mb-6">All services</a>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-7xl text-white leading-tight mb-6 break-words">{service.title}</h1>
        <p className="text-teal text-xl md:text-2xl mb-5">{service.tagline}</p>
        <p className={`${prose} text-lg max-w-3xl`}>{service.heroDesc}</p>
        {webCta && <button onClick={() => onOpenModal(webCta.hero, <ContactForm />)} className="inline-flex items-center gap-3 px-6 py-4 mt-7 bg-teal text-white font-medium rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal">{webCta.hero}<ArrowRight aria-hidden="true" className="w-4 h-4" /></button>}
        {service.heroNote && <p className="text-offwhite/70 max-w-3xl mt-4 text-sm leading-relaxed">{service.heroNote}</p>}
        <nav aria-label="On this page" className="flex flex-wrap gap-x-6 gap-y-1 border-y border-white/10 py-3 mt-9 mb-10 text-sm">
          <a href="#what-we-build" className="text-teal min-h-11 inline-flex items-center underline underline-offset-4">What we build</a>
          {service.buildIncludes && <a href="#build-includes" className="text-teal min-h-11 inline-flex items-center underline underline-offset-4">What is included</a>}
          <a href="#the-value" className="text-teal min-h-11 inline-flex items-center underline underline-offset-4">The numbers</a>
          <a href="#the-process" className="text-teal min-h-11 inline-flex items-center underline underline-offset-4">The build process</a>
          <a href="#questions" className="text-teal min-h-11 inline-flex items-center underline underline-offset-4">Common questions</a>
        </nav>
        <img src={service.image} alt={service.imageAlt} width={1200} height={480} className="w-full h-52 md:h-80 object-cover rounded-2xl" />
      </header>

      {service.problem && <section className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-[1fr_1.5fr] gap-8 md:gap-16">
        <h2 className={heading}>{service.id === 'web-design' ? 'The site is there. The enquiries are another matter.' : 'The work keeps landing back on your desk.'}</h2>
        <div className="space-y-5">{service.problem.map(p => <p key={p} className={prose}>{p}</p>)}</div>
      </section>}

      <section id="what-we-build" className="scroll-mt-28 bg-charcoal-dark border-y border-white/10 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h2 className={`${heading} mb-12`}>What we build</h2>
          <div className="space-y-14 md:space-y-20">
            {service.sections.map(sub => <section key={sub.title} className="grid md:grid-cols-[0.8fr_1.5fr] gap-6 md:gap-12 border-t border-white/10 pt-8">
              <div>
                <h3 className="font-serif text-2xl md:text-3xl text-white mb-5">{sub.title}</h3>
                <img src={sub.image ?? `/images/services/sub/${slugify(sub.title)}.jpg`} alt="" loading="lazy" width={480} height={320} className="w-full h-40 md:h-60 object-cover rounded-xl" />
              </div>
              <div className="space-y-5">
                <p className={prose}>{sub.desc}</p>
                <dl className="space-y-5">
                  {[["What it replaces",sub.replaces],["What you get",sub.produces],["Who it is for",sub.audience]].map(([label,text]) => text && <div key={label}>
                    <dt className="text-white font-medium mb-1">{label}</dt><dd className={prose}>{text}</dd>
                  </div>)}
                </dl>
              </div>
            </section>)}
          </div>
          {service.interactiveEvidence && <aside className="border-t border-teal/30 mt-10 pt-8 md:ml-[calc((100%-3rem)*0.8/2.3+3rem)]" aria-label="Interactive 3D evidence">
            <h4 className="text-white text-xl font-medium mb-4">{service.interactiveEvidence.title}</h4>
            <div className="space-y-4">{service.interactiveEvidence.paragraphs.map(p => <p className={prose} key={p}>{p}</p>)}</div>
            <p className="text-sm text-offwhite/70 mt-5">Sources: {service.interactiveEvidence.sources.map((source, i) => <React.Fragment key={source.url}>{i > 0 && '; '}<a className="text-teal underline underline-offset-4" href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></React.Fragment>)}</p>
          </aside>}
        </div>
      </section>

      {service.buildIncludes && <section id="build-includes" className="scroll-mt-28 max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <h2 className={`${heading} mb-5`}>What a KCG build includes</h2>
        <p className={`${prose} max-w-3xl mb-10`}>{service.buildIncludes.intro}</p>
        <dl className="grid md:grid-cols-2 gap-x-14 gap-y-8">{service.buildIncludes.items.map(item => <div key={item.title} className="border-t border-white/10 pt-5"><dt className="text-white text-xl font-medium mb-3">{item.title}</dt><dd className={prose}>{item.description}</dd></div>)}</dl>
      </section>}

      {service.statistics && <section id="the-value" className="scroll-mt-28 max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24">
        <h2 className={`${heading} mb-5`}>{service.id === 'web-design' ? 'Why speed belongs in the budget' : 'Put a number on the time bought back'}</h2>
        <p className={`${prose} max-w-3xl mb-10`}>Published research gives us a reason to measure. Your own results determine what the work is worth.</p>
        <div className="space-y-6">{service.statistics.map(stat => <figure data-stat key={stat.title} className="bg-charcoal-dark border border-white/10 rounded-2xl p-6 md:p-9">
          <div className="grid md:grid-cols-[0.65fr_1.5fr] gap-6 md:gap-12">
            <div><p className="font-serif text-4xl md:text-5xl text-teal mb-3">{stat.value}</p><h3 className="text-white text-lg font-medium">{stat.title}</h3></div>
            <div><p className={prose}>{stat.explanation}</p>{stat.arithmetic && <p className={`${prose} border-l-2 border-teal pl-5 mt-5`}>{stat.arithmetic}</p>}</div>
          </div>
          <figcaption className="border-t border-white/10 pt-5 mt-6 text-sm text-offwhite/70">Sources: <a className="text-teal underline underline-offset-4 break-words" href={stat.url} target="_blank" rel="noopener noreferrer">{stat.source}</a></figcaption>
        </figure>)}</div>
        {webCta?.mid && <button onClick={() => onOpenModal(webCta.mid!.label, <ContactForm />)} className="inline-flex items-center gap-3 px-6 py-4 mt-8 bg-teal text-white font-medium rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal">{webCta.mid.label}<ArrowRight aria-hidden="true" className="w-4 h-4" /></button>}
      </section>}

      {service.process && <section id="the-process" className="scroll-mt-28 bg-charcoal-dark border-y border-white/10 py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <h2 className={`${heading} mb-10`}>What the build actually looks like</h2>
          <div className="grid md:grid-cols-2 gap-x-14 gap-y-10">{service.process.map(step => <div key={step.title} className="border-t border-teal/30 pt-5"><h3 className="text-white text-xl font-medium mb-3">{step.title}</h3><p className={prose}>{step.description}</p></div>)}</div>
        </div>
      </section>}

      {service.fit && <section className="max-w-6xl mx-auto px-6 md:px-12 py-16 md:py-24 grid md:grid-cols-2 gap-10 md:gap-16">
        {[["A good fit",service.fit.yes],["Not a good fit",service.fit.no]].map(([label,items]) => <div key={label as string}><h2 className={`${heading} mb-6`}>{label}</h2><ul className="space-y-5">{(items as string[]).map(item => <li className={`${prose} border-t border-white/10 pt-4`} key={item}>{item}</li>)}</ul></div>)}
      </section>}

      {service.questions && <section id="questions" className="scroll-mt-28 max-w-6xl mx-auto px-6 md:px-12 pb-16 md:pb-24">
        <h2 className={`${heading} mb-10`}>Common questions</h2>
        <div className="divide-y divide-white/10">{service.questions.map(item => <section key={item.question} className="grid md:grid-cols-[0.8fr_1.5fr] gap-3 md:gap-12 py-7"><h3 className="text-white text-xl font-medium">{item.question}</h3><p className={prose}>{item.answer}</p></section>)}</div>
      </section>}

      {service.close && <section className="max-w-6xl mx-auto px-6 md:px-12 border-t border-teal/30 pt-12">
        <h2 className={`${heading} mb-5`}>{service.close.title}</h2>
        <p className={`${prose} max-w-2xl mb-7`}>{service.close.description}</p>
        <button onClick={() => onOpenModal(webCta?.close ?? service.close!.button, <ContactForm />)} className="inline-flex items-center gap-3 px-6 py-4 bg-teal text-white font-medium rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal">{webCta?.close ?? service.close.button}<ArrowRight aria-hidden="true" className="w-4 h-4" /></button>
      </section>}
    </article>
  );
}

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

  if (service.problem) return <DeepServiceContent service={service} onOpenModal={onOpenModal} />;

  const idx = SERVICES_DETAIL.indexOf(service);
  const cta = ctaFor(service.id, service.title);

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
                onClick={() => onOpenModal(cta.hero, <ContactForm />)}
                className="cta-button-pulse inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal text-white font-medium rounded-sm transition-all duration-300 ease-custom hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(0,128,128,0.4)]"
              >
                {cta.hero} <ArrowRight className="w-4 h-4" />
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
                className="animate-on-scroll bg-slate-dark/30 border border-white/5 rounded-2xl overflow-hidden hover:bg-slate-dark/50 hover:border-teal/20 transition-all duration-300 group"
              >
                <div className="aspect-square overflow-hidden border-b border-white/5">
                  <img src={sub.image ?? `/images/services/sub/${slugify(sub.title)}.jpg`} alt={sub.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <sub.icon className="w-5 h-5 text-teal flex-shrink-0" strokeWidth={1.5} />
                    <h3 className="text-lg text-white font-medium">{sub.title}</h3>
                  </div>
                  <p className="text-offwhite/60 font-light leading-relaxed text-sm">{sub.desc}</p>
                </div>
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
            <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">{cta.close}</h2>
            <p className="text-offwhite/70 text-lg font-light max-w-2xl mx-auto mb-10 leading-relaxed">
              {cta.closeBody}
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => onOpenModal(cta.close, <ContactForm />)}
                className="cta-button-pulse inline-flex items-center justify-center px-8 py-4 bg-white text-charcoal font-medium rounded-sm transition-all duration-300 hover:scale-[1.02]"
              >
                {cta.close}
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
