"""Every number in the post, from my Anki review log.

Input: a JSON list of review rows exported from Anki's revlog table:
[card_id, ord, review_ms, ease, type, new_interval_days, last_interval_days, time_ms]
ord 0 is the Recognition card, 1 the Listening card. ease 1 is Again, 2 Hard,
3 Good, 4 Easy. type 0 is learning, 1 review, 2 relearning. Anki caps time_ms
at 60 s. Plain Python, no packages.

    python measure.py revs.json
"""
import collections
import datetime as dt
import json
import math
import sys

CARD, ORD, TS, EASE, TYPE, NEWIVL, LASTIVL, TIME = range(8)
NAME = {0: "Recognition", 1: "Listening"}
rows = json.load(open(sys.argv[1], encoding="utf-8"))
rows.sort(key=lambda r: r[TS])


def day(ms):
    return dt.datetime.fromtimestamp(ms / 1000).date()


def bucket(days):
    if days < 7:
        return "1-6 d"
    if days < 30:
        return "7-29 d"
    if days < 90:
        return "30-89 d"
    return "90+ d"


def ztest(k1, n1, k2, n2):
    """Two-proportion z-test; returns the two-sided p-value."""
    p = (k1 + k2) / (n1 + n2)
    se = math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2))
    return math.erfc(abs(k1 / n1 - k2 / n2) / se / math.sqrt(2))


# The last Listening review was on 4 Oct 2026. Two equal 35-day windows
# either side of it: 31 Aug to 4 Oct, and 5 Oct to 8 Nov.
SUSP = max(day(r[TS]) for r in rows if r[ORD] == 1)
W = 35
B0, B1 = SUSP - dt.timedelta(days=W - 1), SUSP
A0, A1 = SUSP + dt.timedelta(days=1), SUSP + dt.timedelta(days=W)
print(f"last Listening review {SUSP}; before {B0}..{B1}, after {A0}..{A1}")


def between(r, lo, hi):
    return lo <= day(r[TS]) <= hi


print("\n# Figure 1: minutes a day, 5 weeks before vs after")
for label, lo, hi in (("before", B0, B1), ("after", A0, A1)):
    mins = {o: sum(r[TIME] for r in rows if r[ORD] == o and between(r, lo, hi)) / 60000 / W for o in (0, 1)}
    print(f"{label}: Recognition {mins[0]:.1f} min/day, Listening {mins[1]:.1f} min/day, total {mins[0] + mins[1]:.1f}")

print("\n# Deck and log size")
print("reviews", len(rows), "cards", {NAME[o]: len({r[CARD] for r in rows if r[ORD] == o}) for o in (0, 1)})
print("first review", day(rows[0][TS]), "last", day(rows[-1][TS]))
hours = {o: sum(r[TIME] for r in rows if r[ORD] == o) / 3600000 for o in (0, 1)}
print(f"hours: Recognition {hours[0]:.1f}, Listening {hours[1]:.1f}, total {hours[0] + hours[1]:.1f}")
print("reviews that hit the 60 s cap:", {NAME[o]: sum(1 for r in rows if r[ORD] == o and r[TIME] >= 60000) for o in (0, 1)})

print("\n# Listening's share of the month's time")
month = collections.defaultdict(float)
for r in rows:
    month[(day(r[TS]).strftime("%Y-%m"), r[ORD])] += r[TIME]
for m in sorted({k[0] for k in month}):
    a, b = month[(m, 0)], month[(m, 1)]
    print(m, f"{100 * b / (a + b):.0f}%")

print("\n# What a review cost")
for o in (0, 1):
    rs = [r for r in rows if r[ORD] == o]
    rev = [r for r in rs if r[TYPE] == 1]
    print(f"{NAME[o]}: {sum(r[TIME] for r in rs) / len(rs) / 1000:.1f} s a review, "
          f"wrong on {100 * sum(r[EASE] == 1 for r in rev) / len(rev):.1f}% of {len(rev)} reviews")

print("\n# Time on the card over the next 90 days after a right vs a wrong answer, by interval")
# Review-type answers with 90 days of log after them, grouped by the interval
# the card was on, so a wrong answer is compared with a right one at the same
# stage. Hard answers are left out of both groups.
by_card = collections.defaultdict(list)
for r in rows:
    by_card[r[CARD]].append(r)
END = rows[-1][TS]
H = 90 * 86400 * 1000
future = collections.defaultdict(list)
for rs in by_card.values():
    for i, r in enumerate(rs):
        if r[TYPE] != 1 or r[EASE] == 2 or r[TS] + H > END:
            continue
        secs = sum(x[TIME] for x in rs[i + 1:] if x[TS] <= r[TS] + H) / 1000
        future[(r[ORD], bucket(r[LASTIVL]), r[EASE] == 1)].append(secs)
for o in (0, 1):
    for b in ("1-6 d", "7-29 d", "30-89 d"):
        wrong, right = future[(o, b, True)], future[(o, b, False)]
        mw, mr = sum(wrong) / len(wrong), sum(right) / len(right)
        print(f"{NAME[o]} due in {b}: right {mr:.0f} s (n={len(right)}), wrong {mw:.0f} s (n={len(wrong)}), extra {mw - mr:.0f} s")

print("\n# Footnote: wrong answers per 100 Recognition reviews, same cards, before vs after")
# Only cards first seen before the before-window, so new cards added after the
# suspension (which have no Listening card at all) don't drag the after side down.
first_seen = {}
for r in rows:
    first_seen.setdefault(r[CARD], day(r[TS]))
