import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test, type Page, type ConsoleMessage } from '@playwright/test';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const EVIDENCE = path.join(ROOT, '.plan/booking-widget/evidence');
const SHOTS = path.join(EVIDENCE, 'screenshots');

mkdirSync(SHOTS, { recursive: true });

type ScenarioResult = {
  name: string;
  viewport: string;
  theme: string;
  ok: boolean;
  notes: string;
  intercept?: boolean;
};

const scenarios: ScenarioResult[] = [];
const measurements: Array<Record<string, unknown>> = [];
const ctaMatrix: Array<Record<string, unknown>> = [];
const googleWriteAttempts: string[] = [];

function denverToday(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Denver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function addDays(date: string, n: number): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + n)).toISOString().slice(0, 10);
}

async function blockExternalWrites(page: Page) {
  await page.route('https://www.googleapis.com/**', (route) => {
    googleWriteAttempts.push(route.request().url());
    return route.abort();
  });
  await page.route('https://oauth2.googleapis.com/**', (route) => {
    googleWriteAttempts.push(route.request().url());
    return route.abort();
  });
  await page.route('https://api.web3forms.com/**', (route) => route.abort());
}

function attachErrorCollectors(page: Page) {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    pageErrors.push(err.message);
  });
  return { consoleErrors, pageErrors };
}

async function inspectImages(page: Page) {
  await page.evaluate(async () => {
    await Promise.all(
      [...document.images].map(async (img) => {
        img.loading = 'eager';
        img.decoding = 'sync';
        try {
          if (typeof img.decode === 'function') await img.decode();
        } catch {
          /* decode rejection is recorded via naturalWidth */
        }
      }),
    );
  });
  return page.evaluate(() =>
    [...document.images].map((img) => ({
      src: img.currentSrc || img.src,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      failed: img.complete && img.naturalWidth === 0,
    })),
  );
}

async function overflowDelta(page: Page, selector?: string) {
  return page.evaluate((sel) => {
    const el = sel ? document.querySelector(sel) : document.documentElement;
    if (!el) return { scrollWidth: 0, clientWidth: 0, delta: 0 };
    return {
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      delta: el.scrollWidth - el.clientWidth,
    };
  }, selector);
}

function bookingScope(page: Page, where: 'dialog' | 'inline' = 'dialog') {
  return where === 'inline' ? page.locator('#book-a-call') : page.getByRole('dialog');
}

function panelSelector(where: 'dialog' | 'inline' = 'dialog') {
  return where === 'inline' ? '#book-a-call [data-booking-panel]' : '[role="dialog"] [data-booking-panel]';
}

function widgetScrollSelector(where: 'dialog' | 'inline' = 'dialog') {
  return where === 'inline' ? '#book-a-call [data-booking-panel]' : '[role="dialog"] [data-booking-scroll]';
}

async function waitForWidget(page: Page, where: 'dialog' | 'inline' = 'dialog') {
  const root = bookingScope(page, where);
  if (where === 'dialog') {
    await expect(root.getByRole('heading', { name: 'Book a Call with Seth' })).toBeVisible();
  } else {
    await expect(root.getByRole('heading', { name: 'Pick a time with Seth' })).toBeVisible();
  }
  await expect(root.getByText('30 minutes with Seth')).toBeVisible();
  await expect(root.locator('[data-booking-widget]')).toBeVisible();
  await expect(root.locator('[data-booking-state="loading"]')).toHaveCount(0, { timeout: 20_000 });
}

async function openBooking(page: Page, viewportWidth: number) {
  if (viewportWidth >= 1280) {
    await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
  } else {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
  }
}

async function pickFirstSlot(page: Page, where: 'dialog' | 'inline' = 'dialog') {
  const widget = bookingScope(page, where).locator('[data-booking-widget]');
  await expect(widget).toBeVisible();
  const dateButtons = widget.getByRole('group', { name: 'Dates' }).getByRole('button');
  const count = await dateButtons.count();
  for (let i = 0; i < count; i += 1) {
    await dateButtons.nth(i).click();
    const radios = widget.getByRole('radio');
    if ((await radios.count()) > 0) {
      await radios.first().click();
      await expect(radios.first()).toBeChecked();
      return true;
    }
  }
  return false;
}

async function measureControls(page: Page) {
  return page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const root =
      dialog?.querySelector('[data-booking-panel]') ??
      document.querySelector('[data-booking-panel]') ??
      document.querySelector('[role="dialog"]');
    if (!root) return [];
    const buttonsAndLinks = [...root.querySelectorAll<HTMLElement>('button, a')];
    const textareas = [...root.querySelectorAll<HTMLElement>('textarea')];
    const inputs = [...root.querySelectorAll<HTMLInputElement>('input')].filter(
      (el) => el.type !== 'radio' && el.type !== 'hidden',
    );
    const labels = [...root.querySelectorAll<HTMLLabelElement>('label')].filter((el) =>
      Boolean(el.querySelector('input, textarea, select, button')),
    );
    return [...buttonsAndLinks, ...textareas, ...inputs, ...labels].map((el) => {
      const box = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 80),
        width: Math.round(box.width),
        height: Math.round(box.height),
        pass44: box.height >= 44 && box.width >= 44,
      };
    });
  });
}

type ContrastSample = {
  kind: 'text' | 'boundary';
  text: string;
  ratio: number | null;
  color: string;
  backgroundColor: string;
  unparsed?: boolean;
};

