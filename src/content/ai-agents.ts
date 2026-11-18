export type AgentSource = { label: string; url: string };

export type ConnectorMode = 'native' | 'scoped' | 'manual_export';

export type AgentConnector = {
  name: string;
  mode: ConnectorMode;
  timeRework: string;
  input: string;
  output: string;
};

export type AgentScenario = {
  title: string;
  industry: string;
  problem: string;
  input: string;
  draft: string;
  humanDecision: string;
  businessBenefit: string;
};

export type AgentPage = {
  id: string;
  path: string;
  name: string;
  maker: string;
  eyebrow: string;
  jobLine: string;
  title: string;
  description: string;
  markSrc: string;
  markAlt: string;
  markException?: string;
  ownerRequests: string[];
  configures: string[];
  takeaways: string[];
  onboarding: string[];
  deliverables: string[];
  connectors: AgentConnector[];
  connectorCaveat: string;
  scenarios: AgentScenario[];
  fit: string[];
  poorFit: string[];
  pilotMeasurement: string[];
  why: string;
  limits: string[];
  reviewer: string;
  cta: string;
  sources: AgentSource[];
};

export const CONNECTOR_MODE_LABEL: Record<ConnectorMode, string> = {
  native: 'Native connector',
  scoped: 'Scoped integration',
  manual_export: 'Manual export',
};

export const AI_HUB_PATH = '/services/ai-agents';

export const AI_HUB = {
  path: AI_HUB_PATH,
  title: 'Virtual Assistants for Ongoing Jobs',
  description:
    'KCG configures named virtual assistants that keep doing a real job in the apps you already run: sales follow-up, customer service, scheduling, and ops. You keep a named reviewer before irreversible sends, publishes, or spend. These are not a Slack product and not a one-off demo script.',
};

