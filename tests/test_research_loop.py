import pytest

from cta_research_showcase.research_loop import ResearchLoop


def test_candidate_lineage_and_failure_ledger_are_preserved() -> None:
    loop = ResearchLoop(validation_threshold=0.6, holdout_threshold=0.55)
    parent = loop.propose("trend persistence after low-noise breakout")
    child = loop.propose("add support-room filter", parent_id=parent.candidate_id)

    loop.record_validation(child.candidate_id, score=0.4)

    assert loop.lineage(child.candidate_id) == [parent.candidate_id, child.candidate_id]
    assert loop.failures[0].candidate_id == child.candidate_id
    assert "validation" in loop.failures[0].reason


def test_holdout_can_only_open_after_validation_and_only_once() -> None:
    loop = ResearchLoop(validation_threshold=0.6, holdout_threshold=0.55)
    candidate = loop.propose("30/60 direction and timing collaboration")

    with pytest.raises(ValueError, match="validation"):
        loop.open_holdout(candidate.candidate_id, score=0.8)

    loop.record_validation(candidate.candidate_id, score=0.7)
    promoted = loop.open_holdout(candidate.candidate_id, score=0.6)
    assert promoted.stage == "promoted"

    with pytest.raises(ValueError, match="already opened"):
        loop.open_holdout(candidate.candidate_id, score=0.7)


def test_failed_holdout_is_recorded_not_promoted() -> None:
    loop = ResearchLoop(validation_threshold=0.6, holdout_threshold=0.55)
    candidate = loop.propose("fragile parameter peak")
    loop.record_validation(candidate.candidate_id, score=0.65)
    result = loop.open_holdout(candidate.candidate_id, score=0.2)

    assert result.stage == "failed"
    assert loop.failures[-1].phase == "holdout"

