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
  page.on('console', (message) => {
    if (message.type() === 'error') activeErrors.push(`console: ${message.text()}`)
  })
  page.on('pageerror', (error) => activeErrors.push(`pageerror: ${error.message}`))

  for (const locale of ['zh-CN', 'en']) {
    await page.evaluate((value) => localStorage.setItem('ml-atlas-locale', value), locale)
    for (const [width, height] of [[1440, 1000], [390, 844]]) {
      await page.setViewportSize({ width, height })
      for (let index = 0; index < modules.length; index += 1) {
        activeErrors = []
        const [id, zhTitle, enTitle] = modules[index]
        const response = await page.goto(`${origin}/math-lab/modules/${id}?route=${route}`)
        await page.waitForLoadState('networkidle')
        const probe = await page.evaluate(async ({ index, count, expectedTitle, route }) => {
          const routeLinks = [...document.querySelectorAll(`a[href*="?route=${route}"]`)]
            .map((anchor) => anchor.getAttribute('href'))
            .filter(Boolean)
          const expectedRouteLinkCount = index === 0 || index === count - 1 ? 1 : 2
          const anchors = [...document.querySelectorAll('a[href]')]
          const deadFragments = anchors
            .map((anchor) => anchor.getAttribute('href'))
            .filter((href) => href?.startsWith('#') && !document.getElementById(href.slice(1)))
          const emptyLinks = anchors
            .map((anchor) => anchor.getAttribute('href'))
            .filter((href) => !href || href === '#')
          const routeResponses = await Promise.all(routeLinks.map(async (href) => {
            const result = await fetch(new URL(href, location.href), { method: 'HEAD' })
            return { href, ok: result.ok, status: result.status }
          }))
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
            routeLinksOk: routeLinks.length === expectedRouteLinkCount && routeResponses.every(({ ok }) => ok),
            routeResponses,
            scrollWidth: document.documentElement.scrollWidth,
            viewportWidth: innerWidth,
            overflow: document.documentElement.scrollWidth > innerWidth,
            deadFragments,
            emptyLinks,
            overlaps,
          }
        }, { index, count: modules.length, expectedTitle: locale === 'zh-CN' ? zhTitle : enTitle, route })
        results.push({
          id,
          locale,
          viewport: `${width}x${height}`,
          status: response?.status(),
          ...probe,
          consoleErrors: [...activeErrors],
        })
      }
    }
  }
  const failures = results.filter((result) => (
    result.status !== 200
    || result.lang !== result.locale
    || !result.titleOk
    || !result.routeLinksOk
    || result.overflow
    || result.deadFragments.length > 0
    || result.emptyLinks.length > 0
    || result.overlaps.length > 0
    || result.consoleErrors.length > 0
  ))
  if (failures.length > 0) throw new Error(`Math-to-Code browser matrix failed: ${JSON.stringify(failures)}`)
  return { cases: results.length, failures: failures.length, results }
}
