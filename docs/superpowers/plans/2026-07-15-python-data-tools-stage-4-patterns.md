# Python Data Tools Stage 4：本地模式映射

**Mapped:** 2026-07-15
**Phase:** `python-data-tools-stage-4`
**候选文件:** 52 个路径（16 个 Markdown 母版、18 个新增实现/集成文件、3 个依赖/声明文件、8 个新增测试、7 个既有文件/测试更新）
**直接或强角色匹配:** 49 / 52

本文只回答“Stage 4 的新文件应复制仓库里的哪些模式”。产品行为仍以 Stage 4 spec、implementation context 和 research 为准；这里不增加运行时需求。

## 文件分类

研究文档中的文件名属于推荐拆分。规划器可以调整内部文件名，但不得合并掉内容编译、纯路由解析、输出加载、Plotly 生命周期和分页呈现之间的责任边界。

| 新增/修改文件 | 数量 | 角色 | 数据流 | 最接近本地模式 | 匹配质量 |
|---|---:|---|---|---|---|
| `docs/curriculum-v3/python-data-tools/chinese-master/01-*.md` … `08-*.md` | 8 | static source | file I/O → transform | 同目录现有八章；`scripts/python-data-tools/build-notebook.py` | exact |
| `docs/curriculum-v3/python-data-tools/english-master/01-*.md` … `08-*.md` | 8 | static source | file I/O → transform | 中文八章；Math-to-Code 中英 paired master/compiler | role + flow |
| `scripts/python-data-tools/build-runtime-content.mjs` | 1 | build utility/compiler | batch file I/O → deterministic transform/check | `scripts/generateMathToCodeRuntimeContent.mjs`; `build-notebook.py` | exact composite |
| `scripts/python-data-tools/check-paired-masters.mjs` | 1 | read-only authoring preflight | paired file I/O → signature/prose diagnostics | `scripts/generateMathToCodeRuntimeContent.mjs`; `tests/math-to-code-semantic-parity.test.ts` | exact composite |
| `src/data/generated/pythonDataToolsRuntime.generated.ts` | 1 | generated model | build artifact → browser read | `src/modules/math-lab/data/mathToCode/runtimeLessonContent.generated.ts` | exact |
| `src/types/pythonDataToolsRuntime.ts` | 1 | model/schema | typed transform | `src/data/pythonNotebookContract.ts`; `src/types/ml.ts` | role-match |
| `src/data/pythonNotebookContract.ts` | 1 | contract/model | static registry | current file | exact |
| `src/data/pythonNotebookModule.ts` | 1 | adapter/registration | generated projection → algorithm registry | current module shape; generated Math-to-Code consumption | role-match |
| `src/utils/pythonDataToolsRoutes.ts` | 1 | route utility | request/response (route ID → canonical result) | `src/curriculum/routes.ts`; `src/router/index.ts` guards | exact role |
| `src/utils/pythonDataToolsOutputs.ts` | 1 | loader/service + adapters | request/response fetch → typed view model | `withPublicBase`; CNN local async state; Stage 3 schema tests | partial |
| `src/composables/usePythonDataToolsOutputSession.ts` | 1 | page-session controller | one-shot manifest request → typed per-output state | `CnnExplainerLab.vue` request token/unmount cleanup | role + flow |
| `src/components/PythonDataToolsPagedLesson.vue` | 1 | page component | route/props → event-driven render | `LinearRegressionPagedLesson.vue`; `LogisticRegressionPagedLesson.vue` | exact role |
| `src/components/PythonDataToolsResultBlock.vue` | 1 | presentation component | typed load state → local render/fallback | `OverviewMediaFigure.vue`; `MarkdownMathContent.vue` | role-match |
| `src/components/PythonDataToolsPlotlyFigure.vue` | 1 | isolated heavy component | lazy async import + event-driven controls | `MathLabModulePage.vue`; `CnnExplainerLab.vue`; `cnnExplainer.ts` | partial |
| `src/components/PythonDataToolsTeachingPrompt.vue` | 1 | static presentation component | typed content → render | `MarkdownMathContent.vue`; static explanatory cards in paged lessons | role-match |
| `src/styles/modules/python-data-tools.css` | 1 | module CSS | responsive presentation | `linear-regression.css` + `linear-regression-responsive.css` | exact role |
| `src/styles/index.css` | 1 | style registry | import ordering | current `src/styles/index.css` | exact |
| `src/router/index.ts` | 1 | route registry/guard | navigation request → canonical redirect | dedicated linear/logistic routes before generic route | exact |
| `src/views/AlgorithmView.vue` | 1 | integration controller | route + store → page selection/progress events | current dedicated linear/logistic branch pattern | role-match; avoid expanding watcher |
| `src/data/algorithmCheckpoints.ts` | 1 | checkpoint registry | static data → evaluation | current helper and Python entry | exact |
| `src/components/AlgorithmCheckpointQuiz.vue` | 1 | checkpoint presentation | event-driven answer → submit event | current scored/formative presentation split | exact |
| `package.json`, `package-lock.json` | 2 | dependency config | package resolution | current exact dependency grouping | exact |
| `src/types/plotly-basic.d.ts`（或等价 ambient 声明） | 1 | type adapter | module typing | no repository ambient-module precedent found | no close analog |
| `tests/python-data-tools-runtime-{content,routing,outputs,prompts,page,progress}.test.ts` | 6 | tests | source/file I/O + pure request/response | Python master/assets tests; route layout tests; algorithm progress tests | exact composite |
| `tests/python-data-tools-{paired-master-preflight,runtime-integration}.test.ts` | 2 | tests | paired-authority fixtures + atomic cross-artifact integration | Math-to-Code parity tests; route/layout/progress source tests | exact composite |
| `tests/python-data-tools-chinese-master.test.ts`, `tests/python-data-tools-notebook-assets.test.ts`, `tests/python-and-housing-modules.test.mjs`, `tests/algorithm-progress.test.ts`, `tests/curriculumRoutingNavigation.test.ts`, `tests/algorithm-checkpoints-layout.test.mjs` | 6 | tests (updates) | source structure + compatibility | current files themselves | exact |

