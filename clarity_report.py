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

def fetch(dimension: str) -> list:
    url = f"{API_BASE}/project-live-insights"
    end_date   = datetime.utcnow().strftime("%Y-%m-%d")
    start_date = (datetime.utcnow() - timedelta(days=DAYS)).strftime("%Y-%m-%d")

    attempts = [
        # Minimal — just projectId, no dimension/granularity
        {"projectId": PROJECT_ID},
        # With date range only
        {"projectId": PROJECT_ID, "startDate": start_date, "endDate": end_date},
        # With dimension (capitalized)
        {"projectId": PROJECT_ID, "startDate": start_date, "endDate": end_date,
         "dimension": dimension.capitalize()},
        # With granularity + dimension
        {"projectId": PROJECT_ID, "startDate": start_date, "endDate": end_date,
         "granularity": "Daily", "dimension": dimension.capitalize()},
        # numOfDays variants
        {"projectId": PROJECT_ID, "numOfDays": str(DAYS)},
        {"projectId": PROJECT_ID, "numOfDays": str(DAYS), "dimension": dimension.capitalize()},
    ]
    headers = {"Authorization": f"Bearer {CLARITY_TOKEN}"}

    for params in attempts:
        resp = requests.get(url, params=params, headers=headers, timeout=30)
        print(f"  [{dimension}] {resp.status_code} params={list(params.keys())} body={resp.text[:300]}")
        if resp.ok:
            data = resp.json()
            if isinstance(data, list):
                return data
            return data.get("insights", data.get("data", data.get("metrics", [data])))

    print(f"API error ({dimension}): all formats failed. See logs above for details.")
    return []


# ── Build report ───────────────────────────────────────────────────────────────

def top_rows(rows: list, sort_key: str, n: int = 5) -> list:
    return sorted(rows, key=lambda r: r.get(sort_key, 0), reverse=True)[:n]


def fmt_pct(v) -> str:
    try:
        f = float(v)
        return f"{f*100:.1f}%" if f <= 1 else f"{f:.1f}%"
    except Exception:
        return str(v)


def fmt_num(v) -> str:
    try:
        return f"{int(v):,}"
    except Exception:
        return str(v)


def find(row: dict, *keys):
    for k in keys:
        if k in row:
            return row[k]
    return "—"


def dim_label(row: dict) -> str:
    for k in ("url", "page", "pagePath", "path", "name", "key", "value", "dimension"):
        if k in row:
            v = str(row[k])
            return v[:60] + "…" if len(v) > 60 else v
    return "—"


def table_html(headers: list, rows: list) -> str:
    th = "".join(f'<th style="padding:8px 12px;text-align:left;background:#f0f0f0;border-bottom:2px solid #ddd">{h}</th>' for h in headers)
    body = ""
    for i, r in enumerate(rows):
        bg = "#fff" if i % 2 == 0 else "#fafafa"
        cells = "".join(f'<td style="padding:8px 12px;border-bottom:1px solid #eee">{c}</td>' for c in r)
        body += f'<tr style="background:{bg}">{cells}</tr>'
    return f'<table style="border-collapse:collapse;width:100%;font-size:14px"><thead><tr>{th}</tr></thead><tbody>{body}</tbody></table>'


def section(title: str, color: str, content: str) -> str:
    return f"""
    <div style="margin:24px 0">
      <h2 style="color:{color};border-left:4px solid {color};padding-left:10px;margin-bottom:12px">{title}</h2>
      {content}
    </div>"""


