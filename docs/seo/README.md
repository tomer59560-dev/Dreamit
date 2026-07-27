# Dreamit SEO — Action Plan

**Site:** https://www.dreamitisrael.com (Shopify, Hebrew, Israel)
**Data:** Google Search Console, 27 Jun – 24 Jul 2026 · DataForSEO Labs (Israel / `he`)
**Updated:** 27 July 2026

> **Part 1 is what to do, in order. Everything after is the evidence for why.**
> Actions are sequenced by impact ÷ effort. Do them top to bottom. Do not skip ahead to
> content — actions 1–4 recover traffic you have *already earned* and take about a day in total.

---

# PART 1 — DO THIS NOW

## ⬛ Action 1 — Turn on review stars in search results

**Time: 1–2 hours · Impact: highest on the list**

You have **450 Judge.me reviews**. Star ratings currently appear on **5% of your search
impressions** (148 of 2,912). Competitors show stars and prices; you mostly show plain blue text.
This is the biggest single reason your click-through rate is collapsing.

**Do this:**

1. **Judge.me → Settings → SEO / Rich snippets** — confirm "Enable rich snippets" is ON.
2. **Check for duplicate product schema.** This is the usual culprit. Your Shopify theme almost
   certainly outputs its own `Product` JSON-LD *without* `aggregateRating`. When two `Product`
   blocks exist on one page, Google often picks the one without ratings and drops your stars.
   - View source on `/products/cloudy-armchair`, search for `"@type":"Product"`.
   - If it appears **twice**, remove the theme's block (usually in
     `snippets/product-json-ld.liquid` or inside `sections/main-product.liquid`) and keep
     Judge.me's — or add `aggregateRating` to the theme's and disable Judge.me's.
