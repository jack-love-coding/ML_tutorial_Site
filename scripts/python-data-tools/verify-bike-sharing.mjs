import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { verifyBikeSharingSnapshot } from './bikeSharingContract.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const datasetDirectory = join(repoRoot, 'public', 'datasets', 'python-data-tools')

try {
  const [bytes, manifestSource] = await Promise.all([
    readFile(join(datasetDirectory, 'bike-sharing-hour.csv')),
    readFile(join(datasetDirectory, 'manifest.json'), 'utf8'),
  ])
  const manifest = JSON.parse(manifestSource)
  const { observed, issues } = verifyBikeSharingSnapshot(bytes, manifest)
  if (issues.length > 0) throw new Error(issues.join('\n'))
  console.log(`Bike Sharing snapshot verified: ${observed.rows} rows, sha256 ${observed.sha256}`)
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Bike Sharing verification failed:\n${message}`)
  process.exitCode = 1
}
