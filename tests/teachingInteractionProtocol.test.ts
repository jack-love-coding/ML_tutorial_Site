import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import {
  getLessonInteractionProtocol,
  lessonInteractionProtocols,
} from '../src/lessons/interactionProtocol.ts'
import { lessonLabRegistry, lessonPagePilotSlugs } from '../src/lessons/labRegistry.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

function assertLocalized(copy: { 'zh-CN': string; en: string }, label: string) {
  assert.ok(copy['zh-CN'].trim().length > 0, `${label} needs zh-CN copy`)
  assert.ok(copy.en.trim().length > 0, `${label} needs English copy`)
}

test('teaching interaction protocols cover LessonPage pilots with complete bilingual fields', () => {
  const coveredModules = new Set(lessonInteractionProtocols.map((protocol) => protocol.moduleSlug))

  for (const slug of lessonPagePilotSlugs) {
    assert.ok(coveredModules.has(slug), `${slug} needs a teaching interaction protocol`)
  }

  for (const protocol of lessonInteractionProtocols) {
    const registryEntry = lessonLabRegistry[protocol.moduleSlug]

    assert.equal(protocol.labId, registryEntry.labId, `${protocol.id} should target the registered lab`)
    assert.ok(protocol.id.startsWith(`${protocol.moduleSlug}:`))
    assert.ok(protocol.sectionIds.length > 0, `${protocol.id} needs section IDs`)
    assert.ok(protocol.level >= 4, `${protocol.id} should be a core learning activity, not a static tab switch`)

    assertLocalized(protocol.learningGoal, `${protocol.id} learning goal`)
    assertLocalized(protocol.predictionPrompt, `${protocol.id} prediction prompt`)
    assertLocalized(protocol.reflectionPrompt, `${protocol.id} reflection prompt`)

    assert.ok(protocol.manipulableVariables.length >= 2, `${protocol.id} needs manipulable variables`)
    assert.ok(protocol.observableMetrics.length >= 2, `${protocol.id} needs observable metrics`)
    assert.ok(protocol.successCriteria.length >= 2, `${protocol.id} needs success criteria`)
    assert.ok(protocol.evidence.length >= 2, `${protocol.id} needs evidence records`)
    assert.ok(
      protocol.evidence.some((item) => item.kind === 'explanation'),
      `${protocol.id} needs explanation evidence`,
    )

    for (const variable of protocol.manipulableVariables) {
      assertLocalized(variable.label, `${protocol.id}/${variable.id} variable label`)
      assertLocalized(variable.description, `${protocol.id}/${variable.id} variable description`)
    }

    for (const metric of protocol.observableMetrics) {
      assertLocalized(metric.label, `${protocol.id}/${metric.id} metric label`)
      assertLocalized(metric.description, `${protocol.id}/${metric.id} metric description`)
    }

    for (const criterion of protocol.successCriteria) {
      assertLocalized(criterion, `${protocol.id} success criterion`)
    }

    for (const evidence of protocol.evidence) {
      assert.match(evidence.kind, /^(configuration|metric|observation|explanation)$/)
      assertLocalized(evidence.label, `${protocol.id}/${evidence.id} evidence label`)
      assertLocalized(evidence.source, `${protocol.id}/${evidence.id} evidence source`)
    }

    for (const sectionId of protocol.sectionIds) {
      assert.equal(
        getLessonInteractionProtocol(protocol.moduleSlug, sectionId),
        protocol,
        `${protocol.id} should resolve for ${sectionId}`,
      )
    }
  }

  assert.equal(getLessonInteractionProtocol('gradient-descent', 'missing-section'), undefined)
})

test('LessonPage renders the interaction protocol before pilot labs', () => {
  for (const path of [
    'src/lessons/interactionProtocol.ts',
    'src/lessons/LessonInteractionProtocolPanel.vue',
  ]) {
    assert.ok(existsSync(new URL(path, root)), `${path} should exist`)
  }

  const lessonPageSource = read('src/lessons/LessonPage.vue')
  const blockRendererSource = read('src/lessons/LessonBlockRenderer.vue')
  const panelSource = read('src/lessons/LessonInteractionProtocolPanel.vue')

  assert.match(lessonPageSource, /getLessonInteractionProtocol/)
  assert.match(lessonPageSource, /:interaction-protocol="getLessonInteractionProtocol/)
  assert.match(blockRendererSource, /LessonInteractionProtocolPanel/)
  assert.match(blockRendererSource, /props\.interactionProtocol/)
  assert.match(blockRendererSource, /<LessonInteractionProtocolPanel/)

  for (const token of [
    'lesson-interaction-protocol',
    'learningGoal',
    'predictionPrompt',
    'manipulableVariables',
    'observableMetrics',
    'successCriteria',
    'reflectionPrompt',
    'evidence',
  ]) {
    assert.match(panelSource, new RegExp(token))
  }
})
