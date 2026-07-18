from datetime import datetime, timedelta, timezone

from cta_research_showcase.domain import Bar
from cta_research_showcase.multitimeframe import (
    align_completed_30_60_bars,
    build_effective_bars,
    collaborative_decision,
)


def bar(i: int, open_: float, close: float, high: float, low: float) -> Bar:
    return Bar(
        timestamp=datetime(2026, 1, 1, tzinfo=timezone.utc) + timedelta(minutes=30 * i),
        open=open_,
        high=high,
        low=low,
        close=close,
        volume=100,
    )


def test_small_body_filter_preserves_source_mapping() -> None:
    bars = [
        bar(0, 100, 103, 104, 99),
        bar(1, 103, 103.1, 104, 102),
        bar(2, 103, 106, 107, 102),
    ]
    result = build_effective_bars(bars, max_small_body_ratio=0.1)

    assert [item.source_index for item in result.effective] == [0, 2]
    assert result.removed_source_indices == (1,)


def test_alignment_uses_only_completed_60_minute_pairs() -> None:
    bars_30 = [
        bar(0, 100, 101, 102, 99),
        bar(1, 101, 102, 103, 100),
        bar(2, 102, 103, 104, 101),
        bar(3, 103, 104, 105, 102),
        bar(4, 104, 105, 106, 103),
    ]
    aligned = align_completed_30_60_bars(bars_30)

    assert len(aligned.bars_60) == 2
    assert aligned.ignored_30_minute_indices == (4,)
    assert aligned.bars_60[-1].close == 104


def test_collaboration_requires_slow_direction_and_fast_timing() -> None:
    assert collaborative_decision(slow_direction=1, fast_direction=1) == "open_long"
    assert collaborative_decision(slow_direction=-1, fast_direction=-1) == "open_short"
    assert collaborative_decision(slow_direction=1, fast_direction=-1) == "wait"

