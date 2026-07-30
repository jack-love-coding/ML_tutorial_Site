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
  const expectedInteractionCount = 4
  const expectedFailureInjectionCount = 8
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

  const waitForWorkbenchReady = async () => {
    await page.waitForFunction(() => {
      const control = document.querySelector('.linear-regression-lab select')
      return control instanceof HTMLSelectElement && !control.disabled
    })
  }

  const readSemanticOutput = async (hook) =>
    page.locator(`[data-testid="${hook}"]`).textContent()

  const containsAll = (text, expectedValues) =>
    expectedValues.every((value) => text.includes(String(value)))

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
      await waitForWorkbenchReady()
      const fitLab = page.locator('.linear-regression-lab')
      const rowBatchSelect = fitLab.locator('select').first()
      const rowText = await readSemanticOutput('linear-output-row-batch')
      await rowBatchSelect.selectOption('batch')
      const rowBatchChanged = (await rowBatchSelect.inputValue()) === 'batch'
      const batchText = await readSemanticOutput('linear-output-row-batch')
      await fitLab
        .locator('.linear-regression-lab__actions button')
        .last()
        .evaluate((button) => button.click())
      const rowBatchReset = (await rowBatchSelect.inputValue()) === 'row'
      const resetRowText = await readSemanticOutput('linear-output-row-batch')
      const rowBatchSemantic =
        containsAll(rowText, [11550, 173.9942431182681, 174, -0.0057568817319122445])
        && rowText !== batchText
        && containsAll(batchText, [13903, 3476, 40142.538618835824])
        && resetRowText === rowText

      await page.goto(`${origin}${rootPath}/training-motion`)
      await page.waitForLoadState('networkidle')
      await waitForWorkbenchReady()
      const gdLab = page.locator('.linear-regression-lab')
      const gdRange = gdLab.locator('input[type="range"]')
      const gdStartText = await readSemanticOutput('linear-output-gd-trace')
      await gdRange.fill('772')
      const gdStepChanged = (await gdRange.inputValue()) === '772'
      const gdEndText = await readSemanticOutput('linear-output-gd-trace')
      await gdLab
        .locator('.linear-regression-lab__actions button')
        .last()
        .evaluate((button) => button.click())
      const gdResetWorked = (await gdRange.inputValue()) === '0'
      const gdResetText = await readSemanticOutput('linear-output-gd-trace')
      const gdTraceSemantic =
        containsAll(gdStartText, [0, 58370.9353376969, 482.1558909149629])
        && gdStartText !== gdEndText
        && containsAll(gdEndText, [
          772,
          18105.236540017046,
          9.964423234025087e-9,
          173.01032847247703,
          62.72389095222884,
        ])
        && gdResetText === gdStartText

      await page.goto(`${origin}${rootPath}/polynomial`)
      await page.waitForLoadState('networkidle')
      await waitForWorkbenchReady()
      const methodSelect = page.locator('.linear-regression-lab select').nth(1)
      const methodTexts = {}
      for (const method of [
        'gradient-descent',
        'normal-equation',
        'scikit-learn',
      ]) {
        await methodSelect.selectOption(method)
        methodTexts[method] = await readSemanticOutput('linear-output-method')
      }
      const methodChanged = (await methodSelect.inputValue()) === 'scikit-learn'
      const methodSemantic =
        new Set(Object.values(methodTexts)).size === 3
        && containsAll(methodTexts['gradient-descent'], [
          'numpy-batch-gradient-descent',
          772,
          9.964423234025087e-9,
        ])
        && containsAll(methodTexts['normal-equation'], [
          'numpy-lstsq',
          173.01032849472756,
          0,
        ])
        && containsAll(methodTexts['scikit-learn'], [
          'sklearn-linear-regression',
          173.01032849472747,
          4.902744876744691e-13,
        ])

      await page.goto(`${origin}${rootPath}/model-limits`)
      await page.waitForLoadState('networkidle')
      await waitForWorkbenchReady()
      const coefficientSelect = page.locator('.linear-regression-lab select').nth(1)
      await coefficientSelect.selectOption('model-space')
      const modelSpaceText = await readSemanticOutput(
        'linear-output-coefficient-space',
      )
      await coefficientSelect.selectOption('original-unit')
      const coefficientSpaceChanged =
        (await coefficientSelect.inputValue()) === 'original-unit'
      const originalUnitText = await readSemanticOutput(
        'linear-output-coefficient-space',
      )
      const coefficientSpaceSemantic =
        modelSpaceText !== originalUnitText
        && containsAll(modelSpaceText, [
          173.01032849472756,
          62.72389095302256,
          -37.11641560210167,
        ])
        && containsAll(originalUnitText, [
          50.024112570538804,
          317.2535485260497,
          -187.27958330364518,
        ])

      await page.goto(`${origin}${rootPath}/overfitting`)
      await page.waitForLoadState('networkidle')
      await waitForWorkbenchReady()
      const diagnosticSelect = page.locator('.linear-regression-lab select').nth(1)
      await diagnosticSelect.selectOption('named-heldout-cases')
      const diagnosticChanged =
        (await diagnosticSelect.inputValue()) === 'named-heldout-cases'
      const namedCaseSelect = page.locator('.linear-regression-lab select').nth(2)
      const namedCaseTexts = {}
      for (const namedCase of [
        'negative-prediction',
        'morning-peak-underprediction',
        'evening-peak-underprediction',
        'large-residual',
      ]) {
        await namedCaseSelect.selectOption(namedCase)
        namedCaseTexts[namedCase] = await readSemanticOutput(
          'linear-output-heldout-case',
        )
      }
      const namedCaseChanged =
        (await namedCaseSelect.inputValue()) === 'large-residual'
      const heldoutCaseSemantic =
        new Set(Object.values(namedCaseTexts)).size === 4
        && containsAll(namedCaseTexts['negative-prediction'], [
          17213,
          13,
          -47.41549314522561,
          -60.41549314522561,
        ])
        && containsAll(namedCaseTexts['morning-peak-underprediction'], [
          15628,
          834,
          101.88209657050064,
          -732.1179034294994,
        ])
        && containsAll(namedCaseTexts['evening-peak-underprediction'], [
          14965,
          976,
          281.0929017808493,
          -694.9070982191507,
        ])
        && containsAll(namedCaseTexts['large-residual'], [
          15604,
          817,
          92.41434915378804,
          -724.5856508462119,
        ])
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
      await waitForWorkbenchReady()
      const regularizationDiagnostic = page
        .locator('.linear-regression-lab select')
        .nth(1)
      await regularizationDiagnostic.selectOption('coefficient-stability')
      const atempOffText = await readSemanticOutput(
        'linear-output-atemp-comparison',
      )
      const atempToggle = page.locator(
        '.linear-regression-lab .toggle-strip__button',
      )
      await atempToggle.click()
      const atempOnText = await readSemanticOutput(
        'linear-output-atemp-comparison',
      )
      const atempComparisonSemantic =
        atempOffText !== atempOnText
        && containsAll(atempOffText, [
          62.72389095302256,
          40142.538618835824,
        ])
        && containsAll(atempOnText, [
          0.9923834525986027,
          17.240661944055777,
          14.34341206288322,
          48.79910362080849,
          0.027800000019931593,
          0.009139999925777954,
        ])
      const regularizationText = await page.textContent('body')
      const phase28Bridge = page.locator(
        '[data-testid="linear-phase-28-bridge"]',
      )
      const phase28BridgeText = await phase28Bridge.textContent()
      const phase28BridgeHref = await phase28Bridge.getAttribute('href')
      const nextStepPresent =
        phase28BridgeHref?.endsWith('/learn/housing-price-project') === true
        && (
          locale === 'zh-CN'
            ? containsAll(phase28BridgeText, [
                '阶段 28',
                '继续进入表格回归项目',
                '把本课确认的线性模型边界带入现有房价项目：使用冻结本地数据、防泄漏流水线、诚实基线、受控改进与残差复盘。',
                '进入房价预测项目',
              ])
            : containsAll(phase28BridgeText, [
                'Phase 28',
                'Continue to the tabular-regression project',
                "Carry this lesson's linear-model boundary into the existing housing project with frozen local data, a leakage-safe pipeline, an honest baseline, controlled improvement, and residual review.",
                'Open Housing Price Project',
              ])
        )
      const downloadCount = await page.locator(
        '[data-linear-regression-downloads] a[download]',
      ).count()

      const semanticChecks = {
        rowBatch: rowBatchSemantic,
        gdTrace: gdTraceSemantic,
        method: methodSemantic,
        coefficientSpace: coefficientSpaceSemantic,
        heldoutCase: heldoutCaseSemantic,
        atempComparison: atempComparisonSemantic,
      }
      const interactionResult = {
        locale,
        viewport: viewport.id,
        semanticChecks,
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
          /linear[- ]model|线性模型|tabular[- ]regression|表格回归/i.test(
            regularizationText ?? '',
          ),
        consoleErrors: [...caseConsoleErrors],
        warningCount: caseWarnings.length,
        localAssetViolations: localAssetViolations(),
      }
      interactions.push(interactionResult)

      if (
        !Object.values(interactionResult.semanticChecks).every(Boolean)
        || !interactionResult.rowBatchChanged
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
          .filter({
            hasText:
              /unavailable|invalid|audited compact baseline|无法读取|内置教学样例|审计过的精简基线/i,
          })
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

  if (
    interactions.length !== expectedInteractionCount
    || failureInjections.length !== expectedFailureInjectionCount
  ) {
    throw new Error(
      `Linear-regression semantic matrix count failed: ${JSON.stringify({
        expectedInteractionCount,
        actualInteractionCount: interactions.length,
        expectedFailureInjectionCount,
        actualFailureInjectionCount: failureInjections.length,
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
