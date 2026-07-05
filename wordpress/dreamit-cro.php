<?php
/**
 * Plugin Name: Dream It Israel — Conversion Rate Optimization Kit
 * Description: High-impact WooCommerce conversion features for dreamitisrael.com — free-shipping progress bar, sticky add-to-cart, trust badges, delivery promise + countdown, real low-stock urgency, buy-now button, WhatsApp button, exit-intent coupon popup, URL coupon auto-apply, checkout trust. All features are toggleable below and fire Microsoft Clarity events so impact is measurable.
 * Version: 1.0.0
 * Author: Dream It Israel
 * Text Domain: dreamit-cro
 *
 * INSTALL: upload this single file to wp-content/plugins/dreamit-cro/dreamit-cro.php
 * (or zip it and use Plugins → Add New → Upload), then activate.
 * Requires WooCommerce. Safe to deactivate at any time — no database changes.
 */

if (!defined('ABSPATH')) exit;

// ─── CONFIG — edit here, or override via the `dreamit_cro_config` filter ──────
function dreamit_cro_config() {
    static $cfg = null;
    if ($cfg !== null) return $cfg;

    $cfg = apply_filters('dreamit_cro_config', [
        // Feature toggles
        'free_shipping_bar'   => true,
        'sticky_add_to_cart'  => true,
        'trust_badges'        => true,
        'delivery_promise'    => true,
        'low_stock_urgency'   => true,
        'buy_now_button'      => true,
        'whatsapp_button'     => true,   // needs whatsapp_phone below
        'exit_intent_popup'   => true,   // needs exit_coupon_code below
        'url_coupon'          => true,   // ?coupon=CODE auto-applies (for ads/ZAP links)
        'checkout_trust'      => true,

        // Free shipping progress bar
        'free_shipping_threshold' => 199,      // ₪ — set to your real free-shipping minimum, 0 disables
        'currency_symbol'         => '₪',

        // Delivery promise (keep consistent with the ZAP feed: 7 business days)
        'delivery_business_days'  => 7,
        'order_cutoff_hour'       => 14,       // orders before 14:00 ship same business day
        'weekend_days'            => [5, 6],   // ISO-8601: 5=Friday, 6=Saturday (Israel)

        // Low-stock urgency — shown ONLY from real WooCommerce stock quantities
        'low_stock_threshold'     => 5,

        // WhatsApp — international format, digits only. Empty = button hidden.
        'whatsapp_phone'          => '',       // e.g. '972501234567'

        // Exit-intent popup — create this coupon in WooCommerce → Marketing → Coupons.
        // Empty = popup hidden.
        'exit_coupon_code'        => '',       // e.g. 'STAY5'
        'exit_coupon_text'        => '5% הנחה על ההזמנה הראשונה שלכם',
        'exit_popup_cooldown_days'=> 7,

        // Warranty text shown in trust badges (matches the ZAP feed)
        'warranty_text'           => 'אחריות 12 חודשים',
    ]);
    return $cfg;
}

// ─── BOOTSTRAP ────────────────────────────────────────────────────────────────
add_action('plugins_loaded', function () {
    if (!class_exists('WooCommerce')) {
        add_action('admin_notices', function () {
            echo '<div class="notice notice-error"><p>Dream It CRO Kit requires WooCommerce.</p></div>';
        });
        return;
    }
    Dreamit_CRO::init();
});

final class Dreamit_CRO {

