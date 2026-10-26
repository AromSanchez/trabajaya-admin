---
name: decision-centered-ui
description: Design, implement, or review frontend interfaces around clear user decisions, trustworthy conversion flows, useful information hierarchy, and low-friction interactions. Use for UX/UI work on onboarding, pricing, trials, product selection, service marketplaces, booking, checkout, and similar decision-heavy screens. Do not invoke for backend-only work or unrelated visual asset generation.
---

# Decision-Centered UI

Build interfaces that help people understand, decide, and act with confidence. Treat layout, copy, prices, imagery, comparison data, and interaction states as parts of one decision-making experience, not independent decorations.

A screen succeeds when users can answer: **What is this? What can I do? What will happen? What will it cost or require? Why should I trust it?** Favor informed task completion over clicks obtained through pressure, ambiguity, or concealed terms.

## Scope and boundaries

- Use this skill when creating, redesigning, implementing, or auditing interactive frontend product screens.
- Respect the user's requested scope, product direction, framework, accessibility requirements, and existing design system. Prefer incremental improvement over unrelated restyling.
- Do not change business rules, billing semantics, permissions, security guarantees, or product claims to make the UI seem simpler.
- Preserve legitimate complexity when users must understand it. Progressive disclosure is not permission to hide material facts.
- When the task is a review only, report recommendations; do not modify files unless asked.
- Read [references/interface-patterns.md](references/interface-patterns.md) when the task involves pricing, trials, comparisons, booking, service selection, or dashboard interactions. Read only the relevant pattern.
- Read [references/review-playbook.md](references/review-playbook.md) when auditing an existing UI, undertaking a substantial redesign, or verifying completion of a decision-critical flow.

## Working method

### 1. Inspect the product before proposing a design

For existing projects, inspect the relevant pages, components, content/data model, styles or design tokens, routing, behavior, and tests. Identify what is actually implemented versus placeholder, mocked, or promised in copy. Preserve working conventions and interactions unless a change is justified by the task.

Briefly establish the following, internally or in a short response when it helps collaboration:

- **User goal:** What task brought the user to the screen?
- **Primary decision:** What is the next meaningful choice or commitment?
- **Decision inputs:** What must the user know before acting?
- **Likely hesitation:** What could create uncertainty, distrust, or cognitive load?
- **Primary action and consequence:** What exactly happens after the action?
- **Evidence available:** Which prices, timing estimates, statuses, and claims are backed by real data?

If some details are unknown, use reversible, clearly identified design assumptions rather than fabricating product facts. Ask only when a missing detail prevents correct implementation.

### 2. Design the decision, then the screen

Before arranging components, phrase the difficult question the current design implicitly asks. Prefer a smaller, accurate, actionable question when possible.

Examples:

- Instead of forcing a new visitor to decide whether a subscription is worth a recurring commitment, explain the real trial process and billing terms before inviting them to start.
- Instead of presenting several incomparable transport offers, align cost, arrival time, capacity, and other decision-relevant attributes.
- Instead of showing accommodation data without context, help visitors understand the experience, dates, total price, and cancellation policy.

**Do not simplify by misleading.** An uncertain price must remain visibly uncertain; a cancellation option must be genuinely available; a discount must be genuine.

### 3. Establish intentional information hierarchy

Choose the first thing the user should notice based on the task, not on a fixed UI template.

- Give the screen a recognizable purpose and one clearly prioritized next action when the flow has a primary action.
- Place the most decision-relevant facts near the corresponding choice or CTA.
- Group related information; use scannable labels and consistent units.
- Emphasize comparative differences, not repeated identical attributes.
- Use real product content and meaningful imagery when visualization helps users evaluate the offering. Avoid decorative images that displace essential information.
- Use spacing, type, color, and positioning to direct attention. Keep secondary choices discoverable and avoid artificially suppressing exit or decline paths.
- Reserve optional details for progressive disclosure only if hiding them cannot change an informed decision.

### 4. Write specific, truthful microcopy

