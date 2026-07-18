from datetime import datetime, timedelta, timezone

from cta_research_showcase.causal_backtest import run_backtest
from cta_research_showcase.domain import Bar, Signal


def make_bars() -> list[Bar]:
    start = datetime(2026, 1, 1, tzinfo=timezone.utc)
    closes = [100, 101, 103, 102, 99, 98]
    return [
        Bar(
            timestamp=start + timedelta(hours=i),
            open=close - 0.5,
            high=close + 1,
            low=close - 1,
            close=close,
            volume=100 + i,
        )
        for i, close in enumerate(closes)
    ]


def test_default_execution_uses_next_bar_open_and_applies_costs() -> None:
    result = run_backtest(
        make_bars(),
        [
            Signal("open_long", signal_bar_idx=0, reason="completed bar"),
            Signal("close_long", signal_bar_idx=2, reason="trend weakened"),
        ],
        cost_per_side=0.2,
    )

    assert result.accepted_signals == 2
    assert result.trades[0].entry_bar_idx == 1
    assert result.trades[0].exit_bar_idx == 3
    assert result.trades[0].entry_price == 100.5
    assert result.trades[0].exit_price == 101.5
    assert result.trades[0].net_pnl == 0.6


def test_same_bar_and_out_of_range_execution_are_rejected() -> None:
    result = run_backtest(
        make_bars(),
        [
            Signal("open_long", signal_bar_idx=1, exec_bar_idx=1),
            Signal("open_short", signal_bar_idx=5),
        ],
    )

    assert result.rejected_signals == 2
    assert {check.reason for check in result.checks} == {
        "execution must be strictly after the signal bar",
        "execution bar is outside available history",
    }


def test_opposite_open_reverses_position_at_one_observable_price() -> None:
    result = run_backtest(
        make_bars(),
        [
            Signal("open_long", signal_bar_idx=0),
            Signal("open_short", signal_bar_idx=2, reason="confirmed reversal"),
            Signal("close_short", signal_bar_idx=4),
        ],
    )

    assert [trade.direction for trade in result.trades] == ["long", "short"]
    assert result.trades[0].exit_bar_idx == result.trades[1].entry_bar_idx == 3
    assert result.realized_pnl == 5.0
