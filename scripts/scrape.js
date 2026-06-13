// One-shot script: refresh all categories and products, then exit.
// Run: node scripts/scrape.js
const scraper = require('../lib/scraper');

scraper.refreshAll()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Scrape failed:', err.message);
    process.exit(1);
  });
