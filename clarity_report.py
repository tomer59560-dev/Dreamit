#!/usr/bin/env python3
"""
Daily Microsoft Clarity Report — sends an HTML email with behavior insights.
Runs automatically via GitHub Actions every morning.
"""

import os
import json
import smtplib
import sys
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path

try:
    import requests
except ImportError:
    print("pip install requests"); sys.exit(1)

# ── Config (from environment / GitHub Secrets) ─────────────────────────────────

CLARITY_TOKEN      = os.environ["CLARITY_API_TOKEN"]
PROJECT_ID         = os.environ["CLARITY_PROJECT_ID"]
SMTP_HOST          = os.getenv("SMTP_HOST", "smtp.office365.com")
SMTP_PORT          = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER          = os.environ["SMTP_USER"]          # your sender email
SMTP_PASS          = os.environ["SMTP_PASS"]          # your email password
REPORT_TO          = os.getenv("REPORT_TO", "dreamitisrael@outlook.com")
DAYS               = int(os.getenv("CLARITY_DAYS", "7"))

API_BASE = "https://www.clarity.ms/export-data/api/v1"


# ── Fetch ──────────────────────────────────────────────────────────────────────

def fetch_metrics() -> list:
    """Fetch metrics from Clarity API. Returns list of {metricName, information:[...]} objects."""
    url = f"{API_BASE}/project-live-insights"
    headers = {"Authorization": f"Bearer {CLARITY_TOKEN}"}
    resp = requests.get(url, params={"projectId": PROJECT_ID}, headers=headers, timeout=30)
    if not resp.ok:
        print(f"API error {resp.status_code}: {resp.text}")
        sys.exit(1)
    data = resp.json()
    return data if isinstance(data, list) else data.get("metrics", data.get("data", [data]))


# ── Parse metrics ──────────────────────────────────────────────────────────────

def get_metric(metrics: list, name: str) -> dict:
    """Find a metric by name (case-insensitive) and return its first information row."""
    for m in metrics:
        if m.get("metricName", "").lower() == name.lower():
            info = m.get("information", [])
            return info[0] if info else {}
    return {}


def num(v) -> int:
    try: return int(v)
    except Exception: return 0


def pct(v) -> str:
    try:
        f = float(v)
        return f"{f:.1f}%"
    except Exception:
        return "—"


def card(bg: str, value: str, label: str) -> str:
    return (f'<div style="flex:1;min-width:140px;background:{bg};border-radius:10px;'
            f'padding:18px;color:#fff;text-align:center">'
            f'<div style="font-size:28px;font-weight:bold">{value}</div>'
            f'<div style="font-size:12px;margin-top:6px;opacity:.9">{label}</div></div>')


def metric_row(color: str, icon: str, title: str, value: str, detail: str, what_it_means: str) -> str:
    return f"""
    <tr>
      <td style="padding:14px 12px;border-bottom:1px solid #eee;width:40px;font-size:22px">{icon}</td>
      <td style="padding:14px 12px;border-bottom:1px solid #eee">
        <strong style="color:{color}">{title}</strong><br>
        <span style="color:#555;font-size:13px">{what_it_means}</span>
      </td>
      <td style="padding:14px 12px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">
        <span style="font-size:20px;font-weight:bold;color:{color}">{value}</span><br>
        <span style="font-size:12px;color:#888">{detail}</span>
      </td>
    </tr>"""


# ── Build HTML email ───────────────────────────────────────────────────────────