def build_html(pages: list, devices: list, countries: list) -> str:
    date_range = f"Last {DAYS} days ending {datetime.utcnow().strftime('%b %d, %Y')}"

    # ── Summary card ──
    total_sessions = sum(find(r, "sessions", "totalSessionCount", "sessionCount") or 0 for r in pages)
    avg_bounce     = sum(float(find(r, "bounceRate") or 0) for r in pages) / max(len(pages), 1)
    avg_scroll     = sum(float(find(r, "scrollDepth", "avgScrollDepth") or 0) for r in pages) / max(len(pages), 1)
    total_rage     = sum(int(find(r, "rageClicks", "rageClickCount") or 0) for r in pages)
    total_dead     = sum(int(find(r, "deadClicks", "deadClickCount") or 0) for r in pages)

    summary = f"""
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin:16px 0">
      {''.join(f'<div style="flex:1;min-width:130px;background:{bg};border-radius:8px;padding:16px;color:#fff;text-align:center"><div style="font-size:24px;font-weight:bold">{val}</div><div style="font-size:12px;margin-top:4px">{lbl}</div></div>'
      for bg, val, lbl in [
        ("#4361ee", fmt_num(total_sessions), "Sessions"),
        ("#f72585", fmt_pct(avg_bounce),     "Avg Bounce Rate"),
        ("#7209b7", fmt_pct(avg_scroll),     "Avg Scroll Depth"),
        ("#e63946", fmt_num(total_rage),     "Rage Clicks"),
        ("#457b9d", fmt_num(total_dead),     "Dead Clicks"),
      ])}
    </div>"""

    # ── Top pages ──
    page_col  = "sessions" if any("sessions" in r for r in pages) else "totalSessionCount"
    top_pages = top_rows(pages, page_col, 8)
    pages_tbl = table_html(
        ["Page", "Sessions", "Bounce Rate", "Scroll Depth", "Rage Clicks"],
        [(dim_label(r),
          fmt_num(find(r, "sessions", "totalSessionCount", "sessionCount")),
          fmt_pct(find(r, "bounceRate")),
          fmt_pct(find(r, "scrollDepth", "avgScrollDepth")),
          fmt_num(find(r, "rageClicks", "rageClickCount")))
         for r in top_pages]
    )

    # ── Rage click hotspots ──
    rage_rows = top_rows(pages, "rageClicks" if pages and "rageClicks" in pages[0] else "rageClickCount", 5)
    rage_tbl  = table_html(
        ["Page", "Rage Clicks", "Sessions"],
        [(dim_label(r),
          f'<span style="color:#e63946;font-weight:bold">{fmt_num(find(r,"rageClicks","rageClickCount"))}</span>',
          fmt_num(find(r, "sessions", "totalSessionCount")))
         for r in rage_rows]
    )

    # ── Low scroll depth (drop-off) ──
    scroll_key = "scrollDepth" if pages and "scrollDepth" in pages[0] else "avgScrollDepth"
    drop_rows  = sorted(pages, key=lambda r: float(r.get(scroll_key, 1)), reverse=False)[:5]
    drop_tbl   = table_html(
        ["Page", "Scroll Depth", "Sessions"],
        [(dim_label(r),
          f'<span style="color:#f4a261;font-weight:bold">{fmt_pct(find(r,scroll_key))}</span>',
          fmt_num(find(r, "sessions", "totalSessionCount")))
         for r in drop_rows]
    )

    # ── Devices ──
    dev_tbl = table_html(
        ["Device", "Sessions", "Bounce Rate", "Scroll Depth"],
        [(dim_label(r),
          fmt_num(find(r, "sessions", "totalSessionCount")),
          fmt_pct(find(r, "bounceRate")),
          fmt_pct(find(r, "scrollDepth")))
         for r in top_rows(devices, "sessions" if devices and "sessions" in devices[0] else "totalSessionCount", 5)]
    ) if devices else "<p>No device data.</p>"

    # ── Countries ──
    cty_tbl = table_html(
        ["Country", "Sessions", "Bounce Rate"],
        [(dim_label(r),
          fmt_num(find(r, "sessions", "totalSessionCount")),
          fmt_pct(find(r, "bounceRate")))
         for r in top_rows(countries, "sessions" if countries and "sessions" in countries[0] else "totalSessionCount", 5)]
    ) if countries else "<p>No country data.</p>"

    return f"""
<!DOCTYPE html><html><head><meta charset="utf-8">
<style>body{{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#222;max-width:700px;margin:0 auto;padding:24px}}</style>
</head><body>
<div style="background:linear-gradient(135deg,#4361ee,#7209b7);border-radius:12px;padding:24px;color:#fff;margin-bottom:24px">
  <h1 style="margin:0;font-size:22px">🛍️ Dreamit Store — Clarity Daily Report</h1>
  <p style="margin:6px 0 0;opacity:.85">{date_range}</p>
</div>

{section("📊 Overview", "#4361ee", summary)}
{section("🔥 Top Pages by Traffic", "#4361ee", pages_tbl)}
{section("😤 Rage Click Hotspots", "#e63946",
  "<p style='color:#555;font-size:13px'>Users clicking repeatedly in frustration — likely broken elements or confusing UX.</p>" + rage_tbl)}
{section("📉 Pages Users Abandon (Low Scroll)", "#f4a261",
  "<p style='color:#555;font-size:13px'>Pages where users don't scroll — content may not be engaging or loading correctly.</p>" + drop_tbl)}
{section("📱 Traffic by Device", "#7209b7", dev_tbl)}
{section("🌍 Traffic by Country", "#457b9d", cty_tbl)}

<div style="margin-top:32px;padding:16px;background:#f8f9fa;border-radius:8px;font-size:12px;color:#888;text-align:center">
  Auto-generated by Clarity Daily Report · Project {PROJECT_ID}<br>
  <a href="https://clarity.microsoft.com/projects/view/{PROJECT_ID}/dashboard" style="color:#4361ee">Open Clarity Dashboard →</a>
</div>
</body></html>"""


# ── Send email ─────────────────────────────────────────────────────────────────

def send_email(html: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"Clarity Store Report — {datetime.utcnow().strftime('%b %d, %Y')}"
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
    pages     = fetch("page")
    devices   = fetch("device")
    countries = fetch("country")

    if not pages:
        print("No page data returned — check logs above for API response details.")
        print(f"PROJECT_ID={PROJECT_ID!r}  TOKEN_PREFIX={CLARITY_TOKEN[:30]}...")
        sys.exit(1)

    print(f"Got {len(pages)} page records, {len(devices)} device records, {len(countries)} country records.")

    html = build_html(pages, devices, countries)

    # Save a copy locally / as artifact
    Path("clarity_report.html").write_text(html)
    print("Report saved to clarity_report.html")

    send_email(html)


if __name__ == "__main__":
    main()
