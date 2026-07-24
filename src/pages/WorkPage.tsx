import React, { useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Building2,
  Mountain,
  LayoutDashboard,
  ShoppingCart,
  Wifi,
  Bug,
  Truck,
  Layers,
  Lock,
  Bot,
  Database,
  Workflow,
  Code
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

const PROJECTS = [
  {
    name: "Ensign Properties Management",
    label: "Ensign Properties",
    url: "https://www.ensignpropertiesmanagement.com",
    domain: "ensignpropertiesmanagement.com",
    screenshot: "ensign-properties",
    desc: "Full property management listing website with searchable rental inventory.",
    tags: ["Property Management", "Listings", "Search"],
    icon: Building2,
    isConfidential: false
  },
  {
    name: "Teton Reach",
    label: "Teton Reach",
    url: "https://www.tetonreach.com",
    domain: "tetonreach.com",
    screenshot: "teton-reach",
    desc: "Professional services website built for credibility and clean lead capture.",
    tags: ["Professional Services", "Web Design"],
    icon: Mountain,
    isConfidential: false
  },
  {
    name: "Keystone OS Dashboard",
    label: "Keystone OS",
    url: "https://keystone-os-dashboard.vercel.app",
    domain: "keystone-os-dashboard.vercel.app",
    screenshot: "keystone-os",
    desc: "Custom internal operations dashboard with Kanban board, project tracking, and Firestore integration.",
    tags: ["Custom CRM", "Kanban", "Internal Tools"],
    icon: LayoutDashboard,
    isConfidential: true
  },
  {
    name: "Benitz Appliance",
    label: "Benitz Appliance",
    url: "https://benitz-appliance.vercel.app",
    domain: "benitz-appliance.vercel.app",
    screenshot: "benitz-appliance",
    desc: "Enterprise-level appliance dealer site with a 631-product catalog, AI-powered RAG chat assistant, live search, and North Payments checkout.",
    tags: ["E-commerce", "AI Assistant", "631 Products", "Payments"],
    icon: ShoppingCart,
    isConfidential: false
  },
  {
    name: "AT&T Fiber Internet",
    label: "AT&T Fiber",
    url: "https://www.attfiber-internet.com",
    domain: "attfiber-internet.com",
    screenshot: "att-fiber",
    desc: "Super SEO and AEO-driven dealer site with 33 pages of optimized content.",
    tags: ["SEO", "AEO", "33 Pages", "Content Strategy"],
    icon: Wifi,
    isConfidential: false
  },
  {
    name: "Avada Pest Control",
    label: "Avada Pest",
    url: "https://avada-pest-control.vercel.app",
    domain: "avada-pest-control.vercel.app",
    screenshot: "avada-pest",
    desc: "SEO-driven pest control site with 80+ pages of optimized local content.",
    tags: ["SEO", "80+ Pages", "Local Search", "Pest Control"],
    icon: Bug,
    isConfidential: false
  },
  {
    name: "Mexpresso Utah",
    label: "Mexpresso Utah",
    url: "https://www.mexpressoutah.com",
    domain: "mexpressoutah.com",
    screenshot: "mexpresso",
    desc: "Food truck website with a custom admin panel letting the owner update daily locations without a developer.",
    tags: ["Food Truck", "Custom CMS", "Location Updates"],
    icon: Truck,
    isConfidential: false
  },
  {
    name: "Sego Flooring SWFL",
    label: "Sego Flooring",
    url: "https://www.segoflooringswfl.com",
    domain: "segoflooringswfl.com",
    screenshot: "sego-flooring",
    desc: "3D animated flooring company website with high-conversion appointment booking tactics.",
    tags: ["3D Animation", "Flooring", "Appointment Booking", "High Conversion"],
    icon: Layers,
    isConfidential: false
  }
];

const CUSTOM_BUILDS = [
  {
    title: "AI Chat Assistants",
    desc: "Retrieval-based assistants trained on your catalog, pricing, and policies so customers get real answers instead of a contact form.",
    icon: Bot
  },
  {
    title: "Operations Dashboards",
    desc: "Internal tools that replace the spreadsheet stack — job tracking, pipeline boards, and live reporting your team actually opens.",
    icon: LayoutDashboard
  },
  {
    title: "CRM Systems",
    desc: "Custom pipelines and customer records shaped around how your business sells, not how a SaaS vendor decided you should.",
    icon: Database
  },
  {
    title: "Automated Workflows",
    desc: "Integrations between your site, CRM, invoicing, and scheduling tools so data moves without anyone copying and pasting it.",
    icon: Workflow
  }
];

interface WorkPageProps {
  onOpenModal: (title: string, content: React.ReactNode) => void;
  onNavigate: (path: string) => void;
}

export default function WorkPage({ onOpenModal, onNavigate }: WorkPageProps) {
  useScrollAnimation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="animate-on-scroll max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 border border-teal/20 text-teal text-xs font-medium uppercase tracking-wider mb-8">
              <Code className="w-3.5 h-3.5" />
              Portfolio
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-[1.1] text-balance">
              Selected Work
            </h1>
            <p className="text-offwhite/70 text-lg md:text-xl font-light leading-relaxed">
              Websites, custom software, and AI-powered systems built for small businesses across the US.
            </p>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="pb-20 md:pb-28 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PROJECTS.map((project, i) => (
              <div
                key={project.screenshot}
                className="animate-on-scroll"
                style={{ transitionDelay: `${Math.min(i, 5) * 60}ms` }}
              >
                <article className="group flex h-full flex-col bg-slate-dark/30 border border-white/5 rounded-2xl overflow-hidden transition-colors duration-300 hover:border-teal/30">
                  {/* Preview */}
                  <div className="bg-charcoal-dark border-b border-white/5">
                    <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 transition-colors duration-300 group-hover:border-teal/40">
                      <span className="w-2 h-2 rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-teal/50"></span>
                      <span className="w-2 h-2 rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-teal/30"></span>
                      <span className="w-2 h-2 rounded-full bg-white/10 transition-colors duration-300 group-hover:bg-teal/20"></span>
                      <div className="ml-2 min-w-0 flex-1 rounded-sm bg-white/5 px-2.5 py-1">
                        <span className="block truncate font-mono text-[10px] text-offwhite/50">
                          {project.isConfidential ? 'internal · not publicly hosted' : project.domain}
                        </span>
                      </div>
                    </div>
                    <div className="aspect-[800/515] overflow-hidden">
                      <img
                        src={`/screenshots/previews/${project.screenshot}.jpg`}
                        alt={`${project.name} website preview`}
                        width="800"
                        height="515"
                        loading={i < 3 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="h-full w-full object-cover object-top transition-transform duration-[400ms] ease-out motion-safe:group-hover:scale-[1.03]"
                      />
                    </div>
                  </div>

                  {/* Detail */}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[10px] text-teal tracking-[0.2em]">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-serif text-xl text-white leading-tight truncate">
                        {project.label}
                      </span>
                      <project.icon className="ml-auto w-4 h-4 flex-shrink-0 text-teal/40" strokeWidth={1.5} />
                    </div>

                    <div className="my-4 h-px bg-white/5"></div>

                    <h3 className="text-lg text-white font-medium mb-3 leading-snug">{project.name}</h3>
                    <p className="text-offwhite/60 text-sm font-light leading-relaxed mb-6">{project.desc}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-offwhite/60 text-[11px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {project.isConfidential ? (
                      <p className="mt-auto flex items-center justify-center gap-2 w-full px-5 py-3 border border-white/10 text-offwhite/40 text-xs font-medium rounded-sm text-center">
                        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                        Internal Tool — Available as a Custom Build
                      </p>
                    ) : (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-auto inline-flex items-center justify-center gap-2 w-full px-5 py-3 bg-transparent border border-white/20 text-white text-sm font-medium rounded-sm transition-colors duration-300 hover:bg-white/5 hover:border-teal/40"
                        aria-label={`Visit ${project.name} (opens in a new tab)`}
                      >
                        Visit Site <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Software */}
      <section className="py-20 md:py-28 bg-charcoal-dark/40 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="animate-on-scroll max-w-3xl mb-14">
            <h2 className="font-serif text-3xl md:text-4xl text-white mb-5">Custom Software Builds</h2>
            <p className="text-offwhite/70 text-lg font-light leading-relaxed">
              Beyond marketing websites, we build custom software: AI-powered chat assistants, operations dashboards,
              CRM systems, and automated workflows. Ask about a scoped build for your business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-14">
            {CUSTOM_BUILDS.map((build, i) => (
              <div
                key={build.title}
                className="animate-on-scroll bg-slate-dark/30 border border-white/5 rounded-2xl p-6 transition-colors duration-300 hover:border-teal/30"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="w-11 h-11 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center mb-5">
                  <build.icon className="w-5 h-5 text-teal" />
                </div>
                <h3 className="text-base text-white font-medium mb-3">{build.title}</h3>
                <p className="text-offwhite/60 text-sm font-light leading-relaxed">{build.desc}</p>
              </div>
            ))}
          </div>

          <div className="animate-on-scroll flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => onOpenModal("Schedule a Call", <ContactForm />)}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-teal text-white font-medium rounded-sm transition-colors duration-300 hover:bg-teal-soft"
            >
              Schedule a Call <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/services')}
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border border-white/20 text-white font-medium rounded-sm transition-colors duration-300 hover:bg-white/5 hover:border-white/40"
            >
              Explore Services
            </button>
          </div>
        </div>
      </section>

      {/* Powered by */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-center gap-2.5 text-offwhite/40">
            <svg viewBox="0 0 100 100" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <polygon points="50,5 15,70 50,95" fill="#008080" />
              <polygon points="50,5 85,70 50,95" fill="#4A4A4A" />
              <polygon points="15,70 30,65 50,80 50,95" fill="#008080" />
            </svg>
            <span className="text-xs tracking-wide">Powered by Keystone Consulting</span>
          </div>
        </div>
      </section>
    </div>
  );
}
