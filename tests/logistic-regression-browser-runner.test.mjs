import test from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'

const runner = await import(new URL('../scripts/qa/run-logistic-regression-browser-matrix.mjs', import.meta.url).href)

function fakeChild() {
  const child = new EventEmitter()
  child.stdout = new EventEmitter()
  child.stderr = new EventEmitter()
  child.exitCode = null
  child.signals = []
  child.kill = (signal) => { child.signals.push(signal); return true }
  return child
}

const immediateSchedule = (callback) => { queueMicrotask(callback); return Symbol('timer') }
const noOpClear = () => {}

test('Phase 29 browser runner reports synchronous spawn errors deterministically', async () => {
  await assert.rejects(
    runner.runBoundedProcess({ command: 'missing-cli', spawnProcess: () => { throw new Error('ENOENT') } }),
    /could not spawn: ENOENT/,
  )
})

test('Phase 29 browser runner preserves stderr on child errors', async () => {
  const child = fakeChild()
  const run = runner.runBoundedProcess({ command: 'playwright-cli', spawnProcess: () => child, schedule: immediateSchedule, clear: noOpClear, forwardOutput: false })
  child.stderr.emit('data', 'browser protocol failed')
  child.emit('error', new Error('socket closed'))
  await assert.rejects(run, /socket closed[\s\S]*stderr:[\s\S]*browser protocol failed/)
})

test('Phase 29 browser runner bounds stuck commands and terminates their process group', async () => {
  const child = fakeChild()
  await assert.rejects(
    runner.runBoundedProcess({ command: 'playwright-cli', timeoutMs: 1, spawnProcess: () => child, schedule: immediateSchedule, clear: noOpClear }),
    /timed out after 1ms/,
  )
  await new Promise((resolve) => queueMicrotask(resolve))
  assert.deepEqual(child.signals, ['SIGTERM', 'SIGKILL'])
})

test('Phase 29 browser runner cleanup force-stops a preview that does not exit', async () => {
  const child = fakeChild()
  await runner.stopProcess(child, { timeoutMs: 1, schedule: immediateSchedule, clear: noOpClear })
  assert.deepEqual(child.signals, ['SIGTERM', 'SIGKILL'])
})

test('Phase 29 browser runner bounds preview startup and reports preview spawn errors', async () => {
  const timeoutPreview = fakeChild()
  await assert.rejects(
    runner.waitForPreviewReady(timeoutPreview, { timeoutMs: 1, schedule: immediateSchedule, clear: noOpClear }),
    /did not start within 1ms/,
  )
  const failedPreview = fakeChild()
  const ready = runner.waitForPreviewReady(failedPreview, { schedule: immediateSchedule, clear: noOpClear })
  failedPreview.stderr.emit('data', 'EADDRINUSE')
  failedPreview.emit('error', new Error('listen failed'))
  await assert.rejects(ready, /could not start: listen failed[\s\S]*EADDRINUSE/)
})

test('Phase 29 browser runner recognizes Vite readiness through ANSI-decorated CI output', async () => {
  const preview = fakeChild()
  const ready = runner.waitForPreviewReady(preview, { timeoutMs: 100 })
  preview.stderr.emit('data', '\u001b[32m➜\u001b[39m Local: http://127.0.0.1:\u001b[1m4173\u001b[22m/ML_tutorial_Site/')
  assert.match(await ready, /127\.0\.0\.1/)
})
