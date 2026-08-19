---
schema_version: 1
open_count: 2
waived_count: 0
fixed_count: 0
total_count: 2
last_updated: 2026-08-19T16:17:24.314Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 28.2 | deviation | package.json |  | npm security audit reports one high nanoid advisory outside Phase 28B changed dependency files | open |  | 2026-08-12T13:17:14.318Z |  |
| 2 | 29 | unrun-verify | tests/logistic-regression-release.test.mjs |  | Full npm test remains blocked by legacy Phase 29 precision/recall UI; later lesson/lab plan owns removal. | open |  | 2026-08-19T16:17:24.314Z |  |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "28.2",
    "file": "package.json",
    "line": null,
    "description": "npm security audit reports one high nanoid advisory outside Phase 28B changed dependency files",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-12T13:17:14.318Z",
    "resolved_at": null
  },
  {
    "id": 2,
    "kind": "unrun-verify",
    "phase": "29",
    "file": "tests/logistic-regression-release.test.mjs",
    "line": null,
    "description": "Full npm test remains blocked by legacy Phase 29 precision/recall UI; later lesson/lab plan owns removal.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-08-19T16:17:24.314Z",
    "resolved_at": null
  }
]
````
