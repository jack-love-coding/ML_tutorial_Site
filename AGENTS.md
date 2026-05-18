# ML Tutorial Site 开发规则与目标

本文件适用于整个仓库。后续代理和开发者在本项目中工作时，应优先遵守这里的项目目标、架构边界和验收规则。

## 项目目标

这个项目是一个基于 Vue 3、TypeScript、Vite 的机器学习教学站点，当前品牌与导航围绕 `ML Atlas` 展开。核心目标不是堆叠公式或静态文章，而是用可视化、交互实验、双语讲解和可复现实验帮助学习者理解：

- ML/AI 中常见数学概念的直觉，例如向量、矩阵、Taylor 展开、优化、概率、SVD、PCA、自动微分和深度架构数学。
- 数据处理如何影响模型输入，包括数值特征、类别特征、清洗、EDA、数据划分、复杂度和正则化。
- 模型训练行为如何出现，例如 loss 下降、震荡、发散、过拟合、阈值变化、分类指标变化和隐藏层表征变化。
- 公式、图像、数值例子、代码和模型行为之间的一致关系。

优先级始终是：

1. 教学闭环完整性高于单点动画精致度。
2. 数学与代码一致性高于页面数量。
3. 可测试、可复现、可维护高于快速堆功能。
4. 移动端可读和无障碍 fallback 高于复杂视觉效果。

## 技术栈与主要目录

- 前端框架：Vue 3 + TypeScript + Vite。
- 状态与路由：Pinia、Vue Router。
- 可视化：D3、Three.js、Manim 预渲染视频和 SVG/Canvas。
- 数学与富文本：KaTeX、markdown-it、sanitize-html。
- 测试：Node test runner，命令为 `npm test`。

主要目录职责：

- `src/data/`：顶层算法课程模块定义，例如 loss functions、gradient descent、linear regression、classification、MLP。
- `src/modules/math-lab/`：数学直觉实验室，包括 typed schema、课程数据、页面、通用组件、交互 lab 和数学工具函数。
- `src/modules/data-lab/`：数据实验室，包括 typed schema、课程数据、页面、数据处理 lab 和视觉资产定义。
- `src/simulations/`：顶层算法教学模块的可复现实验与训练模拟逻辑。
- `src/utils/`：跨模块工具，例如数学、路径、markdown math、安全渲染和数据集工具。
- `src/styles/`：全局 tokens、reset、layout、shared primitives、模块样式和必要 overrides。
- `public/`：公开静态资源，包括 generated images、Manim 视频、SVG poster、图标和迁移来的课程图片。
- `tests/`：单元测试、布局/结构测试和内容导入测试。
- `scripts/`：内容导入、fallback 生成和 Manim 渲染脚本。
- `docs/`：计划、来源记录、修复报告和内容导入说明。

## 内容与课程开发规则

- 新增或修改课程内容时，优先使用现有 typed schema，不要临时拼接无类型对象。
- 双语文案使用项目已有的 `LocalizedCopy` 结构，必须同时提供 `'zh-CN'` 和 `en`。
- `math-lab` 内容遵循 `src/modules/math-lab/types/mathLab.ts` 中的 `MathLabModule`、`MathConcept`、`VisualAsset`、`LabConfig`、`QuizItem` 和 `Misconception`。
- `data-lab` 内容遵循 `src/modules/data-lab/types/dataLab.ts` 中的 `DataLabModule`、`DataConcept`、`DataVisualAsset`、`DataLabConfig`、`DataQuizItem` 和 `DataMisconception`。
- 顶层算法课程遵循 `src/types/ml.ts` 中的 `AlgorithmModuleDefinition`、`StorySection`、`ExperimentControl`、`ExperimentPreset` 和 `TrainingSnapshot`。
- 每个教学模块都应形成学习闭环：核心问题、数学/数据概念、可视化或实验、数值/代码连接、误区反馈、checkpoint、下一步路径。
- 公式、变量解释、代码示例和交互实验中的变量名称必须保持一致。
- 测验反馈不能只给“正确/错误”，应说明原因、关联误区，并指向可复看的视觉或章节。
- 引用外部资料或迁移内容时，在 `docs/` 中保留来源记录，静态资源优先迁入 `public/` 并使用本地路径。

## 组件与状态规则

- Vue 单文件组件优先使用 `<script setup lang="ts">`。
- 组件负责状态组合、用户交互和展示，不要把核心数学计算直接写在模板或大型组件中。
- 数学计算、评分逻辑、数据变换和训练模拟应放在 `src/modules/*/utils/`、`src/simulations/` 或 `src/utils/`，并配套测试。
- 复用现有组件模式，例如 `ManimPlayer`、`CheckpointQuiz`、`CodeLab`、`ThreeSceneShell`、`LearningPathMap`、`DataVisualFigure` 和 `DataTableView`。
- 页面级组件负责布局和模块组装，避免承载过多算法细节。
- 路由改动必须保持 lazy import 模式，避免把大型 lab 或 Three.js 页面同步打进初始 bundle。
- 交互控件应有清晰标签、当前值、重置方式和键盘可用性。