mature = {c for c, d in first_seen.items() if d < B0}
rec = [r for r in rows if r[ORD] == 0 and r[TYPE] == 1 and r[CARD] in mature]
print("Recognition cards first seen before the before-window:", len({r[CARD] for r in rec}))
for b in ("7-29 d", "30-89 d", "all"):
    pick = [r for r in rec if b == "all" or bucket(r[LASTIVL]) == b]
    bef = [r for r in pick if between(r, B0, B1)]
    aft = [r for r in pick if between(r, A0, A1)]
    kb, ka = sum(r[EASE] == 1 for r in bef), sum(r[EASE] == 1 for r in aft)
    hb, ha = sum(r[EASE] == 2 for r in bef), sum(r[EASE] == 2 for r in aft)
    print(f"due in {b}: wrong {100 * kb / len(bef):.1f}% of {len(bef)} -> {100 * ka / len(aft):.1f}% of {len(aft)}, "
          f"p={ztest(kb, len(bef), ka, len(aft)):.4f}; Hard {100 * hb / len(bef):.1f}% -> {100 * ha / len(aft):.1f}%")
    if b == "all":
        print(f"  extra wrong answers in the after window vs the before rate: {ka - len(aft) * kb / len(bef):.0f}")
        print(f"  seconds a review: {sum(r[TIME] for r in bef) / len(bef) / 1000:.1f} -> {sum(r[TIME] for r in aft) / len(aft) / 1000:.1f}")

print("\n# Was the before window just a good month? Wrong % by month, all Recognition review-type answers")
allrec = [r for r in rows if r[ORD] == 0 and r[TYPE] == 1]
for b in ("7-29 d", "30-89 d"):
    out = []
    for m in ("2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"):
        pick = [r for r in allrec if bucket(r[LASTIVL]) == b and day(r[TS]).strftime("%Y-%m") == m]
        out.append(f"{m[5:]}: {100 * sum(r[EASE] == 1 for r in pick) / len(pick):.0f}% ({len(pick)})")
    print(f"due in {b}:", ", ".join(out))

print("\n# Cards added after the suspension (no Listening card ever shown)")
new = {c for c in first_seen if first_seen[c] >= A0 and c % 2 == 1}
pick = [r for r in rows if r[ORD] == 0 and r[TYPE] == 1 and r[CARD] in new]
print(f"{len(new)} cards, wrong on {100 * sum(r[EASE] == 1 for r in pick) / len(pick):.1f}% of {len(pick)} reviews")


print("\n# Wrong answers, all Recognition review answers, equal windows (the 6.8 points)")
bef = [r for r in allrec if between(r, B0, B1)]
aft = [r for r in allrec if between(r, A0, A1)]
kb, ka = sum(r[EASE] == 1 for r in bef), sum(r[EASE] == 1 for r in aft)
pb, pa = kb / len(bef), ka / len(aft)
se = math.sqrt(pb * (1 - pb) / len(bef) + pa * (1 - pa) / len(aft))
print(f"wrong {100 * pb:.1f}% of {len(bef)} -> {100 * pa:.1f}% of {len(aft)}, "
      f"{100 * (pa - pb):.1f} points, 95% CI {100 * (pa - pb - 1.96 * se):.1f} to {100 * (pa - pb + 1.96 * se):.1f}, "
      f"p={ztest(kb, len(bef), ka, len(aft)):.1e}")

print("\n# Figure 3: minutes of Listening per wrong answer it prevented")
per_day = len(aft) / W
listening = sum(r[TIME] for r in rows if r[ORD] == 1 and between(r, B0, B1)) / 60000 / W
for name, d in (("low", pa - pb - 1.96 * se), ("mid", pa - pb), ("high", pa - pb + 1.96 * se)):
    print(f"{name}: {d * per_day:.2f} extra wrong a day ({per_day:.1f} reviews a day) -> {listening / (d * per_day):.1f} min each")
# Over every interval length, weighted by how many wrong answers fell in
# each, counting the review itself and any Hard answer as a pass.
for o in (0, 1):
    cost = collections.defaultdict(list)
    for rs in by_card.values():
        for i, r in enumerate(rs):
            if r[ORD] != o or r[TYPE] != 1 or r[TS] + H > END:
                continue
            secs = sum(x[TIME] for x in rs[i:] if x[TS] <= r[TS] + H) / 1000
            cost[(r[EASE] == 1, bucket(r[LASTIVL]))].append(secs)
    extra = n = 0
    for b in ("1-6 d", "7-29 d", "30-89 d", "90+ d"):
        w, ok = cost[(True, b)], cost[(False, b)]
        if w and ok:
            extra += (sum(w) / len(w) - sum(ok) / len(ok)) * len(w)
            n += len(w)
    print(f"extra {NAME[o]} seconds over 90 days per wrong answer: {extra / n:.0f} ({n} wrong answers)")

print("\n# Figure 2: share of Recognition review answers answered Again each week (weeks start Monday)")
# Week 0 starts 4 May, when the deck had been running three months. Week 21
# (28 Sep to 4 Oct) is the last with Listening, week 22 the first without.
weeks = collections.defaultdict(lambda: [0, 0])
for r in allrec:
    d = day(r[TS])
    w = d - dt.timedelta(days=d.weekday())
    weeks[w][0] += r[EASE] == 1
    weeks[w][1] += 1
W0 = dt.date(2026, 5, 4)
rates = {}
for w in sorted(weeks):
    n = (w - W0).days // 7
    rates[n] = 100 * weeks[w][0] / weeks[w][1]
    print(f"week {n:>3} from {w}: {weeks[w][1]} answers, {rates[n]:.1f}% wrong")
before = [rates[n] for n in range(0, 22)]
print(f"the 22 weeks with Listening ran {min(before):.1f}% to {max(before):.1f}% (the band on the chart); "
      f"weeks since above that band: {sum(1 for n in range(22, 27) if rates[n] > max(before))} of 5 whole weeks")
