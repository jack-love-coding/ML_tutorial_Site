import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import test from 'node:test'
import { resolve } from 'node:path'
import {
  numericalBatch2ChapterIds,
  numericalBatch2NotebookForModule,
} from '../src/modules/math-lab/data/numericalBatch2Notebook.ts'
import {
  mathLearningPhases,
  numericalDeepeningModuleIds,
} from '../src/modules/math-lab/data/mathCourseOrder.ts'
import { mathLabModuleRegistry, mathLabModules } from '../src/modules/math-lab/data/modules.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

const root = resolve(import.meta.dirname, '..')

function absolutePublicPath(publicPath: string): string {
  assert.match(publicPath, /^\//)
  return resolve(root, 'public', publicPath.slice(1))
}

function readJson(path: string): any {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function assertBilingual(value: { 'zh-CN': string; en: string }, label: string): void {
  assert.match(value['zh-CN'], /[\u3400-\u9fff]/, `${label} needs Chinese copy`)
  assert.match(value.en, /[A-Za-z]/, `${label} needs English copy`)
}

test('SMS snapshot locks official provenance, complete rows, labels, duplicates, and representation rules', () => {
  const manifestPath = resolve(root, 'public/datasets/numerical-methods/sms-spam-manifest.json')
  const dictionaryPath = resolve(root, 'public/datasets/numerical-methods/sms-spam-data-dictionary.json')
  const csvPath = resolve(root, 'public/datasets/numerical-methods/sms-spam.csv')
  const manifest = readJson(manifestPath)
  const dictionary = readJson(dictionaryPath)

  assert.equal(manifest.contractVersion, 'numerical-methods-sms-v1')
  assert.deepEqual(manifest.dataset, {
    name: 'SMS Spam Collection',
    creators: ['Tiago Almeida', 'José María Gómez Hidalgo'],
    repository: 'UCI Machine Learning Repository',
    datasetId: 228,
    doi: '10.24432/C5CC84',
    page: 'https://archive.ics.uci.edu/dataset/228/sms+spam+collection',
    download: 'https://archive.ics.uci.edu/static/public/228/sms+spam+collection.zip',
    license: 'CC BY 4.0',
    retrievedAt: '2026-07-20',
    sourceArchiveSha256: '1587ea43e58e82b14ff1f5425c88e17f8496bfcdb67a583dbff9eefaf9963ce3',
    sourceTextSha256: '7d039a24a6083ed9ef0f806ebad56bbb976e3aeb8de05669173bfdc4996c239d',
  })
  assert.deepEqual(manifest.transformation, {
    sourceFile: 'SMSSpamCollection',
    operations: [
      'strict-utf8-decode',
      'split-leading-label-at-first-tab',
      'add-one-based-stable-row-id',
      'write-rfc4180-compatible-csv',
    ],
    textNormalization: false,
    deduplication: false,
    randomSampling: false,
    duplicateMessageCount: 403,
  })
  assert.deepEqual(manifest.representationContract, {
    documentId: 'sms_id',
    label: 'label',
    text: 'message',
    tokenPattern: "[a-z0-9']+",
    minimumDocumentFrequency: 5,
    idf: 'log((1 + n_documents) / (1 + document_frequency)) + 1',
    rowNormalization: 'l2',
  })
  assert.deepEqual(manifest.file, {
    publicPath: '/datasets/numerical-methods/sms-spam.csv',
    encoding: 'utf-8',
    delimiter: 'comma',
    sha256: 'd43a9b9fe1530f4cc58a1e01ad23ee466283c9abce4a83be17b199899bd584f8',
    bytes: 507860,
    rows: 5574,
    columns: 3,
    columnOrder: ['sms_id', 'label', 'message'],
    labelCounts: { ham: 4827, spam: 747 },
  })
  assert.equal(statSync(csvPath).size, manifest.file.bytes)
  assert.equal(sha256(csvPath), manifest.file.sha256)
  assert.equal(readFileSync(csvPath, 'utf8').startsWith('sms_id,label,message\n1,ham,'), true)
  assert.equal(dictionary.contractVersion, 'numerical-methods-sms-v1')
  assert.deepEqual(dictionary.fields.map((field: { name: string }) => field.name), ['sms_id', 'label', 'message'])
  for (const field of dictionary.fields) {
    assertBilingual(field, `dictionary field ${field.name}`)
  }

  const builder = readFileSync(resolve(root, 'scripts/numerical-methods/build-sms-spam-snapshot.py'), 'utf8')
  assert.match(builder, /Unreviewed SMS archive SHA-256/)
  assert.match(builder, /names != \{SOURCE_FILENAME, "readme"\}/)
  assert.match(builder, /Expected 5574 messages/)
})

test('executed Batch 2 notebooks and output manifest lock two independent reproducible cases', () => {
  const outputDirectory = resolve(root, 'public/notebooks/numerical-methods/batch-2-outputs')
  const manifest = readJson(resolve(outputDirectory, 'manifest.json'))
  const sparse = readJson(resolve(outputDirectory, 'sms-sparse-summary.json'))
  const pca = readJson(resolve(outputDirectory, 'ames-pca-summary.json'))

  assert.equal(manifest.contractVersion, 'numerical-methods-batch-2-v1')
  assert.deepEqual(manifest.datasets.map((dataset: { id: string }) => dataset.id), ['sms-spam', 'ames-housing-numeric'])
  assert.deepEqual(manifest.notebooks.map((notebook: { moduleId: string }) => notebook.moduleId), ['sparse-matrices', 'pca'])
  assert.deepEqual(manifest.outputs.map((output: { outputId: string }) => output.outputId), ['sms-sparse-summary', 'ames-pca-summary'])
  for (const item of [...manifest.datasets, ...manifest.notebooks, ...manifest.outputs]) {
    const path = absolutePublicPath(item.publicPath)
    assert.equal(existsSync(path), true, `${item.publicPath} must exist`)
    assert.equal(sha256(path), item.sha256, `${item.publicPath} hash drifted`)
    if ('bytes' in item) assert.equal(statSync(path).size, item.bytes)
  }
  assert.equal(
    sha256(resolve(root, manifest.generator.path)),
    manifest.generator.sha256,
    'Notebook generator hash drifted',
  )

  assert.deepEqual({ rows: sparse.rows, columns: sparse.columns, nnz: sparse.nnz }, {
    rows: 5574,
    columns: 1881,
    nnz: 69798,
  })
  assert.equal(sparse.density, 0.006657132768967793)
  assert.equal(sparse.averageNonzerosPerRow, 12.522066738428418)
  assert.equal(sparse.denseBytesFloat64, 83877552)
  assert.equal(sparse.csrBytes, 859876)
  assert.equal(sparse.denseToCsrRatio, 97.54610199610177)
  assert.deepEqual(sparse.manualRow, {
    rowIndex: 17,
    start: 283,
    end: 299,
    entries: 16,
    manualDot: -0.49780595596063804,
    libraryDot: -0.49780595596063804,
    absoluteDifference: 0,
  })

  assert.deepEqual({ rows: pca.rows, columns: pca.columns }, { rows: 2927, columns: 8 })
  assert.deepEqual(pca.explainedVarianceRatio.slice(0, 4), [
    0.518075870456838,
    0.19923611508890943,
    0.12135149015146957,
    0.08284263453370773,
  ])
  assert.equal(pca.componentsForAtLeast90Percent, 4)
  assert.equal(pca.twoComponentExplainedVariance, 0.7173119855457475)
  assert.equal(pca.cumulativeExplainedVariance[3], 0.9215061102309249)
  assert.equal(pca.twoComponentStandardizedRmse, 0.531684130338919)
  assert.equal(pca.k90StandardizedRmse, 0.2801676101355673)
  assert.equal(pca.spectralDifference, 1.3322676295501878e-15)
})

test('exactly two Batch 2 companions expose downloads, fixed outputs, and bilingual teaching copy', () => {
  assert.deepEqual(numericalBatch2ChapterIds, ['sparse-matrices', 'pca'])
  const companions = numericalBatch2ChapterIds.map((moduleId) => numericalBatch2NotebookForModule(moduleId))
  assert.ok(companions.every(Boolean))
  assert.equal(numericalBatch2NotebookForModule('condition-numbers'), undefined)
  assert.deepEqual(
    mathLabModules.map(({ id }) => numericalBatch2NotebookForModule(id)?.moduleId).filter(Boolean),
    numericalBatch2ChapterIds,
  )

  for (const companion of companions) {
    assert.ok(companion)
    assert.ok(companion.codeExample.trim())
    assert.match(companion.notebook.publicPath, /^\/notebooks\/numerical-methods\/.*\.ipynb$/)
    assert.match(companion.dataset.publicPath, /^\/datasets\/numerical-methods\/.*\.csv$/)
    assert.equal(companion.requirements.publicPath, '/notebooks/numerical-methods/requirements.txt')
    for (const asset of [companion.notebook, companion.dataset, companion.requirements]) {
      assert.equal(existsSync(absolutePublicPath(asset.publicPath)), true)
      assertBilingual(asset.label, `${companion.moduleId} ${asset.filename} label`)
      assertBilingual(asset.description, `${companion.moduleId} ${asset.filename} description`)
    }
    for (const [label, value] of [
      ['title', companion.title],
      ['description', companion.description],
      ['code title', companion.codeTitle],
      ['code output', companion.codeOutput],
    ] as const) assertBilingual(value, `${companion.moduleId} ${label}`)
  }

  assert.match(companions[0]!.codeOutput['zh-CN'], /5574, 1881.*69798/s)
  assert.match(companions[0]!.codeOutput['zh-CN'], /97\.55x/)
  assert.match(companions[1]!.codeOutput['zh-CN'], /2927, 8/)
  assert.match(companions[1]!.codeOutput['zh-CN'], /4 个主成分.*0\.280168/s)
})

test('sparse and PCA chapters mount one real-case animation, one shared illustration, and one lab placement', () => {
  const expected = {
    'sparse-matrices': {
      video: '/manim/numerical-methods/sms-csr-matvec.mp4',
      poster: '/manim/numerical-methods/sms-csr-matvec-poster.png',
      outputSection: 'v3-sparse-sms-storage-output',
      labId: 'sparse-matrix-storage-lab',
    },
    pca: {
      video: '/manim/numerical-methods/ames-pca-projection.mp4',
      poster: '/manim/numerical-methods/ames-pca-projection-poster.png',
      outputSection: 'v3-pca-ames-spectrum-output',
      labId: 'pca-projection-lab',
    },
  } as const

  for (const moduleId of numericalBatch2ChapterIds) {
    const moduleDefinition = mathLabModuleRegistry[moduleId]
    const contract = expected[moduleId]
    const batchVideos = moduleDefinition.visuals.filter(({ assetPath }) => assetPath === contract.video)
    const sharedImages = moduleDefinition.visuals.filter(({ id }) => id === 'numerical-representation-cases-illustration')
    assert.equal(batchVideos.length, 1)
    assert.equal(batchVideos[0]!.posterPath, contract.poster)
    assert.equal(sharedImages.length, 1)
    assert.equal(sharedImages[0]!.assetPath, '/math-lab/numerical-methods/sparse-pca-two-cases.png')
    assert.equal(moduleDefinition.sections.filter(({ id }) => id === contract.outputSection).length, 1)
    assert.equal(moduleDefinition.sections.filter(({ labIds }) => labIds?.includes(contract.labId)).length, 1)
    for (const assetPath of [contract.video, contract.poster, sharedImages[0]!.assetPath!]) {
      assert.ok(moduleDefinition.importedAssetPaths.includes(assetPath))
      assert.equal(existsSync(absolutePublicPath(assetPath)), true)
    }
    assert.doesNotMatch(JSON.stringify(moduleDefinition), /证据/)
  }

  assert.equal(
    sha256(resolve(root, 'public/math-lab/numerical-methods/sparse-pca-two-cases.png')),
    '61fdf91088593c24d30109fbde0d0fcb4139064471853f6fa57fcff7c0edbcc9',
  )
})

test('Batch 2 formula content renders through the safe KaTeX path', () => {
  const source = numericalBatch2ChapterIds.flatMap((moduleId) => {
    const moduleDefinition = mathLabModuleRegistry[moduleId]
    return moduleDefinition.sections
      .filter(({ id }) => id.startsWith('v3-sparse-') || id.startsWith('v3-pca-ames'))
      .flatMap((section) => [section.content['zh-CN'], section.content.en])
  }).join('\n\n')
  const html = renderMarkdownWithMath(source)

  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\$\$|<script|onerror=/i)
})

test('stage four and the numerical route share one exact nine-chapter order', () => {
  const stageFour = mathLearningPhases.find(({ id }) => id === 'data-geometry-numerics')
  assert.ok(stageFour)
  assert.deepEqual(stageFour.moduleIds, numericalDeepeningModuleIds)
  assert.deepEqual(numericalDeepeningModuleIds, [
    'least-squares-fitting',
    'lu-decomposition',
    'condition-numbers',
    'sparse-matrices',
    'pca',
    'finite-difference-methods',
    'nonlinear-equations',
    'optimization',
    'training-diagnostics',
  ])
})
