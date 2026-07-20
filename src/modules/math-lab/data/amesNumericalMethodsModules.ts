import type { LocalizedCopy, MathLabModule, MathLabSection, MathLabTocItem, VisualAsset } from '../types/mathLab.ts'

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

const routeOverviewVisual: VisualAsset = {
  id: 'ames-numerical-methods-chain-image',
  type: 'image',
  title: copy('Ames 数值方法链', 'Ames numerical methods chain'),
  assetPath: '/math-lab/numerical-methods/ames-numerical-methods-chain.png',
  transcript: copy(
    '同一份 Ames 数值快照依次经过最小二乘拟合、LU 线性系统求解和条件数诊断。三章不会更换数据故事，因此每一步都能回到前一章的矩阵与输出。',
    'The same Ames numeric snapshot moves through least-squares fitting, LU linear-system solving, and conditioning diagnostics. The data story stays fixed, so every step can be traced to the preceding matrix and output.',
  ),
  learningPurpose: copy(
    '在进入细节前建立三章共享的计算路线。',
    'Establish the shared computational route before entering chapter details.',
  ),
  alt: copy(
    '从房屋数据表到最小二乘投影、LU 三角矩阵和条件数椭圆的横向流程图。',
    'A horizontal flow from a housing data table to least-squares projection, LU triangular matrices, and a condition-number ellipse.',
  ),
  caption: copy(
    '这张图只负责路线导航；精确公式、数值与结论以页面正文、已执行 Notebook 和后续动画为准。',
    'This figure provides route orientation only; the lesson text, executed Notebook, and animations remain authoritative for formulas, numbers, and conclusions.',
  ),
}

const leastSquaresProjectionAnimation: VisualAsset = {
  id: 'ames-least-squares-projection-video',
  type: 'manim-video',
  title: copy('最小二乘：投影与两种检查', 'Least squares: projection and two different checks'),
  assetPath: '/manim/numerical-methods/least-squares-projection.mp4',
  posterPath: '/manim/numerical-methods/least-squares-projection-poster.png',
  transcript: copy(
    `我们从 2,927 套 Ames 房屋出发。五个特征标准化后加上截距列，得到 \(X\in\mathbb R^{2927\times6}\)；系数向量有 6 项，目标向量有 2,927 项，本例的数值秩为 6。

最小二乘在 \(X\) 的列空间中寻找离 \(y\) 最近的预测 \(\hat y=X\hat\beta\)。残差定义为 \(r=y-\hat y\)。动画里的平面与箭头只是高维关系示意，不按实际尺度。

在最近点，残差与设计矩阵的每一列正交，因此 \(X^Tr\) 接近零。本例 \(\max|X^Tr|=3.726\times10^{-10}\)，它检查最小二乘的一阶最优条件。

这个数不能与预测误差混为一谈。RMSE 为 35.834 千美元，回答预测通常相差多远；\(X^Tr\) 接近零，回答当前系数是否满足一阶条件。

把残差代回正交条件可得 \(X^T(X\beta-y)=0\)，再整理为 \(X^TX\beta=X^Ty\)。记 \(G=X^TX\)、\(c=X^Ty\)，便得到下一章要分解和复用的 6×6 系统 \(G\beta=c\)。`,
    `We begin with 2,927 Ames homes. Five standardized features plus an intercept produce a 2,927-by-6 design matrix. The coefficient vector has six entries, the target has 2,927 entries, and the numerical rank is six.

Least squares finds the prediction y-hat in the column space of X that is closest to y, with residual r equal to y minus y-hat. The plane and arrows are only a schematic of a high-dimensional relationship and are not drawn to scale.

At the closest point, the residual is orthogonal to every design column, so X-transpose r is approximately zero. Its largest component is 3.726 times ten to the minus ten; this checks the first-order optimality condition.

It is not the prediction error. RMSE is 35.834 thousand dollars and describes how far predictions remain from targets. X-transpose r checks whether the fitted coefficients satisfy the least-squares condition.

Substitution gives the normal equations. With G equal to X-transpose X and c equal to X-transpose y, the next lesson receives the 6-by-6 system G beta equals c for factorization and reuse.`,
  ),
  learningPurpose: copy(
    '把 2,927×6 设计矩阵、列空间投影、残差正交和正规方程连成一条完整推理链，并区分预测误差与求解检查。',
    'Connect the 2,927-by-6 design, projection, residual orthogonality, and normal equations while separating prediction error from an optimality check.',
  ),
  alt: copy(
    'Ames 表格变为 2927×6 设计矩阵，目标向量投影到 X 的列空间并留下残差；双卡分别显示 RMSE 和 X 转置残差。',
    'An Ames table becomes a 2,927-by-6 design matrix; y is projected onto the column space of X, with separate cards for RMSE and the X-transpose residual.',
  ),
  caption: copy(
    '投影解释系数为何满足最优条件；RMSE 描述预测仍会差多远。',
    'Projection explains the optimality condition; RMSE describes the remaining prediction error.',
  ),
}

