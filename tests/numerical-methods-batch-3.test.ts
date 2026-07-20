import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import test from 'node:test'
import { resolve } from 'node:path'
import {
  numericalBatch3ChapterIds,
  numericalBatch3NotebookForModule,
} from '../src/modules/math-lab/data/numericalBatch3Notebook.ts'
import { mathLabModuleRegistry, mathLabModules } from '../src/modules/math-lab/data/modules.ts'
import { evaluateFiniteDifference } from '../src/modules/math-lab/utils/finiteDifference.ts'
import {
  LOGIT_CALIBRATION_LOGITS,
  LOGIT_CALIBRATION_ROOT,
  logitCalibrationDerivative,
  logitCalibrationMeanProbability,
  logitCalibrationResidual,
} from '../src/modules/math-lab/utils/logitCalibration.ts'
import { evaluateNonlinearRootFinding, nonlinearFunctionDefinitions } from '../src/modules/math-lab/utils/nonlinearEquations.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

const root = resolve(import.meta.dirname, '..')

function absolutePublicPath(publicPath: string): string {
  assert.match(publicPath, /^\//)
  return resolve(root, 'public', publicPath.slice(1))
}

function readJson(path: string): any {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function assertBilingual(value: { 'zh-CN': string; en: string }, label: string): void {
  assert.match(value['zh-CN'], /[\u3400-\u9fff]/, `${label} needs Chinese copy`)
  assert.match(value.en, /[A-Za-z]/, `${label} needs English copy`)
}

test('Batch 3 fixture is deterministic, project-authored, and hash locked', () => {
  const fixturePath = resolve(root, 'public/datasets/numerical-methods/logit-calibration-fixture.json')
  const manifest = readJson(resolve(root, 'public/datasets/numerical-methods/logit-calibration-manifest.json'))
  const fixture = readJson(fixturePath)

  assert.deepEqual(fixture, {
    contractVersion: 'numerical-methods-batch-3-v1',
    description: 'Deterministic teaching fixture for logit-bias calibration; not a sampled production dataset.',
    logits: [-3.2, -2.1, -1.4, -0.9, -0.4, -0.1, 0.2, 0.5, 0.9, 1.3, 2, 3.1],
    targetPositiveRate: 0.62,
    finiteDifferenceProbeBias: 0.35,
    rootBracket: [-4, 4],
    newtonStart: 0,
    secantStarts: [-1, 1],
  })
  assert.equal(manifest.contractVersion, fixture.contractVersion)
  assert.equal(manifest.fixture.publicPath, '/datasets/numerical-methods/logit-calibration-fixture.json')
  assert.equal(manifest.fixture.sha256, 'f78fab203ad67476d26937fb7ae84e57b6aefaa86e4045f01b3b1c85b3b78bbc')
  assert.equal(manifest.fixture.bytes, 451)
  assert.equal(statSync(fixturePath).size, manifest.fixture.bytes)
  assert.equal(sha256(fixturePath), manifest.fixture.sha256)
  assert.equal(manifest.provenance.kind, 'project-authored-teaching-fixture')
  assert.equal(manifest.provenance.containsPersonalData, false)
  assert.equal(manifest.provenance.productionDataset, false)
})

test('one executed Notebook locks the finite-difference and root-finding outputs', () => {
  const outputDirectory = resolve(root, 'public/notebooks/numerical-methods/batch-3-outputs')
  const manifest = readJson(resolve(outputDirectory, 'manifest.json'))
  const finite = readJson(resolve(outputDirectory, 'finite-difference-calibration-summary.json'))
  const roots = readJson(resolve(outputDirectory, 'nonlinear-calibration-summary.json'))

  assert.equal(manifest.contractVersion, 'numerical-methods-batch-3-v1')
  assert.deepEqual(manifest.notebook.moduleIds, numericalBatch3ChapterIds)
  assert.equal(manifest.notebook.publicPath, '/notebooks/numerical-methods/logit-bias-calibration.zh-CN.ipynb')
  assert.deepEqual(manifest.outputs.map((output: { outputId: string }) => output.outputId), [
    'finite-difference-calibration-summary',
    'nonlinear-calibration-summary',
  ])
  for (const item of [manifest.notebook, ...manifest.outputs]) {
    const path = absolutePublicPath(item.publicPath)
    assert.equal(existsSync(path), true)
    assert.equal(sha256(path), item.sha256, `${item.publicPath} hash drifted`)
    assert.equal(statSync(path).size, item.bytes)
  }
  assert.equal(sha256(resolve(root, manifest.generator.path)), manifest.generator.sha256)

  assert.equal(finite.probeBias, 0.35)
  assert.equal(finite.probeResidual, -0.06078698810485639)
  assert.equal(finite.analyticDerivative, 0.1630982543997438)
  assert.equal(finite.stepSweep.length, 12)
  assert.equal(finite.bestSampledForward.step, 1e-7)
  assert.equal(finite.bestSampledForward.forwardAbsoluteError, 6.082833126086484e-10)
  assert.equal(finite.bestSampledCentral.step, 1e-5)
  assert.equal(finite.bestSampledCentral.centralAbsoluteError, 2.3393509351876673e-12)
  assert.equal(finite.stepSweep.at(-1).centralAbsoluteError, 6.200323353955373e-5)

  assert.equal(roots.root, 0.730290740297536)
  assert.equal(roots.meanProbabilityAtRoot, 0.619999999995351)
  assert.equal(roots.derivativeAtRoot, 0.15594569798407712)
  assert.deepEqual(roots.solvers.map((solver: any) => [
    solver.method,
    solver.iterationCount,
    solver.functionEvaluations,
    solver.derivativeEvaluations,
  ]), [
    ['bisection', 37, 39, 0],
    ['newton', 3, 4, 4],
    ['secant', 5, 7, 0],
  ])
  assert.deepEqual(roots.failureChecks, {
    invalidBracket: 'Bisection requires a sign-changing bracket',
    saturatedNewton: 'Newton iteration left the safeguarded teaching domain',
  })
})

test('two Batch 3 companions expose one shared Notebook and chapter-specific output copy', () => {
  assert.deepEqual(numericalBatch3ChapterIds, ['finite-difference-methods', 'nonlinear-equations'])
  const companions = numericalBatch3ChapterIds.map((moduleId) => numericalBatch3NotebookForModule(moduleId))
  assert.ok(companions.every(Boolean))
  assert.equal(numericalBatch3NotebookForModule('pca'), undefined)
  assert.deepEqual(
    mathLabModules.map(({ id }) => numericalBatch3NotebookForModule(id)?.moduleId).filter(Boolean),
    numericalBatch3ChapterIds,
  )
  assert.equal(companions[0]!.notebook.publicPath, companions[1]!.notebook.publicPath)
  assert.equal(companions[0]!.dataset.publicPath, companions[1]!.dataset.publicPath)
  assert.notEqual(companions[0]!.outputId, companions[1]!.outputId)

  for (const companion of companions) {
    assert.ok(companion)
    assert.ok(companion.codeExample.trim())
    assert.equal(companion.requirements.publicPath, '/notebooks/numerical-methods/requirements.txt')
    for (const asset of [companion.notebook, companion.dataset, companion.requirements]) {
      assert.equal(existsSync(absolutePublicPath(asset.publicPath)), true)
      assertBilingual(asset.label, `${companion.moduleId} ${asset.filename} label`)
      assertBilingual(asset.description, `${companion.moduleId} ${asset.filename} description`)
    }
    assertBilingual(companion.title, `${companion.moduleId} title`)
    assertBilingual(companion.description, `${companion.moduleId} description`)
    assertBilingual(companion.codeTitle, `${companion.moduleId} code title`)
    assertBilingual(companion.codeOutput, `${companion.moduleId} code output`)
  }
  assert.match(companions[0]!.codeOutput['zh-CN'], /1e-5.*2\.339e-12/s)
  assert.match(companions[1]!.codeOutput['zh-CN'], /0\.730290740297536.*37 次更新.*3 次更新.*5 次更新/s)
})

test('two chapters mount one shared illustration, one chapter video, and exactly one primary lab placement', () => {
  const expected = {
    'finite-difference-methods': {
      video: '/manim/numerical-methods/logit-calibration-finite-difference.mp4',
      poster: '/manim/numerical-methods/logit-calibration-finite-difference-poster.png',
      labId: 'finite-difference-error-lab',
      section: 'v3-finite-difference-calibration-sweep',
    },
    'nonlinear-equations': {
      video: '/manim/numerical-methods/logit-calibration-root-finding.mp4',
      poster: '/manim/numerical-methods/logit-calibration-root-finding-poster.png',
      labId: 'nonlinear-equations-root-finding-lab',
      section: 'v3-root-calibration-solver-output',
    },
  } as const
  const sharedImage = '/math-lab/numerical-methods/finite-difference-root-finding-calibration.png'

  for (const moduleId of numericalBatch3ChapterIds) {
    const moduleDefinition = mathLabModuleRegistry[moduleId]
    const contract = expected[moduleId]
    const video = moduleDefinition.visuals.filter(({ assetPath }) => assetPath === contract.video)
    const image = moduleDefinition.visuals.filter(({ assetPath }) => assetPath === sharedImage)
    assert.equal(video.length, 1)
    assert.equal(video[0]!.posterPath, contract.poster)
    assert.equal(image.length, 1)
    assert.equal(moduleDefinition.sections.filter(({ id }) => id === contract.section).length, 1)
    assert.equal(moduleDefinition.sections.filter(({ labIds }) => labIds?.includes(contract.labId)).length, 1)
    for (const publicPath of [contract.video, contract.poster, sharedImage]) {
      assert.ok(moduleDefinition.importedAssetPaths.includes(publicPath))
      assert.equal(existsSync(absolutePublicPath(publicPath)), true)
    }
    assert.doesNotMatch(JSON.stringify(moduleDefinition), /证据/)
  }
  assert.equal(
    sha256(absolutePublicPath(sharedImage)),
    '45233293ab79ecde44f19efc2e0f4ec2a42a2681d82c1b85620be191e9db44d9',
  )
})

test('shared TypeScript calibration math matches fixture and locked Notebook outputs', () => {
  assert.deepEqual([...LOGIT_CALIBRATION_LOGITS], [-3.2, -2.1, -1.4, -0.9, -0.4, -0.1, 0.2, 0.5, 0.9, 1.3, 2, 3.1])
  assert.equal(LOGIT_CALIBRATION_ROOT, 0.730290740297536)
  assert.ok(Math.abs(logitCalibrationResidual(0.35) - (-0.06078698810485639)) < 2e-16)
  assert.ok(Math.abs(logitCalibrationDerivative(0.35) - 0.1630982543997438) < 2e-16)
  assert.ok(Math.abs(logitCalibrationMeanProbability(LOGIT_CALIBRATION_ROOT) - 0.619999999995351) < 2e-15)

  const finite = evaluateFiniteDifference({
    functionKind: 'calibration',
    method: 'central',
    x: 0.35,
    h: 1e-5,
  })
  assert.ok(Math.abs(finite.approximation - 0.16309825440208314) < 2e-12)
  assert.ok(finite.absoluteError < 5e-12)

  const roots = evaluateNonlinearRootFinding({
    functionKind: 'calibration',
    iterations: 5,
    newtonStart: 0,
    secantPrevious: -1,
    secantCurrent: 1,
  })
  assert.deepEqual(roots.bracket, [-4, 4])
  assert.equal(nonlinearFunctionDefinitions.calibration.trueRoot, LOGIT_CALIBRATION_ROOT)
  assert.ok(roots.newton.residual < 1e-10)
  assert.ok(roots.secant.residual < 1e-10)

  assert.equal(evaluateFiniteDifference({ functionKind: 'quadratic', method: 'central', x: 1, h: 1e-4 }).exactDerivative, 19)
  assert.equal(nonlinearFunctionDefinitions.cubic.kind, 'cubic')
  assert.equal(nonlinearFunctionDefinitions.cosine.kind, 'cosine')
  assert.equal(nonlinearFunctionDefinitions.flat.kind, 'flat')
})

test('Batch 3 formula content renders through the safe Markdown and KaTeX path', () => {
  const source = numericalBatch3ChapterIds.flatMap((moduleId) => {
    return mathLabModuleRegistry[moduleId].sections
      .filter(({ id }) => id.startsWith('v3-finite-difference-') || id.startsWith('v3-root-calibration'))
      .flatMap((section) => [section.content['zh-CN'], section.content.en])
  }).join('\n\n')
  const html = renderMarkdownWithMath(source)
  assert.match(html, /katex/)
  assert.doesNotMatch(html, /\$\$|<script|onerror=/i)
})
