async (page) => {
  page.setDefaultTimeout(15000)
  page.setDefaultNavigationTimeout(20000)
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const requestedUnitIds = /* candidate-unit-ids */ []
  const response = await page.request.get(base + '/textbook-readings.json')
  if (!response.ok()) throw new Error('Missing generated textbook reading manifest')
  const manifest = await response.json()
  for (const id of requestedUnitIds) if (!manifest.units.some(unit => unit.id === id)) throw new Error('Unknown candidate unit: ' + id)
  const units = manifest.units.filter(unit => requestedUnitIds.length ? requestedUnitIds.includes(unit.id) : unit.publicationStatus !== 'preview')
  const readings = units.flatMap(unit => unit.readings)
  const allReadings = manifest.units.flatMap(unit => unit.readings)
  if (!readings.length) throw new Error('No units selected for browser verification')
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const visited = []
  for (const [locale, width] of [['zh-CN', 1280], ['en', 390]]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/spine#' + units[0].id)
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    if (await page.locator('.textbook-unit').count() !== 1) throw new Error('Expected one expanded unit')
    if (await page.locator('.textbook-unit-tabs a').count() !== 6) throw new Error('Missing teaching unit')
    await page.locator('.textbook-reading-list a').first().click()
    await page.waitForURL(base + readings[0].path + '?route=core-learning-path' + (readings[0].hash ?? ''))
    for (const [index, reading] of readings.entries()) {
      const chapterTestId = { 'python-notebook': 'python-data-tools-current-chapter', 'linear-regression': 'linear-current-chapter', 'housing-price-project': 'housing-current-chapter', 'gradient-descent': 'gradient-current-chapter', 'logistic-regression': 'logistic-current-chapter' }[reading.moduleId]
      if (chapterTestId) await page.locator(`[data-testid="${chapterTestId}"][data-section-id="${reading.lessonId}"]`).waitFor()
      else if (reading.hash) await page.locator(reading.hash).waitFor()
      else await page.locator('.algorithm-view').waitFor()
      await page.waitForLoadState('networkidle')
      const nav = page.locator('[data-testid="reading-navigation"]').first()
      await nav.waitFor()
      if (!page.url().includes('route=core-learning-path')) throw new Error('Route context lost: ' + page.url())
      const current = await page.evaluate(() => ({ pathname: location.pathname, hash: location.hash }))
      if (current.pathname !== '/ML_tutorial_Site' + reading.path || current.hash !== (reading.hash ?? '')) throw new Error(`Unexpected chapter at ${index}: ${page.url()}, expected ${reading.path}${reading.hash ?? ''}`)
      if (await page.locator('.katex-error').count()) throw new Error('Formula rendering error: ' + page.url())
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)
      if (overflow) throw new Error('Horizontal overflow: ' + page.url())
      if (page.url().includes('/python-notebook/notebook-workflow')) await page.locator('.python-syntax-bridge').waitFor()
      visited.push({ url: page.url(), locale, width })
      const next = nav.locator('[data-testid="reading-next"]')
      if (!(await next.count())) {
        if (index !== readings.length - 1) throw new Error('Reading sequence ended early')
        continue
      }
      const href = await next.getAttribute('href')
      const fullIndex = allReadings.findIndex(lesson => lesson.moduleId === reading.moduleId && lesson.lessonId === reading.lessonId)
      const expectedNext = allReadings[fullIndex + 1]
      const nextUrl = await next.evaluate(anchor => { const url = new URL(anchor.href); return { pathname: url.pathname, hash: url.hash, route: url.searchParams.get('route') } })
      if (!expectedNext || nextUrl.pathname !== '/ML_tutorial_Site' + expectedNext.path || nextUrl.hash !== (expectedNext.hash ?? '') || nextUrl.route !== 'core-learning-path') throw new Error('Incorrect chapter handoff: ' + href)
      if (page.url().includes('matplotlib-visualization') && !href.includes('splits-generalization')) throw new Error('Python entered optional chapters')
      await next.click()
      await page.waitForURL(base + expectedNext.path + '?route=core-learning-path' + (expectedNext.hash ?? ''))
      const upcoming = readings[index + 1]
      // Candidates may be nonadjacent units; follow the actual handoff whenever contiguous.
      if (upcoming && (upcoming.moduleId !== expectedNext.moduleId || upcoming.lessonId !== expectedNext.lessonId)) {
        await page.goto(base + upcoming.path + '?route=core-learning-path' + (upcoming.hash ?? ''))
      }
    }
    await page.goto(base + '/learn/loss-functions/regression-losses?route=core-learning-path')
    await page.waitForLoadState('networkidle')
    const lossNext = await page.locator('[data-testid="reading-next"]').first().getAttribute('href')
    if (!lossNext.includes('calculus-derivatives-local-change')) throw new Error('Regression loss entered classification too early')
    await page.reload()
    await page.waitForLoadState('networkidle')
    if (await page.locator('[data-testid="reading-next"]').first().getAttribute('href') !== lossNext) throw new Error('Refresh changed next lesson')
    await page.goto(base + '/python/seaborn-statistics?route=invalid')
    await page.waitForLoadState('networkidle')
    if (await page.locator('[data-testid="reading-navigation"]').count()) throw new Error('Invalid route did not fall back')
    await page.goto(base + '/spine#stage-data-to-features')
    await page.waitForLoadState('networkidle')
    if (await page.locator('#unit-2').count() !== 1) throw new Error('Legacy spine anchor lost')
    await page.keyboard.press('Tab')
  }
  if (errors.length) throw new Error(errors.join('\n'))
  await page.screenshot({ path: '/tmp/ml-atlas-route-mobile.png', fullPage: false })
  return { passed: visited.length, locales: ['zh-CN', 'en'], viewports: [1280, 390], units: units.map(unit => unit.id) }
}
