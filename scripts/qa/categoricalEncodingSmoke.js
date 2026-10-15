async (page) => {
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const url = base + '/data-lab/modules/categorical-data?route=core-learning-path#one-hot-and-sparsity'
  const errors = []; let expectedFailure = false, passed = 0
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error' && !expectedFailure) errors.push(message.text()) })
  page.setDefaultTimeout(15000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const stored = () => page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([key]) => key !== 'ml-atlas-locale').sort())))
  for (const locale of ['zh-CN', 'en']) for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/')
    await page.evaluate(seeded => { localStorage.clear(); if (seeded) for (const key of ['ml-atlas:algorithm-progress:v1', 'ml-atlas:math-lab-progress:v1', 'ml-atlas:data-lab-progress:v1', 'ml-atlas:learning-progress:v2', 'ml-atlas:learning-progress:v2:migration', 'ml-atlas:checkpoint-report:categorical-data']) localStorage.setItem(key, '  {"history":"保留 / unchanged"}  ') }, locale === 'en')
    const before = await stored()
    await page.goto(url)
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    const lab = page.locator('.categorical-encoding-lab'), district = lab.getByTestId('encoding-district')
    await lab.waitFor()
    if (await lab.count() !== 1 || await page.locator('.categorical-vocabulary-task-lab').count() !== 1) throw new Error('Repeated lab')
    const check = async (width, active, mapped) => {
      if (await lab.getByTestId('encoding-width').innerText() !== String(width) || await lab.getByTestId('encoding-active').innerText() !== active || await lab.getByTestId('encoding-mapped').innerText() !== mapped) throw new Error('Encoding result mismatch: ' + await lab.locator('.data-readout-grid').innerText())
    }
    await check(4, '1', 'south')
    for (const [value, active, mapped] of [['north','0','north'], ['west','2','<RARE>'], ['airport','3','<OOV>']]) { await district.selectOption(value); await check(4, active, mapped) }
    await district.selectOption('west')
    await lab.getByRole('slider').first().focus(); await page.keyboard.press('Home'); await check(4, '2', 'west')
    const reset = () => lab.getByRole('button', { name: locale === 'en' ? 'Reset' : '重置', exact: true }).click()
    await reset()
    await lab.getByRole('button', { name: locale === 'en' ? 'feature cross' : '特征交叉', exact: true }).focus(); await page.keyboard.press('Enter')
    await check(16, '5', 'south×condo')
    await district.selectOption('airport'); await lab.getByTestId('encoding-property').selectOption('loft'); await check(16, '15', '<OOV>×<OOV>')
    await lab.locator('summary').first().click()
    if (await lab.locator('tbody tr').count() !== 16) throw new Error('Incomplete full slot table')
    await lab.locator('summary').last().click()
    if (!(await lab.locator('pre').innerText()).includes('def fit_vocab')) throw new Error('Missing reproducible code')
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Expanded code or table overflow')
    await lab.getByRole('button', { name: 'multi-hot', exact: true }).click()
    await lab.getByLabel('roof', { exact: true }).check()
    if (!(await lab.getByTestId('encoding-mapped').innerText()).includes('<OOV>')) throw new Error('Unknown multi-hot tag not mapped')
    await lab.getByRole('button', { name: locale === 'en' ? 'hash buckets' : '哈希桶', exact: true }).click()
    await lab.getByRole('slider').focus(); await page.keyboard.press('Home')
    for (const value of ['north','airport']) { await district.selectOption(value); await check(4, '0', 'bucket_0') }
    await reset(); await check(4, '1', 'south')
    await lab.locator('summary').first().click()
    await lab.scrollIntoViewIfNeeded(); await page.screenshot({ path: `/tmp/ml-atlas-encoding-${locale}-${width}.png` })
    await page.reload(); await lab.waitFor(); await check(4, '1', 'south')
    if (await stored() !== before) throw new Error('Learning storage mutated')
    passed++
    for (const name of ['vocabulary', 'cross']) {
      const image = page.locator(`img[src$="/categorical/${name}.svg"]`)
      await image.scrollIntoViewIfNeeded(); await image.evaluate(image => image.decode())
      if (await image.count() !== 1 || !(await image.evaluate(image => Math.abs(image.width / image.height - 360 / 330) < .02 && image.width <= 481))) throw new Error('Duplicated or cropped diagram')
      await page.screenshot({ path: `/tmp/ml-atlas-category-${name}-${locale}-${width}.png` })
      passed++
    }
    if (await page.locator('.katex-error').count() || await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Formula or layout failure')
  }
  expectedFailure = true
  let failedRequests = 0
  await page.route('**/categorical/*.svg', route => { failedRequests++; return route.abort() })
  // Leave the current hash URL so this probes a fresh image request, not a same-document jump.
  await page.goto(base + '/')
  await page.goto(url)
  await page.locator('.data-visual-figure--compact').first().scrollIntoViewIfNeeded()
  await page.locator('.data-visual-figure--compact [role=status]').first().waitFor()
  if (!failedRequests) throw new Error('Image failure was not exercised')
  if (!(await page.locator('.data-visual-figure--compact').first().innerText()).includes('airport')) throw new Error('Caption lost after image failure')
  passed++
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed, modes: 4, codeAndSlots: true, storage: 'unchanged', failureCaption: true }
}
