async (page) => {
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  page.setDefaultTimeout(15000)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const errors = []; let passed = 0
  page.on('pageerror', error => errors.push(error.message))
  const stored = () => page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([key]) => key !== 'ml-atlas-locale').sort())))
  const cases = [['dataset-quality', 'missing-bad-duplicate', 'cleaning/four-policies.svg'], ['numerical-data', 'scale-and-outliers', 'scaling/fit-and-transform.svg']]
  for (const seeded of [false, true]) for (const locale of ['zh-CN', 'en']) for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/')
    await page.evaluate(seeded => {
      localStorage.clear()
      if (seeded) for (const key of ['ml-atlas:algorithm-progress:v1', 'ml-atlas:math-lab-progress:v1', 'ml-atlas:data-lab-progress:v1', 'ml-atlas:learning-progress:v2', 'ml-atlas:learning-progress:v2:migration', 'ml-atlas:checkpoint-report:data']) localStorage.setItem(key, '  {"history":"保留 / unchanged"}  ')
    }, seeded)
    const before = await stored()
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    for (const [module, section, filename] of cases) {
      await page.goto(base + '/data-lab/modules/' + module + '?route=core-learning-path#' + section)
      const image = page.locator(`img[src$="/diagrams/${filename}"]`)
      await image.waitFor({ state: 'attached' }); await image.evaluate(el => el.scrollIntoView({ block: 'center' })); await image.evaluate(el => el.decode())
      const size = await image.evaluate(el => ({ width: el.width, height: el.height, ratio: el.naturalWidth / el.naturalHeight }))
      const svg = await (await page.request.get(await image.evaluate(el => el.src))).text()
      const fontSize = Math.min(...[...svg.matchAll(/font-size="([\d.]+)"/g)].map(match => Number(match[1])))
      if (fontSize * size.width / 360 < 14 || Math.abs(size.ratio - size.width / size.height) > .02) throw new Error('Unreadable or cropped data figure')
      const figure = page.locator('.data-visual-figure').filter({ has: image })
      if (await figure.count() !== 1 || !(await figure.innerText()).includes(module === 'dataset-quality' ? '3.5' : '0.447214')) throw new Error('Missing native numeric explanation')
      if (!seeded) {
        await image.screenshot({ path: `/tmp/ml-atlas-data-${module}-image-${locale}-${width}.png` })
        await figure.locator('figcaption').screenshot({ path: `/tmp/ml-atlas-data-${module}-caption-${locale}-${width}.png` })
      }
      if (module === 'dataset-quality') {
        const lab = page.locator('.cleaning-pipeline-lab')
        const input = lab.locator('.data-table-comparison > article').first()
        const output = lab.locator('.data-table-comparison > article').nth(1)
        const read = target => target.locator('tbody tr').evaluateAll(rows => rows.map(row => [...row.querySelectorAll('td')].map(cell => cell.textContent.trim())))
        const initial = await read(output), untouched = await read(input)
        if (initial.length !== 5 || initial.find(row => row[0] === 'B-03')[2] !== '3.50' || initial.find(row => row[0] === 'C-04')[3] !== '1200') throw new Error('Cleaning disagrees with figure')
        for (const checkbox of await lab.getByRole('checkbox').all()) { await checkbox.focus(); await page.keyboard.press('Space') }
        if (JSON.stringify(await read(output)) !== JSON.stringify(untouched)) throw new Error('Disabling all actions did not restore input')
        await lab.getByRole('checkbox').first().focus(); await page.keyboard.press('Space')
        const filled = await read(output)
        if (filled.length !== 6 || filled.filter(row => row[0] === 'B-03').some(row => row[2] !== '3.50')) throw new Error('Median imputation removed rows or used the wrong value')
        await lab.getByRole('button', { name: locale === 'en' ? 'Reset' : '重置', exact: true }).focus(); await page.keyboard.press('Enter')
        if (JSON.stringify(await read(output)) !== JSON.stringify(initial) || await lab.locator('input:checked').count() !== 4) throw new Error('Cleaning reset failed')
        if (!(await lab.locator('pre').innerText()).includes("train_df['rooms'].median()")) throw new Error('Reference code lost training boundary')
        if (!seeded) await output.screenshot({ path: `/tmp/ml-atlas-cleaning-output-${locale}-${width}.png` })
      }
      if (await page.locator('.katex-error').count() || await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Data formula or page overflow')
      await page.reload(); await image.waitFor({ state: 'attached' })
      if (!page.url().includes('route=core-learning-path') || !page.url().endsWith('#' + section) || await stored() !== before) throw new Error('Data route or storage changed')
      if (module === 'numerical-data') {
        const revisit = page.locator('#scale-and-outliers a')
        await revisit.focus(); await page.keyboard.press('Enter')
        await page.waitForURL(url => url.pathname.includes('/data-lab/modules/dataset-quality') && url.hash === '#missing-bad-duplicate' && url.searchParams.get('route') === 'core-learning-path')
        await page.locator('.cleaning-pipeline-lab').waitFor()
        if (await stored() !== before) throw new Error('Revisit changed history')
      }
      passed++
    }
  }
  for (const [module, section, filename] of cases) {
    await page.route('**/diagrams/' + filename, route => route.abort())
    await page.goto(base + '/data-lab/modules/' + module + '#' + section)
    const title = module === 'dataset-quality' ? 'Four Problems, Four Inspectable Actions' : 'Scaling: Fit on Train, Reuse on Validation'
    const figure = page.locator('.data-visual-figure').filter({ has: page.getByText(title, { exact: true }) })
    await figure.scrollIntoViewIfNeeded(); await figure.getByRole('status').waitFor()
    if (!(await figure.innerText()).includes(module === 'dataset-quality' ? '3.5' : '0.447214')) throw new Error('Image failure hid explanation')
    passed++
  }
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed, keyboardReset: true, median: 3.5, imageFailureFallback: true, storage: 'byte-for-byte unchanged' }
}