async function measureContrast(page: Page): Promise<ContrastSample[]> {
  return page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const widget =
      dialog?.querySelector('[data-booking-widget]') ?? document.querySelector('[data-booking-widget]');
    const panel = dialog?.querySelector('[data-booking-panel]') ?? document.querySelector('[data-booking-panel]');
    if (!widget) return [];

    type RGBA = { r: number; g: number; b: number; a: number };

    const clampByte = (v: number) => Math.round(Math.min(255, Math.max(0, v)));

    const linToSrgbByte = (v: number) => {
      const c = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(v, 0), 1 / 2.4) - 0.055;
      return clampByte(c * 255);
    };

    const oklabToRgba = (L: number, a: number, b: number, alpha: number): RGBA => {
      const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
      const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
      const s_ = L - 0.0894841775 * a - 1.291485548 * b;
      const l = l_ ** 3;
      const m = m_ ** 3;
      const s = s_ ** 3;
      const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
      const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
      const b2 = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
      return { r: linToSrgbByte(r), g: linToSrgbByte(g), b: linToSrgbByte(b2), a: alpha };
    };

    const hslToRgba = (h: number, s: number, l: number, alpha: number): RGBA => {
      const sat = s / 100;
      const lit = l / 100;
      const c = (1 - Math.abs(2 * lit - 1)) * sat;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = lit - c / 2;
      let r = 0;
      let g = 0;
      let b = 0;
      if (h < 60) [r, g, b] = [c, x, 0];
      else if (h < 120) [r, g, b] = [x, c, 0];
      else if (h < 180) [r, g, b] = [0, c, x];
      else if (h < 240) [r, g, b] = [0, x, c];
      else if (h < 300) [r, g, b] = [x, 0, c];
      else [r, g, b] = [c, 0, x];
      return {
        r: clampByte((r + m) * 255),
        g: clampByte((g + m) * 255),
        b: clampByte((b + m) * 255),
        a: alpha,
      };
    };

    const parseNumberList = (raw: string) =>
      raw
        .trim()
        .split(/[\s,/]+/)
        .filter(Boolean)
        .map((part) => Number(part.replace('%', '')));

    const parse = (value: string): RGBA | null => {
      if (!value) return null;
      const v = value.trim().toLowerCase();
      if (v === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
      const rgb = v.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([0-9.]+))?\s*\)$/);
      if (rgb) {
        return {
          r: Number(rgb[1]),
          g: Number(rgb[2]),
          b: Number(rgb[3]),
          a: rgb[4] === undefined ? 1 : Number(rgb[4]),
        };
      }
      const rgbSpace = v.match(/^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([0-9.%]+))?\s*\)$/);
      if (rgbSpace) {
        return {
          r: Number(rgbSpace[1]),
          g: Number(rgbSpace[2]),
          b: Number(rgbSpace[3]),
          a: rgbSpace[4] === undefined ? 1 : rgbSpace[4].endsWith('%') ? Number(rgbSpace[4]) / 100 : Number(rgbSpace[4]),
        };
      }
      const hex = v.match(/^#([0-9a-f]{3,8})$/);
      if (hex) {
        let h = hex[1];
        if (h.length === 3) h = `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`;
        if (h.length === 4) h = `${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
        const n = parseInt(h.slice(0, 6), 16);
        const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255, a };
      }
      const oklch = v.match(/^oklch\(\s*([^)]+)\)$/);
      if (oklch) {
        const parts = parseNumberList(oklch[1]);
        if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
        const [L, C, h, alpha = 1] = parts;
        const hr = (h * Math.PI) / 180;
        return oklabToRgba(L, C * Math.cos(hr), C * Math.sin(hr), alpha);
      }
      const oklab = v.match(/^oklab\(\s*([^)]+)\)$/);
      if (oklab) {
        const parts = parseNumberList(oklab[1]);
        if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
        const [L, a, b, alpha = 1] = parts;
        return oklabToRgba(L, a, b, alpha);
      }
      const hsl = v.match(/^hsla?\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*([0-9.]+))?\s*\)$/);
      if (hsl) {
        return hslToRgba(Number(hsl[1]), Number(hsl[2]), Number(hsl[3]), hsl[4] === undefined ? 1 : Number(hsl[4]));
      }
      const colorSrgb = v.match(/^color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([0-9.]+))?\s*\)$/);
      if (colorSrgb) {
        return {
          r: clampByte(Number(colorSrgb[1]) * 255),
          g: clampByte(Number(colorSrgb[2]) * 255),
          b: clampByte(Number(colorSrgb[3]) * 255),
          a: colorSrgb[4] === undefined ? 1 : Number(colorSrgb[4]),
        };
      }
      return null;
    };

    const parseColorIn = (value: string): RGBA | null => {
      if (!value || value === 'none') return null;
      const direct = parse(value);
      if (direct) return direct;
      const tokens = [
        ...value.matchAll(/rgba?\([^)]+\)/gi),
        ...value.matchAll(/oklch\([^)]+\)/gi),
        ...value.matchAll(/oklab\([^)]+\)/gi),
        ...value.matchAll(/hsla?\([^)]+\)/gi),
        ...value.matchAll(/color\(\s*srgb[^)]+\)/gi),
        ...value.matchAll(/#[0-9a-f]{3,8}/gi),
      ]
        .map((match) => ({ index: match.index ?? 0, color: parse(match[0]) }))
        .filter((item) => item.color)
        .sort((a, b) => a.index - b.index);
      const opaque = tokens.map((item) => item.color).filter((color): color is RGBA => Boolean(color && color.a > 0));
      if (opaque.length > 0) return opaque[opaque.length - 1];
      const last = tokens[tokens.length - 1]?.color;
      return last ?? null;
    };

    const lin = (v: number) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const ratio = (a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }) => {
      const l1 = 0.2126 * lin(a.r) + 0.7152 * lin(a.g) + 0.0722 * lin(a.b);
      const l2 = 0.2126 * lin(b.r) + 0.7152 * lin(b.g) + 0.0722 * lin(b.b);
      const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
      return (hi + 0.05) / (lo + 0.05);
    };
    const blend = (fg: RGBA, bg: RGBA): RGBA => ({
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1,
    });
    const ancestorOpacity = (el: HTMLElement) => {
      let o = 1;
      let node: HTMLElement | null = el;
      while (node) {
        const op = Number(getComputedStyle(node).opacity);
        if (!Number.isNaN(op)) o *= op;
        node = node.parentElement;
      }
      return o;
    };
    const isTransparentBg = (raw: string, parsed: RGBA | null) => {
      if (!raw || raw === 'none' || raw === 'transparent') return true;
      return Boolean(parsed && parsed.a === 0);
    };
    const compositeBg = (el: HTMLElement): { color: RGBA } | { unparsed: string } => {
      const stack: RGBA[] = [];
      let node: HTMLElement | null = el;
      while (node) {
        const style = getComputedStyle(node);
        const raw = style.backgroundColor;
        const bg = parseColorIn(raw);
        const group = Number(style.opacity);
        if (!isTransparentBg(raw, bg)) {
          if (!bg) return { unparsed: raw };
          const withGroup = { ...bg, a: bg.a * (Number.isNaN(group) ? 1 : group) };
          stack.push(withGroup);
          if (withGroup.a >= 0.99) break;
        }
        node = node.parentElement;
      }
      let acc: RGBA = { r: 247, g: 247, b: 245, a: 1 };
      for (let i = stack.length - 1; i >= 0; i -= 1) {
        acc = blend(stack[i], acc);
      }
      return { color: acc };
    };
    const isIdentifyingBoxShadow = (value: string) => {
      if (!value || value === 'none') return false;
      return value.split(/,(?![^(]*\))/).some((layer) => {
        if (/\binset\b/i.test(layer)) return true;
        const lengths = [...layer.matchAll(/(-?[\d.]+)px/gi)].map((match) => Number(match[1]));
        return lengths.length >= 4 && Math.abs(lengths[3]) > 0;
      });
    };

    const samples: Array<{
      kind: 'text' | 'boundary';
      text: string;
      ratio: number | null;
      color: string;
      backgroundColor: string;
      unparsed?: boolean;
    }> = [];
    const textNodes = [...widget.querySelectorAll<HTMLElement>('p, label, span, button, a, h3, li')].filter((el) => {
      const style = getComputedStyle(el);
      const text = (el.textContent || '').trim();
      return text.length > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    });
    for (const el of textNodes) {
      const style = getComputedStyle(el);
      const fg = parseColorIn(style.color);
      const bg = compositeBg(el);
      const group = ancestorOpacity(el);
      if ('unparsed' in bg) {
        samples.push({
          kind: 'text',
          text: (el.textContent || '').trim().slice(0, 80),
          color: style.color,
          backgroundColor: bg.unparsed,
          ratio: null,
          unparsed: true,
        });
        continue;
      }
      if (!fg) {
        samples.push({
          kind: 'text',
          text: (el.textContent || '').trim().slice(0, 80),
          color: style.color,
          backgroundColor: `rgb(${Math.round(bg.color.r)}, ${Math.round(bg.color.g)}, ${Math.round(bg.color.b)})`,
          ratio: null,
          unparsed: true,
        });
        continue;
      }
      const fgWithOpacity = { ...fg, a: fg.a * group };
      const blended = blend(fgWithOpacity, bg.color);
      samples.push({
        kind: 'text',
        text: (el.textContent || '').trim().slice(0, 80),
        color: style.color,
        backgroundColor: `rgb(${Math.round(bg.color.r)}, ${Math.round(bg.color.g)}, ${Math.round(bg.color.b)})`,
        ratio: ratio(blended, bg.color),
      });
    }

    const controls = [
      ...widget.querySelectorAll<HTMLElement>('button, a, input, textarea, label'),
      ...(panel ? [panel as HTMLElement] : []),
    ];
    const pushBoundary = (
      el: HTMLElement,
      colorValue: string,
      parsed: RGBA | null,
      bg: { color: RGBA } | { unparsed: string },
    ) => {
      if ('unparsed' in bg) {
        samples.push({
          kind: 'boundary',
          text: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 80),
          color: colorValue,
          backgroundColor: bg.unparsed,
          ratio: null,
          unparsed: true,
        });
        return;
      }
      if (!parsed) {
        samples.push({
          kind: 'boundary',
          text: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 80),
          color: colorValue,
          backgroundColor: `rgb(${Math.round(bg.color.r)}, ${Math.round(bg.color.g)}, ${Math.round(bg.color.b)})`,
          ratio: null,
          unparsed: true,
        });
        return;
      }
      const group = ancestorOpacity(el);
      const blended = blend({ ...parsed, a: parsed.a * group }, bg.color);
      samples.push({
        kind: 'boundary',
        text: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 80),
        color: colorValue,
        backgroundColor: `rgb(${Math.round(bg.color.r)}, ${Math.round(bg.color.g)}, ${Math.round(bg.color.b)})`,
        ratio: ratio(blended, bg.color),
      });
    };

    for (const el of controls) {
      const style = getComputedStyle(el);
      const bg = compositeBg(el);
      if ('unparsed' in bg) {
        pushBoundary(el, style.backgroundColor, null, bg);
        continue;
      }
      const borderWidth = parseFloat(style.borderTopWidth);
      const borderStyle = style.borderTopStyle;
      const outlineWidth = parseFloat(style.outlineWidth);
      const outlineStyle = style.outlineStyle;
      let measuredEdge = false;
      if (borderWidth > 0 && borderStyle && borderStyle !== 'none') {
        measuredEdge = true;
        pushBoundary(el, style.borderTopColor, parseColorIn(style.borderTopColor), bg);
      }
      if (outlineWidth > 0 && outlineStyle && outlineStyle !== 'none') {
        measuredEdge = true;
        pushBoundary(el, style.outlineColor, parseColorIn(style.outlineColor), bg);
      }
      if (isIdentifyingBoxShadow(style.boxShadow)) {
        measuredEdge = true;
        pushBoundary(el, style.boxShadow, parseColorIn(style.boxShadow), bg);
      }
      if (!measuredEdge) {
        const parent = el.parentElement;
        if (parent) {
          const parentBg = compositeBg(parent);
          const fill = parseColorIn(style.backgroundColor);
          if ('unparsed' in parentBg) {
            pushBoundary(el, style.backgroundColor, fill, parentBg);
          } else if (fill && fill.a > 0) {
            const group = ancestorOpacity(el);
            const blended = blend({ ...fill, a: fill.a * group }, parentBg.color);
            if (
              Math.abs(blended.r - parentBg.color.r) +
                Math.abs(blended.g - parentBg.color.g) +
                Math.abs(blended.b - parentBg.color.b) >
              3
            ) {
              samples.push({
                kind: 'boundary',
                text: (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 80),
                color: style.backgroundColor,
                backgroundColor: `rgb(${Math.round(parentBg.color.r)}, ${Math.round(parentBg.color.g)}, ${Math.round(parentBg.color.b)})`,
                ratio: ratio(blended, parentBg.color),
              });
            }
          } else if (style.backgroundColor && style.backgroundColor !== 'transparent' && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
            pushBoundary(el, style.backgroundColor, fill, parentBg);
          }
        }
      }
    }
    return samples;
  });
}

function assertContrast(samples: ContrastSample[]) {
  const unmeasured = samples.filter((sample) => sample.ratio === null || sample.unparsed);
  expect(unmeasured, `unparsed or unmeasured essential colors: ${JSON.stringify(unmeasured.slice(0, 8))}`).toEqual([]);
  const badText = samples.filter((sample) => sample.kind === 'text' && sample.ratio !== null && sample.ratio < 4.5);
  const badEdge = samples.filter((sample) => sample.kind === 'boundary' && sample.ratio !== null && sample.ratio < 3);
  expect(badText, `text contrast < 4.5: ${JSON.stringify(badText.slice(0, 8))}`).toEqual([]);
  expect(badEdge, `boundary contrast < 3: ${JSON.stringify(badEdge.slice(0, 8))}`).toEqual([]);
}

async function focusIsInDialog(page: Page) {
  return page.evaluate(() => {
    const dialog = document.querySelector('[role="dialog"]');
    const active = document.activeElement;
    return Boolean(dialog && active && active !== document.body && dialog.contains(active));
  });
}

async function focusedIsUnoccluded(page: Page) {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!(el instanceof HTMLElement) || el === document.body) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return false;
    const points = [
      { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      { x: rect.left + rect.width / 2, y: rect.top + 2 },
      { x: rect.left + rect.width / 2, y: rect.bottom - 2 },
    ];
    return points.every(({ x, y }) => {
      const top = document.elementFromPoint(x, y);
      return Boolean(top && (el === top || el.contains(top) || top.contains(el)));
    });
  });
}

async function stickyClearOfName(page: Page, where: 'dialog' | 'inline' = 'dialog') {
  const rootSel = where === 'inline' ? '#book-a-call' : '[role="dialog"]';
  return page.evaluate((sel) => {
    const root = document.querySelector(sel);
    const input = root?.querySelector<HTMLInputElement>('input[name="name"]');
    const sticky = root?.querySelector<HTMLElement>('[data-booking-sticky]');
    if (!input || !sticky) return { ok: false };
    const rect = input.getBoundingClientRect();
    const stickyRect = sticky.getBoundingClientRect();
    const center = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return {
      ok: true,
      inputTop: rect.top,
      inputBottom: rect.bottom,
      stickyBottom: stickyRect.bottom,
      centerIsInput: Boolean(center && (input === center || input.contains(center) || center.contains(input))),
      overlap: Math.max(0, Math.min(rect.bottom, stickyRect.bottom) - Math.max(rect.top, stickyRect.top)),
    };
  }, rootSel);
}

async function setThemeAndGoto(page: Page, theme: 'light' | 'dark' | 'default', url = '/') {
  if (theme !== 'default') {
    await page.addInitScript((value) => {
      localStorage.setItem('kcg-theme', value);
    }, theme);
  } else {
    await page.addInitScript(() => {
      localStorage.removeItem('kcg-theme');
    });
  }
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('header');
}

async function readServerSafety(page: Page) {
  return page.evaluate(async () => {
    const res = await fetch('/__booking/test/safety');
    return res.json() as Promise<{
      insert: number;
      realWrites: number;
      realInvites: number;
      insertRequests: number;
    }>;
  });
}

test.beforeEach(async ({ page }) => {
  googleWriteAttempts.length = 0;
  await blockExternalWrites(page);
});

test.afterAll(() => {
  writeFileSync(
    path.join(EVIDENCE, 'browser-results.json'),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), scenarios, googleWriteAttempts }, null, 2)}\n`,
  );
  writeFileSync(
    path.join(EVIDENCE, 'measurements.json'),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), measurements }, null, 2)}\n`,
  );
  writeFileSync(
    path.join(EVIDENCE, 'cta-matrix.json'),
    `${JSON.stringify({ generatedAt: new Date().toISOString(), ctaMatrix }, null, 2)}\n`,
  );
});

test.describe('booking widget browser matrix', () => {
  test('contrast helper fails a 1.2:1 control boundary', async ({ page }) => {
    await page.setContent(
      '<html><body style="background:#f7f7f5"><div data-booking-widget><button id="ghost" style="background:#f7f7f5;border:1px solid rgba(0,0,0,0.08);color:#1a1a1a">Previous dates</button></div></body></html>',
    );
    const samples = await measureContrast(page);
    expect(samples.some((sample) => sample.kind === 'boundary')).toBeTruthy();
    expect(() => {
      assertContrast(samples);
    }).toThrow();
  });

  test('contrast helper fails unparsed near-background text', async ({ page }) => {
    await page.setContent(
      '<html><body style="background:#f7f7f5"><div data-booking-widget><p style="color:oklch(0.95 0 0);background:#f7f7f5">Near background</p></div></body></html>',
    );
    const samples = await measureContrast(page);
    expect(() => {
      assertContrast(samples);
    }).toThrow();
  });

  test('contrast helper fails a weak outline with no border', async ({ page }) => {
    await page.setContent(
      '<html><body style="background:#f7f7f5"><div data-booking-widget><button style="background:#f7f7f5;border:none;outline:2px solid rgba(0,0,0,0.08);color:#1a1a1a">Ghost</button></div></body></html>',
    );
    const samples = await measureContrast(page);
    expect(samples.some((sample) => sample.kind === 'boundary')).toBeTruthy();
    expect(() => {
      assertContrast(samples);
    }).toThrow();
  });

  test('contrast helper fails a weak outer box-shadow ring', async ({ page }) => {
    await page.setContent(`<body style="background:#f7f7f5">
  <div data-booking-widget>
    <button style="background:#f7f7f5;color:#1a1a1a;border:none;
                   box-shadow:0 0 0 2px rgba(0,0,0,.08)">Probe</button>
  </div>
