<?php
/**
 * ZAP Marketplace Mirror Site — dreamitisrael.com
 *
 * Upload this file + cache/ folder to any PHP web hosting.
 * Give ZAP the URL of this file as the mirror-site index.
 *
 * Routes:
 *   /index.php              → HTML category list (ZAP index)
 *   /index.php?cat=SLUG     → XML product feed for that category
 *   /index.php?refresh=SECRET → flush cache manually
 */

// ─── CONFIG ──────────────────────────────────────────────────────────────────
define('STORE_URL',      'https://www.dreamitisrael.com');
define('STORE_NAME',     'Dream It Israel');
define('CACHE_DIR',      __DIR__ . '/cache');
define('CACHE_TTL',      4 * 3600);           // 4 hours (ZAP scans every 4-6 h)
define('REFRESH_SECRET', 'CHANGE_ME_SECRET'); // change before deploying

define('DEFAULT_SHIPPING',  '0');
define('DEFAULT_DELIVERY',  '3');
define('DEFAULT_WARRANTY',  '12 חודשים');
define('DEFAULT_WARRANTY_BY', 'Dream It Israel');

// ─── BOOTSTRAP ───────────────────────────────────────────────────────────────
header('Content-Type: text/html; charset=utf-8');
if (!is_dir(CACHE_DIR)) mkdir(CACHE_DIR, 0755, true);

// Manual cache flush
if (isset($_GET['refresh']) && $_GET['refresh'] === REFRESH_SECRET) {
    array_map('unlink', glob(CACHE_DIR . '/*.json'));
    die('Cache cleared.');
}

// Route: category XML feed
if (isset($_GET['cat']) && $_GET['cat'] !== '') {
    $slug = preg_replace('/[^a-z0-9_\-]/i', '', $_GET['cat']);
    serveCategoryXml($slug);
    exit;
}

// Route: index (category list HTML)
serveIndex();
exit;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function cacheGet($key) {
    $file = CACHE_DIR . '/' . md5($key) . '.json';
    if (!file_exists($file)) return null;
    if (time() - filemtime($file) > CACHE_TTL) return null;
    $data = json_decode(file_get_contents($file), true);
    return $data;
}

function cacheSet($key, $data) {
    $file = CACHE_DIR . '/' . md5($key) . '.json';
    file_put_contents($file, json_encode($data, JSON_UNESCAPED_UNICODE));
}

function fetchHtml($url) {
    $ctx = stream_context_create(['http' => [
        'method'  => 'GET',
        'timeout' => 15,
        'header'  =>
            "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) " .
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36\r\n" .
            "Accept-Language: he,en;q=0.9\r\n",
        'follow_location' => 1,
    ]]);
    $html = @file_get_contents($url, false, $ctx);
    return $html ?: '';
}

// ─── Shopify storefront JSON (dreamitisrael.com runs on Shopify) ─────────────

function getCategoriesShopify() {
    $json = @json_decode(fetchHtml(STORE_URL . '/collections.json?limit=250'), true);
    if (empty($json['collections']) || !is_array($json['collections'])) return [];
    $cats = [];
    foreach ($json['collections'] as $c) {
        if (empty($c['handle']) || empty($c['title'])) continue;
        $cats[] = [
            'slug' => $c['handle'],
            'name' => $c['title'],
            'url'  => STORE_URL . '/collections/' . $c['handle'],
        ];
    }
    return $cats;
}

function getProductsShopify($slug) {
    $products = [];
    $page = 1;
    while (true) {
        $json = @json_decode(
            fetchHtml(STORE_URL . '/collections/' . rawurlencode($slug) . '/products.json?limit=250&page=' . $page),
            true
        );
        if (empty($json['products']) || !is_array($json['products'])) break;
        foreach ($json['products'] as $p) {
            $prod = productFromShopify($p);
            if ($prod) $products[] = $prod;
        }
        if (count($json['products']) < 250) break;
        $page++;
    }
    return $products;
}