    public static function init() {
        $cfg = dreamit_cro_config();

        add_action('wp_enqueue_scripts', [__CLASS__, 'assets']);

        if ($cfg['free_shipping_bar'] && $cfg['free_shipping_threshold'] > 0) {
            add_action('woocommerce_before_cart', [__CLASS__, 'free_shipping_bar'], 5);
            add_action('woocommerce_widget_shopping_cart_before_buttons', [__CLASS__, 'free_shipping_bar'], 5);
            add_action('woocommerce_before_checkout_form', [__CLASS__, 'free_shipping_bar'], 5);
        }
        if ($cfg['low_stock_urgency']) {
            add_action('woocommerce_single_product_summary', [__CLASS__, 'low_stock_notice'], 15);
        }
        if ($cfg['delivery_promise']) {
            add_action('woocommerce_single_product_summary', [__CLASS__, 'delivery_promise'], 32);
        }
        if ($cfg['buy_now_button']) {
            add_action('woocommerce_after_add_to_cart_button', [__CLASS__, 'buy_now_button']);
        }
        if ($cfg['trust_badges']) {
            add_action('woocommerce_single_product_summary', [__CLASS__, 'trust_badges'], 35);
        }
        if ($cfg['sticky_add_to_cart']) {
            add_action('wp_footer', [__CLASS__, 'sticky_add_to_cart']);
        }
        if ($cfg['whatsapp_button'] && $cfg['whatsapp_phone'] !== '') {
            add_action('wp_footer', [__CLASS__, 'whatsapp_button']);
        }
        if ($cfg['exit_intent_popup'] && $cfg['exit_coupon_code'] !== '') {
            add_action('wp_footer', [__CLASS__, 'exit_popup']);
        }
        if ($cfg['url_coupon']) {
            add_action('wp_loaded', [__CLASS__, 'capture_url_coupon'], 20);
            add_action('woocommerce_add_to_cart', [__CLASS__, 'apply_pending_coupon'], 20);
        }
        if ($cfg['checkout_trust']) {
            add_action('woocommerce_review_order_after_submit', [__CLASS__, 'checkout_trust']);
            add_action('woocommerce_after_cart_totals', [__CLASS__, 'checkout_trust']);
        }
    }

    // ─── Free shipping progress bar ──────────────────────────────────────────
    public static function free_shipping_bar() {
        $cfg = dreamit_cro_config();
        if (!WC()->cart || WC()->cart->is_empty()) return;

        $threshold = (float) $cfg['free_shipping_threshold'];
        $subtotal  = (float) WC()->cart->get_displayed_subtotal();
        $remaining = max(0, $threshold - $subtotal);
        $pct       = min(100, round($subtotal / $threshold * 100));

        echo '<div class="dcro-fsbar" data-dcro-view="dcro_fs_bar_view">';
        if ($remaining > 0) {
            printf(
                '<p class="dcro-fsbar-text">הוסיפו עוד <strong>%s</strong> וקבלו <strong>משלוח חינם!</strong></p>',
                wp_kses_post(wc_price($remaining))
            );
        } else {
            echo '<p class="dcro-fsbar-text dcro-fsbar-done">🎉 מגיע לכם <strong>משלוח חינם</strong> על ההזמנה הזו!</p>';
        }
        printf('<div class="dcro-fsbar-track"><div class="dcro-fsbar-fill" style="width:%d%%"></div></div>', (int) $pct);
        echo '</div>';
    }

    // ─── Real low-stock urgency ──────────────────────────────────────────────
    public static function low_stock_notice() {
        global $product;
        $cfg = dreamit_cro_config();
        if (!$product instanceof WC_Product || !$product->managing_stock()) return;

        $qty = $product->get_stock_quantity();
        if ($qty === null || $qty <= 0 || $qty > (int) $cfg['low_stock_threshold']) return;

        printf(
            '<p class="dcro-lowstock">🔥 נשארו רק <strong>%d</strong> יחידות במלאי</p>',
            (int) $qty
        );
    }