const lupFactorReuseAnimation: VisualAsset = {
  id: 'ames-lup-factor-reuse-video',
  type: 'manim-video',
  title: copy('LUP：分解一次，求解多次', 'LUP: factor once, solve repeatedly'),
  assetPath: '/manim/numerical-methods/lup-factor-reuse.mp4',
  posterPath: '/manim/numerical-methods/lup-factor-reuse-poster.png',
  transcript: copy(
    `上一章得到 \(G\beta=c\)。这里不显式求逆，而把 6×6 的 Gram 矩阵分解成可复用的求解器。

部分主元法在每一步消元前检查候选主元。Ames 系统记录的主元行是 \([0,1,2,3,4]\)，表示五次检查都保留当前行，本例没有实际换行；这并不意味着一般算法可以省略主元检查。

一般不变量是 \(PG=LU\)：\(P\) 记录行置换，\(L\) 保存消元倍数，\(U\) 是上三角矩阵。本例 \(P=I_6\)，但页面与算法仍保留一般形式。

求解时先前代 \(Lz=Pc\)，再回代 \(U\beta=z\)。分解残差为 \(4.547\times10^{-13}\)，求解残差为 \(1.455\times10^{-11}\)；手写 LUP 与 SciPy 最大差 \(7.105\times10^{-15}\)，LU 与上一章 lstsq 最大差 \(1.918\times10^{-13}\)。这些检查分别对应不同环节。

当 \(X\) 不变时，\(G=X^TX\) 也不变。原房价与对数房价只更换右端项，因此同一组 \(P,L,U\) 可以复用；第二个目标的拟合截距是 12.02122130。小残差说明当前方程算得准确，但还不能说明输入稍变时系数是否稳定。`,
    `The previous lesson produced G beta equals c. We avoid an explicit inverse and factor the 6-by-6 Gram matrix into a reusable solver.

Partial pivoting checks candidates before every elimination step. The recorded Ames pivot rows are zero through four, meaning the current row wins all five checks and no swap occurs in this example. The checks are still part of the general algorithm.

The general invariant is P G equals L U. P records row permutations, L stores elimination multipliers, and U is upper triangular. Here P is the 6-by-6 identity, but the general form remains essential.

Forward substitution solves L z equals P c, then back substitution solves U beta equals z. The factorization residual is 4.547 times ten to the minus thirteen and the solve residual is 1.455 times ten to the minus eleven. The manual result agrees with SciPy within 7.105 times ten to the minus fifteen and with lstsq within 1.918 times ten to the minus thirteen.

With X unchanged, G also stays fixed. Sale price and log sale price only replace the right-hand side, so one set of P, L, and U factors serves both targets; the fitted log-price intercept is 12.02122130. Small residuals establish computational agreement, not sensitivity to input changes.`,
  ),
  learningPurpose: copy(
    '看清部分主元检查、三角求解和多右端复用分别承担什么工作。',
    'Distinguish the roles of pivot checks, triangular solves, and multiple-right-hand-side reuse.',
  ),
  alt: copy(
    '六乘六 Gram 矩阵完成五次主元检查并分成 L 与 U，同一组 P、L、U 随后连接房价和对数房价两个右端。',
    'A 6-by-6 Gram matrix undergoes five pivot checks, splits into L and U, and reuses the same factors for price and log-price right-hand sides.',
  ),
  caption: copy(
    '主元检查保护一般求解流程；相同系数矩阵允许复用一次分解。',
    'Pivot checks protect the general solve, while one factorization serves multiple right-hand sides.',
  ),
}

