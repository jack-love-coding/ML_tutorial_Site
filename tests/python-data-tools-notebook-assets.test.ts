import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import {
  pythonDataToolsContract,
  type NotebookCellRole,
  type PythonDataToolsOutputId,
} from '../src/data/pythonNotebookContract.ts'

const root = new URL('../', import.meta.url)
const notebookUrl = new URL('public/notebooks/python-data-tools/python-data-tools-bike-sharing.zh-CN.ipynb', root)
const outputDirectory = new URL('public/notebooks/python-data-tools/outputs/', root)
const outputManifestUrl = new URL('manifest.json', outputDirectory)
const environmentUrl = new URL('public/notebooks/python-data-tools/environment.json', root)
const fontUrl = new URL('public/fonts/python-data-tools/NotoSansSC-Variable.ttf', root)
const fontMetadataUrl = new URL('public/fonts/python-data-tools/metadata.json', root)
const fontLicenseUrl = new URL('public/fonts/python-data-tools/OFL.txt', root)

const sha256 = (bytes: Uint8Array | string): string => createHash('sha256').update(bytes).digest('hex')
const readJson = async (url: URL) => JSON.parse(await readFile(url, 'utf8'))

const pngDimensions = (bytes: Buffer): [number, number] => {
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
  assert.equal(bytes.subarray(12, 16).toString('ascii'), 'IHDR')
  return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)]
}

const assertFiniteJson = (value: unknown, path = 'root'): void => {
  if (typeof value === 'number') assert.ok(Number.isFinite(value), `${path} must be finite`)
  if (Array.isArray(value)) value.forEach((nested, index) => assertFiniteJson(nested, `${path}[${index}]`))
  if (value && typeof value === 'object') {
    for (const [key, nested] of Object.entries(value)) assertFiniteJson(nested, `${path}.${key}`)
  }
}

test('locked execution environment and local Chinese font are complete and auditable', async () => {
  const [environment, fontMetadata, fontBytes, license] = await Promise.all([
    readJson(environmentUrl),
    readJson(fontMetadataUrl),
    readFile(fontUrl),
    readFile(fontLicenseUrl, 'utf8'),
  ])

  assert.equal(environment.python, '3.12.13')
  assert.deepEqual(environment.executionPackages, { nbclient: '0.11.0', ipykernel: '7.3.0' })
  assert.equal(fontMetadata.upstreamCommit, 'ec0464b978de222073645d6d3366f3fdf03376d8')
  assert.equal(fontMetadata.license.id, 'OFL-1.1')
  assert.equal(fontMetadata.file.sha256, sha256(fontBytes))
  assert.equal(fontMetadata.file.bytes, fontBytes.byteLength)
  assert.match(license, /SIL OPEN FONT LICENSE Version 1\.1/)
})

test('executed Notebook preserves all source cells and typed output cell mappings', async () => {
  const notebook = await readJson(notebookUrl)
  const codeCells = notebook.cells.filter((cell: { cell_type: string }) => cell.cell_type === 'code')
  const allowedRoles = new Set<NotebookCellRole>(pythonDataToolsContract.cellRoles)
  const sourceIds = new Set<string>()
  const notebookIds = new Set<string>()

  assert.equal(notebook.nbformat, 4)
  assert.equal(notebook.metadata.kernelspec.name, 'python3')
  assert.equal(notebook.metadata.language_info.version, '3.12.13')
  assert.equal(notebook.metadata.mlAtlas.contractVersion, 'python-data-tools-v1')
  assert.equal(codeCells.length, 48)

  for (const [index, cell] of codeCells.entries()) {
    const metadata = cell.metadata.mlAtlas
    assert.ok(metadata)
    assert.ok(allowedRoles.has(metadata.role))
    assert.ok(!sourceIds.has(metadata.sourceCellId), `duplicate source id ${metadata.sourceCellId}`)
    assert.ok(!notebookIds.has(cell.id), `duplicate notebook id ${cell.id}`)
    sourceIds.add(metadata.sourceCellId)
    notebookIds.add(cell.id)
    assert.equal(cell.execution_count, index + 1)
    assert.ok(!cell.outputs.some((output: { output_type: string }) => output.output_type === 'error'))
    const source = Array.isArray(cell.source) ? cell.source.join('') : cell.source
    assert.doesNotMatch(source, /https?:\/\/|\/Users\/|[A-Za-z]:\\/)
    assert.doesNotMatch(JSON.stringify(cell.outputs), /\/Users\/|\/var\/folders\/|ipykernel_\d+/)
  }

  for (const output of pythonDataToolsContract.outputs) {
    const cell = codeCells.find((candidate: { metadata: { mlAtlas: { outputId?: string } } }) => (
      candidate.metadata.mlAtlas.outputId === output.id
    ))
    assert.ok(cell, `missing output cell ${output.id}`)
    assert.equal(cell.id, output.cellId)
    assert.equal(cell.metadata.mlAtlas.chapterId, output.chapterId)
    assert.match(cell.metadata.mlAtlas.sourceCellId, /^ch\d{2}-/)
  }
})

