/**
 * Static site generator for ZAP mirror.
 * Tries data sources in order: Shopify API → WooCommerce API → HTML scrape
 * Writes dist/index.html + dist/category/<slug>.xml
 */
const axios  = require('axios');
const cheerio = require('cheerio');
const fs     = require('fs');
const path   = require('path');

const SITE_URL   = 'https://www.dreamitisrael.com';
const STORE_NAME = 'Dream It Israel';
const DIST_DIR   = path.resolve(__dirname, '../dist');
const CAT_DIR    = path.join(DIST_DIR, 'category');

const SHIPPING_BY_SKU = {
  CLOUD: '50', HUG: '50', CLOUDY: '90', FLOW360: '90', AURI: '50',
  FLOWER: '90', NEST: '40', Oli: '40', 'FLOWER-BASE': '50', BENCHY: '50',
  CloudHugSet: '100', FlowerCloudSet: '140', FlowerHugSet: '140',
  HugDuoSet: '100', CloudDuoSet: '100', AuriCloudSet: '100',
  AuriCozySet: '100', FlowSoftSet: '140', FlowContrastSet: '140',
  CloudyHugSet: '140', CLOUDYSET: '140', Flow360Duo: '180',
  CloudyDuo: '180', AuriDuo: '100', AuriOli: '90', AuriNest: '90',
  AuriBenchy: '100', FlowNest: '140', FlowBenchy: '140',
  CloudyLoungeDuo: '280', CloudyBenchy: '140', FlowerDuo: '180',
  FlowerLounge: '140',
};

const DEFAULT_SHIPPING    = process.env.DEFAULT_SHIPPING    || '0';
const DEFAULT_DELIVERY    = process.env.DEFAULT_DELIVERY    || '3';
const DEFAULT_WARRANTY    = process.env.DEFAULT_WARRANTY    || '12 חודשים';
const DEFAULT_WARRANTY_BY = process.env.DEFAULT_WARRANTY_BY || 'Dream It Israel';
const PAGES_BASE_URL      = process.env.PAGES_BASE_URL      || 'https://tomer59560-dev.github.io/META-ADS';

