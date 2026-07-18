"""Generic normal and 30/60-minute research primitives."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Sequence

from .domain import Bar


@dataclass(frozen=True, slots=True)
class EffectiveBar:
    bar: Bar
    source_index: int


@dataclass(frozen=True, slots=True)
class EffectiveBarResult:
    effective: tuple[EffectiveBar, ...]
    removed_source_indices: tuple[int, ...]


@dataclass(frozen=True, slots=True)
class AlignedBars:
    bars_30: tuple[Bar, ...]
    bars_60: tuple[Bar, ...]
    ignored_30_minute_indices: tuple[int, ...]


def body_ratio(bar: Bar) -> float:
    full_range = bar.high - bar.low
    if full_range <= 0:
        return 0.0
    return abs(bar.close - bar.open) / full_range


def build_effective_bars(
    bars: Sequence[Bar], *, max_small_body_ratio: float = 0.1
) -> EffectiveBarResult:
    """Remove low-information bodies while retaining original timeline indices."""
    if not 0 <= max_small_body_ratio <= 1:
        raise ValueError("max_small_body_ratio must be between zero and one")
    effective: list[EffectiveBar] = []
    removed: list[int] = []
    for index, item in enumerate(bars):
        if body_ratio(item) <= max_small_body_ratio:
            removed.append(index)
        else:
            effective.append(EffectiveBar(item, index))
    return EffectiveBarResult(tuple(effective), tuple(removed))


def align_completed_30_60_bars(bars_30: Sequence[Bar]) -> AlignedBars:
    """Aggregate only complete pairs; an unfinished 60-minute bar is never used."""
    completed_count = len(bars_30) - len(bars_30) % 2
    completed = tuple(bars_30[:completed_count])
    bars_60: list[Bar] = []
    for index in range(0, completed_count, 2):
        first, second = completed[index], completed[index + 1]
        bars_60.append(
            Bar(
                timestamp=second.timestamp,
                open=first.open,
                high=max(first.high, second.high),
                low=min(first.low, second.low),
                close=second.close,
                volume=first.volume + second.volume,
            )
        )
    ignored = tuple(range(completed_count, len(bars_30)))
    return AlignedBars(completed, tuple(bars_60), ignored)


def trend_direction(bars: Sequence[Bar], *, window: int = 3) -> int:
    """Return -1/0/1 using completed-bar price location and moving-average slope."""
    if window < 2 or len(bars) < window + 1:
        return 0
    previous_ma = sum(bar.close for bar in bars[-window - 1 : -1]) / window
    current_ma = sum(bar.close for bar in bars[-window:]) / window
    if bars[-1].close > current_ma and current_ma > previous_ma:
        return 1
    if bars[-1].close < current_ma and current_ma < previous_ma:
        return -1
    return 0


def collaborative_decision(
    *, slow_direction: int, fast_direction: int
) -> Literal["open_long", "open_short", "wait"]:
    """The 60-minute state defines direction; 30-minute state supplies timing."""
    if slow_direction == fast_direction == 1:
        return "open_long"
    if slow_direction == fast_direction == -1:
        return "open_short"
    return "wait"