## 模式分配

### 1. 中英母版、确定性生成器与 generated projection

**适用文件：** 16 个母版、`build-runtime-content.mjs`、generated projection、runtime types、`pythonNotebookModule.ts`。

最强本地 analog（4 个）：

1. `scripts/generateMathToCodeRuntimeContent.mjs` — paired masters、结构对齐、确定性 TS 输出、`--check`。
2. `scripts/python-data-tools/build-notebook.py` — 八章固定顺序、cell marker grammar、唯一 ID 与 output binding 校验。
3. `tests/math-to-code-semantic-parity.test.ts` — `--check` 只读与 stale target 负向 fixture。
4. `tests/python-data-tools-chinese-master.test.ts` — contract 顺序、章节结构、cell/output/prompt marker 的 source-of-truth 测试。

**paired master 读取与结构配对**（`scripts/generateMathToCodeRuntimeContent.mjs:12-35`）：

```js
function parseMaster(file) {
  const source = readFileSync(new URL(`../docs/curriculum/v3/math-to-code/${file}`, import.meta.url), 'utf8')
  const matches = [...source.matchAll(/^##\s+(.+?)\s+\{#([a-z0-9-]+)\}\s*$/gm)]
  return matches.map((match, index) => ({
    originalId: match[2],
    title: match[1],
    content: source.slice(match.index + match[0].length, matches[index + 1]?.index ?? source.length).trim(),
  }))
}
// ...
if (english.some((section, index) => section.originalId !== chinese[index]?.originalId)) {
  throw new Error(`${lesson.key} localized section IDs must match`)
}
```

复制重点：解析器返回结构化 section；先比较 locale 间稳定 ID，再组合可见 prose。Stage 4 应扩大签名比较到 cell role、公式序列、Python code bytes、output ID 与 prompt marker，不能只比较章节数。

