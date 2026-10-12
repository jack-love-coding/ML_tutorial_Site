async (page) => {
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  page.setDefaultTimeout(15000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let passed = 0
  const checkFigure = async (id, filename) => {
    const figure = page.locator('#' + id), image = figure.locator('img')
    await image.waitFor({ state: 'attached' })
    await figure.scrollIntoViewIfNeeded()
    await image.evaluate(image => image.decode())
    const ok = await image.evaluate((image, filename) => image.src.endsWith(filename) && image.width <= 481 && Math.abs(image.naturalWidth / image.naturalHeight - image.width / image.height) < .02, filename)
    if (!ok) throw new Error('Incorrect or cropped function figure: ' + id)
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Function page overflow')
  }
  for (const locale of ['zh-CN', 'en']) for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/math-lab/modules/calculus-functions-rate-change?route=core-learning-path#mapping-intuition')
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    await checkFigure('minimum-function-machine', '/functions/prediction-flow.svg')
    await page.evaluate(() => window.scrollTo({ top: document.querySelector('#minimum-function-machine').getBoundingClientRect().top + window.scrollY - 120, behavior: 'instant' }))
    await page.screenshot({ path: `/tmp/ml-atlas-mapping-${locale}-${width}.png` })
    const lab = page.locator('.prediction-mapping-lab'), slider = lab.locator('input[type=range]')
    await slider.scrollIntoViewIfNeeded()
    const checkValues = async expected => {
      const values = await lab.locator('dd').allTextContents()
      if (JSON.stringify(values) !== JSON.stringify(expected)) throw new Error('Prediction mismatch: ' + values)
    }
    await checkValues(['10', '1', '1'])
    await slider.focus(); await slider.press('ArrowRight'); await slider.press('ArrowRight')
    await checkValues(['12', '3', '9'])
    for (let i = 0; i < 3; i++) await slider.press('ArrowLeft')
    await checkValues(['9', '0', '0'])
    await lab.getByRole('button').click(); await checkValues(['10', '1', '1'])
    await page.reload(); await slider.waitFor(); await checkValues(['10', '1', '1'])
    passed++
    await page.goto(base + '/math-lab/modules/calculus-functions-rate-change#worked-motion-example')
    await checkFigure('minimum-average-rate', '/functions/uniform-motion.svg')
    await page.evaluate(() => window.scrollTo({ top: document.querySelector('#minimum-average-rate').getBoundingClientRect().top + window.scrollY - 150, behavior: 'instant' }))
    await page.screenshot({ path: `/tmp/ml-atlas-function-${locale}-${width}.png` })
    if (await page.locator('.katex-error').count()) throw new Error('Formula error')
    passed++
  }
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed, uncropped: true, keyboardReset: true }
}