    // ─── Delivery promise + same-day-dispatch countdown ─────────────────────
    public static function delivery_promise() {
        $cfg = dreamit_cro_config();
        $tz  = wp_timezone();
        $now = new DateTimeImmutable('now', $tz);

        // Dispatch day: today if it's a business day and before cutoff, else next business day
        $dispatch = $now;
        $same_day = self::is_business_day($dispatch, $cfg)
                 && (int) $now->format('G') < (int) $cfg['order_cutoff_hour'];
        if (!$same_day) {
            $dispatch = $dispatch->modify('+1 day')->setTime(0, 0);
            while (!self::is_business_day($dispatch, $cfg)) {
                $dispatch = $dispatch->modify('+1 day');
            }
        }

        // Arrival estimate: dispatch + N business days
        $arrival = $dispatch;
        for ($i = 0; $i < (int) $cfg['delivery_business_days']; $i++) {
            $arrival = $arrival->modify('+1 day');
            while (!self::is_business_day($arrival, $cfg)) {
                $arrival = $arrival->modify('+1 day');
            }
        }

        echo '<div class="dcro-delivery">';
        if ($same_day) {
            $cutoff = $now->setTime((int) $cfg['order_cutoff_hour'], 0);
            printf(
                '<p>🚚 הזמינו בתוך <strong class="dcro-countdown" data-deadline="%d">--:--</strong> והחבילה יוצאת לדרך <strong>עוד היום</strong></p>',
                (int) $cutoff->getTimestamp()
            );
        }
        printf(
            '<p>📦 צפי אספקה עד יום %s</p>',
            esc_html(wp_date('l, j בF', $arrival->getTimestamp(), $tz))
        );
        echo '</div>';
    }

    private static function is_business_day(DateTimeImmutable $d, array $cfg) {
        return !in_array((int) $d->format('N'), (array) $cfg['weekend_days'], true);
    }

    // ─── Buy-now button (simple products) ───────────────────────────────────
    public static function buy_now_button() {
        global $product;
        if (!$product instanceof WC_Product || !$product->is_type('simple') || !$product->is_in_stock()) return;

        $url = add_query_arg('add-to-cart', $product->get_id(), wc_get_checkout_url());
        printf(
            '<a href="%s" class="dcro-buynow" data-dcro-event="dcro_buy_now" rel="nofollow">⚡ קנו עכשיו — ישר לתשלום</a>',
            esc_url($url)
        );
    }

    // ─── Trust badges ────────────────────────────────────────────────────────
    public static function trust_badges() {
        $cfg    = dreamit_cro_config();
        $badges = apply_filters('dreamit_cro_trust_badges', [
            ['🚚', 'משלוח מהיר עד הבית'],
            ['🛡️', esc_html($cfg['warranty_text'])],
            ['🔒', 'תשלום מאובטח 100%'],
            ['💬', 'שירות אישי ומענה מהיר'],
        ]);

        echo '<ul class="dcro-badges">';
        foreach ($badges as $b) {
            printf('<li><span class="dcro-badge-icon">%s</span>%s</li>', esc_html($b[0]), wp_kses_post($b[1]));
        }
        echo '</ul>';
    }

    // ─── Sticky add-to-cart bar (product pages) ─────────────────────────────
    public static function sticky_add_to_cart() {
        if (!is_product()) return;
        $product = wc_get_product(get_queried_object_id());
        if (!$product instanceof WC_Product || !$product->is_in_stock()) return;
        ?>
        <div class="dcro-sticky" id="dcro-sticky" aria-hidden="true">
            <div class="dcro-sticky-info">
                <span class="dcro-sticky-name"><?php echo esc_html(wp_trim_words($product->get_name(), 8, '…')); ?></span>
                <span class="dcro-sticky-price"><?php echo wp_kses_post($product->get_price_html()); ?></span>
            </div>
            <button type="button" class="dcro-sticky-btn" data-dcro-event="dcro_sticky_add">
                <?php echo $product->is_type('simple') ? 'הוספה לסל' : 'לבחירת דגם'; ?>
            </button>
        </div>
        <?php
    }

