"""Every number in the post, from my Anki review log.

Input: a JSON list of review rows from Anki's revlog table joined to cards:
[card_id, ord, review_ms, ease, type, new_interval_days, last_interval_days, time_ms, note_id]
ord 0 is the Recognition card, 1 the Listening card; the two cards of one
character share a note_id. ease 1 is Again, 2 Hard, 3 Good, 4 Easy. type 0 is
learning, 1 review, 2 relearning. Anki caps time_ms at 60 s. Days are Anki
days: they roll over at 4am, UK time. Plain Python, no packages.

    python measure.py revs.json
"""
import collections
import datetime as dt
import json
import math
import random
import sys
import zoneinfo

CARD, ORD, TS, EASE, TYPE, NEWIVL, LASTIVL, TIME, NOTE = range(9)
UK = zoneinfo.ZoneInfo("Europe/London")
NAME = {0: "Recognition", 1: "Listening"}
rows = json.load(open(sys.argv[1], encoding="utf-8"))
rows.sort(key=lambda r: r[TS])


def day(ms):
    return (dt.datetime.fromtimestamp(ms / 1000, UK) - dt.timedelta(hours=4)).date()


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
new = {r[CARD] for r in rows if r[ORD] == 0 and first_seen[r[CARD]] >= A0}
pick = [r for r in rows if r[ORD] == 0 and r[TYPE] == 1 and r[CARD] in new]
print(f"{len(new)} cards, wrong on {100 * sum(r[EASE] == 1 for r in pick) / len(pick):.1f}% of {len(pick)} reviews")


print("\n# Wrong answers, all Recognition review answers, equal windows")
bef = [r for r in allrec if between(r, B0, B1)]
aft = [r for r in allrec if between(r, A0, A1)]
kb, ka = sum(r[EASE] == 1 for r in bef), sum(r[EASE] == 1 for r in aft)
print(f"all cards: wrong {100 * kb / len(bef):.1f}% of {len(bef)} -> {100 * ka / len(aft):.1f}% of {len(aft)}")
had = {r[NOTE] for r in rows if r[ORD] == 1}  # characters whose Listening card I ever reviewed
hb = [r for r in bef if r[NOTE] in had]
ha = [r for r in aft if r[NOTE] in had]
na = [r for r in aft if r[NOTE] not in had]
print(f"characters that had a Listening card: {100 * sum(r[EASE] == 1 for r in hb) / len(hb):.1f}% of {len(hb)} -> "
      f"{100 * sum(r[EASE] == 1 for r in ha) / len(ha):.1f}% of {len(ha)}")
print(f"characters added since, never had one: {100 * sum(r[EASE] == 1 for r in na) / len(na):.1f}% of {len(na)} "
      f"({len({r[CARD] for r in na})} cards)")
print(f"Recognition review answers a day in the after window: {len(aft) / W:.1f}")

print("\n# What Anki expected: replaying its scheduler (FSRS-6) over the log")
# Anki's scheduler keeps a memory model of every card and, at each review,
# has a predicted chance that I still remember it. These are my deck's
# parameters (Deck options > FSRS), last fitted by Anki on 9 Sep 2026. The
# replay follows the published FSRS-6 formulas; on my collection it lands
# within 5% of the stability Anki itself stores for 96% of cards.
FSRS = [0.1083, 0.173, 0.1788, 21.8721, 6.3822, 0.484, 3.0203, 0.0642, 1.7515, 0.3576, 0.7261,
        1.6263, 0.0059, 0.5233, 1.7128, 0.1707, 2.6339, 0.7896, 0.0, 0.1306, 0.2306]
DECAY = FSRS[20]
FACTOR = 0.9 ** (-1 / DECAY) - 1


def recall(days, s):
    return (1 + FACTOR * days / s) ** -DECAY


def d0(g):
    return min(10, max(1, FSRS[4] - math.exp(FSRS[5] * (g - 1)) + 1))


def step(s, d, g, days):
    """The card's stability and difficulty after answer g, `days` after its last review."""
    w = FSRS
    if s is None:
        return w[g - 1], d0(g)
    if days < 1:
        s2 = s * math.exp(w[17] * (g - 3 + w[18])) * s ** -w[19]
        if g >= 3:
            s2 = max(s2, s)
    elif g == 1:
        s2 = min(w[11] * d ** -w[12] * ((s + 1) ** w[13] - 1) * math.exp(w[14] * (1 - recall(days, s))), s)
    else:
        s2 = s * (1 + math.exp(w[8]) * (11 - d) * s ** -w[9] * (math.exp(w[10] * (1 - recall(days, s))) - 1)
                  * (w[15] if g == 2 else 1) * (w[16] if g == 4 else 1))
    d2 = d - w[6] * (g - 3) * (10 - d) / 9
    return max(s2, 0.001), min(10, max(1, w[7] * d0(4) + (1 - w[7]) * d2))


expected = {}  # (card, review_ms) -> the chance Anki gave of a wrong answer
for rs in by_card.values():
    s = d = last = None
    for r in rs:
        days = 0 if last is None else (day(r[TS]) - last).days
        if s is not None and days >= 1:
            expected[(r[CARD], r[TS])] = 1 - recall(days, s)
        s, d = step(s, d, r[EASE], days)
        last = day(r[TS])
scored = [r for r in allrec if (r[CARD], r[TS]) in expected]


def versus(rs):
    """Wrong %, what Anki expected %, and the gap between them in points."""
    obs = 100 * sum(r[EASE] == 1 for r in rs) / len(rs)
    exp = 100 * sum(expected[(r[CARD], r[TS])] for r in rs) / len(rs)
    return obs, exp, obs - exp


