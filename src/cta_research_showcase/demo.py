"""Deterministic synthetic demonstration of the complete research chain."""

from __future__ import annotations

import json
from dataclasses import asdict
from datetime import datetime, timedelta, timezone
from typing import Any

from .causal_backtest import run_backtest
from .domain import Bar, Signal
from .factor_combination import FactorSnapshot, combine_factors
from .multitimeframe import (
    align_completed_30_60_bars,
    build_effective_bars,
    collaborative_decision,
    trend_direction,
)
from .research_loop import ResearchLoop


def _synthetic_bars() -> list[Bar]:
    """Create public, deterministic bars; no market or brokerage data is used."""
    start = datetime(2026, 1, 5, 1, 0, tzinfo=timezone.utc)
    pairs = [
        (100.0, 101.0),
        (101.0, 102.0),
        (102.0, 102.03),  # deliberately low-information body
        (102.0, 103.0),
        (103.0, 104.0),
        (104.0, 105.0),
        (105.0, 106.0),
        (106.0, 107.0),
        (107.0, 106.5),
        (106.5, 108.0),
        (108.0, 109.0),
        (109.0, 110.0),
    ]
    return [
        Bar(
            timestamp=start + timedelta(minutes=30 * index),
            open=open_,
            high=max(open_, close) + 0.7,
            low=min(open_, close) - 0.7,
            close=close,
            volume=1_000 + 25 * index,
        )
        for index, (open_, close) in enumerate(pairs)
    ]


def build_demo_report() -> dict[str, Any]:
    bars_30 = _synthetic_bars()
    effective = build_effective_bars(bars_30, max_small_body_ratio=0.05)
    aligned = align_completed_30_60_bars(bars_30)
    fast_direction = trend_direction(bars_30, window=3)
    slow_direction = trend_direction(aligned.bars_60, window=3)
    mtf_decision = collaborative_decision(
        slow_direction=slow_direction, fast_direction=fast_direction
    )

    backtest = run_backtest(
        bars_30,
        [
            Signal("open_long", 2, reason="completed-bar continuation example"),
            Signal("open_short", 4, exec_bar_idx=4, reason="rejected same-bar example"),
            Signal("close_long", 8, reason="completed-bar exit example"),
        ],
        cost_per_side=0.05,
    )

    factor_decision = combine_factors(
        FactorSnapshot(
            trend=0.8,
            support_room=0.8,
            sentiment=0.3,
            fundamental=0.2,
            local_gex=-0.8,
            volatility_risk=0.2,
        )
    )

    loop = ResearchLoop(validation_threshold=0.60, holdout_threshold=0.55)
    parent = loop.propose("trend persistence with completed-bar execution")
    candidate = loop.propose(
        "add 30/60 direction-timing collaboration", parent_id=parent.candidate_id
    )
    loop.record_validation(candidate.candidate_id, score=0.68)
    loop.open_holdout(candidate.candidate_id, score=0.59)

    return {
        "project": {
            "name": "CTA Strategy Research Showcase",
            "data": "deterministic synthetic OHLCV",
            "boundary": "research demonstration only; no live trading connection",
        },
        "causal_backtest": {
            "accepted_signals": backtest.accepted_signals,
            "rejected_signals": backtest.rejected_signals,
            "rejection_reasons": [
                check.reason for check in backtest.checks if not check.accepted
            ],
            "trades": [asdict(trade) for trade in backtest.trades],
            "realized_points_after_example_cost": backtest.realized_pnl,
        },
        "multi_timeframe": {
            "completed_30m_bars": len(aligned.bars_30),
            "completed_60m_bars": len(aligned.bars_60),
            "effective_bar_count": len(effective.effective),
            "removed_low_information_indices": list(effective.removed_source_indices),
            "fast_direction": fast_direction,
            "slow_direction": slow_direction,
            "decision": mtf_decision,
        },
        "factor_combination": {
            "decision": factor_decision.decision,
            "score": factor_decision.score,
            "contributions": factor_decision.contributions,
            "vetoes": list(factor_decision.vetoes),
            "explanation": factor_decision.explanation,
        },
        "research_loop": {
            "candidate": candidate.candidate_id,
            "lineage": loop.lineage(candidate.candidate_id),
            "validation_score": candidate.validation_score,
            "holdout_score": candidate.holdout_score,
            "stage": candidate.stage,
            "failure_ledger_size": len(loop.failures),
        },
    }


def main() -> None:
    print(json.dumps(build_demo_report(), ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