const conditionNumberSensitivityAnimation: VisualAsset = {
  id: 'ames-condition-number-sensitivity-video',
  type: 'manim-video',
  title: copy('条件数：小扰动为何被放大', 'Conditioning: why small perturbations can be amplified'),
  assetPath: '/manim/numerical-methods/condition-number-sensitivity.mp4',
  posterPath: '/manim/numerical-methods/condition-number-sensitivity-poster.png',
  transcript: copy(
    `方程残差接近零，不代表问题对输入变化不敏感。求解准确性和问题本身的条件是两件事。

未缩放 Ames 设计矩阵的 2-范数条件数是 13044.220254；标准化后降到 3.222571。椭圆只用于表示高维方向的拉伸差异，不按实际尺度。标准化改善单位尺度，却不会增加信息或消除真实共线性。

因为 \(\kappa_2(X)=\sigma_{max}/\sigma_{min}\)，对满列秩矩阵有 \(\kappa_2(X^TX)=\kappa_2(X)^2\)。本例 \(3.222571^2\approx10.384962\)。

诊断场景复制标准化居住面积列并加入 \(10^{-4}\) 级固定扰动；它不写回下载 CSV。条件数随之升到 26644.503135。相对目标扰动 \(10^{-5}\) 导致系数相对变化 0.00329613，本次观察到 329.613418 倍放大。329.613418 是这次具体扰动的观察值，不是条件数。

在 2×2 场景中，同一个 \(A=[[1,1],[1,1.0001]]\) 的条件数约为 40002。右端项从 \([2,2.0001]^T\) 变为 \([2,2.0002]^T\)，唯一解便从 \([1,1]^T\) 变为 \([0,2]^T\)。这是两个相邻系统，不是同一个右端项凭空出现两个解；它们各自的残差都接近零。

实际处理包括缩放、删除或重参数化重复特征、增加有效信息和正则化。单纯提高浮点精度，补不回近重复特征缺少的可辨识信息。`,
    `A nearly zero equation residual does not imply low sensitivity to input changes. Computational accuracy and problem conditioning are different ideas.

The raw Ames design has 2-norm condition number 13044.220254; after standardization it falls to 3.222571. The ellipse only sketches high-dimensional directional stretch and is not drawn to scale. Standardization improves unit scale, but it does not add information or remove genuine collinearity.

Since the 2-norm condition number is sigma-max over sigma-min, a full-column-rank matrix satisfies kappa of X-transpose X equals kappa of X squared. Here, 3.222571 squared is approximately 10.384962.

A diagnostic scenario copies standardized living area and adds a fixed perturbation of order ten to the minus four. This column is never written back to the downloadable CSV. The condition number rises to 26644.503135. A relative target perturbation of ten to the minus five produces a relative coefficient change of 0.00329613, an observed amplification of 329.613418. That observed value is not the condition number.

For the same 2-by-2 matrix A with entries [[1,1],[1,1.0001]], changing the right-hand side from [2,2.0001] to [2,2.0002] changes the unique solution from [1,1] to [0,2]. These are two neighboring systems, not two solutions to one unchanged right-hand side, and each has a near-zero residual.

Useful responses include scaling, removing or reparameterizing duplicate features, collecting more informative data, and regularization. Extra floating-point precision cannot restore identifiability lost through near duplication.`,
  ),
  learningPurpose: copy(
    '区分小残差与低敏感性，并用缩放、Gram 平方效应和近重复特征诊断解释条件数。',
    'Separate small residuals from low sensitivity and explain conditioning through scaling, Gram squaring, and a near-duplicate diagnostic.',
  ),
  alt: copy(
    '原始、标准化和近重复设计矩阵的条件数依次对比；橙框说明 329.613418 是观察放大而非条件数，下方两个相邻右端得到明显不同的解。',
    'Raw, standardized, and near-duplicate designs are compared; an orange callout distinguishes 329.613418 observed amplification from the condition number, and nearby right-hand sides produce different solutions.',
  ),
  caption: copy(
    '条件数描述输入到解的敏感性；小残差不能保证解对输入扰动稳定。',
    'Conditioning describes input-to-solution sensitivity; a small residual does not guarantee stability under perturbations.',
  ),
}