    // ─── Floating WhatsApp button ────────────────────────────────────────────
    public static function whatsapp_button() {
        $cfg   = dreamit_cro_config();
        $phone = preg_replace('/\D/', '', $cfg['whatsapp_phone']);
        if ($phone === '') return;

        $msg = 'היי, אשמח לעזרה 🙂';
        if (is_product()) {
            $product = wc_get_product(get_queried_object_id());
            if ($product instanceof WC_Product) {
                $msg = 'היי, יש לי שאלה על "' . $product->get_name() . '" — ' . get_permalink($product->get_id());
            }
        }
        printf(
            '<a class="dcro-wa" data-dcro-event="dcro_whatsapp_click" target="_blank" rel="noopener nofollow" href="%s" aria-label="WhatsApp">
                <svg viewBox="0 0 32 32" width="30" height="30" fill="#fff" aria-hidden="true"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-1.5c1.2.6 2.5.9 3.8.9 6.6 0 12-5.4 12-12S22.6 3 16 3zm6.6 16.9c-.3.8-1.6 1.5-2.2 1.6-.6.1-1.3.2-3.7-.8-3.1-1.3-5.1-4.4-5.3-4.6-.2-.2-1.3-1.7-1.3-3.2s.8-2.3 1.1-2.6c.3-.3.6-.4.8-.4h.6c.2 0 .5-.1.7.5l1 2.4c.1.2.1.4 0 .6l-.4.7-.6.6c-.2.2-.4.4-.2.7.2.4 1 1.6 2.1 2.6 1.4 1.3 2.6 1.7 3 1.9.4.2.6.2.8-.1l1-1.2c.2-.3.4-.3.7-.2l2.2 1c.3.2.6.3.7.4.1.3.1.9-.2 1.7z"/></svg>
            </a>',
            esc_url('https://wa.me/' . $phone . '?text=' . rawurlencode($msg))
        );
    }

    // ─── Exit-intent coupon popup ────────────────────────────────────────────
    public static function exit_popup() {
        if (is_checkout() && !is_order_received_page()) return; // never interrupt payment
        $cfg = dreamit_cro_config();
        $claim_url = add_query_arg('coupon', rawurlencode($cfg['exit_coupon_code']),
            wc_get_page_permalink('shop') ?: home_url('/'));
        ?>
        <div class="dcro-exit" id="dcro-exit" hidden
             data-cooldown="<?php echo (int) $cfg['exit_popup_cooldown_days']; ?>">
            <div class="dcro-exit-box" role="dialog" aria-modal="true" aria-label="הטבה מיוחדת">
                <button type="button" class="dcro-exit-close" aria-label="סגירה">&times;</button>
                <p class="dcro-exit-title">רגע לפני שעוזבים… 🎁</p>
                <p class="dcro-exit-sub"><?php echo esc_html($cfg['exit_coupon_text']); ?></p>
                <p class="dcro-exit-code"><?php echo esc_html($cfg['exit_coupon_code']); ?></p>
                <a class="dcro-exit-cta" data-dcro-event="dcro_exit_popup_claim" href="<?php echo esc_url($claim_url); ?>">למימוש ההטבה</a>
            </div>
        </div>
        <?php
    }

    // ─── URL coupon auto-apply (?coupon=CODE) ────────────────────────────────
    public static function capture_url_coupon() {
        if (empty($_GET['coupon']) || !WC()->session) return;
        $code = wc_format_coupon_code(wc_clean(wp_unslash($_GET['coupon'])));
        if ($code === '') return;

        if (!WC()->cart->is_empty()) {
            if (!WC()->cart->has_discount($code)) {
                WC()->cart->apply_coupon($code);
            }
        } else {
            if (!WC()->session->has_session()) {
                WC()->session->set_customer_session_cookie(true);
            }
            WC()->session->set('dreamit_cro_pending_coupon', $code);
        }
    }

    public static function apply_pending_coupon() {
        if (!WC()->session) return;
        $code = WC()->session->get('dreamit_cro_pending_coupon');
        if ($code && !WC()->cart->has_discount($code)) {
            WC()->cart->apply_coupon($code);
            WC()->session->set('dreamit_cro_pending_coupon', null);
        }
    }

