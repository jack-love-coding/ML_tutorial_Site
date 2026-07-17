import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const generatedPath = path.join(root, 'src/modules/math-lab/data/importedMathNotes.generated.ts')
const assetOutputDir = path.join(root, 'public/math-lab/cs357-assets/figs')
const cachePath = path.join(root, 'output/cs357-translation-cache.json')
const sourceCacheDir = path.join(root, 'output/cs357-source-notes')

const CS357_TEXTBOOK_REF = '1f20018699108d8233535d645e856185db8fdd03'
const RAW_BASE = `https://raw.githubusercontent.com/cs357/textbook/${CS357_TEXTBOOK_REF}`
const NOTE_BASE = `${RAW_BASE}/notes`
const FIG_BASE = `${RAW_BASE}/assets/img/figs`
const CONTENT_API_BASE = 'https://api.github.com/repos/cs357/textbook/contents'

const externalTranslationRequested = process.argv.includes('--translate')
const shouldTranslate = false
const maxTranslationChars = 470
let translationUnavailable = false

const noteSpecs = [
  {
    id: 'taylor-series',
    file: 'taylor.md',
    zhTitle: '泰勒级数',
    zhSubtitle: '用单点附近的导数信息，把函数表示成可截断的无穷和。',
  },
  {
    id: 'monte-carlo',
    file: 'random-monte-carlo.md',
    zhTitle: '随机数生成器与蒙特卡洛方法',
    zhSubtitle: '用随机采样和平均值估计难以直接计算的量。',
  },
  {
    id: 'vectors-matrices-norms',
    file: 'vec-mat.md',
    zhTitle: '向量、矩阵与范数',
    zhSubtitle: '把数组理解成方向、线性变换、尺度和距离。',
  },
  {
    id: 'lu-decomposition',
    file: 'linsys.md',
    zhTitle: '用 LU 分解求解线性方程',
    zhSubtitle: '把线性方程组求解拆成可复用的三角求解步骤。',
  },
  {
    id: 'sparse-matrices',
    file: 'sparse.md',
    zhTitle: '稀疏矩阵',
    zhSubtitle: '利用大量零元素的结构，节省存储和计算。',
  },
  {
    id: 'condition-numbers',
    file: 'condition.md',
    zhTitle: '条件数',
    zhSubtitle: '衡量输入扰动如何被问题或算法放大到输出中。',
  },
  {
    id: 'eigenvalues-eigenvectors',
    file: 'eigen.md',
    zhTitle: '特征值与特征向量',
    zhSubtitle: '寻找在线性变换下只缩放、不改变方向的特殊向量。',
  },
  {
    id: 'markov-chains',
    file: 'markov.md',
    zhTitle: '马尔可夫链',
    zhSubtitle: '用状态转移矩阵描述只依赖当前状态的随机过程。',
  },
  {
    id: 'finite-difference-methods',
    file: 'finite-difference.md',
    zhTitle: '有限差分方法',
    zhSubtitle: '用相邻函数值近似导数，并分析步长带来的误差。',
  },
  {
    id: 'nonlinear-equations',
    file: 'solve_nd.md',
    zhTitle: '求解非线性方程',
    zhSubtitle: '用迭代方法寻找非线性函数的根。',
  },
  {
    id: 'optimization',
    file: 'optimization.md',
    zhTitle: '优化',
    zhSubtitle: '寻找让目标函数达到最优的输入，并理解局部与全局行为。',
  },
  {
    id: 'least-squares-fitting',
    file: 'linear-least-squares.md',
    zhTitle: '最小二乘拟合',
    zhSubtitle: '通过最小化残差平方和，把数据拟合写成优化问题。',
  },
  {
    id: 'svd',
    file: 'svd.md',
    zhTitle: '奇异值分解（SVD）',
    zhSubtitle: '把矩阵分解为方向、强度和方向的组合。',
  },
  {
    id: 'pca',
    file: 'pca.md',
    zhTitle: '主成分分析（PCA）',
    zhSubtitle: '沿着方差最大的方向重新表达数据并降低维度。',
  },
]

