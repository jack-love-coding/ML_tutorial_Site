#!/usr/bin/env node
/** Execute the Phase 29 browser matrix against the already-built Pages artifact. */
import { spawn } from 'node:child_process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve(import.meta.dirname, '../..')
export const PREVIEW_READY_TIMEOUT_MS = 10_000
export const BROWSER_COMMAND_TIMEOUT_MS = 120_000
export const TERMINATION_GRACE_MS = 2_000

const defaultSchedule = (callback, delay) => setTimeout(callback, delay)
const defaultClear = (timer) => clearTimeout(timer)
const processOutput = (stream, collector) => {
  if (!stream?.on) return
  stream.on('data', (chunk) => collector(String(chunk)))
}

export function formatProcessFailure(label, detail, stderr = '') {
  const suffix = stderr.trim() ? `\nstderr:\n${stderr.trim()}` : ''
  return new Error(`${label} ${detail}${suffix}`)
}

/**
 * Terminate the child and, when detached on POSIX, its entire process group.
 * The child.kill fallback also covers Windows and test doubles without a pid.
 */
export function terminateProcess(child, signal = 'SIGTERM') {
  if (!child || child.exitCode !== null && child.exitCode !== undefined) return false
  let terminated = false
  if (process.platform !== 'win32' && Number.isInteger(child.pid) && child.pid > 0) {
    try { process.kill(-child.pid, signal); terminated = true } catch { /* Group may already be gone. */ }
  }
  try { terminated = child.kill(signal) || terminated } catch { /* Spawn errors are handled by the caller. */ }
  return terminated
}

/** Await exit/error but always settle after timeout so cleanup cannot hang a CI job. */
export function waitForProcessEnd(child, { timeoutMs = TERMINATION_GRACE_MS, schedule = defaultSchedule, clear = defaultClear } = {}) {
  if (!child || child.exitCode !== null && child.exitCode !== undefined) return Promise.resolve(true)
  return new Promise((resolveEnd) => {
    let settled = false
    const finish = (ended) => {
      if (settled) return
      settled = true
      clear(timer)
      child.removeListener?.('exit', onEnd)
      child.removeListener?.('close', onEnd)
      child.removeListener?.('error', onEnd)
      resolveEnd(ended)
    }
    const onEnd = () => finish(true)
    const timer = schedule(() => finish(false), Math.max(0, timeoutMs))
    child.once?.('exit', onEnd)
    child.once?.('close', onEnd)
    child.once?.('error', onEnd)
  })
}

/** Stop a process group gracefully, then force-stop it, without waiting indefinitely. */
export async function stopProcess(child, options = {}) {
  if (!child || child.exitCode !== null && child.exitCode !== undefined) return
  terminateProcess(child, 'SIGTERM')
  if (await waitForProcessEnd(child, options)) return
  terminateProcess(child, 'SIGKILL')
  await waitForProcessEnd(child, options)
}

/**
 * Run a command with a finite timeout and captured output. Injection points
 * keep spawn-error, timeout, and cleanup behavior deterministic in tests.
 */
