from cta_research_showcase.strategy_audit import audit_strategy_source


def finding_codes(source: str) -> set[str]:
    return {finding.code for finding in audit_strategy_source(source)}


def test_audit_blocks_negative_and_future_indexing() -> None:
    source = """
def generate(bars, i):
    last = bars[-1]
    future = bars[i + 1]
    return last, future
"""
    assert finding_codes(source) == {"negative-index", "future-index"}


def test_audit_blocks_dangerous_imports_and_calls() -> None:
    source = """
import subprocess

def generate(bars, i):
    return eval("bars[0]")
"""
    assert finding_codes(source) == {"forbidden-import", "forbidden-call"}


def test_audit_accepts_completed_history_access() -> None:
    source = """
def generate(bars, i):
    closes = [bar.close for bar in bars[: i + 1]]
    return sum(closes[-20:]) / min(20, len(closes))
"""
    assert audit_strategy_source(source) == []

