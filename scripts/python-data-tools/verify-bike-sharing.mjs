import { readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  validatePythonDataToolsArtifacts,
  verifyBikeSharingSnapshot,
} from './bikeSharingContract.mjs'

const defaultRepoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

function defaultArtifactUrls(repoRoot) {
  const datasetDirectory = join(repoRoot, 'public', 'datasets', 'python-data-tools')
  const notebookDirectory = join(repoRoot, 'public', 'notebooks', 'python-data-tools')
  return {
    dataset: join(datasetDirectory, 'bike-sharing-hour.csv'),
    manifest: join(datasetDirectory, 'manifest.json'),
    dictionary: join(datasetDirectory, 'data-dictionary.json'),
    environment: join(notebookDirectory, 'environment.json'),
    requirements: join(notebookDirectory, 'requirements.txt'),
  }
}

async function readRequiredArtifact(name, location, encoding) {
  try {
    return await readFile(location, encoding)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${name} artifact could not be read: ${message}`, { cause: error })
  }
}

function parseRequiredJson(name, source) {
  try {
    return JSON.parse(source)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`${name} artifact contains malformed JSON: ${message}`, { cause: error })
  }
}

export async function verifyPythonDataToolsArtifacts({
  repoRoot = defaultRepoRoot,
  artifactUrls = {},
} = {}) {
  const locations = { ...defaultArtifactUrls(repoRoot), ...artifactUrls }
  const [bytes, manifestSource, dictionarySource, environmentSource, requirements] = await Promise.all([
    readRequiredArtifact('dataset', locations.dataset),
    readRequiredArtifact('manifest', locations.manifest, 'utf8'),
    readRequiredArtifact('dictionary', locations.dictionary, 'utf8'),
    readRequiredArtifact('environment', locations.environment, 'utf8'),
    readRequiredArtifact('requirements', locations.requirements, 'utf8'),
  ])
  const manifest = parseRequiredJson('manifest', manifestSource)
  const dictionary = parseRequiredJson('dictionary', dictionarySource)
  const environment = parseRequiredJson('environment', environmentSource)
  const snapshot = verifyBikeSharingSnapshot(bytes, manifest)
  const issues = [
    ...snapshot.issues,
    ...validatePythonDataToolsArtifacts({ manifest, dictionary, environment, requirements }),
  ]
  if (issues.length > 0) throw new Error(issues.join('\n'))
  return snapshot
}

async function main() {
  try {
    const { observed } = await verifyPythonDataToolsArtifacts()
    console.log(`Bike Sharing snapshot verified: ${observed.rows} rows, sha256 ${observed.sha256}`)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`Bike Sharing verification failed:\n${message}`)
    process.exitCode = 1
  }
}

const isDirectExecution = process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url
if (isDirectExecution) {
  await main()
}
