async (page) => {
  const origin = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const rootPath = '/learn/classification'
  const cases = ['zh-CN', 'en'].flatMap((locale) => [1440, 768, 390].map((width) => ({ locale, width })))
  const results = []
  const consoleErrors = []
  const warnings = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
    if (message.type() === 'warning') warnings.push(message.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(error.message))
  await page.emulateMedia({ reducedMotion: 'reduce' })

  const setLocale = async (locale) => {
    await page.goto(`${origin}${rootPath}`)
    await page.evaluate((nextLocale) => localStorage.setItem('ml-atlas-locale', nextLocale), locale)
  }
  const navigate = async (locale, width) => {
    await setLocale(locale)
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 })
    consoleErrors.length = 0
    warnings.length = 0
    const response = await page.goto(`${origin}${rootPath}/scores`)
    await page.locator('.classification-panel--errors').first().waitFor()
    await page.waitForLoadState('networkidle')
    return response?.status() ?? 0
  }

  for (const entry of cases) {
    const status = await navigate(entry.locale, entry.width)
    const probe = await page.evaluate(() => {
      const body = document.body.textContent ?? ''
      const links = [...document.querySelectorAll('a[href]')]
      const notebook = links.find((anchor) => /classification-decisions\.(zh-CN|en)\.ipynb$/.test(anchor.getAttribute('href') ?? ''))
      return {
        lang: document.documentElement.lang,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        decisionColumns: [...document.querySelectorAll('.classification-decision-table article:first-child span')].slice(0, 6).map((item) => item.textContent?.trim()),
        fixedEvidence: /Validation|validation/.test(body) && /0\.01[–-]0\.5/.test(body),
        lockedTest: /TP 91 · FP 4 · TN 110 · FN 1/.test(body),
        noReselection: /不用于回头重选|cannot trigger threshold reselection/i.test(body),
        rocPolicy: /AUC 衡量跨阈值排序，不选择操作阈值|AUC measures ranking across thresholds/i.test(body),
        subgroupLimitation: /不是人口属性|not demographic attributes/i.test(body),
        namedErrors: document.querySelectorAll('.classification-error-list article').length >= 3,
        notebookBaseSafe: notebook?.getAttribute('href')?.startsWith('/ML_tutorial_Site/classification/phase-30/notebooks/') ?? false,
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
        testRowDisclosure: /test\s+(row|sample)\s+#\d+|测试样本\s*#\d+/i.test(body),
      }
    })
    const record = { ...entry, status, ...probe, consoleErrors: [...consoleErrors], warnings: [...warnings] }
    const passed = record.status === 200 && record.lang === entry.locale && !record.overflow
      && record.decisionColumns.length === 6 && record.fixedEvidence && record.lockedTest && record.noReselection
      && record.rocPolicy && record.subgroupLimitation && record.namedErrors && record.notebookBaseSafe
      && record.reducedMotion && !record.testRowDisclosure && record.consoleErrors.length === 0
    if (!passed) throw new Error(`Classification browser case failed: ${JSON.stringify(record)}`)
    results.push(record)
  }

  await navigate('zh-CN', 1200)
  const firstLab = page.locator('.classification-lab').first()
  const threshold = firstLab.locator('input[type="range"]').first()
  const initialMatrix = await firstLab.locator('.classification-confusion-grid').textContent()
  const lockedTest = await firstLab.locator('.classification-panel--cost').textContent()
  await threshold.focus()
  await page.keyboard.press('ArrowRight')
  await page.waitForTimeout(80)
  const changedMatrix = await firstLab.locator('.classification-confusion-grid').textContent()
  const lockedAfter = await firstLab.locator('.classification-panel--cost').textContent()
  if (initialMatrix === changedMatrix || lockedTest !== lockedAfter) throw new Error('Threshold interaction changed no validation evidence or mutated locked test evidence.')

  await page.route('**/classification/phase-30/manifest.json', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }))
  await page.goto(`${origin}${rootPath}/scores`)
  await page.locator('.classification-data-status--error').first().waitFor()
  const fallback = await page.locator('.classification-data-status--error').first().textContent()
  await page.unroute('**/classification/phase-30/manifest.json')
  if (!/本地数据包暂时不可用|local data package is temporarily unavailable/i.test(fallback ?? '')) throw new Error('Classification asset fallback did not render.')

  return { cases: results.length, failures: 0, interaction: true, fallback: true, results }
}
