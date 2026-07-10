# Phase 24A Summary: Navigation and Topic Library

**Date:** 2026-07-10

## What Changed

- Added `src/curriculum/library.ts` as the typed, bilingual Topic Library domain contract shared by the library view, global navigation, and router validation.
- Added invalid-domain handling so unsupported `/library/:domain` values redirect to `/library/math`.
- Simplified the learner-facing global navigation to Home, Default Spine, Topic Library, Projects, and Progress. Default Spine, Projects, and Progress are direct links; Topic Library exposes only Math, Data, Models and Training, and Deep Learning category links rather than the full module inventory.
- Replaced “支持镜头” with “专题学习” / “Topic Library” only in the Phase 24A header and Topic Library navigation-discovery layer.
- Extracted `SiteHeader.vue`, `SiteNavigation.vue`, and their rendered navigation types from `AppShell.vue`, while keeping desktop and mobile navigation on one localized rendered model.
- Restored keyboard and focus behavior: Escape closes the Topic Library dropdown and returns focus to its trigger; mobile route activation closes the menu and returns focus to the mobile-menu button.
- Consolidated header, dropdown, mobile-navigation, and locale-switch layout ownership in `src/styles/layout/site-header.css`; preserved a transparent secondary Progress treatment at 390px.

## Traceability

| Phase 24A requirement | Delivered evidence |
| --- | --- |
| Rename the scoped learner-facing topic entry | Navigation renders “专题学习” / “Topic Library.” |
| Reduce the Topic Library menu | The shared navigation model exposes exactly four domain links and no course-module inventory. |
| Make primary destinations direct links | Default Spine routes to `/spine`, Projects to `/tracks/project-practice`, and Progress to `/progress`. |
| Extract header/navigation responsibilities | `AppShell.vue` delegates to `SiteHeader.vue`; desktop and mobile instances consume `SiteNavigation.vue`. |
| Redirect invalid library domains | `/library/not-a-domain` resolves to `/library/math`. |
| Preserve responsive and keyboard behavior | Source tests and supplied desktop/390px browser acceptance cover Escape, focus return, menu closure, overflow, and locale labels. |

## Non-Goals Preserved

- No homepage focus redesign or readiness-checklist removal; that remains Phase 24B work.
- No Spine progressive-disclosure or hash-navigation work; that remains Phase 24C work.
- Existing homepage discovery copy remains intentionally unchanged for Phase 24B, and existing Curriculum Spine terminology remains intentionally unchanged for Phase 24C. Neither Phase 24B nor Phase 24C has started.
- No changes to course bodies, checkpoints, catalog roles, Curriculum Spine order, Progress V1/V2 storage, or canonical and legacy course routes.
- No broad CSS cleanup outside the header/navigation selectors owned by this phase.
- No backend, database, account, or durable-progress expansion.

## Verification

- `node --test tests/curriculumMilestoneAudit.test.ts`: RED before planning records (5 passed, 1 failed on the missing Phase 24A summary), then GREEN after the records were added (6 passed, 0 failed).
- Final review fixes used a fresh TDD cycle: the focused navigation suite first failed exactly on duplicate `/library/project` ownership and the stray responsive header selectors (10 passed, 2 failed), then passed after the minimal fixes (12 passed, 0 failed).
- Focused curriculum/navigation/layout verification: pass, 34 tests, 0 failures.
- `npm test`: pass, 296 tests, 0 failures.
- `npm run build`: pass with Vite 8.0.16; 2399 modules transformed; the existing warning reports chunks larger than 1400 kB after minification.
- `npm run build:pages`: pass with Vite 8.0.16; 2399 modules transformed; the same existing chunks-larger-than-1400-kB warning remains.
- `git diff --check`: pass, no whitespace errors.

### Browser Acceptance Supplied by the Main Agent

The task implementation agent did not run these browser checks. The main agent supplied the following acceptance evidence from local Vite at `http://127.0.0.1:5174`:

- Desktop 1280×900: `/`, `/spine`, `/library/math`, `/tracks/project-practice`, and `/progress` each had `scrollWidth === clientWidth === 1280`, rendered a normal `h1`, and reported 0 console errors.
- `/library/not-a-domain` ended at `/library/math` with `h1` “数学专题”.
- The desktop Topic Library showed only 数学专题, 数据专题, 模型与训练, and 深度学习. After Escape, `aria-expanded=false` and focus returned to the “专题学习” button.
- Mobile 390×844: the same five routes each had `scrollWidth === clientWidth === 390` and reported 0 console errors.
- The mobile menu and Topic Library expanded with all four domains. Escape closed the menu and returned focus to “打开导航菜单”; selecting Default Spine navigated to `/spine` and also returned focus to the mobile-menu button.
- At 390px, the Progress secondary link's computed background was transparent: `rgba(0, 0, 0, 0)`.
- After switching to English, the menu contained Home, Default Spine, Topic Library, Projects, and Progress; the mobile button read “Open navigation menu”.

## Next Phase

Phase 24B Homepage Focus is the next planned phase. It has not started and must begin from Phase 24A as a merged or explicitly reviewed stacked base. Phase 24C Spine Progressive Disclosure also has not started and follows the separately approved phase boundary.
