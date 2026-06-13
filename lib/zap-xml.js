/**
 * Generates ZAP-compliant XML feed for a list of products.
 * Spec: https://www.zap.co.il (mirror site technical requirements)
 */

function escapeXml(str) {
  if (!str && str !== 0) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]*>/g, '').trim();
}

function truncate(str, max) {
  if (!str) return '';
  return String(str).substring(0, max);
}

function buildProductXml(p) {
  const name = truncate(stripHtml(p.name || ''), 120);
  const details = truncate(stripHtml(p.description || ''), 255);
  const url = truncate(p.url || '', 255);
  const image = truncate(p.image || '', 255);

  return `    <PRODUCT>
      <PRODUCT_URL>${escapeXml(url)}</PRODUCT_URL>
      <PRODUCT_NAME>${escapeXml(name)}</PRODUCT_NAME>
      <MODEL>${escapeXml(p.model || '')}</MODEL>
      <DETAILS>${escapeXml(details)}</DETAILS>
      <CATALOG_NUMBER>${escapeXml(p.barcode || '')}</CATALOG_NUMBER>
      <PRODUCTCODE>${escapeXml(p.id || '')}</PRODUCTCODE>
      <CURRENCY>ILS</CURRENCY>
      <PRICE>${escapeXml(p.price || '')}</PRICE>
      <SHIPMENT_COST>${escapeXml(p.shippingCost || '0')}</SHIPMENT_COST>
      <DELIVERY_TIME>${escapeXml(p.deliveryTime || '3')}</DELIVERY_TIME>
      <MANUFACTURER>${escapeXml(p.brand || '')}</MANUFACTURER>
      <WARRANTY>${escapeXml(truncate(p.warranty || '', 100))}</WARRANTY>
      <WARRANTYBY>${escapeXml(truncate(p.warrantyBy || '', 200))}</WARRANTYBY>
      <IMAGE>${escapeXml(image)}</IMAGE>
      <TAX></TAX>
    </PRODUCT>`;
}

function buildCategoryXml(products) {
  if (!products || products.length === 0) {
    return `<?xml version="1.0" encoding="UTF-8"?>\n<STORE>\n  <PRODUCTS>\n  </PRODUCTS>\n</STORE>`;
  }
  const items = products.map(buildProductXml).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<STORE>\n  <PRODUCTS>\n${items}\n  </PRODUCTS>\n</STORE>`;
}

module.exports = { buildCategoryXml };
