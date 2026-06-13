/**
 * Static site generator for ZAP mirror.
 * Scrapes dreamitisrael.com → writes dist/index.html + dist/category/<slug>.xml
 * Run by GitHub Actions, output deployed to GitHub Pages.
 */
const axios  = require('axios');
const cheerio = require('cheerio');
const fs     = require('fs');
const path   = require('path');

const SITE_URL      = 'https://www.dreamitisrael.com';
const STORE_NAME    = 'Dream It Israel';
const DIST_DIR      = path.resolve(__dirname, '../dist');
const CAT_DIR       = path.join(DIST_DIR, 'category');

// Read from env so the Action can override defaults
const DEFAULT_SHIPPING  = process.env.DEFAULT_SHIPPING  || '0';
const DEFAULT_DELIVERY  = process.env.DEFAULT_DELIVERY  || '3';
const DEFAULT_WARRANTY  = process.env.DEFAULT_WARRANTY  || '12 חודשים';
const DEFAULT_WARRANTY_BY = process.env.DEFAULT_WARRANTY_BY || 'Dream It Israel';

const http = axios.create({
  baseURL: SITE_URL,
  timeout: 20000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'he,en;q=0.9',
  },
});

// ─── HELPERS ────────────────────────────────────────────────────────────────

function xmlEsc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function sanitizeUrl(url) {
  return (url || '').replace(/'/g, '').replace(/[^\x00-\x7F]/g, c => encodeURIComponent(c));
}

function strip(s) { return (s || '').replace(/<[^>]*>/g, '').trim(); }
function trunc(s, n) { return String(s || '').substring(0, n); }

// ─── SCRAPER ────────────────────────────────────────────────────────────────

async function getCategories() {
  console.log('Fetching categories…');

  // Try WooCommerce REST API first
  try {
    const { data } = await http.get('/wp-json/wc/v3/products/categories?per_page=100&hide_empty=1');
    if (Array.isArray(data) && data.length) {
      return data.map(c => ({
        slug: c.slug,
        name: strip(c.name),
        url:  `${SITE_URL}/product-category/${c.slug}/`,
      }));
    }
  } catch { /* fall through to scraping */ }

  // Scrape homepage
  const { data: html } = await http.get('/');
  const $ = cheerio.load(html);
  const cats = [];
  const seen = new Set();

  $('a[href*="/product-category/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const m = href.match(/product-category\/([^/?#]+)/);
    if (!m || seen.has(m[1])) return;
    seen.add(m[1]);
    cats.push({
      slug: m[1],
      name: $(el).text().trim() || m[1],
      url:  `${SITE_URL}/product-category/${m[1]}/`,
    });
  });

  return cats;
}

async function getProductsWc(slug) {
  const { data } = await http.get(
    `/wp-json/wc/v3/products?per_page=100&category_slug=${encodeURIComponent(slug)}&status=publish`
  );
  return (data || []).map(p => {
    const image = (p.images?.[0]?.src || '').replace(/-\d+x\d+(\.\w+)$/, '$1');
    const brand = (p.attributes || []).find(a => /מותג|brand/iu.test(a.name))?.options?.[0] || '';
    return {
      id: String(p.id), name: strip(p.name), model: p.sku || '',
      description: strip(p.short_description || p.description),
      url: p.permalink, image, price: p.price || '',
      barcode: '', brand,
      warranty: DEFAULT_WARRANTY, warrantyBy: DEFAULT_WARRANTY_BY,
      shipping: DEFAULT_SHIPPING, delivery: DEFAULT_DELIVERY,
    };
  });
}

async function scrapeProductPage(url) {
  const { data: html } = await http.get(url.replace(SITE_URL, ''));
  const $ = cheerio.load(html);
  const name  = $('h1.product_title').first().text().trim();
  const price = $('.price .woocommerce-Price-amount bdi').first().text().replace(/[^\d.]/g, '');
  const image = ($('.woocommerce-product-gallery__image img').first().attr('data-large_image') ||
                 $('.woocommerce-product-gallery__image img').first().attr('src') || '');
  const sku   = $('.sku').text().trim();
  const desc  = $('.woocommerce-product-details__short-description').first().text().trim();
  if (!name || !price) return null;
  return {
    id: sku || path.basename(url.replace(/\/$/, '')),
    name, model: sku, description: desc,
    url, image, price, barcode: '', brand: '',
    warranty: DEFAULT_WARRANTY, warrantyBy: DEFAULT_WARRANTY_BY,
    shipping: DEFAULT_SHIPPING, delivery: DEFAULT_DELIVERY,
  };
}