function section(
  id: string,
  title: LocalizedCopy,
  content: LocalizedCopy,
): MathLabSection {
  return { id, level: 2, title, content }
}

function tocFor(sectionDefinition: MathLabSection): MathLabTocItem {
  return {
    id: sectionDefinition.id,
    level: sectionDefinition.level,
    title: sectionDefinition.title,
  }
}

function insertAfterOpening<T>(items: readonly T[], additions: readonly T[]): T[] {
  if (!items.length) return [...additions]
  return [items[0]!, ...additions, ...items.slice(1)]
}

function keepFirstLabPlacement(sections: readonly MathLabSection[]): MathLabSection[] {
  const seen = new Set<string>()
  return sections.map((item) => {
    const labIds = item.labIds?.filter((labId) => {
      if (seen.has(labId)) return false
      seen.add(labId)
      return true
    })
    return labIds?.length === item.labIds?.length
      ? item
      : { ...item, labIds: labIds?.length ? labIds : undefined }
  })
}

const leastSquaresSections = [
  {
    ...section(
      'ames-least-squares-problem-frame',
      copy('Ames 案例：先把业务问题翻译成矩阵', 'Ames case: translate the modeling question into a matrix'),
      copy(
      `本章不从一条抽象直线开始，而从 2,927 套房屋的固定数值快照开始。目标是成交价 \\(y\\)，默认特征依次为整体质量、地面以上居住面积、地下室面积、车库面积和售出时房龄。记录序号只负责固定行顺序，不进入模型。

五个特征的单位差别很大：质量是 1–10 分，面积以平方英尺计，房龄以年计。若直接把原值放进矩阵，列长度主要反映单位，而不只反映信息。因此 Notebook 对每个特征使用 \\(z_j=(x_j-\\mu_j)/s_j\\) 标准化，再添加截距列：

$$X=[\\mathbf 1,z_{quality},z_{living},z_{basement},z_{garage},z_{age}]\\in\\mathbb R^{2927\\times6}.$$

房价除以 1,000，以“千美元”为计算单位。这只改变系数显示尺度，不改变哪组预测最小化平方误差。矩阵的每一行仍对应一套房，每一列仍对应一个明确特征，\\(X\\beta\\) 的每一项就是一套房的价格预测。

先做 shape 核对：\\(X\\) 是 \\(2927\\times6\\)，\\(\\beta\\) 是 \\(6\\times1\\)，所以预测向量是 \\(2927\\times1\\)。如果这里把样本轴和特征轴颠倒，后续公式即使能够运行，也已经不再表达原问题。`,
      `This chapter begins with a fixed numeric snapshot of 2,927 homes rather than an abstract line. The target is sale price \\(y\\); the default features are overall quality, above-ground living area, basement area, garage area, and age at sale. The row identifier fixes ordering and never enters the model.

The features use incompatible units, so the Notebook standardizes each column with \\(z_j=(x_j-\\mu_j)/s_j\\) before adding an intercept:

$$X=[\\mathbf 1,z_{quality},z_{living},z_{basement},z_{garage},z_{age}]\\in\\mathbb R^{2927\\times6}.$$

Price is divided by 1,000 and expressed in thousands of dollars. This changes coefficient display units, not which prediction minimizes squared error. Each row remains one home and each column remains one interpretable feature.

Check shapes first: \\(X\\) is \\(2927\\times6\\), \\(\\beta\\) is \\(6\\times1\\), and the prediction is \\(2927\\times1\\). Reversing sample and feature axes would change the mathematical problem even if some code still ran.`,
      ),
    ),
    visualIds: [routeOverviewVisual.id],
  },
  section(
    'ames-least-squares-output-reading',
    copy('读输出：系数、误差与正交性分别回答什么', 'Read the output: coefficients, error, and orthogonality answer different questions'),
    copy(
      `库基准得到秩 \\(6\\)，说明这六列在当前容差下没有精确线性依赖。截距约为 180.84 千美元；因为五个数值特征都已中心化，截距正好对应“各特征位于样本均值”的基准房屋，而不是“所有原始特征都等于零”的虚构房屋。

标准化后的系数按“特征增加一个总体标准差”解释：整体质量约增加 28.88 千美元，居住面积约增加 26.78 千美元，房龄约减少 10.01 千美元。它们是控制其他已列特征后的线性关联，不是因果效应，也不应跨数据集直接比较。

RMSE 为 35.83 千美元，MAE 为 23.87 千美元，\\(R^2\\) 约为 0.7988。三者没有谁能单独概括模型：RMSE 更强调大误差，MAE 更接近典型绝对偏差，\\(R^2\\) 描述相对“只报均价”的方差改进。这里保留它们，是为了把数值求解结果重新连接到模型行为，而不是把求解器误差与预测误差混为一谈。

最关键的数值检查是 \\(X^Tr\\) 的最大绝对分量约为 \\(3.726\\times10^{-10}\\)。它说明残差几乎与每个设计矩阵列正交，符合最小二乘一阶条件。逐行形成正规方程的解与 lstsq 解最大只差 \\(2.888\\times10^{-12}\\)，在这个经过缩放的案例中两条路径对齐；后面的条件数章节会解释为什么这不等于“正规方程永远安全”。`,
      `The library baseline has rank \\(6\\), so the six columns have no exact linear dependency at the chosen tolerance. The intercept is about 180.84 kUSD. Because all five numeric features are centered, it describes a home at the sample mean rather than an imaginary home with every raw feature equal to zero.

Each standardized coefficient means “one population standard deviation higher while the listed features are held fixed”: overall quality contributes about 28.88 kUSD, living area about 26.78 kUSD, and age about -10.01 kUSD. These are conditional linear associations, not causal effects.

RMSE is 35.83 kUSD, MAE is 23.87 kUSD, and \\(R^2\\) is about 0.7988. RMSE emphasizes large misses, MAE describes typical absolute deviation, and \\(R^2\\) compares against predicting the mean. None is a solver-accuracy metric.

The strongest numerical check is that the largest component of \\(X^Tr\\) is about \\(3.726\\times10^{-10}\\): the residual is nearly orthogonal to every design column. The explicit normal-equation solution and lstsq differ by only \\(2.888\\times10^{-12}\\) here, but the conditioning lesson will show why that does not make normal equations universally safe.`,
    ),
  ),
]

