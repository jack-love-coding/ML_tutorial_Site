async (page) => {
  page.setDefaultTimeout(15000)
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const cases = [
    ['ai-overview', 'blocks', '.lesson-page'],
    ['gradient-descent', 'gradient', '[data-testid="gradient-current-chapter"]'],
    ['optimizer-comparison', 'optimizer', '[data-testid="optimizer-current-chapter"]'],
    ['housing-price-project', 'housing', '[data-testid="housing-current-chapter"]'],
    ['linear-regression', 'linear', '[data-testid="linear-current-chapter"]'],
    ['logistic-regression', 'logistic', '[data-testid="logistic-current-chapter"]'],
    ['tree-forest', 'workflow', '.algorithm-layout--workflow-story'],
    ['loss-functions', 'loss', '.algorithm-layout--lesson-story'],
    ['classification', 'classification', '.algorithm-layout--classification-story'],
    ['mlp', 'neural', '.neural-guided-lesson'],
    ['cnn-visualization', 'neural', '.neural-guided-lesson'],
  ]
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error' || /Extraneous non|Missing required prop|Invalid prop/.test(message.text())) errors.push(message.text()) })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let passed = 0
  for (const [locale, width] of [['zh-CN', 1280], ['en', 390]]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/')
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    for (const [moduleId, renderer, selector] of cases) {
      await page.goto(`${base}/learn/${moduleId}`)
      await page.locator(selector).first().waitFor({ state: 'visible' })
      await page.waitForLoadState('networkidle')
      if (await page.locator('.algorithm-view').getAttribute('data-renderer') !== renderer) throw new Error(`Incorrect renderer: ${moduleId}`)
      const control = page.locator('main input[type="range"]:visible').first()
      if (await control.count()) { await control.focus(); await page.keyboard.press('ArrowRight') }
      const reset = page.locator('main button:visible').filter({ hasText: /^(重置|重置实验|Reset|Reset experiment)$/ }).first()
      if (await reset.count()) await reset.click()
      await page.keyboard.press('Tab')
      if (await page.locator('.katex-error').count()) throw new Error(`Formula rendering error: ${moduleId}`)
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error(`Overflow: ${moduleId} ${width}`)
      if (renderer === 'neural') {
        await page.locator('.neural-explorer-link').click()
        await page.waitForURL(new RegExp(`/learn/${moduleId}/explore`))
        await page.waitForLoadState('networkidle')
        if (!page.url().includes(`/learn/${moduleId}/explore`)) throw new Error(`Explorer link failed: ${moduleId}`)
      }
      passed += 1
    }
  }
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed, renderers: 'all teaching modes', exploration: 'MLP and CNN', locales: ['zh-CN', 'en'], widths: [1280, 390] }
}
