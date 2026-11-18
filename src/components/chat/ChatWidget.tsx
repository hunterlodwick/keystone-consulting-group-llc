import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import "./chat-widget.css";
import { loopbackReviewShouldOpen } from "./review-open";
import {
  DISCLOSURE,
  modeLabelForStatus,
  transcriptNotice,
  type WidgetDisclosureSurface,
} from "./disclosure";

type Citation = { id: string; label: string; href: string };
type Reply = {
  status: string;
  answer: string;
  citations: Citation[];
  notices: string[];
  followUpQuestion: string | null;
  mode?: string;
  reason?: string;
  contentVersion?: string;
};
type Message = { id: string; role: "user" | "assistant"; text: string; reply?: Reply; local?: boolean };
type ChecklistItem = { id: string; title: string; detail: string; href: string; label: string };
type ChecklistResult = { title: string; summary: string; items: ChecklistItem[]; citations: Citation[] };
type Answers = {
  shop: "restaurant" | "retail" | "trade" | "professional" | "other" | "";
  leak: "processing" | "website" | "missed-calls" | "ai-ops" | "not-sure" | "";
  volume: "under-20k" | "20-100k" | "over-100k" | "not-sure" | "";
  google: "yes" | "weak" | "no" | "not-sure" | "";
  intake: "owner" | "staff" | "nobody" | "mixed" | "";
};

const INVITE_KEY = "kcg-shop-checklist-invite-dismissed-v1";
const INVITE_DELAY_MS = 4000;
const INVITE_MQ = "(max-width: 767px)";
const MAX_CHARS = 1500;
const CLIENT_CHAT_TIMEOUT_MS = 28_000;
const INTERNAL = new Set(["/dashboard"]);

const NEED_STARTERS = [
  { id: "payments", label: "Take payments", question: "Take payments" },
  { id: "leads", label: "Get more leads", question: "Get more leads" },
  { id: "admin", label: "Save time on admin", question: "Save time on admin" },
] as const;

const WELCOME =
  "Tell us what you need help with. Ask anything, or pick one of the short options below.";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function readInviteDismissed(): boolean {
  try {
    return window.localStorage.getItem(INVITE_KEY) === "1";
  } catch {
    return false;
  }
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M4 5h16v10H9l-5 4V5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const noopSubscribe = () => () => {};

export function ChatWidget() {
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!isClient) return null;
  return createPortal(<ChatPanel />, document.body);
}

