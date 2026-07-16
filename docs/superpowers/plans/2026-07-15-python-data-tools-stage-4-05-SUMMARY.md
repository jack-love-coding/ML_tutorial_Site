---
phase: python-data-tools-stage-4
plan: "05"
subsystem: curriculum-runtime-content
tags: [python-data-tools, bilingual-content, deterministic-generation, typed-projection, tdd]

requires:
  - phase: python-data-tools-stage-4-02
    provides: complete Chinese authority with eight result presentations and five static prompts
  - phase: python-data-tools-stage-4-03
    provides: English authorities for chapters 1–4
  - phase: python-data-tools-stage-4-04
    provides: English authorities for chapters 5–8
provides:
  - complete read-only eight-pair authoring preflight
  - discriminated bilingual runtime chapter and block contracts
  - deterministic paired-master compiler with read-only check mode
  - generated eight-chapter runtime projection with five prompts and eight result presentations
affects: [python-data-tools-stage-4-07, python-data-tools-stage-4-08, python-data-tools-stage-4-09, python-data-tools-stage-4-11]

tech-stack:
  added: []
  patterns:
    - full-course paired-authority validation before projection
    - generated TypeScript projection with byte-for-byte drift checking
    - localized result and prompt fields parsed from editable Markdown masters

key-files:
  created:
    - scripts/python-data-tools/check-paired-masters.mjs
    - scripts/python-data-tools/build-runtime-content.mjs
    - src/types/pythonDataToolsRuntime.ts
    - src/data/generated/pythonDataToolsRuntime.generated.ts
    - tests/python-data-tools-paired-master-preflight.test.ts
    - tests/python-data-tools-runtime-content.test.ts
    - tests/python-data-tools-runtime-prompts.test.ts
  modified: []

key-decisions:
  - "The authoring preflight always checks all eight locale pairs and deliberately exposes no selected-chapter mode."
  - "Runtime Markdown, code, result presentations, and teaching prompts are projected in source order from paired masters rather than copied into handwritten runtime registries."
  - "Nonvisual JSON results project an explicit empty translation list, while PNG and Plotly results project paired translation rows keyed by stable source labels."

patterns-established:
  - "Diagnostic contract: locale, filename, chapter, marker, and first mismatch are reported without modifying masters or generated targets."
  - "Projection contract: generated content imports a public discriminated union and is reproduced by one deterministic compiler."

requirements-completed: [R1, R2, R5, R7, R8]

coverage:
  - id: D1
    description: All eight Chinese and English authorities pass full-course filename, UTF-8, visible-prose, marker, code, formula, numeric-statement, output-binding, prompt, and result-field checks.
    requirement: R1
    verification:
      - kind: unit
        ref: tests/python-data-tools-paired-master-preflight.test.ts
        status: pass
      - kind: integration
        ref: node scripts/python-data-tools/check-paired-masters.mjs
        status: pass
    human_judgment: false
  - id: D2
    description: Eight chapters compile in contract order to typed localized Markdown, code, result-presentation, and static teaching-prompt blocks.
    requirement: R2
    verification:
      - kind: unit
        ref: tests/python-data-tools-runtime-content.test.ts
        status: pass
      - kind: build
        ref: npm run build
        status: pass
    human_judgment: false
  - id: D3
    description: Five prompts retain complete bilingual reasoning fields and four false policy flags with no interaction or Progress state.
    requirement: R5
    verification:
      - kind: unit
        ref: tests/python-data-tools-runtime-prompts.test.ts#generated projection contains exactly five complete stateless prompts in contract order
        status: pass
    human_judgment: false
  - id: D4
    description: Code bytes, formulas, output ownership, and the descriptive-analysis boundary remain paired and compiler drift is read-only.
    requirement: R7
    verification:
      - kind: integration
        ref: node --test tests/python-data-tools-*.test.ts
        status: pass
      - kind: integration
        ref: node scripts/python-data-tools/build-runtime-content.mjs --check
        status: pass
    human_judgment: false
  - id: D5
    description: Eight result presentations carry bilingual title, alt, translation rows, interpretation, limitation, and fallback summary from the masters.
    requirement: R8
    verification:
      - kind: unit
        ref: tests/python-data-tools-runtime-prompts.test.ts#generated projection contains eight localized result presentations bound to contract results
        status: pass
      - kind: build
        ref: npm run build:pages
        status: pass
    human_judgment: false

duration: 12 min
completed: 2026-07-16
status: complete
---

# Phase Python Data Tools Stage 4 Plan 05: Paired Runtime Content Projection Summary

**Eight bilingual Markdown authorities now compile into one typed, deterministic runtime projection with strict read-only parity diagnostics and no handwritten learner-copy registry.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-07-16T14:59:58Z
- **Completed:** 2026-07-16T15:11:33Z
- **Tasks:** 3
- **Files created:** 7

