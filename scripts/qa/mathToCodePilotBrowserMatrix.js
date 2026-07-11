async (page) => {
  const origin = 'http://127.0.0.1:4173'
  const route = 'math-to-code-pilot'
  const modules = [
    ['calculus-functions-rate-change', '函数与映射：输入怎样变成预测', 'Functions and Mappings: How Inputs Become Predictions'],
    ['linear-algebra-feature-space', '向量与样本表示：一次预测如何读懂多个特征', 'Vectors and Sample Representation: Reading Multiple Features in One Prediction'],
    ['linear-algebra-matrix-transformations', '矩阵与批量计算：从一个样本到一批预测', 'Matrices and Batch Computation: From One Sample to Many Predictions'],
    ['calculus-derivatives-local-change', '导数与误差敏感度：当前参数附近怎样变化', 'Derivatives and Error Sensitivity: Change Near the Current Parameters'],
    ['numpy-mathematics-implementation', 'NumPy 数学实现：让公式、shape 与失败一致', 'NumPy Mathematics Implementation: Align Formulas, Shapes, and Failures'],
    ['math-to-code-guided-studio', '引导式实践：从数学到可复现代码', 'Guided Studio: From Mathematics to Reproducible Code'],
  ]
  const results = []
  let activeErrors = []
  let activeWarnings = []
  page.on('console', (message) => {
    if (message.type() === 'error') activeErrors.push(`console: ${message.text()}`)
    if (message.type() === 'warning') activeWarnings.push(message.text())
  })
  page.on('pageerror', (error) => activeErrors.push(`pageerror: ${error.message}`))

  await page.evaluate(({ moduleIds }) => {
    localStorage.setItem('ml-atlas:math-lab-progress:v1', JSON.stringify({
      completedModuleIds: moduleIds,
      quizAttempts: [],
      weakConceptTags: [],
      mastery: [],
      updatedAt: '2026-07-11T00:00:00.000Z',
    }))
  }, { moduleIds: modules.map(([id]) => id) })

  for (const locale of ['zh-CN', 'en']) {
    await page.evaluate((value) => localStorage.setItem('ml-atlas-locale', value), locale)
    for (const [width, height] of [[1440, 1000], [390, 844]]) {
      await page.setViewportSize({ width, height })
      activeErrors = []
      activeWarnings = []
      const homeResponse = await page.goto(`${origin}/math-lab`)
      await page.waitForLoadState('networkidle')
      const homeProbe = await page.evaluate(({ expectedRouteTitle, expectedIds, route }) => {
        const dashboard = [...document.querySelectorAll('.learning-route-dashboard')]
          .find((section) => section.querySelector('h2')?.textContent?.trim() === expectedRouteTitle)
        const dashboardOrders = dashboard
          ? [...dashboard.querySelectorAll('ol > li a > span')].map((span) => Number(span.textContent?.trim()))
          : []
        const dashboardHrefs = dashboard
          ? [...dashboard.querySelectorAll('ol > li a')].map((anchor) => anchor.getAttribute('href'))
          : []
        const expectedHrefs = expectedIds.map((id) => `/math-lab/modules/${id}?route=${route}`)
        return {
          lang: document.documentElement.lang,
          titleOk: Boolean(document.querySelector('h1')),
          dashboardOrders,
          dashboardOrderOk: JSON.stringify(dashboardOrders) === JSON.stringify([1, 2, 3, 4, 5, 6]),
          dashboardHrefs,
          dashboardHrefsOk: JSON.stringify(dashboardHrefs) === JSON.stringify(expectedHrefs),
          routeProgressOk: /0\s*\/\s*6/.test(dashboard?.querySelector('header strong')?.textContent ?? ''),
          routeLinksOk: true,
          chapterOrderOk: true,
          overflow: document.documentElement.scrollWidth > innerWidth,
          deadFragments: [],
          emptyLinks: [],
          overlaps: [],
        }
      }, {
        expectedRouteTitle: locale === 'zh-CN' ? '数学到代码试学路线' : 'Math-to-Code Pilot Route',
        expectedIds: modules.map(([id]) => id),
        route,
      })
      results.push({
        kind: 'dashboard',
        id: 'math-lab-home',
        locale,
        viewport: `${width}x${height}`,
        status: homeResponse?.status(),
        ...homeProbe,
        consoleErrors: [...activeErrors],
        consoleWarnings: [...activeWarnings],
        warningCount: activeWarnings.length,
      })

      for (let index = 0; index < modules.length; index += 1) {
        activeErrors = []
        activeWarnings = []
        const [id, zhTitle, enTitle] = modules[index]
        const response = await page.goto(`${origin}/math-lab/modules/${id}?route=${route}`)
        await page.waitForLoadState('networkidle')
        const expectedRouteHrefs = [
          index > 0 ? `/math-lab/modules/${modules[index - 1][0]}?route=${route}` : undefined,
          index < modules.length - 1 ? `/math-lab/modules/${modules[index + 1][0]}?route=${route}` : undefined,
        ].filter(Boolean)
        const probe = await page.evaluate(({ index, expectedTitle, route, expectedRouteHrefs }) => {
          const routeLinks = [...document.querySelectorAll(`a[href*="?route=${route}"]`)]
            .map((anchor) => anchor.getAttribute('href'))
            .filter(Boolean)
          const anchors = [...document.querySelectorAll('a[href]')]
          const deadFragments = anchors
            .map((anchor) => anchor.getAttribute('href'))
            .filter((href) => href?.startsWith('#') && !document.getElementById(href.slice(1)))
          const emptyLinks = anchors
            .map((anchor) => anchor.getAttribute('href'))
            .filter((href) => !href || href === '#')
          const interactive = [...document.querySelectorAll('button,a,input')]
            .filter((element) => {
              const rect = element.getBoundingClientRect()
              return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight
            })
          const overlaps = []
          for (let leftIndex = 0; leftIndex < interactive.length; leftIndex += 1) {
            for (let rightIndex = leftIndex + 1; rightIndex < interactive.length; rightIndex += 1) {
              const left = interactive[leftIndex].getBoundingClientRect()
              const right = interactive[rightIndex].getBoundingClientRect()
              if (left.left < right.right && left.right > right.left && left.top < right.bottom && left.bottom > right.top) {
                overlaps.push([
                  interactive[leftIndex].textContent?.trim() || interactive[leftIndex].getAttribute('aria-label'),
                  interactive[rightIndex].textContent?.trim() || interactive[rightIndex].getAttribute('aria-label'),
                ])
              }
            }
          }
          return {
            lang: document.documentElement.lang,
            title: document.querySelector('h1')?.textContent?.trim(),
            titleOk: document.querySelector('h1')?.textContent?.trim() === expectedTitle,
            routeLinks,
            expectedRouteHrefs,
            routeLinksOk: JSON.stringify(routeLinks) === JSON.stringify(expectedRouteHrefs),
            chapterOrderOk: new RegExp(`(?:第\\s*${index + 1}\\s*章|Chapter\\s*${index + 1})`).test(
              document.querySelector('.math-lab-module-hero .eyebrow')?.textContent ?? '',
            ),
            scrollWidth: document.documentElement.scrollWidth,
            viewportWidth: innerWidth,
            overflow: document.documentElement.scrollWidth > innerWidth,
            deadFragments,
            emptyLinks,
            overlaps,
          }
        }, { index, expectedTitle: locale === 'zh-CN' ? zhTitle : enTitle, route, expectedRouteHrefs })
        results.push({
          kind: 'module',
          id,
          locale,
          viewport: `${width}x${height}`,
          status: response?.status(),
          ...probe,
          consoleErrors: [...activeErrors],
          consoleWarnings: [...activeWarnings],
          warningCount: activeWarnings.length,
        })
      }
    }
  }
  const failures = results.filter((result) => (
    result.status !== 200
    || result.lang !== result.locale
    || !result.titleOk
    || !result.routeLinksOk
    || !result.chapterOrderOk
    || result.dashboardOrderOk === false
    || result.dashboardHrefsOk === false
    || result.routeProgressOk === false
    || result.overflow
    || result.deadFragments.length > 0
    || result.emptyLinks.length > 0
    || result.overlaps.length > 0
    || result.consoleErrors.length > 0
    || result.warningCount > 0
  ))
  if (failures.length > 0) throw new Error(`Math-to-Code browser matrix failed: ${JSON.stringify(failures)}`)

  await page.goto(`${origin}/math-lab/modules/linear-algebra-matrix-transformations?route=${route}`)
  await page.waitForLoadState('networkidle')
  await page.waitForSelector('.matrix-transform-lab')
  const matrixStorageKeysBefore = await page.evaluate(() => Object.keys(localStorage).sort())
  const matrixAContract = await page.locator('.matrix-transform-lab').evaluate((lab) => {
    const text = lab.textContent ?? ''
    return /A e1/.test(text)
      && /A e2/.test(text)
      && /det\(A\)/.test(text)
      && /A x/.test(text)
      && /geometric transform A/i.test(text)
      && !/W e1|W e2|det\(W\)|y\s*=\s*Wx\s*\+\s*b/.test(text)
  })
  await page.locator('.matrix-transform-lab input[type="number"]').first().fill('2')
  const matrixStorageKeysAfter = await page.evaluate(() => Object.keys(localStorage).sort())
  const matrixLocalOnly = JSON.stringify(matrixStorageKeysBefore) === JSON.stringify(matrixStorageKeysAfter)

  await page.evaluate(({ route, version, moduleIds }) => {
    localStorage.setItem('ml-atlas:math-lab-progress:v1', JSON.stringify({
      completedModuleIds: moduleIds,
      routeCompletions: {
        [route]: { version, completedModuleIds: moduleIds.slice(0, 5) },
      },
      quizAttempts: [],
      weakConceptTags: [],
      mastery: [],
      updatedAt: '2026-07-11T00:00:00.000Z',
    }))
  }, { route, version: 'math-to-code-v1', moduleIds: modules.map(([id]) => id) })
  await page.goto(`${origin}/math-lab/modules/math-to-code-guided-studio?route=${route}`)
  await page.waitForLoadState('networkidle')
  await page.locator('.self-paced-completion button').click()
  const routeCompletedModuleIds = await page.evaluate((route) => {
    const progress = JSON.parse(localStorage.getItem('ml-atlas:math-lab-progress:v1') ?? '{}')
    return progress.routeCompletions?.[route]?.completedModuleIds ?? []
  }, route)
  await page.goto(`${origin}/math-lab`)
  await page.waitForLoadState('networkidle')
  const versionedCompletion = await page.evaluate((expectedTitle) => {
    const dashboard = [...document.querySelectorAll('.learning-route-dashboard')]
      .find((section) => section.querySelector('h2')?.textContent?.trim() === expectedTitle)
    return /6\s*\/\s*6/.test(dashboard?.querySelector('header strong')?.textContent ?? '')
  }, 'Math-to-Code Pilot Route')
  const versionedIdsOk = JSON.stringify(routeCompletedModuleIds) === JSON.stringify(modules.map(([id]) => id))

  if (!matrixAContract || !matrixLocalOnly || !versionedCompletion || !versionedIdsOk) {
    throw new Error(`Math-to-Code interactions failed: ${JSON.stringify({
      matrixAContract,
      matrixLocalOnly,
      versionedCompletion,
      routeCompletedModuleIds,
    })}`)
  }

  return {
    cases: results.length,
    failures: failures.length,
    interactions: { matrixAContract, matrixLocalOnly, versionedCompletion, routeCompletedModuleIds },
    results,
  }
}
