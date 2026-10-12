async (page) => {
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  page.setDefaultTimeout(15000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let passed = 0
  for (const locale of ['zh-CN', 'en']) for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/math-lab/modules/calculus-derivatives-local-change?route=core-learning-path#derivatives-intuition')
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    const figure = page.locator('#minimum-derivative-tangent')
    const image = figure.locator('img')
    await image.waitFor()
    await image.evaluate(image => image.decode())
    const geometry = await image.evaluate(image => ({ source: image.src, naturalRatio: image.naturalWidth / image.naturalHeight, renderedRatio: image.getBoundingClientRect().width / image.getBoundingClientRect().height, fit: getComputedStyle(image).objectFit }))
    if (!geometry.source.endsWith('/math-lab/diagrams/derivatives/loss-tangent.svg')) throw new Error('Old incorrect bitmap is still active')
    if (Math.abs(geometry.naturalRatio - geometry.renderedRatio) > .02 || geometry.fit !== 'contain') throw new Error('Diagram is cropped; axes or values may be lost')
    if (!(await figure.innerText()).includes('2.45125')) throw new Error('Local approximation explanation missing')
    await figure.screenshot({ path: `/tmp/ml-atlas-derivative-${locale}-${width}.png` })
    await page.reload()
    await image.waitFor()
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Derivative overflow')
    passed++
    await page.goto(base + '/math-lab/modules/calculus-derivatives-local-change')
    const secant = page.locator('#minimum-derivative-window')
    await secant.locator('img').waitFor({ state: 'attached' })
    await secant.scrollIntoViewIfNeeded()
    await secant.locator('img').evaluate(image => image.decode())
    await secant.screenshot({ path: `/tmp/ml-atlas-secants-${locale}-${width}.png` })
    if (!(await secant.innerText()).includes('−4.75')) throw new Error('Secant values missing')
    if (await page.locator('.katex-error').count()) throw new Error('Formula error')
    passed++
  }
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed, locales: ['zh-CN', 'en'], widths: [1280, 390], uncropped: true }
}
