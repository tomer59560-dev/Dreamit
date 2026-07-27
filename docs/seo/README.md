# Dreamit SEO Roadmap

**Site:** https://www.dreamitisrael.com (Shopify, Hebrew, Israel)
**Baseline:** 27 July 2026 · **revised with Google Search Console data**
**Sources:** Google Search Console (27 Jun – 24 Jul 2026), DataForSEO Labs (Israel / `he`), Firecrawl

> **Revision note.** The first version of this roadmap estimated ~40 organic visits/month from
> third-party data. Search Console shows the real number is **~190 clicks/month**. More importantly,
> it revealed that the primary problem is **not** what third-party data suggested. Sections 0–2 and
> the Day-30/60 phases have been substantially rewritten.

---

## 0. Where you actually are

### Headline numbers — last 28 days (27 Jun – 24 Jul 2026)

| Metric | Value |
|---|---|
| Clicks | **174** (~190/month) |
| Impressions | **2,912** |
| Average CTR | 5.97% |
| Average position | ~7 |
| Property verified | **14 May 2026** — only 10 weeks of history exists |
| Property type | **URL-prefix** (`https://www.dreamitisrael.com/`), not domain |

Third-party tools estimated 40 visits/month. The real figure is **4.4× higher**. That is normal —
estimation tools cannot see branded or long-tail traffic. Always trust Search Console.

### But strip out your own name

| Segment | Impressions | Clicks | CTR |
|---|---|---|---|
| **Branded** (`dreamit`, `דרימיט`, `dream it`, `דרים איט`, `dreamit israel`) | 155 | **71** | 45.8% |
| **Everything else** | 2,757 | **103** | 3.7% |

**41% of your clicks are people already looking for you by name.** Real discovery traffic is
roughly **110 clicks/month**. That is the number to grow.

### Growth trajectory

Impressions have gone from **~18/day in mid-May to ~110–145/day in late July** — roughly **7× in
ten weeks**. Clicks have stayed flat at 5–7/day.

That divergence is the whole story: **Google is showing you far more, and it is not translating
into visits.**

---

## 1. The finding that changes the plan

You do not primarily have a ranking problem. **You have a click-through problem.**

### Top-3 positions producing almost no clicks

| Query | Position | Impressions | Clicks | CTR | Expected at that position |
|---|---|---|---|---|---|
| <span dir="rtl">כורסאות בוקלה</span> | **1.67** | 9 | 0 | 0% | ~20% |
| <span dir="rtl">כורסאות מסתובבות</span> | **2.48** | 42 | 1 | 2.4% | ~12% |
| <span dir="rtl">כורסה מסתובבת</span> | **2.77** | 30 | 1 | 3.3% | ~11% |
| <span dir="rtl">זוג כורסאות לסלון</span> | **2.87** | 39 | **0** | 0% | ~11% |
| <span dir="rtl">זוג כורסאות</span> | **3.03** | 37 | 1 | 2.7% | ~10% |
| <span dir="rtl">כורסא מסתובבת לסלון</span> | **3.07** | 15 | **0** | 0% | ~10% |
| <span dir="rtl">הדום בוקלה</span> | 4.29 | 153 | 2 | 1.3% | ~8% |
| <span dir="rtl">כורסה עגולה</span> | 4.71 | 17 | **0** | 0% | ~7% |

And at page level:

| Page | Position | Impressions | Clicks | CTR |
|---|---|---|---|---|
| `/products/cloudy-swivel-armchairs-set` | **3.72** | 234 | **2** | 0.85% |
| `/collections/הדומים-וספסלים` | 10.9 | **833** | 15 | 1.8% |
| `/pages/contact` | 4.61 | 308 | **1** | 0.32% |
| `/pages/about` | 3.79 | 209 | 4 | 1.9% |

**You have already won the rankings on these terms. You are simply not being clicked.**

