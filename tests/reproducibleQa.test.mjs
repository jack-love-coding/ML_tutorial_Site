import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, writeFileSync, mkdtempSync, readdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

test('browser runners explicitly select the locked Chromium configuration', () => {
  const config = JSON.parse(readFileSync('scripts/qa/browser.config.json', 'utf8'))
  assert.deepEqual(config.browser, { browserName: 'chromium', launchOptions: { channel: 'chromium', headless: true } })
  for (const file of readdirSync('scripts/qa').filter(file => /^run-.*\.mjs$/.test(file))) {
    const source = readFileSync('scripts/qa/' + file, 'utf8')
    if (!source.includes('playwright-cli')) continue
    assert.match(source, /\['open', '--config', 'scripts\/qa\/browser.config.json'/, file)
  }
})

test('strict offline preflight fails rather than skipping or populating an absent cache', () => {
  const directory = mkdtempSync(join(tmpdir(), 'ml-atlas-empty-offline-'))
  try {
    const result = spawnSync('python3', ['scripts/check-offline-environment.py', '--cache-root', directory], { encoding: 'utf8' })
    assert.equal(result.status, 1)
    assert.match(result.stderr, /Offline preflight failed:/)
    assert.match(result.stderr, /Python\/platform|wheel cache|wheel-cache|Audited wheel/i)
    assert.deepEqual(readdirSync(directory), [])
  } finally { rmSync(directory, { recursive: true, force: true }) }
})

test('Pages release metadata identifies the deployed commit and its rollback predecessor', () => {
  const directory = mkdtempSync(join(tmpdir(), 'ml-atlas-release-'))
  try {
    writeFileSync(join(directory, 'index.html'), '<!doctype html><title>ML Atlas</title>')
    const eventPath = join(directory, 'push-event.json')
    writeFileSync(eventPath, JSON.stringify({ before: 'b'.repeat(40) }))
    const env = { ...process.env, GITHUB_SHA: 'a'.repeat(40), GITHUB_RUN_ID: '123', GITHUB_EVENT_PATH: eventPath }
    const result = spawnSync(process.execPath, ['scripts/create-pages-fallbacks.mjs', directory], { env, encoding: 'utf8' })
    assert.equal(result.status, 0, result.stderr)
    const release = JSON.parse(readFileSync(join(directory, 'release.json'), 'utf8'))
    const readings = JSON.parse(readFileSync(join(directory, 'textbook-readings.json'), 'utf8'))
    assert.deepEqual(release, {
      sha: 'a'.repeat(40), previousSha: 'b'.repeat(40), runId: '123', source: 'github-actions',
      units: readings.units.map(({ id, publicationStatus }) => ({ id, publicationStatus })),
    })
    delete env.GITHUB_SHA
    delete env.GITHUB_EVENT_PATH
    delete env.GITHUB_RUN_ID
    const local = spawnSync(process.execPath, ['scripts/create-pages-fallbacks.mjs', directory], { env, encoding: 'utf8' })
    assert.equal(local.status, 0, local.stderr)
    const unpublished = JSON.parse(readFileSync(join(directory, 'release.json'), 'utf8'))
    assert.equal(unpublished.source, 'local-unpublished')
    assert.equal(unpublished.sha, null)
    assert.equal(unpublished.previousSha, null)
  } finally { rmSync(directory, { recursive: true, force: true }) }
})
