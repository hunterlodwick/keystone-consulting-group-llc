/**
 * Builds the public knowledge bundle for the KCG shop-leak chat widget.
 *
 * Renders each public route with the same local Vite SSR path as prerender
 * (no browser, no production, no outbound requests) and indexes visible
 * <main> text. Site chrome, forms, and booking/chat widgets are excluded.
 *
 * Re-run after copy lands: `npm run widget:index`
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { AI_AGENTS, AI_HUB } from "../src/content/ai-agents";
import { guides } from "../src/content/guides";
import type { HomepagePartners, WidgetIndex, WidgetSource } from "../src/lib/widget/types";
import { publicRoutes } from "./seo-routes";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/generated/widget-index.json");

const DENY = new Set(["/dashboard"]);
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const SKIP_TAGS = new Set(["script", "style", "svg", "noscript", "form", "fieldset", "textarea", "select", "option", "input", "button"]);
const BLOCK_TAGS = new Set(["p", "div", "section", "article", "li", "ul", "ol", "tr", "br", "h1", "h2", "h3", "h4", "blockquote", "pre", "table", "thead", "tbody", "dd", "dt"]);

const isPublic = (path: string) => publicRoutes.includes(path) && !DENY.has(path) && !path.startsWith("/dashboard");

const hash = (s: string) => createHash("sha256").update(s).digest("hex").slice(0, 16);
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);

function chunkText(text: string, size = 1100): string[] {
  const clean = text.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (clean.length <= size) return clean ? [clean] : [];
  const parts: string[] = [];
  let rest = clean;
  while (rest.length) {
    if (rest.length <= size) {
      parts.push(rest);
      break;
    }
    let cut = rest.lastIndexOf("\n", size);
    if (cut < size * 0.4) cut = rest.lastIndexOf(". ", size);
    if (cut < size * 0.4) cut = size;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  return parts.filter(Boolean);
}

function decode(s: string): string {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)));
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([:@\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw))) attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  return attrs;
}

function classList(attrs: Record<string, string>): string {
  return ` ${attrs.class || attrs.classname || ""} `;
}

function shouldSkip(tag: string, attrs: Record<string, string>): boolean {
  if (SKIP_TAGS.has(tag)) return true;
  if (attrs["aria-hidden"] === "true" || "hidden" in attrs) return true;
  if (attrs["data-booking-panel"]) return true;
  const cls = classList(attrs);
  if (cls.includes(" guide-form ") || cls.includes(" kcg-chat")) return true;
  if (cls.includes(" marquee-container ") || cls.includes(" partners-static ") || cls.includes(" partner-logo ")) return true;
  if (tag === "nav" && /main navigation/i.test(attrs["aria-label"] || "")) return true;
  return false;
}

type Section = { heading: string; headingId: string; texts: string[] };

function isolateMain(html: string): string {
  const open = html.search(/<main\b/i);
  if (open < 0) {
    const headerOpen = html.search(/<header\b/i);
    const headerClose = html.search(/<\/header>/i);
    const footerOpen = html.search(/<footer\b/i);
    const footerClose = html.search(/<\/footer>/i);
    let cut = html;
    if (headerOpen >= 0 && headerClose > headerOpen) cut = cut.slice(0, headerOpen) + cut.slice(headerClose + 9);
    if (footerOpen >= 0 && footerClose > footerOpen) {
      const fo = cut.search(/<footer\b/i);
      const fc = cut.search(/<\/footer>/i);
      if (fo >= 0 && fc > fo) cut = cut.slice(0, fo) + cut.slice(fc + 9);
    }
    return cut;
  }
  const afterOpen = html.indexOf(">", open);
  const start = afterOpen < 0 ? open : afterOpen + 1;
  const close = html.search(/<\/main>/i);
  if (close > start) return html.slice(start, close);
  return html.slice(start);
}

function nextMarkup(src: string, from: number): { kind: "comment" | "tag" | "text"; end: number; raw: string } | null {
  if (from >= src.length) return null;
  if (src.startsWith("<!--", from)) {
    const close = src.indexOf("-->", from + 4);
    return { kind: "comment", end: close < 0 ? src.length : close + 3, raw: "" };
  }
  if (src[from] === "<") {
    const end = src.indexOf(">", from + 1);
    if (end < 0) return { kind: "text", end: src.length, raw: src.slice(from) };
    return { kind: "tag", end: end + 1, raw: src.slice(from, end + 1) };
  }
  const lt = src.indexOf("<", from);
  const end = lt < 0 ? src.length : lt;
  return { kind: "text", end, raw: src.slice(from, end) };
}

function parseTag(raw: string): { tag: string; closing: boolean; selfClosing: boolean; attrs: Record<string, string> } | null {
  const m = raw.match(/^<\/?([a-zA-Z][\w:-]*)([^>]*)>$/);
  if (!m) return null;
  const tag = m[1].toLowerCase();
  const closing = raw.startsWith("</");
  const selfClosing = closing ? false : VOID.has(tag) || /\/\s*$/.test(m[2] || "") || raw.endsWith("/>");
  return { tag, closing, selfClosing, attrs: closing ? {} : parseAttrs(m[2] || "") };
}

function closeTagIndex(src: string, tag: string, from: number): number {
  const needle = `</${tag}`;
  let i = from;
  while (i < src.length) {
    const at = src.indexOf("</", i);
    if (at < 0) return -1;
    if (src.slice(at, at + needle.length).toLowerCase() === needle) return at;
    i = at + 2;
  }
  return -1;
}

function extractSections(html: string): Section[] {
  const src = isolateMain(html);
  const sections: Section[] = [];
  let current: Section = { heading: "", headingId: "", texts: [] };
  const skip: string[] = [];
  const landmarks: string[] = [];
  const claimedLandmarks = new Set<string>();
  const pushText = (raw: string, block: boolean) => {
    if (skip.length) return;
    const text = decode(raw).replace(/\s+/g, " ").trim();
    if (!text) {
      if (block && current.texts.length) current.texts.push("\n");
      return;
    }
    current.texts.push(block ? `\n${text}\n` : text);
  };

  let i = 0;
  while (i < src.length) {
    const token = nextMarkup(src, i);
    if (!token) break;
    i = token.end;
    if (token.kind === "comment") continue;
    if (token.kind === "text") {
      pushText(token.raw, false);
      continue;
    }
    const parsed = parseTag(token.raw);
    if (!parsed) continue;
    const { tag, closing, selfClosing, attrs } = parsed;
    if (closing) {
      if (skip.length && skip[skip.length - 1] === tag) skip.pop();
      else if (!skip.length && (tag === "section" || tag === "article") && landmarks.length) landmarks.pop();
      if (!skip.length && BLOCK_TAGS.has(tag)) pushText("", true);
      continue;
    }
    if (skip.length) {
      if (!selfClosing && (tag === skip[skip.length - 1] || shouldSkip(tag, attrs))) skip.push(tag);
      continue;
    }
    if (shouldSkip(tag, attrs)) {
      if (!selfClosing) skip.push(tag);
      continue;
    }
    if ((tag === "section" || tag === "article") && !selfClosing && attrs.id) landmarks.push(attrs.id);
    if (attrs["aria-label"]) pushText(attrs["aria-label"], false);
    if (/^h[1-3]$/.test(tag) && !selfClosing) {
      const closeAt = closeTagIndex(src, tag, i);
      const innerEnd = closeAt < 0 ? src.length : closeAt;
      const inner = src.slice(i, innerEnd);
      const heading = decode(inner.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
      let headingId = attrs.id || inner.match(/\bid=["']([^"']+)["']/i)?.[1] || "";
      if (landmarks.length) {
        const landmark = landmarks[landmarks.length - 1];
        if (landmark && !claimedLandmarks.has(landmark)) {
          headingId = landmark;
          claimedLandmarks.add(landmark);
        }
      }
      if (current.heading || current.texts.some((t) => t.trim())) sections.push(current);
      current = { heading, headingId, texts: heading ? [heading] : [] };
      if (closeAt < 0) i = src.length;
      else {
        const gt = src.indexOf(">", closeAt);
        i = gt < 0 ? src.length : gt + 1;
      }
      continue;
    }
    if (tag === "br") {
      pushText("", true);
      continue;
    }
  }
  if (current.heading || current.texts.some((t) => t.trim())) sections.push(current);
  if (sections.length >= 2 && !sections[0].heading) {
    sections[1].texts = [...sections[0].texts, ...sections[1].texts];
    sections.shift();
  }
  return sections;
}

function sectionKey(route: string, ordinal: number, heading: string, headingId: string): string {
  if (ordinal === 0) {
    if (route === "/") return "hero";
    if (route === "/services/ai-agents") return "hub";
    return "overview";
  }
  const fromHeading = slug(heading);
  const fromId = headingId && !/^section-\d+$/i.test(headingId) ? slug(headingId) : "";
  if (fromId && (!fromHeading || fromHeading === fromId || fromHeading.startsWith(`${fromId}-`))) return fromId;
  if (fromHeading) return fromHeading;
  if (fromId) return fromId;
  return `section-${ordinal + 1}`;
}

function pageHref(route: string, anchor: string): string {
  const path = route === "/" ? "/" : route;
  if (!anchor || /^section-\d+$/i.test(anchor)) return path;
  return path === "/" ? `/#${anchor}` : `${path}#${anchor}`;
}

function partnerNamesFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const idx = lower.lastIndexOf("we work with ");
  if (idx < 0) return [];
  const rest = text.slice(idx + "we work with ".length);
  const raw = rest.split(/[.]/)[0] ?? "";
  return raw
    .split(/\s*,\s*(?:and\s+)?|\s+and\s+/i)
    .map((name) => name.replace(/^and\s+/i, "").replace(/\.+$/, "").trim())
    .filter((name) => name.length > 1);
}

function topicsFor(route: string): string[] {
  if (route === "/") return ["home", "payments", "websites", "ai"];
  if (route === "/services") return ["services"];
  if (route === "/work") return ["work"];
  if (route === "/privacy") return ["privacy", "legal"];
  if (route === "/terms") return ["terms", "legal"];
  if (route === "/guides") return ["guides"];
  if (route.startsWith("/guides/")) {
    const g = guides.find((item) => `/guides/${item.slug}` === route);
    return ["guides", g?.topic ?? slug(route.slice(8))].filter(Boolean);
  }
  if (route === AI_HUB.path) return ["ai", "hub"];
  const agent = AI_AGENTS.find((item) => item.path === route);
  if (agent) return ["ai", agent.id];
  if (route.startsWith("/services/")) return ["services", route.slice("/services/".length)];
  return ["industry", route.replace(/^\//, "")];
}

function uniqueName(base: string, used: Set<string>): string {
  if (!used.has(base)) {
    used.add(base);
    return base;
  }
  let i = 2;
  while (used.has(`${base}-${i}`)) i += 1;
  const next = `${base}-${i}`;
  used.add(next);
  return next;
}

function sourcesForRoute(route: string, html: string): WidgetSource[] {
  const sections = extractSections(html);
  const pageTitle =
    sections.find((s) => s.heading)?.heading || (route === "/" ? "Home" : route.replace(/^\//, ""));
  const topics = topicsFor(route);
  const used = new Set<string>();
  const routeSources: WidgetSource[] = [];

  sections.forEach((section, ordinal) => {
    const body = section.texts.join(" ").replace(/\s+/g, " ").trim();
    if (body.length < 40) return;
    const base = sectionKey(route, ordinal, section.heading, section.headingId);
    const chunks = chunkText(body);
    const routeSlug = slug(route === "/" ? "home" : route);
    const partnerNames = base === "partners" ? partnerNamesFromText(body) : [];
    const sectionTopics = partnerNames.length ? [...topics, "partners", ...partnerNames.map((n) => slug(n))] : topics;
    const href = pageHref(route, section.headingId);
    chunks.forEach((chunk, i) => {
      const sectionName = i === 0 ? base : `${base}-${i + 1}`;
      const id = uniqueName(`${routeSlug}#${slug(sectionName) || "section"}`, used);
      routeSources.push({
        id,
        route,
        href,
        pageTitle,
        section: sectionName,
        text: chunk.replace(/\u2014|\u2013/g, "-"),
        kind: "page-section",
        topics: sectionTopics,
      });
    });
  });

  if (!routeSources.length) throw new Error(`No indexable DOM text for public route ${route}`);

  const preview = routeSources.map((s) => s.text).join(" ").slice(0, 400);
  const summaryId = uniqueName(`${slug(route === "/" ? "home" : route)}#summary`, used);
  routeSources.push({
    id: summaryId,
    route,
    href: pageHref(route, ""),
    pageTitle,
    section: "summary",
    text: `Page summary for ${pageTitle} (${route}). ${preview}`.replace(/\u2014|\u2013/g, "-"),
    kind: "summary",
    topics: ["summary", ...topics],
  });
  return routeSources;
}

async function withRenderer<T>(fn: (renderPage: (route: string) => string) => Promise<T>): Promise<T> {
  const cacheDir = await mkdtemp(join(tmpdir(), "kcg-widget-index-"));
  const renderer = await createServer({
    configLoader: "runner",
    cacheDir,
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, hmr: false, ws: false },
    appType: "custom",
  });
  try {
    const mod = await renderer.ssrLoadModule("/src/entry-prerender.tsx");
    return await fn((route: string) => String(mod.renderPage(route) ?? ""));
  } finally {
    await renderer.close();
    await rm(cacheDir, { recursive: true, force: true });
  }
}

async function main() {
  const allowed = [...new Set(publicRoutes.filter(isPublic))].sort();
  const sources: WidgetSource[] = [];
  const byRoute = new Map<string, WidgetSource[]>();

  await withRenderer(async (renderPage) => {
    for (const route of allowed) {
      const html = renderPage(route);
      if (!html.includes("<h1")) throw new Error(`SSR produced no h1 for ${route}`);
      const routeSources = sourcesForRoute(route, html);
      byRoute.set(route, routeSources);
      sources.push(...routeSources);
      console.log(`Indexed ${route} (${routeSources.length} chunks)`);
    }
  });

  const missing = allowed.filter((r) => !byRoute.has(r));
  if (missing.length) throw new Error(`No chunks for public routes: ${missing.join(", ")}`);
  if ([...byRoute.keys()].sort().join("\n") !== allowed.join("\n")) {
    throw new Error("Indexed route set does not match public route list.");
  }

  const partnersSource = sources.find((s) => s.id === "home#partners") ?? sources.find((s) => s.route === "/" && s.href === "/#partners");
  const homepagePartners: HomepagePartners = {
    names: partnersSource ? partnerNamesFromText(partnersSource.text) : [],
    sourceId: partnersSource?.id ?? "home#partners",
    href: partnersSource?.href ?? "/#partners",
  };
  if (!homepagePartners.names.includes("Square") || homepagePartners.href !== "/#partners") {
    throw new Error("Homepage partners evidence was not derived from the rendered #partners section.");
  }

  const index: WidgetIndex = {
    contentVersion: hash(sources.map((s) => s.text).join("|")),
    builtAt: new Date().toISOString(),
    publicRoutes: allowed,
    sources,
    homepagePartners,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(index, null, 2));
  console.log(`Indexed ${index.sources.length} chunks across ${index.publicRoutes.length} public routes -> ${OUT}`);
  console.log(`contentVersion ${index.contentVersion}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
