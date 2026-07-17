---
phase: python-data-tools-stage-5
status: planned
nyquist_compliant: true
created: 2026-07-17
---

# Python Data Tools Stage 5：验证策略

## 验证原则

Stage 5 是发布验证阶段，测试数量本身不是目标。每个 gate 必须证明一条学习者或发布行为，并尽量复用现有测试、生成器和浏览器能力。

验证按四层推进，后一层只在前一层通过后开始：

1. **权威来源层**：母版、runtime、Notebook、输出和 manifest 的结构与 hash。
2. **运行时行为层**：按章请求、局部 fallback、路由、locale 与 Progress 边界。
3. **真实浏览器层**：双语、尺寸、键盘、reduced motion 和失败注入。
4. **发布产物层**：标准 base、Pages base、SPA fallback、资源可达性和安全审计。

## Requirement Verification Map

| Req | 主要证明 | 自动命令或记录 | 责任计划 |
|---|---|---|---:|
| S5-R1 | 可见术语与代码命名收口 | paired/runtime tests + DOM text scan | 01、03 |
| S5-R2 | 单一权威链路与字节稳定 | preflight、compiler、Notebook/output verifier、重复生成 hash | 01、02 |
| S5-R3 | 双语结构与教学边界 | content tests + locale browser cells | 02、03 |
| S5-R4 | 响应式真实浏览器矩阵 | Stage 5 matrix record | 03 |
| S5-R5 | 六类失败状态与请求预算 | route interception record + focused output tests | 02、03 |
| S5-R6 | 路由、回顾、Progress 回归 | routing/progress/integration tests + storage snapshots | 02、03 |
| S5-R7 | 标准与 Pages 发布产物 | both builds + fallbacks + two-base browser smoke | 04 |
| S5-R8 | 可审计发布记录 | Plan 04 summary and scope audit | 04 |

## 快速反馈命令

每个编辑任务先运行最小相关命令，不使用 watch mode：

```bash
node scripts/python-data-tools/check-paired-masters.mjs
node scripts/python-data-tools/build-runtime-content.mjs --check
node --test tests/python-data-tools-runtime-content.test.ts tests/python-data-tools-paired-master-preflight.test.ts
node --test tests/python-data-tools-runtime-outputs.test.ts tests/python-data-tools-runtime-page.test.ts
node --test tests/python-data-tools-runtime-routing.test.ts tests/python-data-tools-runtime-progress.test.ts tests/python-data-tools-runtime-integration.test.ts
```

涉及 Notebook/output 再运行：

```bash
.python-data-tools-venv/bin/python scripts/python-data-tools/verify-authoritative-outputs.py
.python-data-tools-venv/bin/python scripts/python-data-tools/generate-authoritative-outputs.py --check
node scripts/python-data-tools/verify-bike-sharing.mjs
```

若锁定 venv 不存在或版本不匹配，Plan 01 必须按 `public/notebooks/python-data-tools/requirements.txt` 重建，不得回退使用不受控的系统环境。

## 浏览器矩阵计数

核心矩阵共 36 个单元：

- 16 个全章节桌面单元：8 chapters × 2 locales。
- 8 个平板单元：4 risk chapters × 2 locales。
- 8 个手机单元：4 risk chapters × 2 locales。
- 4 个 Plotly 专项单元：2 viewport × 2 locales。

Reduced-motion 两个 locale 检查和六类失败注入作为专项 gate 另记，不重复计入 36。

每个核心单元记录以下字段：

| 字段 | 判定 |
|---|---|
| `url` | canonical chapter URL，Pages 时包含 base |
| `locale` | `zh-CN` 或 `en` |
| `viewport` | 精确宽高 |
| `chapterId` | DOM `data-section-id` 等于 URL 章节 |
| `articleCount` | 恰好 1 |
| `consoleErrors` | 0 |
| `pageErrors` | 0 |
| `failedRequests` | 0（失败注入单元除外） |
| `overflowX` | `documentElement.scrollWidth <= clientWidth` |
| `visibleInternalTerms` | 0 个 `证据/evidence/manifest/output` 学习者标签 |
| `progressMutation` | 无（课程回顾提交单元除外） |

## 失败注入矩阵

| ID | 拦截 | 预期请求 | 预期页面 |
|---|---|---|---|
| F1 | manifest → 404 | manifest 一次；手动后最多再一次 | 正文可读、下载不可用、一次 reload |
| F2 | 当前 JSON → 500 | manifest + 当前 JSON | 单结果错误，其他内容可读 |
| F3 | 当前 PNG → abort | manifest + PNG；触发 error 后才请求 fallback JSON | 无 broken image，文字和表格 fallback |
| F4 | Plotly Figure JSON → invalid JSON | manifest + Figure JSON；不请求 Plotly chunk | 静态说明或等价表格 |
| F5 | Plotly chunk/render 抛错 | manifest + Figure JSON + chunk | 无未处理异常，静态 fallback |
| F6 | 首章结果延迟后快速跳章 | 两章各自 manifest/主输出边界 | 新章无旧章 stale 结果 |

## Pages 验证

Pages 验证不能把 Pages build 放在根 URL 预览。正确流程：

1. `npm run build:pages`。
2. `node scripts/create-pages-fallbacks.mjs`。
3. 从 `/ML_tutorial_Site/` base 打开页面。
4. 检查根课程、一个 canonical deep link、一个 legacy deep link和第七章 Plotly。
5. 检查 Network 中 Python Data Tools 的 JS、CSS、manifest、Notebook、environment、JSON/PNG/font/Plotly 请求均带 base 且无 404。

标准 build 随后必须重新生成，防止把 Pages-mode `dist` 误当作根路径产物。

## Wave Gates

| Wave | 完成计划 | Gate |
|---:|---|---|
| 1 | 01 | paired preflight、runtime compiler、Notebook/output verifier、focused content tests、diff check |
| 2 | 02 | Python Data Tools 全套测试、重复生成/hash 审计、路由/Progress/request 边界 |
| 3 | 03 | 36 核心单元、reduced motion、六类失败注入；所有失败修复后原单元复测 |
| 4 | 04 | `npm test`、两个 build、Pages fallback、two-base browser smoke、安全审计、scope audit |

## 最终 Gate

```bash
node scripts/python-data-tools/check-paired-masters.mjs
node scripts/python-data-tools/build-runtime-content.mjs --check
node scripts/python-data-tools/verify-bike-sharing.mjs
.python-data-tools-venv/bin/python scripts/python-data-tools/verify-authoritative-outputs.py
.python-data-tools-venv/bin/python scripts/python-data-tools/generate-authoritative-outputs.py --check
node --test tests/python-data-tools-*.test.ts
npm test
npm run build
npm run build:pages
node scripts/create-pages-fallbacks.mjs
npm run security:audit
git diff --check
```

最终浏览器记录与命令结果必须写入 `2026-07-17-python-data-tools-stage-5-04-SUMMARY.md`。只有上述 gate 全绿后，`.planning/ROADMAP.md` 和 `.planning/STATE.md` 才能把 Stage 5 标为完成。

## 不采用的验证方式

- 不安装 Playwright/Cypress 依赖或新建通用 E2E 框架。
- 不使用截图像素 diff；截图可以辅助定位，但不能替代文本与行为断言。
- 不把 8×2×3 全排列扩大为 48 个重复阅读单元；多尺寸集中覆盖高风险章节。
- 不通过放宽 manifest schema、忽略 hash 或移除测试解决可复现性失败。
- 不访问远程生产站点作为唯一发布依据；本阶段的确定性 gate 基于本地构建产物。

---

*Validation strategy: Python Data Tools Stage 5*