function ChatPanel() {
  const [path, setPath] = useState(() => window.location.pathname);
  const hiddenRoute = INTERNAL.has(path);
  const [open, setOpen] = useState(() => {
    if (INTERNAL.has(window.location.pathname)) return false;
    if (loopbackReviewShouldOpen(window.location.hostname, window.location.search)) return true;
    return false;
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [nearFooter, setNearFooter] = useState(false);
  const [side, setSide] = useState<"right" | "left">("right");
  const [bothSidesBlocked, setBothSidesBlocked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(() => window.matchMedia(INVITE_MQ).matches);
  const [inviteArmed, setInviteArmed] = useState(false);
  const [inviteDismissed, setInviteDismissed] = useState(readInviteDismissed);
  const [keyboardLikely, setKeyboardLikely] = useState(false);
  const [pageInputFocused, setPageInputFocused] = useState(false);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [modeLabel, setModeLabel] = useState(DISCLOSURE.loadingMode);
  const [flow, setFlow] = useState<"qa" | "checklist">("qa");
  const [answers, setAnswers] = useState<Answers>({ shop: "", leak: "", volume: "", google: "", intake: "" });
  const [checklist, setChecklist] = useState<ChecklistResult | null>(null);
  const [statusKnown, setStatusKnown] = useState(false);
  const [hostedAvailable, setHostedAvailable] = useState(false);
  const [leadAvailable, setLeadAvailable] = useState(false);
  const [processorConsent, setProcessorConsent] = useState(false);
  const [startersVisible, setStartersVisible] = useState(true);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const titleId = useId();
  const inputId = useId();

  useEffect(() => {
    const syncPath = () => setPath(window.location.pathname);
    window.addEventListener("popstate", syncPath);
    document.addEventListener("click", syncPath);
    const id = window.setInterval(syncPath, 500);
    return () => {
      window.removeEventListener("popstate", syncPath);
      document.removeEventListener("click", syncPath);
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    fetch("/api/widget/status")
      .then((r) => r.json())
      .then((d) => {
        setStatusKnown(true);
        setHostedAvailable(d.hosted?.available === true);
        setLeadAvailable(d.leadDelivery === true);
        setModeLabel(modeLabelForStatus(d));
      })
      .catch(() => {
        setStatusKnown(true);
        setModeLabel(DISCLOSURE.extractive);
      });
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(INVITE_MQ);
    const sync = () => setIsNarrow(mq.matches);
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (inviteDismissed || hiddenRoute) return;
    if (!window.matchMedia(INVITE_MQ).matches) return;
    const t = window.setTimeout(() => setInviteArmed(true), INVITE_DELAY_MS);
    return () => window.clearTimeout(t);
  }, [inviteDismissed, hiddenRoute]);

  useEffect(() => {
    const onResize = () => {
      const vv = window.visualViewport;
      if (!vv) {
        setKeyboardLikely(false);
        return;
      }
      const active = document.activeElement;
      const typing =
        active instanceof HTMLElement &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          active.isContentEditable);
      setKeyboardLikely(typing && window.innerHeight - vv.height > 120);
      setViewportHeight(vv.height);
    };
    window.visualViewport?.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("scroll", onResize);
    const t = window.setTimeout(onResize, 0);
    return () => {
      window.clearTimeout(t);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("scroll", onResize);
    };
  }, []);

  useEffect(() => {
    const isPageField = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      if (target.closest(".kcg-chat")) return false;
      const tag = target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      return target.isContentEditable;
    };
    const onFocusIn = (e: FocusEvent) => {
      if (isPageField(e.target)) setPageInputFocused(true);
    };
    const onFocusOut = () => {
      requestAnimationFrame(() => setPageInputFocused(isPageField(document.activeElement)));
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, pending, open, checklist, flow]);

  useEffect(() => {
    const footerOccupiesBand = () => {
      const footer = document.querySelector("footer");
      if (!footer) {
        setNearFooter(false);
        return;
      }
      const r = footer.getBoundingClientRect();
      const scrolled = window.scrollY > 80;
      const inBand = r.top < window.innerHeight - 48 && r.bottom > 0;
      setNearFooter(scrolled && inBand);
    };
    footerOccupiesBand();
    let io: IntersectionObserver | null = null;
    const footer = document.querySelector("footer");
    if (footer && "IntersectionObserver" in window) {
      io = new IntersectionObserver(() => footerOccupiesBand(), { rootMargin: "0px 0px 40px 0px" });
      io.observe(footer);
    }
    const watchChrome = () => {
      setMenuOpen(Boolean(document.querySelector('header button[aria-label="Close menu"]')));
      const dialogs = [...document.querySelectorAll('[role="dialog"]')].filter((el) => !el.closest(".kcg-chat"));
      setModalOpen(dialogs.some((el) => (el as HTMLElement).offsetParent !== null || el.getClientRects().length));
      footerOccupiesBand();
    };
    watchChrome();
    const mo = new MutationObserver(watchChrome);
    mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-label", "class", "hidden"] });

    let frame = 0;
    const pickSide = () => {
      const launcher = launcherRef.current;
      if (!launcher || open) {
        setSide("right");
        setBothSidesBlocked(false);
        return;
      }
      const gap = 16;
      const w = Math.max(launcher.offsetWidth, 48);
      const h = Math.max(launcher.offsetHeight, 48);
      const bottom = Math.max(16, Number.parseFloat(getComputedStyle(launcher).bottom) || 16);
      const rectFor = (s: "right" | "left") => {
        const left = s === "left" ? gap : window.innerWidth - gap - w;
        return { left, right: left + w, top: window.innerHeight - bottom - h, bottom: window.innerHeight - bottom };
      };
      const blocked = (box: { left: number; right: number; top: number; bottom: number }) => {
        for (const el of document.querySelectorAll("a,button,input,textarea,select,[role='button']")) {
          if (el === launcher || el.closest(".kcg-chat") || el.closest(".mobile-sticky-cta")) continue;
          const pos = getComputedStyle(el).position;
          if (pos !== "fixed" && pos !== "sticky") continue;
          const r = el.getBoundingClientRect();
          if (r.width < 24 || r.height < 24) continue;
          if (r.bottom < 0 || r.top > window.innerHeight) continue;
          const ox = Math.max(0, Math.min(r.right, box.right) - Math.max(r.left, box.left));
          const oy = Math.max(0, Math.min(r.bottom, box.bottom) - Math.max(r.top, box.top));
          if (ox * oy >= 120) return true;
        }
        return false;
      };
      const rightBlocked = blocked(rectFor("right"));
      const leftBlocked = blocked(rectFor("left"));
      setBothSidesBlocked(rightBlocked && leftBlocked);
      if (rightBlocked && !leftBlocked) setSide("left");
      else setSide("right");
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        footerOccupiesBand();
        pickSide();
      });
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      io?.disconnect();
      mo.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [open]);

  const rememberInvite = useCallback(() => {
    setInviteDismissed(true);
    setInviteArmed(false);
    try {
      window.localStorage.setItem(INVITE_KEY, "1");
    } catch {
      /* keep in-page dismissal */
    }
  }, []);

  const openPanel = useCallback(() => {
    rememberInvite();
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }, [rememberInvite]);

  const close = useCallback(() => {
    setOpen(false);
    abortRef.current?.abort();
    requestAnimationFrame(() => launcherRef.current?.focus());
  }, []);

  useEffect(() => {
    const onOpen = () => openPanel();
    window.addEventListener("kcg-open-chat", onOpen);
    return () => window.removeEventListener("kcg-open-chat", onOpen);
  }, [openPanel]);

  const showLauncher = !hiddenRoute && !open && !nearFooter && !menuOpen && !modalOpen;
  const showInvite =
    !hiddenRoute && inviteArmed && !inviteDismissed && isNarrow && showLauncher && !pageInputFocused && !keyboardLikely;

  useEffect(() => {
    if (!open && !showInvite) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (open) {
        e.stopPropagation();
        close();
        return;
      }
      if (showInvite) {
        e.stopPropagation();
        rememberInvite();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close, showInvite, rememberInvite]);

  function pushLocal(text: string) {
    setMessages((m) => [...m, { id: uid(), role: "assistant", text, local: true }]);
  }

  async function ask(text: string) {
    const question = text.trim().slice(0, MAX_CHARS);
    if (!question || pending) return;
    setStartersVisible(false);
    const userMsg: Message = { id: uid(), role: "user", text: question };
    const history = messages
      .filter((m) => !m.local)
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.text.slice(0, 600) }));
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setPending(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, CLIENT_CHAT_TIMEOUT_MS);
    let reply: Reply;
    try {
      const res = await fetch("/api/widget/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question, history, processorConsent: hostedAvailable && processorConsent }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        reply = {
          status: "error",
          answer: data?.message ?? "Something went wrong. You can retry, or read the public service pages.",
          citations: [],
          notices: [],
          followUpQuestion: null,
          reason: data?.code ?? "http_error",
        };
      } else if (!data || typeof data.answer !== "string") {
        reply = {
          status: "error",
          answer: "The assistant did not return a usable answer. You can retry, or read the public service pages.",
          citations: [],
          notices: [],
          followUpQuestion: null,
          reason: "client_empty",
        };
      } else reply = data as Reply;
    } catch {
      reply = {
        status: "unavailable",
        answer: timedOut
          ? "The assistant took too long. You can retry, or ask again and I will keep this to the public pages."
          : "The assistant is temporarily unavailable. The public pages still have the same information.",
        citations: [],
        notices: [],
        followUpQuestion: null,
        reason: timedOut ? "client_timeout" : "client_network",
      };
    } finally {
      window.clearTimeout(timeout);
      setPending(false);
      abortRef.current = null;
    }
    setMessages((m) => [...m, { id: uid(), role: "assistant", text: reply.answer, reply }]);
    if (reply.mode === "llama3-loopback") setModeLabel(DISCLOSURE.localLlama("llama3"));
    else if (reply.mode === "extractive") setModeLabel(DISCLOSURE.extractive);
    else if (reply.mode === "openai-responses") setModeLabel("");
  }

  async function makeChecklist() {
    if (!answers.shop || !answers.leak || pending) return;
    setPending(true);
    try {
      const res = await fetch("/api/widget/checklist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) {
        pushLocal(data?.message ?? "Could not build the checklist. Retry after choosing a shop type and leak.");
        return;
      }
      setChecklist(data);
      setFlow("qa");
      setMessages((m) => [
        ...m,
        { id: uid(), role: "assistant", text: `${data.title}. ${data.summary}`, local: true },
      ]);
    } catch {
      pushLocal("The checklist is unavailable. You can still browse the service pages or contact KCG.");
    } finally {
      setPending(false);
    }
  }

  const disclosureSurface: WidgetDisclosureSurface =
    statusKnown ? hostedAvailable ? "hosted" : "local" : "unknown";
  const footNotice = transcriptNotice(disclosureSurface, processorConsent);

  if (hiddenRoute) return null;

  return (
    <div
      className="kcg-chat"
      data-open={open ? "true" : "false"}
      data-side={side}
      data-review={loopbackReviewShouldOpen(typeof window === "undefined" ? "" : window.location.hostname, typeof window === "undefined" ? "" : window.location.search) ? "checklist" : undefined}
    >
      {showInvite ? (
        <div className="kcg-chat-invite" role="status" data-side={side} data-testid="chat-invite">
          <div>
            <p className="kcg-chat-invite-title">Shop Leak Checklist</p>
            <p className="kcg-chat-invite-body">Answer a few questions. Get a checklist for your shop from what we publish here.</p>
            <button type="button" className="kcg-chat-invite-cta" data-testid="chat-invite-cta" onClick={openPanel}>
              Build the checklist
            </button>
          </div>
          <button
            type="button"
            className="kcg-chat-invite-dismiss"
            aria-label="Dismiss checklist invitation"
            data-testid="chat-invite-dismiss"
            onClick={rememberInvite}
          >
            <CloseIcon />
          </button>
        </div>
      ) : null}

      <button
        ref={launcherRef}
        type="button"
        className="kcg-chat-launcher"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="kcg-chat-panel"
        aria-label="Ask KCG"
        data-testid="chat-launcher"
        data-hidden={showLauncher ? "false" : "true"}
        data-lifted={bothSidesBlocked ? "true" : "false"}
        data-side={side}
        tabIndex={showLauncher ? 0 : -1}
        aria-hidden={!showLauncher}
        onClick={openPanel}
      >
        <ChatIcon />
        <span>Ask KCG</span>
      </button>

      {open ? (
        <section
          id="kcg-chat-panel"
          className="kcg-chat-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          style={isNarrow && viewportHeight ? { ["--kcg-vvh" as string]: `${viewportHeight}px` } : undefined}
        >
          <header className="kcg-chat-head">
            <div>
              <h2 id={titleId} className="kcg-chat-title">
                Ask KCG
              </h2>
              <p className="kcg-chat-sub">Answers from this website. Not a live person.</p>
            </div>
            <button type="button" className="kcg-chat-close" onClick={close} aria-label="Close chat">
              <CloseIcon />
            </button>
          </header>

          <div className="kcg-chat-log" ref={logRef} aria-live="polite" aria-busy={pending}>
            {messages.length === 0 && startersVisible ? (
              <div className="kcg-chat-welcome" data-testid="chat-welcome">
                <p>{WELCOME}</p>
                <div className="kcg-chat-chips">
                  {NEED_STARTERS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      className="kcg-chat-chip"
                      data-testid={`starter-${s.id}`}
                      data-starter={s.label}
                      onClick={() => ask(s.question)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="kcg-chat-msg kcg-chat-msg--user">
                  <p>{m.text}</p>
                </div>
              ) : (
                <div key={m.id} className={`kcg-chat-msg kcg-chat-msg--bot kcg-status-${m.reply?.status ?? "answered"}`}>
                  {m.reply && m.reply.status !== "answered" ? (
                    <p className="kcg-chat-status">{statusLabel(m.reply.status)}</p>
                  ) : null}
                  <p>{m.text}</p>
                  {m.reply?.notices.map((n) => (
                    <p key={n} className="kcg-chat-notice">
                      {n}
                    </p>
                  ))}
                  {m.reply?.followUpQuestion ? <p className="kcg-chat-follow">{m.reply.followUpQuestion}</p> : null}
                  {m.reply?.citations?.length ? (
                    <p className="kcg-chat-cite">
                      {m.reply.citations.map((c) => (
                        <a key={c.id} href={c.href}>
                          {c.label}
                        </a>
                      ))}
                    </p>
                  ) : null}
                </div>
              ),
            )}

            {checklist ? (
              <div className="kcg-chat-msg kcg-chat-msg--bot" data-testid="checklist-result">
                <p>
                  <strong>{checklist.title}</strong>
                </p>
                <p>{checklist.summary}</p>
                <ol>
                  {checklist.items.map((item) => (
                    <li key={item.id}>
                      <a href={item.href}>{item.title}</a>
                      <div>{item.detail}</div>
                    </li>
                  ))}
                </ol>
                <a className="kcg-chat-chip" href="/#contact">Contact KCG</a>
                {!leadAvailable ? <p>Follow-up submission is unavailable here. Use the contact links to reach KCG.</p> : null}
              </div>
            ) : null}

            {flow === "checklist" ? (
              <div className="kcg-chat-review" data-testid="checklist-flow">
                <p>No contact details needed for the list.</p>
                <label>
                  What kind of shop?
                  <select
                    value={answers.shop}
                    onChange={(e) => setAnswers({ ...answers, shop: e.target.value as Answers["shop"] })}
                  >
                    <option value="">Choose one</option>
                    <option value="restaurant">Restaurant or food</option>
                    <option value="retail">Retail</option>
                    <option value="trade">Trade or field crew</option>
                    <option value="professional">Professional service</option>
                    <option value="other">Other</option>
                  </select>
                </label>
                <label>
                  What leaks first?
                  <select
                    value={answers.leak}
                    onChange={(e) => setAnswers({ ...answers, leak: e.target.value as Answers["leak"] })}
                  >
                    <option value="">Choose one</option>
                    <option value="processing">Card processing fees</option>
                    <option value="website">Website not converting</option>
                    <option value="missed-calls">Missed calls or follow-up</option>
                    <option value="ai-ops">Repeat work for an AI agent</option>
                    <option value="not-sure">Not sure</option>
                  </select>
                </label>
                {answers.leak === "processing" ? (
                  <label>
                    Monthly card volume
                    <select
                      value={answers.volume}
                      onChange={(e) => setAnswers({ ...answers, volume: e.target.value as Answers["volume"] })}
                    >
                      <option value="">Choose one</option>
                      <option value="under-20k">Under $20k</option>
                      <option value="20-100k">$20k to $100k</option>
                      <option value="over-100k">Over $100k</option>
                      <option value="not-sure">Not sure</option>
                    </select>
                  </label>
                ) : null}
                <label>
                  Google listing
                  <select
                    value={answers.google}
                    onChange={(e) => setAnswers({ ...answers, google: e.target.value as Answers["google"] })}
                  >
                    <option value="">Choose one</option>
                    <option value="yes">Accurate and complete</option>
                    <option value="weak">Thin or outdated</option>
                    <option value="no">Missing or unused</option>
                    <option value="not-sure">Not sure</option>
                  </select>
                </label>
                <label>
                  Who catches a new enquiry?
                  <select
                    value={answers.intake}
                    onChange={(e) => setAnswers({ ...answers, intake: e.target.value as Answers["intake"] })}
                  >
                    <option value="">Choose one</option>
                    <option value="owner">The owner</option>
                    <option value="staff">Staff</option>
                    <option value="nobody">Often nobody</option>
                    <option value="mixed">It depends</option>
                  </select>
                </label>
                <div className="kcg-chat-chips" style={{ marginTop: 12 }}>
                  <button type="button" className="kcg-chat-chip" data-testid="build-checklist" onClick={makeChecklist}>
                    Build the list
                  </button>
                  <button type="button" className="kcg-chat-chip kcg-chat-chip--plain" onClick={() => setFlow("qa")}>
                    Back to questions
                  </button>
                </div>
              </div>
            ) : null}

            <LeadFollowUp available={leadAvailable} />

            {pending ? (
              <div className="kcg-chat-msg kcg-chat-msg--bot">
                <p>One moment...</p>
                <button type="button" className="kcg-chat-chip kcg-chat-chip--plain" onClick={() => abortRef.current?.abort()}>
                  Stop
                </button>
              </div>
            ) : null}
          </div>

          {hostedAvailable ? <div className="kcg-chat-processor" data-testid="hosted-controls">
            <label className="kcg-chat-consent kcg-chat-consent--compact"><input type="checkbox" data-testid="hosted-consent" checked={processorConsent}
              onChange={e => { setProcessorConsent(e.target.checked); if (!e.target.checked) abortRef.current?.abort(); }} />
              Allow OpenAI to select approved passages using this message and recent eligible chat messages.</label>
            <details className="kcg-chat-processor-details"><summary>Processing details</summary><p>OpenAI is a separate processor. Only bounded, redacted user messages and approved public excerpts are sent, with storage disabled. Keep private details out of chat. Uncheck to stop future hosted requests; messages already sent cannot be recalled. Site answers remain available.</p></details>
          </div> : null}
          <form
            className="kcg-chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <label htmlFor={inputId} className="kcg-sr-only">
              Your question
            </label>
            <textarea
              id={inputId}
              ref={inputRef}
              className="kcg-chat-input"
              rows={2}
              maxLength={MAX_CHARS}
              value={input}
              placeholder="Type a question anytime"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }}
            />
            <button type="submit" className="kcg-chat-send" disabled={pending || !input.trim()} aria-label="Send">
              Send
            </button>
          </form>
          <p className="kcg-chat-foot" data-testid="chat-footer" data-surface={disclosureSurface}>
            {modeLabel ? (
              <>
                {modeLabel}{" "}
              </>
            ) : null}
            {footNotice ? (
              <>
                <span data-testid="chat-transcript-notice">{footNotice}</span>{" "}
              </>
            ) : null}
            <a href="/privacy">Privacy</a>{" · "}<a href="/#contact">Contact KCG</a>
            {flow === "qa" ? (
              <>
                {" "}
                <button type="button" className="kcg-chat-foot-link" data-testid="start-checklist" onClick={() => setFlow("checklist")}>
                  Checklist
                </button>
              </>
            ) : null}
            {messages.length ? (
              <>
                {" "}
                <button
                  type="button"
                  className="kcg-chat-foot-link"
                  onClick={() => {
                    abortRef.current?.abort();
                    setProcessorConsent(false);
                    setMessages([]);
                    setChecklist(null);
                    setStartersVisible(true);
                  }}
                >
                  Clear chat
                </button>
              </>
            ) : null}
          </p>
        </section>
      ) : null}
    </div>
  );
}

