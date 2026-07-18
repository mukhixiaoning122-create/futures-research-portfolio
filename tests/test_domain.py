from datetime import datetime, timezone

import pytest

from cta_research_showcase.domain import Bar, Signal


def test_bar_rejects_inconsistent_ohlc() -> None:
    with pytest.raises(ValueError, match="high"):
        Bar(
            timestamp=datetime(2026, 1, 1, tzinfo=timezone.utc),
            open=100,
            high=99,
            low=98,
            close=99,
            volume=10,
        )


def test_signal_rejects_unknown_action() -> None:
    with pytest.raises(ValueError, match="unsupported action"):
        Signal(action="buy_everything", signal_bar_idx=1, exec_bar_idx=2)


def test_signal_accepts_supported_action() -> None:
    signal = Signal(action="open_long", signal_bar_idx=1, exec_bar_idx=2)
    assert signal.action == "open_long"

