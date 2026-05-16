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
import { categoricalDataModule } from './categoricalDataModule.ts'

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

const sources = {
  googleNumerical: {
    label: copy('Google MLCC：数值数据', 'Google MLCC: Numerical data'),
    href: 'https://developers.google.com/machine-learning/crash-course/numerical-data',
    license: 'CC BY 4.0',
    usage: copy(
      '校准数值特征、分布、离群点、好特征条件和特征向量的入门边界。',
      'Calibrates numerical features, distributions, outliers, good-feature criteria, and feature-vector boundaries.',
    ),
  },
  googleScrubbing: {
    label: copy('Google MLCC：数据清洗', 'Google MLCC: Scrubbing'),
    href: 'https://developers.google.com/machine-learning/crash-course/numerical-data/scrubbing',
    license: 'CC BY 4.0',
    usage: copy(
      '校准缺失值、重复、坏数据、尺度问题和清洗策略对训练的影响。',
      'Calibrates missing values, duplicates, bad data, scale issues, and their training impact.',
    ),
  },
  googleNormalization: {
    label: copy('Google MLCC：归一化', 'Google MLCC: Normalization'),
    href: 'https://developers.google.com/machine-learning/crash-course/numerical-data/normalization',
    license: 'CC BY 4.0',
    usage: copy(
      '校准缩放、分箱、极端范围和训练/预测一致性的教学边界。',
      'Calibrates scaling, binning, extreme ranges, and train/predict consistency.',
    ),
  },
  googleCategorical: {
    label: copy('Google MLCC：类别数据', 'Google MLCC: Categorical data'),
    href: 'https://developers.google.com/machine-learning/crash-course/categorical-data',
    license: 'CC BY 4.0',
    usage: copy(
      '校准类别特征、词表、稀疏表示和高基数风险。',
      'Calibrates categorical features, vocabularies, sparse representations, and high-cardinality risk.',
    ),
  },
  googleOneHot: {
    label: copy('Google MLCC：one-hot 编码', 'Google MLCC: One-hot encoding'),
    href: 'https://developers.google.com/machine-learning/crash-course/categorical-data/one-hot-encoding',
    license: 'CC BY 4.0',
    usage: copy(
      '校准 one-hot 向量、未知类别和类别词表的教学解释。',
      'Calibrates one-hot vectors, unknown categories, and category vocabulary teaching.',
    ),
  },
  pandasIntro: {
    label: copy('pandas：DataFrame 入门', 'pandas: DataFrame intro'),
    href: 'https://pandas.pydata.org/docs/getting_started/intro_tutorials/01_table_oriented.html',
    usage: copy(
      '校准 DataFrame、Series、列选择、行过滤和表格心智模型。',
      'Calibrates DataFrame, Series, column selection, row filtering, and the table mental model.',
    ),
  },
  pandasMissing: {
    label: copy('pandas：缺失数据', 'pandas: Missing data'),
    href: 'https://pandas.pydata.org/docs/user_guide/missing_data.html',
    usage: copy(
      '校准 isna、notna、dropna、fillna 和缺失值传播语义。',
      'Calibrates isna, notna, dropna, fillna, and missing-value propagation semantics.',
    ),
  },
  pandasGroupby: {
    label: copy('pandas：GroupBy', 'pandas: GroupBy'),
    href: 'https://pandas.pydata.org/docs/user_guide/groupby.html',
    usage: copy(
      '校准 split-apply-combine、聚合、分组统计和结果形状变化。',
      'Calibrates split-apply-combine, aggregation, grouped statistics, and output shape changes.',
    ),
  },
  pandasVisualization: {
    label: copy('pandas：可视化', 'pandas: Visualization'),
    href: 'https://pandas.pydata.org/docs/user_guide/visualization.html',
    usage: copy(
      '校准直方图、箱线图、散点图和分组图在表格探索中的入口。',
      'Calibrates histograms, box plots, scatter plots, and grouped plots for table exploration.',
    ),
  },
  pandasDerived: {
    label: copy('pandas：派生列', 'pandas: Derived columns'),
    href: 'https://pandas.pydata.org/docs/getting_started/intro_tutorials/05_add_columns.html',
    usage: copy(
      '校准新增列、表达式、assign 和 method chain 的教学用法。',
      'Calibrates derived columns, expressions, assign, and method-chain teaching usage.',
    ),
  },
} satisfies Record<string, SourceReference>

function moduleDefinition(input: DataLabModule): DataLabModule {
  return input
}

