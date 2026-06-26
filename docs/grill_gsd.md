最有效的分工是：

* **`$grill-me` 负责消除高风险决策的不确定性**：一次问一个关键问题，并给出推荐答案，直到方案足够明确；它不负责大规模写代码。
* **`$gsd-*` 负责把已明确的方案转成可追踪的需求、阶段、计划、代码、验证和 PR**。GSD 当前采用 Discuss → Plan → Execute → Verify → Ship 的阶段循环。

不要在一个模糊提示词里同时让两个 skill “分析并重构整个项目”。正确顺序是：

```text
GSD 映射代码库
→ grill-me 决定产品和架构边界
→ GSD 建立 roadmap
→ 每个高风险 phase 再用 grill-me
→ GSD plan / execute / verify / ship
```

## 1. 先确认安装的是当前版本

当前维护中的 GSD 已迁移到 `open-gsd/gsd-core`；旧的 `gsd-build/get-shit-done` 仓库已经归档。

在仓库根目录运行：

```bash
codex --version
npx @opengsd/gsd-core@latest --codex --global
codex --reload
```

GSD 的 Codex 安装器会生成 `gsd-*` skills；当前文档要求 Codex CLI 至少为 `0.130.0`。在 Codex 中的调用形式是 `$gsd-map-codebase`、`$gsd-plan-phase`，而不是 Claude Code 的 `/gsd-*`。

安装 `grill-me` 推荐使用 Codex 自带的 skill installer：

```text
Use $skill-installer to install skills/grill-me
from the GitHub repository mio-openliven/codex-grill-me-skill.
```

重新启动 Codex 后，运行 `/skills` 或输入 `$`，确认能看到：

```text
$grill-me
$gsd-map-codebase
$gsd-new-project
$gsd-discuss-phase
$gsd-plan-phase
$gsd-execute-phase
$gsd-verify-work
$gsd-ship
```

Codex 支持通过 `$skill-name` 显式调用 skill，也可以通过 `/skills` 查看可用 skill。([OpenAI Developers][1])

---

## 2. 先给 Codex 增加重构护栏

你的仓库已经有一份很完整的 `AGENTS.md`，其中已经要求：

* 保持双语内容；
* 使用 typed schema；
* 课程形成教学闭环；
* 修改路由和结构时更新测试；
* 执行 `npm test`、`npm run build` 和必要的 Pages 构建。

Codex 会在开始工作前读取项目中的 `AGENTS.md`。([OpenAI Developers][2])

建议在现有 `AGENTS.md` 末尾追加：

```md
## Curriculum V2 重构护栏

- 本轮采用渐进式迁移，禁止一次性重写 Math Lab、Data Lab 和 Algorithm 模块。
- 在旧 URL 有对应 redirect 和测试前，不得删除旧路由。
- 在 Progress V2 迁移测试通过前，不得删除三个现有 localStorage 数据源。
- Curriculum Catalog 必须先通过 adapter 接入现有内容，不在同一阶段搬迁全部课程正文。
- Lesson Block Renderer 第一轮只迁移 AI Overview、Gradient Descent 和 MLP。
- 每个阶段必须保持现有课程可访问、双语可用、checkpoint 可提交。
- 每个阶段单独验证、单独提交、单独 PR；禁止积累为一个大型重构 PR。
- 没有明确验收条件的阶段不得进入 execute。
```

---

## 3. 建立独立分支并记录基线

```bash
git switch -c refactor/curriculum-v2

npm install
npm test
npm run build
npm run build:pages
git status --short
```

将现有失败记录下来，不要让 GSD 把历史失败误判为本轮引入的问题：

```md
# docs/refactor/baseline.md

- npm test:
- npm run build:
- npm run build:pages:
- existing warnings:
- known broken behavior:
```

---

## 4. 第一步只运行 GSD 的代码库映射

```text
$gsd-map-codebase
```

