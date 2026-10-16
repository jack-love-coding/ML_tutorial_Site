async (page) => {
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const path = '/math-lab/modules/beginner-probability-distributions?route=core-learning-path#beginner-probability-why-longform'
  const figures = ['outcome-distribution', 'event-indicator', 'sample-frequency', 'same-mean-spread', 'calibration-cohort', 'softmax-target']
  page.setDefaultTimeout(15000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const errors = []; let passed = 0
  page.on('pageerror', error => errors.push(error.message))
  const stored = () => page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([key]) => key !== 'ml-atlas-locale').sort())))
  for (const seeded of [false, true]) for (const locale of ['zh-CN', 'en']) for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/')
    await page.evaluate(seeded => {
      localStorage.clear()
      if (seeded) for (const key of ['ml-atlas:algorithm-progress:v1', 'ml-atlas:math-lab-progress:v1', 'ml-atlas:data-lab-progress:v1', 'ml-atlas:learning-progress:v2', 'ml-atlas:learning-progress:v2:migration', 'ml-atlas:checkpoint-report:classification']) localStorage.setItem(key, '  {"history":"保留 / unchanged"}  ')
    }, seeded)
    const before = await stored()
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    await page.goto(base + path)
    for (const filename of figures) {
      const image = page.locator(`img[src$="/probability/${filename}.svg"]`)
      await image.waitFor({ state: 'attached' })
      if (await image.count() !== 1) throw new Error('Missing or repeated diagram: ' + filename)
      await image.evaluate(el => el.scrollIntoView({ block: 'center' })); await image.evaluate(el => el.decode())
      const dimensions = await image.evaluate(el => ({ width: el.width, height: el.height, ratio: el.naturalWidth / el.naturalHeight }))
      const svg = await (await page.request.get(await image.evaluate(el => el.src))).text()
      const fontSize = Math.min(...[...svg.matchAll(/font-size="([\d.]+)"/g)].map(match => Number(match[1])))
      if (fontSize * dimensions.width / 360 < 14 || Math.abs(dimensions.ratio - dimensions.width / dimensions.height) > .02) throw new Error('Unreadable or cropped diagram: ' + filename)
      if (!seeded) await image.locator('..').screenshot({ path: `/tmp/ml-atlas-probability-${filename}-${locale}-${width}.png` })
    }
    const softmax = page.locator('#beginner-softmax-cross-entropy-longform')
    if (await softmax.locator('table tbody tr').count() !== 3 || !(await softmax.innerText()).includes('2.637510')) throw new Error('Missing exact probability/loss explanation')
    const lab = page.locator('.distribution-builder-lab'), slider = lab.locator('input[type=range]').first()
    const initial = await lab.locator('.math-readout-grid').innerText()
    await lab.getByRole('button', { name: '60', exact: true }).click()
    if (await slider.inputValue() !== '60') throw new Error('Sample preset failed')
    await slider.focus(); await page.keyboard.press('End')
    if (await slider.inputValue() !== '900') throw new Error('Keyboard parameter failed')
    await lab.getByRole('button', { name: locale === 'en' ? 'reset' : '重置', exact: true }).click()
    if (await slider.inputValue() !== '300' || await lab.locator('.math-readout-grid').innerText() !== initial) throw new Error('Reset changed deterministic output')
    if (await page.locator('.katex-error').count() || await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Formula or page overflow')
    await page.reload(); await page.locator('#beginner-probability-why-longform').waitFor({ state: 'attached' })
    if (!page.url().includes('route=core-learning-path') || !page.url().endsWith('#beginner-probability-why-longform') || await stored() !== before) throw new Error('Lost anchor, route or storage: ' + JSON.stringify({ url: page.url(), before, after: await stored() }))
    passed++
  }
  await page.route('**/probability/softmax-target.svg', route => route.abort())
  await page.reload()
  const explanation = page.locator('#beginner-softmax-cross-entropy-longform')
  await explanation.scrollIntoViewIfNeeded()
  if (await explanation.locator('table tbody tr').count() !== 3 || !(await explanation.innerText()).includes('2.637510')) throw new Error('Image failure removed numerical explanation')
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed: passed + 1, diagrams: 6, keyboardReset: true, imageFailureFallback: true, storage: 'byte-for-byte unchanged' }
}
