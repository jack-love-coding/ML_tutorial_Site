async (page) => {
  // This evaluator is intentionally self-contained: playwright-cli loads it with
  // `run-code --filename`, so it cannot rely on a Node-side test helper.
  const origin = 'http://127.0.0.1:4173'
  const rootPath = '/learn/logistic-regression'
  const chapterIds = [
    'linear-score',
    'sigmoid-probability',
    'threshold-decisions',
    'log-loss',
    'regularization',
    'linear-limits',
  ]
  const keyIds = ['linear-score', 'threshold-decisions', 'log-loss', 'linear-limits']
  const releaseContract = {
    cases: [
      ...chapterIds.map((chapterId) => ({ chapterId, locale: 'zh-CN', width: 1200 })),
      ...keyIds.flatMap((chapterId) => ['zh-CN', 'en'].flatMap((locale) =>
        [1440, 768, 390].map((width) => ({ chapterId, locale, width })))),
    ],
    interactions: chapterIds,
    failureInjections: ['asset-http-failure', 'asset-corruption', 'mp4-failure', 'copy-failure'],
  }
  const caseKey = (entry) => `${entry.chapterId}/${entry.locale}/${entry.width}`
  const expectedCaseKeys = new Set(releaseContract.cases.map(caseKey))
  const results = []
  const interactions = []
  const failureInjections = []
  let requests = []
  let consoleErrors = []
  let warnings = []

  page.on('request', (request) => requests.push(request.url()))
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(`console: ${message.text()}`)
    if (message.type() === 'warning') warnings.push(message.text())
  })
  page.on('pageerror', (error) => consoleErrors.push(`pageerror: ${error.message}`))
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin })
  await page.emulateMedia({ reducedMotion: 'reduce' })

  const resetCapture = () => { requests = []; consoleErrors = []; warnings = [] }
  const localCourseRequests = () => requests.filter((url) =>
    url.includes('/logistic-regression/') || url.includes('/manim/logistic-regression/'))
  const requestViolations = () => localCourseRequests().filter((url) => !url.startsWith(`${origin}/`))
  const interactionRequests = () => requests.filter((url) => url.includes('/logistic-regression/phase-29/interactions/'))
  const hasReservedTestRequest = () => requests.some((url) => /frozen-predictions|test[-_]?labels|test[-_]?metrics/i.test(url))
  const text = async (locator) => (await locator.textContent()) ?? ''
  const setLocale = async (locale) => {
    await page.goto(`${origin}${rootPath}`)
    // The root redirect mounts the default lazy scene. Let that navigation settle
    // before beginning the next case's request capture.
    await page.waitForLoadState('networkidle')
    await page.evaluate((nextLocale) => localStorage.setItem('ml-atlas-locale', nextLocale), locale)
  }
  const navigate = async (chapterId, locale, width) => {
    await setLocale(locale)
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 })
    resetCapture()
    const response = await page.goto(`${origin}${rootPath}/${chapterId}`)
    await page.waitForSelector(`[data-testid="logistic-current-chapter"][data-section-id="${chapterId}"]`)
    await page.waitForSelector(`[data-testid="logistic-course-lab"][data-scene-id="${chapterId}"] .logistic-scene, [data-testid="logistic-course-lab"] [role="alert"]`)
    await page.waitForLoadState('networkidle')
    return response?.status() ?? 0
  }
  const probePage = async (chapterId, locale, width, responseStatus) => {
    if (width === 390) {
      const toc = page.locator('[data-testid="logistic-mobile-toc"]')
      await toc.click()
      const mobileTocWorks = (await toc.getAttribute('aria-expanded')) === 'true'
      await toc.click()
      if (!mobileTocWorks) throw new Error(`mobile TOC did not open for ${caseKey({ chapterId, locale, width })}`)
    }
    const probe = await page.evaluate(({ chapterIds, chapterId }) => {
      const anchors = [...document.querySelectorAll('a[href]')]
      const localAnchors = anchors.filter((anchor) => new URL(anchor.href, location.href).origin === location.origin)
      const deadFragments = localAnchors
        .map((anchor) => anchor.getAttribute('href'))
        .filter((href) => href?.includes('#'))
        .filter((href) => !document.getElementById(new URL(href, location.href).hash.slice(1)))
      const visibleInteractive = [...document.querySelectorAll('button, a, input, select, summary')]
        .filter((element) => {
          const style = getComputedStyle(element)
          const box = element.getBoundingClientRect()
          return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 1 && box.height > 1
        })
      const overlaps = []
      for (let i = 0; i < visibleInteractive.length; i += 1) {
        for (let j = i + 1; j < visibleInteractive.length; j += 1) {
          const left = visibleInteractive[i]
          const right = visibleInteractive[j]
          if (left.contains(right) || right.contains(left)) continue
          const a = left.getBoundingClientRect(); const b = right.getBoundingClientRect()
          const overlapWidth = Math.min(a.right, b.right) - Math.max(a.left, b.left)
          const overlapHeight = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
          if (overlapWidth > 2 && overlapHeight > 2) overlaps.push([left.textContent?.trim(), right.textContent?.trim()])
        }
      }
      const tocIds = [...document.querySelectorAll('[data-testid="logistic-course-sidebar"] a')]
        .map((anchor) => anchor.getAttribute('href')?.split('/').at(-1))
      const blocks = [...document.querySelectorAll('[data-testid="logistic-typed-lesson-flow"] > section')]
      const finalChapter = chapterId === 'linear-limits'
      return {
        lang: document.documentElement.lang,
        activeOk: document.querySelector(`.logistic-course-page__sidebar a[href$="/${chapterId}"].is-active`) !== null,
        chapterOrderOk: JSON.stringify(tocIds) === JSON.stringify(chapterIds),
        currentChapterCount: document.querySelectorAll('[data-testid="logistic-current-chapter"]').length,
        labCount: document.querySelectorAll('[data-testid="logistic-course-lab"]').length,
        pagerPresent: document.querySelector('[data-testid="logistic-course-pager"]') !== null,
        typedBlocksPresent: blocks.length >= 8 && blocks.every((block) => (block.textContent ?? '').trim().length > 20),
        labAfterPrediction: blocks.findIndex((block) => block.dataset.testid === 'logistic-course-lab') > 0,
        codeCopyPresent: document.querySelectorAll('.logistic-course-page__code button').length > 0,
        safeFormulaPresent: !/katex-error|\\\\\(|\\\\\[|\$\$/.test(document.body.textContent ?? ''),
        finalResources: document.querySelectorAll('[data-testid="logistic-course-resources"]').length,
        finalCheckpoint: document.querySelectorAll('.algorithm-checkpoint').length,
        phase30Link: [...document.querySelectorAll('a')].some((anchor) => anchor.getAttribute('href') === '/learn/classification'),
        finalChapter,
        overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
        deadFragments,
        emptyLinks: anchors.filter((anchor) => !anchor.getAttribute('href') || anchor.getAttribute('href') === '#').length,
        overlaps,
        learnerText: document.body.textContent ?? '',
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      }
    }, { chapterIds, chapterId })
    const expectedAsset = `/interactions/${chapterId}.json`
    const requestedAssets = interactionRequests()
    const lazyAssetsOk = requestedAssets.length === 1 && requestedAssets[0].includes(expectedAsset)
    const localRequestOk = requestViolations().length === 0 && !hasReservedTestRequest()
    return {
      chapterId, locale, width, responseStatus, ...probe,
      lazyAssetsOk, localRequestOk,
      requestedAssets,
      consoleErrors: [...consoleErrors], warningCount: warnings.length,
      reservedTestText: /test labels|test metrics|测试集标签|测试集指标|frozen-predictions/i.test(probe.learnerText),
    }
  }
  const waitScene = async (chapterId) => {
    const lab = page.locator(`[data-testid="logistic-course-lab"][data-scene-id="${chapterId}"]`)
    await lab.locator('.logistic-scene').waitFor()
    return lab.locator('.logistic-scene')
  }
  const sceneInteraction = async (chapterId) => {
    await navigate(chapterId, 'zh-CN', 1200)
    const scene = await waitScene(chapterId)
    const initial = await text(scene.locator('table'))
    let changed = false
    if (chapterId === 'linear-score') {
      const control = scene.locator('select'); await control.selectOption({ index: 1 }); changed = (await text(scene.locator('table'))) !== initial
    } else if (chapterId === 'sigmoid-probability') {
      const control = scene.locator('input[type="range"]'); await control.fill('2'); changed = (await text(scene.locator('table'))) !== initial
    } else if (chapterId === 'threshold-decisions') {
      await scene.locator('button').filter({ hasText: /单步|step/i }).click(); changed = (await text(scene.locator('table'))) !== initial
    } else if (chapterId === 'log-loss') {
      const control = scene.locator('select'); await control.selectOption({ index: 0 }); changed = (await text(scene.locator('table'))) !== initial
    } else if (chapterId === 'regularization') {
      await scene.locator('input[type="radio"]').nth(1).check(); changed = (await text(scene.locator('table'))) !== initial
    } else {
      const control = scene.locator('select'); await control.selectOption('softened'); changed = (await text(scene.locator('table'))) !== initial
    }
    await scene.focus(); await page.keyboard.press('ArrowRight'); await page.keyboard.press('r')
    await page.waitForTimeout(30)
    const reset = await text(scene.locator('table'))
    const resetWorked = reset === initial
    const semanticFallback = await scene.locator('table').count() === 1 && await scene.locator('svg[role="img"]').count() >= 1
    const result = { id: chapterId, changed, resetWorked, keyboard: true, semanticFallback, initial, reset }
    if (!changed || !resetWorked || !semanticFallback) throw new Error(`scene interaction failed: ${JSON.stringify(result)}`)
    interactions.push(result)
  }
  const inject = async (id, path, response, assertion) => {
    await page.route(path, async (route) => route.fulfill(response))
    try {
      const passed = await assertion()
      const record = { id, passed }
      failureInjections.push(record)
      if (!passed) throw new Error(`failure injection did not expose fallback: ${id}`)
    } finally {
      await page.unroute(path)
    }
  }

  for (const expected of releaseContract.cases) {
    const status = await navigate(expected.chapterId, expected.locale, expected.width)
    results.push(await probePage(expected.chapterId, expected.locale, expected.width, status))
  }
  for (const chapterId of chapterIds) await sceneInteraction(chapterId)

  await navigate('linear-score', 'zh-CN', 1200)
  const copyButton = page.locator('.logistic-course-page__code button').first()
  await copyButton.click()
  await page.waitForTimeout(80)
  const copied = /已复制|copied/i.test(await text(copyButton))
  if (!copied) throw new Error('code copy success feedback did not render')
  await inject('copy-failure', '**/copy-failure-never-networked', { status: 500 }, async () => {
    await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('blocked')) } }))
    await copyButton.click()
    await page.waitForTimeout(80)
    return /无法写入剪贴板|Clipboard copy failed/i.test(await text(page.locator('.logistic-course-page__copy-status')))
  })

  await inject('asset-http-failure', '**/logistic-regression/phase-29/interactions/linear-score.json', { status: 503, contentType: 'application/json', body: '{}' }, async () => {
    await navigate('linear-score', 'zh-CN', 1200)
    return page.locator('.logistic-lesson-lab [role="alert"]').isVisible()
  })
  await inject('asset-corruption', '**/logistic-regression/phase-29/interactions/sigmoid-probability.json', { status: 200, contentType: 'application/json', body: '{"corrupted":true}' }, async () => {
    await navigate('sigmoid-probability', 'en', 1200)
    return page.locator('.logistic-lesson-lab [role="alert"]').isVisible()
  })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await inject('mp4-failure', '**/manim/logistic-regression/linear-score-to-sigmoid.mp4', { status: 503, contentType: 'video/mp4', body: '' }, async () => {
    await navigate('linear-score', 'en', 1200)
    await page.locator('.chaptered-media-player [role="status"]').waitFor({ timeout: 10_000 })
    const player = page.locator('.chaptered-media-player')
    const posterFallback = (await player.locator('img').count()) === 1
    const transcriptFallback = (await player.locator('.chaptered-media-player__transcript').count()) === 1
    return posterFallback && transcriptFallback && /video is unavailable|视频暂时不可用/i.test(await text(player))
  })
  await page.emulateMedia({ reducedMotion: 'reduce' })

  const failures = results.filter((record) =>
    record.responseStatus !== 200 || record.lang !== record.locale || !record.activeOk || !record.chapterOrderOk
    || record.currentChapterCount !== 1 || record.labCount !== 1 || !record.pagerPresent || !record.typedBlocksPresent
    || !record.labAfterPrediction || !record.codeCopyPresent || !record.safeFormulaPresent || record.overflow
    || record.deadFragments.length > 0 || record.emptyLinks > 0 || record.overlaps.length > 0 || !record.lazyAssetsOk
    || !record.localRequestOk || record.reservedTestText || !record.reducedMotion || record.consoleErrors.length > 0 || record.warningCount > 0
    || (record.finalChapter && (record.finalResources !== 1 || record.finalCheckpoint !== 1 || !record.phase30Link))
    || (!record.finalChapter && (record.finalResources !== 0 || record.finalCheckpoint !== 0)),
  )
  const resultKeys = results.map(caseKey)
  const exactCases = results.length === releaseContract.cases.length && new Set(resultKeys).size === results.length && resultKeys.every((key) => expectedCaseKeys.has(key))
  const exactInteractions = interactions.length === releaseContract.interactions.length && new Set(interactions.map((item) => item.id)).size === interactions.length && releaseContract.interactions.every((id) => interactions.some((item) => item.id === id))
  const exactFailures = failureInjections.length === releaseContract.failureInjections.length && new Set(failureInjections.map((item) => item.id)).size === failureInjections.length && releaseContract.failureInjections.every((id) => failureInjections.some((item) => item.id === id && item.passed))
  if (!exactCases || !exactInteractions || !exactFailures || failures.length > 0) throw new Error(`Logistic release matrix failed: ${JSON.stringify({ exactCases, exactInteractions, exactFailures, failures })}`)
  return { cases: results.length, failures: failures.length, results, interactions, failureInjections, contract: releaseContract }
}
