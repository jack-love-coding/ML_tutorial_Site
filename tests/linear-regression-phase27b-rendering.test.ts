import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { linearRegressionLessons } from '../src/data/linearRegressionLesson.ts'
import type { AppLocale, LocalizedCopy } from '../src/types/ml.ts'
import type {
  LinearRegressionLessonBlock,
  LinearRegressionObservationSceneId,
} from '../src/types/linearRegressionLesson.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

const root = resolve(import.meta.dirname, '..')
const chapterIds: LinearRegressionObservationSceneId[] = [
  'fit-line',
  'multivariate',
  'residual-loss',
  'training-motion',
  'polynomial',
  'model-limits',
  'overfitting',
  'regularization',
]
const locales: AppLocale[] = ['zh-CN', 'en']

function source(relativePath: string) {
  return readFileSync(resolve(root, relativePath), 'utf8')
}

function learnerProse(block: LinearRegressionLessonBlock): LocalizedCopy[] {
  switch (block.kind) {
    case 'explanation': return [block.body]
    case 'formula': return [block.explanation, ...block.variables.map((variable) => variable.meaning)]
    case 'code': return block.note ? [block.note] : []
    case 'runtime-output': return [block.interpretation]
    case 'table': return [block.caption]
    case 'observation-lab': return [block.prompt]
    default: return []
  }
}

test('Phase 27B preserves every TeX command at runtime and renders formulas through KaTeX', () => {
  const expectedFormulas = new Map<string, string>([
    ['fit-formula', String.raw`$$\hat y=b+w_{temp}x_{temp}$$`],
    ['multi-formula', String.raw`$$\hat{\mathbf y}=X\mathbf w+b\mathbf 1$$`],
    ['loss-residual-formula', String.raw`$$r_i=\hat y_i-y_i$$`],
    ['training-gradient-formula', String.raw`$$\nabla_{\mathbf w}\mathrm{MSE}=\frac{2}{n}X^\top(X\mathbf w+b\mathbf1-\mathbf y)$$`],
    ['poly-formula', String.raw`$$\hat y=b+w_1x+w_2x^2+w_3\sin(2\pi h/24)+w_4\cos(2\pi h/24)$$`],
    ['coef-formula', String.raw`$$w_j^{raw}=w_j^{scaled}/s_j,\quad b^{raw}=b^{scaled}-\sum_jw_j^{scaled}\mu_j/s_j$$`],
    ['reg-formula', String.raw`$$\min_{w,b}\frac1n\lVert Xw+b\mathbf1-y\rVert_2^2+\lambda\lVert w\rVert_q$$`],
  ])

  const formulas = chapterIds.flatMap((chapterId) =>
    linearRegressionLessons[chapterId]!.blocks.filter((block) => block.kind === 'formula'),
  )
  assert.equal(formulas.length, expectedFormulas.size)

  for (const block of formulas) {
    assert.equal(block.formula, expectedFormulas.get(block.id), block.id)
    const renderedFormula = renderMarkdownWithMath(block.formula)
    assert.match(renderedFormula, /class="katex-display"/, block.id)
    assert.doesNotMatch(renderedFormula, /katex-error|\$\$|haty/, block.id)

    for (const variable of block.variables) {
      const renderedVariable = renderMarkdownWithMath(variable.symbol)
      assert.match(renderedVariable, /class="katex"/, `${block.id}: ${variable.symbol}`)
      assert.doesNotMatch(renderedVariable, /katex-error|\$\$|haty/, variable.symbol)
    }
  }
})

test('all bilingual learner prose uses the safe Markdown and math renderer without raw markers', () => {
  for (const chapterId of chapterIds) {
    for (const block of linearRegressionLessons[chapterId]!.blocks) {
      for (const copy of learnerProse(block)) {
        for (const locale of locales) {
          const rendered = renderMarkdownWithMath(copy[locale])
          assert.ok(rendered.length > 0, `${chapterId}/${block.id}/${locale}`)
          assert.doesNotMatch(rendered, /katex-error|\$\$|\\\(|\\\[|haty/, `${chapterId}/${block.id}/${locale}`)
          if (copy[locale].includes('`')) {
            assert.match(rendered, /<code>/, `${chapterId}/${block.id}/${locale}`)
            assert.doesNotMatch(rendered.replace(/<code>[\s\S]*?<\/code>/g, ''), /`/)
          }
          if (copy[locale].includes('**')) {
            assert.match(rendered, /<strong>/, `${chapterId}/${block.id}/${locale}`)
            assert.doesNotMatch(rendered, /\*\*/)
          }
        }
      }
    }
  }

  const blockComponent = source('src/components/LinearRegressionLessonBlock.vue')
  assert.match(blockComponent, /MarkdownMathContent :source="localized\(block\.explanation\)"/)
  assert.match(blockComponent, /MarkdownMathContent :source="localized\(block\.interpretation\)"/)
  assert.match(blockComponent, /:source="localized\(variable\.meaning\)"/)
  assert.match(blockComponent, /:source="localized\(block\.caption\)"/)

  const pageComponent = source('src/components/LinearRegressionPagedLesson.vue')
  assert.match(pageComponent, /MarkdownMathContent :source="sectionSummary"/)
  assert.match(pageComponent, /MarkdownMathContent :source="localizedText\(block\.prompt\)"/)
  assert.doesNotMatch(`${blockComponent}\n${pageComponent}`, /v-html/)
})

test('each chapter declares one matching scene with two or three valid typed controls', () => {
  for (const chapterId of chapterIds) {
    const labs = linearRegressionLessons[chapterId]!.blocks.filter(
      (block) => block.kind === 'observation-lab',
    )
    assert.equal(labs.length, 1, chapterId)
    const lab = labs[0]!
    assert.equal(lab.sceneId, chapterId)
    assert.ok(lab.controls.length >= 2 && lab.controls.length <= 3, chapterId)
    assert.equal(new Set(lab.controls.map((control) => control.id)).size, lab.controls.length)

    for (const control of lab.controls) {
      assert.ok(control.label['zh-CN'] && control.label.en, `${chapterId}/${control.id}`)
      if (control.kind === 'range') {
        assert.ok(Number.isFinite(control.defaultValue))
        assert.ok(control.defaultValue >= control.min && control.defaultValue <= control.max)
        assert.ok(control.min < control.max && control.step > 0)
      }
      if (control.kind === 'select') {
        assert.ok(control.options.some((option) => option.value === control.defaultValue))
        assert.equal(new Set(control.options.map((option) => option.value)).size, control.options.length)
      }
      if (control.kind === 'drag-point') {
        assert.ok(control.defaultValue.x >= control.xRange[0] && control.defaultValue.x <= control.xRange[1])
        assert.ok(control.defaultValue.y >= control.yRange[0] && control.defaultValue.y <= control.yRange[1])
      }
    }
  }
})
