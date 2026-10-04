import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { chromium } from 'playwright'

const require = createRequire(import.meta.url)
const cli = require('@playwright/cli/package.json')
const playwright = require('playwright/package.json')
const corePath = dirname(require.resolve('playwright-core/package.json'))
const browsers = JSON.parse(readFileSync(join(corePath, 'browsers.json'), 'utf8')).browsers
const expected = browsers.find(browser => browser.name === 'chromium')
if (cli.dependencies.playwright !== playwright.version) throw new Error('Playwright version differs from the locked CLI dependency')
const executable = chromium.executablePath()
if (!existsSync(executable)) throw new Error('Pinned Chromium is missing. Run npm run browser:install.')
const version = execFileSync(executable, ['--version'], { encoding: 'utf8', timeout: 15000 }).trim()
if (!version.includes(expected.browserVersion)) throw new Error(`Browser version differs: ${version}`)
console.log(JSON.stringify({ cli: cli.version, playwright: playwright.version, chromium: expected.browserVersion, revision: expected.revision }))
