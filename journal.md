# Paper Trading Journal

Log of every paper trade and every skipped setup that reached step 3 of the pre-trade checklist (`trading_bot_rules.md` §8), per §9. Reviews that failed earlier (no valid catalyst, market closed, etc.) are not required to be logged, but session notes are kept below for continuity.

## Session notes

### 2026-09-18, ~02:40 ET (pre-market)
Reviewed the tradable universe via live scanner (stocks, $5-$500, market cap > $500M, % change > 3%): 29 names matched. Checked news on the largest movers (BABA, WLYB, SECZ, CLYM, MTSI, HTHT). None had a catalyst meeting §3 (fresh, primary-source earnings/FDA/M&A/contract/analyst-action/8-K) — driving news was stale roundup/options-flow content. No setup reached checklist item 3 (technical trigger); nothing to journal under §9. Regular session has not opened, so no entries are possible regardless (§5 also blocks 9:30-9:45 ET).

**Next check:** after market open, once opening range establishes, re-screen for a fresh catalyst + technical trigger.

### 2026-09-18, ~10:00-10:03 ET (regular session, post no-entry window)
**Catalyst (valid, §3):** SEC "Innovation Exemption" (five-year exemption for tokenized-stock trading venues) plus a related CFTC no-action position, both announced/reported today (Benzinga, ~02:59-07:38 ET) — primary-source regulatory action, <24h old, with clear direct sector-wide impact on crypto-linked equities (confirmed via wire coverage explicitly naming the sentiment lift).

**Checklist item 5 failure (HOOD, COIN):** Both are direct, named beneficiaries (HOOD's CEO quoted reacting to the news; COIN named as preparing for tokenized trading) and HOOD showed a genuine opening-range breakout + VWAP hold. But HOOD ($115.40) and COIN ($185+) both fail position sizing: even 1 whole share exceeds the $100 max position (§2), and §6 rules out shrinking into a fractional share since a reliable stop can't be placed on one. Skipped — reached checklist item 3, failed item 5.

**Setup invalidated before entry (MARA):** Moved to sector-wide crypto miners riding the same catalyst that fit the $100 cap (MARA, RIOT, CLSK, IREN). MARA ($12.5x, mkt cap $4.9B, 2wk avg vol 50.1M, spread 0.08%) had the cleanest trigger: broke the opening-range high ($12.34) on rising 5-min volume, ran to $12.72, still under the 10% overextension cap (+8.16% vs prior close $11.64). Planned 7 whole shares (~$88), entry $12.60, stop $12.50 (below the post-breakout pullback low), target $12.80+ (2R+); ran `review_equity_order` (simulation only, no order placed) to sanity-check feasibility — no broker alerts. Between planning and simulated execution (~90 seconds), price faded from $12.59 back to $12.50-12.52 — directly into the planned stop. Breakout momentum stalled before entry, so entering would mean entering at the stop with no edge. Skipped — reached checklist item 3, setup invalidated by live price action before any fill. No trade taken; no real order was ever placed (review-only simulation).

RIOT and CLSK were also checked and showed only choppy, range-bound action (no clean opening-range breakout) — didn't reach item 3.

**Next check:** watch MARA/RIOT/CLSK/IREN for a fresh reclaim of today's highs on volume, or another catalyst-tied name that fits the $100 cap.

### 2026-09-18, ~10:38 ET (regular session, +35 min)
Re-screened. **MARA:** unchanged — still rangebound $12.42-12.72, hasn't reclaimed its earlier high; no fresh trigger. **SECZ (Securitize Corp)** stood out: a much more directly-tied catalyst surfaced — a fresh StoneX analyst note today (Buy maintained, PT raised $10→$12, a valid §3 catalyst on its own) plus Securitize's core business (tokenized real-world-asset infrastructure) is named directly in wire coverage of the SEC tokenization exemption. Relative volume was strong (~7.6x pace). But live order book showed bid $9.88 / ask $9.92 — a 0.40% spread, double the §4 cap of 0.2% — so it fails checklist item 2 before reaching a trigger. Skipped, not logged as a step-3 setup (never got past universe filters). **CRCL:** did have a genuine second-leg breakout (opening-range high $90.16 → thrust to $92.55 on above-average volume) and has since pulled back to ~$91.4-91.5. But that pullback sits well above VWAP ($90.42, +1.1%) rather than at it, and the only nearby support is the last 5-min bar's low — not a clean match for either of §5's listed triggers (opening-range breakout hold vs. VWAP reclaim). Passed on it rather than manufacture a trigger. No trade this round.

**Next check:** ~35 min. Watch for CRCL to either pull back to VWAP and hold, or SECZ's spread to tighten under 0.2%, or a fresh breakout elsewhere.

### 2026-09-18, ~11:16 ET (regular session, +37 min)
**MARA** has been grinding higher in a tightening range for the last 45 min ($12.42-12.68), testing but not yet confirming a break of the day's high ($12.719-12.72) — currently $12.675/12.68. Given the last session's lesson (chased a breakout that faded before entry), waiting for a confirmed close/trade above $12.72 on volume rather than entering into resistance. **SECZ** spread widened further (0.50%) — still disqualified. **CRCL** spread also widened (0.33%) — still fails §4. No trade this round; nothing new reached checklist item 3 that wasn't already logged.

**Next check:** watch for MARA to confirm above $12.72 with volume, or spreads on SECZ/CRCL to tighten.

### 2026-09-18, ~11:52 ET (regular session, +36 min)
**MARA confirmed the breakout** at 11:20-11:25 ET: traded through $12.72 to a high of $12.75 on the day's strongest 5-min volume (672K then 858K shares) — a clean, valid trigger (reached checklist item 3). But by the time this check ran, price had spent ~30 min consolidating $12.61-12.75 rather than continuing, and now sits at $12.71-12.72 — **+9.2-9.3% from yesterday's close ($11.64)**, right at the edge of the §5 "skip if already run >10%" guardrail. Entering here would mean chasing a move that's already 30 minutes stale with very little room left before hitting that extension ceiling, so reward:risk no longer clears the 2:1 bar cleanly. Skipped — reached item 3, but too extended/late for a fresh entry by the time it was confirmed. **SECZ** spread still wide (0.50%). **CRCL** spread improved slightly but still borderline-over (0.23%). No trade.

MARA is now close to being fully disqualified for the rest of the day once it crosses +10% ($12.80); watching for a pullback/reset instead, or a fresh name.

**Next check:** ~35 min.

## Trade log

_(No trades yet.)_

| # | Date | Ticker | Catalyst (source) | Entry | Stop | Target | Exit | P&L ($) | P&L (R) | Shares (whole/fractional) | Notes |
|---|------|--------|--------------------|-------|------|--------|------|---------|---------|---------------------------|-------|
