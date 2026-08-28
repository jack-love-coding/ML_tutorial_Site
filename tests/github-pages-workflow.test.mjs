import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const workflow = readFileSync(
  new URL('../.github/workflows/deploy-pages.yml', import.meta.url),
  'utf8',
)
const packageJson = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
)

test('GitHub Pages installs ffprobe before running media validation tests', () => {
  const mediaToolsIndex = workflow.indexOf('- name: Install media validation tools')
  const testIndex = workflow.indexOf('- name: Test')

  assert.ok(mediaToolsIndex >= 0, 'workflow must install FFmpeg and ffprobe')
  assert.ok(testIndex > mediaToolsIndex, 'media tools must be installed before npm test')
  assert.match(workflow, /sudo apt-get install --no-install-recommends -y ffmpeg/)
  assert.match(workflow, /ffprobe -version/)
})

test('GitHub Pages prepares the pinned Notebook smoke-test runtime before npm test', () => {
  const setupPythonIndex = workflow.indexOf('- name: Setup Python')
  const installNotebookDependenciesIndex = workflow.indexOf(
    '- name: Install Notebook smoke-test dependencies',
  )
  const testIndex = workflow.indexOf('- name: Test')

  assert.ok(setupPythonIndex >= 0, 'workflow must configure Python')
  assert.ok(
    installNotebookDependenciesIndex > setupPythonIndex,
    'Notebook dependencies must be installed after Python is configured',
  )
  assert.ok(
    testIndex > installNotebookDependenciesIndex,
    'Notebook smoke-test dependencies must be installed before npm test',
  )
  assert.match(
    workflow,
    /actions\/setup-python@83679a892e2d95755f2dac6acb0bfd1e9ac5d548 # v6\.1\.0/,
  )
  assert.match(workflow, /python-version: '3\.12'/)
  assert.match(
    workflow,
    /python -m pip install --disable-pip-version-check -r public\/gradient-descent\/v1\/requirements\.txt/,
  )
  assert.match(
    workflow,
    /-r public\/notebooks\/numerical-methods\/requirements\.txt/,
    'Phase 29 parity tests must receive the existing pinned scikit-learn runtime',
  )
})

test('strict local release-asset verification remains an explicit opt-in command', () => {
  const releaseCommand = packageJson.scripts['test:release-assets']

  assert.match(releaseCommand, /ML_ATLAS_REQUIRE_LOCAL_RELEASE_ASSETS=1/)
  assert.match(releaseCommand, /loss-functions-dataset-contract\.test\.ts/)
  assert.match(releaseCommand, /loss-functions-notebook-assets\.test\.ts/)
  assert.match(releaseCommand, /linear-regression-notebook-assets\.test\.ts/)
})
