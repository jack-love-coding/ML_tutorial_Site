# Phase 29 Resolved Items

These Plan 29-02 deferrals were rechecked during the v1.1 milestone closeout on 2026-08-29.

## Precision/recall lesson shell — resolved

- **Original issue:** The early Phase 29 release guard rejected the legacy precision/recall UI before the later lesson/lab plans owned its replacement.
- **Resolution evidence:** The completed Phase 30 classification decision lesson now owns confusion, precision, recall, F1, threshold, ROC/AUC, and cost-sensitive decision teaching. Phase 29 and Phase 30 verification reports both pass, and the milestone full suite is green.

## Transitive nanoid advisory — resolved

- **Original issue:** Plan 29-02 observed a pre-existing high-severity transitive advisory and correctly avoided an unrelated dependency mutation.
- **Resolution evidence:** The current lockfile contains the later security update and `npm run security:audit` reports zero vulnerabilities.