const accents = [
  ['#d65a31', '#fff1e8'],
  ['#247a73', '#e9f8f5'],
  ['#3868ff', '#eef3ff'],
  ['#7c5cff', '#f0edff'],
  ['#6d7b00', '#f4f7dd'],
  ['#b45309', '#fff4dd'],
  ['#c026d3', '#fdf0ff'],
  ['#0891b2', '#e5f8fd'],
  ['#15803d', '#eaf8ef'],
  ['#be123c', '#fff0f3'],
  ['#475569', '#f1f5f9'],
  ['#2563eb', '#edf4ff'],
  ['#7048e8', '#f1edff'],
  ['#0f766e', '#e6fbf6'],
]

const sectionTitleTranslations = {
  'Learning Objectives': '学习目标',
  'Learning objectives': '学习目标',
  'Review Questions': '复习问题',
  Footnotes: '脚注',
  Overview: '概览',
  'Polynomial Overview': '多项式概览',
  'Taylor Series Expansion': '泰勒级数展开',
  'Taylor Series Error': '泰勒级数误差',
  'Random Number Generators': '随机数生成器',
  'Random Variables': '随机变量',
  'Monte Carlo': '蒙特卡洛',
  'Vectors and Vector Spaces': '向量与向量空间',
  'Linear Transformations and Matrices': '线性变换与矩阵',
  'Vector Norm': '向量范数',
  'Matrix Norm': '矩阵范数',
  'Basic Idea: The “Undo” button for Linear Operations': '基本思想：线性操作的“撤销”按钮',
  'Back Substitution Algorithm for Upper Triangular Systems': '上三角系统的回代算法',
  'Forward Substitution Algorithm for Lower Triangular Systems': '下三角系统的前代算法',
  'LU Decomposition Definition': 'LU 分解定义',
  'Solving LU-Decomposed Linear Systems': '求解 LU 分解后的线性系统',
  'The LU Decomposition Algorithm': 'LU 分解算法',
  'Solving Linear Systems Using LU Decomposition': '使用 LU 分解求解线性系统',
  Pivoting: '主元选取',
  'LU Decomposition with Partial Pivoting': '带部分主元的 LU 分解',
  'Solving LUP decomposition linear systems': '求解 LUP 分解线性系统',
  'The LUP decomposition algorithm': 'LUP 分解算法',
  'Solving General Linear Systems using LUP Decomposition': '使用 LUP 分解求解一般线性系统',
  'Dense Matrices': '稠密矩阵',
  'Sparse Matrices': '稀疏矩阵',
  Goals: '目标',
  'Storage Solutions': '存储方案',
  'CSR Matrix Vector Product Algorithm': 'CSR 矩阵向量乘法算法',
  'Numerical experiments': '数值实验',
  'Sensitivity of Solutions of Linear Systems and Error Bound': '线性系统解的敏感性与误差界',
  'Condition Number': '条件数',
  'Residual vs Error': '残差与误差',
  'Alternative Definitions of Relative Residual': '相对残差的其他定义',
  'Gaussian Elimination (with Partial Pivoting) is Guaranteed to Produce a Small Residual': '带部分主元的高斯消元保证产生小残差',
  'Accuracy Rule of Thumb for Conditioning': '条件数与精度的经验法则',
  'Eigenvalues and Eigenvectors': '特征值与特征向量',
  Diagonalizability: '可对角化',
  'Eigenvalues of a Shifted Matrix': '平移矩阵的特征值',
  'Eigenvalues of an Inverse': '逆矩阵的特征值',
  'Eigenvalues of a Shifted Inverse': '平移逆矩阵的特征值',
  'Expressing an Arbitrary Vector as a Linear Combination of Eigenvectors': '把任意向量表示成特征向量的线性组合',
  'Power Iteration algorithm': '幂迭代算法',
  'Power Iteration code': '幂迭代代码',
  'Computing Eigenvalues from Eigenvectors': '由特征向量计算特征值',
  'Power Iteration and Floating-Point Arithmetic': '幂迭代与浮点运算',
  'Power Iteration without a Dominant Eigenvalue': '没有主导特征值时的幂迭代',
  'Inverse Iteration': '反迭代',
  'Inverse Iteration with Shift': '带平移的反迭代',
  'Rayleigh Quotient Iteration': '瑞利商迭代',
  'Convergence properties': '收敛性质',
  'Cost and Convergence Summary': '代价与收敛总结',
  'Orthogonal Matrices': '正交矩阵',
  'Gram-Schmidt': 'Gram-Schmidt 正交化',
  Graphs: '图',
  'Markov Chain': '马尔可夫链',
  'Markov Matrix': '马尔可夫矩阵',
  'Markov Chain Example: Weather': '马尔可夫链示例：天气',
  'Markov Chain Example: Page Rank': '马尔可夫链示例：PageRank',
  'Finite Difference Approximation': '有限差分近似',
  'Root of a Function': '函数的根',
  'Solution of an Equation': '方程的解',
  'Nonlinear Equations in 1D': '一维非线性方程',
  'Nonlinear System of Equations': '非线性方程组',
  'Optimization: Finding Minima of a Function': '优化：寻找函数最小值',
  'Local vs. Global Minima': '局部最小值与全局最小值',
  'Two Types of Methods to Resolve 1-Dimensional Optimization Problems': '求解一维优化问题的两类方法',
  'Criteria for 1-D Local Minima': '一维局部最小值判据',
  'Unimodal Functions': '单峰函数',
  'Golden Section Search (1-D)': '黄金分割搜索（一维）',
  "Newton's Method (1-D)": '牛顿法（一维）',
  'Definiton of Gradient and Hessian Matrix': '梯度与 Hessian 矩阵定义',
  'Two Types of Methods to Resolve N-Dimensional Optimization Problems': '求解 N 维优化问题的两类方法',
  'Criteria for N-D Local Minima': 'N 维局部最小值判据',
  'Steepest Descent (N-D)': '最速下降法（N 维）',
  "Newton's Method (N-D)": '牛顿法（N 维）',
  'Linear Regression with a Set of Data': '一组数据的线性回归',
  'Linear Least-squares Problem': '线性最小二乘问题',
  'Normal Equations': '正规方程',
  'Data Fitting vs Interpolation': '数据拟合与插值',
  'Computational Complexity': '计算复杂度',
  'Solving Least-Squares Problems Using SVD': '使用 SVD 求解最小二乘问题',
  'Computational Complexity Using Reduced SVD': '使用简化 SVD 的计算复杂度',
  'Determining Residual in Least-Squares Problem Using SVD': '使用 SVD 确定最小二乘问题中的残差',
  'Non-linear Least-Squares Problems vs. Linear Least-Squares Problems': '非线性最小二乘问题与线性最小二乘问题',
  'Singular Value Decomposition': '奇异值分解',
  'Time Complexity': '时间复杂度',
  'Reduced SVD': '简化 SVD',
  'Example: Computing the SVD': '示例：计算 SVD',
  'Rank, null space and range of a matrix': '矩阵的秩、零空间和值域',
  '(Moore-Penrose) Pseudoinverse': '（Moore-Penrose）伪逆',
  'Euclidean norm of matrices': '矩阵的欧几里得范数',
  'Euclidean norm of the inverse of matrices': '逆矩阵的欧几里得范数',
  '2-Norm Condition Number': '2-范数条件数',
  'Low-rank Approximation': '低秩近似',
  'Using SVD to solve a square system of linear equations': '使用 SVD 求解方形线性方程组',
  'What is PCA?': '什么是 PCA？',
  'Data Centering': '数据中心化',
  'Covariance Matrix': '协方差矩阵',
  'Diagonalization and Principal Components': '对角化与主成分',
  'SVD and Data Transforming': 'SVD 与数据变换',
  'Summary of PCA Algorithm': 'PCA 算法总结',
  'Alternative Definitions of Principal Components': '主成分的其他定义',
}