function productFromShopify($p) {
    if (empty($p['handle'])) return null;

    // Prefer the first in-stock variant; fall back to the first variant
    $v = null;
    foreach (($p['variants'] ?? []) as $vv) {
        if (!empty($vv['available'])) { $v = $vv; break; }
    }
    if (!$v) $v = $p['variants'][0] ?? null;
    if (!$v || $v['price'] === '' || $v['price'] === null) return null;

    return [
        'id'          => (string)($v['sku'] ?: $p['id']),
        'name'        => strip_tags($p['title'] ?? ''),
        'model'       => (string)($v['sku'] ?? ''),
        'description' => trim(strip_tags($p['body_html'] ?? '')),
        'url'         => STORE_URL . '/products/' . $p['handle'],
        'image'       => $p['images'][0]['src'] ?? '',
        'price'       => preg_replace('/[^\d.]/', '', (string)$v['price']),
        'barcode'     => '',
        'brand'       => $p['vendor'] ?? '',
        'warranty'    => DEFAULT_WARRANTY,
        'warrantyBy'  => DEFAULT_WARRANTY_BY,
        'shipping'    => DEFAULT_SHIPPING,
        'delivery'    => DEFAULT_DELIVERY,
        'openPrice'   => '',
    ];
}

function getCategories() {
    $cached = cacheGet('categories');
    if ($cached) return $cached;

    // Shopify first — this is the live platform
    $cats = getCategoriesShopify();
    if (!empty($cats)) {
        cacheSet('categories', $cats);
        return $cats;
    }

    // Legacy WooCommerce fallbacks below (kept in case the platform changes)
    $html = fetchHtml(STORE_URL . '/');
    $cats = [];

    // WooCommerce product-category links
    preg_match_all(
        '#href=["\'](' . preg_quote(STORE_URL, '#') . '/product-category/([^/"\']+)/?)["\']#i',
        $html, $m, PREG_SET_ORDER
    );
    foreach ($m as $match) {
        $url  = rtrim($match[1], '/');
        $slug = $match[2];
        if (!isset($cats[$slug])) {
            // Extract category name from the link text (simplistic)
            $label = ucwords(str_replace(['-', '_'], ' ', $slug));
            $cats[$slug] = ['slug' => $slug, 'name' => $label, 'url' => $url];
        }
    }

    // Fallback: try /wp-json/wc/v3/products/categories if API is open
    if (empty($cats)) {
        $json = @json_decode(fetchHtml(STORE_URL . '/wp-json/wc/v3/products/categories?per_page=100&hide_empty=1'), true);
        if (is_array($json)) {
            foreach ($json as $cat) {
                $cats[$cat['slug']] = [
                    'slug' => $cat['slug'],
                    'name' => html_entity_decode($cat['name'], ENT_QUOTES, 'UTF-8'),
                    'url'  => STORE_URL . '/product-category/' . $cat['slug'],
                ];
            }
        }
    }

    $cats = array_values($cats);
    cacheSet('categories', $cats);
    return $cats;
}

function getProducts($slug, $categoryUrl) {
    $cached = cacheGet('products_' . $slug);
    if ($cached) return $cached;

    // Shopify first — this is the live platform
    $products = getProductsShopify($slug);
    if (!empty($products)) {
        cacheSet('products_' . $slug, $products);
        return $products;
    }

    $products = [];
    $page = 1;

    // Legacy WooCommerce fallback (kept in case the platform changes)
    $apiJson = @json_decode(
        fetchHtml(STORE_URL . '/wp-json/wc/v3/products?per_page=100&category_slug=' . urlencode($slug) . '&status=publish'),
        true
    );

    if (is_array($apiJson) && count($apiJson) > 0) {
        foreach ($apiJson as $p) {
            $products[] = productFromWcApi($p);
        }
    } else {
        // Scrape pagination
        while (true) {
            $url = $page === 1 ? $categoryUrl : rtrim($categoryUrl, '/') . '/page/' . $page . '/';
            $html = fetchHtml($url);
            if (!$html) break;

            // Collect product page links
            preg_match_all(
                '#href=["\'](' . preg_quote(STORE_URL, '#') . '/product/[^"\']+)["\']#i',
                $html, $links, PREG_SET_ORDER
            );
            $urls = array_unique(array_column($links, 1));
            if (empty($urls)) break;

            foreach ($urls as $productUrl) {
                $p = scrapeProduct($productUrl);
                if ($p) $products[] = $p;
            }

            // Check for next page
            if (!preg_match('#class=["\'][^"\']*next[^"\']*["\']#i', $html)) break;
            $page++;
        }
    }

    cacheSet('products_' . $slug, $products);
    return $products;
}

