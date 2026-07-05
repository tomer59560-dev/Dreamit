/**
 * Scrapes dreamitisrael.com for categories and products.
 * Falls back to WooCommerce REST API if credentials are provided in config.
 */
const axios = require('axios');
const cheerio = require('cheerio');
const config = require('../config');
const cache = require('./cache');

const http = axios.create({
  baseURL: config.SITE_URL,
  timeout: 15000,
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'he,en;q=0.9',
    'Accept-Encoding': 'gzip, deflate, br',
  },
  responseType: 'arraybuffer', // handle UTF-8 / ISO encodings safely
});

function decode(buffer) {
  return Buffer.from(buffer).toString('utf-8');
}

// ─── WooCommerce API path ────────────────────────────────────────────────────

async function wcGet(endpoint, params = {}) {
  const url = `${config.WC_API_URL}/wp-json/wc/v3/${endpoint}`;
  const resp = await axios.get(url, {
    params: {
      ...params,
      consumer_key: config.WC_CONSUMER_KEY,
      consumer_secret: config.WC_CONSUMER_SECRET,
      per_page: 100,
    },
  });
  return resp.data;
}

async function getCategoriesWC() {
  const cats = await wcGet('products/categories', { hide_empty: true });
  return cats
    .filter(c => c.parent === 0 || true) // include all
    .map(c => ({
      id: String(c.id),
      name: c.name,
      slug: c.slug,
      count: c.count,
    }));
}

async function getProductsWC(categoryId) {
  let page = 1;
  const all = [];
  while (true) {
    const batch = await wcGet('products', { category: categoryId, page, status: 'publish' });
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < 100) break;
    page++;
  }
  return all.map(p => ({
    id: String(p.id),
    name: p.name,
    model: p.sku || '',
    description: p.short_description || p.description || '',
    url: p.permalink,
    image: p.images && p.images.length ? p.images[0].src : '',
    price: p.price || '',
    barcode: '',
    brand: (p.attributes || []).find(a => /מותג|brand/i.test(a.name))?.options?.[0] || '',
    warranty: config.DEFAULT_WARRANTY,
    warrantyBy: config.DEFAULT_WARRANTY_BY,
    shippingCost: config.DEFAULT_SHIPMENT_COST,
    deliveryTime: config.DEFAULT_DELIVERY_TIME,
  }));
}

// ─── Shopify storefront JSON path (dreamitisrael.com runs on Shopify) ───────

async function fetchJson(path) {
  const resp = await http.get(path, { headers: { Accept: 'application/json' } });
  try {
    return JSON.parse(decode(resp.data));
  } catch {
    return null;
  }
}

async function getCategoriesShopify() {
  const json = await fetchJson('/collections.json?limit=250');
  if (!json || !Array.isArray(json.collections)) return [];
  return json.collections
    .filter(c => c.handle && c.title)
    .map(c => ({
      id: c.handle,
      name: c.title,
      slug: c.handle,
      url: `${config.SITE_URL}/collections/${c.handle}`,
    }));
}

function productFromShopify(p) {
  const variants = p.variants || [];
  const v = variants.find(vv => vv.available) || variants[0];
  if (!p.handle || !v || v.price === '' || v.price == null) return null;

  return {
    id: String(v.sku || p.id),
    name: String(p.title || '').trim(),
    model: v.sku || '',
    description: String(p.body_html || '').replace(/<[^>]*>/g, '').trim(),
    url: `${config.SITE_URL}/products/${p.handle}`,
    image: (p.images && p.images.length && p.images[0].src) || '',
    price: String(v.price).replace(/[^\d.]/g, ''),
    barcode: '',
    brand: p.vendor || '',
    warranty: config.DEFAULT_WARRANTY,
    warrantyBy: config.DEFAULT_WARRANTY_BY,
    shippingCost: config.DEFAULT_SHIPMENT_COST,
    deliveryTime: config.DEFAULT_DELIVERY_TIME,
  };
}

async function getProductsShopify(slug) {
  const products = [];
  let page = 1;
  while (true) {
    const json = await fetchJson(
      `/collections/${encodeURIComponent(slug)}/products.json?limit=250&page=${page}`
    );
    if (!json || !Array.isArray(json.products) || json.products.length === 0) break;
    for (const p of json.products) {
      const prod = productFromShopify(p);
      if (prod) products.push(prod);
    }
    if (json.products.length < 250) break;
    page++;
  }
  return products;
}

// ─── HTML scraping path ──────────────────────────────────────────────────────

async function fetchHtml(path) {
  const resp = await http.get(path);
  return decode(resp.data);
}