async function fetchText(url) {
  let lastError

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetchWithRetry(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
      }

      return await response.text()
    } catch (error) {
      lastError = error
      if (attempt === 3) throw error
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt))
    }
  }

  throw lastError
}

async function fetchBinary(url) {
  let lastError

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetchWithRetry(url)

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
      }

      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      lastError = error
      if (attempt === 3) throw error
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt))
    }
  }

  throw lastError
}

async function fetchGitHubContent(repoPath) {
  let lastError

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetchWithRetry(`${CONTENT_API_BASE}/${repoPath}?ref=${CS357_TEXTBOOK_REF}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch ${repoPath}: ${response.status} ${response.statusText}`)
      }

      const payload = await response.json()
      return Buffer.from(payload.content.replace(/\s/g, ''), 'base64')
    } catch (error) {
      lastError = error
      if (attempt === 3) throw error
      await new Promise((resolve) => setTimeout(resolve, 800 * attempt))
    }
  }

  throw lastError
}

async function fetchGitHubText(repoPath) {
  return (await fetchGitHubContent(repoPath)).toString('utf8')
}

async function fetchWithRetry(url, attempts = 6) {
  let lastError

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'ML-tutorial-site-importer',
        },
      })

      if (response.ok || attempt === attempts) return response
      lastError = new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    } catch (error) {
      lastError = error
      if (attempt === attempts) throw error
    }

    await new Promise((resolve) => setTimeout(resolve, 500 * attempt))
  }

  throw lastError
}

