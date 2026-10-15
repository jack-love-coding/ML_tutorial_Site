async (page) => {
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const url = base + '/math-lab/modules/calculus-partial-derivatives-gradients?route=core-learning-path#partial-one-direction'
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  let expectedImageFailure = false
  page.on('console', message => { if (message.type() === 'error' && !expectedImageFailure) errors.push(message.text()) })
  page.setDefaultTimeout(15000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  let passed = 0
  for (const locale of ['zh-CN', 'en']) for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/')
    await page.evaluate(seeded => {
      localStorage.clear()
      if (seeded) for (const key of ['ml-atlas:algorithm-progress:v1', 'ml-atlas:math-lab-progress:v1', 'ml-atlas:data-lab-progress:v1', 'ml-atlas:learning-progress:v2', 'ml-atlas:learning-progress:v2:migration', 'ml-atlas:checkpoint-report:calculus-partial-derivatives-gradients']) localStorage.setItem(key, '  {"preserved":"历史 / unchanged"}  ')
    }, locale === 'en')
    const stored = () => page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([key]) => key !== 'ml-atlas-locale').sort())))
    const before = await stored()
    await page.goto(url)
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    const lab = page.locator('.partial-derivative-lab'), sliders = lab.locator('input[type=range]')
    await lab.waitFor()
    const fills = await lab.locator('marker path').evaluateAll(paths => paths.map(path => getComputedStyle(path).fill))
    if (JSON.stringify(fills) !== JSON.stringify(['rgb(56, 104, 255)', 'rgb(214, 90, 49)', 'rgb(15, 159, 122)'])) throw new Error('Other course styles changed arrow semantics: ' + fills)
    const values = () => lab.locator('.math-readout-grid strong').allTextContents()
    const checkLoss = async value => { if ((await values())[0] !== value) throw new Error('Unexpected loss: ' + await values()) }
    await checkLoss('1.548')
    await sliders.nth(0).focus(); await sliders.nth(0).press('ArrowRight'); await checkLoss('1.633')
    await lab.getByRole('button', { name: locale === 'en' ? 'reset' : '重置', exact: true }).click()
    await sliders.nth(1).focus(); await sliders.nth(1).press('ArrowRight'); await checkLoss('1.514')
    await lab.getByRole('button', { name: locale === 'en' ? 'reset' : '重置', exact: true }).click()
    // The directional control is keyboard-operable, and its coordinate directions agree with partials.
    await sliders.nth(2).focus(); for (let i = 0; i < 7; i++) await sliders.nth(2).press('ArrowLeft')
    if ((await values())[4] !== '1.664') throw new Error('0-degree direction mismatch')
    for (let i = 0; i < 18; i++) await sliders.nth(2).press('ArrowRight')
    if ((await values())[4] !== '-0.696') throw new Error('90-degree direction mismatch')
    await lab.getByRole('button', { name: locale === 'en' ? 'reset' : '重置', exact: true }).click()
    const geometry = await lab.locator('.interactive-plane').evaluate(svg => {
      const arrow = svg.querySelector('.partial-derivative-lab__vector--gradient')
      const contour = svg.querySelector('.partial-derivative-lab__current-contour')
      const length = contour.getTotalLength(), x = Number(arrow.getAttribute('x1')), y = Number(arrow.getAttribute('y1'))
      let distance = Infinity
      for (let i = 0; i <= 2000; i++) { const p = contour.getPointAtLength(length * i / 2000); distance = Math.min(distance, Math.hypot(x - p.x, y - p.y)) }
      return { viewBox: svg.getAttribute('viewBox'), distance }
    })
    if (geometry.viewBox !== '0 0 360 360' || geometry.distance > .3) throw new Error('Contour and parameter point use different coordinates: ' + JSON.stringify(geometry))
    for (const slider of await sliders.all().then(items => items.slice(0, 2))) await slider.evaluate(input => { input.value = '0'; input.dispatchEvent(new Event('input', { bubbles: true })) })
    await lab.getByRole('status').waitFor()
    if (await lab.locator('.partial-derivative-lab__vector--gradient').count()) throw new Error('Zero gradient has no unique direction')
    await lab.getByRole('button', { name: locale === 'en' ? 'reset' : '重置', exact: true }).click()
    await lab.locator('input[type=checkbox]').uncheck()
    if (await lab.locator('.partial-derivative-lab__vector--negative').count()) throw new Error('Negative arrow toggle failed')
    await lab.getByRole('button', { name: locale === 'en' ? 'reset' : '重置', exact: true }).click()
    await lab.scrollIntoViewIfNeeded()
    await page.screenshot({ path: `/tmp/ml-atlas-partial-lab-${locale}-${width}.png` })
    const figure = page.locator('#partial-gradient-image'), image = figure.locator('img')
    await figure.scrollIntoViewIfNeeded(); await image.evaluate(image => image.decode())
    if (!(await image.evaluate(image => image.src.endsWith('/partials/gradient-contour.svg') && Math.abs(image.width / image.height - 360 / 440) < .02))) throw new Error('Incorrect figure or cropping')
    await page.screenshot({ path: `/tmp/ml-atlas-partial-figure-${locale}-${width}.png` })
    if (await page.locator('.katex-error').count()) throw new Error('Formula error')
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Page overflow')
    await page.reload(); await sliders.first().waitFor(); await checkLoss('1.548')
    passed++
    await page.goto(base + '/math-lab/modules/calculus-partial-derivatives-gradients#partial-one-direction')
    await lab.waitFor()
    if (await page.locator('#partial-knob-case').count() !== 1 || await page.locator('.partial-derivative-lab').count() !== 1) throw new Error('Full topic must keep every section and one lab')
    if (await stored() !== before) throw new Error('Historical learning storage changed')
    passed++
  }
  expectedImageFailure = true
  await page.route('**/partials/gradient-contour.svg', route => route.abort())
  await page.goto(url)
  await page.locator('#partial-gradient-image').scrollIntoViewIfNeeded()
  await page.getByRole('button', { name: '中', exact: true }).click()
  if (!(await page.locator('#gradient-collects-partials').innerText()).includes('1.664')) throw new Error('Missing native explanation when figure fails')
  passed++
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed, geometry: true, keyboardReset: true, failureExplanation: true }
}
