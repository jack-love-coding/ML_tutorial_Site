import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const specUrl = new URL(
  '../docs/superpowers/specs/2026-07-15-python-data-tools-stage-4-runtime-parity-spec.md',
  import.meta.url,
)

const spec = await readFile(specUrl, 'utf8')

test('Stage 4 spec passes its ambiguity gate and locks eight falsifiable requirements', () => {
  assert.match(spec, /歧义分数：`0\.07`/)
  assert.match(spec, /锁定需求：8 项/)
  assert.equal((spec.match(/^### R\d+\./gm) ?? []).length, 8)
  for (const id of ['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8']) {
    const requirement = spec.match(new RegExp(`### ${id}\\.[\\s\\S]*?(?=\\n### R\\d+\\.|\\n## 4\\.)`))?.[0] ?? ''
    assert.match(requirement, /- 当前：/)
    assert.match(requirement, /- 目标：/)
    assert.match(requirement, /- 验收：/)
  }
})

test('Stage 4 spec locks the exact runtime migration and English parity boundary', () => {
  assert.match(spec, /`\/learn\/python-notebook` 从当前 5 章旧课程迁移为.*8 章双语/)
  assert.match(spec, /不能只翻译标题或压缩成摘要/)
  assert.match(spec, /`notebook-workflow` 到 `analysis-report`/)
  assert.match(spec, /模块 ID 与根路由未改变/)
  assert.match(spec, /英文 `\.ipynb`——阶段四只补网页英文语义对齐/)
})

test('Stage 4 spec preserves deep links, checkpoints, and all Progress stores', () => {
  assert.match(spec, /5 个旧章节 URL 必须各自映射到一个有效的新章节 URL/)
  assert.match(spec, /路由测试逐一覆盖 5 个旧 ID、8 个新 ID 和 1 个未知 ID/)
  assert.match(spec, /仍有两个可提交的双语模块级 checkpoint/)
  assert.match(spec, /保留全部旧 attempt 记录/)
  assert.match(spec, /三个现有 v1 localStorage 数据源和 V2 key 均未删除、重命名或批量重写/)
})

test('Stage 4 spec consumes all Stage 3 evidence through the manifest', () => {
  assert.match(spec, /3 个 PNG、4 个 JSON 派生证据、Plotly 探索图和中文 Notebook 下载/)
  assert.match(spec, /Stage 3 manifest 及其 public path 为权威来源/)
  assert.match(spec, /所有路径经 base-path helper 解析/)
  assert.match(spec, /页面源码没有手抄 Stage 3 精确统计值或另一组输出路径/)
  assert.match(spec, /manifest 或单个资源加载失败时.*双语错误说明和已有文字\/表格 fallback/s)
})

test('Stage 4 spec fixes five exercises as local unscored feedback', () => {
  assert.match(spec, /在 `numpy-foundations`、`pandas-analysis`、`matplotlib-visualization`、`seaborn-statistics` 和 `plotly-exploration` 各挂载一个/)
  for (const policy of [
    'scored=false',
    'submitted=false',
    'persistedToProgress=false',
    'gatesChapter=false',
  ]) {
    assert.ok(spec.includes(`\`${policy}\``))
  }
  assert.match(spec, /重复作答不会生成分数、网络请求或 localStorage 记录/)
})

test('Stage 4 spec resolves edge and prohibition coverage without scope creep', () => {
  assert.match(spec, /Coverage：18\/18 个适用边界已处理，0 个未解决/)
  assert.equal((spec.match(/^\| (?:Empty|Encoding|Adjacency|Ordering|Idempotency|Concurrency) \| R\d/gm) ?? []).length, 18)
  assert.match(spec, /Coverage：5\/5 条禁止项已处理，0 条未解决/)
  assert.equal((spec.match(/^\| 不得/gm) ?? []).length, 5)
  assert.match(spec, /不得引入 Pyodide、后端 kernel、文件上传或任意用户代码执行/)
  assert.match(spec, /Stage 5 的完整浏览器矩阵、移动端视觉收口和端到端一致性审计/)
  assert.match(spec, /Phase 24B Homepage Focus、Phase 24C Spine progressive disclosure/)
})