async function getProductsScrape(catUrl) {
  const products = [];
  let page = 1;
  while (true) {
    const pageUrl = page === 1 ? catUrl : catUrl.replace(/\/$/, '') + `/page/${page}/`;
    let html;
    try { ({ data: html } = await http.get(pageUrl.replace(SITE_URL, ''))); }
    catch { break; }

    const $ = cheerio.load(html);
    const links = [];
    $('ul.products li.product a.woocommerce-loop-product__link').each((_, el) => {
      const h = $(el).attr('href');
      if (h && !links.includes(h)) links.push(h);
    });
    if (!links.length) break;

    for (const link of links) {
      try { const p = await scrapeProductPage(link); if (p) products.push(p); }
      catch { /* skip broken product page */ }
    }

    if (!$('.woocommerce-pagination .next, .navigation .next').length) break;
    page++;
  }
  return products;
}

async function getProducts(cat) {
  try { return await getProductsWc(cat.slug); } catch { /* fall through */ }
  return getProductsScrape(cat.url);
}

// ─── XML / HTML BUILDERS ─────────────────────────────────────────────────────

function buildXml(products) {
  let items = '';
  for (const p of products) {
    const name    = trunc(strip(p.name), 120);
    const details = trunc(strip(p.description), 255);
    const url     = trunc(sanitizeUrl(p.url), 255);
    const image   = trunc(sanitizeUrl(p.image), 255);
    const price   = (p.price || '').replace(/[^\d.]/g, '');

    items += `    <PRODUCT>
      <URL_PRODUCT>${xmlEsc(url)}</URL_PRODUCT>
      <NAME_PRODUCT>${xmlEsc(name)}</NAME_PRODUCT>
      <MODEL>${xmlEsc(p.model)}</MODEL>
      <DETAILS>${xmlEsc(details)}</DETAILS>
      <NUMBER_CATALOG>${xmlEsc(p.barcode)}</NUMBER_CATALOG>
      <PRODUCTCODE>${xmlEsc(p.id)}</PRODUCTCODE>
      <CURRENCY>ILS</CURRENCY>
      <PRICE>${xmlEsc(price)}</PRICE>
      <COST_SHIPMENT>${xmlEsc(p.shipping)}</COST_SHIPMENT>
      <TIME_DELIVERY>${xmlEsc(p.delivery)}</TIME_DELIVERY>
      <MANUFACTURER>${xmlEsc(p.brand)}</MANUFACTURER>
      <WARRANTY>${xmlEsc(trunc(p.warranty, 100))}</WARRANTY>
      <WARRANTYBY>${xmlEsc(trunc(p.warrantyBy, 200))}</WARRANTYBY>
      <IMAGE>${xmlEsc(image)}</IMAGE>
      <TAX></TAX>
    </PRODUCT>\n`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<STORE>\n  <PRODUCTS>\n${items}  </PRODUCTS>\n</STORE>`;
}

function buildIndex(cats, baseUrl) {
  const rows = cats.map(c =>
    `    <li><a href="${baseUrl}/category/${c.slug}.xml">${c.name}</a></li>`
  ).join('\n');
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${STORE_NAME} — ZAP Mirror</title>
  <style>
    body{font-family:Arial,sans-serif;direction:rtl;padding:24px;background:#f7f7f7}
    h1{color:#222}ul{list-style:none;padding:0}
    li{margin:8px 0}a{color:#0066cc;font-size:1.05em;text-decoration:none}
    a:hover{text-decoration:underline}small{color:#888}
  </style>
</head>
<body>
  <h1>${STORE_NAME}</h1>
  <h2>קטגוריות מוצרים</h2>
  <ul>
${rows}
  </ul>
  <p><small>עדכון אחרון: ${new Date().toLocaleString('he-IL', {timeZone:'Asia/Jerusalem'})}</small></p>
</body>
</html>`;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

(async () => {
  const baseUrl = process.env.PAGES_BASE_URL || '';  // e.g. https://user.github.io/meta-ads

  fs.mkdirSync(CAT_DIR, { recursive: true });

  const cats = await getCategories();
  console.log(`Found ${cats.length} categories.`);

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), buildIndex(cats, baseUrl), 'utf-8');
  console.log('Wrote dist/index.html');

  for (const cat of cats) {
    console.log(`  Processing: ${cat.name} (${cat.slug})`);
    const products = await getProducts(cat);
    console.log(`    → ${products.length} products`);
    const xmlFile = path.join(CAT_DIR, `${cat.slug}.xml`);
    fs.writeFileSync(xmlFile, buildXml(products), 'utf-8');
  }

  console.log('Done. dist/ is ready for GitHub Pages.');
})().catch(err => { console.error(err); process.exit(1); });
