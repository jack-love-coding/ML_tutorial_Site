import type {
  LocalizedCopy,
  MathConcept,
  MathLabModule,
  MathLabSection,
} from '../types/mathLab.ts'
import { linearAlgebraRouteModules } from './linearAlgebraRouteModules.ts'
import { minimumFoundationMathToCodeModules } from './minimumFoundationModules.ts'

const md = String.raw
const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

function section(
  id: string,
  zhTitle: string,
  enTitle: string,
  zhContent: string,
  enContent: string,
  placements: Pick<MathLabSection, 'visualIds' | 'labIds'> = {},
): MathLabSection {
  return {
    id,
    level: 2,
    title: copy(zhTitle, enTitle),
    content: copy(zhContent, enContent),
    ...placements,
  }
}

function withToc(moduleDefinition: MathLabModule): MathLabModule {
  return {
    ...moduleDefinition,
    toc: moduleDefinition.sections.map(({ id, level, title }) => ({ id, level, title })),
  }
}

function withConceptCode(
  concepts: readonly MathConcept[],
  conceptId: string,
  codeExample: string,
  output: string,
): MathConcept[] {
  return concepts.map((concept) => concept.id === conceptId
    ? { ...concept, codeExample, codeOutput: copy(output, output) }
    : concept)
}

function mergeById<T extends { id: string }>(...groups: ReadonlyArray<readonly T[]>): T[] {
  const merged = new Map<string, T>()
  for (const group of groups) {
    for (const item of group) if (!merged.has(item.id)) merged.set(item.id, item)
  }
  return [...merged.values()]
}

function sourceModule(id: string): MathLabModule {
  const moduleDefinition = linearAlgebraRouteModules.find((candidate) => candidate.id === id)
  if (!moduleDefinition) throw new Error(`Missing linear algebra source module: ${id}`)
  return moduleDefinition
}

const profileCode = md`import numpy as np

axis_names = ["algebra", "python", "probability"]
profile_names = ["query", "same_direction", "nearby"]
profiles = np.array([
    [2.0, 1.0, 0.0],
    [4.0, 2.0, 0.0],
    [2.0, 1.0, 1.0],
])

if profiles.ndim != 2 or profiles.shape[1] != len(axis_names):
    raise ValueError("every profile must follow the same feature schema")
if not np.isfinite(profiles).all():
    raise ValueError("profiles must be finite")

query = profiles[0]
change_to_nearby = profiles[2] - query
print("profile_names =", profile_names)
print("profiles.shape =", profiles.shape)
print("query =", query.tolist())
print("nearby - query =", change_to_nearby.tolist())`

const profileOutput = 'profile_names = [\'query\', \'same_direction\', \'nearby\']\nprofiles.shape = (3, 3)\nquery = [2.0, 1.0, 0.0]\nnearby - query = [0.0, 0.0, 1.0]'

const distanceCode = md`import numpy as np

query = np.array([2.0, 1.0, 0.0])
candidates = {
    "same_direction": np.array([4.0, 2.0, 0.0]),
    "nearby": np.array([2.0, 1.0, 1.0]),
}

def euclidean(a: np.ndarray, b: np.ndarray) -> float:
    if a.shape != b.shape or not np.isfinite(a).all() or not np.isfinite(b).all():
        raise ValueError("vectors need equal shapes and finite values")
    return float(np.linalg.norm(a - b))

def cosine(a: np.ndarray, b: np.ndarray) -> float:
    denominator = float(np.linalg.norm(a) * np.linalg.norm(b))
    if denominator == 0.0:
        raise ValueError("cosine is undefined for a zero vector")
    return float(a @ b / denominator)

for name, candidate in candidates.items():
    print(
        name,
        "distance =", round(euclidean(query, candidate), 6),
        "cosine =", round(cosine(query, candidate), 6),
    )`

const distanceOutput = 'same_direction distance = 2.236068 cosine = 1.0\nnearby distance = 1.0 cosine = 0.912871'

const batchCode = md`import numpy as np

profiles = np.array([
    [2.0, 1.0, 0.0],
    [4.0, 2.0, 0.0],
    [2.0, 1.0, 1.0],
])
weights = np.array([0.6, 0.3, 0.1])
bias = 0.2

if profiles.ndim != 2 or weights.ndim != 1:
    raise ValueError("profiles must be 2D and weights must be 1D")
if profiles.shape[1] != weights.shape[0]:
    raise ValueError("the feature axis must match the weight axis")

contributions = profiles * weights
scores = profiles @ weights + bias
print("profiles.shape =", profiles.shape)
print("weights.shape =", weights.shape)
print("first contributions =", contributions[0].tolist())
print("scores =", scores.tolist())
print("scores.shape =", scores.shape)`

const batchOutput = 'profiles.shape = (3, 3)\nweights.shape = (3,)\nfirst contributions = [1.2, 0.3, 0.0]\nscores = [1.7, 3.2, 1.8]\nscores.shape = (3,)'

const rankCode = md`import numpy as np

W = np.array([
    [1.0, 2.0, 0.0],
    [0.0, 0.0, 1.0],
])
query = np.array([2.0, 1.0, 0.0])
null_direction = np.array([-2.0, 1.0, 0.0])
shifted_query = query + null_direction

rank = int(np.linalg.matrix_rank(W))
singular_values = np.linalg.svd(W, compute_uv=False)
print("rank =", rank)
print("singular_values =", np.round(singular_values, 6).tolist())
print("W @ null_direction =", (W @ null_direction).tolist())
print("query output =", (W @ query).tolist())
print("shifted_query =", shifted_query.tolist())
print("shifted output =", (W @ shifted_query).tolist())`

const rankOutput = 'rank = 2\nsingular_values = [2.236068, 1.0]\nW @ null_direction = [0.0, 0.0]\nquery output = [4.0, 0.0]\nshifted_query = [0.0, 2.0, 0.0]\nshifted output = [4.0, 0.0]'

