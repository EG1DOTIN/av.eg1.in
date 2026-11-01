#!/usr/bin/env python3
"""
audit_simulator_integrity.py
----------------------------
Verifies that DesktopSimulator.tsx and DesktopSimulator.css implement
the complete 3-tier status matrix (protected, warning, danger) and scan simulation.
"""

import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent
SRC_DIR = ROOT_DIR / "src"
SIMULATOR_TSX = SRC_DIR / "components" / "DesktopSimulator.tsx"
SIMULATOR_CSS = SRC_DIR / "components" / "DesktopSimulator.css"


def audit_simulator() -> int:
    errors = []

    if not SIMULATOR_TSX.exists():
        errors.append(f"Missing {SIMULATOR_TSX}")
    else:
        tsx_content = SIMULATOR_TSX.read_text(encoding="utf-8")
        required_states = ["protected", "warning", "danger"]
        for st in required_states:
            if f"'{st}'" not in tsx_content and f'"{st}"' not in tsx_content:
                errors.append(f"DesktopSimulator.tsx missing '{st}' status state")

        if "isScanModalOpen" not in tsx_content and "scanning" not in tsx_content.lower():
            errors.append("DesktopSimulator.tsx missing scan simulation logic")

    if not SIMULATOR_CSS.exists():
        errors.append(f"Missing {SIMULATOR_CSS}")
    else:
        css_content = SIMULATOR_CSS.read_text(encoding="utf-8")
        if css_content.count("{") != css_content.count("}"):
            errors.append("DesktopSimulator.css has unbalanced curly braces")

    if errors:
        print(f"❌ Desktop simulator integrity audit failed with {len(errors)} error(s):")
        for err in errors:
            print(f"   • {err}")
        return 1

    print("✅ Desktop simulator state matrix (protected/warning/danger) and style integrity verified successfully.")
    return 0


if __name__ == "__main__":
    sys.exit(audit_simulator())