const luSections = [
  {
    ...section(
      'ames-lu-normal-system-bridge',
      copy('承接上一章：为什么这里出现 6×6 方阵', 'Carry the prior lesson forward: why a 6×6 square matrix appears'),
      copy(
      `最小二乘原问题有 2,927 条方程和 6 个未知系数，并不是方阵系统。把一阶条件写成 \\(X^T(X\\beta-y)=0\\) 后，才得到

$$G\\beta=c,\\qquad G=X^TX\\in\\mathbb R^{6\\times6},\\quad c=X^Ty\\in\\mathbb R^6.$$

这就是 LU 在本案例中的入口。\\(G\\) 汇总了特征列之间的内积，\\(c\\) 汇总了每个特征与目标之间的内积。它们不是另一份数据；它们是上一章同一设计矩阵的压缩结果。

手写实现使用部分主元选择。第 \\(k\\) 列中，从第 \\(k\\) 行向下寻找绝对值最大的候选主元；必要时交换 \\(U\\)、置换矩阵 \\(P\\)，以及 \\(L\\) 中已经完成的列。最终不变量是 \\(PG=LU\\)，而不是在发生换行后仍写 \\(G=LU\\)。

完成分解后先做前代 \\(Lz=Pc\\)，再做回代 \\(U\\beta=z\\)。不要显式计算 \\(L^{-1}\\) 或 \\(U^{-1}\\)：三角求解直接利用零结构，操作更少，也避免把逆矩阵舍入误差带入后续乘法。`,
      `The original least-squares problem has 2,927 equations and six unknown coefficients; it is not square. The first-order condition creates

$$G\\beta=c,\\qquad G=X^TX\\in\\mathbb R^{6\\times6},\\quad c=X^Ty\\in\\mathbb R^6.$$

That square normal system is where LU enters this case. \\(G\\) summarizes inner products among design columns, while \\(c\\) summarizes feature-target inner products. They are compressed views of the same design matrix, not a new dataset.

The manual implementation uses partial pivoting. At column \\(k\\), it selects the largest absolute candidate below the diagonal and consistently swaps \\(U\\), \\(P\\), and the already-computed part of \\(L\\). The invariant is \\(PG=LU\\), not \\(G=LU\\) after row swaps.

After factorization, solve \\(Lz=Pc\\) and then \\(U\\beta=z\\). Explicit inverses are unnecessary: triangular solves exploit zeros directly and avoid introducing an extra inverse-and-multiply step.`,
      ),
    ),
    visualIds: [routeOverviewVisual.id],
  },
  section(
    'ames-lu-reuse-and-checks',
    copy('分解复用与三层检查', 'Factor reuse and three levels of checks'),
    copy(
      `如果保留同一组房屋和同一组特征，只把目标从 sale_price 改为 log(sale_price)，左侧 \\(G=X^TX\\) 不变，只有右端项从 \\(X^Ty\\) 变成 \\(X^T\\log y\\)。因此可以复用一次 LU 分解。这正是分解比“一行 solve”更值得单独学习的工程原因：多个目标、多输出回归、迭代算法中的重复线性化，都会反复遇到相同左侧矩阵。

页面输出给出三层检查。第一层是分解检查 \\(\\|PG-LU\\|_\\infty=4.547\\times10^{-13}\\)，确认手写因子确实重建了置换后的矩阵。第二层是求解检查 \\(\\|G\\beta-c\\|_\\infty=1.455\\times10^{-11}\\)，确认系数代回线性系统后残差很小。第三层是实现对照：手写 LUP 与 SciPy 最大差 \\(7.105\\times10^{-15}\\)，LU 解与上一章 lstsq 系数最大差 \\(1.918\\times10^{-13}\\)。

这三层不能互相替代。分解残差小，不保证前代回代没有索引错误；线性系统残差小，不保证原问题条件良好；两种实现一致，也可能只是共同解决了一个敏感问题。下一章会把“算得对”与“问题是否稳定”明确分开。`,
      `If the homes and features stay fixed while the target changes from sale_price to log(sale_price), the left side \\(G=X^TX\\) stays fixed; only the right-hand side changes from \\(X^Ty\\) to \\(X^T\\log y\\). One factorization can therefore be reused. Multi-output regression and repeated linearizations make this reuse practically important.

The output reports three checks. First, \\(\\|PG-LU\\|_\\infty=4.547\\times10^{-13}\\) verifies the factors reconstruct the permuted matrix. Second, \\(\\|G\\beta-c\\|_\\infty=1.455\\times10^{-11}\\) verifies the solution satisfies the square system. Third, the manual and SciPy LUP solutions differ by only \\(7.105\\times10^{-15}\\), while LU and the preceding lstsq coefficients differ by \\(1.918\\times10^{-13}\\).

These checks are not interchangeable. A small factorization residual cannot rule out a substitution bug; a small solve residual cannot prove the problem is well-conditioned; two implementations can agree while solving an intrinsically sensitive system. The next lesson separates computational correctness from problem sensitivity.`,
    ),
  ),
]

