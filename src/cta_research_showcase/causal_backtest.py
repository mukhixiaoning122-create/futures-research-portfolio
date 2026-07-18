"""A compact bar-by-bar engine that makes causality violations visible."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Sequence

from .domain import BacktestResult, Bar, Signal, SignalCheck, Trade


@dataclass(slots=True)
class _OpenPosition:
    direction: Literal["long", "short"]
    entry_bar_idx: int
    entry_price: float
    reason: str


def _close_position(
    position: _OpenPosition,
    *,
    exit_bar_idx: int,
    exit_price: float,
    exit_reason: str,
    cost_per_side: float,
) -> Trade:
    direction_sign = 1.0 if position.direction == "long" else -1.0
    gross = direction_sign * (exit_price - position.entry_price)
    cost = 2.0 * cost_per_side
    return Trade(
        direction=position.direction,
        entry_bar_idx=position.entry_bar_idx,
        exit_bar_idx=exit_bar_idx,
        entry_price=position.entry_price,
        exit_price=exit_price,
        gross_pnl=round(gross, 10),
        cost=round(cost, 10),
        net_pnl=round(gross - cost, 10),
        entry_reason=position.reason,
        exit_reason=exit_reason,
    )


def run_backtest(
    bars: Sequence[Bar],
    signals: Sequence[Signal],
    *,
    cost_per_side: float = 0.0,
    close_open_position: bool = False,
) -> BacktestResult:
    """Validate signals first, then execute accepted actions at future bar opens."""
    if cost_per_side < 0:
        raise ValueError("cost_per_side must not be negative")

    result = BacktestResult()
    scheduled: dict[int, list[Signal]] = {}
    for signal in signals:
        exec_idx = signal.exec_bar_idx
        if exec_idx is None:
            exec_idx = signal.signal_bar_idx + 1
        if signal.signal_bar_idx >= len(bars):
            result.checks.append(
                SignalCheck(signal, False, "signal bar is outside available history")
            )
            continue
        if exec_idx <= signal.signal_bar_idx:
            result.checks.append(
                SignalCheck(
                    signal,
                    False,
                    "execution must be strictly after the signal bar",
                    exec_idx,
                )
            )
            continue
        if exec_idx >= len(bars):
            result.checks.append(
                SignalCheck(
                    signal,
                    False,
                    "execution bar is outside available history",
                    exec_idx,
                )
            )
            continue
        scheduled.setdefault(exec_idx, []).append(signal)

    position: _OpenPosition | None = None
    for exec_idx in sorted(scheduled):
        price = bars[exec_idx].open
        for signal in scheduled[exec_idx]:
            action = signal.action
            if action == "open_long":
                if position and position.direction == "long":
                    result.checks.append(
                        SignalCheck(signal, False, "position is already long", exec_idx)
                    )
                    continue
                if position:
                    result.trades.append(
                        _close_position(
                            position,
                            exit_bar_idx=exec_idx,
                            exit_price=price,
                            exit_reason=signal.reason or "reverse to long",
                            cost_per_side=cost_per_side,
                        )
                    )
                position = _OpenPosition("long", exec_idx, price, signal.reason)
            elif action == "open_short":
                if position and position.direction == "short":
                    result.checks.append(
                        SignalCheck(signal, False, "position is already short", exec_idx)
                    )
                    continue
                if position:
                    result.trades.append(
                        _close_position(
                            position,
                            exit_bar_idx=exec_idx,
                            exit_price=price,
                            exit_reason=signal.reason or "reverse to short",
                            cost_per_side=cost_per_side,
                        )
                    )
                position = _OpenPosition("short", exec_idx, price, signal.reason)
            elif action == "close_long":
                if not position or position.direction != "long":
                    result.checks.append(
                        SignalCheck(signal, False, "no long position to close", exec_idx)
                    )
                    continue
                result.trades.append(
                    _close_position(
                        position,
                        exit_bar_idx=exec_idx,
                        exit_price=price,
                        exit_reason=signal.reason,
                        cost_per_side=cost_per_side,
                    )
                )
                position = None
            elif action == "close_short":
                if not position or position.direction != "short":
                    result.checks.append(
                        SignalCheck(signal, False, "no short position to close", exec_idx)
                    )
                    continue
                result.trades.append(
                    _close_position(
                        position,
                        exit_bar_idx=exec_idx,
                        exit_price=price,
                        exit_reason=signal.reason,
                        cost_per_side=cost_per_side,
                    )
                )
                position = None
            result.checks.append(SignalCheck(signal, True, "accepted", exec_idx))

    if close_open_position and position and position.entry_bar_idx < len(bars) - 1:
        result.trades.append(
            _close_position(
                position,
                exit_bar_idx=len(bars) - 1,
                exit_price=bars[-1].close,
                exit_reason="end of demonstration history",
                cost_per_side=cost_per_side,
            )
        )

    result.realized_pnl = round(sum(trade.net_pnl for trade in result.trades), 10)
    return result

