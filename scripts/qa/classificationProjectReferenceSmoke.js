async (page) => {
  page.setDefaultTimeout(15000)
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const chapters = ['problem-and-costs', 'text-to-features', 'pipeline-baseline', 'scores-thresholds', 'metrics-tradeoffs', 'error-review']
  const keys = ['ml-atlas:algorithm-progress:v1', 'ml-atlas:math-lab-progress:v1', 'ml-atlas:data-lab-progress:v1', 'ml-atlas:learning-progress:v2', 'ml-atlas:learning-progress:v2:migration', 'ml-atlas:course-progress:v1', 'ml-atlas:checkpoint-report:classification-project']
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const stored = () => page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([key]) => key !== 'ml-atlas-locale').sort())))
  let passed = 0
  for (const [locale, width] of [['zh-CN', 1280], ['en', 390]]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/')
    await page.evaluate(({ keys, seeded }) => {
      localStorage.clear()
      if (seeded) for (const key of keys) localStorage.setItem(key, '{ "preserve": " 历史数据 / unchanged " }')
    }, { keys, seeded: locale === 'en' })
    const before = await stored()
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    await page.goto(base + '/learn/classification-project/' + chapters[0] + '?route=core-learning-path')
    for (const [index, id] of chapters.entries()) {
      const chapter = page.locator('[data-section-id="' + id + '"]').first()
      await chapter.waitFor()
      await page.waitForLoadState('networkidle')
      const stages = chapter.locator('.workflow-lab__pipeline--classification .workflow-lab__stage')
      if (await stages.count() !== 6 || await stages.nth(index).getAttribute('aria-pressed') !== 'true') throw new Error('Wrong initial workflow stage: ' + id)
      await stages.nth((index + 1) % 6).focus()
      await page.keyboard.press('Enter')
      if (await stages.nth((index + 1) % 6).getAttribute('aria-pressed') !== 'true') throw new Error('Workflow keyboard selection failed')
      const summary = chapter.locator('details > summary').first()
      await summary.focus()
      await page.keyboard.press('Enter')
      await chapter.locator('details[open] pre code.language-python').waitFor()
      if (await page.locator('.katex-error').count()) throw new Error('Formula error')
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Code overflow: ' + id)
      if (await stored() !== before) throw new Error('Project changed learning storage')
      if (index === 0) {
        const downloadPaths = await chapter.locator('a[href]').evaluateAll(links => links.map(link => link.getAttribute('href')).filter(href => /\.(ipynb|csv|json|py|txt)$/.test(href)))
        if (downloadPaths.length < 9) throw new Error('Missing reference downloads')
        for (const path of downloadPaths) {
          if (!path.startsWith('/ML_tutorial_Site/')) throw new Error('Download omitted Pages base')
          const response = await page.request.get('http://127.0.0.1:4173' + path)
          if (!response.ok() || !(await response.body()).length) throw new Error('Unavailable reference download: ' + path)
        }
      }
      await page.reload()
      await page.locator('[data-section-id="' + id + '"]').first().waitFor()
      await page.waitForLoadState('networkidle')
      if (await stages.nth(index).getAttribute('aria-pressed') !== 'true') throw new Error('Scenario leaked across refresh')
      if (await stored() !== before) throw new Error('Refresh changed learning storage')
      passed++
      if (index < chapters.length - 1) {
        await page.locator('[data-testid="reading-next"]').first().click()
        await page.waitForURL(base + '/learn/classification-project/' + chapters[index + 1] + '?route=core-learning-path')
      }
    }
  }
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed, downloads: 'Pages base and HTTP success', storage: 'empty and seeded unchanged', workflow: 'section default, keyboard, refresh', code: 'six canonical blocks' }
}