## Three.js、D3、Manim 与静态资源规则

- Three.js 交互必须通过现有 `ThreeSceneShell` 控制器模式管理生命周期：`mount(el)`、可选 `update(params)`、`dispose()`。
- Three.js 场景卸载时必须释放 renderer、geometry、material、texture、animation frame 和事件监听。
- 对移动端或低性能设备，复杂 3D lab 必须提供较低密度、静态图或文字 fallback。
- D3 可用于确定性 SVG/Canvas 图表，数据推导应独立于 DOM 操作，便于测试。
- Manim 资产应由 `scripts/manim/` 下的脚本维护，并同步更新对应 `public/manim/**/metadata.json`。
- 公开资源路径使用以 `/` 开头的 public 路径，并通过现有 `withPublicBase` 或相邻模式兼容 GitHub Pages 的 `BASE_URL`。
- 不要直接引用本机绝对路径、临时输出路径或远程图片作为运行时课程资产。
- 不要修改与任务无关的 generated 图片。若工作区中已有 `public/data-lab/generated/*.png` 变更，视为用户或其他流程的工作，除非任务明确要求，否则不要触碰。

## 样式与前端体验规则

- 不引入新的 UI 框架。优先复用 `src/styles/foundation/tokens.css`、layout 样式、shared primitives 和已有 module CSS。
- 新样式应放在对应模块样式文件或清晰的 shared/foundation/layer 位置，不要把大量全局样式塞进组件。
- 教学页面应保持清晰、科学、低认知负担、高对比度和公式可读性。
- 卡片、面板和实验台布局要服务学习任务，不做纯装饰堆叠。
- 移动端必须可读，交互区域不能重叠，长文本不能溢出按钮或关键面板。
- 颜色不能作为唯一信息来源；分类、状态和错误必须有文本、形状或标签辅助。
- 动画和视频应考虑 reduced motion，关键教学信息不能只存在于动画中。

## 安全与渲染规则

- Markdown 和公式内容必须走 `src/utils/markdownMath.ts` 的安全渲染路径或相邻既有封装。
- 不要绕过 `sanitize-html` 输出任意 raw HTML。
- 禁止在课程内容中加入可执行脚本、内联事件处理器或不受控 iframe。
- 外部链接、图片 alt、视频 transcript、公式变量解释和来源说明应保持可审计。
- 涉及用户输入的 lab 必须限制输入范围、处理 NaN/Infinity，并为异常状态提供可理解反馈。

## 测试与验收规则

常用命令：

- 安装依赖后运行测试：`npm test`
- 类型检查与生产构建：`npm run build`
- GitHub Pages 构建：`npm run build:pages`
- 本地开发：`npm run dev`
- 预览构建产物：`npm run preview`
- 安全审计：`npm run security:audit`

开发验收要求：

- 修改数学工具、评分、数据变换、模拟逻辑时，必须新增或更新对应 `tests/*.test.*`。
- 修改路由、模块注册、资源路径或页面结构时，应更新布局/结构类测试。
- 修改 Markdown/公式渲染、安全 sanitizer 或 public path 时，应覆盖恶意 HTML、公式分隔符和 GitHub Pages base path 场景。
- 修改 Three.js lab 时，应验证 `dispose()` 生命周期，并检查移动端或 fallback 行为。
- 修改课程内容时，应至少检查中英文文案完整、公式渲染、资源存在、quiz answer 可由内容推导。
- 文档-only 改动不需要运行完整构建，但必须检查文件存在、无未完成内容、路径和命令与当前仓库一致。

## 工作区与 Git 规则

- 开始前查看 `git status --short`，明确已有未提交改动。
- 不要 revert、覆盖或格式化与当前任务无关的文件。
- 不要用 `git reset --hard`、`git checkout --` 等破坏性命令，除非用户明确要求。
- 手工编辑文件优先使用补丁方式，保持改动可审查。
- 不要把 `node_modules/`、`dist/`、`.cache/`、`.playwright-cli/`、临时截图或无关输出加入版本控制。
- 若任务涉及提交，提交前先确认 diff 只包含本任务范围。

## Definition of Done

一次项目改动完成前，至少确认：

- 改动符合本文件的项目目标和目录职责。
- 新增内容有 typed schema、双语文案、资源路径和教学闭环。
- 核心计算逻辑有测试，视觉/布局改动有结构或浏览器验证。
- `npm test` 和必要的 `npm run build` 或 `npm run build:pages` 已按改动风险执行。
- 没有无关文件修改，没有覆盖用户已有工作。
- 最终说明列出改动文件、验证命令和未运行的检查。
