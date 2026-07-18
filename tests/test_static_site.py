import json
from pathlib import Path

from cta_research_showcase.demo import build_demo_report
from scripts.build_static_site import build_static_site


def test_static_site_contains_same_demo_data_and_relative_assets(tmp_path: Path) -> None:
    output = tmp_path / "site"

    build_static_site(output)

    assert json.loads((output / "demo-data.json").read_text(encoding="utf-8")) == build_demo_report()
    html = (output / "index.html").read_text(encoding="utf-8")
    assert './assets/styles.css' in html
    assert './assets/app.js' in html
    assert (output / "assets" / "styles.css").is_file()
    assert (output / "assets" / "app.js").is_file()
    assert (output / ".nojekyll").is_file()


def test_browser_script_falls_back_to_static_json() -> None:
    script = Path("frontend/app.js").read_text(encoding="utf-8")

    assert "'/api/demo'" in script
    assert "'./demo-data.json'" in script


def test_pages_workflow_builds_static_artifact_before_deployment() -> None:
    workflow = Path(".github/workflows/pages.yml").read_text(encoding="utf-8")

    assert "python scripts/build_static_site.py --output site" in workflow
    assert "actions/upload-pages-artifact@v4" in workflow
    assert "actions/deploy-pages@v4" in workflow
    assert "pages: write" in workflow
    assert "id-token: write" in workflow
