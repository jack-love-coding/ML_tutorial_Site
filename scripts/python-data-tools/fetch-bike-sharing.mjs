import { execFile as execFileCallback } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { access, mkdtemp, mkdir, open, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
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
const MAX_ARCHIVE_BYTES = 32 * 1024 * 1024
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const outputDirectory = join(repoRoot, 'public', 'datasets', 'python-data-tools')
const csvPath = join(outputDirectory, 'bike-sharing-hour.csv')
const manifestPath = join(outputDirectory, 'manifest.json')

async function runUnzip(args) {
  const { stdout } = await execFile('unzip', args, {
    encoding: 'buffer',
    maxBuffer: MAX_UNZIP_BUFFER,
    windowsHide: true,
  })
  return stdout
}

export function selectHourCsvEntry(entries) {
  if (!Array.isArray(entries)) throw new TypeError('Archive entries must be an array')
  const matches = entries
    .filter((entry) => typeof entry === 'string' && entry.length > 0)
    .filter((entry) => basename(entry.replaceAll('\\', '/')) === 'hour.csv')
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one archive entry with basename hour.csv; found ${matches.length}${matches.length ? `: ${matches.join(', ')}` : ''}`)
  }
  return matches[0]
}

async function extractHourCsv(archivePath) {
  let entriesBytes
  try {
    entriesBytes = await runUnzip(['-Z1', archivePath])
  } catch (error) {
    throw new Error(`Could not list the official Bike Sharing archive with unzip: ${error instanceof Error ? error.message : String(error)}`)
  }
  const entriesSource = new TextDecoder('utf-8', { fatal: true }).decode(entriesBytes)
  const entry = selectHourCsvEntry(entriesSource
    .split(/\r?\n/)
    .filter(Boolean))

  try {
    const bytes = await runUnzip(['-p', archivePath, entry])
    if (bytes.byteLength === 0) throw new Error('the extracted file was empty')
    return bytes
  } catch (error) {
    throw new Error(`Could not extract ${JSON.stringify(entry)} from the official Bike Sharing archive: ${error instanceof Error ? error.message : String(error)}`)
  }
}

async function pathExists(path) {
  try {
    await access(path)
    return true
  } catch (error) {
    if (error && typeof error === 'object' && error.code === 'ENOENT') return false
    throw error
  }
}

export async function readResponseBytes(response, maximumBytes = MAX_ARCHIVE_BYTES) {
  if (!Number.isSafeInteger(maximumBytes) || maximumBytes <= 0) {
    throw new RangeError(`Maximum download size must be a positive safe integer; received ${maximumBytes}`)
  }
  const contentLengthSource = response?.headers?.get?.('content-length')
  if (contentLengthSource !== null && contentLengthSource !== undefined) {
    const contentLength = Number(contentLengthSource)
    if (Number.isFinite(contentLength) && contentLength > maximumBytes) {
      throw new Error(`Official Bike Sharing archive Content-Length ${contentLength} exceeds the ${maximumBytes} byte limit`)
    }
  }
  if (!response?.body || typeof response.body.getReader !== 'function') {
    throw new Error('Official Bike Sharing archive response has no readable body')
  }

  const reader = response.body.getReader()
  const chunks = []
  let totalBytes = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (!(value instanceof Uint8Array)) {
        throw new Error('Official Bike Sharing archive response yielded a non-byte chunk')
      }
      totalBytes += value.byteLength
      if (totalBytes > maximumBytes) {
        await reader.cancel?.().catch(() => {})
        throw new Error(`Official Bike Sharing archive exceeded the ${maximumBytes} byte limit while streaming`)
      }
      chunks.push(Buffer.from(value.buffer, value.byteOffset, value.byteLength))
    }
  } finally {
    reader.releaseLock?.()
  }
  return Buffer.concat(chunks, totalBytes)
}

export async function publishSnapshotPair({
  csvPath: targetCsvPath,
  manifestPath: targetManifestPath,
  csvBytes,
  manifestBytes,
  verify = async () => {},
  checkpoint = async () => {},
  transactionId = `${process.pid}-${randomUUID()}`,
  remove = rm,
}) {
  if (typeof transactionId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(transactionId)) {
    throw new Error(`Transaction id must contain only letters, numbers, underscores, or hyphens; received ${JSON.stringify(transactionId)}`)
  }
  const lockPath = `${targetManifestPath}.lock`
  const csvNextPath = `${targetCsvPath}.next.${transactionId}`
  const manifestNextPath = `${targetManifestPath}.next.${transactionId}`
  const csvPreviousPath = `${targetCsvPath}.previous.${transactionId}`
  const manifestPreviousPath = `${targetManifestPath}.previous.${transactionId}`
  const transactionPaths = [csvNextPath, manifestNextPath, csvPreviousPath, manifestPreviousPath]
  const warnings = []
  let csvBackedUp = false
  let manifestBackedUp = false
  let csvPublished = false
  let manifestPublished = false
  let committed = false
  let lockHandle

  await Promise.all([
    mkdir(dirname(targetCsvPath), { recursive: true }),
    mkdir(dirname(targetManifestPath), { recursive: true }),
  ])
  try {
    lockHandle = await open(lockPath, 'wx')
    await lockHandle.writeFile(`${transactionId}\n`, 'utf8')
  } catch (error) {
    if (lockHandle) {
      await lockHandle.close().catch(() => {})
      await rm(lockPath, { force: true }).catch(() => {})
    }
    if (error && typeof error === 'object' && error.code === 'EEXIST') {
      throw new Error(`Snapshot updater lock already exists at ${lockPath}; another update or a stale crashed transaction must be reviewed manually`)
    }
    throw error
  }

  try {
    const [hadCsv, hadManifest] = await Promise.all([
      pathExists(targetCsvPath),
      pathExists(targetManifestPath),
    ])
    try {
      await Promise.all([
        writeFile(csvNextPath, csvBytes, { flag: 'wx' }),
        writeFile(manifestNextPath, manifestBytes, { flag: 'wx' }),
      ])
      if (hadCsv) {
        await rename(targetCsvPath, csvPreviousPath)
        csvBackedUp = true
      }
      if (hadManifest) {
        await rename(targetManifestPath, manifestPreviousPath)
        manifestBackedUp = true
      }
      await rename(csvNextPath, targetCsvPath)
      csvPublished = true
      await checkpoint('csv-published')
      await rename(manifestNextPath, targetManifestPath)
      manifestPublished = true
      await checkpoint('manifest-published')
      await verify()
      committed = true

      for (const [backupPath, label] of [
        [csvPreviousPath, 'CSV'],
        [manifestPreviousPath, 'manifest'],
      ]) {
        try {
          await remove(backupPath, { force: true })
          if (label === 'CSV') csvBackedUp = false
          else manifestBackedUp = false
        } catch (cleanupError) {
          warnings.push(`Committed snapshot is valid, but ${label} backup cleanup failed at ${backupPath}: ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`)
        }
      }
      return { warnings }
    } catch (error) {
      if (committed) throw error
      const rollbackErrors = []
      const attempt = async (operation) => {
        try {
          await operation()
        } catch (rollbackError) {
          rollbackErrors.push(rollbackError)
        }
      }
      if (csvPublished) await attempt(() => remove(targetCsvPath, { force: true }))
      if (manifestPublished) await attempt(() => remove(targetManifestPath, { force: true }))
      if (csvBackedUp) await attempt(async () => {
        await rename(csvPreviousPath, targetCsvPath)
        csvBackedUp = false
      })
      if (manifestBackedUp) await attempt(async () => {
        await rename(manifestPreviousPath, targetManifestPath)
        manifestBackedUp = false
      })
      await Promise.all([
        remove(csvNextPath, { force: true }),
        remove(manifestNextPath, { force: true }),
      ])
      if (rollbackErrors.length > 0) {
        throw new AggregateError(rollbackErrors, `Snapshot publication failed and rollback was incomplete: ${error instanceof Error ? error.message : String(error)}`)
      }
      throw error
    }
  } finally {
    const cleanupPaths = committed
      ? [csvNextPath, manifestNextPath]
      : transactionPaths.filter((path) => {
          if (path === csvPreviousPath) return !csvBackedUp
          if (path === manifestPreviousPath) return !manifestBackedUp
          return true
        })
    await Promise.all(cleanupPaths.map((path) => remove(path, { force: true }).catch(() => {})))
    await lockHandle.close().catch((error) => {
      warnings.push(`Snapshot updater lock handle cleanup failed: ${error instanceof Error ? error.message : String(error)}`)
    })
    await rm(lockPath, { force: true }).catch((error) => {
      warnings.push(`Snapshot updater lock file cleanup failed at ${lockPath}: ${error instanceof Error ? error.message : String(error)}`)
    })
  }
}

export async function fetchBikeSharingSnapshot() {
  let temporaryDirectory
  console.log(`Fetching official Bike Sharing archive: ${DOWNLOAD_URL}`)
  try {
    const response = await fetch(DOWNLOAD_URL)
    if (!response.ok) {
      throw new Error(`Official Bike Sharing download failed with HTTP ${response.status} ${response.statusText}`)
    }

    temporaryDirectory = await mkdtemp(join(tmpdir(), 'ml-atlas-bike-sharing-'))
    const archivePath = join(temporaryDirectory, 'bike-sharing-dataset.zip')
    await writeFile(archivePath, await readResponseBytes(response))
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

    const publication = await publishSnapshotPair({
      csvPath,
      manifestPath,
      csvBytes: bytes,
      manifestBytes: `${JSON.stringify(manifest, null, 2)}\n`,
      verify: async () => {
        const persistedBytes = await readFile(csvPath)
        const persistedHash = sha256(persistedBytes)
        if (persistedHash !== manifest.file.sha256) {
          throw new Error(`Persisted snapshot hash mismatch: expected ${manifest.file.sha256}, observed ${persistedHash}`)
        }
      },
    })
    for (const warning of publication.warnings) console.warn(warning)
    console.log(`Bike Sharing snapshot updated: ${manifest.file.rows} rows, ${manifest.file.bytes} bytes, sha256 ${manifest.file.sha256}`)
  } finally {
    if (temporaryDirectory) await rm(temporaryDirectory, { recursive: true, force: true })
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await fetchBikeSharingSnapshot()
  } catch (error) {
    console.error(`Bike Sharing fetch failed:\n${error instanceof Error ? error.message : String(error)}`)
    process.exitCode = 1
  }
}
