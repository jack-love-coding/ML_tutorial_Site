async (page) => {
  page.setDefaultTimeout(15000)
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const bridges = [
    ['calculus-functions-rate-change', ['mapping-intuition', 'worked-prediction', 'python-translation'], 11, 'prediction-mapping-lab'],
    ['beginner-linear-algebra', ['beginner-linear-data-vector', 'minimum-linear-shape-ledger', 'beginner-linear-matrix-machine', 'minimum-linear-batch-output'], 8],
    ['calculus-derivatives-local-change', ['derivatives-intuition', 'derivatives-worked-shared', 'minimum-derivative-local-approximation'], 12],
    ['calculus-partial-derivatives-gradients', ['partial-one-direction', 'gradient-collects-partials'], 7, 'calculus-partial-derivative-lab'],
  ]
  let passed = 0
  for (const [locale, width] of [['zh-CN', 1280], ['en', 390]]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/spine')
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    for (const [id, sections, fullCount, labId] of bridges) {
      const url = `${base}/math-lab/modules/${id}?route=core-learning-path#${sections[0]}`
      await page.goto(url)
      await page.waitForLoadState('networkidle')
      await page.locator('[data-testid="math-reading-selection"]').waitFor()
      const actual = await page.locator('.math-article-section').evaluateAll(nodes => nodes.map(node => node.id))
      if (JSON.stringify(actual) !== JSON.stringify(sections)) throw new Error('Wrong selected body: ' + id)
      const links = page.locator('.math-article-nav nav a')
      if (await links.count() !== sections.length) throw new Error('Wrong selected contents: ' + id)
      if (labId) {
        const lab = page.locator('#' + labId)
        await lab.locator('input[type="range"]').first().waitFor()
        await lab.locator('input[type="range"]').first().focus()
        await page.keyboard.press('ArrowRight')
        await lab.getByRole('button', { name: /重置|Reset/i }).first().click()
      } else if (await page.locator('.math-module-labs').count()) throw new Error('Unselected lab leaked: ' + id)
      await links.last().click()
      await page.reload()
      await page.waitForLoadState('networkidle')
      if (!page.url().includes('route=core-learning-path')) throw new Error('Reading context lost')
      if (await page.locator('.math-article-section').count() !== sections.length) throw new Error('Reload lost selection')
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Overflow: ' + id)
      await page.locator('[data-testid="full-math-topic"]').click()
      await page.waitForLoadState('networkidle')
      if (page.url().includes('route=core-learning-path')) throw new Error('Full topic retained reading context')
      if (await page.locator('.math-article-section').count() !== fullCount) throw new Error('Full topic lost sections: ' + id)
      if (await page.locator('[data-testid="math-reading-selection"]').count()) throw new Error('Full topic still selected')
      passed++
    }
  }
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed, selection: 'body, contents, resources, controls, reload and full-topic exit' }
}
