#!/usr/bin/env python3
"""
Microsoft Clarity Data Analysis Script
Fetches live insights from the Clarity Export API and generates a report.

Usage:
    python clarity_analysis.py --project-id YOUR_PROJECT_ID [options]

Options:
    --project-id    Clarity project ID (from clarity.ms/project/<id>/...)
    --days          Number of past days to analyze (default: 30)
    --granularity   daily | weekly | monthly (default: daily)
    --dimension     page | browser | device | country | os (default: page)
    --save          Save raw JSON response to file for offline reuse
    --load          Load from previously saved JSON file instead of API
"""

import os
import json
import argparse
import sys
from datetime import datetime, timedelta
from pathlib import Path

try:
    import requests
except ImportError:
    print("Missing dependency: pip install requests")
    sys.exit(1)

try:
    import pandas as pd
except ImportError:
    print("Missing dependency: pip install pandas")
    sys.exit(1)

CLARITY_TOKEN = os.getenv(
    "CLARITY_API_TOKEN",
    "eyJhbGciOiJSUzI1NiIsImtpZCI6IjQ4M0FCMDhFNUYwRDMxNjdEOTRFMTQ3M0FEQTk2RTcyRDkwRUYwRkYiLCJ0eXAiOiJKV1QifQ"
    ".eyJqdGkiOiI0MGY3OWU2ZC00MmUzLTRkNTctYTJmZC00YWFkY2RkM2FlY2QiLCJzdWIiOiIzMTM4MDk0NTQyNDgwMjUyIiwic2NvcGUiOiJEYXRhLkV4cG9ydCIsIm5iZiI6MTc4MTM4NTk0MywiZXhwIjo0OTM0OTg1OTQzLCJpYXQiOjE3ODEzODU5NDMsImlzcyI6ImNsYXJpdHkiLCJhdWQiOiJjbGFyaXR5LmRhdGEtZXhwb3J0ZXIifQ"
    ".ayShEds0qaNMKssyTIHNEFRb4fqcujCu5JTNWqwQCvYiCnerjyNlGPPfYT1I3lVfR_Ac_8bM3XoyvjVBIIPSNrgZA12JungCGRTXjpyrsi3q_1Zb-aYcvt209b8EYvf2Ai7HIgOSfJ3BrnucAq9yrOfhhlci1AxZQhC4S8ysKvWlSG2cJgj9SEKjdyYN2odKYduxDJYWFAC23bze2Ha5p1BWgTK_YkVQxEGEk-SFtQhz0aHun43heINt34Ft0SCKQwQehTd0JJ2FGDZe8pBEnFiOcQkjU5JZrxNhWMnFWX2BpviGhs-CKo2-NY6ytLctxj2bBKWSn58wcutr5ROYug"
)
API_BASE = "https://www.clarity.ms/export-data/api/v1"


# ── Fetch ──────────────────────────────────────────────────────────────────────

def fetch_insights(project_id: str, num_of_days: int = 30, granularity: str = "daily", dimension: str = "page") -> dict:
    url = f"{API_BASE}/project-live-insights"
    params = {
        "projectId": project_id,
        "numOfDays": num_of_days,
        "granularity": granularity,
        "dimension": dimension,
    }
    headers = {"Authorization": f"Bearer {CLARITY_TOKEN}"}

    print(f"Fetching Clarity data for project '{project_id}' ({num_of_days} days, {granularity}, by {dimension})...")
    resp = requests.get(url, params=params, headers=headers, timeout=30)

    if resp.status_code == 401:
        print("ERROR: Invalid or expired API token.")
        sys.exit(1)
    if resp.status_code == 403:
        print("ERROR: Access denied. Check your project ID and token permissions.")
        sys.exit(1)
    if resp.status_code == 429:
        print("ERROR: Rate limit hit (10 calls/day). Use --load with a saved file instead.")
        sys.exit(1)
    if not resp.ok:
        print(f"ERROR: API returned {resp.status_code}: {resp.text}")
        sys.exit(1)

    return resp.json()


# ── Analyze ────────────────────────────────────────────────────────────────────

def analyze(data: dict, dimension: str):
    if not data:
        print("No data returned from API.")
        return

    # Flatten the response into a DataFrame
    rows = []
    for item in data.get("insights", data if isinstance(data, list) else [data]):
        rows.append(item)

    if not rows:
        print("Response structure:", json.dumps(data, indent=2)[:500])
        print("\nCould not parse insights — raw data saved. Check the structure above.")
        return

    df = pd.DataFrame(rows)
    print_report(df, dimension)


