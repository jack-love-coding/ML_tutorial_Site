# ML Atlas

ML Atlas 是基于 Vue 3、TypeScript、Vite 的 AI 课程辅助教材，面向编程和数学基础较弱的学生。保留双语讲解、可视化、交互实验、Notebook、参考代码与运行结果。

## 学习入口

首页 `/` 提供固定的开始阅读入口。`/spine` 按六个单元组织主线：

1. AI 与代码入门
2. 从数据到模型输入
3. 第一个可解释模型
4. 理解泛化并复现回归案例
5. 从概率到分类决策
6. 比较模型与分类案例

主线按单元逐批试用，当前状态以 `/spine` 的标签和 `src/curriculum/reading.ts` 为准；预览课程和专题资源均可访问。`/library/*` 保存完整数学、数据、模型与深度学习专题，`/tracks/project-practice` 提供项目案例。原 `/courses/ai-foundation` 的 25 单元大纲保留为扩展参考，已编写的 14 个单元继续可读。

学生界面不提供考核、个人报告或进度统计，不自动记录阅读和实验行为。历史学习存储保持原样；实验参数使用内存，语言偏好继续保存。`/progress` 和 `/math-lab/diagnostic` 分别跳转到路线与数学专题库。旧课程深链及 `/python` 仍可使用。

## 维护与验证

课程内容、目录生成规则和分阶段记录见 [辅助教材维护入口](docs/textbook-maintenance.md)。当前批次、验收与回退版本见 [六单元发布记录](docs/releases/textbook-refactor-release.md)；[首批试用记录](docs/releases/textbook-pilot-2026-10-03.md) 保留为历史资料。

```bash
npm ci
npm run dev
npm test
npm run build
npm run build:pages
npm run curriculum:check
npm run loss:display:check
npm run test:published-assets
npm run browser:install
npm run browser:check
npm run test:textbook:browser
npm run security:audit
```

`build:pages` 自动生成所有课程与章节的静态入口。正文仍按需加载；修改正文元数据后运行 `npm run curriculum:generate`，修改损失函数发布结果后运行 `npm run loss:display:generate`。

普通 CI 验证已发布文件、来源清单、哈希、引用和浏览器行为。`npm run test:offline-notebooks` 单独验证 Notebook 离线重生成，需要匹配的 Python 环境、wheelhouse、源数据及 staging 缓存；默认测试中跳过的离线项不能视为通过。固定版本、环境合同、缓存检查和本次严格验收见 [可复现验证](docs/reproducible-validation.md)。

新增数学或数据计算必须补充测试，内容须同时提供 `zh-CN` 和 `en`。公开路径必须兼容 Pages 的 `BASE_URL`。不要提交 `node_modules/`、`dist/`、`.cache/`、`.playwright-cli/` 和临时截图。