Bringing just the identified terms and pages up to normal CTR for the positions they *already
hold* is worth roughly **+40–50 clicks/month — a ~25% lift with no new content whatsoever.**
That is the single cheapest win available to you, and it is why the Day-30 phase has been rewritten
around it.

### Why is CTR so low? Four likely causes, in order

1. **Review stars almost never show.** You have 450 Judge.me reviews. `REVIEW_SNIPPET` appears on
   only **148 of 2,912 impressions (5%)**. `PRODUCT_SNIPPETS` appears on 826 (28%). Your competitors
   show stars and prices; you mostly don't. **Fix the review schema first** — it is the highest-
   leverage item on this entire list.
2. **SERP features push you below the fold.** These SERPs carry image packs, shopping carousels and
   video. "Position 2" organic can sit well down the page on mobile.
3. **Brand recognition.** Against IKEA and Betili, an unknown name loses the click even from a
   better position. This is why brand-building is an SEO activity, not just a marketing one.
4. **Titles truncate.** Long Hebrew product titles get cut off in mobile results.

### Desktop is materially worse than mobile

| Device | Impressions | Clicks | CTR | Avg position |
|---|---|---|---|---|
| Mobile | 1,592 | **124** | 7.8% | **5.9** |
| Desktop | 1,293 | 46 | 3.6% | **9.8** |
| Tablet | 27 | 4 | 14.8% | 4.4 |

Mobile drives **71% of clicks**. Desktop ranks nearly four positions worse for the same site —
worth investigating as a separate issue.

---

## 2. What is quietly working — and should be scaled

Search Console surfaced something third-party tools could never see. You are ranking **position 1–5
for long, conversational, natural-language Hebrew questions**:

| Query | Position | Impressions |
|---|---|---|
| <span dir="rtl">כורסאות במחירים טובים אונליין עם משלוח מהיר בישראל איפה כדאי לחפש</span> | 4.87 | 30 |
| <span dir="rtl">הדום אחסון נוח לשימוש יומיומי?</span> | 3.74 | 19 |
| <span dir="rtl">איפה קונים הדום עם אחסון מתחת למושב במחיר טוב</span> | 4.93 | 15 |
| <span dir="rtl">מחיר של הדום עגול קטיפה כמה זה אמור לעלות ואיפה הכי משתלם</span> | **1.78** | 9 |
| <span dir="rtl">הדום שמגיע עם משלוח מהיר בישראל ומה טווח המחירים</span> | **1.75** | 8 |
| <span dir="rtl">הדום עם אחסון עדיף על רגיל?</span> | 4.33 | 3 |
| <span dir="rtl">האם הדומים מתאימים כחלק מסלון מודרני</span> | **1.00** | 3 |
| <span dir="rtl">איך לבחור הדומים לסלון</span> | **1.67** | 3 |
| <span dir="rtl">כורסא מסתובבת לסלון מודרני המלצות על צבעים וחומרים שלא נראים מלוכלכים</span> | **1.00** | 1 |
| <span dir="rtl">הדום נפתח לאירוח מה הדגמים הכי טובים והאם זה באמת נוח</span> | **1.00** | 1 |
| <span dir="rtl">אילו דגמים של הדומים קיימים בסגנון מודרני?</span> | **1.00** | 1 |

Nobody types these into a search box. **This is AI-assisted search** — Google AI Mode, AI Overviews,
and assistant-grounded queries. Your `/agents.md` file and clean product specs are already paying off.

**This was a Day-365 item in the first draft. It is now a Day-60 priority.** You have a demonstrated,
measurable edge in the surface that is growing fastest, while your competitors are not even looking
at it. Clicks from these are near zero today because AI surfaces answer inline — but being the cited
source is how brand demand gets built, and brand demand is what actually converts.

**Also spotted:** <span dir="rtl">`сколько стоит`</span> ranking at position 1. Russian-language
demand from Israel's ~1M Russian speakers is entirely uncontested. Worth a test.

---

## 3. Wasted and harmful indexation — now confirmed with data