**generated 文件头、稳定序列化与 check/write 分支**（`scripts/generateMathToCodeRuntimeContent.mjs:38-57`）：

```js
const output = `// Generated by scripts/generateMathToCodeRuntimeContent.mjs. Do not edit by hand.\n` +
  `export interface RuntimeLessonSection { ... }\n` +
  `export const runtimeLessonContent = ${JSON.stringify(generated, null, 2)} as const ...\n`

if (process.argv.includes('--check')) {
  const current = readFileSync(targetUrl, 'utf8')
  if (current !== output) process.exitCode = 1
} else {
  writeFileSync(targetUrl, output)
}
```

复制重点：生成字节在内存中一次构造；check 分支只读；普通分支才写。保留固定末尾换行和 `Do not edit by hand`。

**Python Data Tools marker grammar 与可诊断校验**（`scripts/python-data-tools/build-notebook.py:18-45,222-266`）：

```py
CHAPTER_FILES = (
    "01-notebook-workflow.md",
    # ...
    "08-analysis-report.md",
)
CELL_PATTERN = re.compile(
    r"<!-- cell: (?P<source_id>ch\d{2}-[a-z0-9-]+) role: "
    r"(?P<role>[a-z]+)(?: output: (?P<output_id>[a-z0-9-]+))? -->\n"
    r"```python\n(?P<code>[\s\S]*?)```"
)
# ...
if source_id in seen_ids:
    raise ValueError(f"Duplicate source cell id {source_id} in {path}")
```

复制重点：章节顺序不要在 generator 里另造权威列表，实施时从 contract 顺序导出；错误信息仍应像此 parser 一样带 file/ID。

**check 模式测试**（`tests/math-to-code-semantic-parity.test.ts:236-260`）：

```ts
const before = readFileSync(generatedUrl)
const result = spawnSync(process.execPath, ['scripts/generateMathToCodeRuntimeContent.mjs', '--check'], ...)
assert.equal(result.status, 0, result.stderr || result.stdout)
assert.deepEqual(readFileSync(generatedUrl), before)
// stale --target remains byte-for-byte unchanged after nonzero check
```

必须复用 `--target` 或等价 fixture seam，才能测试 drift 而不触碰 committed projection。

### 2. Typed contract、内容注册与静态 teaching prompt

**适用文件：** `pythonNotebookContract.ts`、runtime types、generated projection、`pythonNotebookModule.ts`、`PythonDataToolsTeachingPrompt.vue`。

最强本地 analog（3 个）：

1. `src/data/pythonNotebookContract.ts` — literal union、typed contract、`LocalizedCopy` 与 `satisfies` 数据注册。
2. `src/data/pythonNotebookModule.ts` — `AlgorithmModuleDefinition` 的浅层注册边界。
3. `src/components/MarkdownMathContent.vue` — typed source prop 经唯一安全 renderer 输出。

**contract-first 类型模式**（`src/data/pythonNotebookContract.ts:3-67,115-126`）：

```ts
export type PythonDataToolsChapterId =
  | 'notebook-workflow'
  | 'numpy-foundations'
  // ...
  | 'analysis-report'

