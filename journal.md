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

## Trade log

_(No trades yet.)_

| # | Date | Ticker | Catalyst (source) | Entry | Stop | Target | Exit | P&L ($) | P&L (R) | Shares (whole/fractional) | Notes |
|---|------|--------|--------------------|-------|------|--------|------|---------|---------|---------------------------|-------|
