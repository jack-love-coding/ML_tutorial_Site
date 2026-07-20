import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { curriculumModuleById } from '../src/curriculum/catalog.ts'
import {
  amesNumericalChapterIds,
  amesNumericalDatasetAsset,
  amesNumericalNotebookAsset,
  amesNumericalNotebookForModule,
  amesNumericalRequirementsAsset,
} from '../src/modules/math-lab/data/amesNumericalNotebook.ts'
import {
  learningRouteById,
  routeNavigationForModule,
  validateLearningRoutes,
} from '../src/modules/math-lab/data/learningRoutes.ts'
import { numericalDeepeningModuleIds } from '../src/modules/math-lab/data/mathCourseOrder.ts'
import { mathLabModuleRegistry, mathLabModules } from '../src/modules/math-lab/data/modules.ts'

const root = new URL('../', import.meta.url)
const datasetDirectory = new URL('public/datasets/numerical-methods/', root)
const notebookDirectory = new URL('public/notebooks/numerical-methods/', root)
const outputDirectory = new URL('outputs/', notebookDirectory)
const datasetManifestUrl = new URL('manifest.json', datasetDirectory)
const dataDictionaryUrl = new URL('data-dictionary.json', datasetDirectory)
const csvUrl = new URL('ames-housing-numeric.csv', datasetDirectory)
const notebookUrl = new URL('ames-housing-numerical-methods.zh-CN.ipynb', notebookDirectory)
const environmentUrl = new URL('environment.json', notebookDirectory)
const requirementsUrl = new URL('requirements.txt', notebookDirectory)
const outputManifestUrl = new URL('manifest.json', outputDirectory)
const generatorUrl = new URL('scripts/numerical-methods/generate-ames-notebook.py', root)

const routeModuleIds = [
  'least-squares-fitting',
  'lu-decomposition',
  'condition-numbers',
  'sparse-matrices',
  'pca',
  'finite-difference-methods',
  'nonlinear-equations',
  'optimization',
  'training-diagnostics',
] as const

const companionOutputIds = [
  'ames-least-squares-summary',
  'ames-lu-summary',
  'ames-conditioning-summary',
] as const

const expectedColumns = [
  'ames_order',
  'overall_quality',
  'year_built',
  'year_sold',
  'first_floor_sqft',
  'second_floor_sqft',
  'living_area_sqft',
  'basement_sqft',
  'garage_cars',
  'garage_area_sqft',
  'sale_price_usd',
] as const

const expectedOutputs = [
  {
    bytes: 1329,
    outputId: 'ames-least-squares-summary',
    publicPath: '/notebooks/numerical-methods/outputs/ames-least-squares-summary.json',
    sha256: '414662945d45bd585888319418a1cfbc9540f987b142e71e2c8e4ed1db50994d',
  },
  {
    bytes: 581,
    outputId: 'ames-lu-summary',
    publicPath: '/notebooks/numerical-methods/outputs/ames-lu-summary.json',
    sha256: '82d3e16377d5d4d5d728916b718e3f19307def5dfec87dce694e78d42a7db5b1',
  },
  {
    bytes: 729,
    outputId: 'ames-conditioning-summary',
    publicPath: '/notebooks/numerical-methods/outputs/ames-conditioning-summary.json',
    sha256: 'a5a6f94b0be208c263aadea951b62483d0b7114f2e9d6b7c770244e8cf44df21',
  },
] as const

const readJson = async <T = any>(url: URL): Promise<T> => JSON.parse(await readFile(url, 'utf8')) as T
const sha256 = (bytes: Uint8Array | string): string => createHash('sha256').update(bytes).digest('hex')

function publicAssetUrl(publicPath: string): URL {
  assert.match(publicPath, /^\//)
  return new URL(`public${publicPath}`, root)
}

function assertBilingual(value: { 'zh-CN': string; en: string }, label: string): void {
  assert.ok(value['zh-CN'].trim(), `${label} needs Chinese copy`)
  assert.ok(value.en.trim(), `${label} needs English copy`)
  assert.match(value['zh-CN'], /[\u3400-\u9fff]/, `${label} Chinese copy should be localized`)
  assert.match(value.en, /[A-Za-z]/, `${label} English copy should be localized`)
}

function assertFiniteJson(value: unknown, path = 'root'): void {
  if (typeof value === 'number') {
    assert.ok(Number.isFinite(value), `${path} must be finite`)
  } else if (Array.isArray(value)) {
    value.forEach((nested, index) => assertFiniteJson(nested, `${path}[${index}]`))
  } else if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) assertFiniteJson(nested, `${path}.${key}`)
  }
}