const conditionSections = [
  {
    ...section(
      'ames-conditioning-scale-first',
      copy('先看尺度：同一信息为何得到不同条件数', 'Start with scale: why the same information yields different conditioning'),
      copy(
      `未缩放设计矩阵同时包含截距 1、质量评分、数百到数千平方英尺的面积，以及数十年的房龄。它的 2-范数条件数约为 13,044。标准化五个特征后，条件数降到约 3.223。数据行、目标和每列携带的信息没有改变；改变的是坐标轴使用的单位。

几何上，设计矩阵把单位球映射成椭球。最大奇异值对应拉伸最大的方向，最小奇异值对应最薄的方向，\\(\\kappa_2=\\sigma_{max}/\\sigma_{min}\\) 就是两者之比。标准化不能消除真正的共线性，但能先去掉“平方米还是平方英尺”这类纯单位造成的病态。

标准化后的 \\(X\\) 条件数约为 3.222571；它的 Gram 矩阵 \\(X^TX\\) 条件数约为 10.384962，正好接近 \\(3.222571^2\\)。原因是 \\(X^TX\\) 的奇异值（对实矩阵也是特征值）是 \\(X\\) 奇异值的平方。形成正规方程既把长方形问题变成方阵，也把尺度方向之间的差距平方了。

所以工程默认通常直接使用 QR、SVD 或库中的 lstsq，而不是先形成 \\(X^TX\\)。本课程仍计算正规方程，是为了把最小二乘、LU 与条件数连成一条可观察的数值链。`,
      `The unscaled design mixes an intercept of one, a 1–10 quality score, areas measured in hundreds or thousands of square feet, and ages measured in years. Its 2-norm condition number is about 13,044. Standardizing the five features lowers it to about 3.223. Rows, targets, and information stay the same; only coordinate units change.

Geometrically, the design maps a unit sphere to an ellipsoid. The largest singular value gives the widest stretch, the smallest gives the thinnest direction, and \\(\\kappa_2=\\sigma_{max}/\\sigma_{min}\\) compares them. Standardization cannot remove real collinearity, but it removes instability caused only by unit choice.

The standardized \\(X\\) has condition number 3.222571; \\(X^TX\\) has condition number 10.384962, approximately \\(3.222571^2\\). Forming normal equations therefore squares the disparity among directions.

Production code usually prefers QR, SVD, or a library lstsq instead of forming \\(X^TX\\). We compute the normal system here because it makes the least-squares → LU → conditioning chain directly observable.`,
      ),
    ),
    visualIds: [routeOverviewVisual.id],
  },
  section(
    'ames-conditioning-diagnostic-scenario',
    copy('诊断场景：近重复特征怎样让系数失去稳定解释', 'Diagnostic scenario: how a near-duplicate feature destabilizes coefficients'),
    copy(
      `为了单独观察共线性，Notebook 复制标准化居住面积列，并加入幅度为 \\(10^{-4}\\) 的确定性微扰。这个近重复列明确属于诊断场景，不写回 CSV。加入后设计矩阵条件数从约 3.223 跳到约 26,644，说明模型几乎无法区分“原居住面积列”和“近副本”各自应该承担多少系数。

沿最敏感方向给目标加入相对大小 \\(10^{-5}\\) 的微小扰动，系数向量的相对变化约为 0.003296，观察到约 329.61 倍放大。预测值未必同样剧烈变化，因为两个近重复特征可以交换系数、同时保持它们的合成贡献。这就是为什么病态回归中“单个系数的故事”可能不稳定，而总体预测仍看似正常。

可手算的 2×2 场景进一步分开残差与解误差：

$$A=\\begin{bmatrix}1&1\\\\1&1.0001\\end{bmatrix},\\qquad \\kappa_2(A)\\approx40002.$$

把右端项从 \\([2,2.0001]^T\\) 轻微改为 \\([2,2.0002]^T\\)，解从 \\([1,1]^T\\) 变为约 \\([0,2]^T\\)。两个解都能把各自右端项拟合得很好；问题在于矩阵的两列几乎平行。残差回答“这个解是否满足当前方程”，条件数才帮助回答“输入轻微变化时解是否可靠”。

实际建模时应回到特征定义：删除重复列、重参数化、增加数据或使用正则化。单纯把浮点精度从 64 位提高，并不能修复信息本身几乎重复的问题。`,
      `To isolate collinearity, the Notebook copies standardized living area and adds a deterministic perturbation of amplitude \\(10^{-4}\\). This near-duplicate belongs only to the diagnostic scenario and is never written back to the CSV. The design condition number jumps from about 3.223 to about 26,644, so the model can barely decide how much coefficient weight belongs to the original column versus its near-copy.

A relative target perturbation of \\(10^{-5}\\) along the most sensitive direction produces a relative coefficient change of about 0.003296—roughly 329.61× amplification. Predictions may move much less because near-duplicate features can trade coefficient mass while preserving their combined contribution. Individual coefficient stories can therefore be unstable even when predictions look acceptable.

The hand-checkable 2×2 case separates residual from solution error:

$$A=\\begin{bmatrix}1&1\\\\1&1.0001\\end{bmatrix},\\qquad \\kappa_2(A)\\approx40002.$$

Changing the right-hand side from \\([2,2.0001]^T\\) to \\([2,2.0002]^T\\) changes the solution from \\([1,1]^T\\) to about \\([0,2]^T\\). Both solutions satisfy their current systems closely; the sensitivity comes from nearly parallel columns. Residual asks whether a solution fits the current equation, while condition number asks whether the solution is reliable under small input changes.

Practical responses include removing duplicates, reparameterizing, collecting more informative data, or regularizing. Merely increasing floating-point precision cannot repair nearly duplicated information.`,
    ),
  ),
]

