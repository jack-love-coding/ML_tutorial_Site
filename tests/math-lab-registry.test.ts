import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { calculusRouteModules } from '../src/modules/math-lab/data/calculusRouteModules.ts'
import { linearAlgebraRouteModules } from '../src/modules/math-lab/data/linearAlgebraRouteModules.ts'
import { mathToCodeModules } from '../src/modules/math-lab/data/mathToCode/modules.ts'
import {
  assembleMathLabModules,
  mathLabModuleOverridePolicy,
  mathLabModuleProviderById,
  mathLabModuleProviders,
} from '../src/modules/math-lab/data/modules.ts'
import { mathLabComponentNames } from '../src/modules/math-lab/types/mathLab.ts'

const root = new URL('../', import.meta.url)

test('math lab component contract covers every lazy lab without a fallback', () => {
  const labFileNames = readdirSync(new URL('src/modules/math-lab/labs/', root))
    .filter((fileName) => fileName.endsWith('.vue'))
    .map((fileName) => fileName.replace(/\.vue$/, ''))
    .sort()

  assert.deepEqual([...mathLabComponentNames].sort(), labFileNames)
  assert.equal(new Set(mathLabComponentNames).size, mathLabComponentNames.length)
  assert.ok(mathLabComponentNames.includes('NumericalMiniLab'))

  const typeSource = readFileSync(new URL('src/modules/math-lab/types/mathLab.ts', root), 'utf8')
  assert.match(typeSource, /componentName: MathLabComponentName/)

  const pageSource = readFileSync(new URL('src/modules/math-lab/pages/MathLabModulePage.vue', root), 'utf8')
  assert.match(pageSource, /NumericalMiniLab: defineAsyncComponent/)
  assert.match(pageSource, /satisfies Record<MathLabComponentName, Component>/)
  assert.match(pageSource, /lab\.componentName === 'NumericalMiniLab'/)
  assert.doesNotMatch(pageSource, /fallbackLabComponent|isRegisteredLabComponent/)
})

test('math lab module assembly applies only the four declared provider overrides', () => {
  const expectedOverrides = {
    'linear-algebra-feature-space': {
      from: 'linearAlgebraRouteModules',
      to: 'mathToCodeModules',
    },
    'linear-algebra-matrix-transformations': {
      from: 'linearAlgebraRouteModules',
      to: 'mathToCodeModules',
    },
    'calculus-functions-rate-change': {
      from: 'calculusRouteModules',
      to: 'mathToCodeModules',
    },
    'calculus-derivatives-local-change': {
      from: 'calculusRouteModules',
      to: 'mathToCodeModules',
    },
  }

  assert.deepEqual(mathLabModuleOverridePolicy, expectedOverrides)
  assert.deepEqual(
    mathLabModuleProviders.map((provider) => provider.name),
    [
      'beginnerFoundationModules',
      'linearAlgebraRouteModules',
      'calculusRouteModules',
      'mathToCodeModules',
      'importedFoundationModules',
      'aiBridgeModules',
    ],
  )

  const { modulesById, providerById } = assembleMathLabModules(
    mathLabModuleProviders,
    mathLabModuleOverridePolicy,
  )

  for (const moduleId of Object.keys(expectedOverrides)) {
    const replacement = mathToCodeModules.find((moduleDefinition) => moduleDefinition.id === moduleId)
    assert.ok(replacement, `${moduleId} should be supplied by mathToCodeModules`)
    assert.equal(modulesById[moduleId], replacement)
    assert.equal(providerById[moduleId], 'mathToCodeModules')
    assert.equal(mathLabModuleProviderById[moduleId], 'mathToCodeModules')
  }

  assert.ok(linearAlgebraRouteModules.some(({ id }) => id === 'linear-algebra-feature-space'))
  assert.ok(linearAlgebraRouteModules.some(({ id }) => id === 'linear-algebra-matrix-transformations'))
  assert.ok(calculusRouteModules.some(({ id }) => id === 'calculus-functions-rate-change'))
  assert.ok(calculusRouteModules.some(({ id }) => id === 'calculus-derivatives-local-change'))
})

test('math lab module assembly rejects unexpected or reversed duplicates', () => {
  const duplicate = mathToCodeModules[0]!

  assert.throws(
    () => assembleMathLabModules(
      [
        { name: 'beginnerFoundationModules', modules: [duplicate] },
        { name: 'linearAlgebraRouteModules', modules: [duplicate] },
      ],
      {},
    ),
    /Unexpected duplicate math lab module/,
  )

  assert.throws(
    () => assembleMathLabModules(
      [
        { name: 'mathToCodeModules', modules: [duplicate] },
        { name: 'linearAlgebraRouteModules', modules: [duplicate] },
      ],
      {
        [duplicate.id]: {
          from: 'linearAlgebraRouteModules',
          to: 'mathToCodeModules',
        },
      },
    ),
    /Unexpected duplicate math lab module/,
  )
})