def build_html(metrics: list) -> str:
    date_range = f"Last {DAYS} days — {datetime.utcnow().strftime('%b %d, %Y')}"

    # Extract known metrics
    dead   = get_metric(metrics, "DeadClickCount")
    rage   = get_metric(metrics, "RageClickCount")
    scroll = get_metric(metrics, "ExcessiveScroll")
    quick  = get_metric(metrics, "QuickBackClick")

    # Sessions total (same across all metrics)
    sessions = num(dead.get("sessionsCount") or rage.get("sessionsCount") or
                   scroll.get("sessionsCount") or "0")

    # Build summary cards
    cards_html = '<div style="display:flex;gap:10px;flex-wrap:wrap;margin:16px 0">'
    cards_html += card("#4361ee", f"{sessions:,}", "Total Sessions")

    for m in metrics:
        info = m.get("information", [{}])[0]
        pct_with = info.get("sessionsWithMetricPercentage", 0)
        sub = num(info.get("subTotal", 0))
        name = m.get("metricName", "")
        color_map = {
            "DeadClickCount":   "#457b9d",
            "RageClickCount":   "#e63946",
            "ExcessiveScroll":  "#f4a261",
            "QuickBackClick":   "#7209b7",
        }
        label_map = {
            "DeadClickCount":  "Dead Clicks",
            "RageClickCount":  "Rage Clicks",
            "ExcessiveScroll": "Excessive Scrolls",
            "QuickBackClick":  "Quick Backs",
        }
        if name in color_map:
            cards_html += card(color_map[name], f"{sub:,}", label_map[name])
    cards_html += '</div>'

    # Build detail rows
    rows_html = ""
    metric_defs = [
        ("RageClickCount",  "#e63946", "😤", "Rage Clicks",
         "Users clicking the same spot multiple times in frustration — usually a broken button or unclickable element."),
        ("DeadClickCount",  "#457b9d", "☠️", "Dead Clicks",
         "Clicks that do nothing — users expecting something to be clickable but it isn't."),
        ("ExcessiveScroll", "#f4a261", "📜", "Excessive Scrolling",
         "Users scrolling up and down repeatedly — they can't find what they're looking for."),
        ("QuickBackClick",  "#7209b7", "⏪", "Quick Back Clicks",
         "Users landing on a page and immediately going back — the page didn't match their expectation."),
    ]

    for mname, color, icon, title, meaning in metric_defs:
        m = get_metric(metrics, mname)
        if not m:
            continue
        sub      = num(m.get("subTotal", 0))
        pct_with = float(m.get("sessionsWithMetricPercentage", 0))
        rows_html += metric_row(
            color, icon, title,
            value=f"{sub:,}",
            detail=f"{pct_with:.1f}% of sessions affected",
            what_it_means=meaning
        )

    detail_table = f'<table style="border-collapse:collapse;width:100%">{rows_html}</table>'

    # Practical conclusions
    conclusions = []
    rage_info  = get_metric(metrics, "RageClickCount")
    dead_info  = get_metric(metrics, "DeadClickCount")
    scroll_info = get_metric(metrics, "ExcessiveScroll")
    quick_info  = get_metric(metrics, "QuickBackClick")

    if float(rage_info.get("sessionsWithMetricPercentage", 0)) > 5:
        conclusions.append("⚠️ <strong>Rage clicks are high</strong> — check your add-to-cart button, checkout flow, and any buttons that look clickable but might be broken on mobile.")
    if float(dead_info.get("sessionsWithMetricPercentage", 0)) > 10:
        conclusions.append("⚠️ <strong>Too many dead clicks</strong> — customers are tapping on product images or text expecting links. Consider making more elements clickable.")
    if float(scroll_info.get("sessionsWithMetricPercentage", 0)) > 15:
        conclusions.append("⚠️ <strong>Excessive scrolling detected</strong> — customers struggle to find key info (price, size, CTA). Simplify your page layout.")
    if float(quick_info.get("sessionsWithMetricPercentage", 0)) > 10:
        conclusions.append("⚠️ <strong>High quick-back rate</strong> — customers land and immediately leave. Check if your page loads slowly or if ad targeting is sending wrong audience.")
    if not conclusions:
        conclusions.append("✅ <strong>All metrics look healthy!</strong> Keep monitoring for changes.")

    conclusions_html = "<ul style='padding-left:20px'>" + "".join(f"<li style='margin-bottom:10px'>{c}</li>" for c in conclusions) + "</ul>"

    return f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#222;max-width:680px;margin:0 auto;padding:24px}}</style>
</head><body>
<div style="background:linear-gradient(135deg,#4361ee,#7209b7);border-radius:12px;padding:24px;color:#fff;margin-bottom:24px">
  <h1 style="margin:0;font-size:22px">Dreamit Store — Clarity Report</h1>
  <p style="margin:6px 0 0;opacity:.85">{date_range}</p>
</div>

<h2 style="color:#4361ee;border-left:4px solid #4361ee;padding-left:10px">Overview</h2>
{cards_html}

<h2 style="color:#333;border-left:4px solid #333;padding-left:10px;margin-top:28px">Behavior Metrics</h2>
{detail_table}

<h2 style="color:#2a9d8f;border-left:4px solid #2a9d8f;padding-left:10px;margin-top:28px">Practical Conclusions</h2>
{conclusions_html}

<div style="margin-top:32px;padding:14px;background:#f8f9fa;border-radius:8px;font-size:12px;color:#888;text-align:center">
  Auto-generated daily · Project {PROJECT_ID}<br>
  <a href="https://clarity.microsoft.com/projects/view/{PROJECT_ID}/dashboard" style="color:#4361ee">Open Clarity Dashboard →</a>
</div>
</body></html>"""


# ── Send email ─────────────────────────────────────────────────────────────────

def send_email(html: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Dreamit Store — Clarity Report {datetime.utcnow().strftime('%b %d, %Y')}"
    msg["From"]    = SMTP_USER
    msg["To"]      = REPORT_TO
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, REPORT_TO, msg.as_string())
    print(f"Report sent to {REPORT_TO}")


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    print("Fetching Clarity data...")
    metrics = fetch_metrics()
    print(f"Got {len(metrics)} metric types: {[m.get('metricName') for m in metrics]}")

    html = build_html(metrics)
    Path("clarity_report.html").write_text(html)
    print("Report saved to clarity_report.html")

    send_email(html)
    print("Done!")


if __name__ == "__main__":
    main()