test('output manifest binds notebook, environment, font, and all eight artifact hashes', async () => {
  const [manifest, notebookBytes, environmentBytes, fontBytes] = await Promise.all([
    readJson(outputManifestUrl),
    readFile(notebookUrl),
    readFile(environmentUrl),
    readFile(fontUrl),
  ])

  assert.equal(manifest.contractVersion, 'python-data-tools-v1')
  assert.equal(manifest.notebook.sha256, sha256(notebookBytes))
  assert.equal(manifest.environment.sha256, sha256(environmentBytes))
  assert.equal(manifest.font.sha256, sha256(fontBytes))
  assert.deepEqual(manifest.outputs.map(({ id }: { id: string }) => id), pythonDataToolsContract.outputs.map(({ id }) => id))

  for (const output of manifest.outputs) {
    const filename = output.publicPath.split('/').at(-1)
    const bytes = await readFile(new URL(filename, outputDirectory))
    assert.equal(output.sha256, sha256(bytes), `${output.id} hash`)
    assert.equal(output.bytes, bytes.byteLength, `${output.id} bytes`)
    const contract = pythonDataToolsContract.outputs.find(({ id }) => id === output.id)
    assert.ok(contract)
    assert.equal(output.cellId, contract.cellId)
    assert.equal(output.kind, contract.kind)
    if (output.kind === 'png') {
      assert.deepEqual(pngDimensions(bytes), [output.width, output.height])
      assert.equal(output.dpi, 160)
      assert.ok(output.alt.trim())
      assert.equal(output.fontPublicPath, '/fonts/python-data-tools/NotoSansSC-Variable.ttf')
    }
  }
})

test('cell output previews are extracted from the same executed Notebook into local safe assets', async () => {
  const [manifest, previews, notebookBytes, previewBytes] = await Promise.all([
    readJson(outputManifestUrl),
    readJson(new URL('cell-output-previews.json', outputDirectory)),
    readFile(notebookUrl),
    readFile(new URL('cell-output-previews.json', outputDirectory)),
  ])

  assert.equal(manifest.cellOutputs.publicPath, '/notebooks/python-data-tools/outputs/cell-output-previews.json')
  assert.equal(manifest.cellOutputs.sha256, sha256(previewBytes))
  assert.equal(manifest.cellOutputs.bytes, previewBytes.byteLength)
  assert.equal(manifest.cellOutputs.cellCount, 48)
  assert.equal(manifest.cellOutputs.assetCount, 8)
  assert.equal(previews.notebookSha256, sha256(notebookBytes))
  assert.equal(previews.cells.length, 48)
  assert.equal(new Set(previews.cells.map(({ sourceCellId }: { sourceCellId: string }) => sourceCellId)).size, 48)

  const items = previews.cells.flatMap(({ items }: { items: Array<Record<string, unknown>> }) => items)
  assert.deepEqual(
    Object.fromEntries(['success', 'text', 'image', 'plotly'].map((kind) => [kind, items.filter((item: any) => item.kind === kind).length])),
    { success: 9, text: 32, image: 7, plotly: 1 },
  )
  assert.doesNotMatch(JSON.stringify(previews), /text\/html|<script|<iframe|onerror=/i)

  for (const item of items.filter((candidate: any) => candidate.kind === 'image' || candidate.kind === 'plotly') as any[]) {
    assert.ok(item.description['zh-CN'].trim())
    assert.ok(item.description.en.trim())
    const bytes = await readFile(new URL(`public${item.publicPath}`, root))
    assert.equal(item.sha256, sha256(bytes))
    assert.equal(item.bytes, bytes.byteLength)
    if (item.kind === 'image') assert.deepEqual(pngDimensions(bytes), [item.width, item.height])
    if (item.kind === 'plotly') {
      const figure = JSON.parse(bytes.toString('utf8'))
      assert.ok(Array.isArray(figure.data))
      assert.equal(typeof figure.layout, 'object')
    }
  }
})

