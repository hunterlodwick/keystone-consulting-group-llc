# Astra review 2: PASS

**Ready for Hunter's review. No deploy authorized.** Review 2 of max 3, limited to the four tickets in `astra-review-1.md`. Accepted pass-1 work was not reopened.

## Ticket verdicts

### 1. Mobile-menu focus restoration: RESOLVED

`src/App.tsx:1311–1343` saves the active trigger, focuses `#modal-close-btn` after opening, and resolves the return target after closing: the original element when connected, otherwise `#mobile-menu-toggle`. This handles the mobile CTA being unmounted when its menu closes.

`pass-2/keyboard.json` records Enter activation/closing for desktop hero/header ContactForm, desktop/mobile StatementAnalysisForm, and mobile-menu ContactForm. Every open focuses Close inside the dialog; the next Tab enters the form. Closing returns to the appropriate CTA or, for the removed mobile trigger, the toggle labeled “Open menu”; no recorded return lands on BODY. `capture.mjs` actually uses keyboard activation and reads the active element. Modal markup and both shared form bodies compare unchanged against `9667046`.

**Remaining fix:** none.

### 2. Dead App-local animation hook: RESOLVED

`src/App.tsx` contains no `useScrollAnimation` definition or reference. The separate hooks and callers remain in `src/pages/ServicesPage.tsx` and `src/pages/IndustryPageTemplate.tsx`.

**Remaining fix:** none.

### 3. New homepage CTA glows: RESOLVED

Hero, Pricing and Team Book a Call buttons (`src/App.tsx:884`, `1044`, `1140`) use color/focus feedback without hover-shadow utilities. `pass-2/measurements.json` records `hoverShadows.hero`, `.pricing` and `.team` as `none`. The three retained instances of the specified teal glow belong to IndustrySplash and the two Header branches, consistent with baseline intent. Non-home Header retains its original scale/glow styling.

**Remaining fix:** none.

### 4. Evidence completeness and header preservation: RESOLVED

- Read `pass-2/REPORT.md`, `keyboard.json`, `links.md`, `measurements.json`, raw `link-results.json` and the capture script.
- Visually compared the reconstructed `9667046` vs current Financial Services and Industries dropdown captures at 1440×900, and restaurants mobile-menu captures at 390×844. Header placement, controls, labels, dropdown geometry and mobile-menu layout match in these spot checks. Baseline reconstruction and preview origins are explicitly labeled.
- Inspected Header gating at `src/App.tsx:723–856`: homepage sizing applies conditionally; non-home desktop CTA, mobile toggle, phone and menu CTA retain baseline classes. Existing non-home dropdown/accordion handlers remain intact. The recorded `mobileAccordion` boolean establishes control visibility, not an expanded-accordion interaction test; unchanged handlers and matching menu captures support the scoped preservation finding.
- All eight criterion-14 destinations have direct-load, internal-click, back and forward records, including About. The services catalog click correctly lands on `/services#web-design`. All twelve industry direct loads return 200 with distinct H1s.
- Keyboard records cover both forms and the mobile trigger; mobile About/Processing links close the menu. Anchor heading tops are 160.92/159.67px at 390 and 176.94/176.44px at 1440, all below the 69px scrolled header.
- `capture.mjs` collects fresh final height, font, visibility and geometry data alongside screenshots after `document.fonts.ready`. Final dark heights are 6270px and 3812px, yielding 65.55% and 66.64% reductions against the retained pass-1 baseline heights. Those baseline homepage heights are carried forward, not newly reconstructed by this script. Final font status is loaded and both widths/themes record no horizontal overflow.
- The report maps all 18 checkboxes to evidence and explicitly retains **UNVERIFIED** for live form delivery. Keyboard evidence establishes the requested open/close/return sequence, not a comprehensive focus-trap audit.

**Remaining fix:** none.

## Verification and boundaries

Hermes's independent build, TypeScript lint, 25-route console checks and 25/25 SlopMonster results are accepted as instructed; this review did not rerun them. Review conclusions use direct source inspection and supplied evidence, including six viewed header captures.

Live delivery remains **UNVERIFIED by design**. Physical-phone validation and documented baseline limitations remain unchanged. No implementation, live submission, commit, push or deployment was performed. Pass-1 and pass-2 evidence were not modified.