function parseFrontmatter(raw) {
  const normalized = raw.replace(/\r\n/g, '\n')
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) {
    return {
      data: {},
      body: normalized,
    }
  }

  const frontmatter = match[1]
  const readScalar = (key) => frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1]?.trim() ?? ''

  return {
    data: {
      title: readScalar('title'),
      description: readScalar('description'),
      sort: Number(readScalar('sort')),
    },
    body: normalized.slice(match[0].length),
  }
}

function stripVisibleSourceMarkers(markdown) {
  return markdown
    .replace(/CS\s*357/gi, '')
    .replace(/Course Staff/gi, '')
    .replace(/University of Illinois/gi, '')
    .replace(/Illinois/gi, '')
    .replace(/changelog/gi, '')
}

function revealImageComments(markdown) {
  return markdown.replace(/<!--([\s\S]*?<img[\s\S]*?)-->/gi, (_, comment) => comment.trim())
}

function removeNonTeachingComments(markdown) {
  return markdown.replace(/<!--[\s\S]*?-->/g, '')
}

function assertSafeAssetFilename(filename) {
  let decodedFilename
  try {
    decodedFilename = decodeURIComponent(filename)
  } catch {
    throw new Error(`Unsafe CS357 asset filename: invalid URL encoding in ${JSON.stringify(filename)}`)
  }

  const isSinglePathSegment = (
    filename.length > 0
    && decodedFilename.length > 0
    && filename === path.posix.basename(filename)
    && filename === path.win32.basename(filename)
    && decodedFilename === path.posix.basename(decodedFilename)
    && decodedFilename === path.win32.basename(decodedFilename)
  )
  const containsUnsafeCharacters = /[\0-\x1f\x7f]/.test(decodedFilename)

  if (!isSinglePathSegment || containsUnsafeCharacters || decodedFilename === '.' || decodedFilename === '..') {
    throw new Error(`Unsafe CS357 asset filename: ${JSON.stringify(filename)}`)
  }

  return filename
}