export const dataLabModules: DataLabModule[] = [
  moduleDefinition({
    id: 'data-types-feature-vectors',
    order: 1,
    title: copy('数据类型与特征表示', 'Data Types and Feature Vectors'),
    subtitle: copy(
      '先判断列的语义，再决定模型应该怎样读取它。',
      'Decide what a column means before deciding how a model should read it.',
    ),
    accent: '#2563eb',
    theme: '#edf4ff',
    estimatedMinutes: 46,
    learningObjectives: [
      copy(
        '区分数值、类别、序数、布尔、时间、文本、ID 和缺失值列。',
        'Distinguish numeric, categorical, ordinal, boolean, datetime, text, ID, and missing-value columns.',
      ),
      copy(
        '解释 row、column、feature、label、feature vector 和 model input 的关系。',
        'Explain the relation among row, column, feature, label, feature vector, and model input.',
      ),
      copy(
        '判断哪些“看起来像数字”的列其实不能当连续数值使用。',
        'Judge when numeric-looking columns should not be treated as continuous quantities.',
      ),
      copy(
        '说明 one-hot、词表、分箱、归一化和特征交叉如何改变输入维度。',
        'Explain how one-hot encoding, vocabularies, binning, normalization, and feature crosses change input dimension.',
      ),
      copy(
        '识别数据泄漏和训练/预测阶段不可用特征。',
        'Recognize leakage and features unavailable at prediction time.',
      ),
    ],
    concepts: [
      concept(
        'semantic-type',
        copy('列的语义类型', 'Column Semantic Type'),
        copy(
          'CSV 里的值只是字符串、数字或空格；建模时要先问它表示大小、类别、顺序、时间、身份还是缺失。语义先于编码。',
          'CSV values are only strings, numbers, or blanks; modeling first asks whether a column means magnitude, category, order, time, identity, or missingness. Semantics comes before encoding.',
        ),
        copy(
          '邮编 94110 和 10001 之间没有可解释的数值距离；房价 500 和 700 之间可以比较大小。',
          'ZIP codes 94110 and 10001 do not have a meaningful numeric distance; prices 500 and 700 do.',
        ),
      ),
      concept(
        'feature-vector',
        copy('特征向量', 'Feature Vector'),
        copy(
          '一行样本经过列选择、编码、分箱和缩放后，会变成模型真正读取的一串数字。训练算法看到的是这个向量，而不是原始表格。',
          'After column selection, encoding, binning, and scaling, one row becomes the numeric vector the model actually reads. The training algorithm sees this vector, not the raw table.',
        ),
        copy(
          'district=north 可以展开成 one-hot 片段，rooms=3 可以保留为缩放后的数值，二者拼在同一个输入向量中。',
          'district=north can expand into one-hot indicators, while rooms=3 can remain one scaled number; both pieces enter the same input vector.',
        ),
        "pd.get_dummies(df[['district']]).join(df[['rooms']])",
      ),
      concept(
        'normalization',
        copy('数值缩放', 'Numerical Scaling'),
        copy(
          '缩放不会改变样本顺序，但会改变优化器看到的距离和梯度尺度。面积、价格、年龄这类单位不同的列，直接拼接会让大尺度列支配训练。',
          'Scaling does not change sample order, but it changes distances and gradient scale. Area, price, and age can dominate training if their units are mixed without scaling.',
        ),
        copy(
          '价格从 100 到 9800，房间数从 1 到 5；若不缩放，模型更新可能主要追着价格列跑。',
          'Price may range from 100 to 9800 while rooms range from 1 to 5; without scaling, updates may mostly chase the price column.',
        ),
        "df['price_z'] = (df['price'] - train_mean) / train_std",
      ),
      concept(
        'vocabulary-one-hot',
        copy('词表与 one-hot', 'Vocabulary and One-hot'),
        copy(
          '类别列需要先确定允许出现的类别集合，再把每个类别映射到固定位置。未知类别、拼写变体和高基数 ID 都会让向量变宽或变脏。',
          'Categorical columns need a fixed vocabulary before categories map to stable positions. Unknown categories, spelling variants, and high-cardinality IDs can widen or dirty the vector.',
        ),
        copy(
          'district 有 north、west、south 三类时，one-hot 宽度是 3；新增 east 时，训练和预测必须按同一套词表处理。',
          'If district has north, west, and south, one-hot width is 3; a new east category must be handled against the same train-time vocabulary.',
        ),
        "pd.get_dummies(df['district'])",
      ),
      concept(
        'binning-cross',
        copy('分箱与特征交叉', 'Binning and Feature Crosses'),
        copy(
          '分箱把连续值切成区间，特征交叉把两个信号组合成更具体的局部规则。它们能表达非线性结构，但也会增加稀疏性和过拟合风险。',
          'Binning converts continuous values into intervals, while feature crosses combine signals into more local rules. They can express nonlinear structure but increase sparsity and overfitting risk.',
        ),
        copy(
          '把 area 分成小/中/大，再与 district 交叉，可以表示“西区大户型”这类局部模式。',
          'Binning area into small/medium/large and crossing it with district can represent a local pattern such as large homes in the west district.',
        ),
        "pd.cut(df['area'], bins=[0, 60, 120, 300])",
      ),
    ],
    sections: [
      section(
        'semantic-before-encoding',
        copy('先问语义，再写代码', 'Ask Semantics Before Writing Code'),
        copy(
          md`数据表的每一列都要先回答一个问题：这些值之间能不能比较大小、计算距离或求平均？如果答案是否定的，它通常不应该直接作为连续数值喂给模型。

数值列表示可比较的大小，例如面积、温度、价格。类别列表示成员关系，例如城市、产品类型、设备型号。序数列有顺序但间隔未必相等，例如低/中/高风险。ID 列主要用于连接、去重或追踪，不应该被模型当成“越大越强”的量。这个判断决定编码方式，也决定哪些错误会悄悄进入训练。`,
          md`Each column should first answer one question: can these values be compared by magnitude, distance, or average? If not, the column usually should not enter a model as a continuous number.

Numeric columns represent comparable magnitude: area, temperature, price. Categorical columns represent membership: city, product type, device model. Ordinal columns have order but not necessarily equal spacing: low, medium, high risk. ID columns are for joins, deduplication, or tracking, not magnitude. This decision controls encoding and prevents subtle training mistakes.`,
        ),
        { visualIds: ['feature-vector-pipeline-v2'] },
      ),
      section(
        'raw-row-to-vector',
        copy('一行样本如何变成向量', 'How One Row Becomes a Vector'),
        copy(
          md`监督学习中的一行样本通常包含 feature 和 label。feature 是预测时可以看到的输入，label 是训练时用来评分的答案。模型不会天然理解“街区”“邮编”“挂牌时间”这些列名，它只会接收一串位置固定的数值。

因此数据准备的核心任务是把“表格语义”稳定地翻译成“向量位置”。数值列可以缩放后放入向量；类别列可以通过 one-hot 或其他编码展开；时间列可以拆成星期、月份或间隔；缺失状态也可以显式变成一个指示特征。`,
          md`In supervised learning, one row usually contains features and a label. Features are inputs available at prediction time, while the label is the answer used for training feedback. A model does not naturally understand column names such as district, ZIP code, or listing date; it receives numbers at stable vector positions.

The core data-preparation task is therefore to translate table semantics into vector positions. Numerical columns can be scaled; categorical columns can be one-hot encoded; datetime columns can become weekday, month, or elapsed time; missingness itself can become an indicator feature.`,
        ),
        { labIds: ['column-type-lab'] },
      ),
      section(
        'numeric-quality',
        copy('好数值特征要有可学习的尺度', 'Good Numerical Features Need Learnable Scale'),
        copy(
          md`数值特征不是“能转成 number 就合格”。好的数值特征应该覆盖足够样本、没有明显录入错误、与任务有可解释关系，并且尺度不会让优化过程失衡。若一个列大多数值都集中在 0 附近，却偶尔出现巨大离群点，均值、标准差和梯度都会被拉偏。

归一化、标准化、裁剪和分箱不是为了让表格更整齐，而是为了让模型读到的距离更稳定。重要的是：这些参数必须从训练集学到，并在验证、测试和线上预测阶段复用。`,
          md`A numerical feature is not good merely because it can be parsed as a number. A useful numerical feature should cover enough samples, avoid obvious recording errors, relate to the task, and have a scale that does not destabilize optimization. If most values sit near 0 while a few huge outliers appear, means, standard deviations, and gradients are distorted.

Normalization, standardization, clipping, and binning are not cosmetic table work. They make model-visible distances more stable. The important rule is that these parameters are learned from the training set and reused on validation, test, and prediction data.`,
        ),
      ),
      section(
        'categorical-vocabulary',
        copy('类别列需要词表和未知值策略', 'Categorical Columns Need Vocabulary Policy'),
        copy(
          md`类别列要先确定词表：哪些类别被保留，哪些低频类别合并为 other，预测时出现的新类别怎样处理。one-hot 编码把一个类别变成固定位置上的 0/1 指示器，所以词表顺序就是模型输入协议的一部分。

高基数列尤其需要谨慎。用户 ID、订单号、房源编号这类列可能有成千上万个取值，直接 one-hot 会制造巨大的稀疏向量，却不一定带来可泛化规律。它们常用于连接、去重、分组统计或泄漏检查，而不是直接作为普通类别特征。`,
          md`Categorical columns need a vocabulary policy: which categories stay, which rare categories collapse into other, and how new categories at prediction time are handled. One-hot encoding turns a category into a 0/1 indicator at a fixed position, so vocabulary order becomes part of the model input contract.

High-cardinality columns deserve extra caution. User IDs, order numbers, and listing IDs may have thousands of values. Direct one-hot encoding can create huge sparse vectors without generalizable signal. They are often better used for joins, deduplication, grouped statistics, or leakage checks than as ordinary categorical features.`,
        ),
      ),
      section(
        'binning-crosses',
        copy('分箱和交叉是有代价的表达能力', 'Binning and Crosses Add Costly Expressiveness'),
        copy(
          md`分箱把连续值转成区间，例如把面积分成小、中、大。这样可以让模型捕捉“价格在某个区间后变化变慢”的结构，也能降低极端值影响。特征交叉把两个输入组合，例如 district 与 area_bin 组合成“某街区的大户型”。

代价是维度和稀疏性上升。若一个交叉项大多数格子都没有样本，模型看到的只是碎片化记忆。教学上可以把它理解为：交叉让模型拥有更细的局部格子，但每个格子都需要足够数据支撑。`,
          md`Binning converts a continuous value into intervals, such as small, medium, and large area. It can help a model capture shapes such as price growth slowing after a threshold, and it can reduce the influence of extreme values. Feature crosses combine inputs, such as district crossed with area_bin to represent large homes in a specific district.

The cost is higher dimension and sparsity. If most crossed cells have few or no samples, the model sees fragmented memorization rather than reliable structure. A useful teaching view is: crosses give the model finer local cells, but each cell needs enough data.`,
        ),
        { visualIds: ['data-types-feature-flow-video'] },
      ),
      section(
        'feature-label-boundary',
        copy('feature 与 label 的边界要守住', 'Keep the Feature/Label Boundary'),
        copy(
          md`只要预测时还不知道的列，就不能当作 feature。预测成交价时，成交后才产生的佣金、最终折扣、结算状态都不应该进入输入。它们可能与 label 高度相关，但这种相关性来自答案泄漏。

一个可靠检查是把时间线写出来：样本被预测的时刻，哪些字段已经存在？哪些字段只有未来才知道？数据实验室里的列类型分拣器不是只练习术语，而是在训练这种“预测时可用性”判断。`,
          md`A column unknown at prediction time cannot be a feature. If predicting final home price, post-sale commission, final discount, or settlement state should not enter the input. They may correlate strongly with the label, but the correlation comes from answer leakage.

A reliable check is to write the timeline: at the moment of prediction, which fields already exist and which are only known later? The column-type sorter is not only vocabulary practice; it trains this availability judgment.`,
        ),
      ),
      section(
        'feature-checklist',
        copy('进入模型前的特征检查清单', 'Feature Checklist Before Modeling'),
        copy(
          md`把一列放进模型前，至少检查六件事：语义是否正确、预测时是否可用、缺失如何处理、数值尺度是否稳定、类别词表是否固定、维度增长是否值得。每个答案都应该能追溯到任务目标，而不是只因为 pandas 代码能跑。

最终目标不是把所有列都塞进向量，而是构造一个稳定、可复现、对任务有解释力的输入协议。这个协议一旦用于训练，就必须被评估、上线和监控流程复用。`,
          md`Before a column enters a model, check at least six things: correct semantics, prediction-time availability, missing-value handling, stable numeric scale, fixed category vocabulary, and whether dimension growth is worth it. Each answer should trace back to the task, not merely to code that runs.

The goal is not to stuff every column into a vector. The goal is a stable, reproducible, task-relevant input contract. Once used for training, that contract must be reused in evaluation, deployment, and monitoring.`,
        ),
        { visualIds: ['data-types-feature-vector-image'] },
      ),
    ],
    visuals: [
      image(
        'feature-vector-pipeline-v2',
        'feature-vector-pipeline-v2.png',
        copy('从原始表到模型输入协议', 'From raw table to model input contract'),
        copy(
          '同一行数据先经过语义判读，再按数值、类别、分箱、ID 等路径编码，最后拼成模型读取的固定长度向量。',
          'One row is first interpreted semantically, then encoded through numeric, categorical, binned, and ID-handling paths before becoming a fixed-length vector.',
        ),
        [
          { id: 'raw-table', x: 12, y: 18, label: copy('原始表格', 'Raw table') },
          { id: 'semantic-types', x: 37, y: 16, label: copy('列语义判读', 'Column semantics') },
          { id: 'encoding', x: 58, y: 16, label: copy('编码与缩放', 'Encoding and scaling') },
          { id: 'feature-vector', x: 76, y: 15, label: copy('特征向量', 'Feature vector') },
          { id: 'model-input', x: 91, y: 36, label: copy('模型输入', 'Model input') },
          { id: 'id-warning', x: 38, y: 86, label: copy('ID 只作身份信号', 'ID is identity, not magnitude') },
        ],
      ),
      image(
        'data-types-feature-vector-image',
        'data-types-feature-vectors.png',
        copy('从列语义到特征向量', 'From column semantics to feature vector'),
        copy(
          '原始表格先经过列语义判断，再被编码成模型读取的数值向量。',
          'Raw columns are interpreted semantically before becoming numeric vectors for a model.',
        ),
        [
          { id: 'raw', x: 18, y: 13, label: copy('原始表格', 'Raw table') },
          { id: 'types', x: 49, y: 13, label: copy('列语义', 'Column meaning') },
          { id: 'vector', x: 78, y: 13, label: copy('特征向量', 'Feature vector') },
          { id: 'warning', x: 49, y: 82, label: copy('ID 不等于数值大小', 'ID is not magnitude') },
        ],
      ),
      video(
        'data-types-feature-flow-video',
        'data-types-feature-flow',
        copy('列类型流向特征向量', 'Column types flowing into a feature vector'),
        copy(
          '动画展示数值、类别和 ID 列在进入模型前的不同处理路径。',
          'Animation showing numeric, categorical, and ID columns taking different paths before modeling.',
        ),
      ),
    ],
    labs: [
      lab('column-type-lab', copy('列类型分拣器', 'Column Type Sorter'), 'ColumnTypeLab', [
        copy(
          '能解释为什么邮编、用户 ID、房源编号不应直接当连续数值。',
          'Explain why ZIP codes, user IDs, and listing IDs should not be treated as continuous values.',
        ),
        copy(
          '能说出 one-hot、分箱和数值缩放会怎样改变特征向量宽度。',
          'Describe how one-hot encoding, binning, and scaling change feature-vector width.',
        ),
        copy(
          '能根据预测时是否可用来排除泄漏列。',
          'Use prediction-time availability to reject leakage columns.',
        ),
      ]),
    ],
    quizzes: [
      quiz(
        'zip-type',
        copy('邮编列最安全的初始处理方式是什么？', 'What is the safest first treatment for a ZIP-code column?'),
        'category',
        copy('把它视为类别、地理分组或连接线索。', 'Treat it as categorical, geographic grouping, or a join signal.'),
        copy('直接求均值和欧氏距离。', 'Average it and use Euclidean distance.'),
        copy(
          '邮编的数字差不代表真实空间距离或大小顺序。',
          'A numeric ZIP-code difference does not represent meaningful distance or magnitude.',
        ),
      ),
      quiz(
        'one-hot-width',
        copy('district 有 8 个稳定类别时，普通 one-hot 通常会产生多少个指示位置？', 'If district has 8 stable categories, how many ordinary one-hot indicator positions are usually created?'),
        'eight',
        copy('8 个。', 'Eight.'),
        copy('1 个，因为原来只有一列。', 'One, because the original data had one column.'),
        copy(
          'one-hot 会把类别列展开为固定词表上的多个 0/1 位置。',
          'One-hot expands a categorical column into multiple 0/1 positions over a fixed vocabulary.',
        ),
      ),
      quiz(
        'prediction-availability',
        copy('预测成交价时，成交后才知道的佣金列应该怎样处理？', 'When predicting final sale price, how should a commission column known only after sale be treated?'),
        'exclude',
        copy('排除为特征，并记录为泄漏风险。', 'Exclude it as a feature and record it as leakage risk.'),
        copy('保留，因为它和价格高度相关。', 'Keep it because it correlates strongly with price.'),
        copy(
          '预测时不可用的信息不能进入特征，即使它和 label 很相关。',
          'Information unavailable at prediction time cannot enter features, even if it correlates with the label.',
        ),
      ),
    ],
    misconceptions: [
      misconception(
        'numeric-looking',
        copy('只要 CSV 里是数字，就一定是数值特征。', 'If it is numeric in a CSV, it is a numeric feature.'),
        copy(
          '数字外观不等于数值语义。ID、邮编、类别编码都可能只是符号。',
          'Numeric appearance is not numeric meaning. IDs, ZIP codes, and category codes may be symbols.',
        ),
        copy(
          '用户 ID 102 比用户 ID 17 大，并不表示用户更强或更贵。',
          'User ID 102 being larger than 17 does not mean the user is stronger or more expensive.',
        ),
      ),
      misconception(
        'one-hot-free',
        copy('one-hot 只是换个格式，不会改变建模难度。', 'One-hot is only a format change and does not affect modeling difficulty.'),
        copy(
          'one-hot 会增加维度，并在高基数场景制造稀疏矩阵；维度增长必须换来可泛化信号才值得。',
          'One-hot increases dimension and creates sparse matrices for high-cardinality columns; dimension growth is worthwhile only when it adds generalizable signal.',
        ),
        copy(
          '把订单号 one-hot 可能产生数万个几乎只出现一次的位置。',
          'One-hot encoding order IDs can create tens of thousands of positions that appear only once.',
        ),
      ),
      misconception(
        'scaling-changes-truth',
        copy('缩放会改变数据事实，所以不应该做。', 'Scaling changes the facts, so it should not be used.'),
        copy(
          '缩放保留相对信息，改变的是模型和优化器看到的坐标尺度。',
          'Scaling preserves relative information while changing the coordinate scale seen by the model and optimizer.',
        ),
        copy(
          '摄氏温度和华氏温度数值不同，但描述的是同一物理量；缩放也类似。',
          'Celsius and Fahrenheit use different numbers for the same physical quantity; scaling has a similar role.',
        ),
      ),
    ],
    sourceReferences: [
      sources.googleNumerical,
      sources.googleNormalization,
      sources.googleCategorical,
      sources.googleOneHot,
      sources.pandasIntro,
    ],
  }),
  moduleDefinition({
    id: 'data-cleaning-preprocessing',
    order: 2,
    title: copy('数据处理与清洗', 'Data Cleaning and Preprocessing'),
    subtitle: copy(
      '把坏值、缺失、重复和尺度问题变成可检查的流水线。',
      'Turn bad values, missingness, duplicates, and scale issues into an auditable pipeline.',
    ),
    accent: '#0f9f7a',
    theme: '#e9f8f5',
    estimatedMinutes: 50,
    learningObjectives: [
      copy(
        '识别缺失值、重复行、越界值、离群点、坏标签和单位混用。',
        'Recognize missing values, duplicates, out-of-range values, outliers, bad labels, and mixed units.',
      ),
      copy(
        '用 pandas 语义解释 isna、notna、dropna、fillna、drop_duplicates、clip、astype 和 to_datetime。',
        'Explain pandas semantics for isna, notna, dropna, fillna, drop_duplicates, clip, astype, and to_datetime.',
      ),
      copy(
        '说明为什么训练与预测阶段必须使用同一套清洗和预处理规则。',
        'Explain why training and prediction must use the same cleaning and preprocessing rules.',
      ),
      copy(
        '区分“错误值”“罕见但真实的值”和“任务上需要保留的异常信号”。',
        'Distinguish erroneous values, rare-but-real values, and abnormal signals that the task should preserve.',
      ),
      copy(
        '把清洗策略写成可复现、可审计、可测试的 pipeline。',
        'Write cleaning policies as reproducible, auditable, testable pipelines.',
      ),
    ],
    concepts: [
      concept(
        'cleaning-policy',
        copy('清洗策略', 'Cleaning Policy'),
        copy(
          '清洗不是随手修表，而是把哪些值有效、如何处理无效值写成可复现规则。',
          'Cleaning is not ad hoc table fixing; it is a reproducible policy for valid values and invalid-value handling.',
        ),
        copy(
          '缺失房间数可以填中位数、单独加缺失指示器，或丢弃该行；选择取决于任务和缺失机制。',
          'Missing room count can be median-filled, paired with a missing indicator, or dropped; the choice depends on the task and missingness mechanism.',
        ),
        "df['rooms'] = df['rooms'].fillna(df['rooms'].median())",
      ),
      concept(
        'missingness',
        copy('缺失机制', 'Missingness Mechanism'),
        copy(
          '缺失值有时是随机记录失败，有时是用户行为或业务流程造成的信号。先解释缺失原因，再决定填充、删除还是保留指示器。',
          'Missing values may be random recording failures or signals created by user behavior or business workflow. Explain missingness before choosing fill, drop, or indicators.',
        ),
        copy(
          '高收入用户更常跳过收入字段时，直接删除会改变样本分布。',
          'If high-income users skip income more often, dropping those rows changes the sample distribution.',
        ),
        "df['income_missing'] = df['income'].isna()",
      ),
      concept(
        'preprocessing-fit',
        copy('预处理必须可复用', 'Preprocessing Must Be Reusable'),
        copy(
          '训练集上学到的填充值、类别词表和缩放参数，预测时必须复用，不能重新从单条样本估计。',
          'Imputation values, category vocabulary, and scaling parameters learned on training data must be reused at prediction time.',
        ),
        copy(
          '用训练集均值缩放测试集，而不是用测试集重新计算均值。',
          'Scale the test set using the training mean rather than recomputing a test mean.',
        ),
        "train_mean = train['price'].mean()\ntest['price_centered'] = test['price'] - train_mean",
      ),
      concept(
        'outlier-policy',
        copy('离群点策略', 'Outlier Policy'),
        copy(
          '离群点不等于错误。先判断它是录入错误、单位混用、极端但真实的样本，还是任务真正需要识别的风险信号。',
          'An outlier is not automatically wrong. First decide whether it is a recording error, mixed unit, rare real sample, or task-relevant risk signal.',
        ),
        copy(
          '房价 9800 可能是豪宅，也可能是单位从万元混进千元。',
          'A price of 9800 may be a luxury home or a unit mix-up.',
        ),
        "df['price'] = df['price'].clip(lower=100, upper=1200)",
      ),
      concept(
        'audit-trail',
        copy('清洗审计轨迹', 'Cleaning Audit Trail'),
        copy(
          '每一步清洗都应该说明输入形状、输出形状、改变了哪些列、为什么这样做，以及是否只在训练集上拟合参数。',
          'Each cleaning step should state input shape, output shape, changed columns, why it is done, and whether parameters are fitted only on training data.',
        ),
        copy(
          'drop_duplicates 后行数从 6 变 5，这个变化应该被记录，而不是只看最终表。',
          'After drop_duplicates changes rows from 6 to 5, that change should be recorded rather than hidden inside the final table.',
        ),
      ),
    ],
    sections: [
      section(
        'quality-scan',
        copy('先做质量扫描', 'Start with a Quality Scan'),
        copy(
          md`进入建模前，先统计每列的缺失比例、唯一值数量、范围、类型和重复行。这个扫描不是为了美化数据，而是为了发现会改变训练信号的问题：目标列缺失、单位混用、异常大值、日期解析失败、重复样本和非法类别。

质量扫描的输出应该像体检报告：哪些列健康，哪些列需要复查，哪些列暂时不能进入模型。若没有这一步，后面的清洗动作很容易变成凭感觉修表。`,
          md`Before modeling, profile each column for missing rate, unique count, range, type, and duplicate rows. This scan is not cosmetic; it finds issues that change training signals: missing labels, mixed units, extreme values, failed date parsing, duplicates, and invalid categories.

The scan should read like a health report: which columns are usable, which need review, and which cannot enter the model yet. Without it, later cleaning easily becomes guesswork.`,
        ),
        { visualIds: ['cleaning-policy-map-v2'] },
      ),
      section(
        'missing-values',
        copy('缺失值要解释，不只是填掉', 'Explain Missingness Before Filling It'),
        copy(
          md`缺失值有时只是记录失败，有时本身就是信号。清洗流水线应该记录选择：丢弃、填充、保留缺失类别，或新增一个“是否缺失”的指示列。pandas 里的 isna 和 notna 用来先定位缺失，dropna 和 fillna 才是后续动作。

选择填充值时要避免把验证集、测试集或线上样本的信息反向泄漏到训练流程。中位数、均值、众数、类别词表和缩放参数都应该在训练集上确定。`,
          md`Missingness may be a recording failure or a signal. The pipeline should record the choice: drop, fill, keep a missing category, or add a missingness indicator. In pandas, isna and notna locate missing values; dropna and fillna act on them.

When choosing fill values, avoid leaking validation, test, or prediction information back into training. Medians, means, modes, vocabularies, and scaling parameters should be determined on the training set.`,
        ),
        { labIds: ['cleaning-pipeline-lab'] },
      ),
      section(
        'duplicates-and-labels',
        copy('重复行和坏标签会改写训练信号', 'Duplicates and Bad Labels Rewrite Training Signal'),
        copy(
          md`重复样本会给某些观测额外权重。如果重复来自真实频次，保留可能合理；如果重复来自采集或合并错误，它会让模型过度相信某些行。坏标签更危险：它直接污染监督学习的反馈。

清洗时不要只问“有没有重复”，还要问重复的业务含义。按 id 去重、按全行去重和按时间保留最新记录会得到不同数据集。标签列缺失或异常时，通常应先隔离样本，而不是自动填充答案。`,
          md`Duplicate samples give extra weight to some observations. If duplication represents true frequency, keeping it may be reasonable; if it comes from collection or merge errors, it makes the model over-trust certain rows. Bad labels are worse because they directly corrupt supervised feedback.

Cleaning should ask not only whether duplicates exist, but what they mean. Deduplicating by ID, by full row, or by latest timestamp creates different datasets. Missing or abnormal labels are usually isolated rather than automatically filled.`,
        ),
      ),
      section(
        'outliers-and-types',
        copy('异常值、类型和单位要一起看', 'Read Outliers, Types, and Units Together'),
        copy(
          md`异常值不一定错，但一定要解释。房价 9800 可能是豪宅，也可能是单位从万元混进千元。日期列解析失败、布尔列混入字符串、价格列含货币符号，都会让后续分析悄悄变形。

类型转换应该显式处理失败路径。to_datetime 遇到坏日期可以变成缺失值；astype 遇到混合文本可能失败；clip 可以限制训练中不可信的极端范围，但不能掩盖真实风险事件。`,
          md`An outlier is not automatically wrong, but it must be explained. A price of 9800 may be a luxury home or a unit mix-up. Failed dates, strings inside boolean columns, and currency symbols inside prices can silently distort later analysis.

Type conversion should handle failure explicitly. to_datetime can turn bad dates into missing values; astype may fail on mixed text; clip can limit untrustworthy extreme ranges, but it must not hide real risk events.`,
        ),
        { visualIds: ['data-cleaning-flow-video'] },
      ),
      section(
        'scaling-and-binning',
        copy('缩放、分箱和裁剪必须有训练边界', 'Scaling, Binning, and Clipping Need Training Boundaries'),
        copy(
          md`归一化和标准化会把不同单位的列放到更可比较的尺度上。分箱可以把连续值变成区间，减弱噪声和极端值影响。裁剪可以限制明显不可信的范围。但这些规则都不能在全数据上偷看答案。

正确流程是：在训练集上决定均值、标准差、分位数、分箱边界和裁剪阈值；在验证、测试和线上预测阶段只应用这些已记录参数。这样评估结果才反映真实泛化能力。`,
          md`Normalization and standardization put columns with different units onto more comparable scales. Binning converts continuous values into intervals and can reduce noise or extreme-value influence. Clipping can limit clearly untrustworthy ranges. None of these rules should peek at all data.

The correct flow is: decide means, standard deviations, quantiles, bin boundaries, and clipping thresholds on the training set; then only apply recorded parameters to validation, test, and prediction data. This keeps evaluation honest.`,
        ),
      ),
      section(
        'prediction-consistency',
        copy('训练和预测要用同一条流水线', 'Training and Prediction Use the Same Pipeline'),
        copy(
          md`很多数据错误不是来自单个清洗函数，而是来自训练和预测不一致。训练时填中位数，线上预测时改用当前样本均值；训练时把未知类别归为 other，线上预测时直接新增一列；这些都会让模型输入协议漂移。

把清洗看成模型的一部分，而不是建模前的临时脚本。只要规则会影响模型输入，它就应该被版本化、测试，并与模型一起发布。`,
          md`Many data bugs do not come from a single cleaning function; they come from inconsistency between training and prediction. Training may fill with a median while prediction recomputes from one row; training may map unknown categories to other while prediction adds a new column. These changes drift the input contract.

Treat cleaning as part of the model, not a temporary pre-modeling script. If a rule affects model input, it should be versioned, tested, and shipped with the model.`,
        ),
      ),
      section(
        'cleaning-as-report',
        copy('清洗结果要能讲清楚', 'Cleaning Results Must Be Explainable'),
        copy(
          md`一条好的清洗流水线应该能回答：删了多少行？填了哪些列？哪些值被裁剪？哪些类别被合并？这些动作对标签分布和关键分组有没有影响？如果回答不了，后续模型指标就很难被信任。

数据实验室中的清洗实验把每个按钮映射到 pandas 语义和表格形状变化。目标不是记住函数名，而是训练“每一步为什么改变数据”的解释能力。`,
          md`A good cleaning pipeline can answer: how many rows were dropped, which columns were filled, which values were clipped, which categories were merged, and whether these actions affected labels or key groups. Without those answers, model metrics are hard to trust.

The cleaning lab maps each button to pandas semantics and table-shape changes. The goal is not memorizing function names; it is explaining why each step changes the data.`,
        ),
        { visualIds: ['data-cleaning-pipeline-image'] },
      ),
    ],
    visuals: [
      image(
        'cleaning-policy-map-v2',
        'cleaning-policy-map-v2.png',
        copy('清洗策略地图', 'Cleaning policy map'),
        copy(
          '清洗从 profile 开始，分别处理缺失、离群、类型和单位问题，再把训练阶段确定的规则复用于预测阶段。',
          'Cleaning starts with profiling, handles missingness, outliers, types, and units, then reuses train-time rules at prediction time.',
        ),
        [
          { id: 'profile', x: 15, y: 22, label: copy('质量扫描', 'Profile') },
          { id: 'missing', x: 34, y: 18, label: copy('缺失路径', 'Missing branch') },
          { id: 'outlier', x: 34, y: 47, label: copy('离群路径', 'Outlier branch') },
          { id: 'type-unit', x: 35, y: 76, label: copy('类型与单位', 'Type and unit') },
          { id: 'rules', x: 66, y: 39, label: copy('训练规则卡', 'Train-time rule card') },
          { id: 'predict', x: 86, y: 40, label: copy('预测时复用', 'Reuse at prediction') },
          { id: 'audit', x: 64, y: 86, label: copy('审计每一步', 'Audit every step') },
        ],
      ),
      image(
        'data-cleaning-pipeline-image',
        'data-cleaning-preprocessing.png',
        copy('清洗流水线', 'Cleaning pipeline'),
        copy(
          '从杂乱表格到可训练表格，中间每一步都应该可复现、可审计。',
          'From messy table to training-ready table, every step should be reproducible and auditable.',
        ),
        [
          { id: 'raw', x: 17, y: 12, label: copy('原始数据', 'Raw data') },
          { id: 'rules', x: 50, y: 12, label: copy('清洗规则', 'Cleaning rules') },
          { id: 'clean', x: 82, y: 12, label: copy('可训练数据', 'Trainable data') },
          { id: 'audit', x: 54, y: 84, label: copy('记录每一步', 'Audit every step') },
        ],
      ),
      video(
        'data-cleaning-flow-video',
        'data-cleaning-flow',
        copy('清洗步骤动画', 'Cleaning steps animation'),
        copy(
          '动画展示缺失值、重复行、异常值和类型转换如何进入同一条流水线。',
          'Animation showing missing values, duplicates, outliers, and type conversion entering one pipeline.',
        ),
      ),
    ],
    labs: [
      lab('cleaning-pipeline-lab', copy('清洗流水线实验', 'Cleaning Pipeline Lab'), 'CleaningPipelineLab', [
        copy(
          '能比较填充、丢弃、裁剪和去重对表格形状的影响。',
          'Compare how filling, dropping, clipping, and deduplication affect table shape.',
        ),
        copy(
          '能把每个 pandas 调用对应到一类数据质量问题。',
          'Map each pandas call to one data quality issue.',
        ),
        copy(
          '能说明哪些清洗参数必须来自训练阶段。',
          'Explain which cleaning parameters must come from training time.',
        ),
      ]),
    ],
    quizzes: [
      quiz(
        'fill-source',
        copy('预测阶段遇到缺失值时，填充值应该来自哪里？', 'At prediction time, where should an imputation value come from?'),
        'training',
        copy('来自训练阶段记录下来的规则或统计量。', 'From the rule or statistic recorded during training.'),
        copy('从当前单条预测样本重新估计。', 'Re-estimate it from the single prediction row.'),
        copy(
          '预处理规则必须训练/预测一致，才能避免分布和语义漂移。',
          'Preprocessing rules must match between training and prediction to avoid distribution and semantic drift.',
        ),
      ),
      quiz(
        'outlier-first-question',
        copy('看到极端大值时，第一步应该是什么？', 'When seeing an extreme value, what is the first step?'),
        'explain',
        copy('先解释它是错误、单位问题，还是真实样本。', 'First explain whether it is an error, unit issue, or real sample.'),
        copy('立刻删除，因为离群点都不可靠。', 'Delete it immediately because all outliers are unreliable.'),
        copy(
          '离群点可能是错误，也可能是任务需要学习的真实风险信号。',
          'An outlier may be an error, but it may also be a real risk signal the task needs.',
        ),
      ),
      quiz(
        'dedupe-risk',
        copy('重复行为什么可能改变训练结果？', 'Why can duplicate rows change training results?'),
        'weight',
        copy('它会给某些样本额外权重。', 'They give extra weight to some samples.'),
        copy('它们只影响文件大小，不影响模型。', 'They only affect file size, not the model.'),
        copy(
          '监督学习会反复看到重复样本，因此重复来源必须解释。',
          'Supervised learning repeatedly sees duplicated samples, so the duplication source must be explained.',
        ),
      ),
    ],
    misconceptions: [
      misconception(
        'delete-all-missing',
        copy('只要有缺失值，最安全就是删掉整行。', 'If a row has a missing value, deleting it is always safest.'),
        copy(
          '删除可能引入偏差，也可能浪费样本；要先理解缺失机制和任务风险。',
          'Deletion can introduce bias or waste samples; first understand missingness and task risk.',
        ),
        copy(
          '高收入用户不填收入时，删除这些行会改变样本分布。',
          'If high-income users often omit income, deleting those rows changes the sample distribution.',
        ),
      ),
      misconception(
        'cleaning-is-before-model',
        copy('清洗只是建模前的一次性脚本。', 'Cleaning is a one-off script before modeling.'),
        copy(
          '清洗规则定义了模型输入，必须和模型一起复用、测试和版本化。',
          'Cleaning rules define model input and must be reused, tested, and versioned with the model.',
        ),
        copy(
          '线上预测时若使用不同填充值，模型看到的坐标系就变了。',
          'If prediction uses a different fill value, the model sees a different coordinate system.',
        ),
      ),
      misconception(
        'clip-every-outlier',
        copy('所有离群点都应该裁剪到正常范围。', 'All outliers should be clipped into the normal range.'),
        copy(
          '裁剪只适合有明确边界或录入错误的情况；真实极端样本可能正是业务风险。',
          'Clipping fits clear bounds or recording errors; real extreme samples may be the business risk itself.',
        ),
        copy(
          '欺诈检测里的极端交易金额可能比普通交易更重要。',
          'In fraud detection, extreme transaction amounts may matter more than ordinary ones.',
        ),
      ),
    ],
    sourceReferences: [
      sources.googleScrubbing,
      sources.googleNormalization,
      sources.pandasMissing,
      sources.pandasIntro,
    ],
  }),
  moduleDefinition({
    id: 'exploratory-data-analysis',
    order: 3,
    title: copy('数据分析与探索', 'Exploratory Data Analysis'),
    subtitle: copy(
      '先看分布、关系和分组，再决定模型假设是否站得住。',
      'Inspect distributions, relationships, and groups before trusting modeling assumptions.',
    ),
    accent: '#d65a31',
    theme: '#fff1e8',
    estimatedMinutes: 48,
    learningObjectives: [
      copy(
        '使用描述统计、直方图、箱线图、散点图、相关性和分组统计提出数据问题。',
        'Use descriptive statistics, histograms, box plots, scatter plots, correlation, and grouped summaries to ask data questions.',
      ),
      copy(
        '解释为什么均值可能掩盖偏态、双峰、离群点和群体差异。',
        'Explain why means can hide skew, bimodality, outliers, and group differences.',
      ),
      copy(
        '用 split-apply-combine 读懂分组统计如何暴露整体平均看不到的信息。',
        'Use split-apply-combine to understand how grouped summaries reveal what global averages hide.',
      ),
      copy(
        '识别探索阶段的数据泄漏、选择性解释和过度解读风险。',
        'Recognize leakage, selective interpretation, and overinterpretation risks during exploration.',
      ),
      copy(
        '把 EDA 结论转化为后续清洗、特征工程和模型假设检查。',
        'Convert EDA findings into later cleaning, feature engineering, and model-assumption checks.',
      ),
    ],
    concepts: [
      concept(
        'distribution-first',
        copy('先看分布', 'Distribution First'),
        copy(
          '均值只是一个摘要。直方图和箱线图能揭示偏态、长尾、离群点和分组差异。',
          'A mean is only one summary. Histograms and box plots reveal skew, tails, outliers, and group differences.',
        ),
        copy(
          '两组房价均值相同，但一组集中，一组长尾，模型风险完全不同。',
          'Two price groups can share a mean while one is concentrated and the other long-tailed, creating different modeling risks.',
        ),
        "df['price'].describe()\ndf['price'].plot.hist()",
      ),
      concept(
        'plot-purpose',
        copy('图形服务问题', 'Plots Serve Questions'),
        copy(
          'EDA 图不是装饰。每张图都应该回答一个具体问题：形状、离群、关系、分组差异、缺失模式或泄漏风险。',
          'EDA plots are not decoration. Each plot should answer a concrete question about shape, outliers, relationships, group differences, missingness, or leakage risk.',
        ),
        copy(
          '散点图问两个数值列是否有结构；箱线图问不同组的中位数和离群点是否不同。',
          'A scatter plot asks whether two numeric columns have structure; a box plot asks whether group medians and outliers differ.',
        ),
      ),
      concept(
        'grouped-analysis',
        copy('分组分析', 'Grouped Analysis'),
        copy(
          '把总体拆成有意义的组，常能发现整体均值看不到的规律。',
          'Splitting the population into meaningful groups often reveals patterns hidden by overall averages.',
        ),
        copy(
          '按街区比较价格均值和样本数，比只看全城平均更适合发现数据覆盖不足。',
          'Comparing mean price and count by district is better than one citywide mean for spotting coverage gaps.',
        ),
        "df.groupby('district')['price'].agg(['count', 'mean'])",
      ),
      concept(
        'correlation-boundary',
        copy('相关性的边界', 'Correlation Boundary'),
        copy(
          '相关性描述共同变化，不说明因果，也不保证预测时可用。高相关列可能是混杂、共同趋势或泄漏。',
          'Correlation describes co-movement; it does not prove causation or prediction-time availability. A high correlation can come from confounding, shared trends, or leakage.',
        ),
        copy(
          '成交价和佣金高度相关，但佣金可能在成交后才产生。',
          'Final price and commission may correlate strongly, but commission may be created only after sale.',
        ),
      ),
      concept(
        'eda-handoff',
        copy('EDA 到建模的交接', 'EDA-to-Model Handoff'),
        copy(
          'EDA 的产物不是漂亮图，而是可执行决策：需要清洗什么、需要缩放什么、哪些分组样本太少、哪些假设不可信。',
          'The output of EDA is not beautiful charts; it is executable decisions about cleaning, scaling, sparse groups, and unreliable assumptions.',
        ),
        copy(
          '若某类别只有两条样本，就不要把它的均值当成稳定规律。',
          'If a category has only two samples, do not treat its mean as a stable rule.',
        ),
      ),
    ],
    sections: [
      section(
        'question-driven-eda',
        copy('EDA 从问题开始', 'EDA Starts with Questions'),
        copy(
          md`探索性数据分析不是随机画图，而是围绕建模前的问题组织证据：列是否可用？分布是否稳定？离群点从哪里来？不同群体是否覆盖均衡？是否存在预测时不可用的信息？

每一个问题都对应一类检查。describe 给出摘要，直方图看形状，箱线图看分组和离群，散点图看关系，groupby 看群体差异，缺失矩阵和时间线检查泄漏。`,
          md`Exploratory data analysis is not random plotting; it organizes evidence around pre-modeling questions. Are columns usable? Are distributions stable? Where do outliers come from? Are groups covered evenly? Is any information unavailable at prediction time?

Each question maps to a check. describe gives summaries, histograms show shape, box plots show group differences and outliers, scatter plots show relationships, groupby reveals subgroup patterns, and missingness or timeline checks expose leakage.`,
        ),
        { visualIds: ['eda-investigation-board-v2'] },
      ),
      section(
        'describe-is-not-enough',
        copy('describe 是起点，不是终点', 'describe Is a Start, Not the Finish'),
        copy(
          md`describe 能快速给出计数、均值、标准差和分位数，但它不会告诉你分布形状。探索时至少要追问：是否偏态？是否双峰？离群点集中在哪些组？缺失值是否和目标相关？

同一个均值可能对应完全不同的数据：一个是窄而稳定的分布，一个是长尾分布，一个是两个群体混在一起的双峰分布。只看表格摘要会把这些差异压平。`,
          md`describe quickly gives counts, means, standard deviations, and quantiles, but it does not show distribution shape. During exploration, ask: Is it skewed? Bimodal? Where do outliers cluster? Is missingness related to the target?

The same mean can come from very different data: a narrow stable distribution, a long-tailed distribution, or a bimodal mixture of groups. A table summary flattens these differences.`,
        ),
      ),
      section(
        'distribution-shape',
        copy('分布形状决定风险读法', 'Distribution Shape Changes Risk Reading'),
        copy(
          md`直方图回答“值集中在哪里”，箱线图回答“中位数、四分位和离群点在哪里”。偏态分布提示均值可能被长尾拉动；双峰分布提示样本可能来自两个群体；异常密集的整数或固定值可能提示采集规则或默认填充值。

分布图还会反过来指导清洗。若某列大量出现 0，要确认 0 是真实数值、缺失占位符，还是业务上的特殊状态。`,
          md`A histogram asks where values concentrate; a box plot asks where the median, quartiles, and outliers lie. Skew suggests a mean pulled by the tail; bimodality suggests two populations; suspicious spikes at integers or fixed values may indicate collection rules or default fills.

Distribution plots also guide cleaning. If a column contains many zeros, verify whether zero is a real value, a missing placeholder, or a special business state.`,
        ),
        { visualIds: ['eda-workbench-image'] },
      ),
      section(
        'relationships',
        copy('关系图要服务假设', 'Relationship Plots Serve Assumptions'),
        copy(
          md`散点图、相关矩阵和分组柱状图不是为了让页面更丰富，而是为了检验假设。面积和房价是否近似单调？离群点是否只来自某个街区？某个类别是否样本太少？这些问题决定线性模型是否足够，是否需要变换或交互项。

相关性高不等于因果，也不等于特征可用。EDA 阶段看到强关系时，要立刻追问：这列在预测时是否已经知道？是否只是 label 的另一种记录方式？`,
          md`Scatter plots, correlation matrices, and grouped bars are not page decoration; they test assumptions. Is area roughly monotonic with price? Do outliers come from one district? Does a category have too few examples? These questions shape whether a linear model is enough or whether transformations and interactions are needed.

High correlation is not causation and not proof of feature availability. When EDA finds a strong relationship, immediately ask whether the column is known at prediction time or merely another record of the label.`,
        ),
        { labIds: ['eda-workbench-lab'] },
      ),
      section(
        'split-apply-combine',
        copy('用 split-apply-combine 读分组', 'Read Groups with Split-Apply-Combine'),
        copy(
          md`GroupBy 的心智模型是 split-apply-combine：先按类别拆分表，再对每组应用统计函数，最后把结果合并成一张摘要表。它能把总体平均看不到的结构显出来。

但分组统计必须带上 count。一个组的均值再高，如果只有两条样本，也不能和几千条样本的组同等解读。好的 EDA 会同时看均值、样本数、分散程度和缺失比例。`,
          md`The GroupBy mental model is split-apply-combine: split the table by category, apply a statistic to each group, then combine the results into a summary table. It reveals structure hidden by global averages.

Grouped statistics must carry counts. A high group mean based on two samples should not be read like a group with thousands of samples. Good EDA reads mean, count, spread, and missing rate together.`,
        ),
        { visualIds: ['eda-split-apply-video'] },
      ),
      section(
        'leakage-check',
        copy('探索时也要防泄漏', 'Check Leakage During EDA'),
        copy(
          md`探索越深入，越容易把目标答案泄露进特征。强相关列不一定是好特征；它可能是目标的另一种记录方式，或是预测时不可用的信息。EDA 需要把“相关”与“可用”分开。

泄漏检查最好用时间线表达：数据在什么时候产生，预测在什么时候发生，label 在什么时候确定。任何晚于预测时刻的信息都不能进入 feature，即使它在历史数据里很容易获得。`,
          md`The deeper the exploration, the easier it is to leak target information into features. A strongly correlated column is not automatically a good feature; it may be another record of the label or information unavailable at prediction time. EDA must separate correlation from availability.

Leakage checks are best expressed as timelines: when the data is created, when prediction happens, and when the label is known. Anything later than prediction time cannot enter features, even if it is easy to access historically.`,
        ),
      ),
      section(
        'eda-handoff',
        copy('把探索结论交给下一步', 'Hand EDA Findings to the Next Step'),
        copy(
          md`EDA 的结尾应该是一组明确动作：哪些列需要清洗，哪些列需要缩放，哪些类别需要合并，哪些关系提示特征交叉，哪些群体需要更多数据，哪些列因泄漏被排除。

如果探索只停留在“图看起来不错”，它没有真正帮助建模。好的 EDA 会让下一步的数据处理和模型选择更少猜测、更可复现。`,
          md`EDA should end with concrete actions: which columns need cleaning, which need scaling, which categories should merge, which relationships suggest crosses, which groups need more data, and which columns are excluded for leakage.

If exploration stops at charts looking nice, it has not helped modeling. Good EDA makes later preprocessing and model selection less guessy and more reproducible.`,
        ),
      ),
    ],
    visuals: [
      image(
        'eda-investigation-board-v2',
        'eda-investigation-board-v2.png',
        copy('EDA 问题地图', 'EDA investigation board'),
        copy(
          '围绕同一张表，从摘要、分布、离群、关系、分组和泄漏六个角度把探索问题组织起来。',
          'Around one table, organize EDA questions through summaries, distributions, outliers, relationships, groups, and leakage checks.',
        ),
        [
          { id: 'table', x: 44, y: 41, label: copy('中心表格', 'Central table') },
          { id: 'describe', x: 14, y: 15, label: copy('摘要统计', 'Summary stats') },
          { id: 'hist', x: 41, y: 10, label: copy('分布形状', 'Distribution shape') },
          { id: 'box', x: 70, y: 11, label: copy('离群与分组', 'Outliers and groups') },
          { id: 'scatter', x: 70, y: 49, label: copy('变量关系', 'Relationships') },
          { id: 'groupby', x: 16, y: 54, label: copy('分组比较', 'Group comparison') },
          { id: 'leakage', x: 68, y: 83, label: copy('泄漏检查', 'Leakage check') },
        ],
      ),
      image(
        'eda-workbench-image',
        'exploratory-data-analysis.png',
        copy('探索性数据分析工作台', 'EDA workbench'),
        copy(
          '同一张表可以从分布、离群点、相关性和分组差异四个角度阅读。',
          'One table can be read through distribution, outliers, correlation, and group differences.',
        ),
        [
          { id: 'distribution', x: 30, y: 12, label: copy('分布', 'Distribution') },
          { id: 'outlier', x: 68, y: 18, label: copy('离群点', 'Outliers') },
          { id: 'groups', x: 78, y: 74, label: copy('分组', 'Groups') },
          { id: 'mean-warning', x: 31, y: 85, label: copy('均值会隐藏形状', 'Mean can hide shape') },
        ],
      ),
      video(
        'eda-split-apply-video',
        'eda-split-apply',
        copy('split-apply-combine 动画', 'Split-apply-combine animation'),
        copy(
          '动画展示表格如何按类别拆分、分别统计，再组合成分析结果。',
          'Animation showing a table split by category, summarized, and recombined into analysis output.',
        ),
      ),
    ],
    labs: [
      lab('eda-workbench-lab', copy('EDA 工作台', 'EDA Workbench'), 'EdaWorkbenchLab', [
        copy(
          '能用不同图形解释同一列数据的不同风险。',
          'Use different plots to explain different risks in the same column.',
        ),
        copy(
          '能说出 groupby 为什么能揭示总体均值看不到的信息。',
          'Explain why groupby can reveal information hidden by overall means.',
        ),
        copy(
          '能把 EDA 发现转化为清洗、缩放、分组或泄漏检查动作。',
          'Convert EDA findings into cleaning, scaling, grouping, or leakage-check actions.',
        ),
      ]),
    ],
    quizzes: [
      quiz(
        'mean-risk',
        copy('为什么只看均值可能危险？', 'Why can looking only at a mean be risky?'),
        'shape',
        copy('因为均值可能掩盖分布形状和离群点。', 'Because a mean can hide distribution shape and outliers.'),
        copy('因为均值永远不能计算。', 'Because means can never be computed.'),
        copy(
          '均值有用，但它不能替代分布、分位数和分组检查。',
          'A mean is useful, but it cannot replace distributions, quantiles, and grouped checks.',
        ),
      ),
      quiz(
        'groupby-count',
        copy('分组均值旁边为什么应该同时看 count？', 'Why should grouped means be read with counts?'),
        'stability',
        copy('样本数决定这个均值有多稳定。', 'Sample count affects how stable the mean is.'),
        copy('count 只用于排序，不影响解释。', 'Count is only for sorting and does not affect interpretation.'),
        copy(
          '两条样本的组均值不应和大量样本的组均值同等解读。',
          'A group mean from two samples should not be interpreted like a group mean from many samples.',
        ),
      ),
      quiz(
        'correlation-risk',
        copy('EDA 发现某列与 label 高度相关后，下一步应该问什么？', 'After EDA finds a column highly correlated with the label, what should be asked next?'),
        'availability',
        copy('预测时这列是否已经可用，是否可能泄漏。', 'Whether the column is available at prediction time and whether it leaks.'),
        copy('立刻把它作为最重要特征。', 'Immediately use it as the most important feature.'),
        copy(
          '相关性需要结合时间线和业务语义解释。',
          'Correlation must be interpreted with timeline and business semantics.',
        ),
      ),
    ],
    misconceptions: [
      misconception(
        'correlation-causal',
        copy('相关性高就说明一个变量导致另一个变量。', 'High correlation means one variable causes the other.'),
        copy(
          '相关性只是共同变化信号，可能来自混杂因素、泄漏或共同趋势。',
          'Correlation only signals co-movement; it may come from confounding, leakage, or shared trends.',
        ),
        copy(
          '成交价和佣金高度相关，但佣金可能在成交后才知道，不能作为预测前特征。',
          'Final price and commission may correlate strongly, but commission may be known only after sale.',
        ),
      ),
      misconception(
        'plot-more',
        copy('EDA 就是画越多图越好。', 'EDA means making as many plots as possible.'),
        copy(
          '图形必须服务具体问题；没有问题的图只会增加噪声。',
          'Plots must serve concrete questions; plots without questions add noise.',
        ),
        copy(
          '直方图、箱线图、散点图和 groupby 摘要应该分别回答不同假设。',
          'Histograms, box plots, scatter plots, and groupby summaries should answer different assumptions.',
        ),
      ),
      misconception(
        'describe-complete',
        copy('describe 已经足够代表一列数据。', 'describe fully represents a column.'),
        copy(
          'describe 是摘要，不展示形状、双峰、群体差异和许多离群结构。',
          'describe is a summary; it does not show shape, bimodality, group differences, or many outlier structures.',
        ),
        copy(
          '两个分布可以均值和标准差接近，但一个单峰、一个双峰。',
          'Two distributions can have similar means and standard deviations while one is unimodal and the other bimodal.',
        ),
      ),
    ],
    sourceReferences: [
      sources.googleNumerical,
      sources.pandasVisualization,
      sources.pandasGroupby,
      sources.pandasMissing,
    ],
  }),
  moduleDefinition({
    id: 'pandas-workflow',
    order: 4,
    title: copy('pandas 工作流', 'pandas Workflow'),
    subtitle: copy(
      '把表格操作组织成清晰、可复现、可讲解的 method chain。',
      'Organize table operations into clear, reproducible, explainable method chains.',
    ),
    accent: '#7048e8',
    theme: '#f1edff',
    estimatedMinutes: 52,
    learningObjectives: [
      copy(
        '解释 DataFrame、Series、index、列选择、布尔过滤和新增列。',
        'Explain DataFrame, Series, index, column selection, boolean filtering, and derived columns.',
      ),
      copy(
        '用等价 pandas 代码描述 sort、merge、concat、groupby、pivot 和 method chaining。',
        'Describe sort, merge, concat, groupby, pivot, and method chaining with equivalent pandas code.',
      ),
      copy(
        '用表格 shape、列含义和索引变化检查每一步是否符合预期。',
        'Use table shape, column meaning, and index changes to check each step.',
      ),
      copy(
        '把长链拆成可命名、可测试、可解释的阶段。',
        'Split long chains into named, testable, explainable stages.',
      ),
      copy(
        '识别 merge 扩张、groupby 粒度变化、pivot 稀疏化和派生列泄漏。',
        'Recognize merge expansion, groupby granularity changes, pivot sparsity, and derived-column leakage.',
      ),
    ],
    concepts: [
      concept(
        'dataframe-series',
        copy('DataFrame 与 Series', 'DataFrame and Series'),
        copy(
          'DataFrame 是带列名和索引的二维表；选出一列通常得到 Series，选出多列仍是 DataFrame。',
          'A DataFrame is a two-dimensional table with column names and an index; selecting one column usually returns a Series, while selecting multiple columns keeps a DataFrame.',
        ),
        copy(
          'df["price"] 是一列 Series；df[["district", "price"]] 是两列表格。',
          'df["price"] is a Series; df[["district", "price"]] is a two-column DataFrame.',
        ),
        "df['price']\ndf[['district', 'price']]",
      ),
      concept(
        'boolean-mask',
        copy('布尔过滤', 'Boolean Filtering'),
        copy(
          '布尔条件会为每一行产生 True/False，再保留 True 行。过滤后行数变化是最重要的调试信号。',
          'A boolean condition creates True/False for each row, then keeps True rows. The row-count change is the key debugging signal.',
        ),
        copy(
          '只保留 price 非空且小于 2000 的样本，会同时处理缺失和极端值。',
          'Keeping rows where price is not missing and below 2000 handles missingness and extreme values together.',
        ),
        "df = df[df['price'].notna() & (df['price'] < 2000)]",
      ),
      concept(
        'derived-column',
        copy('派生列', 'Derived Column'),
        copy(
          '派生列把已有列转换成更有任务意义的信号，但必须避免把 label 或未来信息换个名字塞回 feature。',
          'A derived column transforms existing columns into a more task-relevant signal, but must not reinsert the label or future information under a new name.',
        ),
        copy(
          'price_per_room 可能帮助比较房源，但若预测目标就是 price，就要小心它是否直接使用了答案。',
          'price_per_room may help compare homes, but if the target is price, check whether it directly uses the answer.',
        ),
        "df = df.assign(price_per_room=lambda d: d['price'] / d['rooms'])",
      ),
      concept(
        'method-chain',
        copy('Method chain', 'Method Chain'),
        copy(
          '把选择、过滤、派生列、分组和排序连成一条链，可以让数据处理过程像配方一样可读。',
          'Chaining selection, filtering, derived columns, grouping, and sorting makes a data pipeline read like a recipe.',
        ),
        copy(
          '先过滤有效价格，再添加单价列，最后按街区聚合。',
          'Filter valid prices, add price-per-room, then aggregate by district.',
        ),
        "(\n    df.dropna(subset=['price'])\n      .assign(price_per_room=lambda d: d['price'] / d['rooms'])\n      .groupby('district')['price_per_room'].mean()\n)",
      ),
      concept(
        'shape-audit',
        copy('Shape 审计', 'Shape Audit'),
        copy(
          '每一步都应该能说明输入行列数、输出行列数、列语义和索引变化。shape 不对，含义通常也不对。',
          'Each step should explain input rows/columns, output rows/columns, column meaning, and index changes. If shape is wrong, meaning is often wrong too.',
        ),
        copy(
          'merge 后行数突然翻倍，常说明连接键不是唯一。',
          'If rows double after merge, the join key is often not unique.',
        ),
      ),
      concept(
        'split-apply-combine',
        copy('Split-apply-combine', 'Split-Apply-Combine'),
        copy(
          'groupby 会改变表的粒度：从逐行样本变成逐组摘要。后续代码必须知道它已经不是原始样本表。',
          'groupby changes table granularity from row-level samples to group-level summaries. Later code must know it is no longer the original sample table.',
        ),
        copy(
          '按 district 求 price 均值后，每一行代表一个街区，而不是一个房源。',
          'After mean price by district, each row represents a district, not a listing.',
        ),
        "df.groupby('district')['price'].mean().reset_index()",
      ),
    ],
    sections: [
      section(
        'read-table-shape',
        copy('每一步都读 shape', 'Read Shape at Every Step'),
        copy(
          md`pandas 代码不只是能跑。每一步都应该能说出输入表和输出表的行数、列数、列含义和索引变化。这样调试时才知道是过滤掉了太多行，还是 merge 造成了重复扩张。

shape 是数据语义的外显信号。select 改变列数，filter 改变行数，assign 增加列，groupby 改变粒度，merge 可能扩张行数，pivot 改变行列方向。`,
          md`pandas code should not only run. Each step should have an expected input/output row count, column count, column meaning, and index behavior. That is how you notice a filter dropping too many rows or a merge expanding duplicates.

Shape is the visible signal of data meaning. select changes columns, filter changes rows, assign adds columns, groupby changes granularity, merge can expand rows, and pivot changes row/column orientation.`,
        ),
        { visualIds: ['pandas-shape-audit-v2'] },
      ),
      section(
        'dataframe-mental-model',
        copy('先建立 DataFrame 心智模型', 'Build the DataFrame Mental Model First'),
        copy(
          md`DataFrame 是带列名和索引的二维表。Series 通常是一列带索引的向量。pandas 入门最常见的错误，是忘记单列选择、多列选择、行过滤和 groupby 结果的形状不同。

把每个操作读成“输入表 -> 规则 -> 输出表”。只要输出表的行、列、索引或粒度改变，后续代码就不能继续假装它还是原表。`,
          md`A DataFrame is a two-dimensional table with column names and an index. A Series is usually one indexed column. A common beginner mistake is forgetting that single-column selection, multi-column selection, row filtering, and groupby outputs have different shapes.

Read every operation as input table -> rule -> output table. Once rows, columns, index, or granularity change, later code cannot pretend it is still the original table.`,
        ),
      ),
      section(
        'selection-filter-assign',
        copy('选择、过滤、新增列', 'Select, Filter, Assign'),
        copy(
          md`典型 pandas 流程先缩小列，再用布尔条件过滤行，最后用 assign 或直接赋值创建派生列。列选择回答“哪些信息进入下一步”，行过滤回答“哪些样本仍然可信”，派生列回答“哪些组合更贴近任务”。

派生列要有业务含义，不能只是把目标答案换个名字放回特征。尤其在教学里，每个 assign 都应该能说明公式、单位和预测时可用性。`,
          md`A typical pandas flow narrows columns, filters rows with boolean masks, then creates derived columns with assign or direct assignment. Column selection answers which information enters the next step, row filtering answers which samples remain trustworthy, and derived columns answer which combinations are more task-relevant.

Derived columns need task meaning; they must not reinsert the target under another name. In teaching, every assign should explain formula, units, and prediction-time availability.`,
        ),
        { labIds: ['pandas-pipeline-lab'] },
      ),
      section(
        'groupby-granularity',
        copy('groupby 会改变粒度', 'groupby Changes Granularity'),
        copy(
          md`groupby 不是普通筛选，它会把逐行样本表变成逐组摘要表。按 district 求均值后，每一行代表一个街区；按 district 和 room_bin 求均值后，每一行代表一个街区-户型组合。

因此 groupby 后最重要的问题是：当前表的一行代表什么？若粒度变了，merge 回原表前必须检查键是否唯一，聚合是否合理，count 是否足够。`,
          md`groupby is not ordinary filtering; it changes a row-level sample table into a group-level summary. After mean by district, each row represents a district. After mean by district and room_bin, each row represents a district-room-bin combination.

The key question after groupby is: what does one row now represent? If granularity changed, check key uniqueness, aggregation meaning, and counts before merging back to the original table.`,
        ),
        { visualIds: ['pandas-method-chain-video'] },
      ),
      section(
        'join-group-pivot',
        copy('连接、拼接和透视都要检查形状', 'Join, Concat, and Pivot Need Shape Checks'),
        copy(
          md`merge 用键把表连接起来，concat 沿行或列拼接同结构数据，pivot_table 把长表整理成交叉表。每一种操作都可能改变 shape，因此必须检查键是否唯一、类别是否完整、聚合是否合理。

最常见的错误是 many-to-many merge 造成行数膨胀。若左表某个 key 出现 3 次，右表同一 key 出现 4 次，连接后会产生 12 行组合。shape audit 能在建模前发现这种问题。`,
          md`merge joins tables by keys, concat stacks compatible data along rows or columns, and pivot_table reshapes long data into a cross-tab. Each operation can change shape, so check key uniqueness, category coverage, and aggregation meaning.

A common error is row expansion from many-to-many merge. If a key appears 3 times on the left and 4 times on the right, the join creates 12 combinations. Shape audit catches this before modeling.`,
        ),
      ),
      section(
        'method-chain-readable',
        copy('链式处理要可读，不是越长越好', 'Method Chains Should Be Readable, Not Long'),
        copy(
          md`method chain 的优点是把数据配方从上到下写清楚。它的风险是链太长以后，中间 shape 看不见，错误只在最后暴露。好的链条会按概念分段，并在过滤、merge、groupby 这类关键变化处检查中间结果。

教学上可以要求每段链回答三件事：这一步输入是什么，输出是什么，为什么这一步在业务上合理。回答不了，就说明链条需要拆开。`,
          md`A method chain is useful because it writes a data recipe from top to bottom. Its risk is that long chains hide intermediate shape, so errors appear only at the end. A good chain is segmented by concept and inspects intermediates around filtering, merge, and groupby.

For teaching, each chain segment should answer three questions: what is the input, what is the output, and why is this step meaningful for the task. If it cannot answer them, split the chain.`,
        ),
      ),
      section(
        'workflow-handoff',
        copy('把 pandas 流程变成可复现配方', 'Turn pandas Workflow into a Reproducible Recipe'),
        copy(
          md`数据准备流程最终应该能被重新运行、测试和解释。不要只保存最后一张表；要保存每一步的规则、关键参数、shape 变化和来源假设。这样当模型表现变化时，才能追踪是数据分布变了、清洗规则变了，还是模型本身变了。

数据实验室的 pandas Pipeline 模拟器把每个按钮对应到等价 pandas 代码和输出表变化。目标是让学习者把代码读成数据协议，而不是把 pandas 当作黑盒魔法。`,
          md`A data-preparation workflow should be rerunnable, testable, and explainable. Do not save only the final table; save rules, key parameters, shape changes, and source assumptions for each step. Then when model behavior changes, you can trace whether data distribution, cleaning rules, or the model changed.

The pandas Pipeline simulator maps each button to equivalent pandas code and output-table changes. The goal is to read code as a data contract, not treat pandas as black-box magic.`,
        ),
        { visualIds: ['pandas-workflow-image'] },
      ),
    ],
    visuals: [
      image(
        'pandas-shape-audit-v2',
        'pandas-shape-audit-v2.png',
        copy('pandas shape 审计链', 'pandas shape-audit chain'),
        copy(
          'select、filter、assign、groupby、merge 和 sort 每一步都会改变表格的行列形状或语义，必须在链式处理中显式检查。',
          'select, filter, assign, groupby, merge, and sort each change table shape or meaning and should be explicitly checked in method chains.',
        ),
        [
          { id: 'input', x: 11, y: 28, label: copy('输入表', 'Input table') },
          { id: 'select', x: 25, y: 16, label: copy('选择列', 'Select') },
          { id: 'filter', x: 39, y: 16, label: copy('过滤行', 'Filter') },
          { id: 'assign', x: 53, y: 16, label: copy('新增列', 'Assign') },
          { id: 'groupby', x: 67, y: 16, label: copy('分组聚合', 'GroupBy') },
          { id: 'merge', x: 80, y: 16, label: copy('连接检查', 'Merge') },
          { id: 'output', x: 93, y: 16, label: copy('输出表', 'Output') },
          { id: 'audit', x: 50, y: 88, label: copy('每步记录 shape', 'Audit shape at every step') },
        ],
      ),
      image(
        'pandas-workflow-image',
        'pandas-workflow.png',
        copy('pandas 链式处理', 'pandas method chain'),
        copy(
          'DataFrame 经过选择、过滤、派生、分组、连接和排序后，形成可复现的数据配方。',
          'A DataFrame passes through selection, filtering, derivation, grouping, joining, and sorting as a reproducible recipe.',
        ),
        [
          { id: 'input', x: 16, y: 13, label: copy('输入 DataFrame', 'Input DataFrame') },
          { id: 'chain', x: 52, y: 13, label: copy('链式步骤', 'method chain') },
          { id: 'output', x: 83, y: 13, label: copy('输出表', 'Output table') },
          { id: 'shape', x: 51, y: 84, label: copy('每步检查 shape', 'Check shape each step') },
        ],
      ),
      video(
        'pandas-method-chain-video',
        'pandas-method-chain',
        copy('pandas 链式处理动画', 'pandas method-chain animation'),
        copy(
          '动画展示一张表如何经过过滤、派生、分组、连接和排序得到结果。',
          'Animation showing a table moving through filter, assign, groupby, merge, and sort.',
        ),
      ),
    ],
    labs: [
      lab('pandas-pipeline-lab', copy('pandas Pipeline 模拟器', 'pandas Pipeline Simulator'), 'PandasPipelineLab', [
        copy(
          '能把每个按钮对应到一段 pandas 代码。',
          'Map each button to a pandas code snippet.',
        ),
        copy(
          '能用行列数变化判断 pipeline 是否符合预期。',
          'Use row/column shape changes to judge whether the pipeline behaves as expected.',
        ),
        copy(
          '能解释 groupby、merge 和 assign 分别怎样改变表格语义。',
          'Explain how groupby, merge, and assign each change table meaning.',
        ),
      ]),
    ],
    quizzes: [
      quiz(
        'series-dataframe',
        copy('在 pandas 中，单列选择通常返回什么？', 'In pandas, what does selecting one column usually return?'),
        'series',
        copy('Series。', 'A Series.'),
        copy('一定返回完整 DataFrame。', 'Always a full DataFrame.'),
        copy(
          '单列和多列选择的返回类型不同，是 pandas 入门中最常见的形状问题。',
          'Single-column and multi-column selection return different shapes, a common beginner issue.',
        ),
      ),
      quiz(
        'merge-expansion',
        copy('merge 后行数突然增加，最常见的原因是什么？', 'If rows suddenly increase after merge, what is the most common reason?'),
        'many-to-many',
        copy('连接键不是唯一，发生了多对多组合。', 'The join key is not unique, causing many-to-many combinations.'),
        copy('pandas 自动复制所有列名。', 'pandas automatically duplicates all column names.'),
        copy(
          'merge 会按匹配键组合左右表，键重复会扩张行数。',
          'merge combines rows by matching keys, and repeated keys can expand row count.',
        ),
      ),
      quiz(
        'groupby-grain',
        copy('groupby 之后，表格粒度通常发生了什么变化？', 'After groupby, how does table granularity usually change?'),
        'group',
        copy('从逐样本行变成逐组摘要行。', 'It changes from sample-level rows to group-level summary rows.'),
        copy('完全不变，只是排序不同。', 'It stays exactly the same, only sorted differently.'),
        copy(
          '聚合后的每一行代表一个组，因此后续解释要按组粒度进行。',
          'After aggregation, each row represents a group, so later interpretation is at group granularity.',
        ),
      ),
    ],
    misconceptions: [
      misconception(
        'chain-hard-debug',
        copy('method chain 越长越专业。', 'The longer a method chain, the more professional it is.'),
        copy(
          '好的链条应该按概念分段，并在关键 shape 变化处容易检查。',
          'A good chain is conceptually segmented and easy to inspect at key shape changes.',
        ),
        copy(
          '过滤、merge 和 groupby 通常值得分别看中间结果。',
          'Filtering, merge, and groupby often deserve intermediate inspection.',
        ),
      ),
      misconception(
        'assign-always-safe',
        copy('只要是 assign 新增的列，就一定是合法特征。', 'Any column created with assign is automatically a valid feature.'),
        copy(
          '派生列也可能泄漏 label 或未来信息，必须检查公式来源和预测时可用性。',
          'A derived column can still leak the label or future information, so its formula and availability must be checked.',
        ),
        copy(
          '用成交价计算 price_per_room 再预测成交价，就是把答案放回输入。',
          'Using final sale price to compute price_per_room while predicting final sale price puts the answer back into input.',
        ),
      ),
      misconception(
        'shape-is-cosmetic',
        copy('shape 只是调试细节，和数据含义无关。', 'Shape is only a debugging detail and unrelated to meaning.'),
        copy(
          'shape 改变通常意味着样本集合、特征集合或表格粒度改变。',
          'A shape change usually means the sample set, feature set, or table granularity changed.',
        ),
        copy(
          'groupby 后从 1000 行变 12 行，说明一行不再代表一个样本。',
          'After groupby changes 1000 rows to 12 rows, one row no longer represents one sample.',
        ),
      ),
    ],
    sourceReferences: [
      sources.pandasIntro,
      sources.pandasDerived,
      sources.pandasGroupby,
      sources.pandasVisualization,
    ],
  }),
  categoricalDataModule,
]

export const dataLabModuleRegistry = Object.fromEntries(
  dataLabModules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]),
) as Record<DataLabModuleId, DataLabModule>
