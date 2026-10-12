async (page) => {
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  page.setDefaultTimeout(15000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let passed = 0
  for (const locale of ['zh-CN', 'en']) for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/math-lab/modules/beginner-linear-algebra?route=core-learning-path#beginner-linear-matrix-machine')
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    const figure = page.locator('#beginner-matrix-transform-longform'), image = figure.locator('img')
    await image.waitFor({ state: 'attached' }); await figure.scrollIntoViewIfNeeded(); await image.evaluate(image => image.decode())
    if (await figure.count() !== 1) throw new Error('Duplicate matrix figure')
    if (!await image.evaluate(image => image.src.endsWith('/matrices/batch-prediction.svg') && image.width <= 481 && Math.abs(image.naturalWidth / image.naturalHeight - image.width / image.height) < .02)) throw new Error('Wrong, oversized, or cropped matrix figure')
    await page.evaluate(() => window.scrollTo({ top: document.querySelector('#beginner-matrix-transform-longform').getBoundingClientRect().top + window.scrollY - 120, behavior: 'instant' }))
    await page.screenshot({ path: `/tmp/ml-atlas-matrix-${locale}-${width}.png` })
    if (await page.locator('.katex-error').count()) throw new Error('Matrix formula error')
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Matrix overflow')
    // Topic link exits the selected reading intentionally and retains the Pages base.
    const link = page.locator('#beginner-linear-matrix-machine a[href*="linear-algebra-matrix-transformations"]')
    if (!(await link.getAttribute('href')).startsWith('/ML_tutorial_Site/')) throw new Error('Topic link lost Pages base')
    await link.click()
    await page.waitForURL(/linear-algebra-matrix-transformations/)
    await page.reload()
    if (page.url().includes('route=core-learning-path')) throw new Error('Full topic kept a selected route')
    passed++
  }
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed, sharedExample: true, fullTopicLink: true }
}
