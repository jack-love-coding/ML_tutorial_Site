async (page) => {
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const cases = /* handoff-cases */ []
  if (!cases.length) throw new Error('Missing handoff cases')
  const manifest = await (await page.request.get(base + '/textbook-readings.json')).json()
  const readings = manifest.units.flatMap(unit => unit.readings)
  // GitHub Pages adds a trailing slash to static directories; route queries and hashes must still match.
  const withoutTrailingPathSlash = url => url.replace(/^([^?#]*)\/([?#]|$)/, '$1$2')
  const errors = []; let passed = 0
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  page.setDefaultTimeout(15000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const stored = () => page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([key]) => key !== 'ml-atlas-locale').sort())))
  for (const locale of ['zh-CN', 'en']) for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/')
    await page.evaluate(seeded => { localStorage.clear(); if (seeded) for (const key of ['ml-atlas:algorithm-progress:v1', 'ml-atlas:math-lab-progress:v1', 'ml-atlas:data-lab-progress:v1', 'ml-atlas:learning-progress:v2', 'ml-atlas:learning-progress:v2:migration', 'ml-atlas:checkpoint-report:classification']) localStorage.setItem(key, '  {"history":"保留 / unchanged"}  ') }, locale === 'en')
    const before = await stored()
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    for (const probe of cases) {
      const index = readings.findIndex(lesson => lesson.moduleId === probe.moduleId && lesson.lessonId === probe.lessonId)
      if (index < 0) throw new Error('Missing source lesson')
      const current = readings[index], next = readings[index + 1]
      const targetPath = probe.optionalPath ?? next.path + '?route=core-learning-path' + (next.hash ?? '')
      const target = base + targetPath
      await page.goto(base + current.path + '?route=core-learning-path' + (current.hash ?? ''))
      await page.waitForLoadState('networkidle')
      // Restrict to authored teaching prose; a correct footer must not hide a stale narrative link.
      const link = page.locator(`.markdown-math a[href="/ML_tutorial_Site${targetPath}"]`)
      if (await link.count() !== 1) throw new Error('Missing or duplicated narrative link: ' + target)
      await link.scrollIntoViewIfNeeded()
      if (!(await link.evaluate(anchor => getComputedStyle(anchor).textDecorationLine)).includes('underline')) throw new Error('Narrative link is not visually identifiable')
      if (await page.locator('.katex-error').count() || await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Formula or layout error at ' + page.url())
      if (probe.moduleId === 'beginner-probability-distributions') {
        for (const id of ['beginner-probability-story', 'beginner-sample-space-random-variable-longform', 'beginner-distribution-frequency-longform']) if (await page.locator(`figure[id="${id}"] img`).count() !== 1) throw new Error('Repeated probability overview image: ' + id)
      }
      if (!probe.optionalPath && ['python-notebook', 'housing-price-project', 'beginner-probability-distributions', 'model-selection'].includes(probe.moduleId)) await page.screenshot({ path: `/tmp/ml-atlas-handoff-${probe.moduleId}-${locale}-${width}.png` })
      await page.keyboard.press('Tab')
      await link.focus()
      if (!(await link.evaluate(anchor => Number.parseFloat(getComputedStyle(anchor).outlineWidth) >= 2))) throw new Error('Missing keyboard focus indicator')
      await page.keyboard.press('Enter')
      await page.waitForURL(url => withoutTrailingPathSlash(url.href) === withoutTrailingPathSlash(target))
      await page.waitForLoadState('networkidle')
      if (probe.optionalPath) {
        if (probe.moduleId === 'python-notebook') await page.locator('[data-testid="python-data-tools-current-chapter"][data-section-id="seaborn-statistics"]').waitFor()
        else await page.locator('#monte-carlo-reproducible-randomness').waitFor()
      } else await page.getByTestId('reading-navigation').first().waitFor()
      await page.reload(); await page.waitForLoadState('networkidle')
      if (withoutTrailingPathSlash(page.url()) !== withoutTrailingPathSlash(target) || await stored() !== before) throw new Error('Lost route or mutated learning storage')
      passed++
    }
  }
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed, units: 6, narrativeLinks: true, optionalTopics: true, refresh: true, storage: 'unchanged' }
}
