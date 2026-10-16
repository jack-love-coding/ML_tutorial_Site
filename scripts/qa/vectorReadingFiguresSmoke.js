async (page) => {
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const path = '/math-lab/modules/beginner-linear-algebra?route=core-learning-path'
  const figures = [['beginner-linear-algebra-story', 'ordered-features'], ['beginner-linear-shape-ledger', 'sample-feature-axes']]
  const aliases = [['linear-algebra-feature-cards', figures[0][0]], ['beginner-vector-feature-space-longform', figures[0][0]], ['beginner-vector-feature-space-longform--minimum-linear-shape-ledger', figures[1][0]]]
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
      if (seeded) for (const key of ['ml-atlas:algorithm-progress:v1', 'ml-atlas:math-lab-progress:v1', 'ml-atlas:data-lab-progress:v1', 'ml-atlas:learning-progress:v2', 'ml-atlas:learning-progress:v2:migration', 'ml-atlas:checkpoint-report:vector']) localStorage.setItem(key, '  {"history":"保留 / unchanged"}  ')
    }, seeded)
    const before = await stored()
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    await page.goto(base + path)
    await page.getByTestId('math-reading-selection').waitFor()
    if (await page.locator('#beginner-linear-distance-similarity').count()) throw new Error('Selected reading included the full topic')
    const code = page.locator('pre').filter({ hasText: 'predictions = X @ w + bias' })
    if (await code.count() !== 1 || !(await page.locator('#minimum-linear-batch-output').innerText()).includes('predictions = [10.0, 5.0]')) throw new Error('Selected reading hid the reproducible code or output')
    if (!seeded) await page.locator('#minimum-linear-batch-output .math-code-lab').screenshot({ path: `/tmp/ml-atlas-vector-code-${locale}-${width}.png` })
    for (const [id, filename] of figures) {
      const figure = page.locator('#' + id), image = page.locator(`img[src$="/matrices/${filename}.svg"]`)
      await image.waitFor({ state: 'attached' })
      if (await image.count() !== 1) throw new Error('Missing or repeated vector figure')
      await image.evaluate(el => el.scrollIntoView({ block: 'center' })); await image.evaluate(el => el.decode())
      const size = await image.evaluate(el => ({ width: el.width, height: el.height, ratio: el.naturalWidth / el.naturalHeight }))
      const svg = await (await page.request.get(await image.evaluate(el => el.src))).text()
      const font = Math.min(...[...svg.matchAll(/font-size="([\d.]+)"/g)].map(match => Number(match[1])))
      if (font * size.width / 360 < 14 || Math.abs(size.ratio - size.width / size.height) > .02) throw new Error('Unreadable or cropped vector figure')
      if (!(await figure.innerText()).includes('[2, 3]') || !(await figure.innerText()).includes('[1, 4]')) throw new Error('Figure lost native sample explanations')
      if (!seeded) {
        await image.screenshot({ path: `/tmp/ml-atlas-vector-${filename}-${locale}-${width}.png` })
        await figure.locator('figcaption').screenshot({ path: `/tmp/ml-atlas-vector-${filename}-caption-${locale}-${width}.png` })
      }
    }
    for (const [alias, destination] of aliases) {
      await page.goto(base + path + '#' + alias)
      await page.locator('#' + alias).waitFor({ state: 'attached' })
      if (await page.locator('#' + alias).evaluate(el => el.closest('figure').id) !== destination) throw new Error('Legacy visual anchor changed meaning')
      await page.reload(); await page.locator('#' + alias).waitFor({ state: 'attached' })
      if (!page.url().endsWith('#' + alias) || !page.url().includes('route=core-learning-path')) throw new Error('Reload lost reading context')
      await page.getByTestId('math-reading-selection').waitFor()
      if (await page.locator('#beginner-linear-distance-similarity').count()) throw new Error('Visual anchor escaped the selected reading')
      const next = destination === figures[1][0] ? 'beginner-linear-matrix-machine' : 'minimum-linear-shape-ledger'
      if (!(await page.getByTestId('reading-next').first().getAttribute('href')).endsWith('#' + next)) throw new Error('Visual anchor lost the next reading step')
    }
    if (await page.locator('.katex-error').count() || await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Vector formula or page overflow')
    await page.getByTestId('full-math-topic').focus(); await page.keyboard.press('Enter')
    await page.locator('#beginner-linear-distance-similarity').waitFor({ state: 'attached' })
    await page.reload(); await page.locator('#minimum-linear-summary').waitFor({ state: 'attached' })
    if (await code.count() !== 1) throw new Error('Full topic duplicated the reference code')
    if (page.url().includes('route=') || await stored() !== before) throw new Error('Full topic or storage regression')
    passed++
  }
  for (const [id, filename] of figures) {
    await page.route('**/matrices/' + filename + '.svg', route => route.abort())
    await page.goto(base + path + '#' + id)
    const figure = page.locator('#' + id)
    await figure.scrollIntoViewIfNeeded()
    if (!(await figure.innerText()).includes('[2, 3]') || !(await figure.innerText()).includes('[1, 4]')) throw new Error('Image failure hid sample meanings')
    passed++
  }
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed, diagrams: 2, legacyAnchors: 3, fullTopic: true, imageFailureFallback: true, storage: 'byte-for-byte unchanged' }
}