function assertClose(actual: number, expected: number, tolerance: number, label: string): void {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${label}: ${actual} should be within ${tolerance} of ${expected}`,
  )
}

test('numerical deepening keeps the exact nine-chapter order, sequential overrides, and stable URLs', () => {
  const route = learningRouteById['numerical-deepening-path']
  const expectedOverrides = Object.fromEntries(routeModuleIds.map((moduleId, index) => [
    moduleId,
    index === 0 ? [] : [routeModuleIds[index - 1]],
  ]))

  assert.deepEqual(numericalDeepeningModuleIds, routeModuleIds)
  assert.deepEqual(route.chapterModuleIds, routeModuleIds)
  assert.deepEqual(route.prerequisiteOverrides, expectedOverrides)
  assert.equal(route.nextStepRule, 'first-incomplete')
  assert.equal(route.completionVersion, undefined)
  assert.deepEqual(validateLearningRoutes([route]), [])

  for (const [index, moduleId] of routeModuleIds.entries()) {
    assert.deepEqual(routeNavigationForModule(route.id, moduleId), {
      routeId: 'numerical-deepening-path',
      displayOrder: index + 1,
      effectivePrerequisiteIds: index === 0 ? [] : [routeModuleIds[index - 1]],
      entryAssumptions: route.entryAssumptions,
      previousModuleId: routeModuleIds[index - 1],
      nextModuleId: routeModuleIds[index + 1],
    })
    assert.equal(mathLabModuleRegistry[moduleId].id, moduleId)
    assert.equal(curriculumModuleById.get(moduleId)?.source.namespace, 'math-lab')
    assert.equal(curriculumModuleById.get(moduleId)?.route, `/math-lab/modules/${moduleId}`)
  }
})

test('exactly three Ames companions share downloads, bilingual copy, and stable page-output anchors', () => {
  assert.deepEqual(amesNumericalChapterIds, routeModuleIds.slice(0, 3))

  const companions = amesNumericalChapterIds.map((moduleId) => {
    const companion = amesNumericalNotebookForModule(moduleId)
    assert.ok(companion)
    return companion
  })
  const companionModuleIds = mathLabModules
    .map(({ id }) => amesNumericalNotebookForModule(id)?.moduleId)
    .filter((moduleId) => moduleId !== undefined)

  assert.deepEqual(companionModuleIds, amesNumericalChapterIds)
  assert.equal(amesNumericalNotebookForModule('pca'), undefined)
  assert.deepEqual(companions.map(({ outputId }) => outputId), companionOutputIds)
  assert.deepEqual(companions.map(({ id }) => id), Array(3).fill('ames-housing-numerical-methods'))
  assert.deepEqual([
    amesNumericalNotebookAsset.filename,
    amesNumericalDatasetAsset.filename,
    amesNumericalRequirementsAsset.filename,
  ], [
    'ames-housing-numerical-methods.zh-CN.ipynb',
    'ames-housing-numeric.csv',
    'requirements.txt',
  ])
  assert.match(amesNumericalNotebookAsset.description['zh-CN'], /同一目录/)
  assert.match(amesNumericalNotebookAsset.description.en, /beside the downloaded CSV/)

  const expectedPageOutputs = {
    'least-squares-fitting': {
      'zh-CN': `rows = 2927 · rank = 6
β（千美元）= [180.840006, 28.882212, 26.776014, 14.874714, 10.106863, -10.010762]
RMSE = 35.834182 · MAE = 23.872932 · R² = 0.79880768
max |正规方程解 − lstsq 解| = 2.888e-12`,
      en: `rows = 2927 · rank = 6
β (kUSD) = [180.840006, 28.882212, 26.776014, 14.874714, 10.106863, -10.010762]
RMSE = 35.834182 · MAE = 23.872932 · R² = 0.79880768
max |normal-equation solution − lstsq solution| = 2.888e-12`,
    },
    'lu-decomposition': {
      'zh-CN': `system shape = [6, 6] · pivot rows = [0, 1, 2, 3, 4]
β（千美元）= [180.840006, 28.882212, 26.776014, 14.874714, 10.106863, -10.010762]
||PG − LU||∞ = 4.547e-13 · ||Gβ − c||∞ = 1.455e-11
max |手写 LUP − SciPy| = 7.105e-15
复用分解后的 log(price) 截距 = 12.02122130`,
      en: `system shape = [6, 6] · pivot rows = [0, 1, 2, 3, 4]
β (kUSD) = [180.840006, 28.882212, 26.776014, 14.874714, 10.106863, -10.010762]
||PG − LU||∞ = 4.547e-13 · ||Gβ − c||∞ = 1.455e-11
max |manual LUP − SciPy| = 7.105e-15
reused-factor log(price) intercept = 12.02122130`,
    },
    'condition-numbers': {
      'zh-CN': `κ₂(未缩放 X) = 13044.220254
κ₂(标准化 X) = 3.222571
κ₂(XᵀX) = 10.384962 ≈ κ₂(X)²
κ₂(加入近重复列) = 26644.503135
目标相对扰动 1e-5 → 系数相对变化 0.00329613（放大约 329.61 倍）
2×2 诊断：解 [1, 1] → [0, 2]`,
      en: `κ₂(unscaled X) = 13044.220254
κ₂(standardized X) = 3.222571
κ₂(XᵀX) = 10.384962 ≈ κ₂(X)²
κ₂(with near-duplicate column) = 26644.503135
relative target perturbation 1e-5 → relative coefficient change 0.00329613 (about 329.61×)
2×2 diagnostic: solution [1, 1] → [0, 2]`,
    },
  } as const

  for (const companion of companions) {
    assert.equal(companion.notebook, amesNumericalNotebookAsset)
    assert.equal(companion.dataset, amesNumericalDatasetAsset)
    assert.equal(companion.requirements, amesNumericalRequirementsAsset)
    assert.equal(companion.notebook.publicPath, '/notebooks/numerical-methods/ames-housing-numerical-methods.zh-CN.ipynb')
    assert.equal(companion.dataset.publicPath, '/datasets/numerical-methods/ames-housing-numeric.csv')
    assert.equal(companion.requirements.publicPath, '/notebooks/numerical-methods/requirements.txt')
    assert.deepEqual(companion.codeOutput, expectedPageOutputs[companion.moduleId])
    assert.ok(companion.codeExample.trim())
    for (const [field, value] of [
      ['title', companion.title],
      ['description', companion.description],
      ['codeTitle', companion.codeTitle],
      ['codeOutput', companion.codeOutput],
      ['notebook label', companion.notebook.label],
      ['notebook description', companion.notebook.description],
      ['dataset label', companion.dataset.label],
      ['dataset description', companion.dataset.description],
      ['requirements label', companion.requirements.label],
      ['requirements description', companion.requirements.description],
    ] as const) assertBilingual(value, `${companion.moduleId} ${field}`)
  }
})

test('Ames dataset manifest and CSV lock exact provenance, schema, rows, bytes, and exclusions', async () => {
  const [manifest, dictionary, csvBytes] = await Promise.all([
    readJson(datasetManifestUrl),
    readJson(dataDictionaryUrl),
    readFile(csvUrl),
  ])

  assert.equal(manifest.contractVersion, 'numerical-methods-ames-v1')
  assert.deepEqual(manifest.dataset, {
    name: 'Ames Housing',
    originalAuthor: 'Dean De Cock',
    articleDoi: '10.1080/10691898.2011.11889627',
    distribution: {
      name: 'AmesHousing',
      version: '0.0.4',
      repository: 'CRAN',
      page: 'https://cran.r-project.org/package=AmesHousing',
      download: 'https://cran.r-project.org/src/contrib/AmesHousing_0.0.4.tar.gz',
      license: 'GPL-2',
      licenseScope: 'CRAN package distribution',
      retrievedAt: '2026-07-20',
      sourceArchiveSha256: '13e2d24a129904f9edc92692f24330fea256a765eab7baf893b9695ca7031920',
      rawDataSha256: 'ca0a3c2e6d35f9bef9ebcb1c5926154853f9ff68843d83eb53ab57255367247c',
    },
  })
  assert.deepEqual(manifest.transformation, {
    sourceObject: 'ames_raw',
    sourceRows: 2930,
    operations: [
      'select-reviewed-numeric-columns',
      'strict-integer-conversion',
      'drop-only-reviewed-incomplete-rows',
      'drop-reviewed-temporal-anomaly-row',
      'rename-columns-to-snake-case',
      'sort-by-ames-order',
    ],
    excludedRows: [
      { amesOrder: 1342, missingFields: ['basement_sqft'] },
      { amesOrder: 2237, missingFields: ['garage_area_sqft', 'garage_cars'] },
      { amesOrder: 2181, invalidValues: { year_built: 2008, year_sold: 2007 } },
    ],
    imputation: false,
    randomSampling: false,
    outlierRemoval: false,
  })
  assert.deepEqual(manifest.modelContract, {
    rowId: 'ames_order',
    target: 'sale_price_usd',
    defaultFeatures: [
      'overall_quality',
      'living_area_sqft',
      'basement_sqft',
      'garage_area_sqft',
      'house_age_at_sale',
    ],
    derivedFeatures: { house_age_at_sale: 'year_sold - year_built' },
  })
  assert.deepEqual(manifest.file, {
    publicPath: '/datasets/numerical-methods/ames-housing-numeric.csv',
    encoding: 'utf-8',
    delimiter: 'comma',
    sha256: '763867f46c9a8616d7e7ea7599f4ab1cf408609c8aea06e496e65f9330df20fc',
    bytes: 135603,
    rows: 2927,
    columns: 11,
    columnOrder: expectedColumns,
  })
  assert.equal(csvBytes.byteLength, 135603)
  assert.equal(sha256(csvBytes), manifest.file.sha256)

  assert.equal(dictionary.contractVersion, manifest.contractVersion)
  assert.deepEqual(dictionary.fields.map(({ name }: { name: string }) => name), expectedColumns)
  for (const field of dictionary.fields) {
    assert.ok(field.unit.trim(), `${field.name} needs a unit`)
    assertBilingual(field, `data dictionary ${field.name}`)
  }

  const lines = csvBytes.toString('utf8').trimEnd().split(/\r?\n/)
  assert.equal(lines.length, 2928)
  assert.deepEqual(lines[0].split(','), expectedColumns)
  const rows = lines.slice(1).map((line, rowIndex) => {
    const fields = line.split(',')
    assert.equal(fields.length, 11, `CSV row ${rowIndex + 2} must have 11 fields`)
    for (const [columnIndex, value] of fields.entries()) {
      assert.match(value, /^-?\d+$/, `CSV row ${rowIndex + 2}, column ${columnIndex + 1} must be a present integer`)
    }
    return fields.map(Number)
  })

  const excludedOrders = new Set([1342, 2181, 2237])
  const expectedOrders = Array.from({ length: 2930 }, (_, index) => index + 1)
    .filter((amesOrder) => !excludedOrders.has(amesOrder))
  const orders = rows.map(([amesOrder]) => amesOrder)
  assert.deepEqual(orders, expectedOrders)
  assert.equal(new Set(orders).size, 2927)
  for (const excludedOrder of excludedOrders) assert.equal(orders.includes(excludedOrder), false)
  for (const row of rows) {
    assert.ok(row[3] >= row[2], `year_sold must not precede year_built for Ames order ${row[0]}`)
    assert.ok(row[10] > 0, `sale price must be positive for Ames order ${row[0]}`)
  }
})

test('executed Notebook and output manifest bind exact hashes to a clean sequential run', async () => {
  const [manifest, notebook, notebookBytes, environment, environmentBytes, requirementsBytes, generatorBytes] = await Promise.all([
    readJson(outputManifestUrl),
    readJson(notebookUrl),
    readFile(notebookUrl),
    readJson(environmentUrl),
    readFile(environmentUrl),
    readFile(requirementsUrl),
    readFile(generatorUrl),
  ])

  assert.equal(manifest.contractVersion, 'numerical-methods-ames-v1')
  assert.deepEqual(manifest.dataset, {
    publicPath: '/datasets/numerical-methods/ames-housing-numeric.csv',
    sha256: '763867f46c9a8616d7e7ea7599f4ab1cf408609c8aea06e496e65f9330df20fc',
  })
  assert.deepEqual(manifest.notebook, {
    bytes: 27969,
    publicPath: '/notebooks/numerical-methods/ames-housing-numerical-methods.zh-CN.ipynb',
    sha256: '0a428c9a88d8909c7de197ed88d35924487471058e53737f5caece6d40bf1e73',
  })
  assert.deepEqual(manifest.environment, {
    publicPath: '/notebooks/numerical-methods/environment.json',
    sha256: 'ecf786444b2f08f72166eb220c440c2024a695c40dcf737e0cc7e48f80996066',
  })
  assert.deepEqual(manifest.requirements, {
    publicPath: '/notebooks/numerical-methods/requirements.txt',
    sha256: '044c51329c22148baf031fb0aaf18a8378b99b92cbe84f1ada4407bade29deeb',
  })
  assert.deepEqual(manifest.generator, {
    path: 'scripts/numerical-methods/generate-ames-notebook.py',
    sha256: '557b90cc4b560890ebec640756f5c60d762ffd39919fdd9f0cfd60cd7a4abf7c',
  })
  assert.deepEqual(manifest.outputs, expectedOutputs)
  assert.equal(notebookBytes.byteLength, manifest.notebook.bytes)
  assert.equal(sha256(notebookBytes), manifest.notebook.sha256)
  assert.equal(sha256(environmentBytes), manifest.environment.sha256)
  assert.equal(sha256(requirementsBytes), manifest.requirements.sha256)
  assert.equal(sha256(generatorBytes), manifest.generator.sha256)

  assert.deepEqual(environment.execution, {
    cleanKernel: true,
    runOrder: 'top-to-bottom',
    networkAccess: false,
    hiddenState: false,
    numericJson: 'finite-only',
  })
  assert.equal(environment.python, '3.12.13')
  const requirementLines = requirementsBytes.toString('utf8').trim().split(/\r?\n/)
  assert.deepEqual(requirementLines, Object.entries(environment.packages).map(([name, version]) => `${name}==${version}`))

  assert.equal(notebook.nbformat, 4)
  assert.equal(notebook.nbformat_minor, 5)
  assert.equal(notebook.metadata.kernelspec.name, 'python3')
  assert.equal(notebook.metadata.language_info.version, '3.12.13')
  assert.equal(notebook.metadata.mlAtlas.contractVersion, 'numerical-methods-ames-v1')
  assert.deepEqual(notebook.metadata.mlAtlas.chapterIds, amesNumericalChapterIds)
  assert.deepEqual(notebook.metadata.mlAtlas.outputIds, companionOutputIds)
  assert.deepEqual(notebook.metadata.mlAtlas.dataset, manifest.dataset)

  const cellIds = notebook.cells.map(({ id }: { id: string }) => id)
  assert.equal(new Set(cellIds).size, notebook.cells.length)
  for (const id of cellIds) assert.match(id, /^[A-Za-z0-9_-]{1,64}$/)
  const codeCells = notebook.cells.filter(({ cell_type }: { cell_type: string }) => cell_type === 'code')
  assert.equal(codeCells.length, 8)
  assert.deepEqual(codeCells.map(({ execution_count }: { execution_count: number }) => execution_count), [1, 2, 3, 4, 5, 6, 7, 8])
  assert.deepEqual(codeCells.map(({ id }: { id: string }) => id), [
    'setup-environment',
    'load-reviewed-snapshot',
    'least-squares-compute',
    'least-squares-summary',
    'manual-lup-functions',
    'lu-summary',
    'conditioning-compute',
    'conditioning-summary',
  ])

  const setupSource = Array.isArray(codeCells[0].source) ? codeCells[0].source.join('') : codeCells[0].source
  assert.match(setupSource, /Path\("ames-housing-numeric\.csv"\)/)
  assert.match(setupSource, /ML_ATLAS_AMES_DATA_PATH/)
  assert.match(setupSource, /EXPECTED_DATA_SHA256/)
  assert.doesNotMatch(setupSource, /manifest\.json|DATA_MANIFEST/)
  const generatorSource = generatorBytes.toString('utf8')
  assert.match(generatorSource, /def validate_standalone_download\(/)
  assert.match(generatorSource, /validate_standalone_download\(notebook_temp\)/)

  const outputCells = []
  for (const cell of codeCells) {
    assert.equal(cell.metadata.mlAtlas.sourceCellId, cell.id)
    assert.equal(cell.outputs.some(({ output_type }: { output_type: string }) => output_type === 'error'), false)
    const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source
    assert.doesNotMatch(source, /https?:\/\//i)
    assert.doesNotMatch(source, /(?:\/Users\/|\/home\/|\/private\/|\/var\/folders\/|[A-Za-z]:\\)/)
    const renderedOutputs = JSON.stringify(cell.outputs)
    assert.doesNotMatch(renderedOutputs, /(?:\/Users\/|\/home\/|\/private\/|\/var\/folders\/|[A-Za-z]:\\|ipykernel_\d+)/)
    if (cell.metadata.mlAtlas.outputId) outputCells.push(cell)
  }
  assert.deepEqual(outputCells.map((cell) => cell.metadata.mlAtlas.outputId), companionOutputIds)

  for (const expected of expectedOutputs) {
    const bytes = await readFile(publicAssetUrl(expected.publicPath))
    const summary = JSON.parse(bytes.toString('utf8'))
    assert.equal(bytes.byteLength, expected.bytes)
    assert.equal(sha256(bytes), expected.sha256)
    assert.equal(summary.outputId, expected.outputId)
    assert.equal(summary.contractVersion, manifest.contractVersion)
    assert.equal(summary.datasetSha256, manifest.dataset.sha256)
    assertFiniteJson(summary, expected.outputId)
    const outputCell = outputCells.find((cell) => cell.metadata.mlAtlas.outputId === expected.outputId)
    assert.ok(outputCell)
    assert.deepEqual(outputCell.outputs[0].data['application/json'], summary)
  }
})

test('Notebook manual LUP rejects singular final pivots before division', async () => {
  const notebook = await readJson(notebookUrl)
  const cell = notebook.cells.find(({ id }: { id: string }) => id === 'manual-lup-functions')
  assert.ok(cell)
  const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source
  const helperSource = source.split('\ngram =')[0]
  const probe = spawnSync('python3', ['-c', `
import json
import sys
import numpy as np

namespace = {"np": np}
exec(sys.stdin.read(), namespace)
rejected = []
for matrix in (
    np.array([[1.0, 2.0], [2.0, 4.0]]),
    np.array([[1.0, 1.0], [1.0, 1.0 + 5e-16]]),
):
    try:
        namespace["lup_factor_manual"](matrix)
    except np.linalg.LinAlgError:
        rejected.append(True)
    else:
        rejected.append(False)
print(json.dumps(rejected))
`], {
    cwd: new URL('../', import.meta.url),
    encoding: 'utf8',
    input: helperSource,
  })
  assert.equal(probe.status, 0, probe.stderr)
  assert.deepEqual(JSON.parse(probe.stdout), [true, true])
})

test('Ames summaries preserve least-squares, LU, residual, and conditioning invariants', async () => {
  const [leastSquares, lu, conditioning] = await Promise.all(expectedOutputs.map(({ publicPath }) => (
    readJson(publicAssetUrl(publicPath))
  )))
  const coefficientVector = [
    leastSquares.coefficients.intercept_kusd,
    ...leastSquares.featureOrder.map((feature: string) => (
      leastSquares.coefficients[`${feature}_per_standard_deviation_kusd`]
    )),
  ]

  assert.equal(leastSquares.rows, 2927)
  assert.equal(leastSquares.rank, 6)
  assert.deepEqual(lu.solutionKusd, coefficientVector)
  assert.deepEqual(lu.systemShape, [6, 6])
  assert.ok(leastSquares.manualVsLibraryMaxAbs < 1e-9)
  assert.ok(leastSquares.maxNormalEquationResidual < 1e-8)
  assert.ok(lu.factorizationResidualInfinity < 1e-10)
  assert.ok(lu.solveResidualInfinity < 1e-8)
  assert.ok(lu.manualVsScipyMaxAbs < 1e-10)
  assert.ok(lu.luVsLstsqMaxAbs < 1e-10)

  assert.ok(conditioning.standardizedDesignCondition < conditioning.rawDesignCondition)
  assert.equal(conditioning.standardizedGramCondition, conditioning.designConditionSquared)
  assertClose(
    conditioning.standardizedGramCondition,
    conditioning.standardizedDesignCondition ** 2,
    5e-6,
    'Gram condition should equal the squared design condition',
  )
  assert.ok(conditioning.nearDuplicateDesignCondition > conditioning.standardizedDesignCondition * 1000)
  assertClose(
    conditioning.observedAmplification,
    conditioning.relativeCoefficientChange / conditioning.relativeTargetPerturbation,
    1e-3,
    'observed perturbation amplification',
  )
  assert.deepEqual(conditioning.twoByTwoBaseSolution, [1, 1])
  assert.deepEqual(conditioning.twoByTwoPerturbedSolution, [0, 2])
})

test('Ames adapter inserts bilingual sections and leaves exactly one lab placement per target', () => {
  const expectedSections = {
    'least-squares-fitting': ['ames-least-squares-problem-frame', 'ames-least-squares-output-reading'],
    'lu-decomposition': ['ames-lu-normal-system-bridge', 'ames-lu-reuse-and-checks'],
    'condition-numbers': ['ames-conditioning-scale-first', 'ames-conditioning-diagnostic-scenario'],
  } as const
  const expectedLabs = {
    'least-squares-fitting': 'least-squares-residual-lab',
    'lu-decomposition': 'lu-decomposition-solve-lab',
    'condition-numbers': 'condition-number-amplification-lab',
  } as const

  for (const moduleId of amesNumericalChapterIds) {
    const moduleDefinition = mathLabModuleRegistry[moduleId]
    const insertedSectionIds = moduleDefinition.sections.slice(1, 3).map(({ id }) => id)
    assert.deepEqual(insertedSectionIds, expectedSections[moduleId])
    assert.deepEqual(moduleDefinition.toc.slice(1, 3).map(({ id }) => id), expectedSections[moduleId])
    assert.equal(moduleDefinition.estimatedMinutes, 70)
    assert.deepEqual(moduleDefinition.labs.map(({ id }) => id), [expectedLabs[moduleId]])
    for (const assetPath of [
      '/datasets/numerical-methods/ames-housing-numeric.csv',
      '/notebooks/numerical-methods/ames-housing-numerical-methods.zh-CN.ipynb',
    ]) {
      assert.equal(
        moduleDefinition.importedAssetPaths?.filter((path) => path === assetPath).length,
        1,
        `${moduleId} should include ${assetPath} exactly once`,
      )
    }

    assertBilingual(moduleDefinition.learningObjectives[0], `${moduleId} Ames objective`)
    assertBilingual(moduleDefinition.aiModelConnections[0], `${moduleId} Ames connection`)
    for (const sectionId of expectedSections[moduleId]) {
      const section = moduleDefinition.sections.find(({ id }) => id === sectionId)
      const toc = moduleDefinition.toc.find(({ id }) => id === sectionId)
      assert.ok(section)
      assert.ok(toc)
      assert.equal(section.level, 2)
      assert.deepEqual(toc.title, section.title)
      assertBilingual(section.title, `${moduleId}/${sectionId} title`)
      assertBilingual(section.content, `${moduleId}/${sectionId} content`)
    }

    const labId = expectedLabs[moduleId]
    const placements = moduleDefinition.sections.filter(({ labIds }) => labIds?.includes(labId))
    assert.equal(placements.length, 1, `${moduleId} should place ${labId} exactly once`)
  }
})
