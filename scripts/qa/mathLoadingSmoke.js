async (page) => {
  page.setDefaultTimeout(15000)
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const errors = []
  const scripts = []
  const courseBodies = []
  page.on('pageerror', error => errors.push(error.message))
  const capture = response => {
    if (response.status() === 200 && /\/assets\/[^?]+\.js$/.test(response.url())) {
      scripts.push(response.body().then(body => ({ url: response.url(), bytes: body.length }), error => ({ url: response.url(), error: error.message })))
    }
    if (response.status() === 200 && /\/assets\/[^?]+\.json$/.test(response.url())) courseBodies.push(response.body().then(body => ({ url: response.url(), bytes: body.length }), error => ({ error: error.message })))
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
  const fetchedScripts = await Promise.all(scripts)
  if (!fetchedScripts.length || fetchedScripts.some(script => script.error)) throw new Error('Could not measure scripts: ' + JSON.stringify(fetchedScripts))
  if (fetchedScripts.some(script => script.bytes > 1000000)) throw new Error('Resource page fetched the full math registry: ' + JSON.stringify(fetchedScripts))
  if (courseBodies.length) throw new Error('Resource home fetched math course bodies')

  const visited = ['calculus-functions-rate-change', 'calculus-derivatives-local-change', 'beginner-probability-distributions', 'least-squares-fitting']
  for (const id of visited) {
    await page.goto(base + '/math-lab/modules/' + id)
    await page.locator('.math-article-section').first().waitFor()
    await page.waitForLoadState('networkidle')
    if (await page.locator('.katex-error').count()) throw new Error('Formula error: ' + id)
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Course overflows: ' + id)
    if (id === 'calculus-derivatives-local-change') {
      for (const anchor of ['derivatives-opening', 'derivatives-formal', 'derivatives-experiment']) {
        if (await page.locator('#' + anchor).count() !== 1) throw new Error('Nonunique section anchor: ' + anchor)
      }
    }
    if (id === 'beginner-probability-distributions') {
      for (const anchor of ['beginner-probability-story', 'beginner-probability-story--beginner-probability-sample-space']) {
        if (await page.locator('#' + anchor).count() !== 1) throw new Error('Nonunique visual anchor: ' + anchor)
      }
    }
    if (id === 'least-squares-fitting' && await page.locator('a[href$=".ipynb"]').count() === 0) throw new Error('Notebook companion missing')
  }
  const bodies = await Promise.all(courseBodies)
  if (bodies.some(body => body.error || body.bytes > 150000 || !visited.some(id => body.url.includes('/' + id + '-')))) throw new Error('Unexpected math payload: ' + JSON.stringify(bodies))
  if (new Set(bodies.map(body => body.url)).size !== visited.length) throw new Error('Single-course requests were not isolated')

  const retryPattern = '**/assets/calculus-functions-rate-change-*.json'
  await page.route(retryPattern, route => route.fulfill({ status: 503, body: 'Temporarily unavailable' }), { times: 1 })
  await page.goto(base + '/math-lab/modules/calculus-functions-rate-change')
  await page.locator('[data-testid="math-course-error"]').waitFor()
  await page.getByRole('button', { name: /Retry|重试/, exact: true }).focus()
  await page.keyboard.press('Enter')
  await page.locator('#mapping-intuition').waitFor()

  const next = page.locator('.math-article-nav__actions a').filter({ hasText: /Next chapter|下一章/ })
  const destination = await next.getAttribute('href')
  const nextId = destination.split('/').pop().split('?')[0]
  let release
  const gate = new Promise(resolve => { release = resolve })
  let finished
  const completed = new Promise(resolve => { finished = resolve })
  await page.route('**/assets/' + nextId + '-*.json', async route => {
    await gate
    await route.continue()
    finished()
  }, { times: 1 })
  await next.click()
  await page.locator('[data-testid="math-course-loading"]').waitFor()
  await page.goBack()
  await page.locator('#mapping-intuition').waitFor()
  release()
  await completed
  await page.waitForLoadState('networkidle')
  if (await page.locator('#mapping-intuition').count() !== 1 || await page.locator('#derivatives-intuition').count()) throw new Error('Late response replaced the current course')
  await page.goto(base + '/math-lab/modules/not-a-course')
  await page.waitForURL(base + '/math-lab')
  page.off('response', capture)
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed: 9, resourceHome: 'summaries only', largestHomeScriptBytes: Math.max(...fetchedScripts.map(script => script.bytes)), largestCourseBytes: Math.max(...bodies.map(body => body.bytes)), retryAndStaleRequests: 'passed' }
}
