async (page) => {
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const paths = ['/learn/python-notebook/matplotlib-visualization', '/learn/linear-regression/regularization', '/learn/housing-price-project/eda-first-pass']
  const errors = []; let passed = 0
  page.on('pageerror', error => errors.push(error.message))
  page.setDefaultTimeout(15000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const locale of ['zh-CN', 'en']) for (const width of [390, 1280]) for (const path of paths) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/')
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    await page.evaluate(() => { localStorage.setItem('ml-atlas:learning-progress:v2', '  {"historical":true}  ') })
    const before = await page.evaluate(() => JSON.stringify(localStorage))
    await page.goto(base + path)
    const trigger = page.locator('.frozen-figure-open').first()
    await trigger.scrollIntoViewIfNeeded()
    await page.waitForFunction(() => !document.querySelector('.frozen-figure-open')?.disabled)
    await trigger.focus(); await page.keyboard.press('Enter')
    const dialog = page.locator('dialog[open]')
    await dialog.waitFor()
    const img = dialog.locator('img')
    await img.evaluate(el => el.decode())
    if (!(await img.evaluate(el => Math.abs(el.width - el.naturalWidth) < 1))) throw new Error('Original-size view is not original size')
    await dialog.getByRole('button', { name: locale === 'en' ? 'Zoom in' : '放大', exact: true }).click()
    if (await dialog.locator('output').innerText() !== '125%') throw new Error('Zoom failed')
    const viewport = dialog.locator('.frozen-figure-viewport')
    await viewport.focus(); await page.keyboard.press('ArrowRight')
    await page.waitForFunction(() => document.querySelector('dialog[open] .frozen-figure-viewport').scrollLeft > 0)
    await dialog.getByRole('button', { name: locale === 'en' ? 'Reset' : '重置', exact: true }).click()
    if (await dialog.locator('output').innerText() !== '100%' || await viewport.evaluate(el => el.scrollLeft) !== 0) throw new Error('Reset failed')
    await dialog.getByRole('button', { name: locale === 'en' ? 'Close' : '关闭', exact: true }).focus()
    await page.keyboard.press('Shift+Tab')
    if (!(await page.evaluate(() => document.activeElement?.closest('dialog') !== null))) throw new Error('Modal focus escaped')
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Page overflow')
    if (width === 390) await dialog.screenshot({ path: '/tmp/ml-atlas-frozen-' + locale + '-' + path.split('/')[2] + '.png' })
    await page.keyboard.press('Escape')
    if (await page.locator('dialog[open]').count() || !(await trigger.evaluate(el => el === document.activeElement))) throw new Error('Close/focus return failed')
    await trigger.click(); await dialog.getByRole('button', { name: locale === 'en' ? 'Close' : '关闭', exact: true }).click()
    await page.reload(); await trigger.waitFor()
    if (await page.evaluate(() => JSON.stringify(localStorage)) !== before) throw new Error('Learning storage changed')
    passed++
  }
  await page.route('**/*.png', route => route.abort())
  for (const path of paths) {
    await page.goto(base + path)
    const fallback = page.locator('[role="status"], [role="img"]').filter({ hasText: /unavailable|Text alternative/ }).first()
    await page.locator('figure').first().scrollIntoViewIfNeeded()
    await fallback.waitFor()
    passed++
  }
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed }
}
