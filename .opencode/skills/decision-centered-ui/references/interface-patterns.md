# Decision patterns for common product screens

Use the relevant pattern as a diagnostic lens, not a rigid visual template. Preserve existing product behavior and all material information. Examples describe design principles, not claims that any specific experiment will generalize to every product.

## 1. Free trials and subscription paywalls

**Typical user concern:** "Am I making a costly commitment before knowing the product?"

**Information to surface:**
- What the user can experience immediately, with concrete examples of real content or features.
- Trial length, eligibility, start and end dates or rules, if applicable.
- Billing amount and cadence, the time billing starts, and whether it renews automatically.
- Whether payment details are required and how cancellation works.
- Reminder timing only if a real reminder mechanism exists.

**Useful structure:**
1. Brief value proposition supported by actual product content.
2. A short, legible trial timeline when the timeline is meaningful.
3. Clear billing disclosure adjacent to the CTA.
4. CTA that names the true action, such as `Start my free trial`.
5. Discoverable terms and non-subscription route where applicable.

**Common failure:** Generic feature bullets and an ambiguous `Subscribe` CTA make a new user weigh the full recurring cost without understanding what happens next. A trial-focused headline can lower cognitive friction, but it must not hide renewal terms.

**Review question:** Can the user accurately explain when money will be charged and how to prevent that charge?

## 2. Comparing rides, plans, products, or service options

**Typical user concern:** "Which option should I choose, and what does the choice mean?"

**Information to surface:**
- Consistent decision criteria across options: price or estimate, timing, capacity, quality tier, and relevant features.
- Clear selection state and the consequence of continuing.
- Distinctive advantages, such as `Best for 4 passengers`, when supported.

**Useful structure:**
1. Keep the user's chosen destination or objective visible when it provides necessary context.
2. Compare alternatives in aligned columns or similarly structured cards.
3. Use a single, guaranteed price only when that figure is trustworthy; otherwise clearly communicate estimates or ranges.
4. Show arrival or completion time when reliable.
5. Label one option `Cheapest`, `Fastest`, or `Recommended` only if the ranking is grounded and the criteria are clear.

**Common failure:** Different units, unlabeled estimates, and multiple price ranges force users to do unnecessary arithmetic or over-weight worst-case prices.

**Review question:** Can the user explain why one option is better for their specific priority without opening every card?

## 3. Accommodation bookings and reservations

**Typical user concern:** "Will I like the experience, what is the real total, and can I change my mind?"

**Information to surface:**
- Representative photos of the actual space and an accurate, specific description.
- Dates, nights, occupancy, location context, and availability.
- Total price and the relationship between nightly rate, fees, taxes, and discounts.
- Cancellation and refund rules near booking confirmation.
- Real reputation badges and reviews if available.

**Useful structure:**
1. Let real, high-quality imagery demonstrate the experience.
2. Present the property name and differentiating facts prominently.
3. Display dates and totals in readily understandable terms.
4. Disclose cancellation conditions at the commitment point.
5. Use a CTA that communicates the next step (`Review reservation`) or the actual charge (`Book for $X`) only if correct.

**Common failure:** A small generic image, vague title, cost without dates or fees, and an unqualified `Reserve` button force users to imagine the offering and guess the obligation.

**Review question:** Before confirmation, can the user tell exactly what they booked and their cancellation rights?

## 4. Professional service marketplaces

**Typical user concern:** "Is this professional suitable, legitimate, available, and safe to contact?"

**Information to surface:**
- Trade or specialty, service area, experience, relevant credentials, and clear scope.
- Genuine verification state; distinguish `Pending review`, `Verified`, and `Not verified` if those states exist.
- Reviews and work history, with counts and provenance where available.
- Pricing basis when available (fixed cost, hourly rate, quote required).
- Availability and the expected next step (message, schedule, request quote).

**Useful structure:**
1. Prioritize skill match, location, trust evidence, and availability in the results view.
2. Enable filters for factors that meaningfully determine suitability.
3. Let a profile answer trust and competence questions without hiding critical facts.
4. Make `Contact`, `Request quote`, and `Book` distinct actions, with accurate consequences.
5. Preserve status visibility throughout conversations and service requests.

**Common failure:** A prominent contact button combined with unverified reputation claims, ambiguous service boundaries, or missing price context produces friction later in the process.

**Review question:** Can the user distinguish factual verification from self-described experience and marketing copy?

## 5. Operations dashboards and complex tools

**Typical user concern:** "What changed, what requires attention, and what can I do safely?"

**Information to surface:**
- Actionable alerts and their severity, timeframe, and responsible entity.
- Labels and units for all metrics, along with a meaningful comparison period.
- Clear distinctions between current state, trend, projection, and estimate.
- Filters, sorting, drill-downs, and undo or confirmation for risky actions.

**Useful structure:**
1. Prioritize actionable information over decorative hero sections.
2. Match visual density to user expertise and task urgency.
3. Show data freshness and missing-data states when important.
4. Keep destructive actions distinct and reversible when possible.
5. Avoid sacrificing advanced user efficiency for a simplistic layout.

**Review question:** Can a user identify their next operational action without misinterpreting a number or status?

## Pattern selection rules

- Favor task-specific patterns rather than copying another industry’s layout.
- If the product has documented brand or domain constraints, those take precedence over example arrangements.
- Never extrapolate exact uplift percentages from screenshots or anecdotes.
- Do not invent live data, discounts, trust signals, or system abilities to fill a pattern.
