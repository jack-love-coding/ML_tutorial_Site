import type {
  DataConcept,
  DataLabConfig,
  DataLabModule,
  DataLabModuleId,
  DataLabSection,
  DataMisconception,
  DataQuizItem,
  DataVisualAsset,
  LocalizedCopy,
  SourceReference,
} from '../types/dataLab'

const md = String.raw

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

function section(
  id: string,
  title: LocalizedCopy,
  content: LocalizedCopy,
  placements: Pick<DataLabSection, 'visualIds' | 'labIds'> = {},
): DataLabSection {
  return { id, title, content, ...placements }
}

function concept(
  id: string,
  name: LocalizedCopy,
  plainExplanation: LocalizedCopy,
  example: LocalizedCopy,
  pandasExample?: string,
): DataConcept {
  return { id, name, plainExplanation, example, pandasExample }
}

function lab(
  id: string,
  title: LocalizedCopy,
  componentName: DataLabConfig['componentName'],
  successCriteria: LocalizedCopy[],
): DataLabConfig {
  return { id, title, componentName, successCriteria }
}

function quiz(
  id: string,
  prompt: LocalizedCopy,
  answer: string,
  correct: LocalizedCopy,
  distractor: LocalizedCopy,
  explanation: LocalizedCopy,
): DataQuizItem {
  return {
    id,
    prompt,
    choices: [
      { id: answer, label: correct },
      { id: 'distractor', label: distractor },
    ],
    answer,
    explanation,
  }
}

function misconception(
  id: string,
  statement: LocalizedCopy,
  correction: LocalizedCopy,
  example: LocalizedCopy,
): DataMisconception {
  return { id, statement, correction, example }
}

function image(
  id: string,
  file: string,
  title: LocalizedCopy,
  caption: LocalizedCopy,
  labels: DataVisualAsset['labels'],
): DataVisualAsset {
  return {
    id,
    type: 'image',
    title,
    assetPath: `/data-lab/generated/${file}`,
    alt: caption,
    caption,
    labels,
  }
}

function video(id: string, file: string, title: LocalizedCopy, caption: LocalizedCopy): DataVisualAsset {
  return {
    id,
    type: 'manim-video',
    title,
    assetPath: `/manim/data-lab/${file}.mp4`,
    posterPath: `/manim/data-lab/${file}.svg`,
    alt: caption,
    caption,
  }
}

function moduleDefinition(input: DataLabModule): DataLabModule {
  return input
}

const references = {
  numericalData: {
    label: copy('数值数据与特征向量', 'Numerical data and feature vectors'),
    href: 'https://developers.google.com/machine-learning/crash-course/numerical-data',
    usage: copy('课后复习数值列、特征向量、缩放、分箱和好特征的基础概念。', 'Review numerical columns, feature vectors, scaling, binning, and good-feature criteria.'),
  },
  categoricalData: {
    label: copy('类别数据、词表与 one-hot 编码', 'Categorical data, vocabularies, and one-hot encoding'),
    href: 'https://developers.google.com/machine-learning/crash-course/categorical-data',
    usage: copy('课后复习类别语义、词表、未知类别、高基数和特征交叉。', 'Review categorical meaning, vocabularies, unknown values, high cardinality, and feature crosses.'),
  },
  dataQuality: {
    label: copy('数据质量、标签与不平衡数据', 'Data quality, labels, and imbalance'),
    href: 'https://developers.google.com/machine-learning/crash-course/overfitting/data-characteristics',
    usage: copy('课后复习样本代表性、坏数据、标签定义和数据比例对模型的影响。', 'Review representativeness, unreliable data, label definitions, and how proportions affect models.'),
  },
  splitting: {
    label: copy('训练、验证、测试与泛化', 'Training, validation, testing, and generalization'),
    href: 'https://developers.google.com/machine-learning/crash-course/overfitting/dividing-datasets',
    usage: copy('课后复习数据划分、变换参数复用、泛化和过拟合判断。', 'Review data splitting, transform-parameter reuse, generalization, and overfitting checks.'),
  },
  complexity: {
    label: copy('模型复杂度、正则化与损失曲线', 'Model complexity, regularization, and loss curves'),
    href: 'https://developers.google.com/machine-learning/crash-course/overfitting/model-complexity',
    usage: copy('课后复习复杂度、L2 正则化、提前停止和训练曲线诊断。', 'Review complexity, L2 regularization, early stopping, and training-curve diagnosis.'),
  },
  pandasIntro: {
    label: copy('pandas DataFrame 入门', 'pandas DataFrame intro'),
    href: 'https://pandas.pydata.org/docs/getting_started/intro_tutorials/01_table_oriented.html',
    usage: copy('查阅 DataFrame、Series、列选择、行过滤和基础表格操作。', 'Look up DataFrame, Series, column selection, row filtering, and basic table operations.'),
  },
  pandasMissing: {
    label: copy('pandas 缺失数据处理', 'pandas missing-data handling'),
    href: 'https://pandas.pydata.org/docs/user_guide/missing_data.html',
    usage: copy('查阅 isna、dropna、fillna 以及缺失值传播规则。', 'Look up isna, dropna, fillna, and missing-value propagation rules.'),
  },
  pandasCategorical: {
    label: copy('pandas Categorical 与 get_dummies', 'pandas Categorical and get_dummies'),
    href: 'https://pandas.pydata.org/docs/user_guide/categorical.html',
    usage: copy('查阅固定类别集合、有序类别和 one-hot 展开的工程写法。', 'Look up fixed category sets, ordered categories, and one-hot engineering patterns.'),
  },
  pandasGroupby: {
    label: copy('pandas GroupBy 与聚合', 'pandas GroupBy and aggregation'),
    href: 'https://pandas.pydata.org/docs/user_guide/groupby.html',
    usage: copy('查阅 split-apply-combine、分组统计和聚合结果形状。', 'Look up split-apply-combine, grouped statistics, and aggregation output shapes.'),
  },
  pandasVisualization: {
    label: copy('pandas 可视化', 'pandas visualization'),
    href: 'https://pandas.pydata.org/docs/user_guide/visualization.html',
    usage: copy('查阅直方图、箱线图、散点图和分组图在探索分析中的用法。', 'Look up histograms, box plots, scatter plots, and grouped plots for exploratory analysis.'),
  },
} satisfies Record<string, SourceReference>

function refs(...keys: Array<keyof typeof references>): SourceReference[] {
  return keys.map((key) => references[key])
}

