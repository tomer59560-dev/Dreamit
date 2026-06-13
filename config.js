module.exports = {
  SITE_URL: 'https://www.dreamitisrael.com',
  STORE_NAME: 'Dream It Israel',
  MIRROR_BASE_URL: process.env.MIRROR_BASE_URL || 'http://localhost:3000',
  PORT: process.env.PORT || 3000,

  CACHE_DIR: './cache',
  CACHE_TTL_MS: 4 * 60 * 60 * 1000, // 4 hours — ZAP scans every 4-6 hours

  // Default shipping/delivery values (override per product in scraper)
  DEFAULT_SHIPMENT_COST: process.env.DEFAULT_SHIPMENT_COST || '0',
  DEFAULT_DELIVERY_TIME: process.env.DEFAULT_DELIVERY_TIME || '3',
  DEFAULT_WARRANTY: process.env.DEFAULT_WARRANTY || '12 חודשים',
  DEFAULT_WARRANTY_BY: process.env.DEFAULT_WARRANTY_BY || 'Dream It Israel',

  // WooCommerce REST API (set in .env if site uses WooCommerce)
  WC_API_URL: process.env.WC_API_URL || null,
  WC_CONSUMER_KEY: process.env.WC_CONSUMER_KEY || null,
  WC_CONSUMER_SECRET: process.env.WC_CONSUMER_SECRET || null,
};