def print_report(df: pd.DataFrame, dimension: str):
    divider = "─" * 65

    print(f"\n{'═' * 65}")
    print(f"  MICROSOFT CLARITY — SHOPIFY STORE ANALYSIS")
    print(f"  Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
    print(f"{'═' * 65}\n")

    # Numeric columns for summary
    numeric_cols = df.select_dtypes(include="number").columns.tolist()

    # ── Summary totals ──
    print("SUMMARY")
    print(divider)
    summary_metrics = {
        "sessions":           ("Total Sessions",        "{:,.0f}"),
        "totalSessionCount":  ("Total Sessions",        "{:,.0f}"),
        "pagesPerSession":    ("Avg Pages / Session",   "{:.2f}"),
        "engagementTime":     ("Avg Engagement (sec)",  "{:.1f}"),
        "bounceRate":         ("Bounce Rate",           "{:.1%}"),
        "scrollDepth":        ("Avg Scroll Depth",      "{:.1%}"),
        "rageClicks":         ("Rage Clicks",           "{:,.0f}"),
        "deadClicks":         ("Dead Clicks",           "{:,.0f}"),
        "excessiveScrolling": ("Excessive Scrolling",   "{:,.0f}"),
        "quickBackClicks":    ("Quick Back Clicks",     "{:,.0f}"),
    }

    found_any = False
    for col, (label, fmt) in summary_metrics.items():
        if col in df.columns:
            val = df[col].sum() if col in ("sessions", "totalSessionCount", "rageClicks", "deadClicks", "excessiveScrolling", "quickBackClicks") else df[col].mean()
            try:
                print(f"  {label:<35} {fmt.format(val)}")
                found_any = True
            except Exception:
                pass

    if not found_any:
        print("  Available columns:", list(df.columns))

    # ── Top pages / dimension ──
    dim_col = _find_col(df, [dimension, "url", "page", "pagePath", "path", "name", "key"])
    session_col = _find_col(df, ["sessions", "totalSessionCount", "sessionCount"])
    rage_col = _find_col(df, ["rageClicks", "rageClickCount"])
    dead_col = _find_col(df, ["deadClicks", "deadClickCount"])
    scroll_col = _find_col(df, ["scrollDepth", "avgScrollDepth"])
    bounce_col = _find_col(df, ["bounceRate"])

    if dim_col and session_col:
        print(f"\n\nTOP 10 by {dimension.upper()} (sorted by sessions)")
        print(divider)
        top = df.sort_values(session_col, ascending=False).head(10)
        display_cols = [c for c in [dim_col, session_col, scroll_col, bounce_col, rage_col, dead_col] if c]
        print(top[display_cols].to_string(index=False))

    # ── Rage / dead click hot spots ──
    if rage_col and dim_col:
        print(f"\n\nRAGE CLICK HOT SPOTS (top 5)")
        print(divider)
        rc = df.sort_values(rage_col, ascending=False).head(5)[[dim_col, rage_col]]
        if session_col:
            rc = df.sort_values(rage_col, ascending=False).head(5)[[dim_col, session_col, rage_col]]
        print(rc.to_string(index=False))

    if dead_col and dim_col:
        print(f"\n\nDEAD CLICK HOT SPOTS (top 5)")
        print(divider)
        dc = df.sort_values(dead_col, ascending=False).head(5)[[dim_col, dead_col]]
        print(dc.to_string(index=False))

    # ── Scroll depth analysis ──
    if scroll_col and dim_col:
        print(f"\n\nLOWEST SCROLL DEPTH (possible drop-off pages)")
        print(divider)
        sd = df.sort_values(scroll_col, ascending=True).head(5)[[dim_col, scroll_col]]
        if session_col:
            sd = df.sort_values(scroll_col, ascending=True).head(5)[[dim_col, session_col, scroll_col]]
        print(sd.to_string(index=False))

    # ── Bounce rate ──
    if bounce_col and dim_col and session_col:
        high_traffic = df[df[session_col] >= df[session_col].quantile(0.5)]
        if not high_traffic.empty:
            print(f"\n\nHIGH BOUNCE RATE (high-traffic pages only)")
            print(divider)
            br = high_traffic.sort_values(bounce_col, ascending=False).head(5)[[dim_col, session_col, bounce_col]]
            print(br.to_string(index=False))

    print(f"\n{'═' * 65}\n")
    print("TIP: Re-run with --dimension country/device/browser for more breakdowns.")
    print("     Raw data saved to clarity_data.json — reuse with --load to save API quota.\n")


def _find_col(df: pd.DataFrame, candidates: list) -> str | None:
    for c in candidates:
        if c in df.columns:
            return c
    return None


# ── CLI ────────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Analyze Microsoft Clarity data for your Shopify store.")
    parser.add_argument("--project-id", required=False, help="Clarity project ID")
    parser.add_argument("--days", type=int, default=30, help="Number of past days (default: 30)")
    parser.add_argument("--granularity", choices=["daily", "weekly", "monthly"], default="daily")
    parser.add_argument("--dimension", choices=["page", "browser", "device", "country", "os"], default="page")
    parser.add_argument("--save", metavar="FILE", default="clarity_data.json", help="Save raw JSON to file")
    parser.add_argument("--load", metavar="FILE", help="Load JSON from file instead of calling API")
    args = parser.parse_args()

    if args.load:
        path = Path(args.load)
        if not path.exists():
            print(f"File not found: {args.load}")
            sys.exit(1)
        print(f"Loading data from {args.load}...")
        data = json.loads(path.read_text())
    else:
        if not args.project_id:
            print("ERROR: --project-id is required when fetching from API.")
            print("       Find it in your Clarity URL: clarity.ms/project/<project-id>/...")
            sys.exit(1)
        data = fetch_insights(args.project_id, args.days, args.granularity, args.dimension)
        save_path = Path(args.save)
        save_path.write_text(json.dumps(data, indent=2))
        print(f"Raw data saved to {save_path}")

    analyze(data, args.dimension)


if __name__ == "__main__":
    main()
