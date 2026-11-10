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

print("\n# The tests. CI is a 95% confidence interval; p is the chance of a gap this big if nothing had changed")
# Bootstrap: redraw the data with replacement many times and see how far the
# answer moves; the middle 95% of the redraws is the CI. Whole days or whole
# cards are redrawn together, because reviews on one day or of one card are
# not independent. Permutation test: shuffle which days count as "after" and
# count how often the shuffled gap is as big as the real one.
N = 10000


def ci(draws):
    draws = sorted(draws)
    return draws[int(0.025 * len(draws))], draws[int(0.975 * len(draws)) - 1]


def mean_gap(blocks):
    return 100 * sum(s for s, n in blocks) / sum(n for s, n in blocks)


def blocks(rs, key):
    """[sum of (wrong - expected), count] for each day or card."""
    out = collections.defaultdict(lambda: [0.0, 0])
    for r in rs:
        k = out[key(r)]
        k[0] += (r[EASE] == 1) - expected[(r[CARD], r[TS])]
        k[1] += 1
    return list(out.values())


def by_date(r):
    return day(r[TS])


def by_cardid(r):
    return r[CARD]


print("T1 minutes a day, 35 days before vs 35 after (each day one number)")
spent = collections.defaultdict(float)
for r in rows:
    spent[day(r[TS])] += r[TIME] / 60000
mb = [spent[B0 + dt.timedelta(days=i)] for i in range(W)]
ma = [spent[A0 + dt.timedelta(days=i)] for i in range(W)]
saving = sum(mb) / W - sum(ma) / W
lo_t, hi_t = ci([sum(random.choices(mb, k=W)) / W - sum(random.choices(ma, k=W)) / W for _ in range(N)])
both = mb + ma
hits = 0
for _ in range(N):
    random.shuffle(both)
    hits += abs(sum(both[:W]) - sum(both[W:])) / W >= saving
print(f"  saving {saving:.1f} min a day (95% CI {lo_t:.1f} to {hi_t:.1f}), p < {max(hits, 1) / N:.4f} (permutation test); "
      f"median day {sorted(mb)[W // 2]:.1f} -> {sorted(ma)[W // 2]:.1f} min")
listening = sum(r[TIME] for r in rows if r[ORD] == 1 and between(r, B0, B1)) / 60000 / W
lis_days = [sum(r[TIME] for r in rows if r[ORD] == 1 and day(r[TS]) == B0 + dt.timedelta(days=i)) / 60000 for i in range(W)]
lis_lo, lis_hi = ci([sum(random.choices(lis_days, k=W)) / W for _ in range(N)])
print(f"  Listening alone: {listening:.1f} min a day (95% CI {lis_lo:.1f} to {lis_hi:.1f})")

print("T2 reading against Anki's forecast, baseline vs the five weeks since")
bb, ab = blocks(base, by_date), blocks(after, by_date)
diff = mean_gap(ab) - mean_gap(bb)
pool = bb + ab
hits = 0
for _ in range(N):
    random.shuffle(pool)
    hits += abs(mean_gap(pool[len(bb):]) - mean_gap(pool[:len(bb)])) >= diff
print(f"  {diff:.1f} points worse (95% CI {lo:.1f} to {hi:.1f}), p < {max(hits, 1) / N:.4f} (permutation test over {len(pool)} days)")
real = versus(after)[2] - versus([r for r in scored if between(r, B0, B1)])[2]
print(f"  35 v 35 at the real date {real:+.1f} points, bigger than at all {len(swings)} earlier dates (largest {max(swings):+.1f}): p = {1 / (len(swings) + 1):.3f}")

print("T2b the same two periods by button: Again is forgot, Hard is got it but struggled")
for label, rs in (("with Listening", base), ("without", after)):
    share = [100 * sum(r[EASE] == e for r in rs) / len(rs) for e in (1, 2, 3, 4)]
    print(f"  {label}: Again {share[0]:.1f}%, Hard {share[1]:.1f}%, Good {share[2]:.1f}%, Easy {share[3]:.1f}%; "
          f"Again or Hard {share[0] + share[1]:.1f}%, Good or Easy {share[2] + share[3]:.1f}%")


