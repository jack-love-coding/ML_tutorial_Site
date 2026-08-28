async (page) => {
  const origin = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const moduleIds = [
    'loss-functions',
    'linear-regression',
    'housing-price-project',
    'logistic-regression',
    'classification',
  ]
  const courseUnits = [
    '08-linear-regression-optimization',
    '08-linear-regression-optimization',
    '14-tabular-pipeline',
    '09-logistic-regression-thresholds',
    '09-logistic-regression-thresholds',
  ]
  const locales = ['zh-CN', 'en']
  const widths = [1440, 390]
  const results = []
  const consoleErrors = []
  const legacySentinels = {
    'ml-atlas:math-lab-progress:v1': 'phase31-math-byte-sentinel',
    'ml-atlas:data-lab-progress:v1': 'phase31-data-byte-sentinel',
    'ml-atlas:learning-progress:v2': 'phase31-learning-v2-byte-sentinel',
  }

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })

  await page.goto(`${origin}/learn/loss-functions`)
  await page.evaluate(({ sentinels }) => {
    for (const [key, value] of Object.entries(sentinels)) localStorage.setItem(key, value)
  }, { sentinels: legacySentinels })

  for (const locale of locales) {
    await page.evaluate((nextLocale) => localStorage.setItem('ml-atlas-locale', nextLocale), locale)
    for (const width of widths) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 })
      for (const [index, moduleId] of moduleIds.entries()) {
        consoleErrors.length = 0
        const response = await page.goto(`${origin}/learn/${moduleId}`)
        await page.locator('.corridor-nav').waitFor()
        await page.locator('.algorithm-hero h1').waitFor()
        const probe = await page.evaluate(() => {
          const active = document.querySelector('.corridor-nav__steps .is-current a')
          const publicAssets = [...document.querySelectorAll('img[src], video source[src], a[download][href]')]
            .map((element) => element.getAttribute('src') ?? element.getAttribute('href'))
            .filter(Boolean)
          return {
            lang: document.documentElement.lang,
            overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
            stepLinks: document.querySelectorAll('.corridor-nav__steps a').length,
            currentSteps: document.querySelectorAll('.corridor-nav__steps .is-current').length,
            currentHref: active?.getAttribute('href') ?? '',
            ariaCurrent: active?.getAttribute('aria-current') ?? '',
            actionHrefs: [...document.querySelectorAll('.corridor-nav__action')]
              .map((link) => link.getAttribute('href')),
            courseHref: document.querySelector('.corridor-nav__course-link')?.getAttribute('href') ?? '',
            katexErrors: document.querySelectorAll('.katex-error').length,
            reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
            publicAssets,
            textLength: document.body.innerText.length,
          }
        })
        const expectedPrevious = moduleIds[index - 1]
        const expectedNext = moduleIds[index + 1]
        const passed = response?.status() === 200
          && probe.lang === locale
          && !probe.overflow
          && probe.stepLinks === 5
          && probe.currentSteps === 1
          && probe.currentHref === `/ML_tutorial_Site/learn/${moduleId}`
          && probe.ariaCurrent === 'step'
          && probe.actionHrefs.length === (index === 0 || index === moduleIds.length - 1 ? 1 : 2)
          && (!expectedPrevious || probe.actionHrefs.some((href) => href?.endsWith(`/learn/${expectedPrevious}`)))
          && (!expectedNext || probe.actionHrefs.some((href) => href?.endsWith(`/learn/${expectedNext}`)))
          && probe.courseHref.endsWith(`/courses/ai-foundation/units/${courseUnits[index]}`)
          && probe.katexErrors === 0
          && probe.reducedMotion
          && probe.publicAssets.every((path) => path?.startsWith('/ML_tutorial_Site/'))
          && probe.textLength > 1000
          && consoleErrors.length === 0
        if (!passed) throw new Error(`Phase 31 corridor failed: ${JSON.stringify({ locale, width, moduleId, probe, consoleErrors })}`)
        results.push({ locale, width, moduleId, ...probe })
      }
    }
  }

  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`${origin}/learn/loss-functions`)
  const nextLink = page.locator('.corridor-nav__action--next')
  await nextLink.focus()
  await page.keyboard.press('Enter')
  await page.locator('.corridor-nav__steps .is-current a[href$="/learn/linear-regression"]')
    .waitFor({ state: 'attached' })
  if (!page.url().includes('/learn/linear-regression')) throw new Error(`Keyboard traversal failed: ${page.url()}`)

  const preserved = await page.evaluate(({ sentinels }) => Object.fromEntries(
    Object.keys(sentinels).map((key) => [key, localStorage.getItem(key)]),
  ), { sentinels: legacySentinels })
  if (JSON.stringify(preserved) !== JSON.stringify(legacySentinels)) {
    throw new Error(`Legacy stores changed: ${JSON.stringify({ preserved, legacySentinels })}`)
  }

  return { cases: results.length, failures: 0, keyboardTraversal: true, legacyStoresPreserved: true, results }
}
