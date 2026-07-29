---
phase: 27-linear-regression-rebuild
plan: "05"
subsystem: runtime-assets
tags: [typescript, strict-validation, immutable-data, bike-sharing, github-pages]

requires:
  - phase: 27-linear-regression-rebuild
    plan: "01"
    provides: Locked Bike feature, split, residual, optimizer, and diagnostic contracts
  - phase: 27-linear-regression-rebuild
    plan: "04"
    provides: Exact nine-member bilingual Notebook package and frozen output manifest
provides:
  - Literal typed registry for the exact nine-member local linear-regression package
  - Fail-closed parsers for the locked summary, manifest, and three numerical CSV outputs
  - Detached deeply frozen runtime results with exact source, split, feature, tolerance, and teaching-row identity
  - Typed eight-chapter bindings for semantic outputs and base-safe learner downloads
  - Corruption, manifest, inventory, locale-parity, immutability, and root/Pages path tests
affects: [27-06-course-content, 27-07-runtime-consumers, 27-08-release, linear-regression]

tech-stack:
  added: []
  patterns:
    - Literal allowlist descriptors are the sole browser-facing ownership boundary for generated assets
    - Exact-key structural parsing rejects stale, extra, malformed, non-finite, or cross-generation data
    - Accepted generated data is copied and recursively frozen before reaching course consumers
    - Public paths remain leading-slash registry data and resolve only through withPublicBase

key-files:
  created:
    - src/data/linearRegressionAssets.ts
    - tests/linear-regression-assets.test.ts
  modified: []

key-decisions:
  - "Treat the published manifest as exact cross-generation identity while validating summary and CSV structures independently and fail-closed."
  - "Deep-copy and recursively freeze every accepted generated result so runtime consumers cannot mutate publication authority."
  - "Dispatch parsing only for registered summary, manifest, and numerical CSV output IDs; path resolution remains outside parsers and owned by withPublicBase."

patterns-established:
  - "Exact generated boundary: registry membership, manifest inventory, source identity, numerical schema, and deterministic teaching roles must all agree before data is accepted."
  - "Immutable consumer handoff: parsers return detached frozen records and arrays rather than references into parsed JSON or CSV inputs."
  - "Semantic chapter binding: preserved chapter IDs consume registered output/download IDs without duplicating public paths or numerical values."

requirements-completed: [LINR-01, LINR-02, LINR-03, LINR-04]

coverage:
  - id: D1
    description: Exact nine-member typed local registry, manifest pairing, and root/Pages path contract
    requirement: LINR-03
    verification:
      - kind: unit
        ref: "tests/linear-regression-assets.test.ts#typed registry exactly mirrors the manifest and paired notebook parity proof"
        status: pass
      - kind: unit
        ref: "tests/linear-regression-assets.test.ts#linear-regression base path resolves every public member for root and GitHub Pages"
        status: pass
    human_judgment: false
  - id: D2
    description: Strict immutable summary boundary locks source, split, feature, method, diagnostic, and deterministic teaching-row contracts
    requirement: LINR-02
    verification:
      - kind: unit
        ref: "tests/linear-regression-assets.test.ts#strict summary parser accepts the published generation and returns detached readonly data"
        status: pass
      - kind: unit
        ref: "tests/linear-regression-assets.test.ts#strict summary parser rejects missing extra stale non-finite wrong-order and tolerance drift"
        status: pass
    human_judgment: false
  - id: D3
    description: Manifest and numerical CSV parsing reject cross-generation identity, parity, shape, order, and arithmetic drift
    requirement: LINR-04
    verification:
      - kind: unit
        ref: "tests/linear-regression-assets.test.ts#manifest validator rejects cross-generation inventory parity hash and selection drift"
        status: pass
      - kind: unit
        ref: "tests/linear-regression-assets.test.ts#strict CSV parsers reject malformed extra missing non-finite wrong-order and inconsistent rows"
        status: pass
    human_judgment: false
  - id: D4
    description: Eight preserved chapters expose registered semantic outputs and learner downloads without recomputing generated truth
    requirement: LINR-01
    verification:
      - kind: unit
        ref: "tests/linear-regression-assets.test.ts#chapter bindings use only preserved chapters and registered semantic outputs and downloads"
        status: pass
      - kind: integration
        ref: "npm run build"
        status: pass
    human_judgment: false

duration: 23 min
completed: 2026-07-29
status: complete
---

# Phase 27 Plan 05: Strict Regression Asset Boundary Summary

**An exact nine-asset TypeScript registry now admits only the published Bike regression generation through strict immutable JSON/CSV parsing, deterministic teaching-row identities, and base-safe local chapter bindings.**

## Performance

- **Duration:** 23 min
- **Started:** 2026-07-29T12:11:49Z
- **Completed:** 2026-07-29T12:34:56Z
- **Tasks:** 2
- **Files modified:** 2 implementation/test files, plus this summary and planning state

## Accomplishments

- Registered both bilingual Notebooks, the summary, three CSV outputs, requirements, environment, and manifest as one literal nine-member local package with exact roles, topic pairing, and locale parity.
- Added fail-closed summary and manifest validation for exact keys, versions, hashes, feature order, 13,903/3,476 chronological split, unscaled `workingday`, residual convention, method roles, `1e-6` tolerance, diagnostics, and deterministic teaching-row selection.
- Added strict gradient-trace, coefficient, and 3,476-row held-out residual CSV parsing with exact headers, shapes, order, finite values, and arithmetic consistency.
- Returned detached recursively frozen results, rejected unknown output IDs, and exposed typed semantic output/download bindings for all eight preserved linear-regression chapters.
- Proved the boundary against malformed, stale, non-finite, oversized, wrong-order, cross-generation, inventory, hash, locale-parity, selection-role, tie-break, and base-path corruption.