对于已有代码的 brownfield 项目，GSD 推荐先映射代码库，再创建项目。它会在 `.planning/codebase/` 下形成技术栈、架构、目录、约定、测试和风险等文档。

完成后重点检查：

```text
.planning/codebase/ARCHITECTURE.md
.planning/codebase/STRUCTURE.md
.planning/codebase/CONVENTIONS.md
.planning/codebase/TESTING.md
.planning/codebase/CONCERNS.md
```

特别确认它是否识别出了：

```text
三套课程 schema
三套 progress store
moduleCatalog 与 legacy modules 的组合
AlgorithmView 的 slug 条件分发
首页重复定义学习路线
旧路由兼容要求
GitHub Pages BASE_URL
```

映射结果明显错误时，先修正文档，不要马上进入重构。

---

## 5. 用 grill-me 形成项目级决策文档

在一个新 Codex 会话中粘贴：

```text
Use $grill-me.

Read these files first:

- AGENTS.md
- README.md
- .planning/codebase/*
- src/router/index.ts
- src/data/moduleCatalog.ts
- src/data/navigationMenus.ts
- src/views/HomeView.vue
- src/views/AlgorithmView.vue
- src/types/ml.ts
- src/modules/math-lab/types/mathLab.ts
- src/modules/data-lab/types/dataLab.ts
- src/utils/algorithmProgress.ts
- src/modules/math-lab/utils/progress.ts
- src/modules/data-lab/utils/progress.ts

Interview me one question at a time about the Curriculum V2 refactor.
For every question, include your recommended answer and explain the risk it resolves.

Do not ask about low-risk implementation details that can be inferred from the repository.
Do not modify application code.

Resolve these decision branches:

1. The primary learner and primary learning outcome.
2. The canonical core learning track.
3. Which modules belong to the core track, topic library, projects, and advanced tracks.
4. Whether Math Lab and Data Lab remain products or become topic-library domains.
5. Canonical module and lesson IDs.
6. Legacy URL and deep-link compatibility.
7. Progress V2 migration, rollback, and retention of v1 data.
8. Generic LessonPage versus intentionally bespoke lesson pages.
9. The three pilot modules.
10. Content freeze boundary and explicit non-goals.
11. Definition of Done for curriculum, routing, progress, UI, bilingual content, and labs.

Use these recommended defaults unless I explicitly reject them:

- No big-bang rewrite.
- Keep all existing content reachable.
- Preserve legacy URLs through redirects.
- Introduce adapters before moving content.
- Make progress migration idempotent.
- Do not delete v1 storage during this milestone.
- Pilot AI Overview, Gradient Descent, and MLP.
- Every phase must pass npm test, npm run build, and npm run build:pages.
- One phase should produce one reviewable PR.

When all critical decisions are resolved, write:

docs/refactor/curriculum-v2-brief.md

The document must contain:

- Problem statement
- Target users
- Desired information architecture
- Core learning track
- Topic-library structure
- Decisions
- Rejected alternatives
- Invariants
- Non-goals
- Compatibility policy
- Data-migration policy
- Acceptance criteria
- Proposed milestone and phase boundaries
```

这个过程应该一直保持“一次一个问题”。`grill-me` 的规则本身要求先从代码和文档获取能自行判断的信息，只把真正的高风险分支交给用户。

---

## 6. 将 grill-me 产物交给 GSD

项目 brief 完成后运行：

```text
$gsd-new-project --auto @docs/refactor/curriculum-v2-brief.md
```

`$gsd-new-project` 可以从现有文档自动提取项目背景，并生成：

```text
.planning/PROJECT.md
.planning/REQUIREMENTS.md
.planning/ROADMAP.md
.planning/STATE.md
.planning/config.json
```

不要直接批准一个过于粗糙的 Roadmap。期望它大致拆成下面这些阶段。

## 7. 推荐的 GSD Roadmap

