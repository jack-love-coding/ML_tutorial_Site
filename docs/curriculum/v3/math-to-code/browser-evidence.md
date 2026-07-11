# Math-to-Code Production Browser Evidence

**Date:** 2026-07-11
**Server:** production `vite preview`, `127.0.0.1:4173`
**Probe:** `scripts/qa/mathToCodePilotBrowserMatrix.js`
**Result:** 24 cases, 0 failures

## Result notation

Every row below reports:

- `HTTP`: document response status;
- `title/lang`: exact localized `h1` and `<html lang>` match;
- `route`: expected previous/next count plus successful HTTP 200 `HEAD` probes;
- `sw/vw`: document scroll width / viewport width;
- `dead`: missing fragments plus empty links;
- `overlap`: overlapping visible interactive element pairs;
- `console`: console errors plus uncaught page errors.

## Per-page matrix

| Module | Locale | Viewport | HTTP | title/lang | route | sw/vw | dead | overlap | console |
|---|---|---:|---:|---|---|---:|---:|---:|---:|
| functions | zh-CN | 1440×1000 | 200 | ✓ | next ✓ | 1440/1440 | 0 | 0 | 0 |
| vectors | zh-CN | 1440×1000 | 200 | ✓ | prev+next ✓ | 1440/1440 | 0 | 0 | 0 |
| matrices | zh-CN | 1440×1000 | 200 | ✓ | prev+next ✓ | 1440/1440 | 0 | 0 | 0 |
| derivatives | zh-CN | 1440×1000 | 200 | ✓ | prev+next ✓ | 1440/1440 | 0 | 0 | 0 |
| NumPy | zh-CN | 1440×1000 | 200 | ✓ | prev+next ✓ | 1440/1440 | 0 | 0 | 0 |
| studio | zh-CN | 1440×1000 | 200 | ✓ | prev ✓ | 1440/1440 | 0 | 0 | 0 |
| functions | zh-CN | 390×844 | 200 | ✓ | next ✓ | 390/390 | 0 | 0 | 0 |
| vectors | zh-CN | 390×844 | 200 | ✓ | prev+next ✓ | 390/390 | 0 | 0 | 0 |
| matrices | zh-CN | 390×844 | 200 | ✓ | prev+next ✓ | 390/390 | 0 | 0 | 0 |
| derivatives | zh-CN | 390×844 | 200 | ✓ | prev+next ✓ | 390/390 | 0 | 0 | 0 |
| NumPy | zh-CN | 390×844 | 200 | ✓ | prev+next ✓ | 390/390 | 0 | 0 | 0 |
| studio | zh-CN | 390×844 | 200 | ✓ | prev ✓ | 390/390 | 0 | 0 | 0 |
| functions | en | 1440×1000 | 200 | ✓ | next ✓ | 1440/1440 | 0 | 0 | 0 |
| vectors | en | 1440×1000 | 200 | ✓ | prev+next ✓ | 1440/1440 | 0 | 0 | 0 |
| matrices | en | 1440×1000 | 200 | ✓ | prev+next ✓ | 1440/1440 | 0 | 0 | 0 |
| derivatives | en | 1440×1000 | 200 | ✓ | prev+next ✓ | 1440/1440 | 0 | 0 | 0 |
| NumPy | en | 1440×1000 | 200 | ✓ | prev+next ✓ | 1440/1440 | 0 | 0 | 0 |
| studio | en | 1440×1000 | 200 | ✓ | prev ✓ | 1440/1440 | 0 | 0 | 0 |
| functions | en | 390×844 | 200 | ✓ | next ✓ | 390/390 | 0 | 0 | 0 |
| vectors | en | 390×844 | 200 | ✓ | prev+next ✓ | 390/390 | 0 | 0 | 0 |
| matrices | en | 390×844 | 200 | ✓ | prev+next ✓ | 390/390 | 0 | 0 | 0 |
| derivatives | en | 390×844 | 200 | ✓ | prev+next ✓ | 390/390 | 0 | 0 | 0 |
| NumPy | en | 390×844 | 200 | ✓ | prev+next ✓ | 390/390 | 0 | 0 | 0 |
| studio | en | 390×844 | 200 | ✓ | prev ✓ | 390/390 | 0 | 0 | 0 |

## Exact command result

The committed matrix probe was invoked with:

```bash
export PWCLI="${CODEX_HOME:-$HOME/.codex}/skills/playwright/scripts/playwright_cli.sh"
export PLAYWRIGHT_CLI_SESSION=math-to-code-task8-review
"$PWCLI" run-code --filename scripts/qa/mathToCodePilotBrowserMatrix.js
```

The top-level returned object was:

```json
{"cases":24,"failures":0}
```

Each result object also contained the exact title, route hrefs and response statuses, widths, and empty arrays for `deadFragments`, `emptyLinks`, `overlaps`, and `consoleErrors`. The script throws with the complete failing objects when any array becomes nonempty or a scalar contract changes.
