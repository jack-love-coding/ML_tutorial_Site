async (page) => {
  const origin = 'http://127.0.0.1:4173'
  const rootPath = '/learn/loss-functions'
  const chapterIds = [
    'why-loss',
    'regression-losses',
    'classification-losses',
    'likelihood-intuition',
    'negative-log',
    'mle-bridge',
    'gradient-verification',
  ]
  const routes = [
    { id: 'root', path: rootPath, expectedActive: 'why-loss' },
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
  const expectedTitles = {
    'zh-CN': '损失函数与似然',
    en: 'Loss Functions & Likelihood',
  }
  const results = []
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

  for (const locale of ['zh-CN', 'en']) {
    await page.goto(rootPath.startsWith('http') ? rootPath : `${origin}${rootPath}`)
    await page.evaluate((nextLocale) => {
      localStorage.setItem('ml-atlas-locale', nextLocale)
    }, locale)

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)

      for (const route of routes) {
        caseConsoleErrors = []
        caseWarnings = []
        caseRequests = []
        const response = await page.goto(`${origin}${route.path}`)
        await page.waitForSelector('[data-section-id="why-loss"]')
        await page.waitForLoadState('networkidle')
        await page.waitForFunction(
          (expectedActive) =>
            document
              .querySelector(`[data-section-id="${expectedActive}"]`)
              ?.classList.contains('is-active') ?? false,
          route.expectedActive,
        )

        const probe = await page.evaluate(
          ({ chapterIds, expectedTitle, expectedActive, origin }) => {
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
                '.algorithm-view--loss button, .algorithm-view--loss a, .algorithm-view--loss input, .algorithm-view--loss select',
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
              for (let rightIndex = leftIndex + 1; rightIndex < interactive.length; rightIndex += 1) {
                const leftElement = interactive[leftIndex]
                const rightElement = interactive[rightIndex]
                if (leftElement.contains(rightElement) || rightElement.contains(leftElement)) continue
                const left = leftElement.getBoundingClientRect()
                const right = rightElement.getBoundingClientRect()
                const overlapWidth = Math.min(left.right, right.right) - Math.max(left.left, right.left)
                const overlapHeight = Math.min(left.bottom, right.bottom) - Math.max(left.top, right.top)
                if (overlapWidth > 2 && overlapHeight > 2) {
                  overlaps.push([
                    leftElement.textContent?.trim() || leftElement.getAttribute('aria-label'),
                    rightElement.textContent?.trim() || rightElement.getAttribute('aria-label'),
                  ])
                }
              }
            }
            const renderedChapterIds = [
              ...document.querySelectorAll('.story-card[data-section-id]'),
            ].map((element) => element.getAttribute('data-section-id'))
            const downloads = document.querySelectorAll('[data-loss-downloads]')
            const downloadLinks = [
              ...document.querySelectorAll('[data-loss-downloads] a[download]'),
            ].map((anchor) => anchor.href)

            return {
              lang: document.documentElement.lang,
              title: document.querySelector('h1')?.textContent?.trim(),
              titleOk: document.querySelector('h1')?.textContent?.trim() === expectedTitle,
              chapterOrderOk:
                JSON.stringify(renderedChapterIds) === JSON.stringify(chapterIds),
              activeOk:
                document
                  .querySelector(`[data-section-id="${expectedActive}"]`)
                  ?.classList.contains('is-active') ?? false,
              codeCopyPresent: Boolean(document.querySelector('.math-code-lab__copy')),
              checkpointPresent: Boolean(document.querySelector('.algorithm-checkpoint')),
              downloadsOnce: downloads.length === 1,
              downloadCount: downloadLinks.length,
              downloadLinksLocal: downloadLinks.every(
                (href) => new URL(href).origin === origin,
              ),
              fixedExtremeTable:
                document.body.textContent?.includes('-1000')
                && document.body.textContent?.includes('1000'),
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
            expectedTitle: expectedTitles[locale],
            expectedActive: route.expectedActive,
            origin,
          },
        )

        const localAssetViolations = caseRequests.filter((requestUrl) => {
          const isCourseAsset =
            requestUrl.includes('/datasets/loss-functions/')
            || requestUrl.includes('/notebooks/loss-functions/')
          return isCourseAsset && !requestUrl.startsWith(`${origin}/`)
        })

        results.push({
          locale,
          viewport: viewport.id,
          route: route.id,
          status: response?.status(),
          ...probe,
          localAssetViolations,
          consoleErrors: [...caseConsoleErrors],
          warningCount: caseWarnings.length,
        })
      }

      caseConsoleErrors = []
      caseWarnings = []
      caseRequests = []
      await page.goto(`${origin}${rootPath}`)
      await page.waitForLoadState('networkidle')

      const progressKeysBefore = await page.evaluate(() =>
        [
          'ml-atlas:algorithm-progress:v1',
          'ml-atlas:math-lab-progress:v1',
          'ml-atlas:data-lab-progress:v1',
          'ml-atlas:learning-progress:v2',
        ].filter((key) => localStorage.getItem(key) !== null),
      )

      const whyLab = page.locator('[data-section-id="why-loss"]')
      const whyLossSelect = whyLab.locator('.loss-real-row-select').first()
      await whyLossSelect.selectOption('mae')
      const boundedLossChanged = (await whyLossSelect.inputValue()) === 'mae'
      await whyLab.locator('button.button-quiet').first().click()
      const whyResetWorked = (await whyLossSelect.inputValue()) === 'mse'

      const regressionLab = page.locator('[data-section-id="regression-losses"]')
      const regressionText = await regressionLab.textContent()
      const outlierComparison =
        regressionText.includes('long-duration')
        && regressionText.includes('MSE')
        && regressionText.includes('MAE')

      const classificationLab = page.locator('[data-section-id="classification-losses"]')
      const classificationText = await classificationLab.textContent()
      const confidentErrorBce =
        /confident|置信/i.test(classificationText)
        && classificationText.includes('BCE')
        && /logit/i.test(classificationText)
      const selectedRealBceSource =
        /real-secom-oof-row|本地锁定真实折外行|locked local real OOF row/i.test(
          classificationText,
        )

      const gradientLab = page.locator(
        '[data-section-id="gradient-verification"] .loss-gradient-lab',
      )
      const lossKindSelect = gradientLab.locator('select').nth(0)
      const rowSelect = gradientLab.locator('select').nth(1)
      const stepSelect = gradientLab.locator('select').nth(2)
      await lossKindSelect.selectOption('mae')
      const kinkOptionValue = await rowSelect.evaluate((select) => {
        const options = [...select.options]
        return options.find((option) =>
          option.textContent?.includes('typical-zero-residual')
          || option.textContent?.includes('target 175 / prediction 175'),
        )?.value ?? ''
      })
      if (!kinkOptionValue) {
        throw new Error('Missing the locked zero-residual MAE option')
      }
      await rowSelect.selectOption(kinkOptionValue)
      const kinkVisible = /kink|不可微/i.test(await gradientLab.textContent())
      await stepSelect.selectOption('0.001')
      const hChanged = (await stepSelect.inputValue()) === '0.001'
      await gradientLab.locator('button.button-quiet').click()
      const gradientResetWorked =
        (await lossKindSelect.inputValue()) === 'mse'
        && (await stepSelect.inputValue()) === '0.00001'

      const copyButton = page.locator('.math-code-lab__copy').first()
      await copyButton.evaluate((button) => button.click())
      const codeCopyWorked = /copied|已复制/i.test(await copyButton.textContent())

      const firstCheckpoint = page.locator('.algorithm-checkpoint__item').first()
      await firstCheckpoint.locator('input[type="radio"]').first().check()
      const checkpointSubmissionWorked =
        await firstCheckpoint.locator('.algorithm-checkpoint__feedback').isVisible()

      const progressKeysAfter = await page.evaluate(() =>
        [
          'ml-atlas:algorithm-progress:v1',
          'ml-atlas:math-lab-progress:v1',
          'ml-atlas:data-lab-progress:v1',
          'ml-atlas:learning-progress:v2',
        ].filter((key) => localStorage.getItem(key) !== null),
      )
      const progressKeysPreserved = progressKeysBefore.every((key) =>
        progressKeysAfter.includes(key),
      )

      const interactionResult = {
        locale,
        viewport: viewport.id,
        boundedLossChanged,
        whyResetWorked,
        outlierComparison,
        confidentErrorBce,
        selectedRealBceSource,
        kinkVisible,
        hChanged,
        gradientResetWorked,
        codeCopyWorked,
        checkpointSubmissionWorked,
        progressKeysPreserved,
        consoleErrors: [...caseConsoleErrors],
        localAssetViolations: caseRequests.filter((requestUrl) => {
          const isCourseAsset =
            requestUrl.includes('/datasets/loss-functions/')
            || requestUrl.includes('/notebooks/loss-functions/')
          return isCourseAsset && !requestUrl.startsWith(`${origin}/`)
        }),
      }

      if (
        !interactionResult.boundedLossChanged
        || !interactionResult.whyResetWorked
        || !interactionResult.outlierComparison
        || !interactionResult.confidentErrorBce
        || !interactionResult.selectedRealBceSource
        || !interactionResult.kinkVisible
        || !interactionResult.hChanged
        || !interactionResult.gradientResetWorked
        || !interactionResult.codeCopyWorked
        || !interactionResult.checkpointSubmissionWorked
        || !interactionResult.progressKeysPreserved
        || interactionResult.consoleErrors.length > 0
        || interactionResult.localAssetViolations.length > 0
      ) {
        throw new Error(
          `Loss-functions interaction matrix failed: ${JSON.stringify(interactionResult)}`,
        )
      }
    }
  }

  const failures = results.filter(
    (result) =>
      result.status !== 200
      || result.lang !== result.locale
      || !result.titleOk
      || !result.chapterOrderOk
      || !result.activeOk
      || !result.codeCopyPresent
      || !result.checkpointPresent
      || !result.downloadsOnce
      || result.downloadCount !== 16
      || !result.downloadLinksLocal
      || !result.fixedExtremeTable
      || !result.reducedMotion
      || result.overflow
      || result.deadFragments.length > 0
      || result.emptyLinks.length > 0
      || result.overlaps.length > 0
      || result.localAssetViolations.length > 0
      || result.consoleErrors.length > 0,
  )

  if (failures.length > 0) {
    throw new Error(
      `Loss-functions browser matrix failed: ${JSON.stringify(failures)}`,
    )
  }

  return {
    cases: results.length,
    failures: failures.length,
    viewports: viewports.map(({ id }) => id),
    locales: ['zh-CN', 'en'],
    chapterIds,
    results,
  }
}
