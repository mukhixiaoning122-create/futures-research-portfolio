from cta_research_showcase.factor_combination import FactorSnapshot, combine_factors


def test_negative_local_gex_strengthens_existing_trend_not_direction_by_itself() -> None:
    base = FactorSnapshot(
        trend=0.7,
        support_room=0.8,
        sentiment=0.2,
        fundamental=0.1,
        local_gex=0.0,
        volatility_risk=0.2,
    )
    negative_gex = FactorSnapshot(**{**base.as_dict(), "local_gex": -0.8})

    base_result = combine_factors(base)
    gex_result = combine_factors(negative_gex)

    assert gex_result.score > base_result.score
    assert gex_result.contributions["local_gex_continuation"] > 0


def test_hard_risk_veto_overrides_high_alpha_score() -> None:
    result = combine_factors(
        FactorSnapshot(
            trend=0.9,
            support_room=0.05,
            sentiment=0.8,
            fundamental=0.8,
            local_gex=-0.9,
            volatility_risk=0.95,
        )
    )

    assert result.decision == "wait"
    assert set(result.vetoes) == {"insufficient price room", "extreme volatility risk"}


def test_positive_local_gex_dampens_trend_continuation() -> None:
    result = combine_factors(
        FactorSnapshot(
            trend=-0.8,
            support_room=0.7,
            sentiment=-0.1,
            fundamental=-0.2,
            local_gex=0.8,
            volatility_risk=0.2,
        )
    )
    assert result.contributions["local_gex_continuation"] > 0
    assert result.decision == "open_short"

