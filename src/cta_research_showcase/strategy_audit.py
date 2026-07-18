"""Static checks for common generated-strategy safety violations."""

from __future__ import annotations

import ast
from dataclasses import dataclass


FORBIDDEN_IMPORT_ROOTS = {"os", "pathlib", "shutil", "socket", "subprocess"}
FORBIDDEN_CALLS = {"__import__", "compile", "eval", "exec", "open"}


@dataclass(frozen=True, slots=True)
class AuditFinding:
    code: str
    line: int
    message: str


def _is_negative_integer(node: ast.AST) -> bool:
    return (
        isinstance(node, ast.UnaryOp)
        and isinstance(node.op, ast.USub)
        and isinstance(node.operand, ast.Constant)
        and isinstance(node.operand.value, int)
    )


def _is_future_offset(node: ast.AST) -> bool:
    return (
        isinstance(node, ast.BinOp)
        and isinstance(node.op, ast.Add)
        and isinstance(node.right, ast.Constant)
        and isinstance(node.right.value, int)
        and node.right.value > 0
    )


class _AuditVisitor(ast.NodeVisitor):
    def __init__(self) -> None:
        self.findings: list[AuditFinding] = []

    def add(self, node: ast.AST, code: str, message: str) -> None:
        self.findings.append(AuditFinding(code, getattr(node, "lineno", 0), message))

    def visit_Import(self, node: ast.Import) -> None:
        for alias in node.names:
            if alias.name.split(".", 1)[0] in FORBIDDEN_IMPORT_ROOTS:
                self.add(node, "forbidden-import", f"forbidden import: {alias.name}")
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        root = (node.module or "").split(".", 1)[0]
        if root in FORBIDDEN_IMPORT_ROOTS:
            self.add(node, "forbidden-import", f"forbidden import: {node.module}")
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call) -> None:
        if isinstance(node.func, ast.Name) and node.func.id in FORBIDDEN_CALLS:
            self.add(node, "forbidden-call", f"forbidden call: {node.func.id}")
        self.generic_visit(node)

    def visit_Subscript(self, node: ast.Subscript) -> None:
        if _is_negative_integer(node.slice):
            self.add(node, "negative-index", "negative indexing can access unseen tail data")
        elif _is_future_offset(node.slice):
            self.add(node, "future-index", "positive index offset can access a future bar")
        self.generic_visit(node)


def audit_strategy_source(source: str) -> list[AuditFinding]:
    try:
        tree = ast.parse(source)
    except SyntaxError as exc:
        return [AuditFinding("syntax-error", exc.lineno or 0, exc.msg)]
    visitor = _AuditVisitor()
    visitor.visit(tree)
    return visitor.findings

