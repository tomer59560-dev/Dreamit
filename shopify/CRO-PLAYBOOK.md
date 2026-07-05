# Dream It Israel — Conversion Rate Optimization Playbook (Shopify)

A prioritized CRO program for **dreamitisrael.com** — a Hebrew/RTL **Shopify** store
selling bedding (Dream Soft / Dream Basic), bathrobes and bouclé furniture, with
free shipping over ₪300 and same-country dispatch from Petah Tikva.

Phase 1 ships as code in this folder (`sections/dreamit-cro.liquid`). Phases 2–3 are
store-level actions. Everything is measurable through the Microsoft Clarity project
this repo already reports on (`clarity_report.py`).

> Note: an earlier draft of this kit targeted WooCommerce. The live site is Shopify
> (`/products/`, `/collections/` URLs), so the kit is now a Shopify **section** and
> the ZAP mirror in this repo was updated to read Shopify's public JSON endpoints.

---

## Phase 1 — Install the CRO Kit section (~20 minutes)

### Install

1. Shopify Admin → **Online Store → Themes → ⋯ → Edit code**.
2. Under **Sections**, click *Add a new section*, name it `dreamit-cro`,
   paste the contents of `sections/dreamit-cro.liquid`, save.
3. Open **Layout → theme.liquid** and add this line just before `</body>`:
   ```liquid
   {% section 'dreamit-cro' %}
   ```
4. Go to **Online Store → Customize** — the "Dreamit CRO Kit" section settings
   control every feature. Set:
   - **סף משלוח חינם** — your real threshold (₪300 today; keep it in sync with your shipping settings)
   - **מספר וואטסאפ** — international format (e.g. `972501234567`); empty = button hidden
   - **קוד קופון** — create the discount first in **Discounts** (e.g. `STAY5`); empty = popup hidden
   - **ימי אספקה** — keep identical to the ZAP feed (currently 7 business days)

### What each feature does (typical documented impact*)

| Feature | Where | Typical impact |
|---|---|---|
| Free-shipping progress bar toward ₪300 | Cart page | +10–15% average order value |
| Sticky add-to-cart + ⚡ quick-checkout bar | Product pages (appears when buy button scrolls away) | +5–8% add-to-cart, biggest on mobile |
| Trust badges (shipping, warranty, secure payment) | Under the buy button | +2–5% product→cart |
| Delivery promise + same-day-dispatch countdown | Product pages, Israel business days (Sun–Thu) | +5–10% where speed matters |
| Low-stock urgency **from real Shopify inventory** | Product pages | +3–8% when genuinely scarce |
| WhatsApp floating button, product-aware message | Sitewide | Assisted conversions; #1 support channel in IL |
| Exit-intent coupon popup (7-day cooldown, never on cart) | Sitewide | Recovers 2–4% of abandoning sessions |
| Cart trust strip | Cart page | Reduces last-step anxiety |

\* Industry ranges, not guarantees — the measurement plan below is how you verify.

**Free bonus that needs zero code:** Shopify natively supports discount links —
`https://www.dreamitisrael.com/discount/CODE` auto-applies the coupon at checkout.
Use these links in Meta ads, WhatsApp messages and ZAP campaign URLs.

---

## Phase 2 — Store-level fixes (no code, highest compound impact)

1. **Product reviews.** Install a reviews app (Judge.me has a solid free tier, supports
   Hebrew/RTL) with an automatic review-request email ~10 days after delivery.
   For a store shoppers haven't heard of, review stars on product pages and in
   Google results are the single strongest conversion lever.
2. **ZAP ↔ site consistency.** The feed in this repo now reads live Shopify data,
   so names/prices always match. Verify shipping cost and the 7-day delivery
   promise shown on ZAP match the product page — any mismatch is an instant
   back-button and hurts ZAP ranking.
3. **Payments Israelis expect.** Enable Bit and installments (תשלומים) via your
   payment provider, and Shop Pay / Apple Pay / Google Pay express buttons.
   Missing local payment options is a silent checkout killer.
4. **Mobile speed.** Bedding/furniture photos are heavy. Compress hero images,
   use Shopify's responsive `image_url` sizes in the theme, and remove unused
   apps (each adds JS). Target LCP < 2.5s on a mid-range phone.
5. **Return policy visibility.** One sentence near the buy button
   ("החזרה קלה תוך 14 יום") beats a policy page nobody opens. Add it as one of
   the four trust badges in the section settings.
6. **Collection page merchandising.** Put best sellers first (Shopify: collection
   sort = Best selling), show "מבצע" badges on compare-at prices, and make sure
   every product has a lifestyle photo first — bedding sells on the bedroom look.

## Phase 3 — Recover and retain

7. **Abandoned checkout automation.** Shopify → Marketing → Automations:
   abandoned checkout email at 1h (built-in, free). Add the exit coupon to the
   second reminder. If WhatsApp marketing is in use, a WhatsApp abandoned-cart
   message outperforms email in Israel.
8. **Post-purchase cross-sell.** Bedding is a repeat category: pillowcase sets,
   duvet covers, robes. Add a thank-you-page offer and a 30-day follow-up email
   with a returning-customer coupon.

---

## Measurement plan — proving "it really drives results"

The section fires **Microsoft Clarity events** automatically (Clarity → Filters → Events),
and pushes the same names to `dataLayer` for GA4:

| Event | Fired when |
|---|---|
| `dcro_fs_bar_view` | Free-shipping bar seen on cart |
| `dcro_sticky_add` | Sticky-bar add-to-cart clicked |
| `dcro_buy_now` | ⚡ quick-checkout clicked |
| `dcro_whatsapp_click` | WhatsApp button clicked |
| `dcro_exit_popup_view` / `dcro_exit_popup_claim` | Exit popup shown / coupon claimed |

### The weekly loop

1. **Baseline (before installing):** 2 weeks of — sessions, add-to-cart rate,
   reached-checkout rate, orders, AOV, mobile vs desktop (Shopify Analytics →
   Conversion funnel), plus the daily Clarity email this repo already sends.
2. **Activate** Phase 1, run 2 weeks, compare the same numbers. Watch Clarity
   recordings filtered by the events above — e.g. sessions with
   `dcro_exit_popup_view` that still left tell you the offer is too weak.
3. **One change at a time** from Phase 2, 2 weeks each. No lift → toggle the
   feature off in the Customizer; every feature is independently reversible.
4. **KPIs in priority order:** conversion rate, AOV, mobile conversion rate,
   abandoned-checkout rate, rage/dead-click rate on product pages in Clarity.

### Guardrails

- No fake scarcity: the low-stock notice reads real Shopify inventory, and the
  dispatch countdown reflects the real cutoff hour you configure.
- Keep the ZAP feed and the site telling the same story: price, shipping cost,
  delivery time. (The mirror now reads live Shopify JSON, so this is automatic
  for names and prices.)
- The exit popup never shows on the cart page and respects a per-visitor cooldown.