| URL pattern | Impressions | Clicks | Verdict |
|---|---|---|---|
| `/collections/כל-המוצרים?page=2` | 72 | **0** | Position **1.31** — ranking #1, zero clicks |
| `/collections/כל-המוצרים?page=4` | 92 | **0** | Position **1.39** |
| `/collections/כל-המוצרים?page=3` | 53 | **0** | Position **1.11** |
| `/collections/all?page=2,3` | 15 | 0 | Duplicate of the above, in English |
| `/cart` | 37 | 0 | **Your shopping cart is indexed** |
| `/search` | 17 | 0 | **Internal search results are indexed** |

**217 impressions at an average position of 1.3, producing zero clicks.** Paginated collection
pages are competing with — and cannibalising — the collection pages you actually want to rank.

Fix: `noindex, follow` on `?page=2+`, `/cart`, `/search`, `/checkout`. Canonicalise
`/collections/all` to `/collections/כל-המוצרים`. This is a one-hour theme edit.

---

## 4. The market, for context

Measured demand across 31 head and mid-tail terms: **~59,300 searches/month**, with long tail
realistically 120,000–150,000.

| Keyword | Vol/mo | Intent | Competitor referring domains |
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
| <span dir="rtl">כורסא מסתובבת</span> | 720 | **Transactional** | 1.1 — *+83% YoY* |
| <span dir="rtl">הדום לסלון</span> | 720 | Informational | 0.4 |
| <span dir="rtl">ספסל מרופד</span> | 480 | Informational | — *+85% YoY* |
| <span dir="rtl">כורסא מסתובבת לסלון</span> | 260 | **Transactional** | 1.1 — ***+129% YoY*** |
| <span dir="rtl">הדום בוקלה</span> | 390 | Informational | 0.2 — ***−56% YoY*** |

**The category is barely defended.** Page-one results carry **0.2–2.7 referring domains**;
<span dir="rtl">כורסא</span> at 18,100/mo has a **keyword difficulty of 2/100**. This is won on
content depth, not links — and that window will not stay open more than 18–24 months.

**Competitors:** IKEA dominates (avg position 1.8, ~10,300 visits/mo) and will not be displaced from
#1 this year. Realistic peers: betili-shop.com (1,538), urban-shop.co.il (683), leopardhome.com
(581), take-it.co.il (538), studio26shop.com (517), ace.co.il (426).

**Bouclé is fading.** <span dir="rtl">הדום בוקלה</span> −56% YoY, <span dir="rtl">כורסא בוקלה</span>
−46% YoY. Meanwhile swivel is +83% and storage benches +85%. Shift the emphasis accordingly.

---

## 5. Live defects found during the audit

| Problem | Where | Fix |
|---|---|---|
| **Phone number mismatch** — `055-7711959` vs `054-8192008` | Homepage vs contact page | Pick one. NAP consistency is a ranking signal |
| **Conflicting shipping promise** — "7 business days" vs "up to 10" | Header vs policy page | Pick one |
| **Broken footer link** — `/blogs/collections/כורסאות-מעוצבות` | Blog template | Should be `/collections/…` |
| **Blog titled "News"** in English, **zero posts** | `/blogs/news` | Rename to Hebrew, start publishing |
| **Six empty collections** | `swivel-armchairs`, `armchair-sets`, `best-sellers`, `new-arrivals`, `custom-made`, `כורסאות-נבחרות` | Fill with 500+ words or `noindex` |
| `og:image` over `http://` | Global | Change to `https://` |
| `user-scalable=no` in viewport | Global | Blocks pinch-zoom — accessibility exposure |
| **URL-prefix GSC property** | Search Console | Add a **domain property** to capture non-www and subdomains |

---

## 6. The roadmap

Targets are **clicks/month from Search Console** — the same metric throughout, so progress is
directly comparable. Revenue assumes ₪1,300 AOV and 1.0–1.4% conversion; replace with real Shopify
figures once GA4 is linked.

---

### Day 30 — Recover the clicks you have already earned · target 320–420 clicks/mo

