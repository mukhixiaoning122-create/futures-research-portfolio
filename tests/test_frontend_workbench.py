import json
from pathlib import Path

from scripts.build_static_site import build_static_site


EXPECTED_MODULES = {
    "overview",
    "message-scoring",
    "trend-ranking",
    "strategy-research",
    "loops",
    "factors",
    "factor-strategies",
    "gamma-trend",
    "period-lab",
    "sim",
    "settings",
}


def load_modules() -> list[dict[str, object]]:
    return json.loads(Path("frontend/modules.json").read_text(encoding="utf-8"))


def test_workbench_covers_every_public_research_module() -> None:
    modules = load_modules()

    assert {module["id"] for module in modules} == EXPECTED_MODULES
    for module in modules:
        assert module["title"]
        assert module["subtitle"]
        assert module["principle"]
        assert len(module["implementation"]) >= 3


def test_loop_explains_candidate_lifecycle_and_research_memory() -> None:
    loop = next(module for module in load_modules() if module["id"] == "loops")
    serialized = json.dumps(loop, ensure_ascii=False)

    for concept in ["提出假设", "AST审计", "训练集", "验证集", "封存样本", "失败账本", "冠军记忆"]:
        assert concept in serialized


def test_trend_ranking_explains_smoothness_instead_of_return_ranking() -> None:
    ranking = next(module for module in load_modules() if module["id"] == "trend-ranking")
    serialized = json.dumps(ranking, ensure_ascii=False)

    for concept in ["路径效率", "MA20穿越", "回撤深度", "斜率一致性", "小实体"]:
        assert concept in serialized
    assert "不是涨幅排名" in serialized


def test_frontend_uses_hash_navigation_and_specialized_research_views() -> None:
    html = Path("frontend/index.html").read_text(encoding="utf-8")
    script = Path("frontend/app.js").read_text(encoding="utf-8")

    assert 'id="sidebar-nav"' in html
    assert 'id="mobile-menu"' in html
    assert "hashchange" in script
    assert "renderResearchLoop" in script
    assert "renderTrendRanking" in script
    assert "renderGammaLab" in script
    assert "renderPeriodLab" in script


def test_frontend_binds_demo_report_and_handles_visible_actions() -> None:
    script = Path("frontend/app.js").read_text(encoding="utf-8")

    assert "state.demo.causal_backtest" in script
    assert "state.demo.research_loop" in script
    assert 'data-action="change-ranking-period"' in script
    assert 'data-action="generate-spec"' in script
    assert 'data-action="open-strategy"' in script
    assert "handleWorkbenchAction" in script


def test_overview_counts_match_public_catalog_and_test_suite() -> None:
    overview = next(module for module in load_modules() if module["id"] == "overview")
    metrics = {item["label"]: item["value"] for item in overview["metrics"]}

    assert metrics["研究模块"] == "11"
    assert metrics["自动化测试"] == "29"


def test_static_builder_includes_module_catalog(tmp_path: Path) -> None:
    output = tmp_path / "site"

    build_static_site(output)

    assert (output / "assets" / "modules.json").is_file()
    assert json.loads((output / "assets" / "modules.json").read_text(encoding="utf-8")) == load_modules()
