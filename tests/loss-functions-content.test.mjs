import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import { lossFunctionsModule } from '../src/data/lossFunctionsModule.ts'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)))

test('loss-functions chapter contract begins with the locked seven bilingual chapters', () => {
  assert.deepEqual(
    lossFunctionsModule.chapters.map(({ id }) => id),
    [
      'why-loss',
      'regression-losses',
      'classification-losses',
      'likelihood-intuition',
      'negative-log',
      'mle-bridge',
      'gradient-verification',
    ],
  )
  assert.equal(existsSync(resolve(root, 'src/data/lossFunctionsAssets.ts')), true)

  for (const chapter of lossFunctionsModule.chapters) {
    assert.ok(chapter.markdown['zh-CN'].trim(), `${chapter.id} zh-CN markdown`)
    assert.ok(chapter.markdown.en.trim(), `${chapter.id} English markdown`)
    assert.ok(chapter.callout['zh-CN'].trim(), `${chapter.id} zh-CN callout`)
    assert.ok(chapter.callout.en.trim(), `${chapter.id} English callout`)
    assert.ok(chapter.experimentPrompt?.['zh-CN'].trim(), `${chapter.id} zh-CN handoff`)
    assert.ok(chapter.experimentPrompt?.en.trim(), `${chapter.id} English handoff`)
  }

  const gradient = lossFunctionsModule.chapters.at(-1)
  assert.equal(gradient?.id, 'gradient-verification')
  assert.equal(gradient?.embeddedLabId, 'loss-gradient-verification-lab')
})
