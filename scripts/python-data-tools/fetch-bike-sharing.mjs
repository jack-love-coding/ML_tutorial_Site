import { execFile as execFileCallback } from 'node:child_process'
import { mkdtemp, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import {
  parseBikeSharingCsv,
  sha256,
  validateBikeSharingRecords,
} from './bikeSharingContract.mjs'

const execFile = promisify(execFileCallback)
const DOWNLOAD_URL = 'https://archive.ics.uci.edu/static/public/275/bike+sharing+dataset.zip'
const MAX_UNZIP_BUFFER = 64 * 1024 * 1024
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const outputDirectory = join(repoRoot, 'public', 'datasets', 'python-data-tools')
const csvPath = join(outputDirectory, 'bike-sharing-hour.csv')
const manifestPath = join(outputDirectory, 'manifest.json')
const csvNextPath = `${csvPath}.next`
const manifestNextPath = `${manifestPath}.next`

async function runUnzip(args) {
  const { stdout } = await execFile('unzip', args, {
    encoding: 'buffer',
    maxBuffer: MAX_UNZIP_BUFFER,
    windowsHide: true,
  })
  return stdout
}

async function extractHourCsv(archivePath) {
  try {
    const exactBytes = await runUnzip(['-p', archivePath, 'hour.csv'])
    if (exactBytes.byteLength > 0) return exactBytes
  } catch (error) {
    if (!error || typeof error !== 'object' || !('code' in error)) throw error
  }

  let entriesBytes
  try {
    entriesBytes = await runUnzip(['-Z1', archivePath])
  } catch (error) {
    throw new Error(`Could not list the official Bike Sharing archive with unzip: ${error instanceof Error ? error.message : String(error)}`)
  }
  const entriesSource = new TextDecoder('utf-8', { fatal: true }).decode(entriesBytes)
  const matches = entriesSource
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((entry) => basename(entry.replaceAll('\\', '/')) === 'hour.csv')
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one archive entry with basename hour.csv; found ${matches.length}${matches.length ? `: ${matches.join(', ')}` : ''}`)
  }

  try {
    const bytes = await runUnzip(['-p', archivePath, matches[0]])
    if (bytes.byteLength === 0) throw new Error('the extracted file was empty')
    return bytes
  } catch (error) {
    throw new Error(`Could not extract ${JSON.stringify(matches[0])} from the official Bike Sharing archive: ${error instanceof Error ? error.message : String(error)}`)
  }
}

async function removeNextFiles() {
  await Promise.all([
    rm(csvNextPath, { force: true }),
    rm(manifestNextPath, { force: true }),
  ])
}

let temporaryDirectory
try {
  console.log(`Fetching official Bike Sharing archive: ${DOWNLOAD_URL}`)
  const response = await fetch(DOWNLOAD_URL)
  if (!response.ok) {
    throw new Error(`Official Bike Sharing download failed with HTTP ${response.status} ${response.statusText}`)
  }

  temporaryDirectory = await mkdtemp(join(tmpdir(), 'ml-atlas-bike-sharing-'))
  const archivePath = join(temporaryDirectory, 'bike-sharing-dataset.zip')
  await writeFile(archivePath, Buffer.from(await response.arrayBuffer()))
  const bytes = await extractHourCsv(archivePath)

  let source
  try {
    source = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch (error) {
    throw new Error(`Official hour.csv is not valid UTF-8: ${error instanceof Error ? error.message : String(error)}`)
  }
  const { columns, records } = parseBikeSharingCsv(source)
  const validationIssues = validateBikeSharingRecords(records)
  if (validationIssues.length > 0) {
    throw new Error(`Official hour.csv failed Bike Sharing record validation:\n${validationIssues.join('\n')}`)
  }

  const manifest = {
    contractVersion: 'python-data-tools-v1',
    dataset: {
      name: 'Bike Sharing Dataset',
      repository: 'UCI Machine Learning Repository',
      page: 'https://archive.ics.uci.edu/dataset/275/bike+sharing+dataset',
      download: DOWNLOAD_URL,
      doi: '10.24432/C5W894',
      license: {
        id: 'CC-BY-4.0',
        name: 'Creative Commons Attribution 4.0 International',
        url: 'https://creativecommons.org/licenses/by/4.0/',
      },
      retrievedAt: '2026-07-14',
    },
    dictionaryVersion: 'bike-sharing-hour-v1',
    file: {
      upstreamName: 'hour.csv',
      publicPath: '/datasets/python-data-tools/bike-sharing-hour.csv',
      encoding: 'utf-8',
      delimiter: 'comma',
      sha256: sha256(bytes),
      bytes: bytes.byteLength,
      rows: records.length,
      columns: columns.length,
      columnOrder: columns,
    },
  }

  await mkdir(outputDirectory, { recursive: true })
  await removeNextFiles()
  await Promise.all([
    writeFile(csvNextPath, bytes),
    writeFile(manifestNextPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8'),
  ])
  await rename(csvNextPath, csvPath)
  await rename(manifestNextPath, manifestPath)

  const persistedBytes = await readFile(csvPath)
  const persistedHash = sha256(persistedBytes)
  if (persistedHash !== manifest.file.sha256) {
    throw new Error(`Persisted snapshot hash mismatch: expected ${manifest.file.sha256}, observed ${persistedHash}`)
  }
  console.log(`Bike Sharing snapshot updated: ${manifest.file.rows} rows, ${manifest.file.bytes} bytes, sha256 ${manifest.file.sha256}`)
} catch (error) {
  await removeNextFiles().catch(() => {})
  console.error(`Bike Sharing fetch failed:\n${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
} finally {
  if (temporaryDirectory) await rm(temporaryDirectory, { recursive: true, force: true })
}