async function getCategoriesScrape() {
  const html = await fetchHtml('/');
  const $ = cheerio.load(html);
  const categories = [];

  // Try common WooCommerce category selectors
  $('ul.product-categories > li, .widget_product_categories li, nav .menu-item a').each((_, el) => {
    const $el = $(el);
    const href = $el.is('a') ? $el.attr('href') : $el.find('a').first().attr('href');
    const name = $el.is('a') ? $el.text().trim() : $el.find('a').first().text().trim();
    if (href && name && href.includes(config.SITE_URL)) {
      const slug = href.replace(config.SITE_URL, '').replace(/\/$/, '').split('/').pop();
      categories.push({ id: slug, name, slug, url: href });
    }
  });

  // Fallback: look for product-category links anywhere on the page
  if (categories.length === 0) {
    $('a[href*="product-category"], a[href*="product_cat"]').each((_, el) => {
      const href = $(el).attr('href');
      const name = $(el).text().trim();
      if (href && name) {
        const slug = href.replace(/\/$/, '').split('/').pop();
        if (!categories.find(c => c.slug === slug)) {
          categories.push({ id: slug, name, slug, url: href });
        }
      }
    });
  }

  return categories;
}

async function getProductsScrape(categoryUrl) {
  const products = [];
  let page = 1;

  while (true) {
    const pageUrl = page === 1 ? categoryUrl : `${categoryUrl.replace(/\/$/, '')}/page/${page}/`;
    let html;
    try {
      const resp = await http.get(pageUrl.replace(config.SITE_URL, ''));
      html = decode(resp.data);
    } catch (e) {
      break;
    }

    const $ = cheerio.load(html);
    const productLinks = [];

    // WooCommerce product loop selectors
    $('ul.products .product a.woocommerce-loop-product__link, ' +
      'ul.products li.product > a:first-child').each((_, el) => {
      const href = $(el).attr('href');
      if (href && !productLinks.includes(href)) productLinks.push(href);
    });

    if (productLinks.length === 0) break;

    for (const link of productLinks) {
      const product = await scrapeProductPage(link);
      if (product) products.push(product);
    }

    const hasNext = $('.woocommerce-pagination .next, .pagination .next').length > 0;
    if (!hasNext) break;
    page++;
  }

  return products;
}

async function scrapeProductPage(url) {
  try {
    const resp = await http.get(url.replace(config.SITE_URL, ''));
    const $ = cheerio.load(decode(resp.data));

    const name = $('h1.product_title, .product_title').first().text().trim();
    const price = $('.price .woocommerce-Price-amount bdi, .price ins bdi, .price bdi')
      .first()
      .text()
      .replace(/[^\d.]/g, '')
      .trim();
    const image = $('.woocommerce-product-gallery__image img').first().attr('data-large_image') ||
      $('.woocommerce-product-gallery__image img').first().attr('src') || '';
    const description = $('.woocommerce-product-details__short-description, .product .entry-content')
      .first()
      .text()
      .trim();
    const sku = $('.sku').text().trim();

    const brand = $('.posted_in a, .product_meta .brand a').first().text().trim() || '';

    if (!name || !price) return null;

    return {
      id: sku || url.replace(/\/$/, '').split('/').pop(),
      name,
      model: sku || '',
      description,
      url,
      image,
      price,
      barcode: '',
      brand,
      warranty: config.DEFAULT_WARRANTY,
      warrantyBy: config.DEFAULT_WARRANTY_BY,
      shippingCost: config.DEFAULT_SHIPMENT_COST,
      deliveryTime: config.DEFAULT_DELIVERY_TIME,
    };
  } catch {
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

async function getCategories() {
  const cached = cache.get('categories');
  if (cached) return cached;

  // Shopify first — this is the live platform; legacy WooCommerce paths kept as fallback
  let categories = await getCategoriesShopify().catch(() => []);
  if (!categories.length) {
    if (config.WC_API_URL && config.WC_CONSUMER_KEY) {
      categories = await getCategoriesWC();
    } else {
      categories = await getCategoriesScrape();
    }
  }

  cache.set('categories', categories);
  return categories;
}

async function getProductsByCategory(categoryId) {
  const cacheKey = `products_${categoryId}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  // Shopify first — this is the live platform; legacy WooCommerce paths kept as fallback
  let products = await getProductsShopify(categoryId).catch(() => []);
  if (!products.length) {
    if (config.WC_API_URL && config.WC_CONSUMER_KEY) {
      products = await getProductsWC(categoryId);
    } else {
      const categories = await getCategories();
      const cat = categories.find(c => c.id === categoryId || c.slug === categoryId);
      if (!cat) return [];
      products = await getProductsScrape(cat.url || `${config.SITE_URL}/product-category/${cat.slug}/`);
    }
  }

  cache.set(cacheKey, products);
  return products;
}

async function refreshAll() {
  cache.invalidateAll();
  console.log('[scraper] Cache cleared, refreshing...');
  const categories = await getCategories();
  for (const cat of categories) {
    await getProductsByCategory(cat.id);
    console.log(`[scraper] Refreshed: ${cat.name} (${cat.id})`);
  }
  console.log('[scraper] Full refresh complete.');
}

module.exports = { getCategories, getProductsByCategory, refreshAll };