const featureSharedSection = section(
  'v3-vector-shared-profiles',
  '共同案例：三个学习资源画像进入同一特征空间',
  'Shared Case: Three Learning Profiles Enter One Feature Space',
  md`四章都使用三个三维画像。坐标顺序固定为“代数、Python、概率”的相对活动强度：查询画像 q = [2,1,0]，同方向画像 s = [4,2,0]，邻近画像 n = [2,1,1]。这些数值已经经过同一套尺度处理，因此三个轴可以放进同一个比较任务；如果第一个值是分钟、第二个值是人民币、第三个值是类别编号，就不能直接照搬本章的距离与点积。

向量首先是一份有顺序的数据合同。[2,1,0] 本身不会告诉代码每个位置的含义，轴名称、预处理方式和单位必须随数据一起保存。把坐标顺序改成“概率、代数、Python”却继续使用原来的权重，shape 仍然是 (3,)，程序也会运行，但计算已经回答了另一个问题。

三个画像按行堆叠为 P ∈ R^(3×3)。这里第一条轴数对象，第二条轴数特征。单个画像 P[0] 的 shape 是 (3,)；批次 P 的 shape 是 (3,3)。这一章先理解每一行是什么，后两章再比较各行并批量变换它们。`,
  md`All four chapters use three three-dimensional profiles. Coordinate order is fixed as relative activity in algebra, Python, and probability: query profile q = [2,1,0], same-direction profile s = [4,2,0], and nearby profile n = [2,1,1]. The values already share one scaling contract, so their axes can participate in one comparison. If the first value were minutes, the second currency, and the third a category code, the distance and dot-product calculations in this route could not be copied blindly.

A vector is first an ordered data contract. [2,1,0] does not tell code what each slot means; axis names, preprocessing, and units must travel with the values. Reordering the schema to probability, algebra, Python while keeping the old weights preserves shape (3,) and still runs, but it answers a different question.

Stack the three profiles by row into P ∈ R^(3×3). Axis 0 counts objects and axis 1 counts features. One profile P[0] has shape (3,); the batch P has shape (3,3). This chapter identifies each row, while the next two compare and transform the rows in batches.`,
  { visualIds: ['linear-algebra-feature-cards'], labIds: ['feature-vector-story-lab'] },
)

const featureScaleSection = section(
  'v3-vector-units-scaling',
  '单位、尺度与“能计算但不能解释”',
  'Units, Scaling, and Calculations That Run but Mean Nothing',
  md`设原始记录是“学习 120 分钟、答错 6 题、测验 80 分”。这三个数可以组成向量，因为它们属于同一个对象，但不能因为 shape 对齐就直接用欧氏长度决定谁“更接近”。80 分这一列的数值范围会自然压过 6 题；距离读到的可能只是量纲和尺度，而不是学习状态。

常见修复是先定义转换合同，例如把每列中心化并除以训练集标准差，或者依据业务上可解释的范围缩放。转换参数只能从训练数据得到，验证集和新样本必须复用同一参数。缩放之后得到的无量纲画像才适合进入本路线的相似度例子。

点积也要检查单位。若权重单位分别是“风险/代数强度、风险/Python 强度、风险/概率强度”，wᵀx 才得到统一的风险分数。若三个轴使用不同物理单位却没有对应权重解释，最终标量即使有限，也很难说明它代表什么。`,
  md`Suppose a raw record contains 120 study minutes, 6 mistakes, and a quiz score of 80. The values can form a vector because they belong to one object, but equal shape does not justify using Euclidean length to decide who is closer. The score column naturally has a larger numeric range than mistake count, so distance may mostly read units and scale rather than learning state.

A common repair is an explicit transformation contract, such as centering each column and dividing by its training-set standard deviation, or scaling by an interpretable business range. Transformation parameters must be learned from training data, then reused for validation and new examples. The resulting dimensionless profiles are suitable for the similarity example in this route.

Dot products also require a unit check. If weights have units of risk per algebra, Python, and probability activity, wᵀx produces one consistent risk score. If axes use unrelated physical units with no weight interpretation, the final scalar may be finite while having no defensible meaning.`,
)

const featureSummarySection = section(
  'v3-vector-summary',
  '本章小结：把同一批画像交给相似度',
  'Summary: Hand the Same Profiles to Similarity',
  md`现在应能完成四件事：为每个坐标写出名称与单位；区分一个 shape (3,) 的对象和 shape (3,3) 的批次；把差向量读成沿各特征轴发生的变化；说明为什么高维向量虽然画不出来，仍然可以做一致的加减、点积和比较。

下一章保持 q = [2,1,0]、s = [4,2,0]、n = [2,1,1] 不变。先作预测：哪一个画像离 q 的位置更近？哪一个方向更像？如果两个答案不同，不是计算矛盾，而是两个指标回答了不同问题。`,
  md`You should now be able to name every coordinate and unit, distinguish one object of shape (3,) from a batch of shape (3,3), read a difference vector as changes along feature axes, and explain why high-dimensional vectors still support consistent addition, dot products, and comparison even when they cannot be drawn.

The next chapter keeps q = [2,1,0], s = [4,2,0], and n = [2,1,1] fixed. Predict first: which profile is closer in position to q, and which points in a more similar direction? If the answers differ, the calculations are not contradictory; the metrics answer different questions.`,
  { visualIds: ['high-dimensional-embedding-search'] },
)