</body>`);
    const samples = await measureContrast(page);
    const edges = samples.filter((sample) => sample.kind === 'boundary');
    expect(edges.length).toBeGreaterThan(0);
    expect(edges.some((sample) => sample.ratio !== null && sample.ratio < 3)).toBeTruthy();
    expect(() => {
      assertContrast(samples);
    }).toThrow();
  });

  test('contrast helper fails unparsed display-p3 background', async ({ page }) => {
    await page.setContent(`<body style="background:#f7f7f5">
  <div data-booking-widget>
    <button style="background:color(display-p3 0.05 0.05 0.05);
                   border:1px solid black;color:black">Probe</button>
  </div>
</body>`);
    const samples = await measureContrast(page);
    expect(samples.some((sample) => sample.unparsed && sample.ratio === null)).toBeTruthy();
    expect(samples.some((sample) => /display-p3/i.test(sample.backgroundColor))).toBeTruthy();
    expect(samples.every((sample) => !/247,\s*247,\s*245/.test(sample.backgroundColor))).toBeTruthy();
    expect(() => {
      assertContrast(samples);
    }).toThrow();
  });

  test('image inspector fails a missing image', async ({ page }) => {
    await page.setContent('<html><body><img id="x" src="/__missing-booking-image.png"></body></html>');
    const images = await inspectImages(page);
    expect(images.some((img) => img.failed || img.naturalWidth === 0)).toBeTruthy();
  });

  test('clean storage defaults to light theme at 390', async ({ page }) => {
    const errors = attachErrorCollectors(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await setThemeAndGoto(page, 'default');
    const theme = await page.locator('html').getAttribute('data-theme');
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
    await waitForWidget(page);
    await expect.poll(() => focusIsInDialog(page)).toBeTruthy();
    await page.screenshot({ path: path.join(SHOTS, '390-default-light.png'), fullPage: false });
    const doc = await overflowDelta(page);
    const panel = await overflowDelta(page, panelSelector('dialog'));
    const images = await inspectImages(page);
    const failedImages = images.filter((img) => img.failed);
    measurements.push({
      name: '390-default-light',
      viewport: '390x844',
      theme,
      document: doc,
      panel,
      consoleErrors: errors.consoleErrors.length,
      pageErrors: errors.pageErrors.length,
      images,
      failedImages,
    });
    scenarios.push({
      name: 'clean-storage-default-theme',
      viewport: '390x844',
      theme: String(theme),
      ok: theme === 'light' && doc.delta <= 0 && panel.delta <= 0 && failedImages.length === 0,
      notes: `data-theme=${theme}; failedImages=${failedImages.length}`,
    });
    expect(theme).toBe('light');
    expect(doc.delta).toBeLessThanOrEqual(0);
    expect(panel.delta).toBeLessThanOrEqual(0);
    expect(failedImages, JSON.stringify(failedImages)).toEqual([]);
    expect(errors.pageErrors).toEqual([]);
    expect(errors.consoleErrors).toEqual([]);
    expect(googleWriteAttempts).toEqual([]);
  });

  for (const viewport of [
    { name: '1440x900', width: 1440, height: 900 },
    { name: '390x844', width: 390, height: 844 },
  ] as const) {
    for (const theme of ['light', 'dark'] as const) {
      test(`${viewport.name} ${theme} slots`, async ({ page }) => {
        const errors = attachErrorCollectors(page);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await setThemeAndGoto(page, theme);
        await openBooking(page, viewport.width);
        await waitForWidget(page);
        await expect.poll(() => focusIsInDialog(page)).toBeTruthy();
        await expect(page.getByRole('dialog').getByRole('link', { name: 'Email KCG' }).first()).toBeVisible();
        await expect(page.getByText('You will receive an email invitation')).toHaveCount(0);
        const picked = await pickFirstSlot(page);
        expect(picked).toBeTruthy();
        const file =
          viewport.width >= 1280
            ? `${theme === 'light' ? '1440-light-slots' : '1440-dark-slots'}.png`
            : `${theme === 'light' ? '390-light-slots' : '390-dark-slots'}.png`;
        await page.screenshot({ path: path.join(SHOTS, file), fullPage: false });
        const doc = await overflowDelta(page);
        const overlay = await overflowDelta(page, '[role="dialog"]');
        const panel = await overflowDelta(page, panelSelector('dialog'));
        const scroller = await overflowDelta(page, widgetScrollSelector('dialog'));
        const targets = await measureControls(page);
        const contrast = await measureContrast(page);
        const images = await inspectImages(page);
        const failedImages = images.filter((img) => img.failed);
        const undersized = targets.filter((item) => item.height > 0 && !item.pass44);
        measurements.push({
          name: file,
          viewport: viewport.name,
          theme,
          document: doc,
          overlay,
          panel,
          consoleErrors: errors.consoleErrors.length,
          pageErrors: errors.pageErrors.length,
          failedImages,
          targets,
          contrast,
        });
        scenarios.push({
          name: `slots-${viewport.name}-${theme}`,
          viewport: viewport.name,
          theme,
          ok: doc.delta <= 0 && panel.delta <= 0 && errors.pageErrors.length === 0 && failedImages.length === 0,
          notes: `undersized=${undersized.length} console=${errors.consoleErrors.length} panelWidth=${panel.clientWidth}`,
        });
        expect(errors.pageErrors, errors.pageErrors.join('\n')).toEqual([]);
        expect(errors.consoleErrors, errors.consoleErrors.join('\n')).toEqual([]);
        expect(doc.delta).toBeLessThanOrEqual(0);
        expect(panel.delta).toBeLessThanOrEqual(0);
        expect(scroller.delta).toBeLessThanOrEqual(0);
        expect(panel.clientWidth).toBeLessThanOrEqual(viewport.width);
        expect(failedImages, JSON.stringify(failedImages)).toEqual([]);
        expect(undersized, JSON.stringify(undersized)).toEqual([]);
        assertContrast(contrast);
        expect(await focusedIsUnoccluded(page)).toBeTruthy();
        expect(googleWriteAttempts).toEqual([]);
      });
    }
  }

  test('loading, invalid form, dry-run confirm, empty, 409, 503', async ({ page }) => {
    const errors = attachErrorCollectors(page);
    await page.setViewportSize({ width: 1440, height: 900 });

    let releaseSlots: (() => void) | undefined;
    const hold = new Promise<void>((resolve) => {
      releaseSlots = resolve;
    });
    await page.route('**/api/booking/slots**', async (route) => {
      await hold;
      await route.continue();
    });
    await setThemeAndGoto(page, 'light');
    await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
    await expect(page.getByRole('dialog').locator('[data-booking-state="loading"]')).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('link', { name: 'Email KCG' }).first()).toBeVisible();
    await expect(page.getByText('You will receive an email invitation')).toHaveCount(0);
    await expect.poll(() => focusIsInDialog(page)).toBeTruthy();
    await page.screenshot({ path: path.join(SHOTS, 'loading.png'), fullPage: false });
    releaseSlots?.();
    await page.unroute('**/api/booking/slots**');
    await waitForWidget(page);
    scenarios.push({
      name: 'loading',
      viewport: '1440x900',
      theme: 'light',
      ok: true,
      notes: 'captured loading state before slots resolved',
    });

    const today = denverToday();
    const tomorrow = addDays(today, 1);
    await page.route('**/api/booking/slots**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'x-booking-mode': 'dry-run', 'cache-control': 'no-store' },
        body: JSON.stringify({
          tz: 'America/Denver',
          days: [
            { date: today, slots: [] },
            {
              date: tomorrow,
              slots: [{ start: `${tomorrow}T15:00:00-06:00`, end: `${tomorrow}T15:30:00-06:00` }],
            },
          ],
        }),
      });
    });
    await page.getByRole('button', { name: 'Close modal' }).click();
    await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
    await waitForWidget(page);
    await expect(page.getByText('No times available today.').first()).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('link', { name: 'Email KCG' }).first()).toBeVisible();
    await page.screenshot({ path: path.join(SHOTS, 'empty-today.png'), fullPage: false });
    scenarios.push({
      name: 'empty-today',
      viewport: '1440x900',
      theme: 'light',
      ok: true,
      notes: 'Playwright intercepted GET slots; labeled fixture, not Seth availability',
      intercept: true,
    });

    await page.route('**/api/booking/slots**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'x-booking-mode': 'dry-run', 'cache-control': 'no-store' },
        body: JSON.stringify({
          tz: 'America/Denver',
          days: [
            { date: today, slots: [] },
            { date: tomorrow, slots: [] },
          ],
        }),
      });
    });
    await page.getByRole('button', { name: 'Close modal' }).click();
    await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
    await waitForWidget(page);
    await expect(page.getByText('No times available in this date range.').first()).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('link', { name: 'Email KCG' }).first()).toHaveAttribute(
      'href',
      'mailto:info@keystoneconsultingg.com',
    );
    await page.screenshot({ path: path.join(SHOTS, 'empty-range.png'), fullPage: false });
    scenarios.push({
      name: 'empty-range',
      viewport: '1440x900',
      theme: 'light',
      ok: true,
      notes: 'Playwright intercepted GET slots; labeled fixture',
      intercept: true,
    });

    await page.unroute('**/api/booking/slots**');
    await page.getByRole('button', { name: 'Close modal' }).click();
    await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
    await waitForWidget(page);
    const picked = await pickFirstSlot(page);
    expect(picked).toBeTruthy();
    await bookingScope(page, 'dialog').getByRole('button', { name: 'Continue' }).click();
    await bookingScope(page, 'dialog').getByRole('button', { name: 'Book this time' }).click();
    await expect(page.getByText('Enter your name (1 to 120 characters).')).toBeVisible();
    await expect(page.getByText('Enter a valid email address.')).toBeVisible();
    await expect(page.getByText('You will receive an email invitation')).toHaveCount(0);
    await page.screenshot({ path: path.join(SHOTS, 'form-invalid.png'), fullPage: false });
    const formContrast = await measureContrast(page);
    assertContrast(formContrast);
    expect(await focusedIsUnoccluded(page)).toBeTruthy();
    scenarios.push({
      name: 'form-invalid',
      viewport: '1440x900',
      theme: 'light',
      ok: true,
      notes: 'client validation; server remains authoritative',
    });

    await bookingScope(page, 'dialog').getByLabel('Name').pressSequentially('Jordan Example');
    await bookingScope(page, 'dialog').getByLabel('Email').pressSequentially('jordan@example.com');
    await page.route('**/api/booking/book', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 409,
        contentType: 'application/json',
        headers: { 'x-booking-mode': 'dry-run', 'cache-control': 'no-store' },
        body: JSON.stringify({
          ok: false,
          error: { code: 'SLOT_TAKEN', message: 'That time is no longer available.' },
        }),
      });
    });
    await bookingScope(page, 'dialog').getByRole('button', { name: 'Book this time' }).click();
    await expect(bookingScope(page, 'dialog').locator('[data-booking-alert]')).toHaveText('That time was just taken. Please choose another.');
    await expect(page.getByRole('dialog').getByRole('link', { name: 'Email KCG' }).first()).toBeVisible();
    await expect(bookingScope(page, 'dialog').getByLabel('Name')).toHaveCount(0);
    await page.screenshot({ path: path.join(SHOTS, 'conflict-409.png'), fullPage: false });
    scenarios.push({
      name: 'conflict-409',
      viewport: '1440x900',
      theme: 'light',
      ok: true,
      notes: 'Playwright intercepted POST book 409; values retained in React state',
      intercept: true,
    });
    await page.unroute('**/api/booking/book');

    await page.route('**/api/booking/slots**', async (route) => {
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        headers: { 'x-booking-mode': 'dry-run', 'cache-control': 'no-store' },
        body: JSON.stringify({
          ok: false,
          error: { code: 'BOOKING_UNAVAILABLE', message: 'Online booking is unavailable.' },
        }),
      });
    });
    await page.getByRole('button', { name: 'Close modal' }).click();
    await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
    await expect(page.getByText('Online booking is unavailable.').first()).toBeVisible();
    await expect(page.getByRole('dialog').getByText('info@keystoneconsultingg.com').first()).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('link', { name: 'Email KCG' }).first()).toHaveAttribute(
      'href',
      'mailto:info@keystoneconsultingg.com',
    );
    await expect(page.getByText('You will receive an email invitation')).toHaveCount(0);
    await page.screenshot({ path: path.join(SHOTS, 'unavailable-503.png'), fullPage: false });
    scenarios.push({
      name: 'unavailable-503',
      viewport: '1440x900',
      theme: 'light',
      ok: true,
      notes: 'Playwright intercepted GET slots 503',
      intercept: true,
    });
    await page.unroute('**/api/booking/slots**');

    await page.getByRole('button', { name: 'Close modal' }).click();
    await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
    await waitForWidget(page);
    expect(await pickFirstSlot(page)).toBeTruthy();
    await bookingScope(page, 'dialog').getByRole('button', { name: 'Continue' }).click();
    await bookingScope(page, 'dialog').getByLabel('Name').pressSequentially('Jordan Example');
    await bookingScope(page, 'dialog').getByLabel('Email').pressSequentially('jordan@example.com');
    const safetyBefore = await readServerSafety(page);
    await bookingScope(page, 'dialog').getByRole('button', { name: 'Book this time' }).click();
    await expect(page.getByText('Test complete. No booking was created.').first()).toBeVisible();
    await expect(page.getByText('This was a test. No invitation was emailed.')).toBeVisible();
    await expect(page.getByText('You will receive an email invitation')).toHaveCount(0);
    await expect(page.getByRole('dialog').getByRole('link', { name: 'Email KCG' }).first()).toBeVisible();
    const safetyAfter = await readServerSafety(page);
    expect(safetyAfter.insert).toBe(safetyBefore.insert);
    expect(safetyAfter.realWrites).toBe(0);
    expect(safetyAfter.realInvites).toBe(0);
    expect(safetyAfter.insertRequests).toBe(0);
    await page.screenshot({ path: path.join(SHOTS, 'dry-run-confirmation.png'), fullPage: false });
    scenarios.push({
      name: 'dry-run-confirmation',
      viewport: '1440x900',
      theme: 'light',
      ok: true,
      notes: 'real local handler + fake Google transport; server insert counters stayed at 0',
    });
    expect(errors.pageErrors).toEqual([]);
    expect(errors.consoleErrors).toEqual([
      'Failed to load resource: the server responded with a status of 409 (Conflict)',
      'Failed to load resource: the server responded with a status of 503 (Service Unavailable)',
    ]);
    expect(googleWriteAttempts).toEqual([]);
  });

  test('keyboard path traps tab, restores focus, and never uses click shortcuts', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await setThemeAndGoto(page, 'light');
    const trigger = page.locator('header').getByRole('button', { name: 'Book a Call' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await waitForWidget(page);
    await expect.poll(() => focusIsInDialog(page)).toBeTruthy();

    for (let i = 0; i < 24; i += 1) {
      await page.keyboard.press('Tab');
      expect(await focusIsInDialog(page)).toBeTruthy();
    }
    for (let i = 0; i < 24; i += 1) {
      await page.keyboard.press('Shift+Tab');
      expect(await focusIsInDialog(page)).toBeTruthy();
    }

    let selected = false;
    for (let i = 0; i < 80; i += 1) {
      const focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLInputElement | null;
        return { tag: el?.tagName, type: el?.type, name: el?.name };
      });
      if (focused.type === 'radio' && focused.name?.startsWith('booking-slot')) {
        await page.keyboard.press('Space');
        selected = true;
        break;
      }
      await page.keyboard.press('Tab');
    }
    expect(selected).toBeTruthy();

    let continued = false;
    for (let i = 0; i < 80; i += 1) {
      const label = await page.evaluate(() => (document.activeElement?.textContent || '').replace(/\s+/g, ' ').trim());
      if (label === 'Continue') {
        await page.keyboard.press('Enter');
        continued = true;
        break;
      }
      await page.keyboard.press('Tab');
    }
    expect(continued).toBeTruthy();
    await expect(bookingScope(page, 'dialog').getByLabel('Name')).toBeFocused();
    expect(await focusedIsUnoccluded(page)).toBeTruthy();
    await page.keyboard.type('Riley Visitor');
    await page.keyboard.press('Tab');
    await page.keyboard.type('riley.visitor@example.com');
    let submitted = false;
    for (let i = 0; i < 80; i += 1) {
      const label = await page.evaluate(() => (document.activeElement?.textContent || '').replace(/\s+/g, ' ').trim());
      if (label === 'Book this time') {
        expect(await focusedIsUnoccluded(page)).toBeTruthy();
        await page.keyboard.press('Enter');
        submitted = true;
        break;
      }
      await page.keyboard.press('Tab');
    }
    expect(submitted).toBeTruthy();
    await expect(page.getByText('Test complete. No booking was created.').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Book a Call with Seth' })).toHaveCount(0);
    await expect(trigger).toBeFocused();
    scenarios.push({
      name: 'keyboard-path',
      viewport: '1440x900',
      theme: 'light',
      ok: true,
      notes: 'open, trap both directions, space-select slot, type, submit, Escape, focus restore',
    });
  });

  test('refresh, conflict and pending submission stay recoverable', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await setThemeAndGoto(page, 'light');
    await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
    await waitForWidget(page);
    expect(await pickFirstSlot(page)).toBeTruthy();
    await bookingScope(page, 'dialog').getByRole('button', { name: 'Continue' }).click();
    await bookingScope(page, 'dialog').getByLabel('Name').pressSequentially('Jordan Example');
    await bookingScope(page, 'dialog').getByLabel('Email').pressSequentially('jordan@example.com');

    const today = denverToday();
    const tomorrow = addDays(today, 1);
    await page.route('**/api/booking/slots**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'x-booking-mode': 'dry-run', 'cache-control': 'no-store' },
        body: JSON.stringify({
          tz: 'America/Denver',
          days: [
            { date: today, slots: [] },
            {
              date: tomorrow,
              slots: [{ start: `${tomorrow}T16:00:00-06:00`, end: `${tomorrow}T16:30:00-06:00` }],
            },
          ],
        }),
      });
    });
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await expect(bookingScope(page, 'dialog').locator('[data-booking-alert]')).toContainText('That time is no longer available');
    await expect(bookingScope(page, 'dialog').locator('[data-booking-state="form"]')).toHaveCount(0);
    await expect(bookingScope(page, 'dialog').getByRole('button', { name: 'Continue' })).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('link', { name: 'Email KCG' }).first()).toBeVisible();
    await page.unroute('**/api/booking/slots**');

    await page.route('**/api/booking/slots**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'x-booking-mode': 'dry-run', 'cache-control': 'no-store' },
        body: JSON.stringify({
          tz: 'America/Denver',
          days: [
            { date: today, slots: [] },
            { date: tomorrow, slots: [] },
          ],
        }),
      });
    });
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await expect(page.getByText('No times available in this date range.').first()).toBeVisible();
    await expect(bookingScope(page, 'dialog').getByRole('button', { name: 'Later dates' })).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('link', { name: 'Email KCG' }).first()).toBeVisible();
    await expect(bookingScope(page, 'dialog').locator('form')).toHaveCount(0);
    await page.unroute('**/api/booking/slots**');

    await page.getByRole('button', { name: 'Close modal' }).click();
    await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
    await waitForWidget(page);
    expect(await pickFirstSlot(page)).toBeTruthy();
    await bookingScope(page, 'dialog').getByRole('button', { name: 'Continue' }).click();
    await bookingScope(page, 'dialog').getByLabel('Name').pressSequentially('Jordan Example');
    await bookingScope(page, 'dialog').getByLabel('Email').pressSequentially('jordan@example.com');

    let bookCalls = 0;
    await page.route('**/api/booking/book', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      bookCalls += 1;
      await new Promise(() => undefined);
    });
    await bookingScope(page, 'dialog').getByRole('button', { name: 'Book this time' }).click();
    await expect(bookingScope(page, 'dialog').locator('[data-booking-alert]')).toContainText('Booking could not be confirmed', {
      timeout: 20_000,
    });
    expect(bookCalls).toBe(1);
    await expect(page.getByRole('dialog').getByRole('link', { name: 'Email KCG' }).first()).toBeVisible();
    scenarios.push({
      name: 'refresh-conflict-hanging-post',
      viewport: '1440x900',
      theme: 'light',
      ok: true,
      notes: 'lost selection returns to usable state; hanging POST times out once without retry',
      intercept: true,
    });
  });

  test('obsolete GET cannot replace a newer slots response', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await setThemeAndGoto(page, 'light');
    await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
    await waitForWidget(page);

    const today = denverToday();
    const tomorrow = addDays(today, 1);
    let held: ((value: void) => void) | undefined;
    const firstHold = new Promise<void>((resolve) => {
      held = resolve;
    });
    let seen = 0;
    await page.route('**/api/booking/slots**', async (route) => {
      seen += 1;
      if (seen === 1) {
        await firstHold;
        try {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: { 'x-booking-mode': 'dry-run' },
            body: JSON.stringify({
              tz: 'America/Denver',
              days: [
                { date: today, slots: [] },
                { date: tomorrow, slots: [] },
              ],
            }),
          });
        } catch {
          /* aborted superseded GET */
        }
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'x-booking-mode': 'dry-run' },
        body: JSON.stringify({
          tz: 'America/Denver',
          days: [
            { date: today, slots: [] },
            {
              date: tomorrow,
              slots: [{ start: `${tomorrow}T15:00:00-06:00`, end: `${tomorrow}T15:30:00-06:00` }],
            },
          ],
        }),
      });
    });
    await bookingScope(page, 'dialog').getByRole('button', { name: 'Later dates' }).click();
    await bookingScope(page, 'dialog').getByRole('button', { name: 'Previous dates' }).click();
    held?.();
    await expect(bookingScope(page, 'dialog').getByRole('radio').first()).toBeVisible();
    await expect(page.getByText('No times available in this date range.')).toHaveCount(0);
    scenarios.push({
      name: 'out-of-order-get',
      viewport: '1440x900',
      theme: 'light',
      ok: true,
      notes: 'superseded empty GET did not clobber newer slots',
      intercept: true,
    });
  });

  test('pre-submit GET cannot overwrite confirmation or submitting', async ({ page }) => {
    const emptyDays = () => {
      const today = denverToday();
      return {
        tz: 'America/Denver',
        days: [
          { date: today, slots: [] },
          { date: addDays(today, 1), slots: [] },
        ],
      };
    };

    const fillForm = async () => {
      await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
      await waitForWidget(page);
      expect(await pickFirstSlot(page)).toBeTruthy();
      await bookingScope(page, 'dialog').getByRole('button', { name: 'Continue' }).click();
      await bookingScope(page, 'dialog').getByLabel('Name').pressSequentially('Jordan Example');
      await bookingScope(page, 'dialog').getByLabel('Email').pressSequentially('jordan@example.com');
    };

    await page.setViewportSize({ width: 1440, height: 900 });
    await setThemeAndGoto(page, 'light');
    await fillForm();

    let releaseAfterConfirm: (() => void) | undefined;
    const holdAfterConfirm = new Promise<void>((resolve) => {
      releaseAfterConfirm = resolve;
    });
    await page.route('**/api/booking/slots**', async (route) => {
      await holdAfterConfirm;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'x-booking-mode': 'dry-run', 'cache-control': 'no-store' },
        body: JSON.stringify(emptyDays()),
      });
    });
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await bookingScope(page, 'dialog').getByRole('button', { name: 'Book this time' }).click();
    await expect(bookingScope(page, 'dialog').locator('[data-booking-state="confirm"]')).toBeVisible();
    await expect(page.getByText('Test complete. No booking was created.').first()).toBeVisible();
    releaseAfterConfirm?.();
    await expect(bookingScope(page, 'dialog').locator('[data-booking-state="confirm"]')).toBeVisible();
    await expect(page.getByText('That time is no longer available. Choose another.')).toHaveCount(0);
    await page.unroute('**/api/booking/slots**');
    await page.getByRole('button', { name: 'Close modal' }).click();

    await fillForm();
    let releaseDuringSubmit: (() => void) | undefined;
    const holdDuringSubmit = new Promise<void>((resolve) => {
      releaseDuringSubmit = resolve;
    });
    let releaseBook: (() => void) | undefined;
    const holdBook = new Promise<void>((resolve) => {
      releaseBook = resolve;
    });
    await page.route('**/api/booking/slots**', async (route) => {
      await holdDuringSubmit;
      try {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'x-booking-mode': 'dry-run', 'cache-control': 'no-store' },
          body: JSON.stringify(emptyDays()),
        });
      } catch {
        /* aborted by submit */
      }
    });
    await page.route('**/api/booking/book', async (route) => {
      if (route.request().method() !== 'POST') {
        await route.continue();
        return;
      }
      await holdBook;
      await route.continue();
    });
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await bookingScope(page, 'dialog').getByRole('button', { name: 'Book this time' }).click();
    await expect(bookingScope(page, 'dialog').locator('[data-booking-state="submitting"]')).toBeVisible();
    releaseDuringSubmit?.();
    await expect(bookingScope(page, 'dialog').locator('[data-booking-state="submitting"]')).toBeVisible();
    await expect(page.getByText('That time is no longer available. Choose another.')).toHaveCount(0);
    releaseBook?.();
    await expect(bookingScope(page, 'dialog').locator('[data-booking-state="confirm"]')).toBeVisible();
    await page.unroute('**/api/booking/slots**');
    await page.unroute('**/api/booking/book');
    await page.getByRole('button', { name: 'Close modal' }).click();

    await fillForm();
    let releaseError: (() => void) | undefined;
    const holdError = new Promise<void>((resolve) => {
      releaseError = resolve;
    });
    await page.route('**/api/booking/slots**', async (route) => {
      await holdError;
      try {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          headers: { 'x-booking-mode': 'dry-run', 'cache-control': 'no-store' },
          body: JSON.stringify({
            ok: false,
            error: { code: 'BOOKING_UNAVAILABLE', message: 'Online booking is unavailable.' },
          }),
        });
      } catch {
        /* aborted by submit */
      }
    });
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await bookingScope(page, 'dialog').getByRole('button', { name: 'Book this time' }).click();
    await expect(bookingScope(page, 'dialog').locator('[data-booking-state="confirm"]')).toBeVisible();
    releaseError?.();
    await expect(bookingScope(page, 'dialog').locator('[data-booking-state="confirm"]')).toBeVisible();
    await expect(bookingScope(page, 'dialog').locator('[data-booking-state="unavailable"]')).toHaveCount(0);
    await page.unroute('**/api/booking/slots**');

    scenarios.push({
      name: 'pre-submit-get-gated',
      viewport: '1440x900',
      theme: 'light',
      ok: true,
      notes: 'delayed GET success/error/empty released during submitting and after confirm did not overwrite',
      intercept: true,
    });
  });

  test('mobile header restore and sticky do not occlude focused fields', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await setThemeAndGoto(page, 'light');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const headerBook = page.locator('header').getByRole('button', { name: 'Book a Call' });
    await expect(headerBook).toBeVisible();
    await headerBook.click();
    await waitForWidget(page);
    await expect.poll(() => focusIsInDialog(page)).toBeTruthy();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Book a Call with Seth' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
    const restored = await page.evaluate(() => {
      const active = document.activeElement;
      return {
        tag: active?.tagName ?? '',
        label: active?.getAttribute('aria-label') ?? '',
        connected: Boolean(active instanceof HTMLElement && active.isConnected && active !== document.body),
      };
    });
    expect(restored.connected).toBeTruthy();
    expect(restored.label).toBe('Open menu');

    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
    await waitForWidget(page);
    expect(await pickFirstSlot(page)).toBeTruthy();
    await bookingScope(page, 'dialog').getByRole('button', { name: 'Continue' }).click();
    await expect(bookingScope(page, 'dialog').getByLabel('Name')).toBeFocused();
    await expect.poll(async () => focusedIsUnoccluded(page)).toBeTruthy();
    const occlusion = await stickyClearOfName(page, 'dialog');
    expect(occlusion.ok).toBeTruthy();
    expect(occlusion.centerIsInput).toBeTruthy();
    expect(occlusion.overlap).toBe(0);
    expect(occlusion.inputTop).toBeGreaterThanOrEqual(occlusion.stickyBottom);
    await bookingScope(page, 'dialog').getByRole('button', { name: 'Book this time' }).click();
    await expect(page.getByText('Enter your name (1 to 120 characters).')).toBeVisible();
    await expect.poll(async () => focusedIsUnoccluded(page)).toBeTruthy();
    scenarios.push({
      name: 'mobile-header-restore-sticky',
      viewport: '390x844',
      theme: 'light',
      ok: true,
      notes: 'header-scoped Book a Call restores to Open menu; focused Name is clear of sticky',
    });
  });

  test('booking CTAs and unchanged non-booking CTAs', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await setThemeAndGoto(page, 'light');

    const assertWidget = async (source: string) => {
      await waitForWidget(page);
      const title = await page.locator('#modal-title').innerText();
      ctaMatrix.push({
        source,
        viewport: '1440x900',
        title,
        widget: title === 'Book a Call with Seth',
        unchanged: false,
      });
      expect(title).toBe('Book a Call with Seth');
      await page.getByRole('button', { name: 'Close modal' }).click();
    };

    await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
    await assertWidget('desktop-header');

    await page.locator('section').first().getByRole('button', { name: 'Book a Call' }).click();
    await assertWidget('hero');

    await page.locator('#about').scrollIntoViewIfNeeded();
    await page.locator('#about').getByRole('button', { name: 'Book a Call' }).first().click();
    await assertWidget('team-seth');
    await page.locator('#about').getByRole('button', { name: 'Book a Call' }).last().click();
    await assertWidget('team-hunter');

    await page.locator('footer').getByRole('button', { name: 'E-commerce' }).click();
    await page
      .locator('.fixed.inset-0')
      .filter({ hasText: 'E-Commerce Payment Processing' })
      .getByRole('button', { name: 'Book a Call' })
      .click();
    await assertWidget('industry-splash');
    await page.locator('.fixed.inset-0').filter({ hasText: 'E-Commerce Payment Processing' }).getByRole('button', { name: 'Close' }).click();

    await page.goto('/services', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Book a Call' }).first().click();
    await assertWidget('services');

    await page.getByRole('button', { name: 'Talk through your site' }).click();
    await expect(page.locator('#modal-title')).toHaveText('Talk through your site');
    await expect(page.getByLabel('First Name')).toBeVisible();
    await expect(page.getByRole('dialog').locator('[data-booking-widget]')).toHaveCount(0);
    ctaMatrix.push({
      source: 'services-talk-through-site',
      viewport: '1440x900',
      title: 'Talk through your site',
      widget: false,
      unchanged: true,
    });
    await page.getByRole('button', { name: 'Close modal' }).click();

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Get a Free Profit Leak Analysis' }).first().click();
    await expect(page.locator('#modal-title')).toHaveText('Get a Free Profit Leak Analysis');
    await expect(page.getByLabel('Business Name')).toBeVisible();
    await expect(page.getByRole('dialog').locator('[data-booking-widget]')).toHaveCount(0);
    ctaMatrix.push({
      source: 'hero-profit-leak',
      viewport: '1440x900',
      theme: 'light',
      title: 'Get a Free Profit Leak Analysis',
      widget: false,
      unchanged: true,
    });
    await page.getByRole('button', { name: 'Close modal' }).click();

    await page.locator('footer').getByRole('button', { name: 'Contact Us' }).click();
    await expect(page.locator('#modal-title')).toHaveText('Contact Us');
    await expect(page.getByLabel('First Name')).toBeVisible();
    ctaMatrix.push({
      source: 'footer-contact-us',
      viewport: '1440x900',
      title: 'Contact Us',
      widget: false,
      unchanged: true,
    });
    await page.getByRole('button', { name: 'Close modal' }).click();

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.locator('header').getByRole('button', { name: 'Book a Call' }).click();
    await waitForWidget(page);
    ctaMatrix.push({
      source: 'mobile-header',
      viewport: '390x844',
      title: await page.locator('#modal-title').innerText(),
      widget: true,
      unchanged: false,
    });
    expect(await page.locator('#modal-title').innerText()).toBe('Book a Call with Seth');
    expect(googleWriteAttempts).toEqual([]);
  });

  test('homepage inline widget completes date, slot, submit, confirmation', async ({ page }) => {
    const errors = attachErrorCollectors(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await setThemeAndGoto(page, 'light');
    await expect(page.locator('#book-a-call')).toHaveCount(1);
    await page.locator('#book-a-call').scrollIntoViewIfNeeded();
    await waitForWidget(page, 'inline');
    const root = bookingScope(page, 'inline');
    await expect(root.locator('[data-booking-variant="inline"]')).toBeVisible();
    expect(await pickFirstSlot(page, 'inline')).toBeTruthy();
    await root.getByRole('button', { name: 'Continue' }).click();
    await expect(root.getByLabel('Name')).toBeFocused();
    await expect.poll(async () => focusedIsUnoccluded(page)).toBeTruthy();
    const occlusion = await stickyClearOfName(page, 'inline');
    expect(occlusion.ok).toBeTruthy();
    expect(occlusion.centerIsInput).toBeTruthy();
    expect(occlusion.overlap).toBe(0);
    await root.getByLabel('Name').pressSequentially('Jordan Example');
    await root.getByLabel('Email').pressSequentially('jordan@example.com');
    const safetyBefore = await readServerSafety(page);
    await root.getByRole('button', { name: 'Book this time' }).click();
    await expect(root.getByText('Test complete. No booking was created.').first()).toBeVisible();
    await expect(root.getByText('This was a test. No invitation was emailed.')).toBeVisible();
    const safetyAfter = await readServerSafety(page);
    expect(safetyAfter.insert).toBe(safetyBefore.insert);
    expect(safetyAfter.realWrites).toBe(0);
    expect(safetyAfter.realInvites).toBe(0);
    expect(safetyAfter.insertRequests).toBe(0);
    expect(errors.pageErrors).toEqual([]);
    expect(errors.consoleErrors).toEqual([]);
    expect(googleWriteAttempts).toEqual([]);
    scenarios.push({
      name: 'homepage-inline-flow',
      viewport: '1440x900',
      theme: 'light',
      ok: true,
      notes: 'inline date/slot/submit/confirm on /; dry-run; zero Google writes',
    });
  });

  for (const viewport of [
    { name: '1440x900', width: 1440, height: 900 },
    { name: '390x844', width: 390, height: 844 },
  ] as const) {
    for (const theme of ['light', 'dark'] as const) {
      test(`homepage ${viewport.name} ${theme} inline matrix`, async ({ page }) => {
        const errors = attachErrorCollectors(page);
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await setThemeAndGoto(page, theme);
        await page.locator('#book-a-call').scrollIntoViewIfNeeded();
        await waitForWidget(page, 'inline');
        const root = bookingScope(page, 'inline');
        expect(await pickFirstSlot(page, 'inline')).toBeTruthy();
        const file = `homepage-${viewport.width}-${theme}.png`;
        await page.locator('#book-a-call [data-booking-panel]').scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(SHOTS, file), fullPage: false });
        const doc = await overflowDelta(page);
        const panel = await overflowDelta(page, panelSelector('inline'));
        const scroller = await overflowDelta(page, widgetScrollSelector('inline'));
        const targets = await measureControls(page);
        const contrast = await measureContrast(page);
        const images = await inspectImages(page);
        const failedImages = images.filter((img) => img.failed);
        const undersized = targets.filter((item) => item.height > 0 && !item.pass44);
        assertContrast(contrast);
        expect(undersized, JSON.stringify(undersized)).toEqual([]);
        expect(failedImages, JSON.stringify(failedImages)).toEqual([]);
        expect(doc.delta).toBeLessThanOrEqual(0);
        expect(panel.delta).toBeLessThanOrEqual(0);
        expect(scroller.delta).toBeLessThanOrEqual(0);
        expect(panel.clientWidth).toBeLessThanOrEqual(viewport.width);

        await root.getByRole('button', { name: 'Continue' }).click();
        await expect(root.getByLabel('Name')).toBeFocused();
        await expect.poll(async () => focusedIsUnoccluded(page)).toBeTruthy();
        const occlusion = await stickyClearOfName(page, 'inline');
        expect(occlusion.ok).toBeTruthy();
        expect(occlusion.centerIsInput).toBeTruthy();
        expect(occlusion.overlap).toBe(0);
        measurements.push({
          name: file,
          viewport: viewport.name,
          theme,
          document: doc,
          panel,
          scroller,
          consoleErrors: errors.consoleErrors.length,
          pageErrors: errors.pageErrors.length,
          failedImages,
          targets,
          contrast,
          occlusion,
        });
        scenarios.push({
          name: `homepage-${viewport.name}-${theme}`,
          viewport: viewport.name,
          theme,
          ok:
            doc.delta <= 0 &&
            panel.delta <= 0 &&
            scroller.delta <= 0 &&
            errors.pageErrors.length === 0 &&
            failedImages.length === 0,
          notes: `undersized=${undersized.length} console=${errors.consoleErrors.length} panelWidth=${panel.clientWidth}`,
        });
        expect(errors.pageErrors, errors.pageErrors.join('\n')).toEqual([]);
        expect(errors.consoleErrors, errors.consoleErrors.join('\n')).toEqual([]);
        expect(googleWriteAttempts).toEqual([]);
      });
    }
  }

  test('homepage inline keyboard path is completable without a mouse', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await setThemeAndGoto(page, 'light');
    const bookLink = page.locator('nav[aria-label="Main navigation"]').getByRole('link', { name: 'Book' });
    await expect(bookLink).toBeVisible();
    await bookLink.focus();
    await page.keyboard.press('Enter');
    await waitForWidget(page, 'inline');
    const root = bookingScope(page, 'inline');
    await root.getByRole('button', { name: 'Previous dates' }).focus();

    let selected = false;
    for (let i = 0; i < 80; i += 1) {
      const focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLInputElement | null;
        return { tag: el?.tagName, type: el?.type, name: el?.name };
      });
      if (focused.type === 'radio' && focused.name?.startsWith('booking-slot')) {
        await page.keyboard.press('Space');
        selected = true;
        break;
      }
      await page.keyboard.press('Tab');
    }
    expect(selected).toBeTruthy();

    let continued = false;
    for (let i = 0; i < 80; i += 1) {
      const label = await page.evaluate(() => (document.activeElement?.textContent || '').replace(/\s+/g, ' ').trim());
      if (label === 'Continue') {
        await page.keyboard.press('Enter');
        continued = true;
        break;
      }
      await page.keyboard.press('Tab');
    }
    expect(continued).toBeTruthy();
    await expect(root.getByLabel('Name')).toBeFocused();
    expect(await focusedIsUnoccluded(page)).toBeTruthy();
    const occlusion = await stickyClearOfName(page, 'inline');
    expect(occlusion.ok).toBeTruthy();
    expect(occlusion.centerIsInput).toBeTruthy();
    expect(occlusion.overlap).toBe(0);
    await page.keyboard.type('Riley Visitor');
    await page.keyboard.press('Tab');
    await page.keyboard.type('riley.visitor@example.com');
    let submitted = false;
    for (let i = 0; i < 80; i += 1) {
      const label = await page.evaluate(() => (document.activeElement?.textContent || '').replace(/\s+/g, ' ').trim());
      if (label === 'Book this time') {
        expect(await focusedIsUnoccluded(page)).toBeTruthy();
        await page.keyboard.press('Enter');
        submitted = true;
        break;
      }
      await page.keyboard.press('Tab');
    }
    expect(submitted).toBeTruthy();
    await expect(root.getByText('Test complete. No booking was created.').first()).toBeVisible();
    expect(googleWriteAttempts).toEqual([]);
    scenarios.push({
      name: 'homepage-inline-keyboard',
      viewport: '1440x900',
      theme: 'light',
      ok: true,
      notes: 'nav Book hash, space-select slot, type, submit; no mouse clicks on the widget',
    });
  });
});
