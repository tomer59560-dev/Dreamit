/**
 * Diagnostic: compare what the store publishes against what the mirror feed captures.
 * Prints per-collection counts and finds products missing from every collection.
 */
const axios = require('axios');

const SITE_URL = 'https://www.dreamitisrael.com';

const http = axios.create({
  baseURL: SITE_URL,
  timeout: 20000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
    Accept: 'application/json',
  },
});

async function getAll(path) {
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const { data } = await http.get(`${path}${path.includes('?') ? '&' : '?'}limit=250&page=${page}`);
    const batch = data.products || data.collections || [];
    if (!batch.length) break;
    out.push(...batch);
    if (batch.length < 250) break;
  }
  return out;
}

const isMirror = (p) => /מרא|mirror/i.test(p.title || '');

(async () => {
  const collections = await getAll('/collections.json');
  console.log(`COLLECTIONS PUBLISHED: ${collections.length}`);

  const storeProducts = await getAll('/products.json');
  console.log(`STORE PRODUCTS (/products.json): ${storeProducts.length}`);
  const storeMirrors = storeProducts.filter(isMirror);
  console.log(`STORE MIRRORS: ${storeMirrors.length}`);
  console.log('');

  const seen = new Set();
  console.log('--- per collection ---');
  for (const c of collections) {
    const prods = await getAll(`/collections/${c.handle}/products.json`);
    prods.forEach((p) => seen.add(p.id));
    const m = prods.filter(isMirror).length;
    console.log(`${String(prods.length).padStart(4)} products (${String(m).padStart(3)} mirrors)  ${c.handle}  [${c.title}]`);
  }

  console.log('');
  const orphans = storeProducts.filter((p) => !seen.has(p.id));
  console.log(`PRODUCTS IN STORE BUT IN NO COLLECTION: ${orphans.length}`);
  orphans.forEach((p) => console.log(`  ORPHAN  ${p.variants?.[0]?.sku || '?'}  ${p.title}`));

  console.log('');
  const mirrorColl = await getAll('/collections/designed-mirrors/products.json');
  const inColl = new Set(mirrorColl.map((p) => p.id));
  const missingMirrors = storeMirrors.filter((p) => !inColl.has(p.id));
  console.log(`MIRRORS NOT IN designed-mirrors COLLECTION: ${missingMirrors.length}`);
  missingMirrors.forEach((p) => console.log(`  MISSING  ${p.variants?.[0]?.sku || '?'}  ${p.title}`));
})().catch((e) => {
  console.error('DIAG FAILED:', e.message);
  process.exit(1);
});
