"""Small, explicit domain objects shared by the showcase modules."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Literal


Action = Literal["open_long", "close_long", "open_short", "close_short"]
SUPPORTED_ACTIONS: frozenset[str] = frozenset(
    {"open_long", "close_long", "open_short", "close_short"}
)


@dataclass(frozen=True, slots=True)
class Bar:
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float = 0.0

    def __post_init__(self) -> None:
        if self.high < max(self.open, self.close, self.low):
            raise ValueError("high must be greater than or equal to open, close and low")
        if self.low > min(self.open, self.close, self.high):
            raise ValueError("low must be less than or equal to open, close and high")
        if self.volume < 0:
            raise ValueError("volume must not be negative")


@dataclass(frozen=True, slots=True)
class Signal:
    action: Action | str
    signal_bar_idx: int
    exec_bar_idx: int | None = None
    reason: str = ""
    period_minutes: int = 60

    def __post_init__(self) -> None:
        if self.action not in SUPPORTED_ACTIONS:
            raise ValueError(f"unsupported action: {self.action}")
        if self.signal_bar_idx < 0:
            raise ValueError("signal_bar_idx must not be negative")
        if self.exec_bar_idx is not None and self.exec_bar_idx < 0:
            raise ValueError("exec_bar_idx must not be negative")


@dataclass(frozen=True, slots=True)
class SignalCheck:
    signal: Signal
    accepted: bool
    reason: str
    resolved_exec_bar_idx: int | None = None


@dataclass(frozen=True, slots=True)
class Trade:
    direction: Literal["long", "short"]
    entry_bar_idx: int
    exit_bar_idx: int
    entry_price: float
    exit_price: float
    gross_pnl: float
    cost: float
    net_pnl: float
    entry_reason: str = ""
    exit_reason: str = ""


@dataclass(slots=True)
class BacktestResult:
    trades: list[Trade] = field(default_factory=list)
    checks: list[SignalCheck] = field(default_factory=list)
    realized_pnl: float = 0.0

    @property
    def accepted_signals(self) -> int:
        return sum(check.accepted for check in self.checks)

    @property
    def rejected_signals(self) -> int:
        return len(self.checks) - self.accepted_signals