3. **Validate:** paste the product URL into
   [Rich Results Test](https://search.google.com/test/rich-results). You want `Product` valid,
   with `aggregateRating`, `price` **and** `availability` all present. No warnings.
4. Repeat the check on one collection page and one bundle page.

**Done when:** Rich Results Test shows a valid `Product` snippet with rating, price and
availability on every product template.

---

## ⬛ Action 2 — Rewrite 7 titles and meta descriptions

**Time: 1 hour · Impact: ~25% more traffic, no new content**

These pages already rank in the top 5. They get almost no clicks. Below is exact copy — paste it in.

Shopify: **Products → [product] → scroll to "Search engine listing" → Edit.**

---

### 2.1 `/products/cloudy-swivel-armchairs-set`
> **Position 1.58** for <span dir="rtl">כורסאות מסתובבות</span> · 95 impressions across its queries · **0 clicks**
> *This is your single worst loss on the site — ranking #1.6 and earning nothing.*

**Title**
```
זוג כורסאות מסתובבות לסלון | 3,189 ₪ במקום 4,400 ₪
```
**Meta description**
```
זוג כורסאות מסתובבות 360° מרופדות ומעוצבות. מגיעות מורכבות לגמרי – בלי הרכבה. 10 ביקורות בדירוג 5/5. משלוח חינם עד הבית תוך 7 ימי עסקים.
```

---

### 2.2 `/products/flower-duo-swivel-chair-set`
> **Position 1.67** for <span dir="rtl">כורסאות בוקלה</span> · **position 1.57** for <span dir="rtl">זוג כורסאות לסלון</span> · **0 clicks**

**Title**
```
זוג כורסאות בוקלה מסתובבות דגם Flower Duo | משלוח חינם
```
**Meta description**
```
זוג כורסאות בוקלה מסתובבות 360° בעיצוב פרח ייחודי. בד בוקלה רך, מושב עמוק ומפנק. מגיעות מורכבות. משלוח חינם עד הבית תוך 7 ימי עסקים.
```

---

### 2.3 `/products/flow-360-swivel-chair`
> Position 2.77 for <span dir="rtl">כורסה מסתובבת</span> · 30 impressions · 1 click (3.3%)

**Title**
```
כורסה מסתובבת 360° לסלון | 1,099 ₪ במקום 1,800 ₪
```
**Meta description**
```
כורסה מסתובבת 360° בבד ארוג איכותי, 18 ביקורות מלקוחות. מגיעה מורכבת מוכנה לשימוש – בלי הרכבה. משלוח חינם עד הבית תוך 7 ימי עסקים.
```

---

### 2.4 `/products/cloudy-armchair`
> **Position 1.0** for <span dir="rtl">כורסא מסתובבת לסלון</span> · position 3.09 for <span dir="rtl">כורסה מסתובבת</span> · **0 clicks**

**Title**
```
כורסא מסתובבת לסלון דגם Cloudy | 1,599 ₪ במקום 2,200 ₪
```
**Meta description**
```
הכורסה הנמכרת ביותר שלנו – 17 ביקורות. מושב עוטף, סיבוב מלא 360°, מגיעה מורכבת מוכנה לשימוש. משלוח חינם עד הבית תוך 7 ימי עסקים.
```

---

### 2.5 `/products/armchair-auri`
> **70 impressions** for <span dir="rtl">כורסא עגולה</span> at position 8 · position 4.71 for <span dir="rtl">כורסה עגולה</span> · 1 click total

**Title**
```
כורסא עגולה מבד בוקלה דגם Auri | 599 ₪ במקום 850 ₪
```
**Meta description**
```
כורסא עגולה מעוצבת מבד בוקלה רך ומפנק, 12 ביקורות. מגיעה מורכבת מוכנה לשימוש. משלוח חינם עד הבית תוך 7 ימי עסקים.
```

---

### 2.6 `/collections/כורסאות-מעוצבות`
> ⚠️ **Ranks position 34 for <span dir="rtl">כורסאות מעוצבות</span> — its own exact-match keyword, 880 searches/month.**
> Your product pages outrank your own category page. That is backwards.

**Title**
```
כורסאות מעוצבות לסלון | מ-599 ₪ | משלוח חינם – Dreamit
```
**Meta description**
```
כורסאות מעוצבות ומסתובבות לסלון החל מ-599 ₪. כל הכורסאות מגיעות מורכבות – בלי הרכבה. 450 ביקורות מלקוחות. משלוח חינם עד הבית תוך 7 ימי עסקים.
```

---

### 2.7 `/collections/הדומים-וספסלים`
> **833 impressions — the most of any page on the site** · position 10.9 · CTR 1.8%

**Title**
```
הדומים וספסלי אחסון מעוצבים | מ-299 ₪ | משלוח חינם
```
**Meta description**
```
הדומי בוקלה, הדומי אחסון וספסלים מעוצבים החל מ-299 ₪. מגיעים מורכבים מוכנים לשימוש. 450 ביקורות. משלוח חינם עד הבית תוך 7 ימי עסקים.
```

**Formula, if you write more yourself:** `[keyword] | [price] ₪ במקום [was] ₪ | משלוח חינם`
Lead with price, free shipping, and <span dir="rtl">מגיע מורכב</span> — assembly-free delivery is
your genuine differentiator and no competitor claims it.

---

## ⬛ Action 3 — Stop Google indexing pages that can't convert

**Time: 30 minutes · Impact: fixes confirmed cannibalisation**

Your paginated collection URLs rank at **position 1.3 across 217 impressions and produce zero
clicks**, competing directly with the collection pages you actually want ranked. Your cart and
internal search pages are also indexed.

**Do this:** Shopify admin → **Online Store → Themes → ⋯ → Edit code** → open `layout/theme.liquid`.
Paste this immediately before `</head>`:

```liquid
{%- if current_page > 1
   or template.name == 'cart'
   or template.name == 'search'
   or collection.handle == 'all' -%}
  <meta name="robots" content="noindex, follow">
{%- endif -%}
```

That covers all four problems: pagination, cart, internal search, and the duplicate
`/collections/all` (which duplicates `/collections/כל-המוצרים`). Shopify already noindexes
`/checkout`.

**Verify:** view source on `/collections/כל-המוצרים?page=2` and confirm the robots tag is present,
then confirm it is **absent** on `/collections/כל-המוצרים`.

---

## ⬛ Action 4 — Fix the contradictions on your own site

**Time: 30 minutes · Impact: trust, local ranking, and credibility**

| # | Problem | Where | Fix |
|---|---|---|---|
| 4.1 | **Two different phone numbers** — `055-7711959` on the homepage, `054-8192008` on the contact page | Homepage header / contact page | Pick one and use it everywhere. Inconsistent NAP directly suppresses local ranking |
| 4.2 | **Two different shipping promises** — "7 business days" in the header, "up to 10 business days" in the policy | Header / shipping policy | Pick one. Google reads both, and so do customers |
| 4.3 | **Broken footer link** — `/blogs/collections/כורסאות-מעוצבות` | Blog template footer | Change to `/collections/כורסאות-מעוצבות` |
| 4.4 | `og:image` served over `http://` | `theme.liquid` | Change to `https://` |
| 4.5 | `user-scalable=no` blocks pinch-zoom | `theme.liquid` viewport tag | Remove it — accessibility signal and an Israeli compliance exposure |
| 4.6 | Blog titled **"News"** in English, zero posts | `/blogs/news` | Rename to <span dir="rtl">מדריכים ורעיונות לעיצוב הבית</span> |

---

## ⬛ Action 5 — Fix the keyword cannibalisation

**Time: 1 hour · Impact: stops your own pages competing**

Three different pages are competing for the same searches. Google keeps switching between them,
so no single result ever builds recognition — which is part of why CTR is so low.

| Query | Pages competing | Decide |
|---|---|---|
| <span dir="rtl">כורסאות מסתובבות</span> | `cloudy-swivel-armchairs-set` (1.58) · `collections/כורסאות-מעוצבות` (7.62) · `flower-duo` (13.5) | **Collection page should win.** Point product pages at it internally |
| <span dir="rtl">זוג כורסאות לסלון</span> | `cloudy-swivel-armchairs-set` (3.15) · `flower-duo` (1.57) | Pick **one** hero product for this term |
| <span dir="rtl">כורסה מסתובבת</span> | `flow-360-swivel-chair` (2.77) · `cloudy-armchair` (3.09) | Pick **one** |

**Do this:** for each cluster, choose the page that should rank, then link to it from the other
pages using the target keyword as the link text. Make sure the losing pages do **not** use that
keyword in their title tag.

---

## ⬛ Action 6 — Add a domain property in Search Console

**Time: 15 minutes**

Your current property is **URL-prefix** (`https://www.dreamitisrael.com/`), which only tracks that
exact prefix. A domain property captures non-www, http, and any subdomain.

Search Console → property dropdown → **Add property** → **Domain** → `dreamitisrael.com` → add the
TXT record in your Shopify domain settings. Keep the existing property; run both.

---

## ⬛ Action 7 — Fill or remove the six empty collections

**Time: 2 hours**

These are crawlable with no title, no description and no content. Thin pages drag down how Google
assesses the whole domain.

`/collections/swivel-armchairs` · `/collections/armchair-sets` · `/collections/best-sellers`
`/collections/new-arrivals` · `/collections/custom-made` · `/collections/כורסאות-נבחרות`

**Highest priority of the six: `/collections/swivel-armchairs`.** <span dir="rtl">כורסא
מסתובבת</span> gets 720 searches/month and is growing **+83% year over year** — it is your best
structural opportunity and the page is currently empty.

For each: either write a 500+ word Hebrew intro with products, or `noindex` it.

---

### That's the "now" list. Roughly one working day.

Expect movement in **7–14 days** — unusually fast, because none of this waits on new rankings.

**Then, and only then, start the content engine** — two Hebrew guides per week, forever. That is
Part 2.

---

# PART 2 — The 30/60/90/180/365-day roadmap

Targets are **Search Console clicks per month**. Revenue assumes ₪1,300 AOV and 1.0–1.4%
conversion — replace with real Shopify numbers once GA4 is connected.

| Phase | Target | Theme |
|---|---|---|
| **Today** | ~190/mo | 41% of it is people searching your own name |
| **Day 30** | 320–420 | Actions 1–7 above. Recover earned clicks |
| **Day 60** | 700–1,000 | Content engine starts + AI-search edge |
| **Day 90** | 1,500–2,400 · ~₪25k/mo | Traction |
| **Day 180** | 4,500–7,000 · ~₪75k/mo | Category challenger |
| **Day 365** | 14,000–20,000 · ~₪260k/mo | Category authority |
| **Year 5** | 70,000–110,000 | Compounding asset |

### Day 60 — content engine + the AI edge

- Rewrite the three money collection pages: 800–1,200 words of genuinely useful Hebrew **below**
  the product grid, plus `FAQPage` schema. Nearly every head term in this category has
  *informational* intent — Google wants a guide, not a bare grid.
- **First six blog posts**, aimed straight at head terms:
  <span dir="rtl">כורסא לסלון</span> (12,100/mo) · <span dir="rtl">הדום אחסון</span> (2,900) ·
  <span dir="rtl">פינת ישיבה</span> (3,600) · <span dir="rtl">ספסל אחסון</span> (2,900) ·
  <span dir="rtl">כורסא מסתובבת</span> (720) · <span dir="rtl">בוקלה</span> (390)
- **Build on the AI-search edge** (see Part 3.3). Write Q&A content answering the conversational
  queries you already rank #1 for. Expand `/agents.md`. Publish explicit price ranges, delivery
  times and dimensions as structured, quotable facts — that is what assistants cite.
- Every post links to 2–3 products and its parent collection.
- First 5–10 local citations; Google Business Profile verified (Tamar 1, Alon Tavor).
- **Test a Russian-language landing page** — you already rank #1 for
  <span dir="rtl">сколько стоит</span>, and Israel's ~1M Russian speakers are uncontested here.

### Day 90 — traction

- 12–15 posts published, two per week.
- Buyer-intent comparison pages — high converting, near-zero competition:
  <span dir="rtl">כורסא מסתובבת מול כורסא רגילה</span> ·
  <span dir="rtl">הדום מול ספסל אחסון</span> · <span dir="rtl">כמה עולה כורסא מעוצבת</span>
- Push `/collections/הדומים-וספסלים` from position 10.9 into the top 5 — it already earns the most
  impressions of any page. There the constraint is **position**, not CTR.
- Product videos to YouTube, optimised in Hebrew, embedded on product pages.
- <span dir="rtl">לקוחות עסקיים</span> built into a real B2B landing page — hotels, clinics,
  designers. Low volume, very high AOV, almost no competition.
- First link building: suppliers, Israeli design blogs, local press.

### Day 180 — category challenger

- 30+ posts; topic clusters complete around each collection.
- Top 5 for at least three of <span dir="rtl">כורסא מסתובבת</span>,
  <span dir="rtl">הדום אחסון</span>, <span dir="rtl">כורסאות מעוצבות</span>,
  <span dir="rtl">ספסל אחסון</span>. Top 10 for <span dir="rtl">כורסא לסלון</span> (12,100/mo).
- **Catalogue expanded well past 33 SKUs.** You cannot outrank a category with 33 products —
  long-tail rankings need long-tail inventory.
- 20–30 referring domains; customer-photo programme running.
- **Seasonal content live before the March peak.** Every term in this category peaks in March
  (<span dir="rtl">כורסא</span> hits 22,200). Publish in January, not March.

### Day 365 — category authority

- 60+ content pieces; the Hebrew reference for designer seating.
- **#1** across the swivel-armchair and armchair-set cluster.
- **Top 3** for <span dir="rtl">הדום</span>, <span dir="rtl">הדום אחסון</span>,
  <span dir="rtl">כורסאות מעוצבות</span>, <span dir="rtl">ספסל אחסון</span>.
- **Top 5** for <span dir="rtl">כורסא לסלון</span> and <span dir="rtl">כורסא</span> — behind IKEA,
  which is fine.
- 300–500 queries ranking, none above 15% of traffic. 60–100 referring domains.
- Established as a cited source across AI assistants.

### Year 5 — compounding asset

- **Category ownership.** IKEA keeps <span dir="rtl">כורסא</span>; you take everything a buyer
  searches once they know what they want.
- **Adjacent categories** — sofas, beds, dining, storage — on the same playbook.
- **Brand demand exceeds category demand.** More people searching
  <span dir="rtl">דרימאיט</span> than <span dir="rtl">כורסא מסתובבת</span>. Brand converts 5–10×
  better and cannot be taken from you — and at 41% branded today you already have a head start.
- **A moat** of 500+ content pieces, thousands of reviews, hundreds of referring domains.
- **Arabic and Russian** — both underserved, both already showing signal.

---

# PART 3 — The data behind it

## 3.1 Where you actually are

| Metric | Value |
|---|---|
| Clicks (28 days) | **174** (~190/month) |
| Impressions (28 days) | **2,912** |
| Average CTR | 5.97% |
| Average position | ~7 |
| GSC history begins | **14 May 2026** — only 10 weeks exists |

| Segment | Impressions | Clicks | CTR |
|---|---|---|---|
| **Branded** (`dreamit`, `דרימיט`, `dream it`, `דרים איט`, `dreamit israel`) | 155 | **71** | 45.8% |
| **Everything else** | 2,757 | **103** | 3.7% |

**41% of clicks are people already looking for you by name.** Real discovery traffic is ~110
clicks/month.

**The divergence that defines the problem:** impressions grew from **~18/day in mid-May to
~110–145/day in late July — roughly 7× in ten weeks.** Clicks stayed flat at 5–7/day.

## 3.2 The click-through failure, in detail

| Query | Page | Position | Impr. | Clicks | CTR | Expected |
|---|---|---|---|---|---|---|
| <span dir="rtl">כורסאות מסתובבות</span> | `cloudy-swivel-armchairs-set` | **1.58** | 33 | **0** | 0% | ~18% |
| <span dir="rtl">כורסאות בוקלה</span> | `flower-duo-swivel-chair-set` | **1.67** | 9 | **0** | 0% | ~18% |
| <span dir="rtl">זוג כורסאות לסלון</span> | `flower-duo-swivel-chair-set` | **1.57** | 7 | **0** | 0% | ~18% |
| <span dir="rtl">כורסא מסתובבת לסלון</span> | `cloudy-armchair` | **1.00** | 2 | **0** | 0% | ~28% |
| <span dir="rtl">כורסה מסתובבת</span> | `flow-360-swivel-chair` | 2.77 | 30 | 1 | 3.3% | ~11% |
| <span dir="rtl">זוג כורסאות לסלון</span> | `cloudy-swivel-armchairs-set` | 3.15 | 33 | **0** | 0% | ~10% |
| <span dir="rtl">כורסא עגולה</span> | `armchair-auri` | 8.04 | 70 | 1 | 1.4% | ~3% |
| <span dir="rtl">הדום בוקלה</span> | `collections/הדומים-וספסלים` | 4.29 | 153 | 2 | 1.3% | ~8% |

**Search appearance:** `REVIEW_SNIPPET` on **148 of 2,912 impressions (5%)**;
`PRODUCT_SNIPPETS` on 826 (28%). That is the root cause behind Action 1.

**By device:**

| Device | Impressions | Clicks | CTR | Avg position |
|---|---|---|---|---|
| Mobile | 1,592 | **124** | 7.8% | **5.9** |
| Desktop | 1,293 | 46 | 3.6% | **9.8** |
| Tablet | 27 | 4 | 14.8% | 4.4 |

Mobile drives 71% of clicks. Desktop ranks nearly four positions worse — worth investigating
separately.

## 3.3 What is quietly working — the AI-search edge

You rank **position 1–5 for long, conversational Hebrew questions**:

| Query | Position | Impr. |
|---|---|---|
| <span dir="rtl">כורסאות במחירים טובים אונליין עם משלוח מהיר בישראל איפה כדאי לחפש</span> | 4.87 | 30 |
| <span dir="rtl">הדום אחסון נוח לשימוש יומיומי?</span> | 3.74 | 19 |
| <span dir="rtl">איפה קונים הדום עם אחסון מתחת למושב במחיר טוב</span> | 4.93 | 15 |
| <span dir="rtl">מחיר של הדום עגול קטיפה כמה זה אמור לעלות ואיפה הכי משתלם</span> | **1.78** | 9 |
| <span dir="rtl">הדום שמגיע עם משלוח מהיר בישראל ומה טווח המחירים</span> | **1.75** | 8 |
| <span dir="rtl">האם הדומים מתאימים כחלק מסלון מודרני</span> | **1.00** | 3 |
| <span dir="rtl">איך לבחור הדומים לסלון</span> | **1.67** | 3 |
| <span dir="rtl">כורסא מסתובבת לסלון מודרני המלצות על צבעים וחומרים שלא נראים מלוכלכים</span> | **1.00** | 1 |

Nobody types these. This is **AI-assisted search** — AI Mode, AI Overviews, assistant-grounded
queries. Your `/agents.md` file is already paying off. Clicks are near zero because assistants
answer inline, but being the *cited source* builds brand demand, and brand demand converts.

## 3.4 Indexation waste

| URL | Position | Impr. | Clicks |
|---|---|---|---|
| `/collections/כל-המוצרים?page=4` | **1.39** | 92 | 0 |
| `/collections/כל-המוצרים?page=2` | **1.31** | 72 | 0 |
| `/collections/כל-המוצרים?page=3` | **1.11** | 53 | 0 |
| `/cart` | 6.84 | 37 | 0 |
| `/search` | 4.59 | 17 | 0 |

## 3.5 The market

**~59,300 searches/month** measured across 31 head and mid-tail terms; long tail realistically
120,000–150,000.

| Keyword | Vol/mo | Intent | Competitor ref. domains |
|---|---|---|---|
| <span dir="rtl">כורסא / כורסה / כורסאות</span> | **18,100** | Informational | 2.7 · **KD 2** |
| <span dir="rtl">כורסא לסלון / כורסאות לסלון</span> | **12,100** | **Transactional** | 2.0 |
| <span dir="rtl">הדום</span> | **6,600** | Informational | 0.7 |
| <span dir="rtl">פינת ישיבה</span> | **3,600** | Informational | 0.3 |
| <span dir="rtl">הדום אחסון</span> | **2,900** | Informational | **0.2** |
| <span dir="rtl">ספסל אחסון</span> | **2,900** | **Transactional** | — |
| <span dir="rtl">ריהוט לבית</span> | 2,400 | Informational | — |
| <span dir="rtl">כורסא לחדר שינה</span> | 1,000 | **Transactional** | 0.8 |
| <span dir="rtl">כורסאות מעוצבות</span> | 880 | Commercial | 0.9 |
| <span dir="rtl">כורסא מסתובבת</span> | 720 | **Transactional** | 1.1 · *+83% YoY* |
| <span dir="rtl">ספסל מרופד</span> | 480 | Informational | — · *+85% YoY* |
| <span dir="rtl">כורסא מסתובבת לסלון</span> | 260 | **Transactional** | 1.1 · ***+129% YoY*** |
| <span dir="rtl">הדום בוקלה</span> | 390 | Informational | 0.2 · ***−56% YoY*** |

**Why an aggressive timeline is credible:** page-one results carry **0.2–2.7 referring domains**,
and <span dir="rtl">כורסא</span> (18,100/mo) has a **keyword difficulty of 2/100**. This category is
won on content depth, not backlinks. **That window will not stay open more than 18–24 months.**

**Competitors:** IKEA is a wall (avg position 1.8, ~10,300 visits/mo, #1 on most head terms) — take
positions 2–5 on broad terms and #1 on everything specific. Realistic peers: betili-shop.com
(1,538), urban-shop.co.il (683), leopardhome.com (581), take-it.co.il (538), studio26shop.com (517).

**Bouclé is fading.** <span dir="rtl">הדום בוקלה</span> −56% YoY,
<span dir="rtl">כורסא בוקלה</span> −46%. Swivel is +83%, storage benches +85%. Shift the emphasis.

## 3.6 What to watch

| Metric | Today | Target |
|---|---|---|
| **Non-branded clicks** | ~110/mo | The real growth number |
| **Non-branded CTR** | **3.7%** | 6%+ by day 30 |
| `REVIEW_SNIPPET` share of impressions | **5%** | 60%+ |
| Queries in top 3 — *and their CTR* | 8 | Ranking without clicks is not a win |
| Mobile vs desktop position | 5.9 / 9.8 | Close the gap |
| Branded share of clicks | 41% | Falls short-term, rises long-term |

**Expect the shape.** Content takes 8–12 weeks to settle. But Actions 1–5 should show in
**7–14 days**, because nothing has to be re-ranked first.

---

*Baseline 27 July 2026. GSC history begins 14 May 2026. Re-measure at day 30 and update these
tables — this is a living scoreboard, not a one-time plan.*