function productFromWcApi($p) {
    $price = isset($p['price']) ? preg_replace('/[^\d.]/', '', $p['price']) : '';
    $image = '';
    if (!empty($p['images'][0]['src'])) {
        // Prefer large image (remove thumbnail size suffix)
        $image = preg_replace('/-\d+x\d+(\.\w+)$/', '$1', $p['images'][0]['src']);
    }
    $brand = '';
    if (!empty($p['attributes'])) {
        foreach ($p['attributes'] as $attr) {
            if (preg_match('/מותג|brand/iu', $attr['name'])) {
                $brand = implode(', ', $attr['options'] ?? []);
                break;
            }
        }
    }
    return [
        'id'          => (string)$p['id'],
        'name'        => strip_tags($p['name'] ?? ''),
        'model'       => $p['sku'] ?? '',
        'description' => strip_tags($p['short_description'] ?? $p['description'] ?? ''),
        'url'         => $p['permalink'] ?? '',
        'image'       => $image,
        'price'       => $price,
        'barcode'     => '',
        'brand'       => $brand,
        'warranty'    => DEFAULT_WARRANTY,
        'warrantyBy'  => DEFAULT_WARRANTY_BY,
        'shipping'    => DEFAULT_SHIPPING,
        'delivery'    => DEFAULT_DELIVERY,
        'openPrice'   => '',
    ];
}

function scrapeProduct($url) {
    $html = fetchHtml($url);
    if (!$html) return null;

    // Product name
    preg_match('#<h1[^>]*class=["\'][^"\']*product_title[^"\']*["\'][^>]*>(.*?)</h1>#is', $html, $m);
    $name = $m ? strip_tags($m[1]) : '';

    // Price
    preg_match('#class=["\'][^"\']*woocommerce-Price-amount[^"\']*["\'][^>]*><bdi[^>]*>(.*?)</bdi>#is', $html, $m);
    $price = $m ? preg_replace('/[^\d.]/', '', strip_tags($m[1])) : '';

    // Image — prefer data-large_image
    preg_match('#data-large_image=["\']([^"\']+)["\']#i', $html, $m);
    $image = $m ? $m[1] : '';
    if (!$image) {
        preg_match('#class=["\'][^"\']*wp-post-image[^"\']*["\'][^>]*src=["\']([^"\']+)["\']#i', $html, $m);
        $image = $m ? $m[1] : '';
    }

    // SKU
    preg_match('#<span class=["\']sku["\'][^>]*>(.*?)</span>#is', $html, $m);
    $sku = $m ? trim(strip_tags($m[1])) : '';

    // Short description
    preg_match('#class=["\'][^"\']*short-description[^"\']*["\'][^>]*>(.*?)</div>#is', $html, $m);
    $desc = $m ? strip_tags($m[1]) : '';

    if (!$name || !$price) return null;

    $slug = basename(rtrim($url, '/'));
    return [
        'id'          => $sku ?: $slug,
        'name'        => $name,
        'model'       => $sku,
        'description' => $desc,
        'url'         => $url,
        'image'       => $image,
        'price'       => $price,
        'barcode'     => '',
        'brand'       => '',
        'warranty'    => DEFAULT_WARRANTY,
        'warrantyBy'  => DEFAULT_WARRANTY_BY,
        'shipping'    => DEFAULT_SHIPPING,
        'delivery'    => DEFAULT_DELIVERY,
        'openPrice'   => '',
    ];
}

// ─── XML BUILDER ─────────────────────────────────────────────────────────────

function xmlEsc($s) {
    return htmlspecialchars((string)$s, ENT_XML1, 'UTF-8');
}

function sanitizeUrl($url) {
    // Remove single apostrophes; percent-encode non-ASCII (Hebrew)
    $url = str_replace("'", '', $url);
    return preg_replace_callback('/[^\x00-\x7F]+/', function($m) {
        return rawurlencode($m[0]);
    }, $url);
}

