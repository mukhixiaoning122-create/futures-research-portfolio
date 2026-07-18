"""An auditable research loop with lineage and sealed-holdout discipline."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal


Stage = Literal["proposed", "validated", "promoted", "failed"]


@dataclass(slots=True)
class Candidate:
    candidate_id: str
    hypothesis: str
    parent_id: str | None
    stage: Stage = "proposed"
    validation_score: float | None = None
    holdout_score: float | None = None
    holdout_opened: bool = False


@dataclass(frozen=True, slots=True)
class FailureRecord:
    candidate_id: str
    phase: Literal["validation", "holdout"]
    score: float
    reason: str


class ResearchLoop:
    def __init__(self, *, validation_threshold: float, holdout_threshold: float) -> None:
        self.validation_threshold = validation_threshold
        self.holdout_threshold = holdout_threshold
        self.candidates: dict[str, Candidate] = {}
        self.failures: list[FailureRecord] = []
        self._sequence = 0

    def propose(self, hypothesis: str, *, parent_id: str | None = None) -> Candidate:
        if parent_id is not None and parent_id not in self.candidates:
            raise KeyError(f"unknown parent candidate: {parent_id}")
        self._sequence += 1
        candidate = Candidate(f"C{self._sequence:03d}", hypothesis, parent_id)
        self.candidates[candidate.candidate_id] = candidate
        return candidate

    def record_validation(self, candidate_id: str, *, score: float) -> Candidate:
        candidate = self.candidates[candidate_id]
        candidate.validation_score = score
        if score >= self.validation_threshold:
            candidate.stage = "validated"
        else:
            candidate.stage = "failed"
            self.failures.append(
                FailureRecord(
                    candidate_id,
                    "validation",
                    score,
                    "validation score did not reach the promotion gate",
                )
            )
        return candidate

    def open_holdout(self, candidate_id: str, *, score: float) -> Candidate:
        candidate = self.candidates[candidate_id]
        if candidate.holdout_opened:
            raise ValueError("sealed holdout was already opened for this candidate")
        if candidate.stage != "validated":
            raise ValueError("candidate must pass validation before sealed holdout")
        candidate.holdout_opened = True
        candidate.holdout_score = score
        if score >= self.holdout_threshold:
            candidate.stage = "promoted"
        else:
            candidate.stage = "failed"
            self.failures.append(
                FailureRecord(
                    candidate_id,
                    "holdout",
                    score,
                    "sealed holdout score did not reach the promotion gate",
                )
            )
        return candidate

    def lineage(self, candidate_id: str) -> list[str]:
        lineage: list[str] = []
        current: Candidate | None = self.candidates[candidate_id]
        while current is not None:
            lineage.append(current.candidate_id)
            current = self.candidates.get(current.parent_id) if current.parent_id else None
        return list(reversed(lineage))

