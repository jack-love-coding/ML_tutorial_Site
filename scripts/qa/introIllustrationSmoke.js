async (page) => {
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  page.setDefaultTimeout(15000)
  const errors = []
  let failedImage = false
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => {
    if (message.type() === 'error' && !(failedImage && message.location().url.includes('score-prediction-v2.png'))) errors.push(message.text())
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let passed = 0
  for (const locale of ['zh-CN', 'en']) for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/learn/ai-overview/three-problems?route=core-learning-path')
    if (await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior) !== 'auto') throw new Error('Reduced motion must disable document smooth scrolling')
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    const card = page.locator('[data-media-id="score-prediction"]')
    await card.waitFor()
    await card.scrollIntoViewIfNeeded()
    await card.locator('img').evaluate(image => image.decode())
    if (!(await card.locator('img').getAttribute('src')).endsWith('/ai-overview/generated/score-prediction-v2.png')) throw new Error('Legacy score card still active')
    if (await card.locator('dt').count() !== 4 || await card.locator('dd').count() !== 4) throw new Error('Teaching fields missing')
    if (!(await card.locator('.overview-media-figure__reading-guide').innerText()).includes(locale === 'en' ? 'duration only' : '新样本只有时长')) throw new Error('Training/prediction boundary missing')
    const badText = await card.locator('dt,dd').evaluateAll(nodes => nodes.some(node => node.scrollWidth > node.clientWidth + 1))
    if (badText || await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Intro illustration text overflows')
    // A tall element screenshot can include the sticky header across the image.
    // Capture the real reading viewport and verify that the complete picture fits below it.
    const picture = card.locator('img')
    await picture.evaluate(image => {
      const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0
      window.scrollTo({ top: window.scrollY + image.getBoundingClientRect().top - headerBottom - 16, behavior: 'instant' })
    })
    const pictureBounds = await picture.evaluate(image => {
      const rect = image.getBoundingClientRect()
      const headerBottom = document.querySelector('.site-header')?.getBoundingClientRect().bottom ?? 0
      return { top: rect.top, bottom: rect.bottom, headerBottom, viewportHeight: window.innerHeight }
    })
    if (pictureBounds.top < pictureBounds.headerBottom || pictureBounds.bottom > pictureBounds.viewportHeight) throw new Error('Intro picture cannot be read below the sticky header: ' + JSON.stringify({ locale, width, ...pictureBounds }))
    await page.screenshot({ path: `/tmp/ml-atlas-score-${locale}-${width}.png` })
    const legacy = page.locator('[data-media-id="pattern-discovery"]')
    if (locale === 'zh-CN') {
      await legacy.locator('summary').focus()
      await page.keyboard.press('Enter')
    }
    await legacy.locator('dd').first().waitFor()
    if (locale === 'en' && await legacy.locator('table').count()) throw new Error('Task fields duplicated in a translation table')
    await page.reload()
    await card.waitFor()
    passed++
  }
  failedImage = true
  await page.route('**/score-prediction-v2.png', route => route.fulfill({ status: 503, body: 'Unavailable' }))
  await page.goto(base + '/learn/ai-overview/three-problems')
  const failed = page.locator('[data-media-id="score-prediction"]')
  await failed.scrollIntoViewIfNeeded()
  await failed.getByRole('status').waitFor()
  if (await failed.locator('dd').count() !== 4 || !(await failed.locator('.overview-media-figure__reading-guide').isVisible())) throw new Error('Image failure lost the lesson explanation')
  await page.unroute('**/score-prediction-v2.png')
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed: passed + 1, locales: ['zh-CN', 'en'], widths: [1280, 390], imageFailure: 'teaching text retained' }
}