## Task Commits

1. **Task 27-05-01 RED: Establish Wave 0 strict asset and corruption contracts** — `1e07c59` (test)
2. **Task 27-05-02 GREEN: Implement the typed registry, strict parser, and chapter bindings** — `567797d` (feat)

## Files Created/Modified

- `tests/linear-regression-assets.test.ts` — Exact inventory/base scaffold, RED contract, corruption matrix, immutability checks, manifest and CSV validation, chapter binding, and output-dispatch tests.
- `src/data/linearRegressionAssets.ts` — Literal asset descriptors, typed chapter bindings, strict summary/manifest/CSV parsers, exact generated contracts, and detached deep-freeze helpers.

## Decisions Made

- The manifest is an exact identity authority rather than a permissive discovery document: inventory bytes, hashes, roles, locale proofs, source contract, environment, generator, and deterministic selection records must all match.
- Summary and CSV parsing preserve published numerical truth. They validate exact identities, structures, bounds, and arithmetic relationships without silently coercing unknown fields or recomputing a replacement result.
- Every accepted object is copied and recursively frozen so later Vue/course consumers cannot mutate the parsed input or shared publication authority.
- Registry paths stay local, leading-slash data. Consumers resolve them with the existing `withPublicBase` helper; parsers do not own URLs or introduce remote fallbacks.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test Bug] Corrected the residual wrong-order corruption fixture**

- **Found during:** Task 27-05-02 focused GREEN verification
- **Issue:** The intended wrong-order residual mutation targeted a literal that was not present in the first CSV data row, leaving the fixture unchanged and causing its rejection assertion to fail.
- **Fix:** Replaced the first numeric instant generically so the fixture now deterministically violates the locked held-out row order.
- **Files modified:** `tests/linear-regression-assets.test.ts`
- **Verification:** Both strict CSV acceptance/rejection groups and the complete focused suite pass.
- **Committed in:** `567797d`

**2. [Rule 3 - Blocking] Tightened literal inference and removed an unused validation helper**

- **Found during:** Task 27-05-02 production build
- **Issue:** TypeScript widened two nested chapter-binding arrays to `string[]`, and `noUnusedLocals` rejected a superseded boolean helper.
- **Fix:** Preserved nested binding literals with `as const` and removed the unused helper without changing runtime behavior.
- **Files modified:** `src/data/linearRegressionAssets.ts`
- **Verification:** `npm run build` passes.
- **Committed in:** `567797d`

---

**Total deviations:** 2 auto-fixed (1 Rule 1 test bug, 1 Rule 3 blocking TypeScript issue).
**Impact on plan:** Both fixes were confined to the owned test/runtime boundary and were required for trustworthy corruption coverage and a clean production build; no scope or architecture changed.

## Issues Encountered

- The first GREEN focused run exposed the inert wrong-order fixture; after the fixture correction, all 41 focused registry and Notebook tests passed.
- The first production build exposed literal widening and one unused helper; both were resolved inside the owned runtime file and the build passed.
- No package installation, authentication, external service, architectural decision, or checkpoint was required.

## Validation

- Task 27-05-01 public inventory/base scaffold — passed 2/2 before the runtime module existed.
- Task 27-05-01 full RED run — failed only through `ERR_MODULE_NOT_FOUND` for the intentionally absent `src/data/linearRegressionAssets.ts`.
- `node --test tests/linear-regression-assets.test.ts tests/linear-regression-notebook-assets.test.ts` — passed 41/41, including independent offline Notebook reproducibility.
- `npm test` — passed 888/888.
- `npm run build` — passed; Vite production output completed with the repository's existing large-chunk advisory.
- `git diff --check`, source no-`any`/stub/remote scan, exact protected-file SHA-256 checks, and post-commit deletion/untracked-file review — passed.

## Known Stubs

None - all registered runtime data sources, validators, semantic bindings, and corruption cases are complete. Empty or malformed values in tests are intentional rejection fixtures.

## User Setup Required

None - the boundary consumes committed local assets and existing project tooling; no secret, account, registry, or manual action is required.

## Next Phase Readiness

- Plans 27-06/07 can consume typed semantic output IDs, locked summary results, and learner downloads without duplicating paths, hashes, or regression math.
- Plans 27-07/08 can add browser loading through the registry while retaining exact local allowlisting, `withPublicBase` resolution, and fail-closed parser behavior.
- The full repository test suite and production build are green; no blocker or deferred runtime issue remains.

## Self-Check: PASSED

- Both plan-owned implementation/test files and this summary exist.
- Task commits `1e07c59` and `567797d` exist in Git history in RED/GREEN order.
- The registry exposes exactly nine local assets, and focused inventory, manifest, summary, CSV, chapter-binding, immutability, and base-path checks pass.
- Focused tests pass 41/41, the repository suite passes 888/888, the production build passes, and protected pre-existing files retain their starting SHA-256 values.

---
*Phase: 27-linear-regression-rebuild*
*Completed: 2026-07-29*