def struggled(rs):
    out = collections.defaultdict(lambda: [0, 0])
    for r in rs:
        out[day(r[TS])][0] += r[EASE] <= 2
        out[day(r[TS])][1] += 1
    return list(out.values())


hb_, ha_ = struggled(base), struggled(after)
for label, blk in (("with Listening", hb_), ("without", ha_)):
    l_lo, l_hi = ci([mean_gap(random.choices(blk, k=len(blk))) for _ in range(N)])
    print(f"  Again or Hard {label}: {mean_gap(blk):.1f}% (95% CI {l_lo:.1f} to {l_hi:.1f}, redrawing days)")
ah = mean_gap(ha_) - mean_gap(hb_)
ah_lo, ah_hi = ci([mean_gap(random.choices(ha_, k=len(ha_))) - mean_gap(random.choices(hb_, k=len(hb_))) for _ in range(N)])
print(f"  Again or Hard: {ah:.1f} points more (95% CI {ah_lo:.1f} to {ah_hi:.1f}, redrawing days)")
print("T3 from 15 Oct: characters whose Listening review was skipped vs not due yet")
part = [r for r in late if day(r[TS]) >= dt.date(2026, 10, 15)]
skip = [r for r in part if day(r[TS]) >= due[r[NOTE]]]
notdue = [r for r in part if day(r[TS]) < due[r[NOTE]]]
ks, kn = sum(r[EASE] == 1 for r in skip), sum(r[EASE] == 1 for r in notdue)


def fisher(a, b, c, d):
    """Two-sided Fisher exact test on the table [[a, b], [c, d]]."""
    def prob(x):
        return math.comb(a + b, x) * math.comb(c + d, a + c - x) / math.comb(a + b + c + d, a + c)
    p0 = prob(a)
    return sum(prob(x) for x in range(max(0, a + c - (c + d)), min(a + b, a + c) + 1) if prob(x) <= p0 * (1 + 1e-9))


def card_rate(rs):
    out = collections.defaultdict(lambda: [0, 0])
    for r in rs:
        out[r[CARD]][0] += r[EASE] == 1
        out[r[CARD]][1] += 1
    return list(out.values())


def redraw_rate(cards):
    pick = random.choices(cards, k=len(cards))
    return 100 * sum(k for k, n in pick) / sum(n for k, n in pick)


cs, cn = card_rate(skip), card_rate(notdue)
d_lo, d_hi = ci([redraw_rate(cs) - redraw_rate(cn) for _ in range(N)])
print(f"  wrong on {ks} of {len(skip)} ({100 * ks / len(skip):.1f}%) vs {kn} of {len(notdue)} ({100 * kn / len(notdue):.1f}%): "
      f"{100 * ks / len(skip) - 100 * kn / len(notdue):.1f} points (95% CI {d_lo:.1f} to {d_hi:.1f}, redrawing cards), "
      f"p = {fisher(ks, len(skip) - ks, kn, len(notdue) - kn):.1e} (Fisher's exact test)")
print(f"  Anki expected {versus(skip)[1]:.1f}% and {versus(notdue)[1]:.1f}%")
# The size once every Listening review is skipped: these reviews against the
# with-Listening baseline, both measured from Anki's forecast.
sb = blocks(skip, by_cardid)
steady = []
for _ in range(N):
    steady.append(mean_gap(random.choices(sb, k=len(sb))) - mean_gap(random.choices(bb, k=len(bb))))
st_lo, st_hi = ci(steady)
print(f"  skipped reviews vs the baseline with Listening: {g_skip - g_base:.1f} points worse (95% CI {st_lo:.1f} to {st_hi:.1f})")
hard = lambda rs: 100 * sum(r[EASE] == 2 for r in rs) / len(rs)
print(f"  Hard answers in the same weeks: skipped {hard(skip):.1f}%, not due {hard(notdue):.1f}%")

