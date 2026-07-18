# Futures Research Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a clean, runnable GitHub portfolio repository that demonstrates CTA strategy research capability without exposing employer code, real strategies, account credentials, proprietary data, or live-trading parameters.

**Architecture:** Create a new independent repository instead of copying the existing working tree. Re-express the core research ideas as small generic Python modules: causal backtesting, AST safety audit, normal and 30/60-minute research frameworks, factor combination, and an auditable research loop. Add deterministic synthetic data, a minimal web demo, tests, and recruiter-oriented documentation.

**Tech Stack:** Python 3.11+, dataclasses, standard-library AST/HTTP utilities, optional FastAPI/Uvicorn, pytest, static HTML/CSS/JavaScript.

## Global Constraints

- Do not modify or copy files from the current `finance-market-mcp` working tree.
- Do not include real AG/LC strategies, exact live parameters, real PnL, account identifiers, API keys, proprietary datasets, employer names, or company-era source code.
- All demonstrations must run on deterministic synthetic OHLCV data.
- Signals may only use completed bars; execution must occur strictly after the signal bar.
- Clearly label the repository as a portfolio demonstration, not a live trading system or investment recommendation.
- Initialize a new Git repository locally, but do not publish externally until secret and content audits pass.

---

### Task 1: Clean repository skeleton and domain model

**Files:**
- Create: `futures-research-portfolio/pyproject.toml`
- Create: `futures-research-portfolio/.gitignore`
- Create: `futures-research-portfolio/LICENSE`
- Create: `futures-research-portfolio/src/cta_research_showcase/__init__.py`
- Create: `futures-research-portfolio/src/cta_research_showcase/domain.py`
- Test: `futures-research-portfolio/tests/test_domain.py`

**Interfaces:**
- Produces: immutable `Bar`, `Signal`, `Trade`, and `SignalCheck` dataclasses shared by later modules.

- [ ] Write tests that validate OHLC invariants and supported signal actions.
- [ ] Run the domain tests and verify the initial failure.
- [ ] Implement the dataclasses and validation.
- [ ] Run the domain tests and verify they pass.

### Task 2: Causal backtest and code audit

**Files:**
- Create: `futures-research-portfolio/src/cta_research_showcase/causal_backtest.py`
- Create: `futures-research-portfolio/src/cta_research_showcase/strategy_audit.py`
- Test: `futures-research-portfolio/tests/test_causal_backtest.py`
- Test: `futures-research-portfolio/tests/test_strategy_audit.py`

**Interfaces:**
- Consumes: domain dataclasses.
- Produces: `run_backtest(bars, signals, cost_per_side)` and `audit_strategy_source(source)`.

- [ ] Write tests for next-bar execution, same-bar rejection, invalid indices, position reversal, costs, negative indexing, future indexing, and forbidden calls.
- [ ] Run the tests and verify the initial failure.
- [ ] Implement the causal engine and AST audit with structured rejection reasons.
- [ ] Run the focused tests and verify they pass.

### Task 3: Multi-timeframe framework, factor combination, and research loop

**Files:**
- Create: `futures-research-portfolio/src/cta_research_showcase/multitimeframe.py`
- Create: `futures-research-portfolio/src/cta_research_showcase/factor_combination.py`
- Create: `futures-research-portfolio/src/cta_research_showcase/research_loop.py`
- Test: `futures-research-portfolio/tests/test_multitimeframe.py`
- Test: `futures-research-portfolio/tests/test_factor_combination.py`
- Test: `futures-research-portfolio/tests/test_research_loop.py`

**Interfaces:**
- Produces: effective-bar mapping, normal/30-60 state comparison, explainable factor decisions, candidate lineage, failure ledger, and one-shot sealed holdout promotion.

- [ ] Write tests for small-body filtering without timeline loss, 30/60 alignment, negative local-GEX continuation adjustment, hard risk vetoes, candidate lineage, and sealed holdout access.
- [ ] Run the tests and verify the initial failure.
- [ ] Implement the three modules using generic example thresholds only.
- [ ] Run the focused tests and verify they pass.

### Task 4: Deterministic demo and web presentation

**Files:**
- Create: `futures-research-portfolio/src/cta_research_showcase/demo.py`
- Create: `futures-research-portfolio/src/cta_research_showcase/api.py`
- Create: `futures-research-portfolio/frontend/index.html`
- Create: `futures-research-portfolio/frontend/styles.css`
- Create: `futures-research-portfolio/frontend/app.js`
- Test: `futures-research-portfolio/tests/test_demo.py`

**Interfaces:**
- Produces: `build_demo_report()` JSON-compatible output and optional FastAPI endpoints `/health` and `/api/demo`.

- [ ] Write a deterministic end-to-end demo test.
- [ ] Run it and verify the initial failure.
- [ ] Implement synthetic data, demonstration signals, factor explanation, research-loop result, and API serialization.
- [ ] Implement a static recruiter-facing page that renders the demo output.
- [ ] Run the end-to-end test and verify it passes.

### Task 5: GitHub-facing documentation and release audit

**Files:**
- Create: `futures-research-portfolio/README.md`
- Create: `futures-research-portfolio/docs/ARCHITECTURE.md`
- Create: `futures-research-portfolio/docs/INTERVIEW_GUIDE.md`
- Create: `futures-research-portfolio/.env.example`

**Interfaces:**
- Produces: a five-minute quick start, architecture explanation, truthful project boundaries, and interview talking points.

- [ ] Document project value before implementation detail, then explain the normal causal framework, 30/60 collaboration, small-body filtering, factor collaboration, Local GEX, research loop, and research/live isolation boundary.
- [ ] Add local setup and demo commands with expected outputs.
- [ ] Run all tests, package build, secret scan, identity scan, absolute-path scan, and prohibited-content scan.
- [ ] Initialize a new Git repository and commit the audited files.
- [ ] Inspect Git status and repository history to verify only the clean initial commit exists.

