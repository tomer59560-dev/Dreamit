# Dream It Israel — Conversion Rate Optimization Playbook

A complete, prioritized CRO program for **dreamitisrael.com** (WooCommerce, Hebrew/RTL).
Phase 1 ships as code in this folder (`dreamit-cro.php`). Phases 2–3 are store-level
actions that don't need code. Every change is measurable through the Microsoft Clarity
project you already have (see `clarity_report.py`).

---

## Phase 1 — Install the CRO Kit plugin (this repo, ~30 minutes)

### Install

1. Create a folder `dreamit-cro/` containing `dreamit-cro.php`, zip it.
2. WordPress Admin → **Plugins → Add New → Upload Plugin** → activate.
3. Open `dreamit-cro.php` and edit the CONFIG block at the top:

| Setting | What to set | Why it matters |
|---|---|---|
| `free_shipping_threshold` | Your real free-shipping minimum in ₪ (e.g. `199`). `0` disables. | The progress bar raises average order value — shoppers add items to reach the bar. |
| `whatsapp_phone` | Your number, e.g. `972501234567` | Israeli shoppers convert on WhatsApp. Empty = button hidden. |
| `exit_coupon_code` | A real coupon you create in **Marketing → Coupons** (e.g. `STAY5`, 5%, one per customer) | Recovers abandoning visitors. Empty = popup hidden. |
| `order_cutoff_hour` / `delivery_business_days` | Your true dispatch cutoff and delivery time (**keep identical to the ZAP feed — currently 7 days**) | A delivery promise that matches reality builds trust; a mismatch with ZAP kills it. |
| `low_stock_threshold` | e.g. `5` | Urgency is shown **only from real WooCommerce stock numbers** — no fake counters. |

### What each feature does (and the typical impact range)

| Feature | Where | Typical documented impact* |
|---|---|---|
| Free-shipping progress bar | Cart, mini-cart, checkout | +10–15% average order value |
| Sticky add-to-cart bar | Product pages (appears when the buy button scrolls away) | +5–8% add-to-cart rate, biggest on mobile |
| Trust badges (warranty, secure payment, shipping) | Under the add-to-cart button | +2–5% product→cart, larger for unknown brands |
| Delivery promise + same-day-dispatch countdown | Product pages | +5–10% on stores competing on speed |
| Real low-stock urgency | Product pages | +3–8% when genuinely scarce |
| Buy-now button (straight to checkout) | Simple products | Cuts one full funnel step |
| WhatsApp floating button | Sitewide | Assisted conversions; #1 support channel in IL |
| Exit-intent coupon popup | Sitewide except checkout | Recovers 2–4% of abandoning sessions |
| URL coupon auto-apply (`?coupon=CODE`) | Any link | Frictionless promo links for ads/ZAP/WhatsApp campaigns |
| Checkout trust strip | Under the "place order" button | Reduces last-second payment anxiety |

\* Industry ranges, not guarantees — that's exactly why the measurement plan below exists.

---

## Phase 2 — Store-level fixes (no code, highest compound impact)

Do these in order; each is a known top-5 conversion lever for WooCommerce stores:

1. **Product reviews.** If review volume is low, install a review-request email
   (e.g. free "Customer Reviews for WooCommerce") that mails buyers ~10 days after
   delivery. Reviews are the single strongest trust signal for a store shoppers
   haven't heard of — especially for ZAP traffic that lands cold on product pages.
2. **Price/shipping consistency with ZAP.** The feed in this repo now sends per-SKU
   shipping and 7-day delivery. Verify the product page shows *the same numbers*.
   Any mismatch between ZAP listing and landing page is an instant back-button.
3. **Checkout field diet.** WooCommerce → Settings → Advanced: enable guest checkout;
   remove "company", "address 2" and any optional field. Every removed field is
   measurable friction. Keep phone (needed for delivery + WhatsApp follow-up).
4. **Mobile speed.** Most ZAP/social traffic is mobile. Compress hero images to WebP,
   lazy-load below-the-fold, and cache (LiteSpeed Cache / WP Rocket). Target LCP < 2.5s
   on a mid-range phone. Slow LCP is routinely worth more than any widget.
5. **Payment options.** Offer Bit and installment payments (תשלומים) if not already —
   both are expected by Israeli shoppers and their absence is a silent checkout killer.
6. **Return policy visibility.** One clear sentence near the buy button
   ("החזרה חינם תוך 14 יום") outperforms a policy page nobody opens.

## Phase 3 — Recover and retain

7. **Abandoned-cart email/WhatsApp** (e.g. CartFlows / retention plugin): 1h and 24h
   after abandonment, second message carries the exit coupon.
8. **Post-purchase cross-sell**: WooCommerce cross-sells on the thank-you page + a
   7-day follow-up email with a returning-customer coupon.

---

## Measurement plan — proving "it really drives results"

The plugin fires **Microsoft Clarity events** automatically (they appear in
Clarity → Filters → Events, and as "smart events"):

| Event | Fired when |
|---|---|
| `dcro_fs_bar_view` | Free-shipping bar seen |
| `dcro_sticky_add` | Sticky-bar add-to-cart clicked |
| `dcro_buy_now` | Buy-now clicked |
| `dcro_whatsapp_click` | WhatsApp button clicked |
| `dcro_exit_popup_view` / `dcro_exit_popup_claim` | Exit popup shown / coupon claimed |

The same events are pushed to `dataLayer`, so GA4 picks them up as custom events too.

### The weekly loop

1. **Baseline (before activating):** note 2 weeks of — sessions, add-to-cart rate,
   checkout starts, orders, AOV, mobile vs desktop split. Sources: WooCommerce →
   Analytics, plus the daily Clarity email this repo already sends.
2. **Activate** Phase 1, run 2 weeks, compare the same numbers. Watch Clarity
   session recordings filtered by the events above — e.g. sessions with
   `dcro_exit_popup_view` that still left tell you the offer is too weak.
3. **One change at a time** from Phase 2, 2 weeks each. If a feature shows no lift,
   toggle it off in the config — the kit is designed so every feature is reversible.
4. **KPIs that matter** (in priority order): conversion rate (orders/sessions),
   AOV, mobile conversion rate, cart-abandonment rate, dead-click/rage-click rate
   in Clarity on product pages.

### Guardrails

- Never show fake scarcity/timers — the low-stock notice reads real stock, and the
  dispatch countdown reflects your real cutoff. Fake urgency destroys ZAP-sourced
  trust and is penalized by review platforms.
- Keep the ZAP feed (this repo) and the site telling the same story: price,
  shipping cost, delivery time.
- The exit popup never appears on checkout, and respects a 7-day cooldown per visitor.
