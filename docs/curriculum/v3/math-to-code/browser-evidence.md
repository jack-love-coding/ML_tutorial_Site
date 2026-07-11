# Math-to-Code Production Browser Evidence

**Date:** 2026-07-11
**Server:** production `vite preview`, `127.0.0.1:4173`
**Probe:** `scripts/qa/mathToCodePilotBrowserMatrix.js`
**Result:** 28 cases, 0 failures; matrix and versioned-completion interactions passed

## Result notation

Every row below reports:

- `HTTP`: document response status;
- `title/lang`: exact localized `h1` and `<html lang>` match;
- `route`: exact route-relative chapter number and previous/next href map;
- `sw/vw`: document scroll width / viewport width;
- `dead`: missing fragments plus empty links;
- `overlap`: overlapping visible interactive element pairs;
- `console`: console errors plus uncaught page errors;
- `warnings`: per-case Playwright console-warning count.

## Per-page matrix

| Module | Locale | Viewport | HTTP | title/lang | route | sw/vw | dead | overlap | console | warnings |
|---|---|---:|---:|---|---|---:|---:|---:|---:|---:|
| Math Lab home | zh-CN | 1440×1000 | 200 | ✓ | dashboard 1..6 / exact hrefs / 0 of 6 ✓ | 1440/1440 | 0 | 0 | 0 | 0 |
| functions | zh-CN | 1440×1000 | 200 | ✓ | next ✓ | 1440/1440 | 0 | 0 | 0 | 0 |
| vectors | zh-CN | 1440×1000 | 200 | ✓ | prev+next ✓ | 1440/1440 | 0 | 0 | 0 | 0 |
| matrices | zh-CN | 1440×1000 | 200 | ✓ | prev+next ✓ | 1440/1440 | 0 | 0 | 0 | 0 |
| derivatives | zh-CN | 1440×1000 | 200 | ✓ | prev+next ✓ | 1440/1440 | 0 | 0 | 0 | 0 |
| NumPy | zh-CN | 1440×1000 | 200 | ✓ | prev+next ✓ | 1440/1440 | 0 | 0 | 0 | 0 |
| studio | zh-CN | 1440×1000 | 200 | ✓ | prev ✓ | 1440/1440 | 0 | 0 | 0 | 0 |
| Math Lab home | zh-CN | 390×844 | 200 | ✓ | dashboard 1..6 / exact hrefs / 0 of 6 ✓ | 390/390 | 0 | 0 | 0 | 0 |
| functions | zh-CN | 390×844 | 200 | ✓ | next ✓ | 390/390 | 0 | 0 | 0 | 0 |
| vectors | zh-CN | 390×844 | 200 | ✓ | prev+next ✓ | 390/390 | 0 | 0 | 0 | 0 |
| matrices | zh-CN | 390×844 | 200 | ✓ | prev+next ✓ | 390/390 | 0 | 0 | 0 | 0 |
| derivatives | zh-CN | 390×844 | 200 | ✓ | prev+next ✓ | 390/390 | 0 | 0 | 0 | 0 |
| NumPy | zh-CN | 390×844 | 200 | ✓ | prev+next ✓ | 390/390 | 0 | 0 | 0 | 0 |
| studio | zh-CN | 390×844 | 200 | ✓ | prev ✓ | 390/390 | 0 | 0 | 0 | 0 |
| Math Lab home | en | 1440×1000 | 200 | ✓ | dashboard 1..6 / exact hrefs / 0 of 6 ✓ | 1440/1440 | 0 | 0 | 0 | 0 |
| functions | en | 1440×1000 | 200 | ✓ | next ✓ | 1440/1440 | 0 | 0 | 0 | 0 |
| vectors | en | 1440×1000 | 200 | ✓ | prev+next ✓ | 1440/1440 | 0 | 0 | 0 | 0 |
| matrices | en | 1440×1000 | 200 | ✓ | prev+next ✓ | 1440/1440 | 0 | 0 | 0 | 0 |
| derivatives | en | 1440×1000 | 200 | ✓ | prev+next ✓ | 1440/1440 | 0 | 0 | 0 | 0 |
| NumPy | en | 1440×1000 | 200 | ✓ | prev+next ✓ | 1440/1440 | 0 | 0 | 0 | 0 |
| studio | en | 1440×1000 | 200 | ✓ | prev ✓ | 1440/1440 | 0 | 0 | 0 | 0 |
| Math Lab home | en | 390×844 | 200 | ✓ | dashboard 1..6 / exact hrefs / 0 of 6 ✓ | 390/390 | 0 | 0 | 0 | 0 |
| functions | en | 390×844 | 200 | ✓ | next ✓ | 390/390 | 0 | 0 | 0 | 0 |
| vectors | en | 390×844 | 200 | ✓ | prev+next ✓ | 390/390 | 0 | 0 | 0 | 0 |
| matrices | en | 390×844 | 200 | ✓ | prev+next ✓ | 390/390 | 0 | 0 | 0 | 0 |
| derivatives | en | 390×844 | 200 | ✓ | prev+next ✓ | 390/390 | 0 | 0 | 0 | 0 |
| NumPy | en | 390×844 | 200 | ✓ | prev+next ✓ | 390/390 | 0 | 0 | 0 | 0 |
| studio | en | 390×844 | 200 | ✓ | prev ✓ | 390/390 | 0 | 0 | 0 | 0 |

## Exact command result

The committed matrix probe was invoked with:

```bash
export PWCLI="${CODEX_HOME:-$HOME/.codex}/skills/playwright/scripts/playwright_cli.sh"
export PLAYWRIGHT_CLI_SESSION=math-to-code-task8-review
"$PWCLI" run-code --filename scripts/qa/mathToCodePilotBrowserMatrix.js
```

The top-level returned object was:

```json
{"cases":28,"failures":0,"interactions":{"matrixAContract":true,"matrixLocalOnly":true,"versionedCompletion":true}}
```

Each result object also contained the exact title, route-relative chapter order, exact route hrefs, widths, empty arrays for `deadFragments`, `emptyLinks`, `overlaps`, `consoleErrors`, and `consoleWarnings`, plus `warningCount: 0`. Interaction output recorded the exact six route completion IDs for `math-to-code-v1`. This is local reviewed-version state, not formal acceptance or assessment.
