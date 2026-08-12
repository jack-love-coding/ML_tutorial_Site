---
schema_version: 1
open_count: 1
waived_count: 0
fixed_count: 0
total_count: 1
last_updated: 2026-08-12T13:17:14.318Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 28.2 | deviation | package.json |  | npm security audit reports one high nanoid advisory outside Phase 28B changed dependency files | open |  | 2026-08-12T13:17:14.318Z |  |

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
  }
]
````
