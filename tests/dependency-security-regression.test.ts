import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

test('formula rendering keeps HTML features untrusted even with an inherited trust option', () => {
  const original = Object.getOwnPropertyDescriptor(Object.prototype, 'trust')
  try {
    Object.defineProperty(Object.prototype, 'trust', { value: true, configurable: true, writable: true })
    const output = renderMarkdownWithMath(String.raw`$\htmlClass{ml-atlas-injected}{x}$ $\href{javascript:alert(1)}{click}$`)
    assert.doesNotMatch(output, /class="ml-atlas-injected"|<a\b|href="javascript:/)
    const quadratic = renderMarkdownWithMath(String.raw`$L(w)=\frac{1}{n}\sum_i(y_i-\hat y_i)^2$`)
    assert.match(quadratic, /class="katex"/)
    assert.doesNotMatch(quadratic, /katex-error/)
  } finally {
    if (original) Object.defineProperty(Object.prototype, 'trust', original)
    else Reflect.deleteProperty(Object.prototype, 'trust')
  }
})

test('TensorFlow tooling retains argument parsing after removing the obsolete sprintf dependency', () => {
  const requireFromTf = createRequire(import.meta.resolve('@tensorflow/tfjs'))
  const { ArgumentParser } = requireFromTf('argparse')
  const parser = new ArgumentParser({ add_help: false })
  parser.add_argument('--count', { type: 'int', required: true })
  assert.equal(parser.parse_args(['--count', '3']).count, 3)
  const cliPath = requireFromTf.resolve('@tensorflow/tfjs/dist/tools/custom_module/cli.js')
  const help = execFileSync(process.execPath, [cliPath, '--help'], { encoding: 'utf8' })
  assert.match(help, /--config/)
})

test('the frozen Tiny VGG model still loads and predicts with the unchanged TensorFlow runtime', async () => {
  const tf = await import('@tensorflow/tfjs')
  await tf.setBackend('cpu')
  await tf.ready()
  const startTensors = tf.memory().numTensors
  const modelJson = JSON.parse(readFileSync(new URL('../public/cnn-explainer/tiny-vgg/model.json', import.meta.url), 'utf8'))
  const bytes = readFileSync(new URL('../public/cnn-explainer/tiny-vgg/group1-shard1of1.bin', import.meta.url))
  const model = await tf.loadLayersModel(tf.io.fromMemory({
    modelTopology: modelJson.modelTopology,
    weightSpecs: modelJson.weightsManifest.flatMap((group: { weights: unknown[] }) => group.weights),
    weightData: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  }))
  const input = tf.zeros([1, 64, 64, 3])
  let prediction: ReturnType<typeof model.predict> | undefined
  try {
    prediction = model.predict(input)
    assert.ok(!Array.isArray(prediction))
    assert.deepEqual(prediction.shape, [1, 10])
    const probabilities = Array.from(await prediction.data())
    assert.ok(probabilities.every(value => Number.isFinite(value) && value >= 0 && value <= 1))
    assert.ok(Math.abs(probabilities.reduce((sum, value) => sum + value, 0) - 1) < 1e-6)
  } finally {
    if (prediction) tf.dispose(prediction)
    input.dispose()
    model.dispose()
  }
  assert.equal(tf.memory().numTensors, startTensors)
})