**Theme: you are ranking. Get clicked.** This phase adds almost no content and is the highest ROI
work in the roadmap.

- [ ] **Fix review-snippet schema.** 450 reviews showing on 5% of impressions is the biggest single
      loss on the site. Validate with Google's Rich Results Test until stars render sitewide
- [ ] **Rewrite titles and meta descriptions for the 10 CTR-failing queries above**, leading with
      price, free shipping and "מגיע מורכב" — your genuine differentiators
- [ ] **`noindex, follow`** on `?page=2+`, `/cart`, `/search`, `/checkout`; canonicalise
      `/collections/all` → `/collections/כל-המוצרים`
- [ ] Complete `Product` schema with `price`, `availability`, `AggregateRating` on all 33 products
- [ ] Fix the phone number, shipping promise, broken footer link, `og:image`, viewport tag
- [ ] Add a **domain property** in Search Console alongside the existing URL-prefix one
- [ ] Link GA4 to Search Console so revenue is attributable to query
- [ ] Investigate the desktop position gap (9.8 vs 5.9 on mobile)
- [ ] Google Business Profile verified (Tamar 1, Alon Tavor)

**Milestone:** non-branded CTR up from 3.7% to 6%+, with no new pages published.

---

### Day 60 — Content engine + the AI edge · target 700–1,000 clicks/mo

- [ ] Three money collection pages rewritten — 800–1,200 words plus `FAQPage` schema
- [ ] **First 6 blog posts**, targeting the informational head terms:
      <span dir="rtl">כורסא לסלון</span> · <span dir="rtl">הדום אחסון</span> ·
      <span dir="rtl">פינת ישיבה</span> · <span dir="rtl">ספסל אחסון</span> ·
      <span dir="rtl">כורסא מסתובבת</span> · <span dir="rtl">בוקלה</span>
- [ ] **Build on the AI-search edge — moved up from Day 365.** Write Q&A content answering the exact
      conversational queries you already rank #1 for. Expand `/agents.md`. Publish explicit price
      ranges, delivery times and dimensions as structured, quotable facts — that is what assistants cite
- [ ] Every post links to 2–3 products and its parent collection
- [ ] Fix or `noindex` the six empty collections
- [ ] First 5–10 local citations
- [ ] **Test a Russian-language landing page** — position 1 already, zero competition

**Milestone:** 60–90 queries with impressions, and non-brand clicks exceed branded for the first time.

---

### Day 90 — Traction · target 1,500–2,400 clicks/mo · ~₪25,000/mo

- [ ] 12–15 posts published, two per week
- [ ] Buyer-intent comparison pages: <span dir="rtl">כורסא מסתובבת מול כורסא רגילה</span> ·
      <span dir="rtl">הדום מול ספסל אחסון</span> · <span dir="rtl">כמה עולה כורסא מעוצבת</span>
- [ ] Push `/collections/הדומים-וספסלים` from position 10.9 into the top 5 — it already earns
      **833 impressions**, the most of any page. Position is the constraint there, not CTR
- [ ] Product videos to YouTube, optimised in Hebrew, embedded on product pages
- [ ] `לקוחות עסקיים` built into a real B2B landing page — hotels, clinics, designers
- [ ] First link building: suppliers, Israeli design blogs, local press

**Milestone:** 3–5 commercial keywords in the top 10 *and* converting at normal CTR.

---

### Day 180 — Category challenger · target 4,500–7,000 clicks/mo · ~₪75,000/mo

- [ ] 30+ posts; topic clusters complete around each collection
- [ ] Top 5 for at least three of <span dir="rtl">כורסא מסתובבת</span>,
      <span dir="rtl">הדום אחסון</span>, <span dir="rtl">כורסאות מעוצבות</span>,
      <span dir="rtl">ספסל אחסון</span>