- Use action labels that communicate the next step or outcome, such as `Review booking`, `Start free trial`, or `Confirm $42 total`, when those labels are accurate.
- Differentiate exploration from commitment. `View plans` must not initiate payment; `Start trial` must not obscure automatic renewal.
- Make temporal claims concrete when the backend supports them: start date, reminder, first billing date, deadline, or arrival estimate.
- Put qualifying conditions near the claim they affect. Do not bury fees, automatic renewals, or cancellation restrictions in distant text.
- Explain errors in terms of what happened and how the user can recover. Use explicit field labels, helpful validation, and meaningful empty states.
- Avoid manipulative urgency, guilt-based opt-outs, deceptive defaults, invented social proof, or fake scarcity.

### 5. Implement the full interaction, not only the happy-path screenshot

Use the project's established stack and styling conventions. Prefer small, maintainable components and a consistent design language over a bespoke visual overhaul.

For interactive screens, account for relevant states:

- Default, hover (where applicable), keyboard focus, selected, disabled, and active.
- Loading, empty, success, failure, validation error, and retry.
- Long content, narrow screens, and large text scaling.
- Keyboard-only operation, semantic controls, visible focus, accessible names, error associations, and appropriate contrast.
- Reduced motion preferences for nonessential transitions.

Do not invent APIs, hard-code fake prices or reviews as real data, or wire a CTA to an unrelated or no-op action. If backend support is absent, use an explicitly labeled prototype state or describe the integration gap.

### 6. Evaluate decisions and verify the implementation

Inspect the completed flow as a user would, not just the component tree:

1. Can someone identify the purpose and next step at a glance?
2. Can they compare alternatives without unnecessary calculation or guessing?
3. Can they see meaningful commitments, costs, terms, and reversibility before confirming?
4. Are trust indicators authentic and claims backed by available data?
5. Are the visual priority, microcopy, and actual behavior consistent?
6. Are all meaningful interaction and responsive states handled?

Run relevant tests, type checks, linting, or build commands when available. Use browser-level testing or screenshots when supported and useful. Describe checks actually performed; never claim a visual audit or tested behavior that was not verified.

For a review task, prioritize findings by user impact and implementation effort. Suggest concrete changes, not only aesthetic preferences. For an implementation task, fix significant issues within the requested scope.

## Decisions requiring special care

### Price and uncertainty

A single exact price is preferable to a range **only if it is actually fixed or guaranteed**. If pricing varies, preserve that uncertainty with an honest estimate, range, pricing basis, and any applicable conditions. Show taxes, fees, billing cadence, and totals where they matter for the decision. Do not replace valid unknowns with false precision.

### Trials and subscriptions

Show what is included, when the trial begins and ends, whether payment information is needed, when billing starts, the charge and cadence, and how cancellation works, according to actual product terms. If reminders are not implemented, do not promise them.

### Ratings, badges, and promotions

Use verification badges, ratings, testimonials, comparative badges (`Lowest price`, `Fastest`), crossed-out prices, discounts, and scarcity signals only when grounded in live or legitimately provided data. Expose relevant qualification criteria when they could affect trust.

### Emotional design

Use emotionally engaging descriptions, imagery, and interaction polish when they genuinely help someone understand the offering. Never let storytelling obscure constraints or substitute for necessary facts. Match visual density to context; a booking flow and an operations dashboard have different information needs.

## Output expectations

- **When implementing:** Deliver working changes in the existing project conventions. Summarize the main user decision improved, the most relevant design changes, verification performed, and remaining data or backend dependencies.
- **When reviewing:** Return prioritized, actionable findings with current friction, proposed correction, expected user benefit, and caveats. Distinguish observed issues from hypotheses that would require testing.
- **When prototyping:** Identify placeholders and assumptions, keep CTAs honest, and avoid implying unsupported functionality exists.

Do not assert that a redesign will increase conversion by a particular amount without actual experimental evidence. Treat UX improvements as hypotheses to validate with usability testing, analytics, or A/B experiments where appropriate.