const distanceSharedSection = section(
  'v3-distance-shared-profiles',
  '同一组画像，两种完全合理的第一名',
  'The Same Profiles Produce Two Defensible Winners',
  md`查询画像是 q = [2,1,0]。候选 s = [4,2,0] 正好是 2q，所以夹角为零、cosine similarity 为 1；但它的终点离 q 有 √5 ≈ 2.236068。候选 n = [2,1,1] 只在概率轴上多 1，欧氏距离为 1；它的 cosine similarity 是 5/(√5×√6) ≈ 0.912871。

因此欧氏距离选择 nearby，cosine 选择 same_direction。距离回答“如果把向量看成坐标点，终点差多少”；cosine 回答“忽略整体长度后，比例方向有多一致”。一个学习资源系统若在乎当前活动量相近，距离更合适；若在乎主题比例一致而允许资源深度不同，cosine 更自然。

选择指标之前必须先写产品问题，不能在看到结果之后挑一个更顺眼的排序。`,
  md`The query is q = [2,1,0]. Candidate s = [4,2,0] is exactly 2q, so the angle is zero and cosine similarity is 1, but its endpoint is √5 ≈ 2.236068 away. Candidate n = [2,1,1] differs only by 1 on the probability axis, so Euclidean distance is 1, while cosine similarity is 5/(√5×√6) ≈ 0.912871.

Euclidean distance therefore selects nearby, while cosine selects same_direction. Distance asks how far the endpoints are when vectors are coordinates; cosine asks how aligned their proportions are after overall length is ignored. A learning-resource system that values similar activity volume may prefer distance, while one that values topic proportions across different depths may prefer cosine.

The product question must be written before the metric is chosen. Do not inspect rankings first and then select whichever metric looks more convenient.`,
  { visualIds: ['cosine-vs-distance-intuition'] },
)

const distanceOutputSection = section(
  'v3-distance-numpy-output',
  '用 NumPy 核对距离与 cosine 排序',
  'Verify Distance and Cosine Rankings with NumPy',
  md`代码把“可计算条件”写成显式检查：两个向量 shape 必须相同，所有元素必须有限，cosine 的两个 norm 都不能为零。零向量没有方向，因此不能为了让程序继续运行而随意返回 cosine 0；调用方应该决定是过滤空表示、回到原始数据，还是使用有明确定义的替代规则。

运行结果保留六位小数，使手算值、表格和代码输出可以逐项核对。这里的固定结果不是要求背诵，而是建立回归锚点：只要轴顺序、数值或归一化方法发生变化，排序就可能改变，测试应当立刻暴露这种变化。`,
  md`The code turns computability conditions into explicit checks: vector shapes must match, every value must be finite, and neither norm may be zero for cosine. A zero vector has no direction, so returning cosine 0 merely to keep a program running is not a neutral choice. The caller should decide whether to filter an empty representation, repair source data, or apply a documented alternative.

The output keeps six decimal places so hand calculations, tables, and code can be checked line by line. These fixed values are not facts to memorize. They are regression anchors: if axis order, values, or normalization changes, the ranking may change and a test should expose that change immediately.`,
  { visualIds: ['vector-distance-norm-intuition'] },
)

const distanceLedgerSection = section(
  'v3-distance-calculation-ledger',
  '逐项计算账本：差向量、长度、点积与夹角',
  'Calculation Ledger: Difference, Length, Dot Product, and Angle',
  md`先比较 q = [2,1,0] 与 same_direction = [4,2,0]。差向量是 [-2,-1,0]，平方贡献是 [4,1,0]，所以欧氏距离是 √(4+1) = √5。两个向量的 norm 分别是 √5 和 √20，点积是 2×4 + 1×2 = 10，因此 cosine = 10/(√5×√20) = 1。距离看见整体放大，cosine 则把这种放大完全消掉。

再比较 q 与 nearby = [2,1,1]。差向量是 [0,0,-1]，距离为 1；两个 norm 是 √5 和 √6，点积是 5，所以 cosine = 5/(√5×√6) ≈ 0.912871。附近画像在坐标位置上只移动一个单位，但方向不再与 q 完全一致。

把每一步写成账本很重要。若直接调用一个 similarity 函数，只看到最终 0.912871，很难发现是点积算错、norm 算错、轴顺序错，还是一个向量被意外归一化。手算账本给库函数提供独立核验路径。`,
  md`First compare q = [2,1,0] with same_direction = [4,2,0]. The difference is [-2,-1,0], squared contributions are [4,1,0], and Euclidean distance is √(4+1) = √5. Their norms are √5 and √20, and the dot product is 2×4 + 1×2 = 10, so cosine = 10/(√5×√20) = 1. Distance sees the overall scaling; cosine removes it completely.

Now compare q with nearby = [2,1,1]. The difference is [0,0,-1], so distance is 1. Their norms are √5 and √6, and dot product is 5, giving cosine = 5/(√5×√6) ≈ 0.912871. The nearby profile moves only one coordinate unit but no longer points in exactly the same direction as q.

Writing every intermediate matters. If a similarity helper returns only 0.912871, it is hard to tell whether the dot product, norm, axis order, or normalization is wrong. A hand calculation provides an independent verification path for the library call.`,
)

const distanceApplicationsSection = section(
  'v3-distance-application-boundaries',
  '应用边界：检索、KNN、聚类和异常检测在问不同问题',
  'Application Boundaries: Retrieval, KNN, Clustering, and Anomaly Detection',
  md`语义检索常用 cosine，是因为 embedding 的方向通常比整体长度更接近“主题比例”。但商品价格、地理坐标和传感器读数往往不能随意删除长度。KNN 使用什么距离，就会形成什么邻域；K-means 的均值更新与平方欧氏距离相配，不能把分配阶段换成 cosine 却仍假设同一优化目标；异常检测中的大 norm 可能本身就是异常信号，先做行归一化会把它消掉。

加权距离进一步把产品判断写进几何。例如将概率轴权重从 1 提高到 4，q 与 nearby 的加权距离会从 1 增加到 2，而 q 与 same_direction 的距离保持 √5。系统因此更不愿接受主题比例中出现新的概率内容。权重不是“让模型更聪明”的万能旋钮，它说明哪类偏差更贵。

指标选择至少记录三项：输入是否已经按列缩放；整体 magnitude 是否携带任务信息；线上排序和离线评估使用的是否是同一个指标。缺少其中任何一项，离线看似合理的相似度可能无法解释线上行为。`,
  md`Semantic retrieval often uses cosine because embedding direction is usually closer to topic proportions than overall length. Product prices, geographic coordinates, and sensor readings often cannot discard magnitude. The chosen KNN distance defines its neighborhoods. K-means mean updates match squared Euclidean distance, so assignment cannot be changed to cosine while pretending the optimization objective is unchanged. In anomaly detection, a large norm may itself be the anomaly signal, and row normalization would erase it.

Weighted distance writes product judgment into geometry. Raising the probability-axis weight from 1 to 4 increases the weighted distance between q and nearby from 1 to 2, while distance to same_direction remains √5. The system becomes less willing to accept new probability content in the topic profile. A weight is not a generic intelligence knob; it says which discrepancy is more expensive.

A metric decision should record at least three facts: whether columns were scaled, whether overall magnitude carries task information, and whether online ranking uses the same metric as offline evaluation. Without them, a similarity score that looks reasonable offline may not explain production behavior.`,
)

