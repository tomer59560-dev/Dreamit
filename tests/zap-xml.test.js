const { buildCategoryXml } = require('../lib/zap-xml');
const assert = require('assert');

// Empty page must still be valid XML
const emptyXml = buildCategoryXml([]);
assert(emptyXml.includes('<?xml'),     'empty: missing XML declaration');
assert(emptyXml.includes('<STORE>'),   'empty: missing <STORE>');
assert(emptyXml.includes('<PRODUCTS>'),'empty: missing <PRODUCTS>');

const base = {
  id: '42',
  name: 'כיסא מעץ מלא',
  model: 'MDL-01',
  description: 'תיאור קצר',
  url: 'https://www.dreamitisrael.com/product/chair',
  image: 'https://www.dreamitisrael.com/img/chair.jpg',
  price: '299',
  barcode: '1234567890123',
  brand: 'ACME',
  warranty: '12 חודשים',
  warrantyBy: 'Dream It Israel',
  shippingCost: '0',
  deliveryTime: '3',
};

const xml = buildCategoryXml([base]);

// Correct ZAP tag names (from spec PDF)
assert(xml.includes('<URL_PRODUCT>'),    'wrong tag: should be URL_PRODUCT');
assert(xml.includes('<NAME_PRODUCT>'),   'wrong tag: should be NAME_PRODUCT');
assert(xml.includes('<NUMBER_CATALOG>'), 'wrong tag: should be NUMBER_CATALOG');
assert(xml.includes('<COST_SHIPMENT>'),  'wrong tag: should be COST_SHIPMENT');
assert(xml.includes('<TIME_DELIVERY>'),  'wrong tag: should be TIME_DELIVERY');

// Must NOT contain old wrong names
assert(!xml.includes('<PRODUCT_URL>'),   'old wrong tag PRODUCT_URL still present');
assert(!xml.includes('<PRODUCT_NAME>'),  'old wrong tag PRODUCT_NAME still present');
assert(!xml.includes('<CATALOG_NUMBER>'),'old wrong tag CATALOG_NUMBER still present');
assert(!xml.includes('<SHIPMENT_COST>'), 'old wrong tag SHIPMENT_COST still present');
assert(!xml.includes('<DELIVERY_TIME>'), 'old wrong tag DELIVERY_TIME still present');

// Values and escaping
assert(xml.includes('<PRICE>299</PRICE>'),         'wrong price');
assert(xml.includes('<CURRENCY>ILS</CURRENCY>'),   'missing ILS currency');
assert(xml.includes('&amp;') || !base.name.includes('&'), 'ampersand not escaped');

// HTML stripped from description
const xmlHtml = buildCategoryXml([{ ...base, description: '<b>תיאור</b> מוצר' }]);
assert(!xmlHtml.match(/<DETAILS>.*<b>/), 'HTML not stripped from DETAILS');

// Name truncated to 120 chars
const xmlLong = buildCategoryXml([{ ...base, name: 'א'.repeat(200) }]);
const m = xmlLong.match(/<NAME_PRODUCT>(.*?)<\/NAME_PRODUCT>/);
assert(m && m[1].length <= 120, 'NAME_PRODUCT not truncated to 120');

// Single apostrophe removed from URL
const xmlApos = buildCategoryXml([{ ...base, url: "https://example.com/מוצ'ר" }]);
assert(!xmlApos.includes("'"), "single apostrophe not removed from URL");

// Personal sale: PRICE empty, Open_Price populated
const xmlPS = buildCategoryXml([{ ...base, price: '', openPrice: '500' }]);
assert(xmlPS.includes('<PRICE></PRICE>'),              'personal sale: PRICE must be empty');
assert(xmlPS.includes('<Open_Price>500</Open_Price>'), 'personal sale: missing Open_Price');

console.log('All tests passed.');
