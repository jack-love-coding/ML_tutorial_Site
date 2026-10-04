async (page) => {
  page.setDefaultTimeout(15000)
  page.setDefaultNavigationTimeout(20000)
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const routes = await (await page.request.get(base + '/routes.json')).json()
  for (let index = 0; index < routes.length; index += 20) {
    await Promise.all(routes.slice(index, index + 20).map(async path => {
      const response = await page.request.get(base + (path === '/' ? '/' : path + '/'))
      if (!response.ok() || !(await response.text()).includes('/ML_tutorial_Site/assets/')) throw new Error('Missing Pages entry: ' + path)
    }))
  }
  const requests = []
  const errors = []
  page.on('request', request => requests.push(request.url()))
  page.on('pageerror', error => errors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  for (const [language, width] of [['en', 1280], ['zh-CN', 390]]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(base + '/')
    await page.waitForLoadState('networkidle')
    await page.getByRole('button', { name: language === 'en' ? 'EN' : '中', exact: true }).click()
    if (requests.some(url => /plotly|three|\/display\//i.test(url))) throw new Error('Homepage loaded an unrelated heavy resource')
    await page.goto(base + '/spine#unit-2')
    await page.waitForLoadState('networkidle')
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Route overflow')
    await page.goto(base + '/python/notebook-workflow')
    await page.waitForLoadState('networkidle')
    if (!await page.locator('.python-syntax-bridge').count()) throw new Error('Python syntax bridge missing')
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) throw new Error('Python chapter overflow')
    requests.length = 0
  }
  await page.goto(base + '/learn/loss-functions/why-loss?route=core-learning-path')
  await page.waitForLoadState('networkidle')
  if (requests.some(url => /outputs\/(regression-loss-summary|bce-gradient-summary)\.json/.test(url))) throw new Error('Full loss summary fetched at runtime')
  const response = await page.request.get(base + '/loss-functions/display/why-loss.json')
  if (!response.ok() || (await response.body()).length >= 25000) throw new Error('Loss display budget exceeded')
  await page.route('**/loss-functions/display/*.json', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }))
  await page.reload()
  await page.waitForLoadState('networkidle')
  if (!await page.getByText(/本地运行结果暂时无法读取|Local run results are unavailable/).count()) throw new Error('Missing loss resource-failure explanation')
  await page.unroute('**/loss-functions/display/*.json')
  if (errors.length) throw new Error(errors.join('\n'))
  return { passed: 5, staticEntrypoints: routes.length, homepage: 'lightweight', lossDisplay: 'under 25 KB per chapter', failureFallback: 'visible' }
}