## Accomplishments

- Added a full-course preflight that validates all eight bilingual pairs together and reports locale/file/chapter/marker context for the first structural or prose mismatch.
- Added public discriminated runtime contracts for localized Markdown, byte-stable Python code, result presentations, and non-interactive teaching prompts.
- Added a deterministic compiler and committed generated projection containing 48 code cells, eight result presentations, and five static prompts in course order.
- Locked normal generation, repeated byte identity, read-only `--check`, malformed fixtures, source ownership, complete tests, production build, and GitHub Pages build.

## Task Commits

Each TDD gate and task outcome was committed atomically:

1. **Task 1 RED: Add failing paired-master preflight tests** — `089454c`
2. **Task 1 GREEN: Build the complete paired-master preflight** — `87ffbf6`
3. **Task 2 RED: Define runtime contracts and failing compiler behaviors** — `f6abb77`
4. **Task 3 GREEN: Implement deterministic paired-master compilation and check mode** — `97568ee`

## Files Created/Modified

- `scripts/python-data-tools/check-paired-masters.mjs` — Read-only full-eight-pair validation and actionable diagnostics.
- `scripts/python-data-tools/build-runtime-content.mjs` — Paired parser, deterministic serializer, generator, and `--check` mode.
- `src/types/pythonDataToolsRuntime.ts` — Public discriminated unions for all projected runtime blocks.
- `src/data/generated/pythonDataToolsRuntime.generated.ts` — Generated eight-chapter bilingual runtime authority.
- `tests/python-data-tools-paired-master-preflight.test.ts` — Temporary-fixture coverage for parity, field shape, encoding, and visible prose.
- `tests/python-data-tools-runtime-content.test.ts` — Chapter ordering, code ownership, fixtures, generated parity, and stale-target checks.
- `tests/python-data-tools-runtime-prompts.test.ts` — Prompt policy, result-presentation completeness, and source-ownership checks.

## Decisions Made

- The preflight is intentionally full-course only; `--chapter` and any equivalent partial-readiness mode are rejected.
- Chapter titles, core questions, Markdown body, prompt explanations, and result presentation copy come from the paired masters. The existing typed contract supplies only ordering and stable IDs/kinds.
- Generated content remains inert Markdown/code strings. Rendering and output loading stay outside this plan and will use the existing safe renderer and later manifest/Plotly plans.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Initial GREEN runs exposed two fixture/parser boundary mistakes in the new tests and prompt section parser. They were corrected before the Task 1 GREEN commit; no product scope or authority file changed.

## Verification

- `node scripts/python-data-tools/check-paired-masters.mjs` — pass: 8 pairs, 48 cells, 8 result presentations, 5 prompts.
- `node --test tests/python-data-tools-runtime-content.test.ts tests/python-data-tools-runtime-prompts.test.ts` — 8/8 passed.
- `node scripts/python-data-tools/build-runtime-content.mjs --check` — passed read-only.
- Repeated normal generation SHA-256 comparison — byte-identical across both regenerations.
- `node --test tests/python-data-tools-*.test.ts` — 83/83 passed.
- `npm test` — 605/605 passed.
- `npm run build` — passed with the existing large-chunk warning.
- `npm run build:pages` — passed with the existing large-chunk warning.
- `git diff --check` — passed.

## Security and Threat Review

- T-PDT4-07 is mitigated by deterministic regeneration, generated-file ownership, full-course validation, and read-only drift checks.
- T-PDT4-08 remains inert: the compiler projects strings only and introduces no HTML execution, network endpoint, file upload, authentication, or storage path.

## Known Stubs

None. Empty axis/legend arrays are intentional required values for nonvisual JSON results, not unfinished UI data.

## User Setup Required

None - no package, external service, secret, or environment change is required by this plan.

## Next Phase Readiness

- Plan 07 can consume the typed output/result IDs after its approved dependency work.
- Plans 08–09 can render the generated result presentations and static prompts without inventing learner copy.
- No runtime page switch, route integration, package installation, output loader, Plotly component, or Stage 5 work was performed here.

## Self-Check: PASSED

- All seven planned files and this summary exist.
- Commits `089454c`, `87ffbf6`, `f6abb77`, and `97568ee` exist in repository history.
- Every task acceptance gate, plan-level verification command, full test suite, production build, Pages build, and whitespace check passes.
- `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/config.json`, and `.planning/REQUIREMENTS.md` were not modified.
- The unrelated untracked `docs/gpt_advice.md` remains unmodified, unstaged, and uncommitted.

---
*Phase: python-data-tools-stage-4*
*Completed: 2026-07-16*