const distanceFailureSection = section(
  'v3-distance-failure-checklist',
  '失败检查表：一个相似度结果什么时候不可信',
  'Failure Checklist: When a Similarity Result Is Not Trustworthy',
  md`遇到意外排序时，按顺序检查：两个向量是否使用同一列顺序；类别编号是否被误当作连续数值；缺失值是否被静默填成 0；缩放参数是否只来自训练数据；是否出现零向量；浮点结果是否有限；排序方向是否写反——distance 越小越近，similarity 通常越大越像。

还要检查候选集合本身。即使 cosine 计算完全正确，如果 query 使用新版 embedding、文档仍使用旧版 embedding，两个坐标系就不再对齐；数值结果仍位于 [-1,1]，却没有可比语义。模型版本、预处理版本和向量维度应作为索引元数据一起保存。

最后用本章固定三向量做最小回归测试。只要 same_direction 的 cosine 不再是 1，或 nearby 的距离不再是 1，就应先停止解释线上排名，回到表示与计算合同排查。`,
  md`When a ranking looks surprising, check in order: whether both vectors share column order, whether category IDs were treated as continuous values, whether missing values silently became zero, whether scaling statistics came only from training data, whether either vector is zero, whether outputs are finite, and whether sort direction is reversed—smaller distance is closer, while larger similarity usually means more aligned.

Also inspect the candidate collection. Even if cosine is computed correctly, a query from a new embedding model cannot be compared meaningfully with documents from an old embedding space. The number remains in [-1,1] but has no aligned semantics. Model version, preprocessing version, and vector dimension should travel with index metadata.

Finally use the fixed three-profile example as a minimal regression test. If same_direction no longer has cosine 1 or nearby no longer has distance 1, stop interpreting production ranking and repair the representation or calculation contract first.`,
)

const distanceScaleSection = section(
  'v3-distance-scale-boundary',
  '归一化改变问题，不只是改善数值',
  'Normalization Changes the Question, Not Just the Numbers',
  md`把每个向量除以自己的 norm 后，所有非零向量都落到单位球面上。此时欧氏距离和 cosine 排序会建立单调关系，因为长度信息已经被删除。但这不是免费的“优化”：原始 norm 可能携带置信度、活跃度、文本长度或模型状态，归一化等于明确决定这些信息不参与比较。

另一类缩放是按列标准化，它改变不同特征轴的相对影响，却保留对象之间的总长度差。按行归一化和按列标准化解决的是不同问题。页面上看到 normalize 这个词时，应继续问：沿哪条轴？使用哪些统计量？这些统计量来自训练集还是整份数据？`,
  md`Dividing every nonzero vector by its own norm puts all vectors on the unit sphere. Euclidean distance and cosine then become monotonically related because length information has been removed. This is not a free numerical improvement: the original norm may encode confidence, activity, text length, or model state. Normalization is an explicit decision to exclude that information from comparison.

Column-wise standardization is different. It changes the relative influence of feature axes while preserving overall length differences between objects. Row normalization and column standardization answer different questions. Whenever a page says normalize, continue asking: along which axis, using which statistics, and were those statistics learned from training data or the full dataset?`,
)

const distanceSummarySection = section(
  'v3-distance-summary',
  '本章小结：从两两比较走向批量矩阵',
  'Summary: Move from Pairwise Comparison to a Batch Matrix',
  md`本章的结论不是“cosine 比距离更好”，而是：norm 描述一个向量的长度；欧氏距离描述两个终点之间的差向量长度；点积同时混合长度和方向；cosine 除去长度后只保留方向对齐；缩放和权重会改变比较几何。

下一章把三个画像按行组成 P ∈ R^(3×3)，用同一个权重向量一次得到三个分数。两两比较关注行与行的关系，矩阵计算则关注如何让一份规则沿样本轴批量执行。`,
  md`The conclusion is not that cosine is better than distance. A norm describes one vector's length; Euclidean distance describes the length of the difference between two endpoints; a dot product mixes length and direction; cosine removes length and keeps alignment; scaling and weights change the comparison geometry.

The next chapter stacks the three profiles by row into P ∈ R^(3×3) and applies one weight vector to produce three scores at once. Pairwise metrics compare rows with one another; matrix computation applies one rule across the sample axis.`,
)

