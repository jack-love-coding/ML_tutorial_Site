---
stage: python-data-tools-stage-4
slug: english-parity-runtime-refactor
status: ready-for-planning
nyquist_compliant: true
wave_0_complete: false
created: 2026-07-15
---

# Python Data Tools Stage 4 — Validation Strategy

> Stage 4 的执行采样与最终验证契约。实施计划可细化任务编号，但不得降低这里的需求覆盖和构建门槛。

## Test Infrastructure

| Property | Value |
| --- | --- |
| **Framework** | Node 24 built-in test runner + `node:assert/strict` |
| **Config file** | 无独立配置；`package.json` 的 `test` script 执行 `node --test tests/*.test.*` |
| **Quick run command** | `node --test tests/python-data-tools-runtime-*.test.ts` |
| **Full suite command** | `npm test` |
| **Build gates** | `npm run build`、`npm run build:pages` |
| **Estimated quick runtime** | 不高于 10 秒 |
| **Estimated full runtime** | 测试约 5 秒；两种 build 以本机实际输出为准 |

## Sampling Rate

- **每个任务提交后：** 运行该任务对应的单个或最小测试文件；涉及母版或生成物时额外运行 compiler `--check`。
- **每个 wave 完成后：** 由下表指定的最终责任计划运行 `node --test tests/python-data-tools-*.test.ts` 与 `npm test`；责任计划必须等待本 wave 列出的全部计划完成后再执行该 gate。
- **Stage 4 提交前：** 运行 `npm test`、`npm run build`、`npm run build:pages` 和 `git diff --check`。
- **最大快速反馈延迟：** 10 秒；若快速测试超过该值，按内容、路由、输出、页面、Progress 拆分运行。
- **浏览器边界：** Wave 9 在标准 build 的 preview 上只做一次 root/canonical chapter、无 console error 和 next/previous 导航 smoke；完整桌面/移动、跨语言、键盘、reduced-motion 与失败状态矩阵属于 Stage 5。

## Post-Wave Validation Ownership

| Wave | All plans that must be complete | Final validation owner | Required post-wave command | Owner-specific additions |
| ---: | --- | --- | --- | --- |
| 1 | 01, 06, 10 | Plan 10 | `node --test tests/python-data-tools-*.test.ts && npm test` | Focused resolver/purity test and `git diff --check`. |
| 2 | 02, 03 | Plan 03 | `node --test tests/python-data-tools-*.test.ts && npm test` | English non-empty/placeholder and semantic-pair review. |
| 3 | 04 | Plan 04 | `node --test tests/python-data-tools-*.test.ts && npm test` | English scope/semantic review and `git diff --check`. |
| 4 | 05 | Plan 05 | `node --test tests/python-data-tools-*.test.ts && npm test` | `node scripts/python-data-tools/check-paired-masters.mjs`, compiler `--check`, and `git diff --check`. |
| 5 | 07 | Plan 07 | `node --test tests/python-data-tools-*.test.ts && npm test` | Output tests, both builds, lazy-import inspection, and `git diff --check`. |
| 6 | 08 | Plan 08 | `node --test tests/python-data-tools-*.test.ts && npm test` | Focused output tests and both builds. |
| 7 | 09 | Plan 09 | `node --test tests/python-data-tools-*.test.ts && npm test` | Page/prompt/output tests, Pages build, and `git diff --check`. |
| 8 | 11 | Plan 11 | `node --test tests/python-data-tools-*.test.ts && npm test` | Compiler `--check`, focused runtime tests, and `git diff --check`. |
| 9 | 12 | Plan 12 | `node --test tests/python-data-tools-*.test.ts && npm test` | Unconditional full-eight-pair preflight, compiler `--check`, both builds, diff/scope audit, and bounded browser smoke. |

## Requirement Verification Map

| Req | Planned Wave | Secure Behavior | Test Type | Automated Command | Wave 0 File |
| --- | ---: | --- | --- | --- | --- |
| R1 | 1–4/7–9 | 母版预检+投影只传递安全 Markdown；代码/公式/绑定精确对齐 | content/compiler | `node --test tests/python-data-tools-paired-master-preflight.test.ts tests/python-data-tools-runtime-content.test.ts` | `tests/python-data-tools-paired-master-preflight.test.ts`, `tests/python-data-tools-runtime-content.test.ts` |
| R2 | 4/7–9 | 章节只来自 contract allowlist，当前页只渲染一个有效章节 | registration/structure | `node --test tests/python-data-tools-runtime-page.test.ts tests/python-data-tools-runtime-integration.test.ts` | `tests/python-data-tools-runtime-page.test.ts`, `tests/python-data-tools-runtime-integration.test.ts` |
| R3 | 1/8–9 | 纯 resolver 先独立落地；原子切换时 redirect 早于 Progress 写入 | unit/router/integration | `node --test tests/python-data-tools-runtime-routing.test.ts tests/python-data-tools-runtime-integration.test.ts` | `tests/python-data-tools-runtime-routing.test.ts`, `tests/python-data-tools-runtime-integration.test.ts` |
| R4 | 4–9 | manifest/JSON 以 `unknown` 解析后走 typed guards；页面会话仅一次自动载入+一次性手动重载配额，失败局部化 | unit/structure | `node --test tests/python-data-tools-runtime-outputs.test.ts tests/python-data-tools-runtime-page.test.ts` | `tests/python-data-tools-runtime-outputs.test.ts`, `tests/python-data-tools-runtime-page.test.ts` |
| R5 | 1–4/7–9 | 教学提示没有 input、submit、writer、network 或完成状态 | content/negative structure | `node --test tests/python-data-tools-runtime-prompts.test.ts` | `tests/python-data-tools-runtime-prompts.test.ts` |
| R6 | 8–9 | 原子切换提交前新 checkpoint ID、redirect 与旧 attempt/storage key 保留已同时通过 | unit/compatibility | `node --test tests/python-data-tools-runtime-progress.test.ts tests/python-data-tools-runtime-integration.test.ts` | `tests/python-data-tools-runtime-progress.test.ts`, `tests/python-data-tools-runtime-integration.test.ts` |
| R7 | 1–4/8–9 | 负向测试拒绝模型、清洗实现、推断统计、因果、Pyodide、后端和上传入口 | content/negative | `node --test tests/python-data-tools-runtime-content.test.ts tests/python-data-tools-runtime-integration.test.ts` | 与 R1/R2 共用 |
| R8 | 1–9 | 母版投影的双语 title/alt/轴图例/解读/限制/fallback 经页面传入 ResultBlock/Plotly；卸载时 purge | structure/unit/build | `node --test tests/python-data-tools-runtime-page.test.ts tests/python-data-tools-runtime-outputs.test.ts tests/python-data-tools-runtime-integration.test.ts` | 与 R2/R4 共用 |

