# Decision-centered UI review playbook

Read this reference when auditing an existing interface or checking a substantial, decision-critical frontend implementation.

## Review sequence

### A. Find the decision bottleneck

Trace the user from entry to the next meaningful outcome. Record:
- The job the user wants to complete.
- What the interface initially asks them to decide.
- Information they need but cannot see at the decision point.
- Calculations, uncertainty, distractions, or ambiguous commitments.
- Possible differences between displayed claims and actual behavior.

Do not treat every additional step as bad. Confirmation, verification, and informed consent can be necessary.

### B. Check content and behavior together

For each primary CTA and high-stakes choice, inspect:
- Exact label and actual event or route triggered.
- Costs, timelines, fees, renewals, privacy, and reversibility.
- Evidence behind reviews, badges, ranking labels, and discounts.
- Real and mocked data sources.
- Loading, error, disabled, and completion states.

Escalate any misleading material claim as a critical issue even if the interface looks polished.

### C. Evaluate presentation

- Can users scan the hierarchy naturally?
- Is the primary task prominent without obscuring alternatives?
- Are options meaningfully comparable with consistent units?
- Are images relevant to the actual product or outcome?
- Does microcopy explain consequences rather than use vague verbs?
- Is there unnecessary mental arithmetic that the product can perform reliably?
- Are contextual facts placed near the action where they matter?
- Is the layout comfortable on narrow screens and with longer labels?

### D. Evaluate accessibility and interaction

- Keyboard navigation follows a sensible order with visible focus.
- Controls have semantic roles, accessible names, and adequate hit targets.
- Text and interactive states maintain appropriate contrast.
- Error and success feedback is perceivable and actionable.
- No essential meaning relies only on color, animation, or hover.
- Reduced motion and text resizing do not break the flow.
- Modals, disclosures, and menus manage focus and dismissal predictably.

### E. Verify with available tooling

Run project-relevant checks (tests, build, types, lint). If browser automation or screenshots are available, verify at least the main desktop and narrow-screen flow and an error state. If tools are unavailable, state the limit clearly.

## Severity guide

- **Critical:** Materially misleading pricing, renewal, policies, trust claims, or irreversible action; data loss; broken completion; inaccessible core flow.
- **High:** Decision-critical information hidden or illegible; contradictory copy; significant comparison difficulty; broken responsiveness or navigation.
- **Medium:** Noticeable extra steps, weak labels, missing helpful context, secondary accessibility defects, confusing hierarchy.
- **Low:** Nonessential visual polish, spacing inconsistencies, or cosmetic content refinements that do not obstruct decisions.

## Review finding template

Use a concise form for each significant finding:

**Issue:** Describe observed behavior and where it occurs.
**Why it matters:** State the decision or user risk affected.
**Change:** Name a concrete design or implementation correction.
**Evidence/uncertainty:** Distinguish verified facts from UX hypotheses.
**Severity:** Critical / High / Medium / Low.

## Acceptance checks by scenario

### Trial/paywall
- Can a user state when they will be charged and how to cancel?
- Are CTA wording and billing behavior aligned?
- Are dates, reminders, and perks backed by actual functionality?

### Option comparison
- Are the comparison fields and units consistent?
- Is uncertain data labeled honestly?
- Is the user's selection obvious before proceeding?

### Booking/checkout
- Is total cost understandable before confirmation?
- Are dates, quantities, fees, and refund conditions visible?
- Does the confirmation match the final action and real system behavior?

### Marketplace/profile
- Is verification accurate and distinguishable from user-provided claims?
- Can users see professional fit, service area, and next-step consequences?
- Are unavailable actions appropriately disabled or explained?

### General interaction
- Do empty, loading, error, and success states work?
- Does layout remain usable on mobile and with keyboard navigation?
- Are findings resolved within the authorized scope, without unrelated redesign?

## Post-release validation

Where analytics and experimentation are available, define success in terms of task completion, comprehension, error rate, support contacts, and user trust, not click-through alone. Treat a design as a testable hypothesis. Do not invent A/B test outcomes or causal claims.