export type PythonDataToolsOutputContract = {
  [Id in PythonDataToolsOutputId]: {
    id: Id
    cellId: `output-${Id}`
    chapterId: PythonDataToolsChapterId
    kind: 'json' | 'png' | 'plotly-json'
  }
}[PythonDataToolsOutputId]
```

复制重点：runtime block 也应使用 discriminated union；不要在 Vue 中临时拼接无类型 block。`TeachingPromptBlock` 保持只读字段，不增加输入或提交状态。

**浅层模块注册**（`src/data/pythonNotebookModule.ts:46-56,414-424`）：

```ts
export const pythonNotebookModule: AlgorithmModuleDefinition = {
  slug: 'python-notebook',
  route: '/learn/python-notebook',
  // ...
  checkpoints: algorithmCheckpointsBySlug['python-notebook'],
  chapters: [/* currently handwritten; Stage 4 replaces with projection adapter */],
  controls: [],
  presets: [],
  simulate: simulatePythonNotebook,
}
```

保留 module catalog 所需的浅层 shape；正文改由 projection 派生。不要把八章中英文 prose 再复制到该文件。

### 3. 分页课程、目录、上一章/下一章与样式

**适用文件：** `PythonDataToolsPagedLesson.vue`、`python-data-tools.css`、`styles/index.css`、`AlgorithmView.vue` 的专用分支。

最强本地 analog（4 个）：

1. `src/components/LinearRegressionPagedLesson.vue` — current-only article、桌面目录、移动目录、pager。
2. `src/components/LogisticRegressionPagedLesson.vue` — 同一分页骨架的第二个课程实例，证明结构可复用而内容不可复制。
3. `src/styles/modules/linear-regression.css` — sticky 双栏、nav、pager、module-scoped class。
4. `src/styles/modules/linear-regression-responsive.css` — 1080/720 断点下的移动目录和单栏 pager。

**当前章节和相邻章节**（`LinearRegressionPagedLesson.vue:192-201`）：

```ts
const currentIndex = computed(() => {
  const index = props.moduleDefinition.chapters.findIndex((section) => section.id === props.section.id)
  return index >= 0 ? index : 0
})
const previousSection = computed(() => props.moduleDefinition.chapters[currentIndex.value - 1])
const nextSection = computed(() => props.moduleDefinition.chapters[currentIndex.value + 1])
```

只复制 index/previous/next。该 analog 的 `progressPercent`（199-201）和模板中的百分比（319-320）与 D-04 冲突，Stage 4 明确不能复制。

**桌面/移动目录和 current-only article**（`LinearRegressionPagedLesson.vue:270-326`）：

```vue
<button :aria-expanded="mobileMenuOpen" @click="mobileMenuOpen = !mobileMenuOpen">...</button>
<aside :class="{ 'is-open': mobileMenuOpen }">
  <router-link
    v-for="chapter in props.moduleDefinition.chapters"
    :class="{ 'is-active': chapter.id === props.section.id }"
    :to="chapterRoute(chapter)"
  />
</aside>
<article :data-section-id="props.section.id">
  <MarkdownMathContent :source="localizedText(props.section.markdown)" />
