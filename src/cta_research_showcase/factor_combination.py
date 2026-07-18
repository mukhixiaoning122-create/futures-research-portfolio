"""Explainable collaboration of strategy, context, and risk factors."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Literal


@dataclass(frozen=True, slots=True)
class FactorSnapshot:
    trend: float
    support_room: float
    sentiment: float
    fundamental: float
    local_gex: float
    volatility_risk: float

    def __post_init__(self) -> None:
        signed = (self.trend, self.sentiment, self.fundamental, self.local_gex)
        if any(not -1 <= value <= 1 for value in signed):
            raise ValueError("signed factor values must be between -1 and 1")
        if not 0 <= self.support_room <= 1 or not 0 <= self.volatility_risk <= 1:
            raise ValueError("room and risk values must be between 0 and 1")

    def as_dict(self) -> dict[str, float]:
        return asdict(self)


@dataclass(frozen=True, slots=True)
class FactorDecision:
    decision: Literal["open_long", "open_short", "wait"]
    score: float
    contributions: dict[str, float]
    vetoes: tuple[str, ...]
    explanation: str


def _sign(value: float) -> float:
    if value > 0:
        return 1.0
    if value < 0:
        return -1.0
    return 0.0


def combine_factors(snapshot: FactorSnapshot) -> FactorDecision:
    """Combine factors without allowing one contextual factor to invent direction."""
    trend_sign = _sign(snapshot.trend)
    contributions = {
        "trend": 0.50 * snapshot.trend,
        "support_room": 0.20 * trend_sign * (snapshot.support_room - 0.5),
        "sentiment": 0.10 * snapshot.sentiment,
        "fundamental": 0.10 * snapshot.fundamental,
        # Negative local GEX amplifies an existing move; positive GEX damps it.
        "local_gex_continuation": -0.15 * snapshot.local_gex * trend_sign,
    }
    pre_risk_score = sum(contributions.values())
    contributions["volatility_penalty"] = (
        -0.15 * snapshot.volatility_risk * _sign(pre_risk_score)
    )
    score = round(sum(contributions.values()), 6)

    vetoes: list[str] = []
    if snapshot.support_room < 0.10:
        vetoes.append("insufficient price room")
    if snapshot.volatility_risk > 0.90:
        vetoes.append("extreme volatility risk")

    if vetoes or abs(score) < 0.25:
        decision: Literal["open_long", "open_short", "wait"] = "wait"
    else:
        decision = "open_long" if score > 0 else "open_short"
    explanation = (
        f"trend supplies direction; context adjusts conviction; risk vetoes execution. "
        f"score={score:.3f}, decision={decision}"
    )
    return FactorDecision(decision, score, contributions, tuple(vetoes), explanation)