| Phase | 目标                     | 主要交付物                                                                     | 必须暂时不做       |
| ----- | ---------------------- | ------------------------------------------------------------------------- | ------------ |
| 1     | 统一 Curriculum Contract | catalog、track、prerequisite graph、validation tests、现有三套内容 adapter          | 不改首页，不搬全部正文  |
| 2     | 路由与导航统一                | canonical route、legacy redirect、catalog-derived navigation、route tests    | 不改 progress  |
| 3     | Progress V2            | 合并模型、v1→v2 幂等迁移、统一 continue-learning、migration tests                      | 不删除旧 storage |
| 4     | 首页与信息架构                | 开始、继续、路线入口、专题库、项目入口、移动端和双语验证                                              | 不改课程正文结构     |
| 5     | 通用 LessonPage          | LessonBlockRenderer、lab registry、AI Overview/Gradient Descent/MLP adapter | 不迁移其他所有课程    |
| 6     | 教学交互协议                 | prediction、manipulation、evidence、reflection、success criteria              | 不批量重做所有 lab  |
| 7     | Milestone audit        | 内容可达性、URL、进度、双语、构建和 UI 回归                                                 | 不增加新课程       |

Phase 1 的建议文件边界：

```text
src/curriculum/
  types.ts
  catalog.ts
  tracks.ts
  prerequisites.ts
  validation.ts
  adapters/
    algorithmAdapter.ts
    mathLabAdapter.ts
    dataLabAdapter.ts

tests/
  curriculumCatalog.test.ts
  curriculumPrerequisites.test.ts
  curriculumLocalization.test.ts
```

核心原则是：**先通过 adapter 统一读取，再决定是否搬迁原始内容**。

---

## 8. 每个 Phase 的标准执行循环

### 高风险 Phase 先 grill

Phase 1、3、5 建议先运行：

```text
Use $grill-me.

Read:

- .planning/PROJECT.md
- .planning/REQUIREMENTS.md
- .planning/ROADMAP.md
- AGENTS.md
- docs/refactor/curriculum-v2-brief.md
- all code relevant to Phase N

Stress-test Phase N only.

Ask one question at a time, with a recommended answer.
Focus on:

- scope boundary
- compatibility
- migration safety
- stable identifiers
- rollback
- testing
- whether this phase is independently releasable
- whether the plan accidentally combines content migration with framework migration

Do not edit source code.

When the phase is implementation-ready, write:

docs/refactor/decisions/phase-N.md

Include settled decisions, rejected options, invariants, acceptance criteria,
migration behavior, rollback behavior, and remaining risks.
```

### 再让 GSD 吸收这些决策

```text
Use $gsd-discuss-phase N --all --analyze.

Treat docs/refactor/decisions/phase-N.md as settled project decisions.
Do not reopen those decisions unless they conflict with the actual codebase.
Ask only about remaining code-level gray areas.
```

`discuss-phase` 会生成 phase `CONTEXT.md` 和讨论记录，供 planner 使用。

### 计划

```text
$gsd-plan-phase N --tdd --validate --granularity fine
```

检查生成的每份 `PLAN.md`，确保：

* 每项任务有明确文件范围；
* migration 和 deletion 不在同一个任务中；
* legacy compatibility 有测试；
* 每项行为变更先有失败测试；
* 不出现“重构所有模块”一类开放任务；
* 每个 plan 能在一个新上下文中独立完成。

### 执行

```text
$gsd-execute-phase N --validate
```

GSD 会按计划执行、生成 summary 并创建提交，因此必须在专用分支上运行。

### 验证

```text
$gsd-verify-work N
```

对于 Phase 4、5、6，再执行：

```text
$gsd-ui-review N
```

GSD 的 `verify-work` 支持 UAT 和自动诊断；`ui-review` 用于前端视觉审查。

---

## 9. 不同 Phase 的 grill-me 重点

### Phase 1：Curriculum Catalog

要求它重点追问：