export const dataLabModules: DataLabModule[] = [
  moduleDefinition({
    id: 'numerical-data',
    order: 1,
    title: copy('数值数据：从列到特征向量', 'Numerical Data: From Columns to Feature Vectors'),
    subtitle: copy(
      '理解模型为什么只读取数字，以及原始表格如何经过选择、清洗、缩放和变换成为稳定输入。',
      'Understand why models read numbers and how raw tables become stable inputs through selection, cleaning, scaling, and transforms.',
    ),
    accent: '#2563eb',
    theme: '#edf4ff',
    estimatedMinutes: 85,
    learningObjectives: [
      copy('解释 row、column、feature、label 和 feature vector 的关系。', 'Explain the relation among rows, columns, features, labels, and feature vectors.'),
      copy('区分连续数值、类别编号、ID、缺失状态和预测时不可用的列。', 'Separate continuous values, categorical codes, IDs, missingness, and columns unavailable at prediction time.'),
      copy('说明缩放、分箱、裁剪和多项式变换各自解决什么问题。', 'Explain what scaling, binning, clipping, and polynomial transforms each solve.'),
      copy('用 pandas 表达列选择、过滤、派生列、缺失值处理和 shape 审计。', 'Use pandas for column selection, filtering, derived columns, missing-value handling, and shape audits.'),
      copy('判断一个数值特征是否稳定、可解释、与任务有关，并能在预测时获得。', 'Judge whether a numerical feature is stable, interpretable, task-relevant, and available at prediction time.'),
    ],
    concepts: [
      concept(
        'feature-vector',
        copy('特征向量', 'Feature Vector'),
        copy('特征向量是一行样本经过处理后交给模型的一串数字。列名帮助人理解含义，向量位置才是模型真正读取的输入协议。', 'A feature vector is the numeric sequence handed to a model after one example is processed. Column names help people; vector positions are the input contract the model reads.'),
        copy('房屋样本可以把 area_z、rooms_z、district_north、district_south 拼成固定长度向量。', 'A housing example can concatenate area_z, rooms_z, district_north, and district_south into a fixed-length vector.'),
        "pd.get_dummies(df[['district']]).join(df[['area', 'rooms']])",
      ),
      concept(
        'numeric-semantics',
        copy('数值语义', 'Numeric Semantics'),
        copy('能写成数字不等于适合做连续数值。数值特征应当支持大小、差值或距离解释，否则模型会从不存在的顺序里学习错误规律。', 'Being written with digits does not make a value continuous. A numeric feature should support magnitude, difference, or distance; otherwise a model may learn order that does not exist.'),
        copy('邮编 10001 和 10002 的差为 1，但这不代表两个地区距离更近或价格更相似。', 'ZIP codes 10001 and 10002 differ by 1, but that does not mean the areas are closer or prices are more similar.'),
      ),
      concept(
        'scaling',
        copy('缩放', 'Scaling'),
        copy('缩放把不同量纲的列放到可比较范围，避免大范围列支配梯度、距离或权重。缩放参数必须从训练集估计并复用。', 'Scaling puts columns with different units into comparable ranges so wide columns do not dominate gradients, distances, or weights. Scaling parameters are estimated on training data and reused.'),
        copy('价格范围 100 到 9800，房间数范围 1 到 5；直接拼接会让价格列的变化显得更大。', 'Price may range from 100 to 9800 while rooms range from 1 to 5; raw concatenation makes price variation look larger.'),
        "df['price_z'] = (df['price'] - train_mean) / train_std",
      ),
      concept(
        'transform',
        copy('数值变换', 'Numeric Transform'),
        copy('变换会改变模型能表达的模式。分箱牺牲细节换稳定，多项式特征增加表达能力也增加过拟合风险。', 'Transforms change what patterns a model can express. Binning trades detail for stability; polynomial features increase expressiveness and overfitting risk.'),
        copy('把 age 切成年龄段可以学习阶段差异；加入 area_sq 可以让线性模型表达弯曲关系。', 'Binning age can learn stage differences; adding area_sq lets a linear model express curved relationships.'),
        "df = df.assign(area_sq=lambda d: d['area'] ** 2)",
      ),
    ],
    sections: [
      section(
        'table-to-vector',
        copy('从原始表格到模型输入', 'From Raw Tables to Model Inputs'),
        copy(
          md`本章先建立一个基本事实：机器学习模型不会直接理解表格里的业务故事，它读取的是固定顺序的数字。课堂上看到的一行样本，进入模型前通常会经历列选择、类型判断、缺失处理、缩放、编码和拼接。这个过程的产物就是特征向量。为什么重要：只要列顺序、含义或处理规则发生变化，模型接收到的输入协议就变了，训练结果也会变得不可解释。

学习时不要急着训练模型，先把每一列问清楚：这列在预测时能不能知道？它是答案还是输入？它是连续数值、类别身份、ID，还是只用于审计的辅助信息？pandas 中的列选择和行过滤是这个流程的第一步，shape 变化则是最早的检查信号。`,
          md`This chapter starts with one fact: a machine-learning model does not read the business story inside a table. It reads numbers in a fixed order. Before one row reaches the model, it usually passes through column selection, type judgment, missing-value handling, scaling, encoding, and concatenation. The result is a feature vector. This matters because any change in column order, meaning, or processing rules changes the input contract and makes training behavior harder to explain.

Students should not rush into training. First ask for every column: will it be known at prediction time, is it the answer or an input, is it continuous numeric meaning, categorical identity, an ID, or audit-only information? In pandas, column selection and row filtering start the workflow, while shape changes are the earliest audit signal.`,
        ),
        { visualIds: ['feature-vector-pipeline'], labIds: ['column-type-lab'] },
      ),
      section(
        'numeric-or-not',
        copy('先判断数字是否真的有数值意义', 'First Decide Whether Digits Have Numeric Meaning'),
        copy(
          md`许多初学者会把所有能转成 number 的列都交给模型，这是数据准备中最常见的错误之一。连续数值应当允许比较大小、计算差值，并且差值有稳定解释。面积从 80 到 100 平方米，差值 20 有明确含义；邮编从 10001 到 10021，差值 20 却没有可训练的距离意义。为什么重要：模型会把输入中的数值当成可比较信号，如果语义是错的，后面再好的算法也会学习偏差。

课堂练习可以让学生给每列贴标签：连续数值、序数、类别、布尔、时间、文本、ID、缺失状态。pandas 对照代码不只是为了运行，而是为了让学生看见“业务解释 -> 数据类型 -> 模型表示”的链条。`,
          md`Many beginners pass every parseable number to a model, which is one of the most common data-preparation mistakes. A continuous numeric feature should support comparison, differences, and stable interpretation of those differences. An area increase from 80 to 100 square meters has clear meaning; a ZIP-code increase from 10001 to 10021 does not provide trainable distance. This matters because models treat numeric inputs as comparable signals, and a wrong semantic choice teaches bias no later algorithm can fully repair.

A classroom exercise is to tag each column as continuous numeric, ordinal, categorical, boolean, datetime, text, ID, or missingness. The pandas code is not only for execution; it shows the chain from business interpretation to data type to model representation.`,
        ),
      ),
      section(
        'scale-and-outliers',
        copy('缩放、裁剪和离群点', 'Scaling, Clipping, and Outliers'),
        copy(
          md`数值列常常来自不同单位：价格、面积、年龄、点击次数、评分和距离的范围完全不同。缩放的目的不是让表格看起来整齐，而是让模型在训练时面对可比较的变化。标准化通常使用均值和标准差，归一化通常使用最小值和最大值。为什么重要：这些参数只能从训练集估计，然后原样用于验证集、测试集和新样本，否则评估过程会提前知道不该知道的信息。

离群点也要先解释再处理。一个极端房价可能是录入错误，也可能是真实豪宅；一个异常点击量可能是作弊，也可能是热门事件。pandas 中的 clip、isna、describe 和分位数统计可以帮助学生观察范围，但是否删除、裁剪或保留，必须由业务含义和训练目标共同决定。`,
          md`Numeric columns often come from different units: price, area, age, click count, rating, and distance have very different ranges. Scaling is not cosmetic cleanup; it makes changes comparable during training. Standardization usually uses mean and standard deviation, while normalization often uses minimum and maximum. This matters because these parameters must be estimated from training data, then reused for validation, test, and new examples, or evaluation will peek at information it should not know.

Outliers must be interpreted before they are handled. An extreme house price may be a data-entry error or a real luxury property; unusual clicks may be fraud or a genuine event. In pandas, clip, isna, describe, and quantile summaries help students observe range, but deletion, clipping, or retention must follow business meaning and the training goal.`,
        ),
        { visualIds: ['cleaning-policy-map'] },
      ),
      section(
        'binning-and-polynomial',
        copy('分箱和多项式特征改变表达能力', 'Binning and Polynomial Features Change Expressiveness'),
        copy(
          md`分箱把连续值切成区间，例如把年龄分成儿童、青年、中年和老年，把价格分成低、中、高。它适合表达区间效应，缺点是同一箱内的细节会被压平。多项式特征走相反方向：它保留连续数值，并加入 x^2、x^3 或交互项，让简单模型也能表达弯曲关系。为什么重要：这两类变换都不是“更高级就更好”，而是在稳定性、表达能力和过拟合风险之间取舍。

教学时可以让学生比较三种输入：原始数值、分箱后的 one-hot、加入平方项的数值。pandas 中 pd.cut 和 assign 能清楚地展示新增列从哪里来，shape 审计则提醒学生：每增加一个列，模型输入空间也跟着改变。`,
          md`Binning cuts continuous values into intervals such as child, young adult, middle aged, and senior, or low, medium, and high price. It expresses interval effects but flattens detail inside each bin. Polynomial features move in the opposite direction: they keep continuity and add x^2, x^3, or interactions so a simple model can express curved relationships. This matters because neither transform is automatically better; each trades among stability, expressiveness, and overfitting risk.

In class, students can compare three inputs: raw values, one-hot bins, and values with squared terms. In pandas, pd.cut and assign show where new columns come from, while shape audits remind students that every added column changes the model input space.`,
        ),
      ),
      section(
        'pandas-numeric-recipe',
        copy('pandas 对照：写出可复查的数值流水线', 'pandas Companion: Write a Reviewable Numeric Pipeline'),
        copy(
          md`一个完整的数值流水线通常包括：选择可用列、过滤明显无效行、转换类型、补缺失、裁剪极端值、派生新列、估计缩放参数、应用缩放并保存列顺序。课堂练习目标不是背 API，而是让学生能解释每一步改变了什么：行数变了没有，列数变了没有，参数从哪里估计，下一次预测时能否复现同样处理。

浏览器实验会用 TypeScript 模拟 pandas 风格的表格变化，学生可以安全地拖动选项、观察 shape 和统计量。对应的 pandas 片段提供真实 notebook 中的写法，帮助学生把概念从网页练习带到自己的数据集。`,
          md`A complete numeric pipeline usually selects available columns, filters invalid rows, casts types, imputes missing values, clips extremes, derives new columns, estimates scaling parameters, applies scaling, and saves column order. The classroom goal is not API memorization; students should explain what each step changes: did row count change, did column count change, where were parameters estimated, and can prediction-time processing reproduce the same rule?

The browser lab simulates pandas-style table changes in TypeScript so students can safely adjust options and observe shape and statistics. The matching pandas snippets provide the notebook pattern for carrying the concept to their own datasets.`,
        ),
        { visualIds: ['pandas-workflow'], labIds: ['pandas-pipeline-lab'] },
      ),
    ],
    visuals: [
      image('feature-vector-pipeline', 'feature-vector-pipeline-v2.png', copy('特征向量流水线', 'Feature-vector pipeline'), copy('原始表格经过语义判断、清洗、编码和缩放后，成为模型读取的固定向量。', 'Raw tables become fixed model vectors after semantic checks, cleaning, encoding, and scaling.'), [
        { id: 'raw', x: 11, y: 29, label: copy('原始表格', 'Raw table') },
        { id: 'semantics', x: 30, y: 18, label: copy('列语义', 'Column semantics') },
        { id: 'clean', x: 50, y: 18, label: copy('清洗', 'Clean') },
        { id: 'scale', x: 70, y: 18, label: copy('缩放/编码', 'Scale / encode') },
        { id: 'vector', x: 91, y: 29, label: copy('特征向量', 'Feature vector') },
      ]),
      image('cleaning-policy-map', 'cleaning-policy-map-v2.png', copy('数值清洗策略图', 'Numeric cleaning policy map'), copy('缺失、重复、坏值和离群点需要不同策略，并且必须记录对训练数据的影响。', 'Missing values, duplicates, bad values, and outliers need different policies, with training impact recorded.'), [
        { id: 'missing', x: 17, y: 25, label: copy('缺失', 'Missing') },
        { id: 'duplicate', x: 36, y: 25, label: copy('重复', 'Duplicate') },
        { id: 'bad', x: 56, y: 25, label: copy('坏值', 'Bad value') },
        { id: 'outlier', x: 76, y: 25, label: copy('离群点', 'Outlier') },
        { id: 'audit', x: 50, y: 82, label: copy('记录策略', 'Record policy') },
      ]),
      video('data-types-video', 'data-types-feature-flow', copy('特征流动画', 'Feature-flow animation'), copy('展示数据列如何进入特征向量。', 'Shows how data columns enter feature vectors.')),
    ],
    labs: [
      lab('column-type-lab', copy('列语义实验室', 'Column Semantics Lab'), 'ColumnTypeLab', [
        copy('能判断一列是否适合作为连续数值特征。', 'Judge whether a column belongs as a continuous numerical feature.'),
        copy('能说明缩放、one-hot 和 ID 保留各自解决什么问题。', 'Explain what scaling, one-hot encoding, and ID retention each solve.'),
      ]),
      lab('pandas-pipeline-lab', copy('pandas 数值流水线', 'pandas Numeric Pipeline'), 'PandasPipelineLab', [
        copy('能把选择、过滤、派生和聚合对应到 pandas 代码。', 'Map selection, filtering, derivation, and aggregation to pandas code.'),
        copy('能用 shape 变化检查流水线是否合理。', 'Use shape changes to audit whether a pipeline is reasonable.'),
      ]),
    ],
    quizzes: [
      quiz('zip-code-numeric', copy('邮编 94110 应该直接作为连续数值输入吗？', 'Should ZIP code 94110 be used directly as a continuous numeric input?'), 'no', copy('不应该，它更像类别或地区身份。', 'No. It is closer to category or area identity.'), copy('应该，因为它能转成 number。', 'Yes, because it can be parsed as a number.'), copy('关键不是外观，而是差值和距离是否有稳定含义。', 'The key is not appearance, but whether differences and distances are meaningful.')),
      quiz('scale-fit', copy('缩放参数应该从哪些数据估计？', 'Where should scaling parameters be estimated?'), 'train', copy('只从训练集估计。', 'From training data only.'), copy('从训练、验证、测试一起估计。', 'From training, validation, and test together.'), copy('验证和测试要模拟未知样本，不能参与参数估计。', 'Validation and test should simulate unseen examples and must not fit processing parameters.')),
      quiz('binning-cost', copy('分箱的主要代价是什么？', 'What is the main cost of binning?'), 'detail', copy('区间内部细节会丢失。', 'Detail inside each interval is lost.'), copy('一定会增加连续精度。', 'It always increases continuous precision.'), copy('分箱换来稳定性，但会压平同一箱内的差异。', 'Binning trades detail for stability and flattens within-bin differences.')),
    ],
    misconceptions: [
      misconception('all-numbers', copy('能写成数字的列都应该当作数值特征。', 'Every digit-like column should be numeric.'), copy('只有差值、大小或距离有稳定解释时，才适合作连续数值。', 'A column belongs as continuous numeric only when differences, magnitude, or distance have stable meaning.'), copy('邮编、设备号、用户 ID 通常不能求平均。', 'ZIP codes, device IDs, and user IDs usually cannot be averaged.')),
      misconception('scaling-cosmetic', copy('缩放只是为了表格好看。', 'Scaling is only cosmetic.'), copy('缩放会改变梯度、距离和权重敏感度，是训练协议的一部分。', 'Scaling changes gradients, distances, and weight sensitivity, so it is part of the training protocol.'), copy('训练集估计的均值和标准差要保存到预测流程。', 'Means and standard deviations estimated on training data must be saved for prediction.')),
      misconception('more-transforms', copy('变换越多，模型一定越好。', 'More transforms always make a model better.'), copy('变换会增加表达能力，也会增加复杂度和过拟合风险。', 'Transforms add expressiveness but also complexity and overfitting risk.'), copy('新增 area_sq 后必须看验证表现。', 'After adding area_sq, validation behavior must be checked.')),
    ],
    sourceReferences: refs('numericalData', 'pandasIntro', 'pandasMissing'),
  }),
  moduleDefinition({
    id: 'categorical-data',
    order: 2,
    title: copy('类别数据：词表、one-hot 与特征交叉', 'Categorical Data: Vocabularies, One-hot, and Feature Crosses'),
    subtitle: copy(
      '学习模型如何读取“属于哪一类”的信息，以及类别编码为什么必须有固定词表和未知值策略。',
      'Learn how models read membership information and why categorical encoding needs fixed vocabularies and unknown-value policies.',
    ),
    accent: '#7c3aed',
    theme: '#f4efff',
    estimatedMinutes: 80,
    learningObjectives: [
      copy('区分类别、序数、文本、ID 和连续数值。', 'Distinguish categorical, ordinal, text, ID, and continuous numeric data.'),
      copy('解释词表、未知类别、低频类别和 one-hot 向量的作用。', 'Explain vocabularies, unknown categories, rare categories, and one-hot vectors.'),
      copy('说明高基数类别为什么容易让模型记住训练样本。', 'Explain why high-cardinality categories can make models memorize training examples.'),
      copy('判断特征交叉什么时候表达有效组合，什么时候只是在放大稀疏性。', 'Judge when feature crosses express useful combinations and when they only amplify sparsity.'),
      copy('用 pandas Categorical 和 get_dummies 写出稳定的类别编码流程。', 'Use pandas Categorical and get_dummies to write stable categorical encoding workflows.'),
    ],
    concepts: [
      concept('category', copy('类别特征', 'Categorical Feature'), copy('类别特征表示成员身份，而不是连续距离。模型需要把类别变成固定槽位，才能稳定读取。', 'A categorical feature represents membership rather than continuous distance. A model needs categories mapped into fixed slots to read them consistently.'), copy('district=north 表示属于 north 街区，而不是数值大小。', 'district=north means membership in the north district, not magnitude.'), "df['district'].astype('category')"),
      concept('vocabulary', copy('词表', 'Vocabulary'), copy('词表是训练时确定的合法类别集合。它规定每个类别落在哪个向量槽位，也规定新样本中的未知类别如何处理。', 'A vocabulary is the legal category set fixed during training. It defines vector slots and how unknown categories are handled.'), copy('训练时有 north、south、west，新样本出现 airport 时应进入 OOV 或 RARE 槽。', 'If training has north, south, and west, a new airport value should map to OOV or RARE.'), "pd.Categorical(df['district'], categories=train_vocab)"),
      concept('one-hot', copy('one-hot 编码', 'One-hot Encoding'), copy('one-hot 用一组 0/1 槽表示类别身份。每个槽对应词表中的一个类别，当前类别所在槽为 1。', 'One-hot uses 0/1 slots for category membership. Each slot corresponds to one vocabulary token, and the active category gets 1.'), copy('district=south 可以编码为 [0, 1, 0, 0]。', 'district=south may encode as [0, 1, 0, 0].'), "pd.get_dummies(df['district'], prefix='district')"),
      concept('feature-cross', copy('特征交叉', 'Feature Cross'), copy('特征交叉把两个或多个类别组合成新类别，让模型学习局部规则，但维度会快速增长。', 'A feature cross combines categories into new categories so the model can learn local rules, but dimensionality grows quickly.'), copy('district=north 与 type=condo 交叉后形成 north_x_condo 槽位。', 'district=north crossed with type=condo creates a north_x_condo slot.'), "df['district_type'] = df['district'] + '_' + df['type']"),
    ],
    sections: [
      section(
        'categorical-meaning',
        copy('类别数据表达身份，不表达距离', 'Categorical Data Expresses Identity, Not Distance'),
        copy(
          md`类别数据的核心问题是“这个样本属于哪一组”。它可以是地区、产品类型、浏览器、职业、颜色、学校或设备型号。为什么重要：如果把类别当成连续数值，模型会错误地相信类别之间存在大小和距离；如果不编码，模型又无法读取字符串。教学时要让学生先解释列的业务含义，再决定是 one-hot、multi-hot、序数编码还是保留为审计字段。

pandas 中 object、string、category 和 int dtype 只是技术外观，不能替代语义判断。一个列写成数字，也可能只是类别编号；一个列写成文字，也可能需要拆成多个标签或时间字段。`,
          md`The core question for categorical data is: which group does this example belong to? It may be district, product type, browser, occupation, color, school, or device model. This matters because treating categories as continuous values teaches the model false magnitude and distance; leaving strings unencoded gives the model nothing numeric to read. Students should first explain business meaning, then choose one-hot, multi-hot, ordinal encoding, or audit-only retention.

In pandas, object, string, category, and int dtype are technical appearances, not semantic decisions. A digit-like column may still be a category code; a text column may need to become multiple tags or a datetime field.`,
        ),
        { visualIds: ['categorical-semantics'], labIds: ['categorical-encoding-lab'] },
      ),
      section(
        'vocabulary-contract',
        copy('词表是类别输入的契约', 'A Vocabulary Is the Categorical Input Contract'),
        copy(
          md`模型训练时必须知道类别集合和槽位顺序。词表把类别映射到固定位置，例如 north 落在第 0 槽、south 落在第 1 槽。为什么重要：如果验证或线上预测时重新排序词表，同一个向量位置就会变成不同含义，模型读到的信号会错位。词表还要规定低频类别和未知类别如何处理，避免新样本直接报错或产生全 0 向量。

课堂练习可以让学生从训练数据统计 value_counts，然后设置 minFrequency，把少数类别合并到 RARE，把训练后才出现的类别放到 OOV。这样学生能看到“稳定输入协议”比“把字符串转成数字”更重要。`,
          md`During training, a model must know the category set and slot order. A vocabulary maps categories to fixed positions, such as north in slot 0 and south in slot 1. This matters because if validation or serving recomputes and reorders the vocabulary, the same vector position changes meaning and the model reads the wrong signal. The vocabulary also defines rare and unknown handling so new examples do not fail or produce misleading all-zero vectors.

A classroom exercise can build value_counts from training data, set a minFrequency, merge rare categories into RARE, and map post-training categories into OOV. Students then see that a stable input contract matters more than merely converting strings into numbers.`,
        ),
        { visualIds: ['categorical-vocabulary'], labIds: ['categorical-encoding-lab'] },
      ),
      section(
        'one-hot-and-sparsity',
        copy('one-hot 让模型读取类别，但会产生稀疏输入', 'One-hot Makes Categories Readable but Sparse'),
        copy(
          md`one-hot 编码把一个类别展开成多个 0/1 槽。它的优点是不会强加类别大小顺序，适合名义类别；缺点是类别越多，向量越宽，绝大多数位置都是 0。为什么重要：稀疏输入本身不是错误，但它会提高存储、训练和泛化难度，尤其是在样本数不足时。学生应该把 one-hot 看成“稳定地表达成员身份”，而不是万能编码。

pandas 的 get_dummies 很方便，但课堂中要强调它默认从当前数据推断列集合。真实工程应保存训练词表和输出列顺序，再对验证、测试和新样本补齐缺失列。`,
          md`One-hot encoding expands one category into multiple 0/1 slots. Its benefit is that it avoids imposing magnitude order, which fits nominal categories. Its cost is width: more categories mean wider vectors, with most positions equal to 0. This matters because sparsity is not wrong, but it increases storage, training, and generalization difficulty, especially with few examples. Students should see one-hot as stable membership representation, not a universal encoding.

pandas get_dummies is convenient, but lessons should emphasize that it infers columns from the current data by default. Real workflows save the training vocabulary and output column order, then align validation, test, and new examples to that schema.`,
        ),
      ),
      section(
        'high-cardinality',
        copy('高基数、低频类别和漂移', 'High Cardinality, Rare Values, and Drift'),
        copy(
          md`高基数列是指类别数量很大，例如用户 ID、商品 ID、搜索词、地理网格或设备型号。为什么重要：如果每个类别只有少量样本，模型很容易把类别槽位当成记忆训练样本的钥匙，而不是学习可泛化规律。低频类别、拼写变体和新类别还会让线上输入不断变化。

处理高基数类别时，常见策略包括合并低频值、限制词表大小、使用哈希桶、只保留更粗粒度分组，或者干脆不把 ID 作为特征。学生要能说明每种策略牺牲了什么：合并会丢细节，哈希会冲突，删除会少一个信号，但盲目展开可能更危险。`,
          md`A high-cardinality column has many possible categories: user ID, product ID, search term, geographic cell, or device model. This matters because if each category has only a few examples, the model can use category slots as keys for memorizing training rows rather than learning generalizable patterns. Rare values, spelling variants, and new categories also make serving inputs drift.

Common strategies include merging rare values, limiting vocabulary size, using hash buckets, keeping coarser groups, or excluding IDs as features. Students should explain the cost of each strategy: merging loses detail, hashing creates collisions, deletion removes signal, and blind expansion may be more dangerous.`,
        ),
        { visualIds: ['categorical-sparsity'] },
      ),
      section(
        'feature-crosses',
        copy('特征交叉表达组合规则，也会放大维度', 'Feature Crosses Express Combination Rules and Expand Dimensions'),
        copy(
          md`有些规律只在类别组合中出现。例如“市中心的小户型”和“郊区的大户型”可能对应不同价格关系，单独看地区或房型都不够。特征交叉把多个类别拼成组合槽位，让线性模型也能学习局部规则。为什么重要：交叉的维度等于各词表大小相乘，两个 100 类特征交叉就可能产生 10000 个槽，样本不够时会非常稀疏。

课堂练习目标是让学生先提出组合假设，再用验证集检查收益，而不是机械地把所有类别两两交叉。pandas 中可以用字符串拼接构造交叉列，再用 get_dummies 展开，并用 shape 变化观察维度增长。`,
          md`Some patterns appear only in category combinations. Downtown small apartments and suburban large houses may follow different price relationships, and district or type alone may not be enough. A feature cross concatenates categories into combination slots so a linear model can learn local rules. This matters because cross dimensionality multiplies vocabulary sizes: two 100-token features may create 10,000 slots, which becomes very sparse without enough examples.

The classroom goal is to propose a combination hypothesis first and check validation benefit, not mechanically cross every pair of categories. In pandas, string concatenation can build a cross column, get_dummies can expand it, and shape changes reveal dimension growth.`,
        ),
        { visualIds: ['categorical-sparsity'], labIds: ['categorical-encoding-lab'] },
      ),
    ],
    visuals: [
      image('categorical-semantics', 'categorical-semantics.png', copy('类别语义判断', 'Categorical semantics'), copy('先判断一列表示连续数值、身份、顺序还是审计 ID，再决定编码方式。', 'Decide whether a column represents continuous value, identity, order, or audit ID before choosing encoding.'), [
        { id: 'numeric', x: 17, y: 31, label: copy('连续数值', 'numeric') },
        { id: 'category', x: 38, y: 31, label: copy('类别身份', 'category') },
        { id: 'ordinal', x: 58, y: 31, label: copy('有序等级', 'ordinal') },
        { id: 'id', x: 78, y: 31, label: copy('审计 ID', 'audit ID') },
      ]),
      image('categorical-vocabulary', 'categorical-vocabulary-one-hot.png', copy('词表与 one-hot', 'Vocabulary and one-hot'), copy('训练词表决定槽位顺序，未知类别进入稳定的 OOV 处理。', 'Training vocabulary fixes slot order, and unknown values use a stable OOV policy.'), [
        { id: 'vocab', x: 18, y: 21, label: copy('训练词表', 'Vocabulary') },
        { id: 'slot', x: 43, y: 21, label: copy('固定槽位', 'Fixed slots') },
        { id: 'onehot', x: 68, y: 21, label: copy('独热编码', 'one-hot') },
        { id: 'oov', x: 86, y: 73, label: copy('未知类别', 'OOV') },
      ]),
      image('categorical-sparsity', 'categorical-feature-cross-sparsity.png', copy('交叉与稀疏性', 'Crosses and sparsity'), copy('特征交叉能表达组合规则，也会让向量维度快速增长。', 'Feature crosses express combination rules but can rapidly increase vector width.'), [
        { id: 'left', x: 13, y: 25, label: copy('地区', 'district') },
        { id: 'right', x: 30, y: 25, label: copy('房型', 'type') },
        { id: 'cross', x: 51, y: 25, label: copy('组合槽位', 'cross slots') },
        { id: 'sparse', x: 78, y: 25, label: copy('稀疏向量', 'sparse vector') },
        { id: 'risk', x: 52, y: 84, label: copy('验证收益', 'validation gain') },
      ]),
      video('categorical-one-hot-video', 'categorical-one-hot-flow', copy('one-hot 动画', 'One-hot animation'), copy('展示类别如何映射到固定向量槽位。', 'Shows categories mapping into fixed vector slots.')),
      video('feature-cross-video', 'feature-cross-sparsity', copy('特征交叉动画', 'Feature-cross animation'), copy('展示交叉维度如何随词表增长。', 'Shows cross dimensionality growing with vocabularies.')),
    ],
    labs: [
      lab('categorical-encoding-lab', copy('类别编码实验室', 'Categorical Encoding Lab'), 'CategoricalEncodingLab', [
        copy('能构建训练词表并处理未知类别。', 'Build a training vocabulary and handle unknown categories.'),
        copy('能比较 one-hot、低频合并、哈希和特征交叉的影响。', 'Compare one-hot, rare merging, hashing, and feature crosses.'),
      ]),
    ],
    quizzes: [
      quiz('id-feature', copy('用户 ID 适合直接 one-hot 后训练吗？', 'Should user IDs be directly one-hot encoded for training?'), 'careful', copy('通常要非常谨慎，容易记住训练样本。', 'Usually only with great caution because memorization is likely.'), copy('一定适合，因为 ID 很精确。', 'Always, because IDs are precise.'), copy('高基数 ID 的泛化证据通常不足。', 'High-cardinality IDs often lack generalization evidence.')),
      quiz('vocab-source', copy('验证集应该重新生成自己的 one-hot 列吗？', 'Should validation generate its own one-hot columns?'), 'no', copy('不应该，应对齐训练词表和列顺序。', 'No. It should align to the training vocabulary and column order.'), copy('应该，这样能看到更多类别。', 'Yes, so it can include more categories.'), copy('重新生成会让槽位含义不稳定。', 'Regenerating makes slot meaning unstable.')),
      quiz('cross-cost', copy('两个各 50 类的特征交叉，最多会产生多少组合槽？', 'Two features with 50 categories each can create up to how many cross slots?'), '2500', copy('2500 个。', '2,500.'), copy('100 个。', '100.'), copy('交叉维度通常是词表大小相乘。', 'Cross dimensionality usually multiplies vocabulary sizes.')),
    ],
    misconceptions: [
      misconception('category-order', copy('类别编号越大，含义就越强。', 'A larger category code means stronger meaning.'), copy('类别编号通常只是标签，不代表大小或距离。', 'Category codes are usually labels, not magnitude or distance.'), copy('行业代码 20 不一定比行业代码 10 更大或更近。', 'Industry code 20 is not necessarily larger or closer than code 10.')),
      misconception('get-dummies-enough', copy('get_dummies 一行代码就完成了所有类别工程。', 'One get_dummies line finishes categorical engineering.'), copy('还要固定词表、处理未知值、对齐列顺序并检查稀疏性。', 'The workflow still needs fixed vocabularies, unknown handling, column alignment, and sparsity checks.'), copy('训练和预测必须使用同一套槽位。', 'Training and prediction must use the same slots.')),
      misconception('cross-always', copy('所有类别都应该互相交叉。', 'All categorical features should be crossed.'), copy('交叉应服务于明确假设，并用验证集检查收益。', 'Crosses should serve a clear hypothesis and be checked with validation data.'), copy('没有足够样本的交叉槽很容易只记住噪声。', 'Cross slots without enough examples can memorize noise.')),
    ],
    sourceReferences: refs('categoricalData', 'pandasCategorical'),
  }),
  moduleDefinition({
    id: 'dataset-quality',
    order: 3,
    title: copy('数据质量：缺失、标签与代表性', 'Data Quality: Missingness, Labels, and Representativeness'),
    subtitle: copy(
      '在建模前审计样本、列、标签和分布，判断这批数据是否足以支持可靠训练。',
      'Audit examples, columns, labels, and distributions before modeling to decide whether data can support reliable training.',
    ),
    accent: '#0891b2',
    theme: '#ecfeff',
    estimatedMinutes: 82,
    learningObjectives: [
      copy('用样本量、覆盖范围、时间窗口和分布描述数据代表性。', 'Describe representativeness through sample size, coverage, time window, and distributions.'),
      copy('区分缺失值、坏值、重复记录、离群点和采样偏差。', 'Distinguish missing values, bad values, duplicates, outliers, and sampling bias.'),
      copy('解释标签定义、标注时间点和一致性如何影响训练反馈。', 'Explain how label definition, label timing, and consistency affect training feedback.'),
      copy('用基线和分组统计检查不平衡数据。', 'Use baselines and grouped statistics to inspect imbalanced data.'),
      copy('把探索分析整理成可复查的数据质量报告。', 'Turn exploratory analysis into a reviewable data-quality report.'),
    ],
    concepts: [
      concept('representativeness', copy('代表性', 'Representativeness'), copy('数据代表性描述样本是否覆盖模型将来要服务的人群、时间、地区和场景。', 'Representativeness describes whether examples cover the people, time, regions, and scenarios the model will serve.'), copy('只用一线城市数据训练的房价模型，很难可靠预测县城房屋。', 'A house-price model trained only on major cities may not predict small-town houses reliably.')),
      concept('missingness', copy('缺失机制', 'Missingness Mechanism'), copy('缺失不是单纯空白，它可能和业务流程、设备、地区或目标结果有关。', 'Missingness is not just blankness; it may relate to workflow, device, region, or outcome.'), copy('低收入用户更少填写收入，直接删除会改变样本人群。', 'If low-income users fill income less often, dropping missing rows changes the population.')),
      concept('label-quality', copy('标签质量', 'Label Quality'), copy('标签是训练的反馈信号，必须定义清楚、时间点正确、标注规则一致。', 'Labels are the feedback signal for training and need clear definition, correct timing, and consistent rules.'), copy('用成交后才知道的信息预测成交前结果，会造成答案泄漏。', 'Using information known only after sale to predict a pre-sale result leaks the answer.')),
      concept('imbalance', copy('类别不平衡', 'Class Imbalance'), copy('类别比例悬殊时，准确率可能掩盖模型对少数类的失败。', 'When class proportions are skewed, accuracy can hide failure on the minority class.'), copy('欺诈样本只有 1%，全部预测非欺诈也有 99% 准确率。', 'If fraud is 1%, predicting non-fraud for everything gives 99% accuracy.')),
    ],
    sections: [
      section(
        'quality-before-modeling',
        copy('数据质量决定模型能学到什么', 'Data Quality Determines What a Model Can Learn'),
        copy(
          md`模型不会自动知道数据是否可靠。它会认真学习你给它的每一行、每一列和每一个标签，包括错误、偏差和泄漏。为什么重要：如果训练数据只覆盖部分场景，模型就只能学习那部分规律；如果标签定义混乱，模型就会把混乱当成目标；如果缺失和异常集中在某些群体，模型可能对这些群体表现更差。

本章的课堂目标是让学生先写数据问题清单，再训练模型。清单至少包括样本来自哪里、时间范围是什么、哪些群体缺失、每列缺失率如何、哪些列预测时不可用、标签在什么时间点产生。`,
          md`A model does not automatically know whether data is reliable. It faithfully learns every row, column, and label it receives, including errors, bias, and leakage. This matters because if training data covers only part of the target scenario, the model learns only that part; if labels are inconsistent, the model learns inconsistency; if missingness and anomalies concentrate in groups, performance may degrade for those groups.

The classroom goal is to write a data-issue checklist before training. At minimum, students should record where examples came from, the time range, which groups are missing, missing rates by column, which columns are unavailable at prediction time, and when labels were produced.`,
        ),
        { visualIds: ['eda-board'], labIds: ['eda-workbench-lab'] },
      ),
      section(
        'missing-bad-duplicate',
        copy('缺失、坏值、重复和离群点要分开处理', 'Missing, Bad, Duplicate, and Outlier Values Need Different Treatment'),
        copy(
          md`清洗不是把“不整齐”的数据全部删除。缺失值可能代表没有采集、没有发生、不适用或被用户拒绝填写；坏值可能来自解析错误；重复记录可能来自日志重试；离群点可能是真实少数情况。为什么重要：不同问题需要不同策略，统一删除常常会改变训练分布，让模型远离真实场景。

pandas 对照中，isna、duplicated、clip、drop_duplicates、fillna 和分组统计能帮助学生定位问题。每次处理都要回答三个问题：删除或替换了多少行，是否集中影响某个群体，处理规则在预测时能否执行。`,
          md`Cleaning is not deleting everything that looks untidy. Missing values may mean not collected, did not happen, not applicable, or refused by the user; bad values may come from parsing errors; duplicates may come from log retries; outliers may be real minority cases. This matters because different problems need different policies, and blanket deletion often changes the training distribution.

In pandas, isna, duplicated, clip, drop_duplicates, fillna, and grouped summaries help locate issues. Every treatment should answer three questions: how many rows were deleted or replaced, did the rule affect a group disproportionately, and can the same rule run at prediction time?`,
        ),
        { visualIds: ['cleaning-flow'], labIds: ['cleaning-pipeline-lab'] },
      ),
      section(
        'labels-and-leakage',
        copy('标签定义是训练反馈的根', 'Label Definition Is the Root of Training Feedback'),
        copy(
          md`标签不是自然出现的真理，它来自业务规则、人工标注、传感器、日志或未来结果。为什么重要：模型优化的就是标签，如果标签定义错了，模型会把错误当成正确答案。学生要能说清楚标签表示什么，何时可知，由谁产生，是否有噪声，不同标注者是否一致。

答案泄漏是标签问题中最危险的一类。比如用“成交后生成的评价”预测“是否会成交”，模型会学到未来信息；验证分数可能非常高，但上线时信息不存在。课堂练习应让学生把每个特征放到时间线上，标出预测时刻之前和之后。`,
          md`A label is not naturally occurring truth; it comes from business rules, human annotation, sensors, logs, or future outcomes. This matters because the model optimizes the label. If the label definition is wrong, the model treats wrong feedback as the answer. Students should state what the label means, when it is known, who produced it, whether it is noisy, and whether annotators agree.

Target leakage is one of the most dangerous label problems. For example, using a review generated after sale to predict whether a sale will happen lets the model learn future information. Validation may look excellent, but the signal will not exist at serving time. A classroom exercise should place each feature on a timeline before and after prediction time.`,
        ),
      ),
      section(
        'imbalance-and-baselines',
        copy('不平衡数据先看基线和任务成本', 'Imbalanced Data Needs Baselines and Task Costs First'),
        copy(
          md`类别不平衡时，单一准确率很容易误导学生。多数类基线是第一步：如果 95% 的样本都是否定类，那么一个什么都不学的模型也可能有 95% 准确率。为什么重要：模型评估必须结合召回率、精确率、混淆矩阵、阈值和任务成本，否则少数类错误会被总体指标掩盖。

在数据实验室里，重点是先发现比例问题。pandas 的 value_counts(normalize=True) 和 groupby 可以检查不平衡是否集中在地区、设备、时间或采集渠道。学生要学会问：少数类样本够不够，是否需要更多数据，是否需要不同指标，而不是只追求更高 accuracy。`,
          md`With class imbalance, raw accuracy easily misleads students. The majority-class baseline comes first: if 95% of examples are negative, a model that learns nothing may still reach 95% accuracy. This matters because evaluation must include recall, precision, confusion matrices, thresholds, and task cost; otherwise minority-class errors are hidden inside aggregate metrics.

In Data Lab, the focus is to discover the proportion problem early. pandas value_counts(normalize=True) and groupby can check whether imbalance concentrates by region, device, time, or collection channel. Students should ask whether the minority class has enough examples, whether more data is needed, and whether different metrics are required, not only how to raise accuracy.`,
        ),
      ),
      section(
        'quality-report',
        copy('把 EDA 写成数据质量报告', 'Write Exploratory Analysis as a Data-quality Report'),
        copy(
          md`探索性分析不是画几张漂亮图，而是为建模决策提供证据。一个合格的数据质量报告应包含：样本来源、时间范围、行列 shape、列语义、缺失率、异常处理、标签定义、类别比例、主要分组差异、训练前风险和后续需要补采的数据。为什么重要：报告让团队能复查数据处理决策，也让学生知道模型表现不是孤立数字。

课堂交付可以是一页表格：每个问题对应一个 pandas 检查、一个发现、一个处理建议和一个风险等级。这样学生能把 EDA 从“看图”提升为“形成可解释结论”。`,
          md`Exploratory analysis is not drawing pretty charts; it provides evidence for modeling decisions. A useful data-quality report includes data collection context, time range, row/column shape, column semantics, missing rates, anomaly handling, label definition, class proportions, major group differences, pre-training risks, and data that still needs to be collected. This matters because reports make processing decisions reviewable and teach students that model performance is not an isolated number.

A classroom deliverable can be a one-page table: each issue maps to a pandas check, a finding, a suggested treatment, and a risk level. Students then move from looking at charts to forming explainable conclusions.`,
        ),
        { visualIds: ['pandas-shape-audit'], labIds: ['eda-workbench-lab'] },
      ),
    ],
    visuals: [
      image('eda-board', 'eda-investigation-board-v2.png', copy('数据质量调查板', 'Data-quality investigation board'), copy('建模前先检查样本、列、标签、比例和时间窗口。', 'Before modeling, inspect examples, columns, labels, proportions, and time windows.'), [
        { id: 'shape', x: 16, y: 18, label: copy('表格形状', 'shape') },
        { id: 'missing', x: 36, y: 18, label: copy('缺失', 'missing') },
        { id: 'label', x: 56, y: 18, label: copy('标签', 'labels') },
        { id: 'imbalance', x: 77, y: 18, label: copy('比例', 'proportion') },
        { id: 'report', x: 50, y: 84, label: copy('质量报告', 'report') },
      ]),
      image('cleaning-flow', 'data-cleaning-preprocessing.png', copy('清洗流程', 'Cleaning workflow'), copy('不同数据问题需要不同处理策略，并记录对训练样本的影响。', 'Different data problems need different treatments, with training impact recorded.'), [
        { id: 'missing', x: 13, y: 28, label: copy('缺失', 'Missing') },
        { id: 'bad', x: 34, y: 28, label: copy('坏值', 'Bad values') },
        { id: 'duplicate', x: 55, y: 28, label: copy('重复', 'Duplicate') },
        { id: 'outlier', x: 77, y: 28, label: copy('离群', 'Outlier') },
      ]),
      image('pandas-shape-audit', 'pandas-shape-audit-v2.png', copy('shape 审计链', 'Shape-audit chain'), copy('每个数据变换都要记录输入输出 shape、列语义和参数。', 'Every transform records input/output shape, column meaning, and parameters.'), [
        { id: 'input', x: 11, y: 28, label: copy('输入表', 'Input table') },
        { id: 'select', x: 25, y: 16, label: copy('选择', 'Select') },
        { id: 'filter', x: 39, y: 16, label: copy('过滤', 'Filter') },
        { id: 'assign', x: 53, y: 16, label: copy('派生', 'Assign') },
        { id: 'audit', x: 50, y: 88, label: copy('审计 shape', 'Audit shape') },
      ]),
      video('cleaning-video', 'data-cleaning-flow', copy('清洗动画', 'Cleaning animation'), copy('展示缺失、坏值和离群点如何进入处理策略。', 'Shows missing values, bad values, and outliers entering treatment policies.')),
      video('eda-video', 'eda-split-apply', copy('EDA 分组动画', 'EDA grouped-analysis animation'), copy('展示分组统计如何暴露比例和质量问题。', 'Shows grouped statistics exposing proportion and quality issues.')),
    ],
    labs: [
      lab('cleaning-pipeline-lab', copy('清洗策略实验室', 'Cleaning Policy Lab'), 'CleaningPipelineLab', [
        copy('能比较删除、补值、裁剪和保留异常的后果。', 'Compare deletion, imputation, clipping, and anomaly retention.'),
        copy('能说明清洗策略如何改变样本集合。', 'Explain how cleaning policies change the example set.'),
      ]),
      lab('eda-workbench-lab', copy('数据质量工作台', 'Data Quality Workbench'), 'EdaWorkbenchLab', [
        copy('能用分布和分组统计发现数据风险。', 'Use distributions and grouped statistics to find data risks.'),
        copy('能把发现写成建模前质量结论。', 'Write findings as pre-modeling quality conclusions.'),
      ]),
    ],
    quizzes: [
      quiz('drop-missing', copy('缺失值多的行是否应该一律删除？', 'Should rows with missing values always be deleted?'), 'no', copy('不应该，应先理解缺失机制和影响范围。', 'No. Understand the missingness mechanism and impact first.'), copy('应该，删除后表格最干净。', 'Yes, because the table becomes clean.'), copy('统一删除可能改变训练人群。', 'Blanket deletion can change the training population.')),
      quiz('label-timing', copy('预测成交前结果时，可以使用成交后产生的信息吗？', 'Can post-sale information be used to predict a pre-sale outcome?'), 'no', copy('不能，这是答案泄漏。', 'No. That is target leakage.'), copy('可以，只要分数更高。', 'Yes, if the score becomes higher.'), copy('特征必须在预测时刻已经可用。', 'Features must be available at prediction time.')),
      quiz('imbalance-accuracy', copy('正类只有 1% 时，99% accuracy 一定好吗？', 'If positives are 1%, is 99% accuracy always good?'), 'no', copy('不一定，可能只是全部预测负类。', 'Not necessarily. It may predict every example as negative.'), copy('一定很好。', 'Definitely good.'), copy('要结合基线、召回率和任务成本。', 'Use baselines, recall, and task cost.')),
    ],
    misconceptions: [
      misconception('eda-decoration', copy('EDA 只是做几张图。', 'EDA is just making charts.'), copy('EDA 的目标是产生可复查的数据质量结论。', 'EDA should produce reviewable data-quality conclusions.'), copy('每张图后面都应有发现和下一步。', 'Each chart should lead to a finding and next step.')),
      misconception('labels-perfect', copy('标签总是正确答案。', 'Labels are always correct answers.'), copy('标签可能有噪声、延迟、定义错误或标注不一致。', 'Labels can be noisy, delayed, misdefined, or inconsistent.'), copy('模型会学习标签里的错误。', 'A model learns errors in labels.')),
      misconception('outlier-delete', copy('离群点都应该删除。', 'All outliers should be deleted.'), copy('离群点可能是真实少数情况，必须先解释。', 'Outliers may be real minority cases and must be interpreted first.'), copy('豪宅价格可能是真实信号，不一定是坏值。', 'A luxury-house price may be real signal, not necessarily a bad value.')),
    ],
    sourceReferences: refs('dataQuality', 'pandasMissing', 'pandasVisualization', 'pandasGroupby'),
  }),
  moduleDefinition({
    id: 'splits-generalization',
    order: 4,
    title: copy('划分与泛化：让评估像未来一样未知', 'Splits and Generalization: Make Evaluation Look Like the Future'),
    subtitle: copy(
      '理解训练集、验证集和测试集各自的职责，并学会把变换参数只从训练集学习。',
      'Understand the roles of training, validation, and test sets, and learn to fit transform parameters only from training data.',
    ),
    accent: '#16a34a',
    theme: '#eefbf1',
    estimatedMinutes: 78,
    learningObjectives: [
      copy('说明训练集、验证集和测试集的职责边界。', 'Explain the responsibilities of training, validation, and test sets.'),
      copy('判断随机划分、分层划分和时间划分分别适合什么场景。', 'Choose among random, stratified, and time-based splits by scenario.'),
      copy('解释 fit/transform 规则以及为什么变换参数只能从训练集学习。', 'Explain fit/transform and why transform parameters are learned from training data only.'),
      copy('用训练和验证表现判断泛化差距。', 'Use training and validation behavior to judge generalization gaps.'),
      copy('写出可复查的数据划分和处理协议。', 'Write reviewable data-splitting and processing protocols.'),
    ],
    concepts: [
      concept('train-set', copy('训练集', 'Training Set'), copy('训练集用于学习模型参数和数据处理参数，例如缩放均值、词表和补值中位数。', 'Training data fits model parameters and processing parameters such as scaling means, vocabularies, and imputation medians.'), copy('模型权重和标准化均值都从训练集得到。', 'Model weights and standardization means both come from training data.')),
      concept('validation-set', copy('验证集', 'Validation Set'), copy('验证集用于比较模型、超参数和特征方案，不参与拟合。', 'Validation data compares models, hyperparameters, and feature choices without fitting them.'), copy('选择分箱粒度、正则化强度和停止轮数时看验证表现。', 'Validation behavior helps choose bin granularity, regularization strength, and stopping epoch.')),
      concept('test-set', copy('测试集', 'Test Set'), copy('测试集用于最终确认，越少使用越能保持独立性。', 'Test data provides final confirmation; using it less preserves independence.'), copy('反复用测试集调参，会让它退化成验证集。', 'Repeated test-set tuning turns it into validation data.')),
      concept('generalization', copy('泛化', 'Generalization'), copy('泛化指模型在未见样本上的表现。训练分数高只能说明模型解释了训练数据。', 'Generalization is performance on unseen examples. A high training score only means the model explains training data.'), copy('训练 loss 下降而验证 loss 上升，通常提示过拟合风险。', 'Falling training loss with rising validation loss usually signals overfitting risk.')),
    ],
    sections: [
      section(
        'split-contract',
        copy('数据划分是一份评估契约', 'A Data Split Is an Evaluation Contract'),
        copy(
          md`训练、验证和测试不是随便切三份表。训练集用于学习，验证集用于选择，测试集用于最终确认。为什么重要：如果同一批样本既参与选择又参与最终报告，评估就会变得过于乐观。学生要理解，划分的目的不是形式上有三个文件，而是模拟模型遇到未知样本的过程。

课堂上可以用一个简单问题检查理解：如果模型在训练集表现很好，在验证集表现很差，说明什么？答案不是“验证集有问题”，而是模型可能没有学到能跨样本成立的规律。`,
          md`Training, validation, and test sets are not arbitrary table slices. Training data is for learning, validation data is for choosing, and test data is for final confirmation. This matters because if the same examples participate in both selection and final reporting, evaluation becomes too optimistic. Students should understand that splitting is not about having three files; it is about simulating unknown examples.

A classroom check is simple: if a model performs well on training data and poorly on validation data, what does that mean? The answer is not automatically that validation is bad; the model may not have learned a pattern that holds across examples.`,
        ),
      ),
      section(
        'split-strategies',
        copy('随机、分层和时间划分服务于不同问题', 'Random, Stratified, and Time-based Splits Serve Different Problems'),
        copy(
          md`随机划分适合样本独立且分布稳定的场景。分层划分适合类别不平衡场景，确保训练、验证和测试中类别比例相近。时间划分适合未来预测问题，让验证和测试发生在训练时间之后。为什么重要：错误划分会让评估看起来好，却无法代表真实使用场景。

学生需要把划分策略和任务联系起来：预测明天的销量不能让未来数据进入训练；评估罕见疾病分类不能让验证集没有正例；同一用户的多条记录如果分散到不同集合，可能让模型间接见过同一个人。`,
          md`Random splits work when examples are independent and distribution is stable. Stratified splits help with class imbalance by keeping proportions similar across train, validation, and test. Time-based splits fit future-prediction tasks by placing validation and test after the training period. This matters because the wrong split can look good while failing to represent real use.

Students should connect split strategy to task: predicting tomorrow's sales must not train on future data; evaluating rare-disease classification cannot leave validation with no positives; records from the same user split across sets may let the model indirectly see the same person.`,
        ),
      ),
      section(
        'fit-transform-rule',
        copy('变换参数只能从训练集学习', 'Transform Parameters Come from Training Data Only'),
        copy(
          md`数据处理也有“训练”。标准化均值、缺失值中位数、分箱边界、类别词表、低频阈值和输出列顺序，都是从数据中学来的参数。为什么重要：如果这些参数从全量数据估计，验证和测试的信息就泄漏进了训练流程，分数会高估模型能力。

正确规则是 fit on train, transform everywhere。先在训练集上估计处理参数，再把同一套参数应用到验证、测试和新样本。pandas 中可以用中间变量明确区分 train_stats、train_vocab、transform_train、transform_valid，让学生看见参数从哪里来。`,
          md`Data processing also has a training phase. Standardization means, imputation medians, bin edges, category vocabularies, rare thresholds, and output column order are parameters learned from data. This matters because estimating them from all data leaks validation and test information into the training workflow and overstates model ability.

The rule is fit on train, transform everywhere. Estimate processing parameters on training data, then apply the same parameters to validation, test, and new examples. In pandas, intermediate variables such as train_stats, train_vocab, transform_train, and transform_valid make parameter origin visible.`,
        ),
        { visualIds: ['pandas-shape-audit'], labIds: ['pandas-pipeline-lab'] },
      ),
      section(
        'generalization-gap',
        copy('泛化差距比训练分数更重要', 'The Generalization Gap Matters More Than Training Score'),
        copy(
          md`训练分数回答“模型是否解释了训练样本”，验证分数回答“这个解释是否能用于未见样本”。两者之间的差距就是泛化差距。为什么重要：机器学习的价值来自新样本表现，而不是背诵旧样本。训练 loss 很低但验证 loss 很高，通常说明模型太复杂、特征泄漏、数据划分不代表未来，或者训练样本噪声被记住了。

学生读曲线时要同时看训练和验证：两条都高可能欠拟合或特征不足；训练低验证高可能过拟合；两条都震荡可能学习率、尺度或坏数据有问题。数据实验室关注的是这些曲线背后的数据原因。`,
          md`Training score answers whether the model explains training examples; validation score asks whether that explanation transfers to unseen examples. The difference is the generalization gap. This matters because machine learning creates value on new examples, not memorized old ones. Low training loss with high validation loss often means excessive complexity, leakage, unrepresentative splits, or memorized noise.

Students should read training and validation curves together: both high may mean underfitting or insufficient features; low train and high validation may mean overfitting; both oscillating may point to learning rate, scale, or bad data. Data Lab focuses on data-side causes behind these curves.`,
        ),
      ),
      section(
        'split-protocol',
        copy('把划分和变换写成协议', 'Write Splits and Transforms as a Protocol'),
        copy(
          md`可复查的数据协议至少记录：随机种子、划分策略、时间边界、分层列、训练集拟合出的参数、输出列顺序、每一步输入输出 shape，以及哪些列在预测时可用。为什么重要：没有协议，下一次重训可能悄悄改变评估含义；有了协议，学生和团队才能复现模型输入。

课堂练习可以让学生把一段 pandas 代码拆成 fit 和 transform 两部分，并解释哪些变量应保存到模型工件中。这样他们会看到“数据准备”不是临时脚本，而是模型系统的一部分。`,
          md`A reviewable data protocol records at least random seed, split strategy, time boundary, stratification column, parameters fit on training data, output column order, input/output shape at each step, and which columns are available at prediction time. This matters because without a protocol, retraining may silently change evaluation meaning; with one, students and teams can reproduce model inputs.

A classroom exercise can split pandas code into fit and transform phases, then explain which variables belong in the model artifact. Students then see that data preparation is not a temporary script but part of the model system.`,
        ),
        { visualIds: ['pandas-workflow'], labIds: ['pandas-pipeline-lab'] },
      ),
    ],
    visuals: [
      image('pandas-shape-audit', 'pandas-shape-audit-v2.png', copy('划分后的 shape 审计', 'Post-split shape audit'), copy('训练、验证和测试要记录 shape、列顺序和参数来源。', 'Train, validation, and test need recorded shape, column order, and parameter origin.'), [
        { id: 'input', x: 11, y: 28, label: copy('输入表', 'Input table') },
        { id: 'select', x: 25, y: 16, label: copy('划分', 'Split') },
        { id: 'filter', x: 39, y: 16, label: copy('拟合参数', 'fit') },
        { id: 'assign', x: 53, y: 16, label: copy('应用变换', 'transform') },
        { id: 'audit', x: 50, y: 88, label: copy('审计', 'Audit') },
      ]),
      image('pandas-workflow', 'pandas-workflow.png', copy('划分与变换协议', 'Split and transform protocol'), copy('把划分、变换和保存参数组织成可复用的数据协议。', 'Turn splits, transforms, and saved parameters into a reusable data protocol.'), [
        { id: 'input', x: 16, y: 13, label: copy('输入', 'Input') },
        { id: 'chain', x: 52, y: 13, label: copy('协议', 'Protocol') },
        { id: 'output', x: 83, y: 13, label: copy('输出', 'Output') },
        { id: 'shape', x: 51, y: 84, label: copy('检查 shape', 'Check shape') },
      ]),
      video('pandas-method-chain-video', 'pandas-method-chain', copy('pandas 链式处理动画', 'pandas method-chain animation'), copy('展示表格如何经过过滤、派生、聚合和连接。', 'Shows a table moving through filter, assign, aggregate, and merge.')),
    ],
    labs: [
      lab('pandas-pipeline-lab', copy('划分与变换实验室', 'Split and Transform Lab'), 'PandasPipelineLab', [
        copy('能解释 fit 参数只来自训练集。', 'Explain why fit parameters come from training data only.'),
        copy('能用 shape 审计发现划分或变换错误。', 'Use shape audits to find split or transform mistakes.'),
      ]),
    ],
    quizzes: [
      quiz('test-tuning', copy('测试集可以频繁用于调参吗？', 'Can the test set be used frequently for tuning?'), 'no', copy('不可以，频繁使用会让它失去独立性。', 'No. Frequent use destroys its independence.'), copy('可以，越频繁越可靠。', 'Yes, more frequent use is more reliable.'), copy('调参应该依赖训练/验证循环。', 'Tuning should rely on the train/validation loop.')),
      quiz('fit-transform', copy('验证集可以计算自己的缩放均值吗？', 'Can validation data compute its own scaling mean?'), 'no', copy('不能，应复用训练集均值。', 'No. It should reuse the training mean.'), copy('可以，这样更贴合验证集。', 'Yes, to fit validation better.'), copy('验证集要模拟未知样本。', 'Validation should simulate unseen examples.')),
      quiz('time-split', copy('预测未来销量时，哪种划分通常更合理？', 'For future sales prediction, which split is usually more appropriate?'), 'time', copy('按时间划分。', 'A time-based split.'), copy('随便打乱即可。', 'Any random shuffle.'), copy('未来预测要让验证和测试发生在训练之后。', 'Future prediction should place validation and test after training time.')),
    ],
    misconceptions: [
      misconception('split-after-preprocess', copy('可以先全量预处理，再划分数据。', 'It is fine to preprocess all data before splitting.'), copy('会让验证和测试信息进入处理参数，造成泄漏。', 'That lets validation and test information enter processing parameters and creates leakage.'), copy('均值、词表和分箱边界都要从训练集学习。', 'Means, vocabularies, and bin edges are learned from training data.')),
      misconception('training-score', copy('训练分数高就说明模型好。', 'High training score means the model is good.'), copy('训练分数只说明模型解释了训练样本，还要看未见样本。', 'Training score only shows fit to training examples; unseen examples matter.'), copy('泛化差距才是上线前的核心信号。', 'The generalization gap is the core pre-release signal.')),
      misconception('random-always', copy('任何任务都适合随机划分。', 'Random splitting fits every task.'), copy('时间预测、同用户多记录和不平衡任务常常需要特殊划分。', 'Time prediction, repeated users, and imbalanced tasks often need special splits.'), copy('划分方式要服务于真实使用场景。', 'Split strategy should match real use.')),
    ],
    sourceReferences: refs('splitting', 'pandasIntro', 'pandasGroupby'),
  }),
  moduleDefinition({
    id: 'complexity-regularization',
    order: 5,
    title: copy('复杂度、正则化与损失曲线', 'Complexity, Regularization, and Loss Curves'),
    subtitle: copy(
      '把特征工程和训练诊断连接起来，理解为什么更复杂的输入需要验证集、正则化和曲线判断。',
      'Connect feature engineering to training diagnostics and understand why more complex inputs need validation, regularization, and curve reading.',
    ),
    accent: '#be123c',
    theme: '#fff1f4',
    estimatedMinutes: 82,
    learningObjectives: [
      copy('说明特征数量、交叉、分箱细度和多项式阶数如何提高复杂度。', 'Explain how feature count, crosses, bin granularity, and polynomial degree increase complexity.'),
      copy('用训练和验证曲线区分欠拟合、合适拟合和过拟合。', 'Use training and validation curves to distinguish underfitting, useful fit, and overfitting.'),
      copy('解释 L2 正则化如何限制过大的权重。', 'Explain how L2 regularization limits overly large weights.'),
      copy('说明提前停止为什么依赖独立验证集。', 'Explain why early stopping depends on independent validation data.'),
      copy('把复杂度控制写回数据报告和课堂结论。', 'Write complexity-control decisions back into the data report and classroom conclusions.'),
    ],
    concepts: [
      concept('complexity', copy('复杂度', 'Complexity'), copy('复杂度来自模型参数，也来自输入空间：更多特征、更多交叉、更细分箱和更高阶变换都会提高复杂度。', 'Complexity comes from model parameters and the input space: more features, more crosses, finer bins, and higher-degree transforms all increase it.'), copy('8 个地区与 5 个房型交叉，最多产生 40 个局部槽位。', 'Crossing 8 districts with 5 property types can create up to 40 local slots.')),
      concept('overfitting', copy('过拟合', 'Overfitting'), copy('过拟合指模型把训练样本中的噪声、偶然组合或泄漏信号当成规律。', 'Overfitting means the model treats noise, accidental combinations, or leakage in training examples as patterns.'), copy('训练 loss 继续下降而验证 loss 上升，是常见警报。', 'Training loss falling while validation loss rises is a common warning.')),
      concept('l2', copy('L2 正则化', 'L2 Regularization'), copy('L2 在目标函数中惩罚大权重，鼓励模型用更平滑、更不极端的参数解释数据。', 'L2 penalizes large weights in the objective and encourages smoother, less extreme parameters.'), copy('稀有交叉槽位如果权重暴涨，L2 会提高它的代价。', 'If a rare cross slot gets a huge weight, L2 raises its cost.')),
      concept('early-stopping', copy('提前停止', 'Early Stopping'), copy('提前停止在验证表现开始恶化时结束训练，避免模型继续记住训练噪声。', 'Early stopping ends training when validation behavior worsens, preventing continued memorization of training noise.'), copy('第 40 轮后训练 loss 降、验证 loss 升，停止点可能在第 40 轮附近。', 'If train loss falls and validation loss rises after epoch 40, the stopping point may be near epoch 40.')),
    ],
    sections: [
      section(
        'input-complexity',
        copy('复杂度不只来自算法，也来自数据表示', 'Complexity Comes from Data Representation Too'),
        copy(
          md`学生常以为复杂度只由模型类型决定，其实数据表示本身就会改变复杂度。多项式特征、过细分箱、高基数 one-hot 和大量特征交叉都会扩大输入空间。为什么重要：输入越宽，模型越容易在训练集找到看似有效的局部规律，也越需要验证集证明这些规律能泛化。

课堂上可以让学生数一数维度：原始 5 列输入可能经过 one-hot 和交叉后变成几百列。这个维度增长不是抽象数字，它意味着更多参数、更稀疏样本和更多过拟合机会。`,
          md`Students often think complexity comes only from model type, but data representation also changes it. Polynomial features, overly fine bins, high-cardinality one-hot, and many feature crosses all expand the input space. This matters because wider inputs make it easier to find training-only local patterns and require validation evidence for generalization.

In class, ask students to count dimensions: five raw input columns may become hundreds after one-hot and crosses. That growth is not abstract; it means more parameters, sparser examples, and more opportunities to overfit.`,
        ),
      ),
      section(
        'overfit-underfit-curves',
        copy('用曲线区分欠拟合和过拟合', 'Use Curves to Separate Underfitting and Overfitting'),
        copy(
          md`训练曲线和验证曲线要一起读。两条曲线都高，说明模型可能太简单、特征不足、优化失败或数据质量差；训练曲线低而验证曲线高，说明模型在训练集上找到了不能泛化的规律。为什么重要：单看一个最终分数很难知道该改数据、改特征、改模型还是改训练过程。

学生可以把曲线当作诊断面板：发散可能来自学习率过大或特征尺度混乱；平台期可能表示信号不足；训练验证差距扩大可能来自过多交叉、标签噪声或划分错误。`,
          md`Training and validation curves must be read together. If both are high, the model may be too simple, features may be insufficient, optimization may fail, or data quality may be poor. If training is low and validation is high, the model has found training patterns that do not generalize. This matters because one final score rarely tells whether to change data, features, model, or training.

Students can treat curves as a diagnostic panel: divergence may come from high learning rate or messy feature scale; plateaus may signal insufficient information; a widening train/validation gap may come from too many crosses, label noise, or split mistakes.`,
        ),
        { visualIds: ['curve-diagnosis'], labIds: ['eda-workbench-lab'] },
      ),
      section(
        'l2-budget',
        copy('L2 正则化给权重设置预算', 'L2 Regularization Sets a Weight Budget'),
        copy(
          md`L2 正则化会把权重平方和加入损失函数。直观地说，它让模型为过大的权重付出代价，因此模型更倾向于使用多个稳定信号，而不是极端依赖少数稀有槽位。为什么重要：高维稀疏输入中，某些偶然组合可能在训练集上特别有效；L2 会限制这种过度敏感。

正则化不是简单地“削弱模型”。合适的正则化是在训练拟合和泛化之间设置预算。课堂练习可以让学生观察不同 L2 强度下训练 loss、验证 loss 和权重大小如何变化。`,
          md`L2 regularization adds the sum of squared weights to the loss. Intuitively, it makes very large weights costly, so the model prefers using multiple stable signals rather than depending extremely on rare slots. This matters because in high-dimensional sparse inputs, accidental combinations may look powerful on training data; L2 limits that sensitivity.

Regularization is not simply weakening a model. Appropriate regularization sets a budget between training fit and generalization. A classroom exercise can compare training loss, validation loss, and weight sizes under different L2 strengths.`,
        ),
      ),
      section(
        'early-stopping-validation',
        copy('提前停止用验证集控制训练时间', 'Early Stopping Uses Validation to Control Training Time'),
        copy(
          md`训练时间越长，模型越有机会继续降低训练 loss，但这不保证未见样本表现变好。提前停止把验证曲线变成训练控制器：当验证表现不再改善，甚至开始恶化时，停止训练。为什么重要：它是一种复杂度控制方法，依赖的前提是验证集没有参与拟合参数。

如果验证集已经参与缩放、词表或补值参数估计，提前停止点也会被污染。学生要把这一章和上一章连起来：独立验证集不只是评估工具，也是训练控制工具。`,
          md`Longer training gives a model more opportunity to lower training loss, but that does not guarantee better unseen performance. Early stopping turns the validation curve into a training controller: when validation stops improving or worsens, training stops. This matters because it is a complexity-control method whose premise is that validation data did not fit parameters.

If validation data participated in scaling, vocabulary, or imputation parameter estimation, the stopping point is also contaminated. Students should connect this chapter to the previous one: independent validation is not only for evaluation but also for training control.`,
        ),
      ),
      section(
        'complexity-report',
        copy('把复杂度选择写成可复查结论', 'Write Complexity Choices as Reviewable Conclusions'),
        copy(
          md`课程最后要把数据处理、特征工程和训练诊断合在一起。一个可复查结论应说明：保留哪些特征，删除哪些交叉，为什么选择这个分箱粒度，正则化强度如何影响验证曲线，提前停止点在哪里。为什么重要：当下一次模型表现变化时，团队才能判断变化来自数据分布、特征工程还是训练策略。

课堂交付可以是一份“复杂度控制报告”：每个新增特征必须写出假设、维度增长、验证收益和风险。这样学生会明白，机器学习不是堆更多特征，而是用证据控制表达能力。`,
          md`The final course step combines data processing, feature engineering, and training diagnosis. A reviewable conclusion states which features were kept, which crosses were removed, why a bin granularity was chosen, how regularization strength affected validation curves, and where early stopping landed. This matters because when model behavior changes later, the team can tell whether the cause was data distribution, feature engineering, or training strategy.

A classroom deliverable can be a complexity-control report: every added feature must list its hypothesis, dimension growth, validation benefit, and risk. Students then learn that machine learning is not stacking more features, but controlling expressiveness with evidence.`,
        ),
        { visualIds: ['pandas-workflow'] },
      ),
    ],
    visuals: [
      image('curve-diagnosis', 'eda-investigation-board-v2.png', copy('曲线诊断前的数据面板', 'Data panel before curve diagnosis'), copy('损失曲线异常常常可以追溯到尺度、标签、类别比例或划分问题。', 'Abnormal loss curves often trace back to scale, labels, class proportions, or split problems.'), [
        { id: 'scale', x: 15, y: 19, label: copy('尺度', 'scale') },
        { id: 'label', x: 36, y: 20, label: copy('标签', 'labels') },
        { id: 'class', x: 57, y: 20, label: copy('比例', 'proportion') },
        { id: 'split', x: 78, y: 20, label: copy('划分', 'split') },
        { id: 'report', x: 50, y: 86, label: copy('诊断', 'diagnosis') },
      ]),
      image('pandas-workflow', 'pandas-workflow.png', copy('复杂度控制报告', 'Complexity-control report'), copy('把特征维度、交叉、正则化和验证曲线选择记录成报告。', 'Record feature dimension, crosses, regularization, and validation-curve choices as a report.'), [
        { id: 'features', x: 16, y: 13, label: copy('特征', 'Features') },
        { id: 'controls', x: 52, y: 13, label: copy('约束', 'Controls') },
        { id: 'curves', x: 83, y: 13, label: copy('曲线', 'Curves') },
        { id: 'report', x: 51, y: 84, label: copy('报告', 'Report') },
      ]),
      video('pandas-method-chain-video', 'pandas-method-chain', copy('数据报告流水线动画', 'Data-report pipeline animation'), copy('展示表格处理如何留下可复查的中间结果。', 'Shows how table processing leaves reviewable intermediate results.')),
    ],
    labs: [
      lab('eda-workbench-lab', copy('复杂度诊断工作台', 'Complexity Diagnosis Workbench'), 'EdaWorkbenchLab', [
        copy('能把损失曲线异常追溯到可能的数据原因。', 'Trace loss-curve symptoms to possible data-side causes.'),
        copy('能说明正则化和提前停止如何依赖验证集。', 'Explain how regularization and early stopping depend on validation data.'),
      ]),
    ],
    quizzes: [
      quiz('more-features', copy('增加交叉和高阶多项式通常会带来什么风险？', 'What risk comes with adding crosses and high-degree polynomial features?'), 'overfit', copy('复杂度和过拟合风险上升。', 'Complexity and overfitting risk rise.'), copy('一定降低泛化误差。', 'It always lowers generalization error.'), copy('表达能力提高需要验证集和正则化约束。', 'More expressiveness needs validation and regularization constraints.')),
      quiz('l2-target', copy('L2 正则化主要惩罚什么？', 'What does L2 regularization mainly penalize?'), 'weights', copy('过大的权重。', 'Large weights.'), copy('缺失值数量。', 'Missing-value count.'), copy('L2 通过权重预算降低模型对少数信号的过度敏感。', 'L2 lowers excessive sensitivity by budgeting weights.')),
      quiz('early-stop-curve', copy('提前停止主要依赖哪类数据的表现？', 'Early stopping mainly depends on which data behavior?'), 'validation', copy('验证集表现。', 'Validation behavior.'), copy('只看训练集表现。', 'Training behavior only.'), copy('停止点应由未参与拟合的数据提供。', 'The stopping point should come from data not used for fitting.')),
    ],
    misconceptions: [
      misconception('feature-more-safe', copy('特征越多越安全。', 'More features are always safer.'), copy('特征越多，输入空间越宽，越需要验证和正则化。', 'More features widen input space and require validation plus regularization.'), copy('高基数 one-hot 可能让模型记住训练样本。', 'High-cardinality one-hot may help a model memorize training examples.')),
      misconception('regularization-bad', copy('正则化只是让模型变差。', 'Regularization only makes models worse.'), copy('合适正则化是在训练拟合和泛化之间设置预算。', 'Appropriate regularization budgets between training fit and generalization.'), copy('验证曲线决定约束是否过强。', 'Validation curves show whether the constraint is too strong.')),
      misconception('curves-model-only', copy('损失曲线只反映模型问题。', 'Loss curves only reflect model problems.'), copy('曲线也会暴露尺度、标签、划分和坏数据问题。', 'Curves can also expose scale, label, split, and bad-data problems.'), copy('发散可能来自学习率，也可能来自未缩放特征。', 'Divergence may come from learning rate or unscaled features.')),
    ],
    sourceReferences: refs('complexity', 'pandasVisualization', 'pandasGroupby'),
  }),
]

export const dataLabModuleRegistry = Object.fromEntries(
  dataLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]),
) as Record<DataLabModuleId, DataLabModule>