export const AI_AGENTS: AgentPage[] = [
  {
    id: 'openai-dot',
    path: '/services/openai-dot',
    name: 'dots',
    maker: 'OpenAI',
    eyebrow: 'Always-on follow-through',
    jobLine: 'Keeps chasing open work across connected apps until a named person decides.',
    title: 'OpenAI dots for Always-On Follow-Through',
    description:
      'A dot is an always-on assistant in ChatGPT with its own cloud computer and the apps you choose to connect. It keeps working between conversations, prepares the next packet, and stops for your rules before money moves or messages leave draft.',
    markSrc: '/images/agents/openai-dots-mark.svg',
    markAlt: 'Official OpenAI dots product mark',
    ownerRequests: [
      'Find the last email with the approved quote and show me the original thread.',
      'Draft the follow-up in my voice from the samples I already approved.',
      'Prepare the send, then wait. Asking for a draft does not authorize sending.',
      'Read tomorrow\'s calendar and flag the visit that still has an open decision.',
      'Where CRM write is not connected, prepare a next-action note I can paste with owner and due date.',
    ],
    configures: [
      'Eligible ChatGPT access checks and dots setup where your plan and market support it',
      'Connected apps limited to the systems your reviewer names, with permissions reviewed before connect',
      'Custom rules for ask before action, act if pre-approved, or hand off on money, outbound messages, and credential changes',
      'Scheduled checks that surface open sales, service, scheduling, or ops exceptions for a named owner',
      'A written handoff so your team knows where Activity View lives and how to pause the dot',
    ],
    takeaways: [
      'One named dot tied to an eligible ChatGPT account your business controls',
      'App connections and custom rules documented for the reviewer',
      'A short runbook covering pause and delete',
      'A first live workflow scoped to ongoing follow-through, not unsupervised spend',
    ],
    onboarding: [
      'Confirm plan eligibility and whether a personal or business-managed account owns the dot',
      'Name the reviewer and the irreversible actions that always need approval',
      'Connect only the apps required for the first ongoing job',
      'Write custom rules for ask / act / hand off, then walk one dry-run end to end',
      'Record where Activity View lives and how to pause the dot',
    ],
    deliverables: [
      'Setup notes for the named account and connected apps',
      'Custom-rule sheet for money movement, outbound messages, and credential changes',
      'One taught follow-through workflow with a dry-run transcript',
      'Pause and delete runbook for the owner',
    ],
    connectors: [
      {
        name: 'Personal email (connected account)',
        mode: 'native',
        timeRework: 'Stops rebuilding quote history from memory when a buyer pings again.',
        input: 'Connected personal email the reviewer authorizes for the job.',
        output: 'Located thread, quote attachment, and a follow-up draft. Sending waits for approval. At launch a dot does not get its own standalone email address.',
      },
      {
        name: 'Slack or Microsoft Teams (reach)',
        mode: 'native',
        timeRework: 'Puts the exception packet where the owner already checks messages, instead of another private notebook.',
        input: 'Open work the dot tracked plus the channel or person who should decide.',
        output: 'A reviewable update or handoff in Slack or Teams. Reach is not the same as permission to change records or send customer email.',
      },
      {
        name: 'Plugin ecosystem apps',
        mode: 'scoped',
        timeRework: 'Cuts tab-hopping when a supported plugin can read the system the job needs.',
        input: 'Only the plugins and permissions the reviewer names for the first workflow.',
        output: 'Research, drafts, or updates allowed by that plugin. Read permission does not include change or send. OpenAI markets a large plugin ecosystem; KCG only claims apps you actually connect and test.',
      },
      {
        name: 'CRM or specialty ops tools without a live write path',
        mode: 'manual_export',
        timeRework: 'Keeps the next action from dying in chat even when the CRM cannot be written directly.',
        input: 'What happened, who owns it, and when it is due.',
        output: 'A paste-ready next-action note or import sheet. The owner or staff logs it in the CRM you already use.',
      },
    ],
    connectorCaveat:
      'Dots can research, draft, and keep scheduled checks running, but permission to read is not permission to change or send. Asking for a draft does not authorize sending it. KCG does not invent equal send or CRM-write ability across every app you name.',
    scenarios: [
      {
        title: 'Approved quote buried in email',
        industry: 'HVAC / home services',
        problem: 'A homeowner replies "send the quote again" and the office burns twenty minutes hunting the approved version.',
        input: 'Connected personal email plus the customer name and approximate date.',
        draft: 'Original approved quote thread surfaced with a short follow-up draft in the owner\'s voice samples.',
        humanDecision: 'Reviewer confirms it is the right version, edits the draft, then approves send on the connected account. The dot does not send alone.',
        businessBenefit: 'Follow-up starts from the real approved quote, not a reconstructed guess.',
      },
      {
        title: 'Missed invoice after delivery',
        industry: 'Wholesale / light manufacturing',
        problem: 'Work shipped, but the invoice never left draft because nobody rebuilt the context.',
        input: 'Connected work and email context that shows completed delivery without a sent invoice.',
        draft: 'Prepared invoice draft with open line items and customer reference.',
        humanDecision: 'Reviewer checks amounts and customer details, then approves send. Money movement stays human.',
        businessBenefit: 'Billing follow-through stays behind a named person, matching OpenAI guidance to review consequential work.',
      },
      {
        title: 'Open decision before tomorrow\'s visit',
        industry: 'Field service / contracting',
        problem: 'A site visit is on the calendar, but the change-order decision is still open.',
        input: 'Connected calendar and email context for the visit, plus the open thread.',
        draft: 'Short packet: visit time, open items, and a customer reply sitting in draft.',
        humanDecision: 'Owner picks the scope, edits the reply, and only then approves send. The brief does not auto-cancel the visit.',
        businessBenefit: 'Scheduling conflicts and open decisions surface before travel, without unsupervised customer messages.',
      },
      {
        title: 'Ops exception without CRM write',
        industry: 'Auto repair',
        problem: 'Parts delay and warranty notes live in three places, so the next owner never gets assigned.',
        input: 'Connected inbox or notes plus the job number the shop already uses.',
        draft: 'Exception summary with proposed next action, owner, and due date.',
        humanDecision: 'Service writer accepts the packet and logs it in the shop CRM, or pastes the manual-export note when write is unavailable.',
        businessBenefit: 'Ops follow-through continues even when the CRM connector is read-only or missing.',
      },
    ],
    fit: [
      'You have an eligible ChatGPT plan in a supported market and someone who will own review.',
      'The first job is ongoing follow-through across email and connected apps, not a one-shot prompt.',
      'You can name irreversible actions that must stay behind ask-before-action rules.',
    ],
    poorFit: [
      'You need universal availability today; dots are rolling out and are not on every plan or market.',
      'You want unsupervised payments, outbound calls the product cannot initiate, or a standalone agent email.',
      'You expect a specialist organization pilot or deep company-system integration from a personal dot.',
    ],
    pilotMeasurement: [
      'Open follow-ups drafted versus follow-ups that still needed human reconstruction',
      'Time from "customer asked again" to reviewer decision',
      'Share of drafts accepted without major factual rewrite',
      'Number of times the reviewer paused or tightened a custom rule',
    ],
    why: 'Most shops lose time rebuilding context for work that already happened. A dot can keep working between conversations, pull context from connected apps, and bring you a reviewable packet instead of another chat thread you have to reconstruct.',
    limits: [
      'Dots are rolling out to eligible ChatGPT plans and markets. Access is not universal and may take time to appear on an account.',
      'Specialist organization pilots and deep company-system integrations are separate from a personal dot. Do not treat early marketing as a finished rollout.',
      'Dots can make mistakes. Custom rules and review help, but consequential work still needs a human.',
      'Local computer access starts off. Cloud browser sign-ins are separate from your personal sessions.',
      'KCG does not connect production accounts during sales demos. Setup happens only after you approve the scope.',
    ],
    reviewer:
      'Before a dot can send, purchase, or change an account, a named reviewer on your roster must approve. Default KCG rule: ask before taking action on money movement, outbound messages, and credential changes.',
    cta: 'Talk through a dots follow-through job',
    sources: [
      { label: 'OpenAI Help: Getting started with your dot', url: 'https://help.openai.com/en/articles/20001530-getting-started-with-your-dot' },
      { label: 'OpenAI: Introducing dots', url: 'https://openai.com/index/introducing-dots/' },
    ],
  },
  {
    id: 'claude-duet',
    path: '/services/claude-duet',
    name: 'Claude Duet',
    maker: 'Anthropic',
    eyebrow: 'Proactive brief, preferences, approval',
    jobLine: 'Surfaces what needs attention, prepares the work, and waits before send, pay, sign, or delete.',
    title: 'Claude Duet for Briefs You Still Approve',
    description:
      'Claude Duet is a research-preview app where Claude works as a proactive assistant. It brings a short morning brief from connected apps, keeps working when you step away, and shows you the action before it sends, pays, signs, or deletes on your behalf.',
    markSrc: '/images/agents/claude-duet-app-icon.svg',
    markAlt: 'Official Claude Duet app icon',
    ownerRequests: [
      'Give me tomorrow\'s brief: what needs a decision before I leave the shop.',
      'Find the last email with the approved quote and open the original.',
      'Draft the customer reply in my voice, then wait for approval.',
      'Read availability on the connected calendar and flag conflicts.',
      'Prepare the HubSpot or QuickBooks next step, or a copy I can paste if write is out of scope.',
    ],
    configures: [
      'Waitlist and plan eligibility checks for Pro, Max, or Ultra in supported regions',
      'Connector selection from tools your business already uses, with least-privilege defaults',
      'Brief preferences: what counts as urgent, who gets messaged, and how often Duet should check',
      'Approval gates so outbound sends, payments, signatures, and deletes wait for a named person',
      'A written map of which decisions stay with the owner versus background prep work',
    ],
    takeaways: [
      'Duet access path documented for your Claude plan, including waitlist status when preview access is required',
      'Connected apps and approval settings recorded for the reviewer',
      'Morning brief rules tuned to your calendar and inbox noise',
      'One starter workflow that prepares work and stops before irreversible actions',
    ],
    onboarding: [
      'Confirm research-preview waitlist status and US Pro, Max, or Ultra eligibility',
      'Name the owner who receives briefs and approves sends or payments',
      'Connect the smallest set of apps that can surface the first decision packet',
      'Set urgency rules and what Duet must ask before acting',
      'Run one morning brief dry-run against real calendar and inbox noise',
    ],
    deliverables: [
      'Eligibility and waitlist status note',
      'Connector map with least-privilege defaults',
      'Morning brief preference sheet',
      'One starter workflow that stops before send, pay, sign, or delete',
    ],
    connectors: [
      {
        name: 'Gmail',
        mode: 'native',
        timeRework: 'Replaces morning inbox scavenging with a ranked brief and draft replies.',
        input: 'Connected Gmail plus brief preferences for what counts as urgent.',
        output: 'Morning items, quote or thread retrieval, and reply drafts. Send waits for approval.',
      },
      {
        name: 'HubSpot',
        mode: 'native',
        timeRework: 'Cuts re-typing the same next action after a call or site visit.',
        input: 'Deal or contact the owner names, plus the agreed next step.',
        output: 'Prepared CRM update or follow-up draft inside HubSpot where the connector allows. Sensitive actions still wait for approval.',
      },
      {
        name: 'Intuit QuickBooks, Stripe, or Gusto',
        mode: 'native',
        timeRework: 'Turns unpaid invoices, payroll prep, or payment packages into review packets instead of tab-hopping.',
        input: 'Connected books, billing, or payroll tools the reviewer authorizes.',
        output: 'Reminder drafts, payroll packages, or payment prep. Duet shows the action and waits before it pays.',
      },
      {
        name: 'DocuSign, Canva, Shopify, LinkedIn, Slack',
        mode: 'native',
        timeRework: 'Keeps signatures, creative, store, and channel prep in one brief instead of four logins.',
        input: 'Only the connectors required for the first job.',
        output: 'Prepared docs, creative, store, or channel drafts. Publish, send, sign, and delete stay behind approval.',
      },
      {
        name: 'Specialty CRM or field tools without a Duet connector',
        mode: 'manual_export',
        timeRework: 'Still captures owner, next action, and due date when the live write path is missing.',
        input: 'Decision outcome from the brief.',
        output: 'Paste-ready note for the system you already run.',
      },
    ],
    connectorCaveat:
      'Anthropic documents approval before Duet sends a message, makes a payment, signs a document, or deletes anything. KCG only enables connectors named in your scope. We do not claim every connector can send email or write your CRM the same way.',
    scenarios: [
      {
        title: 'Missing decision before tomorrow\'s visit',
        industry: 'General contracting',
        problem: 'A site visit is booked, but the change-order decision never closed.',
        input: 'Connected calendar block plus the open Gmail thread.',
        draft: 'One-page decision packet with open items, visit time, and a customer reply in draft.',
        humanDecision: 'Reviewer picks the scope, edits the reply, and only then approves the send.',
        businessBenefit: 'The day-making decision surfaces before travel, while outbound stays behind approval.',
      },
      {
        title: 'Sales follow-up from HubSpot and Gmail',
        industry: 'B2B services',
        problem: 'Warm deals stall because nobody rebuilds the last promise and next step each morning.',
        input: 'Connected HubSpot deal plus related Gmail threads.',
        draft: 'Brief item with last promise, proposed next action, and a reply draft in the owner\'s voice.',
        humanDecision: 'Owner edits tone and facts, approves the send, and confirms the CRM next step.',
        businessBenefit: 'Sales follow-up becomes a morning decision, not afternoon archaeology.',
      },
      {
        title: 'Unpaid invoice chase',
        industry: 'Professional services',
        problem: 'Open invoices sit across QuickBooks or Stripe while reminder drafts never leave a to-do list.',
        input: 'Connected invoicing tools with unpaid balances and customer contacts the owner already uses.',
        draft: 'Reminder emails prepared for the overdue set, ranked by age and amount.',
        humanDecision: 'Owner removes anyone in dispute, edits tone, and approves which reminders may send.',
        businessBenefit: 'Collections prep happens without tab-hopping, and send still requires a person.',
      },
      {
        title: 'Payroll prep in Gusto',
        industry: 'Small retail / multi-location',
        problem: 'Payroll eats owner hours gathering hours, bonuses, and reimbursements before the run.',
        input: 'Connected Gusto plus the approved hours and exception notes for the period.',
        draft: 'Filled payroll package ready for review, with open questions flagged.',
        humanDecision: 'Owner confirms pay amounts and approves the run. Duet does not move money without confirmation.',
        businessBenefit: 'Payroll arrives prepared while payment authority stays human.',
      },
    ],
    fit: [
      'You can join or already have research-preview access on an eligible US Pro, Max, or Ultra plan.',
      'The pain is morning decision prep across connected work apps, not unsupervised autonomy.',
      'Someone will own urgency rules and approve send, pay, sign, or delete actions.',
    ],
    poorFit: [
      'Team or Enterprise seats are required first; Anthropic says those plans are not included yet.',
      'You need guaranteed access on a fixed date; waitlist access is not guaranteed.',
      'Personal errands or live browser watching are the main job; early preview is weaker there.',
    ],
    pilotMeasurement: [
      'Morning decisions surfaced before travel or customer visits',
      'Reminder drafts prepared versus reminders actually approved to send',
      'CRM or books next steps logged versus packets that needed manual paste',
      'False-urgent items that needed rule tightening',
    ],
    why: 'Owners lose mornings to hunting for the one decision that will make the day slip. Duet is built to surface that item, prepare the work from connected apps, and keep irreversible actions behind your approval.',
    limits: [
      'Claude Duet is a research preview. Join the waitlist first. Access is not guaranteed on any timeline.',
      'Preview availability described by Anthropic starts with Pro, Max, and Ultra users in the US and shares plan usage limits with the rest of Claude.',
      'Background checks count toward usage. Large tasks consume more turns than a normal chat.',
      'Some personal errands are weaker than work tasks in early preview. Browser visibility is still limited.',
      'KCG does not place live connectors into your books or inbox without a signed scope and a named reviewer.',
    ],
    reviewer:
      'Duet reads and drafts on its own. Before it sends, pays, signs, or deletes, it shows the action and waits. Your named reviewer is the only person who can approve those steps in a KCG setup.',
    cta: 'Talk through a Duet brief',
    sources: [
      { label: 'Anthropic: Introducing Claude Duet', url: 'https://claude.com/resources/articles/claude-duet' },
    ],
  },
  {
    id: 'grok-bot',
    path: '/services/grok-bot',
    name: 'Grok Bot',
    maker: 'xAI',
    eyebrow: 'Role-based assistant on signed-in tools',
    jobLine: 'A named Bot for a named job, signed into the tools that job needs, with review before sensitive actions.',
    title: 'Grok Bot for Role-Based Work in Your Tools',
    description:
      'Grok Bot is a role-based AI teammate with its own computer. You give it a job such as sales follow-up, customer service, scheduling, or ops, sign it into the tools that job needs, teach the repeatable steps, and keep sensitive actions behind review. Slack can be one place the team talks to it. It is not the product.',
    markSrc: '/images/agents/grok-bot-app-icon.png',
    markAlt: 'Official Grok Bot macOS app icon',
    ownerRequests: [
      'Sales Bot: find the last email with the approved quote and show me the original.',
      'Draft the follow-up in my voice from approved samples, then leave it on the review list.',
      'Service Bot: pull the open Zendesk or inbox queue and draft the safe replies.',
      'Scheduling Bot: read Google Calendar availability and propose times that do not collide.',
      'Ops Bot: log next action and owner where the signed-in tool allows, or prepare a copy to paste.',
    ],
    configures: [
      'Bot identity and job description for one role: sales follow-up, customer service, scheduling, or ops',
      'Signed-in tools limited to the systems that role needs, with narrow account access',
      'A taught routine for the first repeatable job, recorded before the Bot runs alone',
      'Review settings so customer-facing sends and sensitive record changes wait for a named person',
      'Optional team channels (Slack, Teams, or otherwise) only when the team already works there',
    ],
    takeaways: [
      'One named Bot with a written job, not a generic chatbot',
      'Documented sign-ins and review settings for sensitive actions',
      'A taught routine the owner can re-run',
      'Clear rule: the Bot drafts and prepares; a named human decides what leaves the business',
    ],
    onboarding: [
      'Confirm eligible plan and whether shared Team Bots are required',
      'Create the Bot identity and write the role in plain owner language',
      'Sign the Bot into only the tools the first job needs',
      'Teach the routine with a recorded demo the owner accepts',
      'Turn on review for customer-facing posts and sensitive changes, then dry-run once',
    ],
    deliverables: [
      'Bot role card and tool access map',
      'Taught routine card the team can re-run',
      'Review settings for sensitive actions',
      'Named reviewer ownership note',
    ],
    connectors: [
      {
        name: 'Gmail',
        mode: 'scoped',
        timeRework: 'Stops rebuilding quote history and outbound drafts by hand for the sales or service role.',
        input: 'Signed-in Gmail plus the customer or ticket the owner names.',
        output: 'Located thread, draft in the owner\'s voice, and a review list before send. xAI documents improved Gmail connections and draft-for-approval flows; KCG still requires a human before customer send.',
      },
      {
        name: 'Google Calendar',
        mode: 'scoped',
        timeRework: 'Cuts back-and-forth when the scheduling role can read real availability.',
        input: 'Signed-in calendar for the people or rooms in scope.',
        output: 'Availability read and proposed times. Booking or invites wait for the reviewer when the action is sensitive.',
      },
      {
        name: 'Zendesk or other signed-in service tools',
        mode: 'scoped',
        timeRework: 'Turns a support queue into drafted replies and an exception list instead of a cold inbox.',
        input: 'Signed-in helpdesk or service tool the Bot can navigate like a person.',
        output: 'Queue summary and reply drafts. Closing tickets or messaging customers stays behind review.',
      },
      {
        name: 'Slack or Microsoft Teams (team interface)',
        mode: 'scoped',
        timeRework: 'Lets the team hand the Bot work where they already talk, without making chat the whole product.',
        input: 'A question, handoff, or thread the role owns.',
        output: 'Answers, drafts, or next-step lists in the channel. Sensitive actions still ask first.',
      },
      {
        name: 'CRM write when no stable signed-in path exists',
        mode: 'manual_export',
        timeRework: 'Keeps next action and owner from vanishing after the Bot finishes the packet.',
        input: 'Agreed next action, owner, and due date.',
        output: 'Paste-ready CRM note or import row. We do not invent native CRM write for every platform.',
      },
    ],
    connectorCaveat:
      'Grok Bot\'s strength is a computer that can sign into tools and a role you teach. Connections differ by account and site. xAI examples include Gmail, Google Calendar, GitHub, Zendesk, Google Docs, and review-gated outbound drafts. KCG does not claim identical email send or CRM write across every Bot.',
    scenarios: [
      {
        title: 'Sales follow-up Bot',
        industry: 'Equipment sales',
        problem: 'Quotes go out, then die because nobody owns the second touch.',
        input: 'Signed-in Gmail plus approved voice samples and the deal list the owner maintains.',
        draft: 'Located approved quote, follow-up draft in the owner\'s voice, and a review list.',
        humanDecision: 'Owner edits claims and prices, then approves which messages may send.',
        businessBenefit: 'Sales follow-up becomes a named Bot job with a human gate, not a Slack novelty.',
      },
      {
        title: 'Customer service queue Bot',
        industry: 'Consumer electronics retail',
        problem: 'Routine warranty and order questions bury the messages that need a person.',
        input: 'Signed-in Zendesk or inbox the Bot can work, plus approved answer material.',
        draft: 'Prioritized queue with safe reply drafts and a short exception list.',
        humanDecision: 'Reviewer releases routine replies and pulls exceptions to staff. The Bot does not close sensitive tickets alone.',
        businessBenefit: 'Service capacity goes to judgment calls, while routine drafts stay reviewable.',
      },
      {
        title: 'Scheduling Bot',
        industry: 'Dental / medical practice',
        problem: 'Front desk rebuilds availability from memory while the phone is still ringing.',
        input: 'Signed-in Google Calendar for the chairs or rooms in scope.',
        draft: 'Open slots that do not collide, plus a confirmation draft for the reviewer.',
        humanDecision: 'Front desk confirms the slot and only then sends the confirmation.',
        businessBenefit: 'Scheduling uses real availability instead of a guessed calendar.',
      },
      {
        title: 'Ops exception Bot',
        industry: 'Multi-location retail',
        problem: 'Receiving mismatches and vendor credits die in private notes before close.',
        input: 'Signed-in purchasing or receiving tools the Bot can access for the exception list.',
        draft: 'Exception packet with proposed owner and next action.',
        humanDecision: 'Ops lead assigns owners and logs the CRM or books update, using manual export when write is unavailable.',
        businessBenefit: 'Ops follow-through has a named Bot and a named human closer.',
      },
    ],
    fit: [
      'You can name one role and the tools that role already uses.',
      'Someone will teach the first routine from a real demo and own review for sensitive actions.',
      'You want an assistant that works in signed-in tools, not a chat widget that only answers FAQs.',
    ],
    poorFit: [
      'You need Team Bots or meeting join on a plan that does not include them yet.',
      'You want unsupervised customer spam or record changes without review.',
      'Nobody will own the Bot\'s review list.',
    ],
    pilotMeasurement: [
      'Follow-ups or queue items drafted versus items that still needed full human reconstruction',
      'Time from Bot packet to reviewer decision',
      'Customer drafts prepared versus drafts approved to send',
      'Review rejections that caused a routine rewrite',
    ],
    why: 'A shop does not need another generic chatbot. It needs a named role that can sign into the same tools a person would use, prepare the work, and stop for review before anything irreversible leaves.',
    limits: [
      'Grok Bot needs an eligible plan and tool access. Team and Enterprise setups differ from an individual seat.',
      'Bots can take initiative, so review settings and narrow account access matter more than clever prompts.',
      'Teaching a task helps repeatability, but a bad demo teaches a bad routine. KCG records the steps before the Bot runs alone.',
      'Slack, Teams, and meeting join are optional interfaces. We only enable what the team will actually use.',
      'KCG does not install Bots into production accounts during a sales walkthrough.',
    ],
    reviewer:
      'Sensitive actions can go through review before they run. In a KCG setup, the named role owner is the reviewer for customer-facing drafts and any record changes the Bot prepares.',
    cta: 'Talk through a role-based Bot',
    sources: [
      { label: 'xAI: Grok Bot', url: 'https://x.ai/bot' },
      { label: 'xAI: Grok Bot 1.0', url: 'https://x.ai/news/grok-bot-1-0' },
    ],
  },
  {
    id: 'meta-muse',
    path: '/services/meta-muse',
    name: 'Muse for Small Business',
    maker: 'Meta',
    eyebrow: 'Customer messaging and content on business channels',
    jobLine: 'Drafts replies and content from the channels you already run, then waits before publish, send, or spend.',
    title: 'Meta Muse for Messaging and Content You Still Approve',
    description:
      'Muse for Small Business is Meta\'s agent for running a business with tools you already use, including professional Instagram, Facebook Pages, Meta ad accounts, and connectors such as Canva, Shopify, and Klaviyo. Per Meta, nothing publishes, sends, or spends without your approval.',
    markSrc: '/images/agents/muse-app-icon.svg',
    markAlt: 'Official Muse for Small Business app icon',
    ownerRequests: [
      'Draft replies to the Facebook and Instagram questions that keep repeating.',
      'Pull what is actually in stock, then draft this weekend\'s offer in my voice.',
      'Plan next week\'s content from what already worked on my channels.',
      'Read calendar and inbox noise and tell me what needs a person today.',
      'If CRM write is not connected, prepare the next-action copy for HighLevel or the tool I already use.',
    ],
    configures: [
      'Muse business connectors for the channels and commerce tools you already run',
      'Brand voice and inventory sources the offer or reply draft is allowed to read',
      'Publish, send, and spend locks that require owner approval every time',
      'A Canva-connected draft path when creative needs to stay editable in tools you own',
      'A messaging-and-content checklist covering stock, price floor, claims, and named reviewer',
    ],
    takeaways: [
      'Muse connected only to the accounts the owner names',
      'Approval settings confirmed so publish, send, and spend stay blocked without review',
      'One messaging or content workflow that starts from real channels and stock, not a generic promo template',
      'Editable Canva draft when that connector is in scope',
    ],
    onboarding: [
      'Confirm US or Canada availability and that the owner is 18+',
      'Connect only the social, commerce, and creative accounts named in scope',
      'Set brand voice, inventory source, and price floor for offer drafts',
      'Verify publish, send, and spend remain blocked until owner approval',
      'Run one messaging or weekend-offer dry-run that stops before go-live',
    ],
    deliverables: [
      'Connector inventory the owner approved',
      'Brand voice and inventory source sheet',
      'Publish, send, and spend approval checklist',
      'One messaging or content workflow with a reviewed draft path',
    ],
    connectors: [
      {
        name: 'Facebook Pages, Instagram professional, Meta ad accounts',
        mode: 'native',
        timeRework: 'Stops rewriting the same customer answers and ad copy from a blank page every week.',
        input: 'Connected Meta business channels plus brand voice notes.',
        output: 'Reply drafts, content plans, and ad drafts. Nothing publishes, sends, or spends without approval.',
      },
      {
        name: 'Canva',
        mode: 'native',
        timeRework: 'Keeps creative editable in a tool the owner already opens, instead of locked screenshots.',
        input: 'Approved offer facts and brand voice.',
        output: 'Editable Canva drafts paired with captions for review.',
      },
      {
        name: 'Shopify, Klaviyo, Stripe, QuickBooks',
        mode: 'native',
        timeRework: 'Starts offers and plans from real stock, campaigns, or sales instead of invented inventory.',
        input: 'Connected commerce, email, or books sources Muse is allowed to read.',
        output: 'Offer drafts, campaign plans, or performance reads. Spend and customer sends still wait for approval.',
      },
      {
        name: 'HighLevel, Notion, Slack, Zoom, and other listed Muse connectors',
        mode: 'native',
        timeRework: 'Pulls the owner\'s existing ops and messaging tools into one reviewable packet.',
        input: 'Only the connectors named in scope.',
        output: 'Drafts and briefs inside those tools\' supported actions. Write and send behavior follows Muse plus that connector\'s limits.',
      },
      {
        name: 'CRM or POS without a Muse write path',
        mode: 'manual_export',
        timeRework: 'Still captures the next customer action when the live CRM write is unavailable.',
        input: 'Approved reply outcome and owner.',
        output: 'Paste-ready next-action note for the system you already run.',
      },
    ],
    connectorCaveat:
      'Meta states nothing publishes, sends, or spends without your approval. Muse lists many business connectors; availability and write depth vary. KCG does not claim email send or CRM write parity with dots, Duet, or Grok Bot.',
    scenarios: [
      {
        title: 'Repeat customer questions on Meta channels',
        industry: 'Boutique retail',
        problem: 'The same shipping and hours questions hit Instagram and the Facebook Page while the owner is on the floor.',
        input: 'Connected professional Instagram and Facebook Page plus approved FAQ material.',
        draft: 'Prioritized message list and reply drafts in the shop\'s voice.',
        humanDecision: 'Owner approves which replies send and which need a person. Muse does not send alone.',
        businessBenefit: 'Customer messaging gets drafted from real channels without unsupervised replies.',
      },
      {
        title: 'Weekend offer from real stock',
        industry: 'Grocery / specialty food',
        problem: 'Promo drafts invent inventory or race past the owner on Friday afternoon.',
        input: 'Connected inventory or Shopify plus the owner\'s price floor and brand voice notes.',
        draft: 'Weekend offer caption and Canva creative built only from items in stock.',
        humanDecision: 'Owner reviews price and stock, edits the line if needed, then approves before anything publishes or spends.',
        businessBenefit: 'Offers start from what you actually have, matching Meta\'s approval-before-publish rule.',
      },
      {
        title: 'Content plan from what already worked',
        industry: 'Salon / spa',
        problem: 'The team needs next week\'s posts, but nobody has time to pull what performed.',
        input: 'Connected Meta channels and, when in scope, Canva.',
        draft: 'Short content set with captions and editable creative sitting in draft.',
        humanDecision: 'Owner checks claims and creative, then approves publish.',
        businessBenefit: 'Content starts from channel reality, not a generic calendar template.',
      },
      {
        title: 'Sales and campaign read for next week',
        industry: 'Local e-commerce',
        problem: 'The owner wants a growth plan but cannot pull sales, ads, and social into one view.',
        input: 'Connected sales, campaign, and social sources Muse is allowed to read.',
        draft: 'Short growth plan with flagged expenses and suggested content or ad changes in draft.',
        humanDecision: 'Owner accepts, edits, or rejects the plan. Ad spend still needs explicit approval.',
        businessBenefit: 'Planning starts from actual channel data without auto-spend.',
      },
    ],
    fit: [
      'You operate in the US or Canada, are 18+, and already run Meta business channels you want connected.',
      'The first job is customer messaging, offers, or content that can wait for owner approval.',
      'You will keep publish, send, and spend behind a named owner every time.',
    ],
    poorFit: [
      'You need availability outside Meta\'s current US and Canada rollout.',
      'You want unsupervised publishing or ad spend on the first install.',
      'The required connector is not available and you are unwilling to review a custom connector securely.',
    ],
    pilotMeasurement: [
      'Reply or offer drafts accepted without factual rewrite',
      'Time from draft to owner approve or reject',
      'Publish, send, or spend attempts blocked until approval',
      'Offers drafted from in-stock items versus offers that needed inventory correction',
    ],
    why: 'Customer messaging and content fail when they invent inventory or race past the owner. Muse is useful when it starts from the channels and stock you already run and still waits before anything goes live.',
    limits: [
      'Muse for Small Business availability follows Meta\'s rollout. Confirm access in your market before planning around it.',
      'Connectors vary. Custom connectors exist for gaps, but they still need owner approval and a security review.',
      'Free tiers and paid subscriptions are Meta\'s terms, not a KCG promise of unlimited usage.',
      'Ad account and spend actions stay behind approval. KCG will not enable auto-spend in a first install.',
      'No live ad account work happens in a sales demo. Configuration waits for your go-ahead.',
    ],
    reviewer:
      'Meta states that nothing publishes, sends, or spends without approval. Your named owner is the reviewer for every customer reply, offer, and content set before it leaves draft.',
    cta: 'Talk through a Muse messaging workflow',
    sources: [
      { label: 'Meta Newsroom: Muse for Small Business', url: 'https://about.fb.com/news/2026/09/introducing-muse-small-business/' },
      { label: 'Muse for Small Business', url: 'https://muse.ai/business' },
    ],
  },
];

export function agentByPath(path: string): AgentPage | undefined {
  return AI_AGENTS.find((agent) => agent.path === path);
}

export function isAiAgentPath(path: string): boolean {
  return path === AI_HUB_PATH || Boolean(agentByPath(path));
}

export const AI_AGENT_ROUTES = [AI_HUB_PATH, ...AI_AGENTS.map((agent) => agent.path)];
