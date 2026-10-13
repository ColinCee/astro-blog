"""Tally daily Claude Code token use from local logs into src/data/token-usage.json.

Runs on Colin's PC (the logs live in ~/.claude/projects). Only daily totals leave
the machine: no prompts, file names or project names. With --push it commits the
file and pushes to main, which redeploys the site.
"""

import argparse
import json
import subprocess
import sys
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

DAYS = 14
TZ = ZoneInfo("Europe/London")
REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "src" / "data" / "token-usage.json"


def tally(logs: Path) -> dict[date, dict[str, int]]:
    """Sum usage per local day, counting each API message once."""
    seen: set[tuple[str, str]] = set()
    days: dict[date, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    for path in logs.rglob("*.jsonl"):
        with path.open(encoding="utf-8", errors="replace") as f:
            for line in f:
                try:
                    row = json.loads(line)
                except json.JSONDecodeError:
                    continue
                msg = row.get("message")
                if not isinstance(msg, dict) or not isinstance(msg.get("usage"), dict):
                    continue
                if not str(msg.get("model", "")).startswith("claude-"):
                    continue  # skip local models and synthetic rows
                key = (str(msg.get("id")), str(row.get("requestId")))
                if key in seen:
                    continue
                seen.add(key)
                ts = row.get("timestamp")
                if not ts:
                    continue
                day = datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(TZ).date()
                u = msg["usage"]
                d = days[day]
                d["input"] += u.get("input_tokens") or 0
                d["cacheWrite"] += u.get("cache_creation_input_tokens") or 0
                d["cacheRead"] += u.get("cache_read_input_tokens") or 0
                d["output"] += u.get("output_tokens") or 0
    return days


def build(logs: Path) -> dict:
    days = tally(logs)
    today = datetime.now(TZ).date()
    out = []
    for i in range(DAYS - 1, -1, -1):
        day = today - timedelta(days=i)
        d = days.get(day, {})
        out.append({"date": day.isoformat(), "total": sum(d.values()), "output": d.get("output", 0)})
    return {"updated": datetime.now(TZ).isoformat(timespec="minutes"), "days": out}


def git(*args: str) -> None:
    subprocess.run(["git", "-C", str(REPO), *args], check=True)


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--logs", type=Path, default=Path.home() / ".claude" / "projects")
    p.add_argument("--push", action="store_true", help="commit and push to main")
    args = p.parse_args()

    if args.push:
        git("checkout", "main")
        git("pull", "--ff-only")
    data = build(args.logs)
    OUT.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
    print(f"wrote {OUT} ({data['days'][-1]['date']}: {data['days'][-1]['total']:,} tokens)")
    if args.push:
        if not subprocess.run(["git", "-C", str(REPO), "diff", "--quiet", "--", str(OUT)]).returncode:
            print("no change")
            return 0
        git("add", str(OUT))
        git("commit", "-m", "Update token usage", "--", str(OUT))
        git("push", "origin", "main")
    return 0


if __name__ == "__main__":
    sys.exit(main())
