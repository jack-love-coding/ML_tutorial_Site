async (page) => {
  page.setDefaultTimeout(15000)
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const lessons = ['calculus-functions-rate-change', 'calculus-gradient-descent', 'calculus-optimizer-comparison', 'calculus-training-code-diagnostics']
  const notebooks = ['least-squares-fitting', 'lu-decomposition', 'condition-numbers', 'sparse-matrices', 'pca', 'finite-difference-methods', 'nonlinear-equations', 'optimization', 'training-diagnostics']
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let passed = 0
  for (const [locale, width] of [['zh-CN', 1280], ['en', 390]]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/')
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    for (const moduleId of [...lessons, ...notebooks]) {
      await page.goto(`${base}/math-lab/modules/${moduleId}`)
      await page.locator('.math-module-main').waitFor({ state: 'visible' })
      await page.waitForLoadState('networkidle')
      if (await page.locator('.katex-error').count()) throw new Error(`Formula error: ${moduleId}`)
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error(`Overflow: ${moduleId} ${width}`)
      if (notebooks.includes(moduleId)) {
        const links = await page.locator('.math-notebook-companion a[download]').evaluateAll(nodes => nodes.map(node => node.href))
        if (links.length < 3 || links.some(href => !href.includes('/ML_tutorial_Site/'))) throw new Error(`Notebook association lost: ${moduleId}`)
        for (const href of links) if (!(await page.request.get(href)).ok()) throw new Error(`Notebook download missing: ${href}`)
      } else {
        await page.locator('.reference-example').first().waitFor({ state: 'visible' })
        const control = page.locator('main input[type="range"]:visible').first()
        if (await control.count()) { await control.focus(); await page.keyboard.press('ArrowRight') }
        await page.keyboard.press('Tab')
        await page.reload()
        await page.locator('.math-module-main').waitFor({ state: 'visible' })
      }
      passed += 1
    }
  }
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed, lessons: lessons.length, notebookAssociations: notebooks.length, locales: ['zh-CN', 'en'], widths: [1280, 390] }
}
