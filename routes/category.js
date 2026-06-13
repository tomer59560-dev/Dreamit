const express = require('express');
const router = express.Router();
const scraper = require('../lib/scraper');
const { buildCategoryXml } = require('../lib/zap-xml');

// Product XML feed per category — ZAP scans this URL
router.get('/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await scraper.getProductsByCategory(decodeURIComponent(categoryId));
    const xml = buildCategoryXml(products);

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
  } catch (err) {
    console.error('[category] Error fetching products:', err.message);
    // Return valid empty XML on error — ZAP requires empty pages to still be valid XML
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<STORE>\n  <PRODUCTS>\n  </PRODUCTS>\n</STORE>`);
  }
});

module.exports = router;
