async (page) => {
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  page.setDefaultTimeout(15000)
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const keys = ['ml-atlas:algorithm-progress:v1', 'ml-atlas:math-lab-progress:v1', 'ml-atlas:data-lab-progress:v1', 'ml-atlas:learning-progress:v2', 'ml-atlas:learning-progress:v2:migration', 'ml-atlas:course-progress:v1', 'ml-atlas:checkpoint-report:calculus-gradient-descent']
  const stored = () => page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([key]) => key !== 'ml-atlas-locale').sort())))
  let passed = 0
  for (const seeded of [false, true]) for (const locale of ['zh-CN', 'en']) for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/')
    await page.evaluate(({ keys, seeded }) => {
      localStorage.clear()
      if (seeded) for (const key of keys) localStorage.setItem(key, '{ "historical": " 原样 unchanged " }')
    }, { keys, seeded })
    const before = await stored()
    await page.goto(base + '/math-lab/modules/beginner-probability-distributions#beginner-probability-conditional')
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    for (const [id, filename] of [['beginner-conditional-probability-longform', 'condition-denominator.svg'], ['beginner-bayes-update-longform', 'base-rate-comparison.svg']]) {
      const figure = page.locator('#' + id), image = figure.locator('img')
      await image.waitFor({ state: 'attached' }); await figure.scrollIntoViewIfNeeded(); await image.evaluate(image => image.decode())
      if (!await image.evaluate((image, filename) => image.src.endsWith('/probability/' + filename) && image.width <= 481 && Math.abs(image.naturalWidth / image.naturalHeight - image.width / image.height) < .02, filename)) throw new Error('Wrong or cropped probability diagram')
      if (!seeded) {
        await page.evaluate(id => window.scrollTo({ top: document.getElementById(id).getBoundingClientRect().top + window.scrollY - 120, behavior: 'instant' }), id)
        await page.screenshot({ path: `/tmp/ml-atlas-${filename}-${locale}-${width}.png` })
      }
    }
    const lab = page.locator('.conditional-bayes-lab'), slider = lab.locator('input[type=range]').first()
    const check = async (ratio, values) => {
      if ((await lab.locator('.conditional-bayes-lab__ratio strong').innerText()) !== ratio) throw new Error('Posterior ratio mismatch')
      const cells = await lab.locator('tbody tr').first().locator('td').allTextContents()
      if (JSON.stringify(cells) !== JSON.stringify(values)) throw new Error('Count mismatch: ' + cells)
    }
    await slider.scrollIntoViewIfNeeded(); await check('656 / 1760 ≈ 37.3%', ['800', '656', '144'])
    await slider.focus(); await slider.press('Home')
    await check('82 / 1270 ≈ 6.5%', ['100', '82', '18'])
    await lab.getByRole('button').click(); await check('656 / 1760 ≈ 37.3%', ['800', '656', '144'])
    await lab.locator('input[type=range]').nth(1).focus(); await page.keyboard.press('ArrowRight')
    await check('664 / 1768 ≈ 37.6%', ['800', '664', '136'])
    await lab.getByRole('button').click()
    if (!seeded) {
      await page.evaluate(() => window.scrollTo({ top: document.querySelector('.conditional-bayes-lab__evidence').getBoundingClientRect().top + window.scrollY - 120, behavior: 'instant' }))
      await page.screenshot({ path: `/tmp/ml-atlas-bayes-lab-${locale}-${width}.png` })
    }
    if (await stored() !== before) throw new Error('Learning storage changed on interaction')
    await page.reload(); await lab.waitFor(); await check('656 / 1760 ≈ 37.3%', ['800', '656', '144'])
    if (await stored() !== before) throw new Error('Learning storage changed on reload')
    if (await page.locator('.katex-error').count()) throw new Error('Probability formula error')
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Probability overflow')
    passed++
  }
  // Losing an illustration must not remove the native explanation and numeric table.
  await page.route('**/probability/condition-denominator.svg', route => route.abort())
  await page.reload()
  await page.locator('#beginner-conditional-probability-longform').scrollIntoViewIfNeeded()
  if (!(await page.locator('#beginner-conditional-probability-longform').innerText()).includes('1760')) throw new Error('Image failure removed explanation')
  await page.locator('.conditional-bayes-lab table').waitFor()
  passed++
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed, keyboardReset: true, storage: 'byte-for-byte unchanged', imageFailureFallback: true }
}