    // ─── Checkout / cart trust reassurance ───────────────────────────────────
    public static function checkout_trust() {
        $cfg = dreamit_cro_config();
        printf(
            '<div class="dcro-checkout-trust">
                <span>🔒 תשלום מאובטח ומוצפן SSL</span>
                <span>🛡️ %s</span>
                <span>📞 שירות לקוחות ישראלי</span>
            </div>',
            esc_html($cfg['warranty_text'])
        );
    }

    // ─── CSS + JS (inline, zero external requests) ───────────────────────────
    public static function assets() {
        wp_register_style('dreamit-cro', false, [], '1.0.0');
        wp_enqueue_style('dreamit-cro');
        wp_add_inline_style('dreamit-cro', self::css());

        wp_register_script('dreamit-cro', false, [], '1.0.0', true);
        wp_enqueue_script('dreamit-cro');
        wp_add_inline_script('dreamit-cro', self::js());
    }

    private static function css() {
        return <<<'CSS'
.dcro-fsbar{background:#f0f9f2;border:1px solid #bfe6c8;border-radius:10px;padding:12px 16px;margin:0 0 16px;text-align:center}
.dcro-fsbar-text{margin:0 0 8px;font-size:15px}
.dcro-fsbar-done{color:#1a7f37}
.dcro-fsbar-track{background:#dfeee3;border-radius:99px;height:9px;overflow:hidden}
.dcro-fsbar-fill{background:linear-gradient(90deg,#34c759,#1a7f37);height:100%;border-radius:99px;transition:width .4s}
.dcro-lowstock{color:#c2410c;background:#fff4ec;border-radius:8px;padding:8px 12px;font-size:14px;display:inline-block;margin:6px 0}
.dcro-delivery{margin:10px 0;font-size:14px;line-height:1.7}
.dcro-delivery p{margin:2px 0}
.dcro-countdown{color:#c2410c;font-variant-numeric:tabular-nums}
.dcro-buynow{display:block;text-align:center;margin-top:10px;padding:13px 20px;background:#111;color:#fff !important;border-radius:8px;font-weight:700;text-decoration:none !important;font-size:16px}
.dcro-buynow:hover{background:#333}
.dcro-badges{list-style:none;margin:16px 0 0;padding:12px 0 0;border-top:1px solid #eee;display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;font-size:13.5px}
.dcro-badges li{display:flex;align-items:center;gap:8px;margin:0}
.dcro-badge-icon{font-size:17px}
.dcro-sticky{position:fixed;bottom:0;inset-inline:0;z-index:9998;background:#fff;box-shadow:0 -4px 18px rgba(0,0,0,.12);display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;transform:translateY(110%);transition:transform .25s}
.dcro-sticky.dcro-on{transform:none}
.dcro-sticky-info{display:flex;flex-direction:column;min-width:0}
.dcro-sticky-name{font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dcro-sticky-price{font-size:14px;color:#1a7f37;font-weight:700}
.dcro-sticky-btn{background:#1a7f37;color:#fff;border:0;border-radius:8px;padding:12px 22px;font-size:15px;font-weight:700;cursor:pointer;white-space:nowrap}
.dcro-sticky-btn:hover{background:#166b2f}
.dcro-wa{position:fixed;bottom:86px;inset-inline-end:16px;z-index:9997;width:54px;height:54px;border-radius:50%;background:#25d366;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,.25)}
.dcro-exit{position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:20px}
.dcro-exit[hidden]{display:none}
.dcro-exit-box{background:#fff;border-radius:14px;max-width:380px;width:100%;padding:30px 26px;text-align:center;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.3)}
.dcro-exit-close{position:absolute;top:8px;inset-inline-start:12px;background:none;border:0;font-size:26px;cursor:pointer;color:#999;line-height:1}
.dcro-exit-title{font-size:21px;font-weight:800;margin:0 0 6px}
.dcro-exit-sub{font-size:15px;color:#444;margin:0 0 14px}
.dcro-exit-code{font-size:20px;font-weight:800;letter-spacing:2px;background:#f6f6f6;border:2px dashed #bbb;border-radius:8px;padding:10px;margin:0 0 16px}
.dcro-exit-cta{display:block;background:#1a7f37;color:#fff !important;border-radius:8px;padding:13px;font-weight:700;text-decoration:none !important}
.dcro-checkout-trust{display:flex;flex-wrap:wrap;gap:8px 18px;justify-content:center;margin:14px 0;font-size:13px;color:#555}
@media(max-width:768px){.dcro-badges{font-size:12.5px}.dcro-sticky-name{max-width:40vw}}
CSS;
    }

    private static function js() {
        return <<<'JS'
(function(){
"use strict";
function tag(n){try{if(window.clarity)clarity("event",n);if(window.dataLayer)dataLayer.push({event:n});}catch(e){}}
document.addEventListener("click",function(e){
  var el=e.target.closest("[data-dcro-event]");
  if(el)tag(el.getAttribute("data-dcro-event"));
});
// one-time view events
document.querySelectorAll("[data-dcro-view]").forEach(function(el){tag(el.getAttribute("data-dcro-view"));});

// Sticky add-to-cart: show when the real form scrolls out of view
var sticky=document.getElementById("dcro-sticky"),form=document.querySelector("form.cart");
if(sticky&&form&&"IntersectionObserver"in window){
  new IntersectionObserver(function(en){
    var vis=en[0].isIntersecting;
    sticky.classList.toggle("dcro-on",!vis);
    sticky.setAttribute("aria-hidden",vis?"true":"false");
  },{rootMargin:"-60px 0px 0px 0px"}).observe(form);
  sticky.querySelector(".dcro-sticky-btn").addEventListener("click",function(){
    var btn=form.querySelector(".single_add_to_cart_button");
    if(btn&&!btn.disabled&&btn.offsetParent!==null&&form.querySelector("input[name=variation_id]")===null){btn.click();}
    else{form.scrollIntoView({behavior:"smooth",block:"center"});}
  });
}

// Dispatch cutoff countdown
document.querySelectorAll(".dcro-countdown").forEach(function(el){
  var end=parseInt(el.getAttribute("data-deadline"),10)*1000;
  function tick(){
    var s=Math.max(0,Math.floor((end-Date.now())/1000));
    var h=Math.floor(s/3600),m=Math.floor(s%3600/60);
    el.textContent=h+":"+String(m).padStart(2,"0")+" שעות";
    if(s>0)setTimeout(tick,30000);
  }
  tick();
});

// Exit-intent popup (desktop: mouse leaves viewport top; mobile: fast scroll-up after engagement)
var exitEl=document.getElementById("dcro-exit");
if(exitEl){
  var KEY="dcro_exit_shown",days=parseInt(exitEl.getAttribute("data-cooldown"),10)||7;
  var shown=false;
  try{shown=localStorage.getItem(KEY)&&Date.now()<parseInt(localStorage.getItem(KEY),10);}catch(e){}
  function show(){
    if(shown)return;shown=true;
    try{localStorage.setItem(KEY,String(Date.now()+days*864e5));}catch(e){}
    exitEl.hidden=false;tag("dcro_exit_popup_view");
  }
  if(!shown){
    document.addEventListener("mouseout",function(e){
      if(!e.relatedTarget&&e.clientY<=8)show();
    });
    var lastY=0,engaged=false;
    setTimeout(function(){engaged=true;},20000);
    window.addEventListener("scroll",function(){
      var y=window.scrollY;
      if(engaged&&lastY-y>350&&y<600)show();
      lastY=y;
    },{passive:true});
  }
  exitEl.addEventListener("click",function(e){
    if(e.target===exitEl||e.target.closest(".dcro-exit-close"))exitEl.hidden=true;
  });
}
})();
JS;
    }
}