const http = axios.create({
  baseURL: SITE_URL,
  timeout: 20000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/html, */*',
    'Accept-Language': 'he,en;q=0.9',
  },
});

// ─── XML / HTML HELPERS ──────────────────────────────────────────────────────

function xmlEsc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}
function sanitizeUrl(url) {
  return (url || '').replace(/'/g, '').replace(/[^\x00-\x7F]/g, c => encodeURIComponent(c));
}
function strip(s)    { return (s || '').replace(/<[^>]*>/g, '').trim(); }
function trunc(s, n) { return String(s || '').substring(0, n); }

// ─── SHOPIFY API ─────────────────────────────────────────────────────────────

async function shopifyGet(endpoint) {
  const { data } = await http.get(endpoint, { headers: { Accept: 'application/json' } });
  return data;
}

async function getCategoriesShopify() {
  const data = await shopifyGet('/collections.json?limit=250');
  const cols = data.collections || [];
  if (!cols.length) throw new Error('No collections');
  return cols.map(c => ({
    id:   String(c.id),
    slug: c.handle,
    name: c.title,
    url:  `${SITE_URL}/collections/${c.handle}`,
  }));
}

async function getProductsShopify(collectionHandle) {
  const all = [];
  let page = 1;
  while (true) {
    const data = await shopifyGet(`/collections/${collectionHandle}/products.json?limit=250&page=${page}`);
    const batch = data.products || [];
    if (!batch.length) break;
    for (const p of batch) {
      const variant = p.variants?.[0] || {};
      // Prefer the largest image (not thumbnail)
      const image = p.images?.[0]?.src || '';
      const brand = (p.vendor || '');
      all.push({
        id:          String(variant.id || p.id),
        name:        strip(p.title || ''),
        model:       variant.sku || p.handle || '',
        description: strip(p.body_html || ''),
        url:         `${SITE_URL}/products/${p.handle}`,
        image,
        price:       variant.price || '',
        barcode:     variant.barcode || '',
        brand,
        warranty:    DEFAULT_WARRANTY,
        warrantyBy:  DEFAULT_WARRANTY_BY,
        shipping:    SHIPPING_BY_SKU[variant.sku] || DEFAULT_SHIPPING,
        delivery:    DEFAULT_DELIVERY,
      });
    }
    if (batch.length < 250) break;
    page++;
  }
  return all;
}

// ─── WOOCOMMERCE API ─────────────────────────────────────────────────────────

async function getCategoriesWC() {
  const { data } = await http.get('/wp-json/wc/v3/products/categories?per_page=100&hide_empty=1');
  if (!Array.isArray(data) || !data.length) throw new Error('No WC categories');
  return data.map(c => ({ id: String(c.id), slug: c.slug, name: strip(c.name), url: `${SITE_URL}/product-category/${c.slug}/` }));
}

async function getProductsWC(catId) {
  const { data } = await http.get(`/wp-json/wc/v3/products?per_page=100&category=${catId}&status=publish`);
  return (data || []).map(p => {
    const image = (p.images?.[0]?.src || '').replace(/-\d+x\d+(\.\w+)$/, '$1');
    const brand = (p.attributes || []).find(a => /מותג|brand/iu.test(a.name))?.options?.[0] || '';
    return {
      id: String(p.id), name: strip(p.name), model: p.sku || '',
      description: strip(p.short_description || p.description),
      url: p.permalink, image, price: p.price || '',
      barcode: '', brand,
      warranty: DEFAULT_WARRANTY, warrantyBy: DEFAULT_WARRANTY_BY,
      shipping: SHIPPING_BY_SKU[p.sku] || DEFAULT_SHIPPING, delivery: DEFAULT_DELIVERY,
    };
  });
}

// ─── HTML SCRAPING FALLBACK ──────────────────────────────────────────────────

async function getCategoriesScrape() {
  const { data: html } = await http.get('/');
  const $ = cheerio.load(html);
  const cats = []; const seen = new Set();

  // Shopify collection links
  $('a[href*="/collections/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const m = href.match(/\/collections\/([^/?#]+)/);
    if (!m || seen.has(m[1]) || m[1] === 'all') return;
    seen.add(m[1]);
    const name = $(el).text().trim() || m[1];
    if (name) cats.push({ id: m[1], slug: m[1], name, url: `${SITE_URL}/collections/${m[1]}` });
  });

  // WooCommerce category links
  if (!cats.length) {
    $('a[href*="/product-category/"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const m = href.match(/product-category\/([^/?#]+)/);
      if (!m || seen.has(m[1])) return;
      seen.add(m[1]);
      const name = $(el).text().trim() || m[1];
      if (name) cats.push({ id: m[1], slug: m[1], name, url: href });
    });
  }

  if (!cats.length) throw new Error('Scrape: no categories found on homepage');
  return cats;
}

async function scrapeShopifyCollection(handle) {
  const products = [];
  let page = 1;
  while (true) {
    const { data: html } = await http.get(`/collections/${handle}?page=${page}`);
    const $ = cheerio.load(html);
    const links = [];
    $('a[href*="/products/"]').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !links.includes(href)) links.push(href);
    });
    if (!links.length) break;
    for (const href of links) {
      try {
        const fullUrl = href.startsWith('http') ? href : `${SITE_URL}${href}`;
        const jsonUrl = fullUrl.replace(/(\?.*)?$/, '.json');
        const { data } = await http.get(jsonUrl.replace(SITE_URL, ''));
        const p = data.product;
        if (!p) continue;
        const v = p.variants?.[0] || {};
        products.push({
          id: String(v.id || p.id), name: strip(p.title), model: v.sku || p.handle,
          description: strip(p.body_html), url: fullUrl,
          image: p.images?.[0]?.src || '', price: v.price || '',
          barcode: v.barcode || '', brand: p.vendor || '',
          warranty: DEFAULT_WARRANTY, warrantyBy: DEFAULT_WARRANTY_BY,
          shipping: SHIPPING_BY_SKU[v.sku] || DEFAULT_SHIPPING, delivery: DEFAULT_DELIVERY,
        });
      } catch { /* skip */ }
    }
    if (!$('a[href*="page="]').length) break;
    page++;
  }
  return products;
}

// ─── UNIFIED GETTERS ─────────────────────────────────────────────────────────