test('JSON and Plotly outputs satisfy deterministic schema and statistics boundaries', async () => {
  const [schema, workingday, correlation, plotly, finalEvidence] = await Promise.all([
    readJson(new URL('dataset-shape-schema.json', outputDirectory)),
    readJson(new URL('workingday-comparison.json', outputDirectory)),
    readJson(new URL('pearson-correlation-matrix.json', outputDirectory)),
    readJson(new URL('plotly-hourly-explorer.plotly.json', outputDirectory)),
    readJson(new URL('final-analysis-evidence.json', outputDirectory)),
  ])
  for (const output of [schema, workingday, correlation, plotly, finalEvidence]) assertFiniteJson(output)

  assert.equal(schema.rows, 17_379)
  assert.equal(schema.columns, 17)
  assert.equal(schema.all_counts_reconcile, true)
  assert.equal(workingday.records.length, 48)
  assert.deepEqual(
    workingday.records.map(({ workingday, hr }: { workingday: number; hr: number }) => [workingday, hr]),
    [0, 1].flatMap((workingday) => Array.from({ length: 24 }, (_, hr) => [workingday, hr])),
  )
  assert.deepEqual(correlation.columns, ['temp', 'atemp', 'hum', 'windspeed', 'casual', 'registered', 'cnt'])
  assert.equal(correlation.matrix.length, 7)
  assert.ok(correlation.matrix.every((row: number[]) => row.length === 7))
  correlation.matrix.forEach((row: number[], index: number) => assert.equal(row[index], 1))
  assert.match(correlation.guardrail['zh-CN'], /相关不代表因果/)
  assert.deepEqual(plotly.defaultFilterState, {
    hours: [0, 23],
    workingday_values: [0, 1],
    metric: 'mean_rentals',
    hidden_groups: [],
  })
  assert.doesNotMatch(JSON.stringify(plotly), /"uid"|https?:\/\//)

  assert.deepEqual(finalEvidence.source_outputs, [
    'dataset-shape-schema',
    'hourly-demand-profile',
    'workingday-comparison',
    'season-weather-distribution',
    'rider-composition',
    'pearson-correlation-matrix',
    'plotly-hourly-explorer',
  ])
  assert.deepEqual(Object.keys(finalEvidence.evidence).sort(), [
    'relationships', 'riderComposition', 'season', 'time', 'weather', 'workingDay',
  ])
  assert.match(finalEvidence.evidence.relationships.limitation, /相关不代表因果/)
  assert.deepEqual(finalEvidence.excludes, ['预测', '因果识别', '显著性判断', '数据清洗'])
  assert.equal(finalEvidence.handoff_route, '/data-lab')
})

test('generation scripts expose clean execution, check mode, cleanup, and atomic publication', async () => {
  const [builder, generator, verifier, failureInjection, runtimeModule] = await Promise.all([
    readFile(new URL('scripts/python-data-tools/build-notebook.py', root), 'utf8'),
    readFile(new URL('scripts/python-data-tools/generate-authoritative-outputs.py', root), 'utf8'),
    readFile(new URL('scripts/python-data-tools/verify-authoritative-outputs.py', root), 'utf8'),
    readFile(new URL('tests/python-data-tools-atomic-publication.py', root), 'utf8'),
    readFile(new URL('src/data/pythonNotebookModule.ts', root), 'utf8'),
  ])

  assert.match(builder, /build_notebook/)
  assert.match(builder, /sourceCellId/)
  assert.match(generator, /NotebookClient/)
  assert.match(generator, /allow_errors=False/)
  assert.match(generator, /record_timing=False/)
  assert.match(generator, /extract_cell_output_previews/)
  assert.match(generator, /validate_cell_output_previews/)
  assert.match(generator, /--check/)
  assert.match(generator, /tempfile\.mkdtemp/)
  assert.match(generator, /rename\(transaction_dir, OUTPUT_DIR\)/)
  assert.match(generator, /rename_operation/)
  assert.match(generator, /shutil\.rmtree/)
  assert.match(failureInjection, /injected notebook publication failure/)
  assert.match(failureInjection, /old-notebook/)
  assert.match(failureInjection, /old-output/)
  assert.match(verifier, /validate_outputs/)
  assert.match(runtimeModule, /slug: 'python-notebook'/)
  assert.doesNotMatch(runtimeModule, /python-data-tools\/outputs|python-data-tools-bike-sharing/)
  assert.equal(fileURLToPath(notebookUrl).includes('/public/notebooks/python-data-tools/'), true)
  assert.ok((await stat(notebookUrl)).size > 100_000)
})