const matrixSharedSection = section(
  'v3-matrix-shared-batch',
  '共同案例：三行画像一次产生三个分数',
  'Shared Case: Three Profile Rows Produce Three Scores',
  md`保持上一章的 q = [2,1,0]、s = [4,2,0]、n = [2,1,1]，按行堆成 P ∈ R^(3×3)，再固定 w = [0.6,0.3,0.1]、b = 0.2。批量规则是

$$
\mathbf{scores}=P\mathbf{w}+b=[1.7,3.2,1.8].
$$

第一行手算为 2×0.6 + 1×0.3 + 0×0.1 + 0.2 = 1.7。第二行和第三行使用同一参数，只替换样本行。矩阵写法没有创造新数学，它把三次相同的向量点积沿 axis 0 组织起来。

shape 账本必须写全：P:(3,3)、w:(3,)、P@w:(3,)、b:()、scores:(3,)。被收缩的是长度为 3 的特征轴，保留下来的是长度为 3 的样本轴。`,
  md`Keep q = [2,1,0], s = [4,2,0], and n = [2,1,1] from the previous chapter. Stack them by row into P ∈ R^(3×3), then fix w = [0.6,0.3,0.1] and b = 0.2. The batch rule is

$$
\mathbf{scores}=P\mathbf{w}+b=[1.7,3.2,1.8].
$$

The first row is 2×0.6 + 1×0.3 + 0×0.1 + 0.2 = 1.7. Rows two and three use the same parameters and replace only the example row. Matrix notation creates no new mathematics; it organizes three identical vector dot products along axis 0.

The complete shape ledger is P:(3,3), w:(3,), P@w:(3,), b:(), and scores:(3,). The feature axis of length 3 is contracted, while the sample axis of length 3 is preserved.`,
  { visualIds: ['matrix-column-combination-image'] },
)

const matrixReadingsSection = section(
  'v3-matrix-row-column-readings',
  '同一个乘法的两种读法：按行预测，按列混合',
  'Two Readings of One Product: Rows Predict, Columns Mix',
  md`按行读，P@w 是每个样本行与同一权重向量做点积，适合解释批量预测。按列读，P@w 是三个特征列按 0.6、0.3、0.1 加权后的组合，适合解释每一列如何贡献整批结果。

两种读法必须得到同一个 [1.5, 3.0, 1.6]，再广播标量 bias 0.2 得到 [1.7, 3.2, 1.8]。如果两种手算不一致，通常是行列语义、索引或转置出了问题，而不是矩阵乘法有两套答案。

本例恰好是方阵，错误转置后 shape 仍为 (3,3)，因此只看“能不能乘”无法发现语义错误。真实检查应同时包含轴名称、非方阵测试和一个可手算的小样本。`,
  md`Read by rows, P@w takes a dot product between every example row and the same weight vector, which explains batch prediction. Read by columns, P@w is a combination of three feature columns weighted by 0.6, 0.3, and 0.1, which explains how each column contributes to the entire batch.

Both readings must produce [1.5, 3.0, 1.6], followed by scalar bias 0.2 broadcasting to [1.7, 3.2, 1.8]. If the hand calculations differ, row/column semantics, indexing, or transposition is wrong; matrix multiplication does not have two answers.

This example happens to be square, so an accidental transpose still has shape (3,3). Shape compatibility alone cannot expose the semantic error. A robust check includes axis names, a non-square test, and one hand-checkable example.`,
  { visualIds: ['matrix-column-combination-video'] },
)

const matrixOutputSection = section(
  'v3-matrix-numpy-output',
  '运行输出：保留贡献表，而不只看最终 scores',
  'Runtime Output: Keep Contributions, Not Only Final Scores',
  md`代码同时打印第一行逐项贡献 [1.2, 0.3, 0.0] 和最终 scores。贡献表是最短的调试路径：若结果错误，可以先判断是某个特征—权重配对错误、求和错误，还是 bias 广播错误，而不必把整个矩阵表达式拆掉重写。

检查还明确拒绝二维权重 (3,1)。在部分表达式中，(3,3) @ (3,1) 会合法地产生 (3,1)，随后与 (3,) 相加可能广播成 (3,3)；程序没有异常，却把一个分数列复制成了分数表。约束权重必须是一维，是在保护本章“一行一个标量分数”的输出合同。`,
  md`The code prints both first-row contributions [1.2, 0.3, 0.0] and final scores. A contribution ledger is the shortest debugging path: when output is wrong, it separates feature-weight pairing, reduction, and bias broadcasting without requiring the whole matrix expression to be rewritten.

The guard also rejects a two-dimensional weight array of shape (3,1). Some expressions allow (3,3) @ (3,1) to produce (3,1), after which adding (3,) may broadcast to (3,3). No exception occurs, but one score column has become a score table. Requiring one-dimensional weights protects this chapter's contract of one scalar score per row.`,
)

const matrixSummarySection = section(
  'v3-matrix-summary',
  '本章小结：矩阵能批量变换，但不保证保留所有信息',
  'Summary: Matrices Transform Batches but Need Not Preserve Information',
  md`现在可以从三个视角读矩阵：数据视角把行看成样本、列看成特征；计算视角把矩阵乘向量看成批量点积或列向量线性组合；几何视角看基向量被送到哪里。bias 只负责平移，不能恢复已经被矩阵压掉的方向。

下一章把三维画像送入 W = [[1,2,0],[0,0,1]]。输出只剩两个坐标。问题不再是“代码能否计算”，而是：三维输入中的哪些变化仍能影响输出，哪些变化会被完全擦除？`,
  md`A matrix now has three readings: the data view treats rows as examples and columns as features; the computational view treats matrix-vector multiplication as batched dot products or a column combination; the geometric view follows where basis vectors are sent. Bias only translates output and cannot recover a direction already collapsed by the matrix.

The next chapter sends three-dimensional profiles through W = [[1,2,0],[0,0,1]], leaving only two output coordinates. The question is no longer whether code can calculate, but which input changes still affect output and which are erased completely.`,
  { visualIds: ['matrix-transform-video'] },
)

