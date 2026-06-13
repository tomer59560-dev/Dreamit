const express = require('express');
const router = express.Router();
const scraper = require('../lib/scraper');
const config = require('../config');

// Category listing — HTML (ZAP requirement: index is NOT XML)
router.get('/', async (req, res) => {
  try {
    const categories = await scraper.getCategories();
    const base = config.MIRROR_BASE_URL;

    const rows = categories
      .map(c => `      <li><a href="${base}/category/${encodeURIComponent(c.id)}">${c.name}</a></li>`)
      .join('\n');

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>${config.STORE_NAME} — קטגוריות</title>
  <style>
    body { font-family: Arial, sans-serif; direction: rtl; padding: 20px; }
    h1 { color: #333; }
    ul { list-style: none; padding: 0; }
    li { margin: 6px 0; }
    a { color: #0066cc; text-decoration: none; font-size: 1.1em; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>${config.STORE_NAME}</h1>
  <h2>קטגוריות מוצרים</h2>
  <ul>
${rows}
  </ul>
</body>
</html>`);
  } catch (err) {
    console.error('[index] Error fetching categories:', err.message);
    res.status(500).send('שגיאה בטעינת הקטגוריות');
  }
});

module.exports = router;