async function getCategories() {
  const methods = [
    { name: 'Shopify API', fn: getCategoriesShopify },
    { name: 'WooCommerce API', fn: getCategoriesWC },
    { name: 'HTML scrape', fn: getCategoriesScrape },
  ];
  for (const { name, fn } of methods) {
    try {
      console.log(`  Trying ${name}…`);
      const cats = await fn();
      console.log(`  ✓ ${name}: ${cats.length} categories`);
      return { cats, method: name };
    } catch (e) {
      console.log(`  ✗ ${name}: ${e.message}`);
    }
  }
  return { cats: [], method: 'none' };
}

async function getProducts(cat, method) {
  try {
    if (method === 'Shopify API' || method === 'HTML scrape') {
      return await getProductsShopify(cat.slug);
    }
    if (method === 'WooCommerce API') {
      return await getProductsWC(cat.id);
    }
    return await scrapeShopifyCollection(cat.slug);
  } catch (e) {
    console.log(`    ✗ products for ${cat.slug}: ${e.message}`);
    return [];
  }
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
      <PRODUCT_URL>${xmlEsc(url)}</PRODUCT_URL>
      <PRODUCT_NAME>${xmlEsc(name)}</PRODUCT_NAME>
      <MODEL>${xmlEsc(p.model)}</MODEL>
      <DETAILS>${xmlEsc(details)}</DETAILS>
      <CATALOG_NUMBER>${xmlEsc(p.barcode)}</CATALOG_NUMBER>
      <PRODUCTCODE>${xmlEsc(p.id)}</PRODUCTCODE>
      <CURRENCY>ILS</CURRENCY>
      <PRICE>${xmlEsc(price)}</PRICE>
      <SHIPMENT_COST>${xmlEsc(p.shipping)}</SHIPMENT_COST>
      <DELIVERY_TIME>${xmlEsc(p.delivery)}</DELIVERY_TIME>
      <MANUFACTURER>${xmlEsc(p.brand)}</MANUFACTURER>
      <WARRANTY>${xmlEsc(trunc(p.warranty, 100))}</WARRANTY>
      <WARRANTYBY>${xmlEsc(trunc(p.warrantyBy, 200))}</WARRANTYBY>
      <IMAGE>${xmlEsc(image)}</IMAGE>
      <TAX></TAX>
    </PRODUCT>\n`;
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<STORE>\n  <PRODUCTS>\n${items}  </PRODUCTS>\n</STORE>`;
}

function buildIndex(cats) {
  const rows = cats.map(c => {
    const xmlUrl = `${PAGES_BASE_URL}/category/${c.slug}.xml`;
    return `    <li><a href="${xmlUrl}">${c.name}</a></li>`;
  }).join('\n');
  const now = new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem' });
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${STORE_NAME} — ZAP Mirror</title>
  <style>
    body{font-family:Arial,sans-serif;direction:rtl;padding:24px;background:#f7f7f7;margin:0}
    h1{color:#222;margin-bottom:4px}
    ul{list-style:none;padding:0}li{margin:10px 0}
    a{color:#0066cc;font-size:1.05em;text-decoration:none}a:hover{text-decoration:underline}
    footer{color:#888;font-size:.85em;margin-top:32px}
  </style>
</head>
<body>
  <h1>${STORE_NAME}</h1>
  <h2>אתר מראה לזאפ — קטגוריות מוצרים</h2>
  <ul>
${rows}
  </ul>
  <footer>עדכון אחרון: ${now}</footer>
</body>
</html>`;
}

// ─── MAIN ────────────────────────────────────────────────────────────────────

(async () => {
  fs.mkdirSync(CAT_DIR, { recursive: true });

  console.log('Fetching categories from', SITE_URL);
  const { cats, method } = await getCategories();

  if (!cats.length) {
    console.log('WARNING: No categories found. Writing empty index.');
    fs.writeFileSync(path.join(DIST_DIR, 'index.html'), buildIndex([]), 'utf-8');
    process.exit(0);
  }

  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), buildIndex(cats), 'utf-8');
  console.log(`Wrote dist/index.html (${cats.length} categories)`);

  for (const cat of cats) {
    process.stdout.write(`  [${cat.slug}] fetching products… `);
    const products = await getProducts(cat, method);
    console.log(`${products.length} products`);
    fs.writeFileSync(path.join(CAT_DIR, `${cat.slug}.xml`), buildXml(products), 'utf-8');
  }

  console.log('Done.');
})().catch(err => { console.error(err); process.exit(1); });
