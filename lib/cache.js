const fs = require('fs');
const path = require('path');
const config = require('../config');

const CACHE_DIR = path.resolve(config.CACHE_DIR);

if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function cacheKey(name) {
  return path.join(CACHE_DIR, `${name}.json`);
}

function get(name) {
  const file = cacheKey(name);
  if (!fs.existsSync(file)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(file, 'utf-8'));
    if (Date.now() - raw.ts > config.CACHE_TTL_MS) return null;
    return raw.data;
  } catch {
    return null;
  }
}

function set(name, data) {
  fs.writeFileSync(cacheKey(name), JSON.stringify({ ts: Date.now(), data }), 'utf-8');
}

function invalidate(name) {
  const file = cacheKey(name);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

function invalidateAll() {
  fs.readdirSync(CACHE_DIR).forEach(f => {
    if (f.endsWith('.json')) fs.unlinkSync(path.join(CACHE_DIR, f));
  });
}

module.exports = { get, set, invalidate, invalidateAll };
