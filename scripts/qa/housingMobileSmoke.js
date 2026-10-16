async (page) => {
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const chapters = ['csv-to-frame', 'eda-first-pass', 'cleaning-splits', 'linear-baseline', 'evaluation', 'review-next-iteration']
  const errors = []; let passed = 0
  page.on('pageerror', error => errors.push(error.message))
  page.setDefaultTimeout(15000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const locale of ['zh-CN', 'en']) for (const width of [390, 1280]) for (const chapter of chapters) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/')
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    const before = await page.evaluate(() => JSON.stringify(localStorage))
    await page.goto(base + '/learn/housing-price-project/' + chapter)
    const scene = page.locator('.housing-scene')
    await scene.waitFor(); await scene.scrollIntoViewIfNeeded()
    const asset = await (await page.request.get(base + '/tabular-regression/interactions/' + chapter + '.json')).json()
    const selects = scene.locator('select')
    for (let i = 0; i < await selects.count(); i++) {
      const select = selects.nth(i), count = await select.locator('option').count()
      if (!count) continue
      await select.focus(); await page.keyboard.press('End'); await page.keyboard.press('Enter')
      await select.selectOption({ index: count - 1 })
      await select.selectOption({ index: 0 })
    }
    if (chapter === 'linear-baseline') {
      const sample = asset.samples[0]
      const text = await scene.innerText()
      for (const n of [sample.actual, sample.prediction, sample.actual - sample.prediction]) if (!text.includes(n.toFixed(3))) throw new Error('Contribution summary changed')
      for (const [name, value] of Object.entries(sample.contributions)) {
        const row = scene.locator('svg g').filter({ hasText: name })
        if (!(await row.textContent()).includes(Math.abs(value).toFixed(3))) throw new Error('Contribution label changed')
      }
    }
    if (chapter === 'review-next-iteration' && !(await scene.locator('.housing-scene__watch').innerText()).includes(locale === 'en' ? 'A sample of final test residuals' : '当前显示测试残差抽样')) throw new Error('All residuals incorrectly use a subgroup summary')
    if (chapter === 'review-next-iteration') for (const value of Object.values(asset.testMetrics)) {
      if (!(await scene.innerText()).includes(value.toFixed(6))) throw new Error('Frozen test result changed')
    }
    if (chapter === 'eda-first-pass') {
      await scene.getByRole('button', { name: locale === 'en' ? 'Geography' : '地理结构', exact: true }).click()
      if (await scene.locator('svg circle').count() !== asset.scatter.length) throw new Error('Geography points changed')
      await scene.getByRole('button', { name: locale === 'en' ? 'Binned relation' : '分箱关系', exact: true }).click()
    }
    if (chapter === 'cleaning-splits') await scene.getByRole('button', { name: locale === 'en' ? 'Scale' : '尺度', exact: true }).click()
    const svg = scene.locator('svg')
    if (await svg.count()) {
      await page.waitForFunction(() => {
        const svg = document.querySelector('.housing-scene svg')
        return Math.abs(svg.viewBox.baseVal.width - svg.clientWidth) < 3
      })
      const invalid = await svg.locator('text').evaluateAll(nodes => nodes.filter(el => {
        const size = parseFloat(getComputedStyle(el).fontSize) * Math.hypot(el.getScreenCTM().a, el.getScreenCTM().b)
        const box = el.getBoundingClientRect(), bounds = el.ownerSVGElement.getBoundingClientRect()
        return size < 13.8 || box.left < bounds.left - 1 || box.right > bounds.right + 1
      }).map(el => el.textContent))
      if (invalid.length) throw new Error('Unreadable or clipped labels: ' + invalid.join(', '))
    } else if (await scene.locator('.housing-scene__flow li').count() !== 3) throw new Error('Missing flow steps')
    await scene.locator('summary').focus(); await page.keyboard.press('Enter')
    if (!(await scene.locator('details').getAttribute('open') === '')) throw new Error('Keyboard text fallback unavailable')
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Page overflow')
    if (width === 390) await scene.screenshot({ path: '/tmp/ml-atlas-housing-' + chapter + '-' + locale + '.png' })
    await page.reload(); await scene.waitFor()
    if (await page.evaluate(() => JSON.stringify(localStorage)) !== before) throw new Error('Learning storage changed')
    passed++
  }
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed }
}
