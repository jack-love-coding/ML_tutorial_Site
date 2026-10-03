async (page) => {
  const base = 'http://127.0.0.1:4173/ML_tutorial_Site'
  const paths = ['/', '/learn/ai-overview', '/python', '/learn/loss-functions/why-loss', '/learn/gradient-descent', '/learn/mlp', '/learn/attention-transformer/softmax-weighted-sum', '/learn/attention-transformer/transformer-block', '/learn/attention-transformer/architecture-to-tools', '/learn/cnn-visualization/padding-stride-shape', '/learn/optimizer-comparison/curve-diagnosis', '/math-lab', '/math-lab/modules/calculus-gradient-descent', '/math-lab/modules/beginner-linear-algebra', '/data-lab', '/data-lab/modules/splits-generalization', '/courses/ai-foundation', '/courses/ai-foundation/units/01-ai-map-python', '/progress', '/math-lab/diagnostic']
  const keys = ['ml-atlas:algorithm-progress:v1', 'ml-atlas:math-lab-progress:v1', 'ml-atlas:data-lab-progress:v1', 'ml-atlas:learning-progress:v2', 'ml-atlas:learning-progress:v2:migration', 'ml-atlas:course-progress:v1', 'ml-atlas:checkpoint-report:calculus-gradient-descent']
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
  const stored = () => page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage).filter(([key]) => key !== 'ml-atlas-locale').sort())))
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const results = []
  for (const seeded of [false, true]) {
    await page.goto(base + '/')
    await page.evaluate(({ seeded, keys }) => {
      localStorage.clear()
      if (seeded) for (const key of keys) localStorage.setItem(key, JSON.stringify({ completedModuleIds: ['vectors'], quizAttempts: [], modules: {}, lastVisitedModuleId: 'vectors', preserved: '  原样 / unchanged  ' }))
    }, { seeded, keys })
    const before = await stored()
    for (const path of paths) {
      await page.setViewportSize({ width: seeded ? 390 : 1280, height: 900 })
      await page.goto(base + path)
      await page.waitForLoadState('networkidle')
      await page.getByRole('button', { name: seeded ? 'EN' : '中', exact: true }).click()
      const controls = page.locator('main input[type="range"]')
      if (await controls.count()) { await controls.first().focus(); await page.keyboard.press('ArrowRight') }
      await page.keyboard.press('Tab')
      if (await stored() !== before) throw new Error(`Learning storage mutated: ${path}`)
      await page.reload()
      await page.waitForLoadState('networkidle')
      if (await stored() !== before) throw new Error(`Learning storage mutated after reload: ${path}`)
      const probe = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth + 1, text: document.querySelector('main')?.textContent ?? '', buttons: [...document.querySelectorAll('main button')].map(x => x.textContent) }))
      if (probe.overflow) throw new Error(`Horizontal overflow: ${path} (${seeded ? 390 : 1280}px)`)
      if (!probe.text.trim()) throw new Error(`Empty content: ${path}`)
      if (probe.buttons.some(text => /提交答案|保存报告|标记完成|Check answer|Mark complete|Save report/i.test(text))) throw new Error(`Learner assessment control: ${path}`)
      results.push({ path, seeded, width: seeded ? 390 : 1280 })
    }
  }
  if (errors.length) throw new Error(errors.join('\n'))
  console.log(JSON.stringify({ passed: results.length, storage: 'byte-for-byte unchanged', results }))
}