const rankSharedSection = section(
  'v3-rank-shared-map',
  '共同案例：三维画像被压成两个信号',
  'Shared Case: Three-Dimensional Profiles Become Two Signals',
  md`固定

$$
W=\begin{bmatrix}1&2&0\\0&0&1\end{bmatrix}.
$$

第一行把“代数强度 + 2×Python 强度”合成基础技能信号，第二行原样读取概率强度。输入 shape 是 (3,)，输出 shape 是 (2,)。三列分别是 [1,0]、[2,0]、[0,1]：前两列共线，第三列提供第二个独立方向，因此 rank 是 2，而不是 3。

column space 位于输出空间，表示所有可能输出。这里两条独立列方向能铺满 R²。rank 只数独立方向，不数列数、非零元素数或矩阵有多宽。`,
  md`Fix

$$
W=\begin{bmatrix}1&2&0\\0&0&1\end{bmatrix}.
$$

The first row combines algebra activity plus twice Python activity into a foundation signal, while the second row reads probability activity directly. Input shape is (3,) and output shape is (2,). The three columns are [1,0], [2,0], and [0,1]: the first two are collinear and the third adds a second independent direction, so rank is 2 rather than 3.

Column space lives in output space and contains every reachable output. Here two independent column directions span all of R². Rank counts independent directions, not columns, nonzero entries, or visual width.`,
  { visualIds: ['column-space-rank-image'], labIds: ['matrix-column-space-lab'] },
)

const rankNullSection = section(
  'v3-rank-null-calculation',
  '手算 null direction：不同输入为什么得到同一输出',
  'Calculate a Null Direction: Why Different Inputs Share One Output',
  md`取 d = [-2,1,0]。第一行计算 -2 + 2×1 = 0，第二行读取第三坐标 0，所以 W@d = [0,0]。这是一条真实的非零输入变化，却被矩阵完全擦除。

查询画像 q = [2,1,0] 的输出是 [4,0]。沿 null direction 移动一次得到 q + d = [0,2,0]，输出仍是 [4,0]。因此仅观察这个线性层的输出，无法判断原输入更偏代数还是更偏 Python；模型只保留了二者的一个加权总和。

rank-nullity 在这里给出 3 = 2 + 1：三维输入由两个可见方向和一个被擦除方向组成。这不是说现实数据刚好沿坐标轴分开，而是说明线性映射对信息保留能力有可计算的边界。`,
  md`Take d = [-2,1,0]. The first row computes -2 + 2×1 = 0, and the second reads third coordinate 0, so W@d = [0,0]. This is a real nonzero input change erased completely by the matrix.

Query profile q = [2,1,0] maps to [4,0]. Move once along the null direction to q + d = [0,2,0], and output remains [4,0]. From this linear layer's output alone, we cannot determine whether the original input emphasized algebra or Python; the model retained only one weighted total.

Rank-nullity gives 3 = 2 + 1: the three-dimensional input contains two visible directions and one erased direction. This does not claim that real data aligns with coordinate axes. It states a computable boundary on information preserved by the linear map.`,
  { visualIds: ['null-space-invisible-direction-image'] },
)

const rankColumnLedgerSection = section(
  'v3-rank-column-ledger',
  '列空间账本：输入坐标怎样组合可达输出',
  'Column-Space Ledger: How Input Coordinates Combine Reachable Outputs',
  md`把 W 的三列记为 c₁ = [1,0]、c₂ = [2,0]、c₃ = [0,1]。对任意输入 x = [x₁,x₂,x₃]，输出是 x₁c₁ + x₂c₂ + x₃c₃ = [x₁+2x₂, x₃]。这个展开直接说明：所有输出都是列向量的线性组合，因此一定落在 column space 中。

c₂ = 2c₁，没有增加新方向；c₃ 与它们独立，所以独立列方向数是 2。选择 c₁、c₃ 作为一组 basis 后，任意输出 [u,v] 都可以由输入 [u,0,v] 到达。column space 因此是整个二维输出平面，而不是输入所在的三维空间。

注意 basis 不唯一。也可以选择 c₂、c₃，只要两个方向独立，就能生成同一 column space。rank 描述空间维度，不负责指定唯一的一组代表列；在特征选择中，哪一列更值得保留还要考虑噪声、成本与可解释性。`,
  md`Name the three columns of W as c₁ = [1,0], c₂ = [2,0], and c₃ = [0,1]. For any input x = [x₁,x₂,x₃], output is x₁c₁ + x₂c₂ + x₃c₃ = [x₁+2x₂, x₃]. This expansion shows directly that every output is a linear combination of columns and must lie in the column space.

c₂ = 2c₁ adds no new direction; c₃ is independent, so there are two independent column directions. Choosing c₁ and c₃ as a basis, any output [u,v] is reached by input [u,0,v]. The column space is therefore the full two-dimensional output plane, not the three-dimensional input space.

The basis is not unique. c₂ and c₃ could also generate the same column space. Rank describes the dimension, not one uniquely preferred set of representative columns. Feature selection still needs noise, cost, and interpretability judgments.`,
)

const rankOneComparisonSection = section(
  'v3-rank-one-comparison',
  'rank-1 对照：二维输出怎样被压成一条线',
  'Rank-One Comparison: How a Two-Dimensional Output Collapses to a Line',
  md`对照矩阵 R = [[1,2,3],[2,4,6]]。第二行是第一行的两倍，三列也都沿 [1,2] 方向，因此任意输出都形如 [t,2t]。矩阵虽然有 6 个非零元素、3 列和 2 行，rank 仍然只有 1。非零数字多不等于独立方向多。

几何上，三维输入经过 R 后只能落在二维平面的一条直线上。数据压缩很强，但输出表达能力也受到限制。若任务只需要一个总活跃度信号，这可能足够；若任务必须分别表达“基础能力”和“概率能力”，rank-1 输出就无法完成。

与 W 对比：W 有两个非零奇异值，R 只有一个显著非零奇异值。奇异值不仅帮助计算 rank，还显示每个独立方向的尺度。下一阶段学习 SVD 时，会把这种“方向 + 强度”的结构完整拆开。`,
  md`Compare matrix R = [[1,2,3],[2,4,6]]. Its second row is twice the first, and every column points along [1,2], so every output has form [t,2t]. The matrix has six nonzero entries, three columns, and two rows, yet rank is only 1. More nonzero numbers do not mean more independent directions.

Geometrically, R sends a three-dimensional input into only one line in a two-dimensional output plane. Compression is strong, but expressive output capacity is limited. This may be enough for one total activity signal; it cannot separately express foundation ability and probability activity.

Compared with W, which has two nonzero singular values, R has only one significant nonzero singular value. Singular values help compute rank and show the scale of each independent direction. The later SVD stage will separate this direction-and-strength structure explicitly.`,
  { visualIds: ['rank-flattening-video'] },
)