function buildXml($products) {
    $items = '';
    foreach ($products as $p) {
        $name    = mb_substr(strip_tags($p['name'] ?? ''),        0, 120, 'UTF-8');
        $details = mb_substr(strip_tags($p['description'] ?? ''), 0, 255, 'UTF-8');
        $url     = mb_substr(sanitizeUrl($p['url'] ?? ''),        0, 255, 'UTF-8');
        $image   = mb_substr(sanitizeUrl($p['image'] ?? ''),      0, 255, 'UTF-8');

        $isPersonal = !empty($p['openPrice']);
        $priceVal   = $isPersonal ? '' : xmlEsc(preg_replace('/[^\d.]/', '', $p['price'] ?? ''));
        $openPrice  = $isPersonal ? "\n      <Open_Price>" . xmlEsc($p['openPrice']) . "</Open_Price>" : '';

        $items .= "    <PRODUCT>\n"
            . "      <URL_PRODUCT>"    . xmlEsc($url)                              . "</URL_PRODUCT>\n"
            . "      <NAME_PRODUCT>"   . xmlEsc($name)                             . "</NAME_PRODUCT>\n"
            . "      <MODEL>"          . xmlEsc($p['model'] ?? '')                 . "</MODEL>\n"
            . "      <DETAILS>"        . xmlEsc($details)                          . "</DETAILS>\n"
            . "      <NUMBER_CATALOG>" . xmlEsc($p['barcode'] ?? '')               . "</NUMBER_CATALOG>\n"
            . "      <PRODUCTCODE>"    . xmlEsc($p['id'] ?? '')                    . "</PRODUCTCODE>\n"
            . "      <CURRENCY>ILS</CURRENCY>\n"
            . "      <PRICE>"          . $priceVal                                 . "</PRICE>" . $openPrice . "\n"
            . "      <COST_SHIPMENT>"  . xmlEsc($p['shipping'] ?? '0')             . "</COST_SHIPMENT>\n"
            . "      <TIME_DELIVERY>"  . xmlEsc($p['delivery'] ?? '3')             . "</TIME_DELIVERY>\n"
            . "      <MANUFACTURER>"   . xmlEsc($p['brand'] ?? '')                 . "</MANUFACTURER>\n"
            . "      <WARRANTY>"       . xmlEsc(mb_substr($p['warranty'] ?? '', 0, 100, 'UTF-8'))   . "</WARRANTY>\n"
            . "      <WARRANTYBY>"     . xmlEsc(mb_substr($p['warrantyBy'] ?? '', 0, 200, 'UTF-8')) . "</WARRANTYBY>\n"
            . "      <IMAGE>"          . xmlEsc($image)                            . "</IMAGE>\n"
            . "      <TAX></TAX>\n"
            . "    </PRODUCT>\n";
    }

    return '<?xml version="1.0" encoding="UTF-8"?>' . "\n"
        . "<STORE>\n"
        . "  <PRODUCTS>\n"
        . $items
        . "  </PRODUCTS>\n"
        . "</STORE>";
}

// ─── ROUTES ──────────────────────────────────────────────────────────────────

function serveCategoryXml($slug) {
    $cats = getCategories();
    $cat  = null;
    foreach ($cats as $c) {
        if ($c['slug'] === $slug) { $cat = $c; break; }
    }
    $catUrl   = $cat ? $cat['url'] : STORE_URL . '/product-category/' . $slug . '/';
    $products = getProducts($slug, $catUrl);

    header('Content-Type: application/xml; charset=utf-8');
    echo buildXml($products);
}

function serveIndex() {
    $cats = getCategories();
    $thisUrl = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http')
             . '://' . $_SERVER['HTTP_HOST'] . $_SERVER['SCRIPT_NAME'];

    $rows = '';
    foreach ($cats as $c) {
        $link = $thisUrl . '?cat=' . urlencode($c['slug']);
        $rows .= '<li><a href="' . htmlspecialchars($link, ENT_QUOTES) . '">'
               . htmlspecialchars($c['name'], ENT_QUOTES) . '</a></li>' . "\n";
    }

    header('Content-Type: text/html; charset=utf-8');
    echo '<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>' . STORE_NAME . ' — קטגוריות</title>
  <style>
    body  { font-family: Arial, sans-serif; direction: rtl; padding: 24px; background: #f9f9f9; }
    h1    { color: #222; }
    ul    { list-style: none; padding: 0; }
    li    { margin: 8px 0; }
    a     { color: #0066cc; font-size: 1.05em; text-decoration: none; }
    a:hover { text-decoration: underline; }
    small { color: #888; }
  </style>
</head>
<body>
  <h1>' . STORE_NAME . '</h1>
  <h2>קטגוריות מוצרים</h2>
  <ul>
' . $rows . '  </ul>
  <p><small>עדכון אחרון: ' . date('d/m/Y H:i') . ' | רענון: <a href="?refresh=' . REFRESH_SECRET . '">כאן</a></small></p>
</body>
</html>';
}
