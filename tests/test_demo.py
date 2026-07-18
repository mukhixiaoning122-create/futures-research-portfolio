from cta_research_showcase.demo import build_demo_report


def test_demo_report_closes_research_chain_without_private_inputs() -> None:
    first = build_demo_report()
    second = build_demo_report()

    assert first == second
    assert first["causal_backtest"]["accepted_signals"] == 2
    assert first["causal_backtest"]["rejected_signals"] == 1
    assert first["multi_timeframe"]["decision"] in {"open_long", "wait"}
    assert first["factor_combination"]["decision"] == "open_long"
    assert first["research_loop"]["stage"] == "promoted"
    serialized = str(first).lower()
    assert "account" not in serialized
    assert "password" not in serialized
    assert "real.contract" not in serialized
    assert "broker.identifier" not in serialized