const rankApplicationsSection = section(
  'v3-rank-application-boundaries',
  '应用边界：压缩、共线性与低秩模型不是同一个结论',
  'Application Boundaries: Compression, Collinearity, and Low-Rank Models',
  md`在线性回归中，设计矩阵列高度相关会让单个系数不稳定：训练数据稍有变化，权重可能大幅重新分配，但预测变化很小。这里的问题是参数解释和数值稳定性。正则化可以选择较稳定的参数，却不会凭空创造数据中缺失的独立信息。

在推荐和语言模型中，低秩分解可能是主动设计：把庞大用户—商品矩阵或权重矩阵近似为两个较窄矩阵，降低存储和计算，并提取主要潜在方向。这里低 rank 是压缩假设，需要通过重建误差和下游任务验证，而不是自动视为缺陷。

在神经网络瓶颈层中，减少维度意味着某些输入方向必然进入 null space。一个好的表示会尽量擦除噪声、保留任务相关变化；一个坏的表示可能把少数群体或稀有模式一起擦掉。因此 rank 分析最终要回到具体反例：哪些不同输入被映射成了同一输出，它们是否应该被区分？`,
  md`In linear regression, highly correlated design-matrix columns make individual coefficients unstable: a small data change can redistribute weights dramatically while predictions barely change. The problem concerns parameter interpretation and numerical stability. Regularization can select a more stable parameter vector, but it cannot create independent information absent from data.

In recommendation and language models, low-rank factorization may be intentional: approximate a large user-item or weight matrix with two narrow matrices to reduce storage and computation while extracting major latent directions. Here low rank is a compression assumption to validate with reconstruction error and downstream performance, not an automatic defect.

In a neural-network bottleneck, reducing dimension guarantees that some input directions enter the null space. A useful representation erases noise while preserving task-relevant changes; a harmful one may erase rare patterns or minority cases. Rank analysis must therefore return to a concrete counterexample: which distinct inputs map to the same output, and should the task distinguish them?`,
)

const rankOutputSection = section(
  'v3-rank-numpy-output',
  '用 NumPy 检查 rank、奇异值和不可见方向',
  'Check Rank, Singular Values, and an Invisible Direction with NumPy',
  md`代码同时打印 rank、奇异值、null residual 和两个输入的输出。matrix_rank 给出 2，奇异值 [2.236068, 1.0] 表示两个非零独立输出尺度；W @ null_direction 精确为零；两个不同画像产生相同输出。

真实浮点数据很少精确共线，因此数值 rank 依赖容差。一个很小但非零的奇异值可能来自测量噪声，也可能代表任务需要的稀有信息。不能只看 matrix_rank 的整数结果就自动删除特征；还要检查奇异值尺度、数据来源和下游任务。`,
  md`The code prints rank, singular values, a null residual, and outputs for two inputs. matrix_rank returns 2; singular values [2.236068, 1.0] show two nonzero independent output scales; W @ null_direction is exactly zero; and two different profiles produce the same output.

Real floating-point data is rarely exactly collinear, so numerical rank depends on tolerance. A small but nonzero singular value may be measurement noise or rare information the task needs. Do not delete features from the integer result of matrix_rank alone. Inspect singular-value scale, data provenance, and downstream purpose.`,
  { visualIds: ['null-space-collapse-video'] },
)

const rankFailureSection = section(
  'v3-rank-repeated-feature-failure',
  '重复特征、参数不可识别与模型盲区',
  'Duplicate Features, Unidentifiable Parameters, and Model Blind Spots',
  md`若设计矩阵两列完全重复，模型可以把一部分权重从第一列移到第二列而保持预测不变。此时不同参数向量代表同一个函数，参数不再唯一可识别。优化器仍可能返回一个有限答案，但单独解释某个重复特征的系数会很危险。

低 rank 也不总是失败。压缩层、低秩近似和 embedding 会主动减少方向，以更少维度保留主要结构。判断标准不是“rank 越大越好”，而是被删除的方向是否主要是噪声和重复，还是包含任务真正需要区分的信息。

诊断顺序应是：先核对矩阵 shape 与轴；再看列之间是否重复或近似线性组合；接着检查奇异值；最后用具体输入构造“变化了但输出没变”的反例。反例比只报告一个 rank 数字更能说明模型盲区。`,
  md`When two design-matrix columns are identical, a model can move weight from one column to the other while preserving every prediction. Different parameter vectors then represent the same function, so parameters are not uniquely identifiable. An optimizer may still return a finite answer, but interpreting one duplicate feature coefficient in isolation is dangerous.

Low rank is not always a failure. Compression layers, low-rank approximations, and embeddings deliberately reduce directions to preserve main structure in fewer dimensions. The criterion is not that larger rank is always better, but whether removed directions are mostly noise and duplication or information the task must distinguish.

A useful diagnostic order is: verify shape and axes, inspect duplicate or nearly dependent columns, examine singular values, then construct a concrete input change that leaves output unchanged. A counterexample explains a model blind spot more clearly than one integer rank value.`,
  { visualIds: ['rank-flattening-video'] },
)