def line(label, rs):
    o, e, g = versus(rs)
    print(f"{label}: wrong {o:.1f}%, Anki expected {e:.1f}%, gap {g:+.1f} ({len(rs)} answers)")
    return g


# I was in China from 11 to 30 Sep, reading Chinese all day, so the baseline
# with Listening stops the day before.
TRIP0, TRIP1 = dt.date(2026, 9, 11), dt.date(2026, 9, 30)
BASE0 = dt.date(2026, 5, 4)
base = [r for r in scored if BASE0 <= day(r[TS]) < TRIP0]
trip = [r for r in scored if TRIP0 <= day(r[TS]) <= TRIP1]
after = [r for r in scored if between(r, A0, A1)]
g_base = line(f"with Listening, {BASE0} to {TRIP0 - dt.timedelta(days=1)}", base)
line("in China, 11 to 30 Sep", trip)
g_after = line(f"without Listening, {A0} to {A1}", after)
print(f"so reading is {g_after - g_base:.1f} points worse against Anki's own expectation")
random.seed(1)


def by_day(rs):
    out = collections.defaultdict(list)
    for r in rs:
        out[day(r[TS])].append((r[EASE] == 1) - expected[(r[CARD], r[TS])])
    return list(out.values())


db, da = by_day(base), by_day(after)
draws = []
for _ in range(4000):
    b = [x for dd in random.choices(db, k=len(db)) for x in dd]
    a = [x for dd in random.choices(da, k=len(da)) for x in dd]
    draws.append(100 * (sum(a) / len(a) - sum(b) / len(b)))
draws.sort()
lo, hi = draws[100], draws[3899]
print(f"  95% interval, resampling whole days: {lo:.1f} to {hi:.1f}")
# The same sum at earlier dates when nothing changed: 35 days after a date
# against 35 before it, every Sunday from 5 Apr to 30 Aug.
swings = []
c = dt.date(2026, 4, 5)
while c <= dt.date(2026, 8, 30):
    b = [r for r in scored if c - dt.timedelta(days=W - 1) <= day(r[TS]) <= c]
    a = [r for r in scored if c < day(r[TS]) <= c + dt.timedelta(days=W)]
    swings.append(versus(a)[2] - versus(b)[2])
    c += dt.timedelta(days=7)
print(f"  the same 35 v 35 gap change at {len(swings)} earlier dates: {min(swings):+.1f} to {max(swings):+.1f}; "
      f"at the real date {versus(after)[2] - versus([r for r in scored if between(r, B0, B1)])[2]:+.1f}")

print("\n# The check inside the after window: was a Listening review actually skipped?")
# For each character, the day its Listening card would next have come up:
# its last Listening review plus the interval Anki gave it then. A reading
# review before that day lost nothing yet; one after it has missed a look.
due = {}
for r in rows:
    if r[ORD] == 1:
        due[r[NOTE]] = day(r[TS]) + dt.timedelta(days=max(r[NEWIVL], 0))
late = [r for r in after if r[NOTE] in due]
for label, lo_d, hi_d in (("5 to 14 Oct", A0, dt.date(2026, 10, 14)), ("15 Oct to 8 Nov", dt.date(2026, 10, 15), A1)):
    part = [r for r in late if lo_d <= day(r[TS]) <= hi_d]
    print(label)
    line("  Listening not due yet", [r for r in part if day(r[TS]) < due[r[NOTE]]])
    g_skip = line("  Listening skipped", [r for r in part if day(r[TS]) >= due[r[NOTE]]])
    for a, b in ((0, 7), (7, 21), (21, 99)):
        pick = [r for r in part if a <= (day(r[TS]) - due[r[NOTE]]).days < b]
        if len(pick) >= 50:
            line(f"    skipped {a} to {b} days ago", pick)
newc = [r for r in after if r[NOTE] not in due]
g_new = line("characters that never had a Listening card", newc)

print("\n# Figure 3: minutes of Listening per wrong answer it prevented")
per_day = len(aft) / W
listening = sum(r[TIME] for r in rows if r[ORD] == 1 and between(r, B0, B1)) / 60000 / W
print(f"Listening took {listening:.1f} min a day; {per_day:.1f} Recognition review answers a day")
for name, pts in (("so far, low", lo), ("so far", g_after - g_base), ("so far, high", hi),
                  ("once every Listening review is skipped", g_skip - g_base)):
    print(f"{name}: {pts:.1f} points = {pts / 100 * per_day:.1f} wrong answers a day -> {listening / (pts / 100 * per_day):.1f} min each")
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

print("\n# Figure 2: Recognition review answers each week, wrong % and what Anki expected (weeks start Monday)")
# Week 0 starts 4 May, when the deck was three months old and the baseline
# above begins. Week 21 (28 Sep to 4 Oct) is the last with Listening, week
# 22 the first without. Earlier weeks are printed with negative numbers.
weeks = collections.defaultdict(list)
for r in scored:
    d = day(r[TS])
    weeks[d - dt.timedelta(days=d.weekday())].append(r)
obs_s, exp_s = [], []
for w in sorted(weeks):
    n = (w - BASE0).days // 7
    if w + dt.timedelta(days=6) > A1:
        continue
    o, e, g = versus(weeks[w])
    if n >= 0:
        obs_s.append([n, round(o, 1)])
        exp_s.append([n, round(e, 1)])
    print(f"week {n:>3} from {w}: {len(weeks[w])} answers, wrong {o:.1f}%, expected {e:.1f}%, gap {g:+.1f}")
print("wrong:", json.dumps(obs_s))
print("expected:", json.dumps(exp_s))
for label, pick in (("with Listening", range(0, 22)), ("without", range(22, 27))):
    over = sum(obs_s[n][1] > exp_s[n][1] + 1 for n in pick)
    print(f"weeks {label} more than a point over what Anki expected: {over} of {len(pick)}")
