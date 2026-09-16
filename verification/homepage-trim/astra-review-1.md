# Astra review 1: FAIL

Reviewed against PLAN.md sections 4–11 and the supplied pass-1 evidence. Acceptance IDs below number the checkboxes in section 11 from top to bottom. The user-authorized step 02 copy revision is accepted.

## Fix tickets

### 1. Restore focus for the mobile-menu call action

- **File:** `src/App.tsx:863`, `src/App.tsx:1314–1329`.
- **Fails:** acceptance 13.
- **Wrong:** The mobile Book a Call handler closes the menu and opens the modal. `lastFocusRef` saves that menu button, which React then unmounts. Calling `.focus()` on it when the modal closes cannot restore focus. The new focus restoration only handles triggers that remain mounted.
- **Reproduction:** At 390×844, open the menu, focus its Book a Call button and press Enter. Focus becomes BODY when the dialog opens. Focus Close modal and press Enter: the dialog disappears, but focus remains BODY, with no active control label. Reproduced against a fresh local build.
- **Exact fix:** In the homepage modal orchestration, resolve a connected return target: keep the original trigger when `isConnected`, otherwise return to the visible mobile menu toggle. Move focus into the homepage dialog when it opens so the removed trigger does not strand keyboard users on BODY. Keep shared form internals and Modal markup unchanged. Verify both CTA types and the mobile-menu trigger using keyboard activation and closing, with active-element assertions after open and close.

### 2. Remove the newly dead App-local animation hook

- **File:** `src/App.tsx:42–62`.
- **Fails:** acceptance 15; sections 8–9.
- **Wrong:** `useScrollAnimation` has no caller and is not exported. Removing its only MainLandingPage call made it dead. ServicesPage and IndustryPageTemplate each define and call their own separate hooks. The report's rationale for keeping a shared hook does not apply to this definition. The current tsc configuration does not enable unused-local checking, so a passing lint command does not establish absence of dead code.
- **Exact fix:** Delete this App-local function and its obsolete comment. Preserve the independently used subpage hooks and shared CSS. Confirm surviving references before removing any additional imports or helpers.

### 3. Remove the newly added hero CTA glow

- **File:** `src/App.tsx:893–898` (Hero button; review the newly consolidated Pricing and Team buttons at 1054 and 1150 too).
- **Fails:** section 8's explicit prohibition on new hover glow effects.
- **Wrong:** The new hero button adds `hover:shadow-[0_0_20px_rgba(0,128,128,0.4)]`; neither previous hero CTA had this glow. Hovering the current hero CTA computes a teal 20px shadow. Removing pulse/scale does not satisfy the separate no-new-glow constraint.
- **Exact fix:** Remove that hover-shadow utility from the hero and use restrained color/focus feedback. Apply the same treatment to the newly consolidated homepage buttons. Do not change existing non-home button styles or global shared CSS.

### 4. Complete the evidence and correct overclaimed PASS labels

- **Files:** new `verification/homepage-trim/pass-2/REPORT.md`, `links.md`, measurements, screenshots and browser logs; corresponding capture script.
- **Fails / unverified:** acceptance 8, 13–14 and 18 are not fully established by the pack.
- **Wrong:** `links.md` explicitly admits that baseline web-design/restaurants screenshots are missing. It records back/forward only for Websites, with `n/a` for other required paths; About lacks a click result. Keyboard evidence consists mostly of mouse clicks and a three-Tab sample, and misses ticket 1. `recapture.mjs` refreshes selected bounding boxes and screenshots while retaining previous height/font/visibility results. The all-PASS summary overstates what was captured. Common Header control classes also changed outside the homepage branch, so untouched page files alone do not prove the shared header is unchanged.
- **Exact fix:** Capture `/services/web-design` and `/restaurants` from baseline commit `9667046` in a separate temporary checkout, label these as reconstructed baseline captures, and compare with final captures at matching settings. Keep pass-1 immutable. Verify the original non-home dropdown/mobile behavior; scope any changed shared control styling to `isHomepage` where needed to preserve the original non-home header. Complete direct-load/internal-click/back-forward checks for every route named in criterion 14, plus the preserved industry direct-load checks. Record keyboard open/close/return focus for both forms, mobile hash-link menu closure, and anchor clearance at both widths. Regenerate final measurements and screenshots together from the final source revision, with font-load state recorded. Map each claim to actual evidence; retain UNVERIFIED for live form delivery. If a baseline defect prevents a criterion, reproduce it and mark that criterion blocked/unverified as PLAN.md section 14 requires.

## What passes or has supporting evidence

- Exactly five homepage sections in the contracted order; three correctly ordered service cards and destinations; Edge and Interchange Plus terms retained; cut sections and fictional homepage testimonials removed.
- Specified homepage copy and the approved step 02 revision; no em-dashes in the new homepage marketing copy.
- Viewed both dark first-viewport screenshots: mobile H1, supporting copy and CTA fit, and desktop POS art remains intact without the calculator gap. Light mobile full-page capture shows readable retained sections and cards. Supplied desktop light capture/measurements support theme preservation.
- Homepage entrance classes/delays are removed. Observer-disabled/reduced-motion evidence is present. The unused hook is a cleanup failure, not an active homepage reveal gate.
- Supplied measurements report 65.55% and 66.64% scroll-height reductions at 390 and 1440. Both exceed the 35% threshold; final-pass measurements must remain synchronized with final captures.
- Fresh reviewer runs of `npm run build`, `npm run lint` and `git diff --check` pass. Tracked application changes are confined to App.tsx and index.css; shared form bodies, Footer, catalogs and route entries are preserved in the diff.
- Fresh desktop direct-load checks: pricing heading top 176.94px and about heading top 176.44px, below the 69px fixed header. No defect observed in these two flows.
- The supplied `console.log` exists and reports no browser errors or failed local asset requests. It is a 59-byte clean-status message, not literally an empty file.

## Boundaries

Shared statement-form Profit Leak wording, existing footer legal links and contact-value discrepancies remain documented baseline limitations. Modal focus-entry behavior already lacked management in the baseline; ticket 1 asks for homepage orchestration to meet the explicit keyboard acceptance requirement, not a shared form redesign. External delivery remains UNVERIFIED by design.

No implementation changes, live form submissions, commits, pushes or deployments were made by this review. Pass 2 should address these four tickets within the existing three-pass budget.