const enhancementById: Record<string, {
  sections: MathLabSection[]
  objective: LocalizedCopy
  connection: LocalizedCopy
  animation: VisualAsset
  animationSectionId: string
}> = {
  'least-squares-fitting': {
    sections: leastSquaresSections,
    animation: leastSquaresProjectionAnimation,
    animationSectionId: 'ames-least-squares-output-reading',
    objective: copy(
      '能把 Ames Housing 数值表写成带截距的标准化设计矩阵，并区分拟合误差、求解误差与残差正交检查。',
      'Form the standardized Ames Housing design with an intercept and distinguish predictive error, solve error, and residual orthogonality checks.',
    ),
    connection: copy(
      'Ames 房价回归：特征矩阵 → 最小二乘系数 → 可解释的固定输出。',
      'Ames price regression: feature matrix → least-squares coefficients → reproducible interpreted output.',
    ),
  },
  'lu-decomposition': {
    sections: luSections,
    animation: lupFactorReuseAnimation,
    animationSectionId: 'ames-lu-reuse-and-checks',
    objective: copy(
      '能从最小二乘正规方程识别 6×6 线性系统，并用带部分主元的 LUP 分解复用多个右端项。',
      'Recognize the 6×6 normal system from least squares and reuse a partial-pivoting LUP factorization across right-hand sides.',
    ),
    connection: copy(
      '同一 Ames Gram 矩阵：分解一次，分别求解原房价与对数房价目标。',
      'One Ames Gram matrix: factor once, then solve price and log-price targets.',
    ),
  },
  'condition-numbers': {
    sections: conditionSections,
    animation: conditionNumberSensitivityAnimation,
    animationSectionId: 'ames-conditioning-diagnostic-scenario',
    objective: copy(
      '能比较原始、标准化和近共线设计的条件数，并解释小残差为何不保证系数稳定。',
      'Compare raw, standardized, and near-collinear design conditioning and explain why a small residual does not guarantee stable coefficients.',
    ),
    connection: copy(
      'Ames 回归稳定性：单位缩放、正规方程平方效应与近重复特征诊断。',
      'Ames regression stability: unit scaling, normal-equation squaring, and near-duplicate feature diagnostics.',
    ),
  },
}