- [ ] Top 10 for <span dir="rtl">כורסא לסלון</span> (12,100/mo)
- [ ] **Catalogue expanded well past 33 SKUs** — long-tail rankings need long-tail inventory
- [ ] 20–30 referring domains
- [ ] Customer-photo programme running
- [ ] **Seasonal content live before the March peak** — every term peaks in March
      (<span dir="rtl">כורסא</span> hits 22,200). Publish in January

**Milestone:** you enter the competitor set beside betili-shop and urban-shop.

---

### Day 365 — Category authority · target 14,000–20,000 clicks/mo · ~₪260,000/mo

- [ ] 60+ content pieces; the Hebrew reference for designer seating
- [ ] **#1** across the swivel-armchair and armchair-set cluster
- [ ] **Top 3** for <span dir="rtl">הדום</span>, <span dir="rtl">הדום אחסון</span>,
      <span dir="rtl">כורסאות מעוצבות</span>, <span dir="rtl">ספסל אחסון</span>
- [ ] **Top 5** for <span dir="rtl">כורסא לסלון</span> and <span dir="rtl">כורסא</span> — behind
      IKEA, which is fine
- [ ] 300–500 queries ranking; **no single query above 15% of traffic** (today one brand term is 14%)
- [ ] 60–100 referring domains
- [ ] Branded search volume growing faster than category volume
- [ ] Established as a cited source across AI assistants — the edge you already have, compounded

**Milestone:** organic is your largest or second-largest acquisition channel.

---

### Year 5 — Compounding asset · target 70,000–110,000 clicks/mo

- **Category ownership.** IKEA keeps <span dir="rtl">כורסא</span>; you take everything a buyer
  searches once they know what they want.
- **Adjacent categories** — sofas, beds, dining, storage — on the same playbook.
- **Brand demand exceeds category demand.** More people searching
  <span dir="rtl">דרימאיט</span> than <span dir="rtl">כורסא מסתובבת</span>. Brand converts 5–10×
  better and cannot be taken from you. You are already at 41% branded — that is a real head start.
- **A moat** of 500+ content pieces, thousands of reviews, hundreds of referring domains. A
  competitor starting in 2029 faces a gap they cannot buy their way out of.
- **Arabic and Russian.** Both underserved, both already showing signal, both reachable via
  `hreflang` on your existing Shopify setup.

---

## 7. Measurement

Review **monthly**. Now that Search Console is connected, track these:

| Metric | Why |
|---|---|
| **Non-branded clicks** | The real growth number. Branded flatters everything |
| **Non-branded CTR** | Currently 3.7%. The Day-30 target is 6%+ |
| Impressions | Leading indicator — moves 4–8 weeks ahead of clicks |
| Queries in top 3 **and** their CTR | Ranking without clicks is not a win |
| `REVIEW_SNIPPET` share of impressions | Currently 5%. Should exceed 60% |
| Mobile vs desktop position gap | Currently 5.9 vs 9.8 |
| Branded share of clicks | 41% today. Should *fall* short-term, then rise as brand grows |
| Traffic concentration | No query above 15% |

**Expect the shape.** Content takes 8–12 weeks to settle. But the Day-30 CTR work should show up in
**7–14 days** — unusually fast, because you are not waiting on rankings you already hold.

---

## 8. If you only do five things

1. **Fix the review-snippet schema.** 450 reviews rendering on 5% of impressions is the most
   expensive single defect on the site.
2. **Rewrite the titles and metas for the ten queries where you rank top-3 and get no clicks.**
   ~25% more traffic, no new content.
3. **`noindex` the pagination, cart and search pages.** One hour of theme work.
4. **Publish two Hebrew guides a week, every week.** This is the long game and there is no substitute.
5. **Lean into the AI-search edge you already have.** You rank #1 for conversational queries your
   competitors have not noticed exist.

The category is winnable, the competition is asleep, and — unusually — your first month of work is
about collecting rankings you have already earned rather than fighting for new ones.

---

*Baseline 27 July 2026. Search Console history begins 14 May 2026. Re-measure at day 30 and update
these tables — this is a living scoreboard, not a one-time plan.*