```text
- Module、Lesson、Track、Domain 分别是什么？
- Math module 和 Algorithm module 是否共享同一 ID 空间？
- prerequisite 是 DAG 还是只记录推荐关系？
- 一个 module 能否属于多个 track？
- catalog 是新 source of truth，还是暂时只做 read model？
- 旧 moduleOrder 在哪个阶段停止作为主顺序？
```

推荐答案：

```text
catalog 先做统一 read model；
原模块文件仍是内容 source；
track 和 prerequisite 分开建模；
module 可以属于多个 track；
canonical ID 全站唯一；
删除 legacy source 必须留到后续 milestone。
```

### Phase 3：Progress V2

要求它重点追问：

```text
- 三份 v1 数据如何合并？
- 同一概念在多个旧模块中完成时如何处理？
- migration 能否重复运行？
- migration 中断后如何恢复？
- 是立即写 v2，还是双写一段时间？
- v1 数据保留多久？
- 用户清空 v2 后是否会被 v1 再次恢复？
```

推荐策略：

```text
read-v1 → normalize → merge → write-v2 → set migration marker
```

并满足：

```text
同一输入重复迁移结果相同；
不删除 v1；
冲突采用最保守的完成状态；
quiz attempt 保留来源 namespace；
migration marker 带 schema version；
测试 corrupted JSON、部分 store 缺失和重复运行。
```

### Phase 5：Lesson Renderer

要求它重点追问：

```text
- 哪些内容属于通用 block？
- 哪些页面必须保持 bespoke？
- interactive lab 是 block 还是 route-level component？
- renderer 如何处理旧 StorySection？
- chapter URL 是否稳定？
- migration parity 如何验证？
```

推荐答案：

```text
通用页面骨架统一；
复杂实验保持独立组件；
通过 registry 嵌入；
先做 adapter，不立即改写内容 schema；
第一轮只迁移三门旗舰课；
其他页面继续走旧 renderer。
```

---

## 10. 每个 Phase 发 PR 前再做一次短 grill

```text
Use $grill-me.

Read:

- git diff against the phase base branch
- the phase PLAN files
- all phase SUMMARY files
- the phase UAT or VERIFICATION file
- test and build output

Ask only release-blocking questions.

Focus on:

- broken legacy URLs
- progress data loss
- unreachable content
- bilingual mismatch
- hidden coupling with later phases
- missing rollback path
- untested GitHub Pages behavior

Stop when there is a clear go/no-go decision.
Do not propose scope expansion unless it blocks release.
```

通过后：

```text
$gsd-ship N --draft
```

`$gsd-ship` 会根据 phase goal、summary、requirements 和 verification 生成 PR。

每个 phase 单独 PR，不要等七个 phase 全部完成后再开一个巨型 PR。

---

## 11. 第一轮可以直接复制执行的命令序列

```text
$gsd-map-codebase
```

然后执行前面的项目级 `$grill-me` 提示词，生成：

```text
docs/refactor/curriculum-v2-brief.md
```

接着：

```text
$gsd-new-project --auto @docs/refactor/curriculum-v2-brief.md
```

Phase 1：

```text
Use $grill-me to stress-test Phase 1 and write docs/refactor/decisions/phase-1.md.
```

```text
Use $gsd-discuss-phase 1 --all --analyze.
Treat docs/refactor/decisions/phase-1.md as settled constraints.
```

```text
$gsd-plan-phase 1 --tdd --validate --granularity fine
$gsd-execute-phase 1 --validate
$gsd-verify-work 1
```

最后：

```text
Use $grill-me to perform a release-risk review of Phase 1.
```

```text
$gsd-ship 1 --draft
```

这套流程中，`grill-me` 是**决策闸门**，GSD 是**交付状态机**。把两者职责分开，才能避免 Codex 一边修改课程架构，一边仍在猜测产品方向。

[1]: https://developers.openai.com/codex/skills "Agent Skills – Codex | OpenAI Developers"
[2]: https://developers.openai.com/codex/guides/agents-md "Custom instructions with AGENTS.md – Codex | OpenAI Developers"
