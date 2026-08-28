async (page) => {
  const origin = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const overviewPath = '/courses/ai-foundation'
  const unitIds = [
    '07-ml-experiment-design',
    '08-linear-regression-optimization',
    '09-logistic-regression-thresholds',
    '10-classic-classifiers',
    '11-decision-trees',
    '12-bagging-random-forests',
    '13-gradient-boosting',
    '14-tabular-pipeline',
  ]
  const locales = ['zh-CN', 'en']
  const widths = [1440, 768, 390]
  const results = []
  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })

  const setLocale = async (locale) => {
    await page.goto(`${origin}${overviewPath}`)
    await page.evaluate((nextLocale) => localStorage.setItem('ml-atlas-locale', nextLocale), locale)
  }

  for (const locale of locales) {
    await setLocale(locale)
    for (const width of widths) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 })
      consoleErrors.length = 0
      const overviewResponse = await page.goto(`${origin}${overviewPath}`)
      await page.locator('.course-stage-list').waitFor()
      const overview = await page.evaluate(() => ({
        status: document.querySelectorAll('.course-stage-card.is-published').length,
        planned: document.querySelectorAll('.course-stage-card.is-planned').length,
        links: document.querySelectorAll('.course-unit-list a').length,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        lang: document.documentElement.lang,
      }))
      if (overviewResponse?.status() !== 200 || overview.status !== 2 || overview.planned !== 2 || overview.links !== 14 || overview.overflow || overview.lang !== locale) {
        throw new Error(`Part B overview failed: ${JSON.stringify({ locale, width, overview })}`)
      }

      for (const [index, unitId] of unitIds.entries()) {
        consoleErrors.length = 0
        const response = await page.goto(`${origin}${overviewPath}/units/${unitId}`)
        await page.locator('.course-study-loop').waitFor()
        const probe = await page.evaluate(() => {
          const assetLinks = [...document.querySelectorAll('.course-resource-list a[download]')].map((link) => link.getAttribute('href'))
          return {
            lang: document.documentElement.lang,
            overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
            steps: document.querySelectorAll('.course-step').length,
            code: Boolean(document.querySelector('.course-step pre code')),
            checkpointOptions: document.querySelectorAll('.course-checkpoint input[type="radio"]').length,
            criteria: document.querySelectorAll('.course-self-check > label').length,
            resources: document.querySelectorAll('.course-resource-list a').length,
            assetLinks,
            katexErrors: document.querySelectorAll('.katex-error').length,
            reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
            previousHref: document.querySelector('.course-unit-pagination a:first-child')?.getAttribute('href') ?? '',
            nextHref: document.querySelector('.course-unit-pagination a:last-child')?.getAttribute('href') ?? '',
          }
        })
        const expectedPrevious = index === 0 ? '06-eda-visual-evidence' : unitIds[index - 1]
        const expectedNext = index === unitIds.length - 1 ? '' : unitIds[index + 1]
        const passed = response?.status() === 200 && probe.lang === locale && !probe.overflow
          && probe.steps === 7 && probe.code && probe.checkpointOptions === 3 && probe.criteria >= 3
          && probe.resources >= 2 && probe.katexErrors === 0 && probe.reducedMotion
          && probe.assetLinks.every((href) => href?.startsWith('/ML_tutorial_Site/'))
          && probe.previousHref.includes(expectedPrevious)
          && (expectedNext ? probe.nextHref.includes(expectedNext) : probe.nextHref === '/ML_tutorial_Site/courses/ai-foundation')
          && consoleErrors.length === 0
        if (!passed) throw new Error(`Part B unit failed: ${JSON.stringify({ locale, width, unitId, probe, consoleErrors })}`)
        results.push({ locale, width, unitId, ...probe })
      }
    }
  }

  await setLocale('zh-CN')
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${origin}${overviewPath}/units/09-logistic-regression-thresholds`)
  const firstStep = page.locator('.course-step-check input').first()
  await firstStep.focus()
  await page.keyboard.press('Space')
  if (!await firstStep.isChecked()) throw new Error('Keyboard step completion did not toggle.')
  await page.reload()
  const persisted = page.locator('.course-step-check input').first()
  if (!await persisted.isChecked()) throw new Error('Course step completion did not persist after reload.')
  await persisted.uncheck()

  const plannedResponse = await page.goto(`${origin}${overviewPath}/units/15-mlp-backpropagation`)
  await page.locator('.course-notice').waitFor()
  if (plannedResponse?.status() !== 200 || !page.url().includes('/courses/ai-foundation?notice=planned-unit#stage-deep-learning-cv-nlp')) {
    throw new Error(`Planned unit did not return to its stage: ${page.url()}`)
  }

  return { cases: results.length, failures: 0, keyboardPersistence: true, plannedRedirect: true, results }
}