export function resolveAssetTarget(filename, outputDir = assetOutputDir) {
  const safeFilename = assertSafeAssetFilename(filename)
  const resolvedOutputDir = path.resolve(outputDir)
  const targetPath = path.resolve(resolvedOutputDir, safeFilename)
  const relativeTarget = path.relative(resolvedOutputDir, targetPath)

  if (path.isAbsolute(relativeTarget) || relativeTarget.startsWith(`..${path.sep}`) || relativeTarget === '..') {
    throw new Error(`CS357 asset target escapes output directory: ${JSON.stringify(filename)}`)
  }

  return targetPath
}

export function normalizeImageReference(reference) {
  const cleaned = reference
    .replace(/\{\{\s*site\.baseurl\s*\}\}\//g, '')
    .replace(/^\.\.\//, '')
    .replace(/^\//, '')

  const match = cleaned.match(/(?:^|\/)assets\/img\/figs\/([^?#\s'")]+)/)
  if (!match) {
    return undefined
  }

  const filename = assertSafeAssetFilename(match[1])

  return {
    filename,
    localPath: `/math-lab/cs357-assets/figs/${filename}`,
  }
}

function rewriteImagePaths(markdown, assetNames) {
  let rewritten = markdown.replace(/(<img\b[^>]*?\bsrc=["'])([^"']+)(["'][^>]*>)/gi, (full, prefix, reference, suffix) => {
    const normalized = normalizeImageReference(reference)
    if (!normalized) return full
    assetNames.add(normalized.filename)
    return `${prefix}${normalized.localPath}${suffix}`
  })

  rewritten = rewritten.replace(/(!\[[^\]]*]\()([^)]+)(\))/g, (full, prefix, reference, suffix) => {
    const normalized = normalizeImageReference(reference)
    if (!normalized) return full
    assetNames.add(normalized.filename)
    return `${prefix}${normalized.localPath}${suffix}`
  })

  return rewritten
}

function slugify(value) {
  const plain = value
    .replace(/<[^>]+>/g, '')
    .replace(/\\\(|\\\)|\\\[|\\\]|\$+/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .trim()
    .toLowerCase()

  return plain.replace(/\s+/g, '-').replace(/-+/g, '-') || 'section'
}

function splitSections(markdown, moduleId) {
  const blocks = markdown
    .replace(/\r\n/g, '\n')
    .split(/\n(?=##\s+)/)
    .map((block) => block.trim())
    .filter(Boolean)

  const seen = new Map()
  const sections = []

  for (const block of blocks) {
    const headingMatch = block.match(/^##\s+(.+?)\s*$/m)
    const title = headingMatch?.[1]?.trim() ?? 'Overview'
    const baseId = `${moduleId}-${slugify(title)}`
    const count = seen.get(baseId) ?? 0
    seen.set(baseId, count + 1)
    const id = count === 0 ? baseId : `${baseId}-${count + 1}`
    const content = block.replace(/^##\s+.+?\s*$/m, '').trim()

    sections.push({
      id,
      title,
      content,
    })
  }

  return sections
}

function json(value) {
  return JSON.stringify(value, null, 2)
}

function protectMarkdown(source) {
  const preserved = []
  const protect = (value) => {
    const token = `CODEXKEEP${preserved.length}CODEX`
    preserved.push(value)
    return token
  }

  const patterns = [
    /```[\s\S]*?```/g,
    /\$\$[\s\S]*?\$\$/g,
    /\\{1,2}\[[\s\S]*?\\{1,2}\]/g,
    /\\{1,2}\([\s\S]*?\\{1,2}\)/g,
    /<img\b[^>]*>/gi,
    /!\[[^\]]*]\([^)]+\)/g,
    /`[^`\n]+`/g,
  ]

  let output = source
  for (const pattern of patterns) {
    output = output.replace(pattern, protect)
  }

  return { output, preserved }
}

function restoreMarkdown(source, preserved) {
  let output = source
  preserved.forEach((value, index) => {
    output = output.replaceAll(`CODEXKEEP${index}CODEX`, value)
  })

  return output
    .replace(/^#\s*#\s*#\s*/gm, '### ')
    .replace(/^#\s*#\s*/gm, '## ')
    .replace(/^-\s+/gm, '- ')
    .replace(/<summary><strong>Answer<\/strong><\/summary>/g, '<summary><strong>答案</strong></summary>')
}

async function loadTranslationCache() {
  try {
    return JSON.parse(await readFile(cachePath, 'utf8'))
  } catch {
    return {}
  }
}

async function saveTranslationCache(cache) {
  await mkdir(path.dirname(cachePath), { recursive: true })
  await writeFile(cachePath, JSON.stringify(cache, null, 2))
}

async function translateChunk(text, cache) {
  const normalized = text.trim()
  if (!normalized || !/[A-Za-z]/.test(normalized)) return text
  if (cache[normalized]) return cache[normalized]
  if (translationUnavailable) return text

  translationUnavailable = true
  cache[normalized] = text
  return text
}

function splitLongChunk(chunk) {
  if (chunk.length <= maxTranslationChars) return [chunk]

  const pieces = []
  let remaining = chunk

  while (remaining.length > maxTranslationChars) {
    const boundary = Math.max(
      remaining.lastIndexOf('. ', maxTranslationChars),
      remaining.lastIndexOf('; ', maxTranslationChars),
      remaining.lastIndexOf(', ', maxTranslationChars),
      remaining.lastIndexOf(' ', maxTranslationChars),
    )
    const splitAt = boundary > 80 ? boundary + 1 : maxTranslationChars
    pieces.push(remaining.slice(0, splitAt).trim())
    remaining = remaining.slice(splitAt).trim()
  }

  if (remaining) pieces.push(remaining)
  return pieces
}

async function translateMarkdown(source, cache) {
  if (!shouldTranslate) return source

  const { output, preserved } = protectMarkdown(source)
  const blocks = output.split(/(\n{2,})/)
  const translatedBlocks = []

  for (const block of blocks) {
    if (/^\n+$/.test(block) || !block.trim()) {
      translatedBlocks.push(block)
      continue
    }

    const pieces = splitLongChunk(block)
    const translatedPieces = []
    for (const piece of pieces) {
      translatedPieces.push(await translateChunk(piece, cache))
    }
    translatedBlocks.push(translatedPieces.join(' '))
  }

  return restoreMarkdown(translatedBlocks.join(''), preserved)
}

async function downloadAssets(assetNames) {
  await mkdir(assetOutputDir, { recursive: true })

  for (const filename of [...assetNames].sort()) {
    const targetPath = resolveAssetTarget(filename, assetOutputDir)
    try {
      const existing = await stat(targetPath)
      if (existing.size > 0) continue
    } catch {
      // Missing or unreadable assets are downloaded below.
    }

    let bytes
    try {
      bytes = await fetchGitHubContent(`assets/img/figs/${filename}`)
    } catch {
      bytes = await fetchBinary(`${FIG_BASE}/${filename}`)
    }
    if (bytes.length === 0) {
      bytes = await fetchBinary(`${FIG_BASE}/${filename}`)
    }
    await writeFile(targetPath, bytes)
  }
}

async function loadSourceNote(spec) {
  const cacheFile = path.join(sourceCacheDir, spec.file)

  try {
    return await readFile(cacheFile, 'utf8')
  } catch {
    // Populate the local source cache from the network below.
  }

  let raw
  try {
    raw = await fetchGitHubText(`notes/${spec.file}`)
  } catch {
    raw = await fetchText(`${NOTE_BASE}/${spec.file}`)
  }

  await mkdir(sourceCacheDir, { recursive: true })
  await writeFile(cacheFile, raw)
  return raw
}

function buildModule(spec, frontmatter, englishSections, chineseSections, index, assetNames) {
  const [accent, theme] = accents[index]
  const next = noteSpecs[index + 1]?.id
  const wordCount = englishSections.reduce((sum, section) => sum + section.content.split(/\s+/).length, 0)
  const estimatedMinutes = Math.max(18, Math.ceil(wordCount / 170))

  return {
    id: spec.id,
    enhancementTier: 'interactive',
    order: frontmatter.sort,
    title: {
      'zh-CN': spec.zhTitle,
      en: frontmatter.title,
    },
    subtitle: {
      'zh-CN': spec.zhSubtitle,
      en: frontmatter.description,
    },
    difficulty: index < 3 ? 'foundation' : index < 11 ? 'intermediate' : 'advanced',
    estimatedMinutes,
    prerequisites: index > 0 ? [noteSpecs[index - 1].id] : [],
    aiModelConnections: [
      {
        'zh-CN': '这一章作为后续机器学习与数值计算实验的数学地基。',
        en: 'Use this chapter as mathematical groundwork for later machine-learning and numerical experiments.',
      },
    ],
    learningObjectives: [],
    concepts: [],
    sections: englishSections.map((section, sectionIndex) => ({
      id: section.id,
      level: 2,
      title: {
        'zh-CN': chineseSections[sectionIndex]?.title ?? section.title,
        en: section.title,
      },
      content: {
        'zh-CN': chineseSections[sectionIndex]?.content ?? section.content,
        en: section.content,
      },
    })),
    toc: englishSections.map((section, sectionIndex) => ({
      id: section.id,
      level: 2,
      title: {
        'zh-CN': chineseSections[sectionIndex]?.title ?? section.title,
        en: section.title,
      },
    })),
    visuals: [],
    labs: [],
    quizzes: [],
    misconceptions: [],
    nextModuleIds: next ? [next] : [],
    accent,
    theme,
    sourceNoteFile: spec.file,
    originalSort: frontmatter.sort,
    importedAssetPaths: [...assetNames].sort().map((filename) => `/math-lab/cs357-assets/figs/${filename}`),
  }
}

async function main() {
  const translationCache = await loadTranslationCache()
  const modules = []
  const allAssets = new Set()

  for (const [index, spec] of noteSpecs.entries()) {
    console.log(`Importing ${spec.file}`)
    const raw = await loadSourceNote(spec)
    const { data: frontmatter, body } = parseFrontmatter(raw)
    const noteAssets = new Set()
    const cleaned = rewriteImagePaths(
      stripVisibleSourceMarkers(removeNonTeachingComments(revealImageComments(body))),
      noteAssets,
    ).trim()

    for (const asset of noteAssets) allAssets.add(asset)

    const englishSections = splitSections(cleaned, spec.id)
    const chineseSections = []

    for (const section of englishSections) {
      chineseSections.push({
        ...section,
        title: sectionTitleTranslations[section.title] ?? await translateMarkdown(section.title, translationCache),
        content: await translateMarkdown(section.content, translationCache),
      })
    }

    modules.push(buildModule(spec, frontmatter, englishSections, chineseSections, index, noteAssets))
    await saveTranslationCache(translationCache)
  }

  await downloadAssets(allAssets)

  const generated = `/* eslint-disable */\n// This file is generated by scripts/import-cs357-notes.mjs.\n// Re-run the importer instead of editing by hand.\n\nimport type { MathLabModule } from '../types/mathLab'\n\nexport const importedMathNotes = ${json(modules)} satisfies MathLabModule[]\n`

  await writeFile(generatedPath, generated)
  console.log(`Wrote ${path.relative(root, generatedPath)}`)
  console.log(`Downloaded ${allAssets.size} assets to ${path.relative(root, assetOutputDir)}`)
}

const isMainModule = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMainModule) {
  if (externalTranslationRequested) {
    console.warn('External translation is disabled. Chinese content must come from hand-written project overrides.')
  }

  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
