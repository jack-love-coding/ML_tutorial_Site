import test from 'node:test'
import assert from 'node:assert/strict'
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { checkPairedMasters } from '../scripts/python-data-tools/check-paired-masters.mjs'

const repositoryRoot = new URL('../', import.meta.url)
const authorityRoot = new URL(
  '../docs/curriculum-v3/python-data-tools/',
  import.meta.url,
)

function withFixture(run: (root: string) => void) {
  const temporaryDirectory = mkdtempSync(join(tmpdir(), 'python-data-tools-paired-'))
  const root = join(temporaryDirectory, 'python-data-tools')
  cpSync(authorityRoot, root, { recursive: true })
  try {
    run(root)
  } finally {
    rmSync(temporaryDirectory, { recursive: true, force: true })
  }
}

function replaceInFixture(root: string, locale: 'chinese-master' | 'english-master', file: string, from: string, to: string) {
  const path = join(root, locale, file)
  const source = readFileSync(path, 'utf8')
  assert.ok(source.includes(from), `${file} fixture seam must contain ${from}`)
  writeFileSync(path, source.replace(from, to), 'utf8')
}

test('the complete eight-pair preflight is read-only and reports every authority pair', () => {
  const files = [
    ...Array.from({ length: 8 }, (_, index) => new URL(
      `../docs/curriculum-v3/python-data-tools/chinese-master/0${index + 1}-`,
      import.meta.url,
    )),
  ]
  const before = new Map<string, Buffer>()
  for (const locale of ['chinese-master', 'english-master'] as const) {
    for (const file of [
      '01-notebook-workflow.md',
      '02-numpy-foundations.md',
      '03-pandas-structures.md',
      '04-pandas-analysis.md',
      '05-matplotlib-visualization.md',
      '06-seaborn-statistics.md',
      '07-plotly-exploration.md',
      '08-analysis-report.md',
    ]) {
      const path = new URL(`../docs/curriculum-v3/python-data-tools/${locale}/${file}`, import.meta.url)
      before.set(path.href, readFileSync(path))
    }
  }

  const result = checkPairedMasters()
  assert.equal(result.chapterCount, 8)
  assert.equal(result.pairCount, 8)
  assert.equal(result.cellCount > 0, true)
  assert.equal(result.promptCount, 5)
  assert.equal(result.resultPresentationCount, 8)

  for (const [href, bytes] of before) {
    assert.deepEqual(readFileSync(new URL(href)), bytes)
  }
  assert.equal(files.length, 8)
})