const rankSummarySection = section(
  'v3-rank-summary',
  '本章小结：为线性系统与表示学习建立边界',
  'Summary: Establish Boundaries for Linear Systems and Representation Learning',
  md`四章主线到此闭合：向量用有序坐标表示对象；距离和 cosine 从不同几何角度比较对象；矩阵沿样本轴批量应用同一规则，并把输入方向混合到输出空间；column space 描述可达输出，rank 数独立方向，null space 描述被完全擦除的输入变化。

下一阶段进入最小二乘、eigen、SVD 与 PCA。最小二乘会问目标是否落在 column space，以及落不到时怎样投影；SVD 会把可见方向、尺度与近似 null direction 系统拆开；PCA 会讨论如何主动保留主要方向并压缩其余方向。`,
  md`The four-chapter thread is now closed: vectors represent objects with ordered coordinates; distance and cosine compare objects through different geometries; matrices apply one rule along the sample axis and mix input directions into output space; column space describes reachable outputs, rank counts independent directions, and null space describes input changes erased completely.

The next stage moves into least squares, eigenvectors, SVD, and PCA. Least squares asks whether a target lies in the column space and how to project when it does not. SVD separates visible directions, scales, and near-null directions. PCA asks how to preserve major directions intentionally while compressing the rest.`,
)

function enhanceFeatureSpace(moduleDefinition: MathLabModule): MathLabModule {
  const source = sourceModule(moduleDefinition.id)
  const sections = moduleDefinition.sections
    .filter(({ id }) => id !== 'vectors-practice' && id !== 'vectors-handoff')
    .flatMap((item) => item.id === 'vectors-recap'
      ? [item, featureSharedSection, featureScaleSection]
      : [item])
    .concat(featureSummarySection)
  return withToc({
    ...moduleDefinition,
    subtitle: copy(
      '用统一学习画像连接特征轴、单位、shape、差向量与高维表示。',
      'Use shared learning profiles to connect feature axes, units, shapes, difference vectors, and high-dimensional representations.',
    ),
    estimatedMinutes: 70,
    concepts: withConceptCode(moduleDefinition.concepts, 'unit-bearing-linear-functional', profileCode, profileOutput),
    sections,
    visuals: mergeById(source.visuals, moduleDefinition.visuals),
    labs: mergeById(moduleDefinition.labs, source.labs),
  })
}

function enhanceDistance(moduleDefinition: MathLabModule): MathLabModule {
  const sections = [
    moduleDefinition.sections[0]!,
    distanceSharedSection,
    ...moduleDefinition.sections.slice(1, 3),
    distanceLedgerSection,
    distanceOutputSection,
    distanceScaleSection,
    distanceApplicationsSection,
    ...moduleDefinition.sections.slice(3, -1),
    distanceFailureSection,
    distanceSummarySection,
    moduleDefinition.sections.at(-1)!,
  ]
  return withToc({
    ...moduleDefinition,
    subtitle: copy(
      '用同一组画像比较 norm、欧氏距离、点积与 cosine，并说明指标选择怎样改变排序。',
      'Compare norms, Euclidean distance, dot products, and cosine on one profile set, then explain how metric choice changes ranking.',
    ),
    estimatedMinutes: 60,
    concepts: withConceptCode(moduleDefinition.concepts, 'norm-distance-cosine-search', distanceCode, distanceOutput),
    sections,
  })
}

function enhanceMatrix(moduleDefinition: MathLabModule): MathLabModule {
  const source = sourceModule(moduleDefinition.id)
  const sections = moduleDefinition.sections
    .filter(({ id }) => id !== 'matrices-practice' && id !== 'matrices-handoff')
    .flatMap((item) => item.id === 'matrices-recap'
      ? [item, matrixSharedSection, matrixReadingsSection, matrixOutputSection]
      : [item])
    .concat(matrixSummarySection)
  return withToc({
    ...moduleDefinition,
    subtitle: copy(
      '从三行画像的批量打分走到行列双重读法、广播边界与空间变换。',
      'Move from batch scoring of three profile rows to row/column readings, broadcasting boundaries, and spatial transforms.',
    ),
    estimatedMinutes: 75,
    concepts: withConceptCode(moduleDefinition.concepts, 'batch-affine-map', batchCode, batchOutput),
    sections,
    visuals: mergeById(source.visuals, moduleDefinition.visuals),
    labs: mergeById(moduleDefinition.labs, source.labs),
  })
}

function enhanceRank(moduleDefinition: MathLabModule): MathLabModule {
  const sections = [
    moduleDefinition.sections[0]!,
    rankSharedSection,
    ...moduleDefinition.sections.slice(1, 2),
    rankColumnLedgerSection,
    rankNullSection,
    rankOneComparisonSection,
    rankOutputSection,
    ...moduleDefinition.sections.slice(2, -1),
    rankApplicationsSection,
    rankFailureSection,
    rankSummarySection,
    moduleDefinition.sections.at(-1)!,
  ]
  return withToc({
    ...moduleDefinition,
    subtitle: copy(
      '用一个三维到二维映射手算 column space、rank、null direction 和模型盲区。',
      'Use one three-to-two-dimensional map to calculate column space, rank, a null direction, and a model blind spot.',
    ),
    estimatedMinutes: 65,
    concepts: withConceptCode(moduleDefinition.concepts, 'column-space-rank-null', rankCode, rankOutput),
    sections,
  })
}

const mathToCodeEnhancers: Readonly<Record<string, (moduleDefinition: MathLabModule) => MathLabModule>> = {
  'linear-algebra-feature-space': enhanceFeatureSpace,
  'linear-algebra-matrix-transformations': enhanceMatrix,
}

const routeEnhancers: Readonly<Record<string, (moduleDefinition: MathLabModule) => MathLabModule>> = {
  'linear-algebra-distance-similarity': enhanceDistance,
  'linear-algebra-rank-null-space': enhanceRank,
}

export const vectorMatrixLanguageMathToCodeModules: MathLabModule[] = minimumFoundationMathToCodeModules.map((moduleDefinition) =>
  mathToCodeEnhancers[moduleDefinition.id]?.(moduleDefinition) ?? moduleDefinition,
)

export const vectorMatrixLanguageRouteModules: MathLabModule[] = linearAlgebraRouteModules.map((moduleDefinition) =>
  routeEnhancers[moduleDefinition.id]?.(moduleDefinition) ?? moduleDefinition,
)
