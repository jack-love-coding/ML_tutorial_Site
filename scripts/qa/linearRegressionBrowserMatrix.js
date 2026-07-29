async (page) => {
  const origin = 'http://127.0.0.1:4173'
  const rootPath = '/learn/linear-regression'
  const chapterIds = [
    'fit-line',
    'multivariate',
    'residual-loss',
    'training-motion',
    'polynomial',
    'model-limits',
    'overfitting',
    'regularization',
  ]
  const routes = [
    { id: 'root', path: rootPath, expectedActive: 'fit-line' },
    ...chapterIds.map((id) => ({
      id,
      path: `${rootPath}/${id}`,
      expectedActive: id,
    })),
  ]
  const viewports = [
    { width: 1440, height: 1000, id: 'desktop' },
    { width: 390, height: 844, id: 'mobile-390' },
  ]
  const locales = ['zh-CN', 'en']
  const expectedCaseCount = 36
  const results = []
  const interactions = []
  const failureInjections = []
  let caseConsoleErrors = []
  let caseWarnings = []
  let caseRequests = []

  page.on('console', (message) => {
    if (message.type() === 'error') caseConsoleErrors.push(`console: ${message.text()}`)
    if (message.type() === 'warning') caseWarnings.push(message.text())
  })
  page.on('pageerror', (error) => {
    caseConsoleErrors.push(`pageerror: ${error.message}`)
  })
  page.on('request', (request) => {
    caseRequests.push(request.url())
  })

  await page.context().grantPermissions(
    ['clipboard-read', 'clipboard-write'],
    { origin },
  )
  await page.emulateMedia({ reducedMotion: 'reduce' })

  const setLocale = async (locale) => {
    await page.goto(`${origin}${rootPath}`)
    await page.evaluate((nextLocale) => {
      localStorage.setItem('ml-atlas-locale', nextLocale)
    }, locale)
  }

  const localAssetViolations = () =>
    caseRequests.filter((requestUrl) => {
      const isCourseAsset =
        requestUrl.includes('/notebooks/linear-regression/')
        || requestUrl.includes('/datasets/python-data-tools/')
      return isCourseAsset && !requestUrl.startsWith(`${origin}/`)
    })

  for (const locale of locales) {
    await setLocale(locale)

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)

      for (const route of routes) {
        caseConsoleErrors = []
        caseWarnings = []
        caseRequests = []

        const response = await page.goto(`${origin}${route.path}`)
        await page.waitForSelector(
          `[data-testid="linear-current-chapter"][data-section-id="${route.expectedActive}"]`,
        )
        await page.waitForLoadState('networkidle')
        await page.waitForFunction(
          (expectedActive) =>
            document
              .querySelector(
                `.linear-course-page__nav-item[href$="/${expectedActive}"]`,
              )
              ?.classList.contains('is-active') ?? false,
          route.expectedActive,
        )

        if (viewport.id === 'mobile-390') {
          const mobileToggle = page.locator('[data-testid="linear-mobile-toc"]')
          await mobileToggle.click()
          const expanded = await mobileToggle.getAttribute('aria-expanded')
          if (expanded !== 'true') {
            throw new Error(`Mobile table of contents did not open for ${locale}/${route.id}`)
          }
          await mobileToggle.click()
        }

        const probe = await page.evaluate(
          ({ chapterIds, expectedActive, origin }) => {
            const anchors = [...document.querySelectorAll('a[href]')]
            const deadFragments = anchors
              .map((anchor) => anchor.getAttribute('href'))
              .filter(Boolean)
              .filter((href) => {
                const parsed = new URL(href, location.href)
                return parsed.origin === location.origin
                  && Boolean(parsed.hash)
                  && !document.getElementById(parsed.hash.slice(1))
              })
            const emptyLinks = anchors
              .map((anchor) => anchor.getAttribute('href'))
              .filter((href) => !href || href === '#')
            const interactive = [
              ...document.querySelectorAll(
                '.algorithm-view button, .algorithm-view a, .algorithm-view input, .algorithm-view select',
              ),
            ].filter((element) => {
              const style = getComputedStyle(element)
              const rect = element.getBoundingClientRect()
              return style.display !== 'none'
                && style.visibility !== 'hidden'
                && rect.width > 1
                && rect.height > 1
            })
            const overlaps = []
            for (let leftIndex = 0; leftIndex < interactive.length; leftIndex += 1) {
              for (
                let rightIndex = leftIndex + 1;
                rightIndex < interactive.length;
                rightIndex += 1
              ) {
                const leftElement = interactive[leftIndex]
                const rightElement = interactive[rightIndex]
                if (
                  leftElement.contains(rightElement)
                  || rightElement.contains(leftElement)
                ) continue
                const left = leftElement.getBoundingClientRect()
                const right = rightElement.getBoundingClientRect()
                const overlapWidth =
                  Math.min(left.right, right.right) - Math.max(left.left, right.left)
                const overlapHeight =
                  Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top)
                if (overlapWidth > 2 && overlapHeight > 2) {
                  overlaps.push([
                    leftElement.textContent?.trim()
                      || leftElement.getAttribute('aria-label'),
                    rightElement.textContent?.trim()
                      || rightElement.getAttribute('aria-label'),
                  ])
                }
              }
            }
            const navIds = [
              ...document.querySelectorAll(
                '[data-testid="linear-course-sidebar"] .linear-course-page__nav-item',
              ),
            ].map((anchor) => anchor.getAttribute('href')?.split('/').at(-1))
            const downloadContainers = document.querySelectorAll(
              '[data-linear-regression-downloads]',
            )
            const downloadLinks = [
              ...document.querySelectorAll(
                '[data-linear-regression-downloads] a[download]',
              ),
            ].map((anchor) => anchor.href)
            const active = document.querySelector(
              '.linear-course-page__nav-item.is-active',
            )

            return {
              lang: document.documentElement.lang,
              activeOk:
                active?.getAttribute('href')?.endsWith(`/${expectedActive}`) ?? false,
              chapterOrderOk:
                JSON.stringify(navIds) === JSON.stringify(chapterIds),
              currentChapterCount: document.querySelectorAll(
                '[data-testid="linear-current-chapter"]',
              ).length,
              workbenchPresent: Boolean(
                document.querySelector('[data-testid="linear-course-lab"]'),
              ),
              resultsPresent: Boolean(
                document.querySelector('[data-testid="linear-course-results"]'),
              ),
              sidebarPresent: Boolean(
                document.querySelector('[data-testid="linear-course-sidebar"]'),
              ),
              pagerPresent: Boolean(
                document.querySelector('[data-testid="linear-course-pager"]'),
              ),
              codeCopyPresent: Boolean(
                document.querySelector('.math-code-lab__copy'),
              ),
              checkpointPresent: Boolean(
                document.querySelector('.algorithm-checkpoint'),
              ),
              downloadsOnce: downloadContainers.length === 1,
              downloadCount: downloadLinks.length,
              downloadLinksLocal: downloadLinks.every(
                (href) => new URL(href).origin === origin,
              ),
              fallbackLabelsPresent: /loading|ready|unavailable|built-in teaching fixture|正在读取|已就绪|无法读取|内置教学样例/i.test(
                document.body.textContent ?? '',
              ),
              nextStepPresent: Boolean(
                document.querySelector('.lesson-bridge-card')
                || document.querySelector(
                  '.linear-course-page__pager-link--next',
                ),
              ),
              reducedMotion:
                matchMedia('(prefers-reduced-motion: reduce)').matches,
              overflow:
                document.documentElement.scrollWidth > window.innerWidth + 1,
              scrollWidth: document.documentElement.scrollWidth,
              viewportWidth: window.innerWidth,
              deadFragments,
              emptyLinks,
              overlaps,
            }
          },
          {
            chapterIds,
            expectedActive: route.expectedActive,
            origin,
          },
        )

        results.push({
          locale,
          viewport: viewport.id,
          route: route.id,
          status: response?.status(),
          ...probe,
          localAssetViolations: localAssetViolations(),
          consoleErrors: [...caseConsoleErrors],
          warningCount: caseWarnings.length,
        })
      }

      caseConsoleErrors = []
      caseWarnings = []
      caseRequests = []

      await page.goto(`${origin}${rootPath}/fit-line`)
      await page.waitForLoadState('networkidle')
      const fitLab = page.locator('.linear-regression-lab')
      const rowBatchSelect = fitLab.locator('select').first()
      await rowBatchSelect.selectOption('batch')
      const rowBatchChanged = (await rowBatchSelect.inputValue()) === 'batch'
      await fitLab
        .locator('.linear-regression-lab__actions button')
        .last()
        .evaluate((button) => button.click())
      const rowBatchReset = (await rowBatchSelect.inputValue()) === 'row'

      await page.goto(`${origin}${rootPath}/training-motion`)
      await page.waitForLoadState('networkidle')
      const gdLab = page.locator('.linear-regression-lab')
      const gdRange = gdLab.locator('input[type="range"]')
      await gdRange.fill('128')
      const gdStepChanged = (await gdRange.inputValue()) === '128'
      await gdLab
        .locator('.linear-regression-lab__actions button')
        .last()
        .evaluate((button) => button.click())
      const gdResetWorked = (await gdRange.inputValue()) === '0'

      await page.goto(`${origin}${rootPath}/polynomial`)
      await page.waitForLoadState('networkidle')
      const methodSelect = page.locator('.linear-regression-lab select').nth(1)
      await methodSelect.selectOption('scikit-learn')
      const methodChanged = (await methodSelect.inputValue()) === 'scikit-learn'

      await page.goto(`${origin}${rootPath}/model-limits`)
      await page.waitForLoadState('networkidle')
      const coefficientSelect = page.locator('.linear-regression-lab select').nth(1)
      await coefficientSelect.selectOption('original-unit')
      const coefficientSpaceChanged =
        (await coefficientSelect.inputValue()) === 'original-unit'

      await page.goto(`${origin}${rootPath}/overfitting`)
      await page.waitForLoadState('networkidle')
      const diagnosticSelect = page.locator('.linear-regression-lab select').nth(1)
      await diagnosticSelect.selectOption('named-heldout-cases')
      const diagnosticChanged =
        (await diagnosticSelect.inputValue()) === 'named-heldout-cases'
      const namedCaseSelect = page.locator('.linear-regression-lab select').nth(2)
      await namedCaseSelect.selectOption('large-residual')
      const namedCaseChanged =
        (await namedCaseSelect.inputValue()) === 'large-residual'
      const namedCaseExpander = page.locator('.linear-results details').first()
      await namedCaseExpander
        .locator('summary')
        .evaluate((summary) => summary.click())
      const namedCaseExpanded = await namedCaseExpander.evaluate(
        (details) => details.open,
      )

      const copyButton = page.locator('.math-code-lab__copy').first()
      await copyButton.evaluate((button) => button.click())
      const codeCopyWorked = /copied|已复制/i.test(
        await copyButton.textContent(),
      )

      const firstCheckpoint = page.locator('.algorithm-checkpoint__item').first()
      await firstCheckpoint.locator('input[type="radio"]').first().check({ force: true })
      const checkpointSubmissionWorked =
        await firstCheckpoint
          .locator('.algorithm-checkpoint__feedback')
          .isVisible()

      await page.goto(`${origin}${rootPath}/regularization`)
      await page.waitForLoadState('networkidle')
      const regularizationText = await page.textContent('body')
      const nextStepPresent = Boolean(
        await page.locator('.lesson-bridge-card').count(),
      )
      const downloadCount = await page.locator(
        '[data-linear-regression-downloads] a[download]',
      ).count()

      const interactionResult = {
        locale,
        viewport: viewport.id,
        rowBatchChanged,
        rowBatchReset,
        gdStepChanged,
        gdResetWorked,
        methodChanged,
        coefficientSpaceChanged,
        diagnosticChanged,
        namedCaseChanged,
        namedCaseExpanded,
        codeCopyWorked,
        checkpointSubmissionWorked,
        downloadCount,
        nextStepPresent,
        linearBoundaryVisible:
          /linear model|线性模型|tabular regression|表格回归/i.test(
            regularizationText ?? '',
          ),
        consoleErrors: [...caseConsoleErrors],
        warningCount: caseWarnings.length,
        localAssetViolations: localAssetViolations(),
      }
      interactions.push(interactionResult)

      if (
        !interactionResult.rowBatchChanged
        || !interactionResult.rowBatchReset
        || !interactionResult.gdStepChanged
        || !interactionResult.gdResetWorked
        || !interactionResult.methodChanged
        || !interactionResult.coefficientSpaceChanged
        || !interactionResult.diagnosticChanged
        || !interactionResult.namedCaseChanged
        || !interactionResult.namedCaseExpanded
        || !interactionResult.codeCopyWorked
        || !interactionResult.checkpointSubmissionWorked
        || interactionResult.downloadCount !== 9
        || !interactionResult.nextStepPresent
        || !interactionResult.linearBoundaryVisible
        || interactionResult.consoleErrors.length > 0
        || interactionResult.warningCount > 0
        || interactionResult.localAssetViolations.length > 0
      ) {
        throw new Error(
          `Linear-regression interaction matrix failed: ${JSON.stringify(interactionResult)}`,
        )
      }

      for (const injection of [
        {
          id: 'summary-failure',
          status: 200,
          contentType: 'text/plain',
          body: 'unavailable',
        },
        {
          id: 'summary-corruption',
          status: 200,
          contentType: 'application/json',
          body: '{}',
        },
      ]) {
        await page.route(
          '**/notebooks/linear-regression/linear-regression-summary.json',
          async (route) => {
            await route.fulfill({
              status: injection.status,
              contentType: injection.contentType,
              body: injection.body,
            })
          },
        )
        caseConsoleErrors = []
        caseWarnings = []
        await page.goto(`${origin}${rootPath}/fit-line`)
        await page.waitForLoadState('networkidle')
        const fallbackVisible = await page
          .locator(
            '.linear-regression-lab [role="status"], .linear-results__fallback[role="status"]',
          )
          .filter({ hasText: /unavailable|invalid|无法读取|内置教学样例/i })
          .first()
          .isVisible()
        const fullDataMetricLeaked = /40142\.538619|135\.296640|0\.174252/.test(
          (await page.textContent('body')) ?? '',
        )
        const injectionResult = {
          id: injection.id,
          locale,
          viewport: viewport.id,
          fallbackVisible,
          fullDataMetricLeaked,
          consoleErrors: [...caseConsoleErrors],
          warningCount: caseWarnings.length,
        }
        failureInjections.push(injectionResult)
        await page.unroute(
          '**/notebooks/linear-regression/linear-regression-summary.json',
        )
        if (
          !injectionResult.fallbackVisible
          || injectionResult.fullDataMetricLeaked
          || injectionResult.consoleErrors.length > 0
          || injectionResult.warningCount > 0
        ) {
          throw new Error(
            `Linear-regression failure injection failed: ${JSON.stringify(injectionResult)}`,
          )
        }
      }
    }
  }

  const failures = results.filter(
    (result) =>
      result.status !== 200
      || result.lang !== result.locale
      || !result.activeOk
      || !result.chapterOrderOk
      || result.currentChapterCount !== 1
      || !result.workbenchPresent
      || !result.resultsPresent
      || !result.sidebarPresent
      || !result.pagerPresent
      || !result.codeCopyPresent
      || !result.checkpointPresent
      || !result.downloadsOnce
      || result.downloadCount !== 9
      || !result.downloadLinksLocal
      || !result.fallbackLabelsPresent
      || !result.nextStepPresent
      || !result.reducedMotion
      || result.overflow
      || result.deadFragments.length > 0
      || result.emptyLinks.length > 0
      || result.overlaps.length > 0
      || result.localAssetViolations.length > 0
      || result.consoleErrors.length > 0
      || result.warningCount > 0,
  )

  if (results.length !== expectedCaseCount || failures.length > 0) {
    throw new Error(
      `Linear-regression browser matrix failed: ${JSON.stringify({
        expectedCaseCount,
        actualCaseCount: results.length,
        failures,
      })}`,
    )
  }

  return {
    cases: results.length,
    failures: failures.length,
    viewports: viewports.map(({ id }) => id),
    locales,
    chapterIds,
    interactions,
    failureInjections,
    results,
  }
}
