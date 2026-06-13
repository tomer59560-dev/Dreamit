const { buildCategoryXml } = require('../lib/zap-xml');
const assert = require('assert');

// Empty page must still be valid XML
const emptyXml = buildCategoryXml([]);
assert(emptyXml.includes('<?xml'), 'empty: missing XML declaration');
assert(emptyXml.includes('<STORE>'), 'empty: missing <STORE>');
assert(emptyXml.includes('<PRODUCTS>'), 'empty: missing <PRODUCTS>');

// Product with special characters
const products = [{
  id: '42',
  name: 'כיסא & שולחן מעץ',
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
}];

const xml = buildCategoryXml(products);
assert(xml.includes('<PRODUCT>'), 'product: missing <PRODUCT>');
assert(xml.includes('<PRICE>299</PRICE>'), 'product: wrong price');
assert(xml.includes('&amp;'), 'product: & not escaped in name');
assert(xml.includes('<CURRENCY>ILS</CURRENCY>'), 'product: missing ILS currency');
// description with HTML tags should be stripped
const xmlWithHtml = buildCategoryXml([{ ...products[0], description: '<b>תיאור</b> מוצר' }]);
assert(!xmlWithHtml.match(/<DETAILS>.*<b>.*<\/DETAILS>/), 'product: HTML not stripped from details');

// Name truncated to 120 chars
const longName = 'א'.repeat(200);
const xmlLong = buildCategoryXml([{ ...products[0], name: longName }]);
const match = xmlLong.match(/<PRODUCT_NAME>(.*?)<\/PRODUCT_NAME>/);
assert(match && match[1].length <= 120, 'product: name not truncated to 120');

console.log('All tests passed.');
