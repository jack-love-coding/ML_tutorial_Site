async (page) => {
  page.setDefaultTimeout(15000)
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let passed = 0
  for (const locale of ['zh-CN', 'en']) for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/data-lab/modules/splits-generalization?route=core-learning-path#fit-transform-rule')
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    const figure = page.getByTestId('split-fit-figure')
    await figure.waitFor()
    const initial = await figure.innerText()
    if (!initial.includes('0.447') || !initial.includes('μ = 2.5')) throw new Error('Safe numeric explanation missing')
    const lab = page.locator('.data-pipeline-task-lab')
    await lab.locator('.data-pipeline-task-lab__scenarios button').nth(1).focus()
    await page.keyboard.press('Enter')
    if (!(await figure.innerText()).includes('μ = 3')) throw new Error('Keyboard fit-source change failed')
    const code = await lab.locator('pre').innerText()
    if (code.indexOf('scaler.fit(raw_rows') > code.indexOf('= split(')) throw new Error('Unsafe code order contradicts the selected scenario')
    await lab.locator('.data-pipeline-task-lab__scenarios button').nth(2).click()
    if (!(await figure.innerText()).includes('east, north, south, west')) throw new Error('Vocabulary leakage invisible')
    await lab.getByRole('button', { name: locale === 'en' ? 'reset' : '重置', exact: true }).click()
    if ((await figure.innerText()) !== initial) throw new Error('Reset failed')
    await page.reload()
    await figure.waitFor()
    if ((await figure.innerText()) !== initial) throw new Error('Refresh did not restore memory-only defaults')
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Fit diagram overflow')
    passed++

    await page.goto(base + '/data-lab/modules/complexity-regularization?route=core-learning-path#overfit-underfit-curves')
    const curve = page.getByTestId('generalization-curve-lab')
    await curve.waitFor()
    const values = page.getByTestId('curve-values')
    if (!(await values.innerText()).includes('0.35')) throw new Error('Curve starts on wrong epoch')
    await curve.getByRole('slider').focus()
    await page.keyboard.press('End')
    const end = await values.innerText()
    if (!end.includes('0.04') || !end.includes('0.70')) throw new Error('Curve values contradict lesson')
    await curve.locator('summary').click()
    if (await curve.locator('tbody tr').count() !== 6) throw new Error('Missing accessible value table')
    await curve.getByRole('button', { name: locale === 'en' ? 'Reset' : '重置', exact: true }).click()
    if (!(await values.innerText()).includes('0.35')) throw new Error('Curve reset failed')
    for (const button of await curve.locator('.data-segmented-control button').all()) {
      await button.click()
      if (await button.getAttribute('aria-pressed') !== 'true') throw new Error('Curve scenario selection failed')
    }
    const revisit = page.locator('#l2-budget a')
    const href = await revisit.getAttribute('href')
    if (!href?.startsWith('/ML_tutorial_Site/learn/linear-regression/regularization')) throw new Error('Revisit link lost Pages base')
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Curve overflow')
    await curve.screenshot({ path: `/tmp/ml-atlas-curves-${locale}-${width}.png` })
    passed++

    for (const id of ['numerical-data', 'dataset-quality', 'categorical-data']) {
      await page.goto(base + '/data-lab/modules/' + id)
      const figures = page.locator('.data-visual-figure')
      await figures.first().waitFor()
      for (const f of await figures.all()) {
        await f.scrollIntoViewIfNeeded()
        await f.locator('img').evaluate(image => image.decode())
        if (await f.locator('.data-visual-figure__label').count() !== await f.locator('.data-visual-figure__legend li').count()) throw new Error('Incomplete numbered legend')
        const overlap = await f.locator('.data-visual-figure__label').evaluateAll(labels => {
          const bounds = labels.map(label => label.getBoundingClientRect())
          return bounds.some((a, i) => bounds.slice(i + 1).some(b => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top))
        })
        if (overlap) throw new Error('Figure markers overlap: ' + id)
      }
      if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Figure page overflow: ' + id)
      passed++
    }
  }
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed, locales: ['zh-CN', 'en'], widths: [1280, 390], reducedMotion: true }
}