print("T4 the longer a Listening review has been skipped, the worse? (whole after window)")
steps = (("not due", -9999, 0), ("0 to 7 days", 0, 8), ("8 to 21 days", 8, 22), ("22 days or more", 22, 9999))
ns, ks_ = [], []
for label, a_, b_ in steps:
    pick = [r for r in late if a_ <= (day(r[TS]) - due[r[NOTE]]).days < b_]
    ns.append(len(pick))
    ks_.append(sum(r[EASE] == 1 for r in pick))
    print(f"  {label}: wrong on {ks_[-1]} of {ns[-1]} ({100 * ks_[-1] / ns[-1]:.1f}%)")
p_all = sum(ks_) / sum(ns)
t = sum(i * (k - n * p_all) for i, (k, n) in enumerate(zip(ks_, ns)))
v = p_all * (1 - p_all) * (sum(n * i * i for i, n in enumerate(ns)) - sum(n * i for i, n in enumerate(ns)) ** 2 / sum(ns))
z = t / math.sqrt(v)
print(f"  trend z = {z:.1f}, p = {math.erfc(abs(z) / math.sqrt(2)):.1e} (Cochran-Armitage test)")
print(f"  8 to 21 days vs 22 or more: p = {fisher(ks_[2], ns[2] - ks_[2], ks_[3], ns[3] - ks_[3]):.2f} (Fisher), so no sign it keeps getting worse per review")
share = collections.defaultdict(lambda: [0, 0])
for r in late:
    d = day(r[TS])
    k = share[d - dt.timedelta(days=d.weekday())]
    k[0] += (d - due[r[NOTE]]).days >= 8
    k[1] += 1
print("  share of reading reviews with Listening skipped 8+ days ago, by week:",
      ", ".join(f"{100 * a_ / b_:.0f}%" for w_, (a_, b_) in sorted(share.items()) if w_ + dt.timedelta(days=6) <= A1))

print("T5 what one wrong reading answer costs")
# Extra seconds on the card over the next 90 days vs a right answer at the
# same interval band, the review itself included; cards redrawn for the CI.
per_card = collections.defaultdict(lambda: collections.defaultdict(lambda: [0.0, 0, 0.0, 0]))
for rs in by_card.values():
    for i, r in enumerate(rs):
        if r[ORD] != 0 or r[TYPE] != 1 or r[TS] + H > END:
            continue
        secs = sum(x[TIME] for x in rs[i:] if x[TS] <= r[TS] + H) / 1000
        k = per_card[r[CARD]][bucket(r[LASTIVL])]
        k[0 if r[EASE] == 1 else 2] += secs
        k[1 if r[EASE] == 1 else 3] += 1


def wrong_cost(cards):
    tot = collections.defaultdict(lambda: [0.0, 0, 0.0, 0])
    for c in cards:
        for b_, k in c.items():
            for i in range(4):
                tot[b_][i] += k[i]
    extra = n = 0
    for sw, nw, so, no in tot.values():
        if nw and no:
            extra += (sw / nw - so / no) * nw
            n += nw
    return extra / n


cards = list(per_card.values())
cost = wrong_cost(cards)
c_lo, c_hi = ci([wrong_cost(random.choices(cards, k=len(cards))) for _ in range(1000)])
print(f"  {cost:.0f} seconds (95% CI {c_lo:.0f} to {c_hi:.0f})")

print("\n# Figure 4: what Listening's minutes bought, in minutes of reading review a day")
per_day = len(aft) / W
print(f"{per_day:.1f} Recognition review answers a day; a wrong answer costs {cost / 60:.2f} min")
for name, pts, p_lo, p_hi in (("so far", g_after - g_base, lo, hi), ("once every Listening review is skipped", g_skip - g_base, st_lo, st_hi)):
    f = per_day / 100
    print(f"{name}: {pts:.1f} points = {pts * f:.1f} wrong answers a day (95% CI {p_lo * f:.1f} to {p_hi * f:.1f}) "
          f"= {pts * f * cost / 60:.1f} min a day saved ({p_lo * f * cost / 60:.1f} to {p_hi * f * cost / 60:.1f}); "
          f"Listening paid {listening / (pts * f):.1f} min per wrong answer")
print(f"Listening would have paid for itself only if a wrong answer cost {listening / ((g_skip - g_base) * per_day / 100):.1f} min, or {listening / (st_hi * per_day / 100):.1f} at the top of the range")
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
