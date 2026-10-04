async (page) => {
  page.setDefaultTimeout(15000)
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const errors = []
  const scripts = []
  page.on('pageerror', error => errors.push(error.message))
  const capture = response => {
    if (response.status() === 200 && /\/assets\/[^?]+\.js$/.test(response.url())) {
      scripts.push(response.body().then(body => ({ url: response.url(), bytes: body.length }), error => ({ url: response.url(), error: error.message })))
    }
  }
  page.on('response', capture)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const [locale, width] of [['zh-CN', 1280], ['en', 390]]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/math-lab')
    await page.locator('.math-path-node').first().waitFor()
    await page.getByRole('button', { name: locale === 'en' ? 'EN' : '中', exact: true }).click()
    await page.waitForLoadState('networkidle')
    if (await page.locator('.math-path-node').count() !== 31) throw new Error('Math path cards changed')
    if (await page.locator('.learning-route-dashboard').count() !== 6) throw new Error('Math reference routes changed')
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Math resource page overflows')
  }
  page.off('response', capture)
  const fetchedScripts = await Promise.all(scripts)
  if (!fetchedScripts.length || fetchedScripts.some(script => script.error)) throw new Error('Could not measure scripts: ' + JSON.stringify(fetchedScripts))
  if (fetchedScripts.some(script => script.bytes > 1000000)) throw new Error('Resource page fetched the full math registry: ' + JSON.stringify(fetchedScripts))
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed: 2, resourceHome: 'summaries only', largestScriptBytes: Math.max(...fetchedScripts.map(script => script.bytes)) }
}