export function runBoundedProcess({
  command,
  args = [],
  cwd,
  timeoutMs = BROWSER_COMMAND_TIMEOUT_MS,
  label = command,
  spawnProcess = spawn,
  schedule = defaultSchedule,
  clear = defaultClear,
  detached = process.platform !== 'win32',
  forwardOutput = true,
}) {
  return new Promise((resolveRun, rejectRun) => {
    let child
    try {
      child = spawnProcess(command, args, { cwd, detached, stdio: ['ignore', 'pipe', 'pipe'] })
    } catch (error) {
      rejectRun(formatProcessFailure(label, `could not spawn: ${error instanceof Error ? error.message : String(error)}`))
      return
    }
    let stdout = ''
    let stderr = ''
    processOutput(child.stdout, (chunk) => { stdout += chunk; if (forwardOutput) process.stdout.write(chunk) })
    processOutput(child.stderr, (chunk) => { stderr += chunk; if (forwardOutput) process.stderr.write(chunk) })
    let settled = false
    const finish = (error) => {
      if (settled) return
      settled = true
      clear(timer)
      child.removeListener?.('exit', onExit)
      child.removeListener?.('error', onError)
      if (error) rejectRun(error)
      else resolveRun({ stdout, stderr })
    }
    const onExit = (code, signal) => {
      if (code === 0) finish()
      else finish(formatProcessFailure(label, `failed with ${signal ?? `exit code ${code}`}`, stderr))
    }
    const onError = (error) => finish(formatProcessFailure(label, `could not run: ${error instanceof Error ? error.message : String(error)}`, stderr))
    const timer = schedule(() => {
      terminateProcess(child, 'SIGTERM')
      // Do not wait for a misbehaving descendant: the completion handler has a
      // finite timeout, and the process group receives a second hard stop.
      schedule(() => terminateProcess(child, 'SIGKILL'), TERMINATION_GRACE_MS)
      finish(formatProcessFailure(label, `timed out after ${timeoutMs}ms`, stderr))
    }, Math.max(0, timeoutMs))
    child.once?.('exit', onExit)
    child.once?.('error', onError)
  })
}

export function waitForPreviewReady(server, { timeoutMs = PREVIEW_READY_TIMEOUT_MS, schedule = defaultSchedule, clear = defaultClear } = {}) {
  return new Promise((resolveReady, rejectReady) => {
    let output = ''
    let settled = false
    const collect = (chunk) => {
      output += String(chunk)
      if (/127\.0\.0\.1:4173/.test(output)) finish()
    }
    processOutput(server.stdout, collect)
    processOutput(server.stderr, collect)
    const finish = (error) => {
      if (settled) return
      settled = true
      clear(timer)
      server.removeListener?.('exit', onExit)
      server.removeListener?.('error', onError)
      if (error) rejectReady(error)
      else resolveReady(output)
    }
    const onExit = (code, signal) => finish(formatProcessFailure('Pages preview', `ended before it was ready (${signal ?? `exit code ${code}`})`, output))
    const onError = (error) => finish(formatProcessFailure('Pages preview', `could not start: ${error instanceof Error ? error.message : String(error)}`, output))
    const timer = schedule(() => finish(formatProcessFailure('Pages preview', `did not start within ${timeoutMs}ms`, output)), Math.max(0, timeoutMs))
    server.once?.('exit', onExit)
    server.once?.('error', onError)
  })
}

function localPlaywrightCommand(args) {
  // npm exec --no rejects a missing local binary: the executable therefore
  // comes only from the exact @playwright/cli devDependency and package lock.
  return { command: 'npm', args: ['exec', '--no', '--', 'playwright-cli', ...args] }
}

export async function main() {
  let server
  let runCli
  let browserOpened = false
  let completed = false
  try {
    server = spawn('npm', ['exec', '--', 'vite', 'preview', '--base', '/ML_tutorial_Site/', '--host', '127.0.0.1', '--port', '4173', '--strictPort'], {
      cwd: root,
      detached: process.platform !== 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    await waitForPreviewReady(server)
    runCli = async (args) => {
      const cli = localPlaywrightCommand(args)
      await runBoundedProcess({ ...cli, cwd: root, label: `playwright-cli ${args[0]}` })
    }
    await runCli(['open', 'http://127.0.0.1:4173/ML_tutorial_Site/learn/logistic-regression'])
    browserOpened = true
    await runCli(['run-code', '--filename', 'scripts/qa/logisticRegressionBrowserMatrix.js'])
    completed = true
  } finally {
    let cleanupError
    if (browserOpened && runCli) {
      try { await runCli(['close']) }
      catch (error) { cleanupError = error }
    }
    await stopProcess(server)
    // A successful matrix is not a release proof if its own browser session
    // cannot be closed. Preserve the original failure when one already exists.
    if (completed && cleanupError) throw cleanupError
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1 })
}
