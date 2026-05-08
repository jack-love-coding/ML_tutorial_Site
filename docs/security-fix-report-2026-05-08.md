# 安全修复报告 - 2026-05-08

## 背景

本次修复针对 2026-05-08 代码扫描中确认的两类风险：

- Markdown 渲染链路允许原始 HTML，并通过 `v-html` 注入页面，存在 XSS 风险。
- `npm audit` 报告 Vite `8.0.0 - 8.0.4` 高危漏洞和 PostCSS `<8.5.10` 中危 XSS 漏洞。

## 修复内容

- Markdown 渲染新增 `sanitize-html` 白名单清洗。
  - 保留教学内容需要的 `details`、`summary`、`img`、`a`、表格、代码块、`div`、`span` 等标签。
  - 过滤 `script`、`iframe`、`style` 等危险标签。
  - 移除 `on*` 事件属性、`style` 属性和 `javascript:` / `data:` 等危险 URL。
  - KaTeX HTML 仍由本地 renderer 生成并作为可信内容回填，避免破坏公式显示。
- 依赖更新。
  - Vite 升级到 `8.0.11`。
  - PostCSS lockfile 解析到 `8.5.14`。
  - 新增 `sanitize-html@^2.17.3` 和 `@types/sanitize-html@^2.16.1`。
- 外部内容导入脚本加固。
  - CS357 教材源从浮动 `main` 固定到 commit `1f20018699108d8233535d645e856185db8fdd03`。
  - GitHub Contents API 和 raw URL 使用同一固定 ref。
- 项目脚本补充。
  - 新增 `npm run test`。
  - 新增 `npm run security:audit`，强制使用官方 npm registry 运行审计。

## 验证结果

- `npm run test`
  - 结果：通过。
  - 覆盖：29 个测试全部通过，包含新增 Markdown XSS 回归测试。
- `npm run build`
  - 结果：通过。
  - 备注：仍有 Vite chunk size warning，属于体积提示，不是本次安全阻断项。
- `npm run security:audit`
  - 结果：通过。
  - 输出：`found 0 vulnerabilities`。

## 剩余风险和注意事项

- 当前策略信任 KaTeX 本地渲染输出；如果以后开启 KaTeX `trust` 或允许用户提交公式，需要重新评估公式 HTML 安全面。
- `sanitize-html` 会增加 Markdown 相关 bundle 体积；如后续关注性能，可单独做代码分割优化。
- 本次范围不清理已提交的 `output/playwright` 截图产物。
