"""Build the dependency-free GitHub Pages artifact."""

from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

from cta_research_showcase.demo import build_demo_report


PROJECT_ROOT = Path(__file__).resolve().parents[1]
FRONTEND_DIR = PROJECT_ROOT / "frontend"


def build_static_site(output: Path) -> None:
    output = output.resolve()
    assets = output / "assets"
    assets.mkdir(parents=True, exist_ok=True)

    shutil.copy2(FRONTEND_DIR / "index.html", output / "index.html")
    shutil.copy2(FRONTEND_DIR / "styles.css", assets / "styles.css")
    shutil.copy2(FRONTEND_DIR / "app.js", assets / "app.js")
    shutil.copy2(FRONTEND_DIR / "modules.json", assets / "modules.json")
    (output / "demo-data.json").write_text(
        json.dumps(build_demo_report(), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    (output / ".nojekyll").write_text("", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=PROJECT_ROOT / "site")
    args = parser.parse_args()
    build_static_site(args.output)
    print(f"Static showcase built at {args.output.resolve()}")


if __name__ == "__main__":
    main()

