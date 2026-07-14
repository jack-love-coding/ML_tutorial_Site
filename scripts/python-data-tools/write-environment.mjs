import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const CONTRACT_VERSION = 'python-data-tools-v1'
const HASH_PATTERN = /^[a-f0-9]{64}$/
const PUBLIC_PATH_PATTERN = /^\/(?!\/)(?:[A-Za-z0-9._-]+\/)*[A-Za-z0-9._-]+$/
const UTC_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const PLATFORM_ARCH_PATTERN = /^[a-z0-9]+-[a-z0-9]+$/
const scriptPath = fileURLToPath(import.meta.url)
const repoRoot = resolve(dirname(scriptPath), '../..')

const defaultManifestPath = resolve(
  repoRoot,
  'public/datasets/python-data-tools/manifest.json',
)
const defaultOutputPath = resolve(
  repoRoot,
  'public/notebooks/python-data-tools/environment.json',
)
const defaultFileOperations = { mkdir, rename, rm, writeFile }

function requireManifestFile(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new Error('Dataset manifest must be a JSON object')
  }
  if (manifest.contractVersion !== CONTRACT_VERSION) {
    throw new Error(
      `Dataset manifest contractVersion must be ${CONTRACT_VERSION}`,
    )
  }
  if (!manifest.file || typeof manifest.file !== 'object' || Array.isArray(manifest.file)) {
    throw new Error('Dataset manifest.file must be a JSON object')
  }
  if (!HASH_PATTERN.test(manifest.file.sha256 ?? '')) {
    throw new Error('Dataset manifest.file.sha256 must be 64 lowercase hexadecimal characters')
  }
  if (!PUBLIC_PATH_PATTERN.test(manifest.file.publicPath ?? '')) {
    throw new Error('Dataset manifest.file.publicPath must be an absolute local public path')
  }
  return manifest.file
}

function requireProvenance({ generatedAt, generatedOn } = {}) {
  let normalizedDate = ''
  if (UTC_DATE_PATTERN.test(generatedAt ?? '')) {
    const instant = new Date(`${generatedAt}T00:00:00.000Z`)
    if (!Number.isNaN(instant.getTime())) {
      normalizedDate = instant.toISOString().slice(0, 10)
    }
  }
  if (normalizedDate !== generatedAt) {
    throw new Error('Environment generatedAt must be a YYYY-MM-DD real UTC date')
  }
  if (!PLATFORM_ARCH_PATTERN.test(generatedOn ?? '')) {
    throw new Error('Environment generatedOn must be a lowercase platform-arch token')
  }
  return { generatedAt, generatedOn }
}

export function resolveProvenance({
  generatedAt,
  generatedOn,
  clock = () => new Date(),
  platform = process.platform,
  arch = process.arch,
} = {}) {
  let runtimeDate = generatedAt
  if (runtimeDate === undefined) {
    const instant = clock()
    if (!(instant instanceof Date) || Number.isNaN(instant.getTime())) {
      throw new Error('Environment clock must return a valid Date')
    }
    runtimeDate = instant.toISOString().slice(0, 10)
  }

  return requireProvenance({
    generatedAt: runtimeDate,
    generatedOn: generatedOn ?? `${platform}-${arch}`,
  })
}

export function buildEnvironment(manifest, provenance) {
  const file = requireManifestFile(manifest)
  const { generatedAt, generatedOn } = requireProvenance(provenance)

  return {
    contractVersion: CONTRACT_VERSION,
    python: '3.12.13',
    executionPackages: {
      nbclient: '0.11.0',
      ipykernel: '7.3.0',
    },
    generatedAt,
    generatedOn,
    dataset: {
      publicPath: file.publicPath,
      sha256: file.sha256,
    },
    execution: {
      cleanKernel: true,
      runOrder: 'top-to-bottom',
      networkAccess: false,
      hiddenState: false,
      randomSeedRequired: true,
      hiddenSampling: false,
      numericJson: 'finite-only',
      cellRoles: [
        'question',
        'setup',
        'data',
        'compute',
        'visualize',
        'interpret',
        'limit',
        'handoff',
      ],
    },
  }
}

export async function writeEnvironment({
  manifestPath = defaultManifestPath,
  outputPath = defaultOutputPath,
  generatedAt,
  generatedOn,
  clock,
  platform,
  arch,
  fileOperations = {},
} = {}) {
  const manifestSource = await readFile(manifestPath, 'utf8')
  let manifest
  try {
    manifest = JSON.parse(manifestSource)
  } catch (error) {
    throw new Error(`Dataset manifest is not valid JSON: ${error.message}`, { cause: error })
  }

  const provenance = resolveProvenance({
    generatedAt,
    generatedOn,
    clock,
    platform,
    arch,
  })
  const environment = buildEnvironment(manifest, provenance)
  const output = `${JSON.stringify(environment, null, 2)}\n`
  const operations = { ...defaultFileOperations, ...fileOperations }
  const outputDirectory = dirname(outputPath)
  const temporaryPath = join(
    outputDirectory,
    `.${basename(outputPath)}.${randomUUID()}.tmp`,
  )

  await operations.mkdir(outputDirectory, { recursive: true })
  let publicationError
  try {
    await operations.writeFile(temporaryPath, output, { encoding: 'utf8', flag: 'wx' })
    await operations.rename(temporaryPath, outputPath)
  } catch (error) {
    publicationError = error
    throw error
  } finally {
    try {
      await operations.rm(temporaryPath, { force: true })
    } catch (cleanupError) {
      if (!publicationError) throw cleanupError
    }
  }
  return output
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  writeEnvironment().catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
}