test('the CLI checks all eight pairs and offers no selected-chapter mode', () => {
  const result = spawnSync(process.execPath, ['scripts/python-data-tools/check-paired-masters.mjs'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr || result.stdout)
  assert.match(result.stdout, /8 bilingual chapter pairs/i)

  const selected = spawnSync(process.execPath, [
    'scripts/python-data-tools/check-paired-masters.mjs', '--chapter', 'numpy-foundations',
  ], { cwd: repositoryRoot, encoding: 'utf8' })
  assert.notEqual(selected.status, 0)
  assert.match(selected.stderr, /unknown argument.*--chapter/i)
})

test('missing or renamed authority files fail with locale, file, chapter, and course marker diagnostics', () => {
  withFixture((root) => {
    const expected = join(root, 'english-master', '03-pandas-structures.md')
    renameSync(expected, join(root, 'english-master', '03-pandas-table.md'))
    assert.throws(
      () => checkPairedMasters({ root }),
      /\[en\].*03-pandas-structures\.md.*pandas-structures.*\[course-files\].*missing/si,
    )
  })
})

test('marker order, Python bytes, formulas, numeric facts, and output bindings must match', () => {
  const cases = [
    {
      file: '02-numpy-foundations.md',
      from: '<!-- cell: ch02-index-slice role: compute -->',
      to: '<!-- cell: ch02-index-slice-late role: compute -->',
      diagnostic: /\[en\].*02-numpy-foundations\.md.*numpy-foundations.*\[cell:ch02-index-slice\].*first mismatch/si,
    },
    {
      file: '03-pandas-structures.md',
      from: 'rides.head(3)',
      to: 'rides.head(4)',
      diagnostic: /\[en\].*03-pandas-structures\.md.*pandas-structures.*\[cell:ch03-parse-date\].*Python bytes/si,
    },
    {
      file: '06-seaborn-statistics.md',
      from: '\\operatorname{cov}(X,Y)',
      to: '\\operatorname{cov}(Y,X)',
      diagnostic: /\[en\].*06-seaborn-statistics\.md.*seaborn-statistics.*\[formula:1\].*first mismatch/si,
    },
    {
      file: '03-pandas-structures.md',
      from: 'other 16 original fields',
      to: 'other 17 original fields',
      diagnostic: /\[en\].*03-pandas-structures\.md.*pandas-structures.*\[numeric-statements\].*17/si,
    },
    {
      file: '04-pandas-analysis.md',
      from: 'output: workingday-comparison',
      to: 'output: dataset-shape-schema',
      diagnostic: /\[en\].*04-pandas-analysis\.md.*pandas-analysis.*\[cell:ch04-workingday-groups\].*output binding/si,
    },
  ] as const

  for (const fixtureCase of cases) {
    withFixture((root) => {
      replaceInFixture(root, 'english-master', fixtureCase.file, fixtureCase.from, fixtureCase.to)
      assert.throws(() => checkPairedMasters({ root }), fixtureCase.diagnostic)
    })
  }
})

test('prompt and result-presentation markers require complete localized field shapes', () => {
  withFixture((root) => {
    replaceInFixture(
      root,
      'english-master',
      '02-numpy-foundations.md',
      '### Reference reasoning\n\n`demand` is a one-dimensional array',
      '### Reference reasoning\n\n### Common misconceptions\n\n`demand` is a one-dimensional array',
    )
    assert.throws(
      () => checkPairedMasters({ root }),
      /\[en\].*02-numpy-foundations\.md.*numpy-foundations.*\[teaching-prompt:shape-index\].*referenceReasoning.*empty/si,
    )
  })

  withFixture((root) => {
    replaceInFixture(
      root,
      'english-master',
      '03-pandas-structures.md',
      '### Static summary\n\nIf the structured table',
      '### Static summary\n\n## Analysis findings\n\nIf the structured table',
    )
    assert.throws(
      () => checkPairedMasters({ root }),
      /\[en\].*03-pandas-structures\.md.*pandas-structures.*\[result-presentation:dataset-shape-schema\].*fallbackSummary.*empty/si,
    )
  })
})

test('invalid UTF-8, mojibake, placeholders, and learner-visible internal terminology are rejected', () => {
  withFixture((root) => {
    const path = join(root, 'english-master', '01-notebook-workflow.md')
    writeFileSync(path, Buffer.from([0xc3, 0x28]))
    assert.throws(
      () => checkPairedMasters({ root }),
      /\[en\].*01-notebook-workflow\.md.*notebook-workflow.*\[utf-8\].*invalid/si,
    )
  })

  for (const [text, diagnostic] of [
    ['This is Ã© broken prose.', /\[en\].*\[visible-prose\].*mojibake/si],
    ['TODO: translate this section.', /\[en\].*\[visible-prose\].*placeholder/si],
    ['The evidence manifest output is shown here.', /\[en\].*\[visible-prose\].*internal term.*evidence/si],
  ] as const) {
    withFixture((root) => {
      replaceInFixture(
        root,
        'english-master',
        '01-notebook-workflow.md',
        'Reliable analysis follows',
        `${text}\n\nReliable analysis follows`,
      )
      assert.throws(() => checkPairedMasters({ root }), diagnostic)
    })
  }
})
