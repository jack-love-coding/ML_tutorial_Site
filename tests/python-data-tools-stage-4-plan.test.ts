import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'

const plansDirectory = new URL('../docs/superpowers/plans/', import.meta.url)
const planPattern = /^2026-07-15-python-data-tools-stage-4-(\d{2})-PLAN\.md$/

const planNames = (await readdir(plansDirectory))
  .filter((name) => planPattern.test(name))
  .sort()
const plans = new Map(
  await Promise.all(planNames.map(async (name) => [name, await readFile(new URL(name, plansDirectory), 'utf8')] as const)),
)
const combinedPlans = [...plans.values()].join('\n')

const validation = await readFile(
  new URL('2026-07-15-python-data-tools-stage-4-validation.md', plansDirectory),
  'utf8',
)
const research = await readFile(
  new URL('2026-07-15-python-data-tools-stage-4-research.md', plansDirectory),
  'utf8',
)

function frontmatter(source: string): string {
  return source.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
}

test('Stage 4 plan set contains twelve structurally complete executable plans', () => {
  assert.deepEqual(
    planNames.map((name) => name.match(planPattern)?.[1]),
    Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0')),
  )

  for (const [name, source] of plans) {
    const metadata = frontmatter(source)
    assert.match(metadata, /^phase: python-data-tools-stage-4$/m, `${name}: phase`)
    assert.match(metadata, /^plan: "\d{2}"$/m, `${name}: plan ID`)
    assert.match(metadata, /^wave: \d+$/m, `${name}: wave`)
    assert.match(metadata, /^depends_on: \[[^\n]*\]$/m, `${name}: dependencies`)
    assert.match(metadata, /^requirements: \[[^\n]+\]$/m, `${name}: requirements`)
    assert.match(source, /^## Artifacts this phase produces$/m, `${name}: artifacts section`)

    const tasks = source.match(/<task\b[\s\S]*?<\/task>/g) ?? []
    assert.ok(tasks.length >= 2 && tasks.length <= 3, `${name}: expected two or three tasks`)
    for (const task of tasks) {
      for (const tag of ['read_first', 'action', 'acceptance_criteria', 'verify', 'automated', 'done']) {
        assert.match(task, new RegExp(`<${tag}(?:\\s[^>]*)?>`), `${name}: task missing <${tag}>`)
      }
    }
  }
})

test('Stage 4 plan dependencies resolve in earlier waves and match the approved graph', () => {
  const expected = {
    '01': { wave: 1, dependencies: [] },
    '02': { wave: 2, dependencies: ['01'] },
    '03': { wave: 2, dependencies: ['01'] },
    '04': { wave: 3, dependencies: ['02'] },
    '05': { wave: 4, dependencies: ['02', '03', '04'] },
    '06': { wave: 1, dependencies: [] },
    '07': { wave: 5, dependencies: ['05', '06'] },
    '08': { wave: 6, dependencies: ['07'] },
    '09': { wave: 7, dependencies: ['05', '07', '08'] },
    '10': { wave: 1, dependencies: [] },
    '11': { wave: 8, dependencies: ['09', '10'] },
    '12': { wave: 9, dependencies: ['11'] },
  } as const

  const actual = Object.fromEntries([...plans.entries()].map(([name, source]) => {
    const id = name.match(planPattern)?.[1] ?? ''
    const metadata = frontmatter(source)
    const wave = Number(metadata.match(/^wave: (\d+)$/m)?.[1])
    const dependencies = [...(metadata.match(/^depends_on: \[([^\n]*)\]$/m)?.[1].matchAll(/"(\d{2})"/g) ?? [])]
      .map((match) => match[1])
    return [id, { wave, dependencies }]
  }))

  assert.deepEqual(actual, expected)
  for (const [id, { wave, dependencies }] of Object.entries(actual)) {
    for (const dependency of dependencies) {
      assert.ok(dependency in actual, `${id}: unknown dependency ${dependency}`)
      assert.ok(actual[dependency].wave < wave, `${id}: dependency ${dependency} must be in an earlier wave`)
    }
  }
})

test('Stage 4 plans cover every locked requirement and decision', () => {
  for (const id of Array.from({ length: 8 }, (_, index) => `R${index + 1}`)) {
    assert.match(combinedPlans, new RegExp(`\\b${id}\\b`), `missing ${id}`)
  }
  for (const id of Array.from({ length: 19 }, (_, index) => `D-${String(index + 1).padStart(2, '0')}`)) {
    assert.match(combinedPlans, new RegExp(`\\b${id}\\b`), `missing ${id}`)
  }
  assert.match(combinedPlans, /all 18 edge rows/i)
  assert.match(combinedPlans, /all five prohibition families/i)
})

test('Stage 4 plans lock redirects, review IDs, teaching language, and static prompts', () => {
  for (const redirect of [
    'notebook-rhythm → notebook-workflow',
    'numpy-arrays → numpy-foundations',
    'pandas-tables → pandas-structures',
    'sklearn-small-model → pandas-analysis',
    'reproducible-handoff → analysis-report',
  ]) {
    assert.ok(combinedPlans.includes(redirect), `missing redirect ${redirect}`)
  }
  for (const id of [
    'python-data-tools-grouped-analysis-interpretation',
    'python-data-tools-correlation-not-causation',
  ]) {
    assert.ok(combinedPlans.includes(id), `missing review ID ${id}`)
  }
  for (const label of ['运行结果', '图表解读', '分析发现', '需要注意']) {
    assert.ok(combinedPlans.includes(label), `missing learner label ${label}`)
  }
  assert.match(combinedPlans, /no form\/input\/answer controls/)
  assert.match(combinedPlans, /no form\/input\/answer controls, emit, local completion ref, storage\/progress\/network import, score, reset, or gate/)
  assert.doesNotMatch(combinedPlans, /check-paired-masters\.mjs --chapters/)
})

test('Stage 4 validation assigns all nine waves and the bounded browser smoke', () => {
  const ownershipRows = validation.match(/^\| [1-9] \|.+\|$/gm) ?? []
  assert.equal(ownershipRows.length, 9)
  assert.ok(ownershipRows.every((row) => /Plan \d{2}/.test(row)))
  assert.equal((validation.match(/^- \[ \] `tests\/python-data-tools-[^`]+`/gm) ?? []).length, 8)
  for (const gate of ['npm test', 'npm run build', 'npm run build:pages', 'git diff --check']) {
    assert.ok(validation.includes(gate), `missing final gate ${gate}`)
  }
  assert.match(validation, /Plan 12 Task 3 owns this single post-integration browser check/)
  assert.match(validation, /root\/canonical chapter\/no-console\/basic-navigation browser smoke/)
  assert.match(validation, /Stage 5 desktop\/mobile, cross-locale, keyboard, reduced-motion, resource-failure, or full visual matrix/i)
  assert.match(validation, /Stage 5/)
})

test('Stage 4 research resolves the Plotly decision through a blocking approval plan', () => {
  assert.match(research, /^## Open Questions \(RESOLVED\)$/m)
  assert.match(research, /Plan 06 must rerun the read-only package-legitimacy audit and obtain explicit human approval/)
  assert.match(research, /Plan 07 remains blocked until that approval is recorded/)

  const plan06 = plans.get('2026-07-15-python-data-tools-stage-4-06-PLAN.md') ?? ''
  const plan07 = plans.get('2026-07-15-python-data-tools-stage-4-07-PLAN.md') ?? ''
  assert.match(plan06, /<task type="checkpoint:human-verify" gate="blocking-human">/)
  assert.match(plan06, /plotly\.js-basic-dist-min@3\.7\.0/)
  assert.match(plan06, /@types\/plotly\.js@3\.0\.10/)
  assert.match(frontmatter(plan07), /^depends_on: \["05", "06"\]$/m)
  assert.match(plan07, /After verifying Plan 06 recorded explicit approval/)
  assert.match(plan07, /--save-exact/)
})
