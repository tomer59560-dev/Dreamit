const { buildCategoryXml } = require('../lib/zap-xml');
const assert = require('assert');

const emptyXml = buildCategoryXml([]);
assert(emptyXml.includes('<?xml'),      'empty: missing XML declaration');
assert(emptyXml.includes('<STORE>'),    'empty: missing <STORE>');
assert(emptyXml.includes('<PRODUCTS>'),'empty: missing <PRODUCTS>');

const base = {
  id: '42', name: 'כיסא מעץ מלא', model: 'MDL-01',
  description: 'תיאור קצר',
  url: 'https://www.dreamitisrael.com/products/chair',
  image: 'https://www.dreamitisrael.com/img/chair.jpg',
  price: '299', barcode: '1234567890123', brand: 'ACME',
  warranty: '12 חודשים', warrantyBy: 'Dream It Israel',
  shippingCost: '0', deliveryTime: '3',
};

const xml = buildCategoryXml([base]);

// Correct ZAP tag names (from visual image in spec PDF)
assert(xml.includes('<PRODUCT_URL>'),    'wrong tag: should be PRODUCT_URL');
assert(xml.includes('<PRODUCT_NAME>'),   'wrong tag: should be PRODUCT_NAME');
assert(xml.includes('<CATALOG_NUMBER>'), 'wrong tag: should be CATALOG_NUMBER');
assert(xml.includes('<SHIPMENT_COST>'),  'wrong tag: should be SHIPMENT_COST');
assert(xml.includes('<DELIVERY_TIME>'),  'wrong tag: should be DELIVERY_TIME');

// Must NOT contain wrong reversed names
assert(!xml.includes('<URL_PRODUCT>'),    'wrong tag URL_PRODUCT still present');
assert(!xml.includes('<NAME_PRODUCT>'),   'wrong tag NAME_PRODUCT still present');
assert(!xml.includes('<NUMBER_CATALOG>'),'wrong tag NUMBER_CATALOG still present');
assert(!xml.includes('<COST_SHIPMENT>'), 'wrong tag COST_SHIPMENT still present');
assert(!xml.includes('<TIME_DELIVERY>'), 'wrong tag TIME_DELIVERY still present');

assert(xml.includes('<PRICE>299</PRICE>'),        'wrong price');
assert(xml.includes('<CURRENCY>ILS</CURRENCY>'),  'missing ILS');

// HTML stripped from description
const xmlHtml = buildCategoryXml([{ ...base, description: '<b>תיאור</b> מוצר' }]);
assert(!xmlHtml.match(/<DETAILS>.*<b>/), 'HTML not stripped from DETAILS');

// Name truncated to 120 chars
const xmlLong = buildCategoryXml([{ ...base, name: 'א'.repeat(200) }]);
const m = xmlLong.match(/<PRODUCT_NAME>(.*?)<\/PRODUCT_NAME>/);
assert(m && m[1].length <= 120, 'PRODUCT_NAME not truncated to 120');

// Single apostrophe removed from URL
const xmlApos = buildCategoryXml([{ ...base, url: "https://example.com/מוצ'ר" }]);
assert(!xmlApos.includes("'"), 'single apostrophe not removed from URL');

// Personal sale
const xmlPS = buildCategoryXml([{ ...base, price: '', openPrice: '500' }]);
assert(xmlPS.includes('<PRICE></PRICE>'),              'personal sale: PRICE not empty');
assert(xmlPS.includes('<Open_Price>500</Open_Price>'), 'personal sale: Open_Price missing');

console.log('All tests passed.');