function statusLabel(s: string): string {
  switch (s) {
    case "partial":
      return "Partly answered";
    case "clarify":
      return "Needs a change";
    case "abstained":
      return "Not on the published site";
    case "unavailable":
      return "Assistant unavailable";
    case "invalid_output":
      return "No reliable answer";
    case "error":
      return "Could not answer";
    default:
      return "";
  }
}


type ContactFields = { name: string; email: string; phone: string; company: string; message: string };
const EMPTY_CONTACT: ContactFields = { name: '', email: '', phone: '', company: '', message: '' };
/** Separate form state; no conversation content is copied into the lead payload. */
function LeadFollowUp({available}: {available: boolean}) {
  const [expanded, setExpanded] = useState(false);
  const [fields, setFields] = useState<ContactFields>({...EMPTY_CONTACT});
  const [reviewed, setReviewed] = useState(false);
  const [consent, setConsent] = useState(false);
  const [submissionId, setSubmissionId] = useState('');
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const locked = useRef(false);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => () => abort.current?.abort(), []);
  if (!available) return null;
  async function submit() {
    if (!reviewed || !consent || locked.current) return;
    locked.current = true;
    setAttempted(true); setBusy(true);
    const controller = new AbortController(); abort.current = controller;
    const timer = window.setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch('/api/widget/lead', {method:'POST',headers:{'content-type':'application/json'},signal:controller.signal,
        body:JSON.stringify({submissionId,fields,reviewed:true,consent:true})});
      const data = await res.json();
      setNotice(data.status === 'accepted' ? 'Web3Forms accepted your request for KCG. Inbox delivery is not confirmed.' :
        data.status === 'pending' || data.status === 'unknown' ? 'Acceptance is unconfirmed. Do not resubmit; use the contact links to check with KCG.' :
        'The request was not accepted. Use the contact links to reach KCG.');
    } catch { setNotice('Acceptance is unconfirmed. Do not resubmit; use the contact links to check with KCG.'); }
    finally { window.clearTimeout(timer); setBusy(false); abort.current = null; setFields({...EMPTY_CONTACT}); }
  }
  return <div className="kcg-chat-review" data-testid="lead-controls">
    <button type="button" className="kcg-chat-chip" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>Contact KCG with reviewed details</button>
    {expanded ? <form onSubmit={e => { e.preventDefault(); if (reviewed) void submit(); else {
      setReviewed(true); setConsent(false); setSubmissionId(`${Date.now()}.${crypto.randomUUID()}`);
    } }}>
      <p>Send only the fields below to KCG through Web3Forms. No chat transcript or checklist is attached. OpenAI consent is separate.</p>
      {!attempted ? <>
        {(['name','email','phone','company','message'] as const).map(key => <label key={key}>
          {key.charAt(0).toUpperCase() + key.slice(1)}{key === 'phone' || key === 'company' ? ' (optional)' : ''}
          <input data-testid={`lead-${key}`} name={key} type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
            required={key === 'name' || key === 'email' || key === 'message'} readOnly={reviewed} value={fields[key]}
            maxLength={{name:100,email:254,phone:32,company:120,message:1500}[key]}
            onChange={e => {setFields({...fields,[key]:e.target.value});setReviewed(false);setConsent(false);}} />
        </label>)}
        {reviewed ? <>
          <p data-testid="lead-review">Review these exact named fields before sending.</p>
          <label className="kcg-chat-consent"><input type="checkbox" data-testid="lead-consent" checked={consent} onChange={e => setConsent(e.target.checked)} />
            I reviewed these fields and consent to sending them to KCG through Web3Forms for follow-up.</label>
          <p>Uncheck to revoke before sending. After sending, use the contact links to request withdrawal; delivery cannot be recalled.</p>
          <button type="button" className="kcg-chat-chip" onClick={() => {setReviewed(false);setConsent(false);}}>Edit details</button>
          <button type="submit" className="kcg-chat-chip" data-testid="lead-submit" disabled={!consent || busy}>Send reviewed details</button>
        </> : <button type="submit" className="kcg-chat-chip" data-testid="lead-review-button">Review details</button>}
      </> : <p role="status" data-testid="lead-status">{busy ? 'Submitting reviewed fields…' : notice}</p>}
      <a href="/#contact">Contact KCG</a>
    </form> : null}
  </div>;
}