## Prohibition Verification Map

| Prohibition | Verification |
| --- | --- |
| 不得在 runtime 或组件手抄第二份中文正文、精确统计或输出路径 | compiler/source ownership tests；Vue/TS 负向 source assertions |
| 不得把五个教学提示变成输入、计分、提交、Progress、完成状态或章节门槛 | prompt schema test + SFC source negative assertions + storage/network import assertions |
| 不得把相关写成因果，也不得加入训练、清洗实现或推断统计 | bilingual content boundary tests + semantic review |
| 不得删除或重写现有 Progress/localStorage key 与历史 attempts | old-attempt fixture + V1/V2 key source assertions |
| 不得加入 Pyodide、后端 kernel、上传或任意代码执行 | dependency/source/route negative assertions |

## Wave 0 Requirements

- [ ] `tests/python-data-tools-runtime-content.test.ts` — 中英母版、projection 漂移、R7 负向边界。
- [ ] `tests/python-data-tools-runtime-routing.test.ts` — 五个旧 ID、八个新 ID、未知 ID、redirect 无存储副作用。
- [ ] `tests/python-data-tools-runtime-outputs.test.ts` — manifest guards、资源状态、output adapters、base path、Plotly lifecycle seam。
- [ ] `tests/python-data-tools-runtime-prompts.test.ts` — 五个静态提示及无交互/无副作用约束。
- [ ] `tests/python-data-tools-runtime-page.test.ts` — 专用分页结构、current-only、目录、pager、双语 fallback 与下载入口。
- [ ] `tests/python-data-tools-runtime-progress.test.ts` — 新 checkpoint ID、revisit 与旧 attempt 保留。
- [ ] `tests/python-data-tools-paired-master-preflight.test.ts` — 中英文件名、markers、code bytes、公式、绑定、prompt/result-presentation shape、UTF-8、占位符与可见术语。
- [ ] `tests/python-data-tools-runtime-integration.test.ts` — 原子 route/module/page/checkpoint 切换与源权威链路。

现有 Node test runner 已覆盖基础设施，不新增测试框架或 watch-mode 配置。

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Instructions |
| --- | --- | --- | --- |
| 安装 `plotly.js-basic-dist-min@3.7.0` 前确认官方来源与版本 | R4/R8 | package-legitimacy seam 因版本较新标为 SUS，虽然研究已核对官方仓库与本地 Plotly.py 内嵌版本 | 执行前复核 npm package repository、无 postinstall、版本与 Stage 3 Figure 的 Plotly.js 3.7.0 一致，然后明确批准安装 |
| 页面教学节奏与移动目录的最终视觉品质 | R2/R8 | Node 结构测试与一次 bounded smoke 不能替代完整视觉阅读 | 完整 1280px/390px、跨语言、键盘、reduced-motion 与失败状态矩阵移交 Stage 5 |

## Bounded Stage 4 Browser Smoke

Plan 12 Task 3 owns this single post-integration browser check:

1. Run `npm run build`, then serve the built site with `npm run preview -- --host 127.0.0.1`; do not use test watch mode.
2. With `browser:control-in-app-browser`, open `/learn/python-notebook` and confirm the course renders.
3. Open `/learn/python-notebook/notebook-workflow`; confirm only that canonical chapter article is visible and the browser console has no errors.
4. Use Next to reach `/learn/python-notebook/numpy-foundations`, then Previous to return to `notebook-workflow`.
5. Stop the preview server and record checked URLs, navigation results, and console status in the Plan 12 summary.

This smoke is deliberately bounded. It does not absorb the Stage 5 desktop/mobile, cross-locale, keyboard, reduced-motion, resource-failure, or full visual matrix.

## Validation Sign-Off

- [x] 所有 R1–R8 均有自动化测试入口。
- [x] 任何连续三个任务之间都安排至少一次自动化验证。
- [x] Wave 0 明确列出八个缺失测试文件。
- [x] 不使用 watch-mode 命令。
- [x] 每个 wave 的最终责任计划及 `node --test tests/python-data-tools-*.test.ts` + `npm test` gate 已显式分配。
- [x] Wave 9 包含一次 bounded root/canonical chapter/no-console/basic-navigation browser smoke。
- [x] 快速反馈目标不高于 10 秒。
- [x] `nyquist_compliant: true` 已设置。

**Approval:** ready for plan-checker review