</article>
```

**pager**（`LinearRegressionPagedLesson.vue:586-616`）：使用两个具名 `router-link`，无上一章时渲染 disabled text，不用 JS click navigation。

**布局 CSS**（`src/styles/modules/linear-regression.css:10-37,70-111,406-433`）：

```css
.linear-course-page__grid {
  display: grid;
  grid-template-columns: minmax(220px, 260px) minmax(0, 1fr);
}
.linear-course-page__sidebar {
  position: sticky;
  top: 92px;
}
.linear-course-page__pager {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
```

**响应式目录**（`linear-regression-responsive.css:347-395,416-453`）：1080px 以下显示 toggle、隐藏 sticky sidebar 并由 `.is-open` 展开；720px 以下目录与 pager 变单列。新样式应换成 Python module class，不要依赖 `.linear-course-*` 全局耦合。

### 4. 章节路由解析、专用路由顺序与无副作用 redirect

**适用文件：** `pythonDataToolsRoutes.ts`、`src/router/index.ts`、`AlgorithmView.vue`、routing/page tests。

最强本地 analog（4 个）：

1. `src/curriculum/routes.ts` — 无 Vue 状态的纯 route resolver。
2. `src/router/index.ts` — `routeParamValue` + `beforeEnter` guard。
3. linear/logistic dedicated route declarations — 专用 route 在 generic route 之前。
4. `tests/linear-regression-layout.test.mjs` 与 `tests/curriculumRoutingNavigation.test.ts` — 路由顺序 source assertions。

**纯 resolver**（`src/curriculum/routes.ts:3-21`）：

```ts
export function resolveCanonicalLearnRoute(moduleId: string, lessonId?: string) {
  const moduleDefinition = curriculumRouteManifestById.get(moduleId)
  if (!moduleDefinition) return undefined
  if (moduleDefinition.source === 'algorithm') {
    return lessonId ? `/learn/${moduleId}/${lessonId}` : `/learn/${moduleId}`
  }
  return moduleDefinition.route
}
```

Stage 4 resolver应同样保持纯函数，返回 `legacy/current/unknown` 判别结果；5 个 legacy map 只定义一次。

**guard 输入归一化**（`src/router/index.ts:11-25`）：

```ts
function routeParamValue(value: unknown) {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return ''
}
function redirectCanonicalLearnRoute(to: RouteLocationNormalized) {
  // resolve first, return redirect before component mount
}
```

**专用 route 必须排在 generic route 之前**（`src/router/index.ts:95-128`）。对应测试直接比较 source index（`tests/linear-regression-layout.test.mjs:51-68`），Stage 4 routing test 应复制这一模式并额外纯函数覆盖 5 legacy + 8 current + root/unknown。

**必须避开的现有副作用顺序**（`src/views/AlgorithmView.vue:115-145`）：当前 watcher 先在 125-127 写 `saveAlgorithmProgress(setLastVisited...)`，再在 129-134 检查未知章节并 redirect。Python legacy canonicalization 必须在进入该 watcher/页面前完成，不能复制这个顺序。

### 5. 安全 Markdown 与 GitHub Pages public path

**适用文件：** paged lesson、result block、teaching prompt、output loader、Notebook 下载链接。

最强本地 analog（3 个）：

1. `src/components/MarkdownMathContent.vue` — 组件只接收 source，唯一 `v-html` 在封装内部。
2. `src/utils/markdownMath.ts` — code block/formula 保护、KaTeX、sanitize-html allowlist。
3. `src/utils/publicPath.ts` — root-absolute logical path rebasing。

**安全 renderer 边界**（`MarkdownMathContent.vue:1-14`）：

```vue
const rendered = computed(() => renderMarkdownWithMath(props.source))
<div class="markdown-math" v-html="rendered" />
```

所有 generated prose 传 `source`；Stage 4 组件本身不得再出现 `v-html`。

**sanitize 与资源 rebasing**（`markdownMath.ts:55-83,94-152`）：allowlist 限定属性和协议，`a`/`img` transform 均调用 `withPublicBase()`，最后才 `sanitizeHtml(...)`。不要另写 Markdown parser。

**public base helper**（`publicPath.ts:17-30`）：

```ts
export function withPublicBase(path?: string, baseUrl = getBaseUrl()) {
  if (!path || !path.startsWith('/') || isExternalOrSpecialPath(path)) return path
  if (baseUrl === '/' || path.startsWith(baseUrl)) return path
  return `${baseUrl.replace(/\/$/, '')}${path}`
}
```

manifest、每个 output、PNG、Figure JSON、Notebook 和 environment 链接都应在 fetch/render 边界调用它；不要把 base 写入 generated content。

### 6. Manifest/单资源加载、局部 fallback 与 teaching view model

**适用文件：** `pythonDataToolsOutputs.ts`、`PythonDataToolsResultBlock.vue`、`PythonDataToolsPlotlyFigure.vue`、outputs tests。

最强本地 analog（4 个）：

1. `src/components/CnnExplainerLab.vue` — explicit loading/ready/error 转换、stale request guard、unmount invalidation。
2. `src/modules/ai-overview/components/OverviewMediaFigure.vue` — unavailable media 的局部文本、英文标签翻译表、reduced-motion 静态 fallback。
3. `src/utils/publicPath.ts` — 每个静态请求 URL 的 Pages rebasing。
4. `tests/python-data-tools-notebook-assets.test.ts` — manifest/output 的实际 schema、有限数值、hash/path 和 Plotly default state。

仓库没有通用浏览器 JSON fetch service，因此 loader 的 `fetch + response.ok + unknown guard` 应按 research 的纯函数 seam 新建，不要复制 importer 或第三方模型 loader。

**异步局部状态与 stale request guard**（`CnnExplainerLab.vue:3682-3711`）：

```ts
const requestId = ++inferenceRequestId
status.value = 'loading'
try {
  const result = await runTinyVggForwardPass(imageUrl)
  if (requestId !== inferenceRequestId) return
  status.value = 'ready'
} catch (error) {
  if (requestId !== inferenceRequestId) return
  status.value = 'error'
  statusMessage.value = error instanceof Error ? error.message : copy.value.fallback
}
```

Stage 4 应把该状态封装为 discriminated union，而非散落 refs；manifest manual reload 递增 request token/abort 前一请求，且没有 timer retry。

**卸载清理**（`CnnExplainerLab.vue:3639-3651`）：在 `onBeforeUnmount` 使 pending request 失效并释放资源。Plotly 组件同一位置调用 `Plotly.purge()`。

**英文复用中文媒体的翻译表**（`OverviewMediaFigure.vue:33-41`）：英文模式在同一 asset 下渲染 summary 和 `Chinese label in media / English meaning` 表格。PNG result block 应复制这个呈现责任，而不是生成第二份 PNG。

**reduced-motion 静态信息**（`OverviewMediaFigure.vue:70-76`）：媒体 fallback 在 reduced motion 下可见；Stage 4 的关键结论和数据表应始终存在，不依赖动画/hover。

**Stage 3 schema test 是 adapter 的输入契约**（`tests/python-data-tools-notebook-assets.test.ts:94-170`）：manifest output 顺序与 contract 一致；JSON 全部有限；working-day 有 48 行；correlation 为 7×7；Plotly default filter 为 `[0,23] × [0,1]`。adapter tests 从这些 committed payload 读取，不能在 Vue 写重复数值。

### 7. Heavy component lazy import 与 Plotly 生命周期

**适用文件：** `PythonDataToolsPlotlyFigure.vue`、ambient declaration、package files、paged lesson/route integration。

最强本地 analog（3 个）：

1. `MathLabModulePage.vue` — `defineAsyncComponent(() => import(...))` registry。
2. `src/utils/cnnExplainer.ts` — heavy `@tensorflow/tfjs` 在函数内 dynamic import。
3. `CnnExplainerLab.vue` — onBeforeUnmount 生命周期清理与 async request invalidation。

**component registry lazy boundary**（`MathLabModulePage.vue:50-83,293-303`）：

```ts
const fallbackLabComponent = defineAsyncComponent(() => import('../labs/NumericalMiniLab.vue'))
const labComponentRegistry = {
  MathToCodeStudioLab: defineAsyncComponent(() => import('../labs/MathToCodeStudioLab.vue')),
}
function labComponentFor(componentName?: string) {
  return isRegisteredLabComponent(componentName) ? labComponentRegistry[componentName] : fallbackLabComponent
}
```

Plotly 不需要 registry，但应复制“只有渲染对应组件才请求 chunk”的边界。

**函数内 heavy import**（`src/utils/cnnExplainer.ts:615-625`）：

```ts
export async function loadTinyVggModel(...) {
  const tfModule = await import('@tensorflow/tfjs')
  await tfModule.ready()
  // ...
}
```

对应 Stage 4：只在 Figure ready 且第七章组件挂载后 `await import('plotly.js-basic-dist-min')`。仓库没有 Plotly renderer analog；`react()`/`purge()`/modebar 配置必须直接采用 research 引用的官方 API 模式，并用结构测试锁定 dynamic import 与 cleanup。

### 8. Checkpoint、“课程回顾”presentation 与 Progress 兼容

**适用文件：** `algorithmCheckpoints.ts`、`AlgorithmCheckpointQuiz.vue`、`AlgorithmView.vue`、progress tests。

最强本地 analog（4 个）：

1. `src/data/algorithmCheckpoints.ts` — typed helper、LocalizedCopy、misconception tags、revisit ID。
2. `src/components/AlgorithmCheckpointQuiz.vue` — answer/evaluation local state，submit 只 emit。
3. `src/utils/algorithmProgress.ts` — append-only attempt 与固定 V1 storage key。
4. `tests/algorithm-progress.test.ts` — MemoryStorage fixture、reload 和 bilingual/revisit validation。

**checkpoint registry helper**（`algorithmCheckpoints.ts:3-31`）：

```ts
function copy(zhCN: string, en: string) { return { 'zh-CN': zhCN, en } }
function checkpoint(id, prompt, choices, answer, explanation, misconceptionTags, revisitChapterId) {
  return { id, prompt, choices, answer, explanation, misconceptionTags, revisitChapterId }
}
```

新两题沿用此结构，但使用全新 ID 和新八章 `revisitChapterId`。旧两题不可复用 ID。

**presentation 与 writer 分离**（`AlgorithmCheckpointQuiz.vue:53-61`）：组件构建 attempts 后只 `emit('submit', ...)`；真正 writer 仍在 AlgorithmView。增加 Python “课程回顾” variant 时只改可见语气/隐藏得分强调，不把 storage 写入组件。

**revisit 路由 seam**（`AlgorithmCheckpointQuiz.vue:42-51`）：当前只有 linear/logistic 走 chapter URL，其余走 hash。Python 专用 presentation 必须加入稳定章节 URL 规则，否则新 `revisitChapterId` 会落到旧 hash 行为。

**append-only Progress**（`algorithmProgress.ts:11-12,64-72`）：

```ts
const STORAGE_KEY = 'ml-atlas:algorithm-progress:v1'
export function appendAlgorithmQuizAttempt(progress, attempt) {
  return {
    ...progress,
    quizAttempts: [...progress.quizAttempts, attempt],
    lastVisitedModuleSlug: attempt.moduleSlug,
  }
}
```

不要新建 key、过滤旧 quiz IDs 或重写数组。兼容测试应以带旧 Python attempts 的 `MemoryStorage` 开始，追加新 attempts 后 deep-equal 旧 prefix。

**结构测试防止 writer 下沉**（`tests/algorithm-checkpoints-layout.test.mjs:30-67`）：既断言组件有 evaluate/build/revisit，也断言组件不导入 `saveAlgorithmProgress`/`appendAlgorithmQuizAttempt`。新 presentation variant 继续保留这个边界。

### 9. Source-structure 与兼容测试组织

**适用文件：** 六个 runtime tests 及六个既有测试更新。

最强本地 analog（5 个）：

1. `tests/python-data-tools-chinese-master.test.ts` — `Promise.all` 读取八章并与 typed contract 对齐。
2. `tests/python-data-tools-notebook-assets.test.ts` — committed public artifacts 的 typed/schema assertions。
3. `tests/math-to-code-semantic-parity.test.ts` — generator `--check` 和 temp target drift。
4. `tests/linear-regression-layout.test.mjs` — SFC/source 与 route ordering assertions。
5. `tests/algorithm-progress.test.ts` — pure storage fixture 与 append/reload compatibility。

**八章 source test fixture**（`python-data-tools-chinese-master.test.ts:12-50`）：固定文件名 tuple，`Promise.all` 读取 README + chapters；Stage 4 content test 扩为 zh/en 两个 directory，并按 contract index 配对。

**marker/contract assertions**（同文件 `80-127`）：用 typed allowed-role set、global `seenCellIds`、output map 检查唯一性和 chapter ownership。不要只用 `source.includes` 检查英文“看起来存在”。

**静态 prompt 负向结构**：现有 `129-153` 仍写“形成性练习/选择 A/B”，需要改为 D-14/D-15 的 `想一想 → 参考思路 → 常见误区 → 复看`，并断言没有 form/input/button/emit/storage/network；保留 marker 与 contract mounts 对齐。

**route ordering test**（`linear-regression-layout.test.mjs:51-68`）：通过 `indexOf` 明确专用 route 在 generic route 之前；这比只断言 path 存在更能防回归。

**SFC tests 的边界**：仓库没有 Vue Test Utils/jsdom；Stage 4 继续用 Node runner 读 SFC source，纯 resolver/loader/adapter 则直接 import 运行。完整浏览器矩阵属于 Stage 5。

## 共享模式

### LocalizedCopy

所有可见文案使用 `{ 'zh-CN': string; en: string }`，参考 `algorithmCheckpoints.ts:3-5` 和 `pythonNotebookContract.ts:113-114`。技术错误内部可用英文 Error，但 result block 映射为双语学习者文案。

### 错误边界

- build-time：立即 throw，信息包含 language/file/chapter/cell/prompt/first mismatch。
- route-time：纯 resolver 返回判别结果；guard redirect，不写 Progress。
- asset-time：`loading | ready | error` 局部状态；正文和其他结果继续渲染。
- heavy component：unmount 使请求失效并释放第三方实例。

### 不复制的本地模式

- 不复制 `LinearRegressionPagedLesson.vue:199-201,319-320` 的百分比。
- 不复制 `AlgorithmView.vue:115-145` 的“先写 Progress、后检查 chapter”顺序。
- 不复制 `AlgorithmCheckpointQuiz.vue:69-98` 的“模块 checkpoint/答对 x/y/算法已完成”文案到 Python 页面。
- 不复制当前 `pythonNotebookModule.ts` 的手写双语正文。
- 不把 `OverviewMediaFigure` 的 scoped style 大段搬入组件；新 CSS 进入 module layer。

## 无直接 analog

| 文件/责任 | 原因 | 规划时采用 |
|---|---|---|
| `src/utils/pythonDataToolsOutputs.ts` 的 browser manifest + independent JSON fetch | 当前仓库没有通用 `fetchJson<T>(guard)` service | research 的 `response.ok → unknown parse → typed guard` seam；状态/清理借鉴 CNN |
| `PythonDataToolsPlotlyFigure.vue` 的 Plotly `react/purge` 与受控 modebar | 仓库当前无 Plotly.js browser renderer | research 中官方 Plotly API 示例；本地仅借鉴 lazy import/lifecycle |
| `src/types/plotly-basic.d.ts` | 未找到现有 ambient `declare module` 文件 | 最小 alias 到 `@types/plotly.js`，不扩展自造 API |

## 规划提示

1. 权威内容 wave 先对八章中文可见术语与 result-presentation 字段做 parser-aware 归一，再用独立的 paired-master preflight 给中英文写作提供早期文件名、marker、code byte、公式、输出绑定、prompt 与 UTF-8 诊断；projection 未接线时不改变旧页面。
2. loader/adapter 保持 pure guards + abortable fetch + view-model adapters；页面会话的一次自动 manifest 载入、stale/abort 清理、typed per-output 状态分发与唯一次性手动重载配额归 `PythonDataToolsPagedLesson.vue` 拥有的 composable，不放进 pure loader。
3. 纯 legacy/current/unknown resolver 先作为无路由副作用的独立依赖计划落地。后续 route guard + page/module + new checkpoint IDs 在一个原子任务中切换，且该任务提交前 redirect 与旧 attempt fixture 必须同时绿灯，防止 AlgorithmView watcher 写入旧深链或历史记录失去保护。
4. 原子切换后的依赖计划才更新其余 registry/routing/checkpoint/Progress 兼容套件并运行 full gates；不重构 Progress key/writer，也不扩大到 Stage 5 浏览器矩阵。

## 元数据

- **搜索范围：** `docs/curriculum-v3/python-data-tools/`, `scripts/`, `src/data/`, `src/types/`, `src/utils/`, `src/components/`, `src/router/`, `src/curriculum/`, `src/styles/`, `tests/`。
- **重点读取 analog：** 22 个文件或精确代码区段。
- **模式责任覆盖：** 9 组。
- **无直接 analog：** 3 个责任；均已有 research 官方/本地组合模式。
- **工作区保护：** 未读取或修改 `docs/gpt_advice.md`；未触碰 source/runtime 文件。
