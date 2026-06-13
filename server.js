const express = require('express');
const cron = require('node-cron');
const config = require('./config');
const scraper = require('./lib/scraper');

const app = express();

// Routes
app.use('/', require('./routes/index'));
app.use('/category', require('./routes/category'));

// Admin: force cache refresh (protect with a secret token in production)
app.get('/admin/refresh', async (req, res) => {
  const token = process.env.ADMIN_TOKEN;
  if (token && req.query.token !== token) {
    return res.status(401).send('Unauthorized');
  }
  res.send('Refresh started — check server logs.');
  scraper.refreshAll().catch(e => console.error('[admin/refresh]', e.message));
});

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.listen(config.PORT, () => {
  console.log(`[server] ZAP mirror site running on port ${config.PORT}`);
  console.log(`[server] Index: ${config.MIRROR_BASE_URL}/`);
});

// Auto-refresh cache every 4 hours (ZAP scans every 4-6 hours)
cron.schedule('0 */4 * * *', () => {
  console.log('[cron] Scheduled refresh triggered');
  scraper.refreshAll().catch(e => console.error('[cron]', e.message));
});
