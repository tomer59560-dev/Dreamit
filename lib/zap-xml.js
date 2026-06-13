/**
 * Generates ZAP-compliant XML feed for a list of products.
 * Spec: ZAP mirror site technical requirements document (zap.co.il)
 *
 * Tag names are taken verbatim from the spec PDF (RTL doc, LTR tag names):
 *   URL_PRODUCT, NAME_PRODUCT, NUMBER_CATALOG, COST_SHIPMENT, TIME_DELIVERY
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

// Remove single apostrophes from URLs (ZAP spec requirement)
// and percent-encode any non-ASCII characters (Hebrew letters etc.)
function sanitizeUrl(url) {
  if (!url) return '';
  return url
    .replace(/'/g, '')
    .split('')
    .map(ch => {
      const code = ch.charCodeAt(0);
      if (code > 127) return encodeURIComponent(ch);
      return ch;
    })
    .join('');
}

function buildProductXml(p) {
  const name    = truncate(stripHtml(p.name || ''), 120);
  const details = truncate(stripHtml(p.description || ''), 255);
  const url     = truncate(sanitizeUrl(p.url || ''), 255);
  const image   = truncate(sanitizeUrl(p.image || ''), 255);

  // Personal sale: <PRICE> must be empty, price goes into <Open_Price>
  const isPersonalSale = !!p.openPrice;
  const priceTag     = isPersonalSale ? '' : escapeXml(p.price || '');
  const openPriceTag = isPersonalSale
    ? `\n      <Open_Price>${escapeXml(p.openPrice)}</Open_Price>`
    : '';

  return `    <PRODUCT>
      <URL_PRODUCT>${escapeXml(url)}</URL_PRODUCT>
      <NAME_PRODUCT>${escapeXml(name)}</NAME_PRODUCT>
      <MODEL>${escapeXml(p.model || '')}</MODEL>
      <DETAILS>${escapeXml(details)}</DETAILS>
      <NUMBER_CATALOG>${escapeXml(p.barcode || '')}</NUMBER_CATALOG>
      <PRODUCTCODE>${escapeXml(p.id || '')}</PRODUCTCODE>
      <CURRENCY>ILS</CURRENCY>
      <PRICE>${priceTag}</PRICE>${openPriceTag}
      <COST_SHIPMENT>${escapeXml(p.shippingCost || '0')}</COST_SHIPMENT>
      <TIME_DELIVERY>${escapeXml(p.deliveryTime || '3')}</TIME_DELIVERY>
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
