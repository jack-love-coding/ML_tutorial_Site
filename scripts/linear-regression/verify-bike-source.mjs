#!/usr/bin/env node

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import {
  BIKE_SHARING_COLUMNS,
  parseBikeSharingCsv,
  sha256,
  validatePythonDataToolsArtifacts,
  verifyBikeSharingSnapshot,
} from '../python-data-tools/bikeSharingContract.mjs'

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))
const datasetRoot = resolve(repoRoot, 'public/datasets/python-data-tools')
const notebookRoot = resolve(repoRoot, 'public/notebooks/python-data-tools')
const csvPath = resolve(datasetRoot, 'bike-sharing-hour.csv')
const manifestPath = resolve(datasetRoot, 'manifest.json')
const dictionaryPath = resolve(datasetRoot, 'data-dictionary.json')
const environmentPath = resolve(notebookRoot, 'environment.json')
const requirementsPath = resolve(notebookRoot, 'requirements.txt')

const FEATURE_ORDER = Object.freeze([
  'temp',
  'hum',
  'windspeed',
  'workingday',
  'hr',
])
const CONTINUOUS_FEATURES = Object.freeze([
  'temp',
  'hum',
  'windspeed',
  'hr',
])
const SPLIT_INDEX = 13_903

function fail(issues) {
  throw new Error(`Bike source contract failed:\n- ${issues.join('\n- ')}`)
}

function projectBoundaryRecord(record) {
  return Object.fromEntries(BIKE_SHARING_COLUMNS.map((column) => [column, record[column]]))
}

async function main() {
  const [
    csvBytes,
    manifestSource,
    dictionarySource,
    environmentSource,
    requirements,
  ] = await Promise.all([
    readFile(csvPath),
    readFile(manifestPath, 'utf8'),
    readFile(dictionaryPath, 'utf8'),
    readFile(environmentPath, 'utf8'),
    readFile(requirementsPath, 'utf8'),
  ])
  const manifest = JSON.parse(manifestSource)
  const dictionary = JSON.parse(dictionarySource)
  const environment = JSON.parse(environmentSource)

  const artifactIssues = validatePythonDataToolsArtifacts({
    manifest,
    dictionary,
    environment,
    requirements,
  })
  if (artifactIssues.length > 0) fail(artifactIssues)

  const verified = verifyBikeSharingSnapshot(csvBytes, manifest)
  if (verified.issues.length > 0) fail(verified.issues)
  if (sha256(csvBytes) !== verified.observed.sha256) {
    fail(['Existing Bike SHA-256 helper disagreed with snapshot verification'])
  }

  const { columns, records } = parseBikeSharingCsv(csvBytes.toString('utf8'))
  if (records.length !== verified.observed.rows || columns.length !== BIKE_SHARING_COLUMNS.length) {
    fail(['Existing Bike parser disagreed with committed snapshot verification'])
  }

  const dictionaryFields = Object.fromEntries(
    dictionary.fields.map((field) => [field.name, field]),
  )
  const result = {
    contractVersion: 'linear-regression-bike-source-v1',
    source: {
      datasetId: 'uci-bike-sharing-hour',
      publicPath: manifest.file.publicPath,
      sha256: verified.observed.sha256,
      bytes: verified.observed.bytes,
      rows: verified.observed.rows,
      doi: manifest.dataset.doi,
      license: manifest.dataset.license,
      attribution: `${manifest.dataset.repository}: ${manifest.dataset.name}`,
    },
    schema: {
      version: manifest.dictionaryVersion,
      columns: verified.observed.columns,
      columnOrder: verified.observed.columnOrder,
    },
    rowOrder: {
      rule: 'committed CSV order with strictly increasing instant',
      firstInstant: Number(records[0].instant),
      lastInstant: Number(records.at(-1).instant),
    },
    split: {
      kind: 'chronological-first-80-percent',
      index: SPLIT_INDEX,
      trainRows: SPLIT_INDEX,
      testRows: records.length - SPLIT_INDEX,
    },
    features: {
      order: FEATURE_ORDER,
      continuous: CONTINUOUS_FEATURES,
      binaryUnscaled: ['workingday'],
      collinearityOnly: ['atemp'],
      leakageExcluded: ['casual', 'registered'],
    },
    target: {
      name: 'cnt',
      role: dictionaryFields.cnt.role,
      relationship: dictionaryFields.cnt.relationship,
      unit: 'hourly rental count',
      residualSign: 'prediction - actual',
    },
    boundaryRecords: {
      first: projectBoundaryRecord(records[0]),
      trainEnd: projectBoundaryRecord(records[SPLIT_INDEX - 1]),
      testStart: projectBoundaryRecord(records[SPLIT_INDEX]),
      last: projectBoundaryRecord(records.at(-1)),
    },
  }
  process.stdout.write(`${JSON.stringify(result)}\n`)
}

main().catch((error) => {
  process.stderr.write(`ERROR: ${error instanceof Error ? error.message : String(error)}\n`)
  process.exitCode = 1
})