export function enhanceAmesNumericalMethodsModule(moduleDefinition: MathLabModule): MathLabModule {
  const enhancement = enhancementById[moduleDefinition.id]
  if (!enhancement) return moduleDefinition

  const enhancedSections = enhancement.sections.map((item) => item.id === enhancement.animationSectionId
    ? { ...item, visualIds: [...(item.visualIds ?? []), enhancement.animation.id] }
    : item)
  const sections = keepFirstLabPlacement(insertAfterOpening(moduleDefinition.sections, enhancedSections))
  const toc = insertAfterOpening(moduleDefinition.toc, enhancement.sections.map(tocFor))

  return {
    ...moduleDefinition,
    estimatedMinutes: 70,
    learningObjectives: [enhancement.objective, ...moduleDefinition.learningObjectives],
    aiModelConnections: [enhancement.connection, ...moduleDefinition.aiModelConnections],
    visuals: [routeOverviewVisual, enhancement.animation, ...moduleDefinition.visuals],
    sections,
    toc,
    importedAssetPaths: [
      ...(moduleDefinition.importedAssetPaths ?? []),
      '/datasets/numerical-methods/ames-housing-numeric.csv',
      '/notebooks/numerical-methods/ames-housing-numerical-methods.zh-CN.ipynb',
      '/notebooks/numerical-methods/requirements.txt',
      routeOverviewVisual.assetPath!,
      enhancement.animation.assetPath!,
      enhancement.animation.posterPath!,
    ],
  }
}
