import type {
  AlgorithmModuleDefinition,
  LocalizedCopy,
  ModuleSourceReference,
  ModuleVisualAsset,
  StorySection,
} from '../types/ml'
import { simulateClassification } from '../simulations/classification'
import { algorithmCheckpointsBySlug } from './algorithmCheckpoints'

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

const sources = {
  mlccClassification: {
    label: loc('Google MLCC：Classification', 'Google MLCC: Classification'),
    href: 'https://developers.google.com/machine-learning/crash-course/classification',
    license: 'CC BY 4.0',
  },
  mlccThresholding: {
    label: loc('Google MLCC：Thresholding', 'Google MLCC: Thresholding'),
    href: 'https://developers.google.com/machine-learning/crash-course/classification/thresholding',
    license: 'CC BY 4.0',
  },
  mlccMetrics: {
    label: loc('Google MLCC：Accuracy, Precision, Recall', 'Google MLCC: Accuracy, Precision, Recall'),
    href: 'https://developers.google.com/machine-learning/crash-course/classification/accuracy-precision-recall',
    license: 'CC BY 4.0',
  },
  mlccRoc: {
    label: loc('Google MLCC：ROC and AUC', 'Google MLCC: ROC and AUC'),
    href: 'https://developers.google.com/machine-learning/crash-course/classification/roc-and-auc',
    license: 'CC BY 4.0',
  },
  mlccMulticlass: {
    label: loc('Google MLCC：Multiclass classification', 'Google MLCC: Multiclass classification'),
    href: 'https://developers.google.com/machine-learning/crash-course/classification/multiclass',
    license: 'CC BY 4.0',
  },
  sklearnEvaluation: {
    label: loc('scikit-learn：模型评估指标', 'scikit-learn: Model evaluation metrics'),
    href: 'https://scikit-learn.org/stable/modules/model_evaluation.html',
  },
  d2lSoftmax: {
    label: loc('D2L：Softmax 回归', 'D2L: Softmax regression'),
    href: 'https://d2l.ai/chapter_linear-classification/softmax-regression.html',
    license: 'CC BY-SA 4.0',
  },
} satisfies Record<string, ModuleSourceReference>

function chapter(
  id: string,
  title: LocalizedCopy,
  markdown: LocalizedCopy,
  callout: LocalizedCopy,
  experimentPrompt: LocalizedCopy,
  visualIds: string[],
  sourceRefs: ModuleSourceReference[],
  metricEmphasis: string[] = [],
): StorySection {
  return {
    id,
    eyebrowKey: 'common.chapter',
    titleKey: `modules.classification.sections.${id}.title`,
    title,
    markdown,
    callout,
    experimentPrompt,
    visualIds,
    sources: sourceRefs,
    metricEmphasis,
  }
}

export const classificationVisuals: ModuleVisualAsset[] = [
  {
    id: 'threshold-score-ruler',
    type: 'image',
    title: loc('阈值把分数翻译成类别', 'Threshold translates score into class'),
    caption: loc(
      '同一批概率分数在阈值两侧会得到不同预测；阈值不是模型本体，而是决策策略。',
      'The same probability scores become different predictions on either side of the threshold; the threshold is a decision policy.',
    ),
    assetPath: '/classification/generated/threshold-score-ruler.png',
  },
  {
    id: 'confusion-matrix-outcomes',
    type: 'image',
    title: loc('四种分类结果', 'Four classification outcomes'),
    caption: loc(
      '混淆矩阵把“对/错”拆成 TP、FP、TN、FN，让错误类型可以被具体讨论。',
      'A confusion matrix splits right and wrong into TP, FP, TN, and FN so error types can be discussed precisely.',
    ),
    assetPath: '/classification/generated/confusion-matrix-outcomes.png',
  },
  {
    id: 'roc-auc-ranking',
    type: 'image',
    title: loc('ROC 曲线与排序质量', 'ROC curve and ranking quality'),
    caption: loc(
      'ROC 扫描所有阈值，AUC 概括模型把正样本排在负样本前面的整体能力。',
      'ROC scans every threshold, while AUC summarizes how well positives are ranked ahead of negatives.',
    ),
    assetPath: '/classification/generated/roc-auc-ranking.png',
  },
  {
    id: 'prediction-bias-calibration',
    type: 'image',
    title: loc('预测偏差与校准', 'Prediction bias and calibration'),
    caption: loc(
      '预测为正的比例若长期偏离真实正例比例，就需要检查偏差、阈值、样本分布或校准。',
      'If the predicted-positive rate persistently differs from the true positive rate, inspect bias, threshold, distribution, or calibration.',
    ),
    assetPath: '/classification/generated/prediction-bias-calibration.png',
  },
  {
    id: 'classification-threshold-video',
    type: 'manim-video',
    title: loc('阈值扫描', 'Threshold sweep'),
    caption: loc('动画展示阈值移动时预测集合如何改变。', 'The animation shows how the predicted-positive set changes as the threshold moves.'),
    assetPath: '/manim/classification/threshold-sweep.mp4',
    posterPath: '/manim/classification/threshold-sweep.svg',
  },
  {
    id: 'classification-confusion-video',
    type: 'manim-video',
    title: loc('混淆矩阵更新', 'Confusion matrix update'),
    caption: loc('样本进入四个格子后，指标才有明确来源。', 'Metrics become traceable once examples land in the four cells.'),
    assetPath: '/manim/classification/confusion-update.mp4',
    posterPath: '/manim/classification/confusion-update.svg',
  },
  {
    id: 'classification-roc-video',
    type: 'manim-video',
    title: loc('ROC 曲线生成', 'ROC curve construction'),
    caption: loc('每个阈值贡献一个 TPR/FPR 点，连起来形成 ROC。', 'Each threshold contributes one TPR/FPR point; connecting them forms ROC.'),
    assetPath: '/manim/classification/roc-construction.mp4',
    posterPath: '/manim/classification/roc-construction.svg',
  },
  {
    id: 'classification-softmax-video',
    type: 'manim-video',
    title: loc('Softmax 概率分配', 'Softmax probability allocation'),
    caption: loc('多分类把分数归一化为共享总和为 1 的概率预算。', 'Multiclass classification normalizes scores into a shared probability budget that sums to 1.'),
    assetPath: '/manim/classification/softmax-simplex.mp4',
    posterPath: '/manim/classification/softmax-simplex.svg',
  },
]

export const classificationModule: AlgorithmModuleDefinition = {
  slug: 'classification',
  route: '/learn/classification',
  titleKey: 'modules.classification.title',
  kickerKey: 'modules.classification.kicker',
  introKey: 'modules.classification.intro',
  summaryKey: 'modules.classification.summary',
  theme: '#eef8f6',
  accent: '#0f9f8f',
  visuals: classificationVisuals,
  checkpoints: algorithmCheckpointsBySlug.classification,
  sourceNote: loc(
    '本模块改写并重组自 Google Machine Learning Crash Course 的 Classification 系列，补充 scikit-learn 指标定义和 D2L softmax 结构。Google 内容按 CC BY 4.0 署名使用，D2L 按 CC BY-SA 4.0 署名使用。',
    'This module rewrites and reorganizes Google Machine Learning Crash Course classification lessons, with supplemental metric framing from scikit-learn and softmax structure from D2L. Google content is attributed under CC BY 4.0; D2L is attributed under CC BY-SA 4.0.',
  ),
  chapters: [
    chapter(
      'scores',
      loc('分类先输出分数，再做决策', 'Classification outputs scores before decisions'),
      loc(
        `### 核心问题
分类模型是不是直接给出“是/否”答案？

### 概念直觉
大多数分类系统先输出一个可排序的分数或概率，再把这个连续信号翻译成类别。分数回答“这个样本有多像正类”，阈值才回答“现在要不要把它判为正类”。把两件事分开，后面才看得懂为什么同一个模型在不同业务里会选择不同阈值。

### 手算例子
如果垃圾邮件模型给三封邮件的正类概率分别为 $0.82,0.47,0.18$，阈值为 $0.5$ 时，第一封被判为垃圾邮件，后两封不会。概率本身没有改变，改变的是决策规则。

### 公式
二分类常写成：

$$s=f(x),\\quad p=\\sigma(s),\\quad \\hat{y}=1[p\\ge t]$$

$s$ 是模型分数，$p$ 是概率，$t$ 是阈值。

### 常见误解
不要把概率输出和最终类别混成一件事。概率是模型信号，类别是使用这个信号后的行动。

### 交互实验设计
观察上方分数带：蓝点和橙点按概率排序。移动阈值时，模型分数不变，只有被划入“预测正类”的样本集合改变。

### 来源参考
改写自 Google MLCC Classification 对分类输出和阈值决策的讲解。`,
        `### Core Question
Does a classifier directly output a yes/no answer?

### Concept
Most classifiers first output a sortable score or probability, then translate that continuous signal into a class. The score answers “how positive does this example look?” The threshold answers “should we act as if it is positive now?” Separating those two ideas makes every later metric easier to read.

### Worked Example
If an email classifier gives spam probabilities $0.82,0.47,0.18$ and the threshold is $0.5$, only the first email is predicted as spam. The probabilities did not change; only the decision rule was applied.

### Formula
Binary classification is often written as:

$$s=f(x),\\quad p=\\sigma(s),\\quad \\hat{y}=1[p\\ge t]$$

$s$ is the model score, $p$ is the probability, and $t$ is the threshold.

### Common Mistake
Do not collapse probability output and final class into one thing. Probability is model signal; class is a decision made from that signal.

### Interaction Design
Read the score strip: blue and orange examples are sorted by probability. When the threshold moves, scores stay fixed while the predicted-positive set changes.

### Source References
Rewritten from Google MLCC Classification and its thresholding explanation.`,
      ),
      loc('先把“模型知道什么”和“我们决定怎么做”分开。', 'Separate what the model knows from what we decide to do.'),
      loc('把阈值从 0.3 拖到 0.7，观察预测为正的样本数量如何减少。', 'Drag the threshold from 0.3 to 0.7 and watch predicted positives shrink.'),
      ['threshold-score-ruler', 'classification-threshold-video'],
      [sources.mlccClassification, sources.mlccThresholding],
      ['positiveRate'],
    ),
    chapter(
      'thresholds',
      loc('阈值控制误报和漏报的取舍', 'Threshold controls the false-positive / false-negative tradeoff'),
      loc(
        `### 核心问题
为什么分类器不总是使用 $0.5$ 作为阈值？

### 概念直觉
$0.5$ 只是默认值，不是定律。阈值降低会抓住更多正例，同时也会把更多负例误报为正。阈值升高会减少误报，但会漏掉更多真正正例。分类任务真正困难的地方，常常不是“哪个阈值数学上最漂亮”，而是“哪种错误更贵”。

### 手算例子
有 10 个欺诈交易，其中模型在阈值 $0.5$ 下抓到 7 个，误报 3 个。如果阈值降到 $0.3$，可能抓到 9 个，但误报增加到 8 个。若漏报欺诈的成本远高于人工复核，低阈值可能更合理。

### 公式
阈值规则仍然很简单：

$$\\hat{y}=1 \\quad \\text{if} \\quad p\\ge t$$

但 $t$ 应由任务目标、类别比例、误报成本和漏报成本共同决定。

### 常见误解
不要把阈值调优当成“篡改模型”。它是在模型分数固定后，选择业务行动边界。

### 交互实验设计
同时调节 false-positive cost 和 false-negative cost。观察 expected cost 的最低点是否还停在 $0.5$。

### 来源参考
改写自 Google MLCC Thresholding 中对阈值与错误类型取舍的讲解。`,
        `### Core Question
Why doesn’t every classifier use $0.5$ as the threshold?

### Concept
$0.5$ is a default, not a law. Lower thresholds catch more positives but also create more false positives. Higher thresholds reduce false positives but miss more real positives. In real classification, the difficult question is often not which threshold is elegant, but which error is more expensive.

### Worked Example
Suppose there are 10 fraudulent transactions. At threshold $0.5$, the model catches 7 and creates 3 false alarms. At threshold $0.3$, it might catch 9 but create 8 false alarms. If missed fraud is much more expensive than manual review, the lower threshold may be better.

### Formula
The rule is still simple:

$$\\hat{y}=1 \\quad \\text{if} \\quad p\\ge t$$

But $t$ should reflect task goals, class balance, false-positive cost, and false-negative cost.

### Common Mistake
Threshold tuning is not cheating. It chooses the action boundary after model scores are fixed.

### Interaction Design
Adjust false-positive cost and false-negative cost together. Watch whether the lowest expected cost still sits near $0.5$.

### Source References
Rewritten from Google MLCC Thresholding.`,
      ),
      loc('阈值是决策策略；它应该服务错误成本。', 'Threshold is a decision policy; it should serve error cost.'),
      loc('提高漏报成本，观察推荐阈值为什么会向左移动。', 'Raise false-negative cost and watch why the useful threshold moves left.'),
      ['threshold-score-ruler', 'classification-threshold-video'],
      [sources.mlccThresholding, sources.sklearnEvaluation],
      ['expectedCost'],
    ),
    chapter(
      'confusionMatrix',
      loc('混淆矩阵把“对错”拆成四类结果', 'Confusion matrix splits right and wrong into four outcomes'),
      loc(
        `### 核心问题
为什么只看 accuracy 不够？

### 概念直觉
分类结果不是只有“对”和“错”。正类被判正是 TP，负类被判负是 TN；负类被误报为正是 FP，正类被漏掉是 FN。混淆矩阵把每个样本放进这四个格子，后续所有指标都从这里出发。

### 手算例子
假设 20 个样本中，$TP=6, FP=2, TN=10, FN=2$。准确率是 $(6+10)/20=0.8$。但你还应该问：那 2 个漏报是否比 2 个误报更严重？

### 公式
$$\\text{accuracy}=\\frac{TP+TN}{TP+FP+TN+FN}$$

### 常见误解
accuracy 高不代表错误类型可接受。类别不平衡时，模型甚至可以靠总预测多数类获得很高 accuracy。

### 交互实验设计
移动阈值时，看四个格子如何增减。尤其注意阈值升高时 FP 通常下降，FN 通常上升。

### 来源参考
改写自 Google MLCC 对混淆矩阵和 accuracy 局限的讲解，并参考 scikit-learn 指标命名。`,
        `### Core Question
Why is accuracy not enough?

### Concept
Classification results are not just right or wrong. A positive predicted positive is TP; a negative predicted negative is TN. A negative predicted positive is FP, and a positive predicted negative is FN. The confusion matrix places every example into one of those four cells; the rest of the metrics start there.

### Worked Example
For 20 examples, suppose $TP=6, FP=2, TN=10, FN=2$. Accuracy is $(6+10)/20=0.8$. But you should still ask whether those two missed positives are more serious than the two false alarms.

### Formula
$$\\text{accuracy}=\\frac{TP+TN}{TP+FP+TN+FN}$$

### Common Mistake
High accuracy does not mean the error mix is acceptable. With class imbalance, a model can predict the majority class and still look accurate.

### Interaction Design
Move the threshold and watch the four cells change. Notice how raising the threshold usually lowers FP while raising FN.

### Source References
Rewritten from Google MLCC confusion-matrix and accuracy material, with metric naming aligned to scikit-learn.`,
      ),
      loc('先读四个格子，再读任何派生指标。', 'Read the four cells before any derived metric.'),
      loc('把类别比例调到低正例场景，观察 accuracy 为什么可能误导。', 'Set a low positive prevalence and observe why accuracy can mislead.'),
      ['confusion-matrix-outcomes', 'classification-confusion-video'],
      [sources.mlccMetrics, sources.sklearnEvaluation],
      ['accuracy'],
    ),
    chapter(
      'precisionRecall',
      loc('Precision、Recall 和 F1 回答不同问题', 'Precision, recall, and F1 answer different questions'),
      loc(
        `### 核心问题
precision 和 recall 到底差在哪里？

### 概念直觉
Precision 问的是：被模型判为正的样本里，有多少真的为正？Recall 问的是：所有真实正例里，有多少被抓住？F1 把二者合成一个调和平均，惩罚单边很高、另一边很低的情况。

### 手算例子
若 $TP=8, FP=4, FN=2$：

$$\\text{precision}=\\frac{8}{8+4}=0.667$$

$$\\text{recall}=\\frac{8}{8+2}=0.8$$

$$F1=\\frac{2PR}{P+R}\\approx0.727$$

### 公式
$$P=\\frac{TP}{TP+FP},\\quad R=\\frac{TP}{TP+FN},\\quad F1=\\frac{2PR}{P+R}$$

### 常见误解
不要说 precision 或 recall “更高级”。它们对应不同风险：搜索结果更怕误报，疾病筛查常更怕漏报。

### 交互实验设计
移动阈值并观察 precision-recall 两条指标通常会朝相反方向变化。用 F1 找一个折中点，但不要把 F1 当成所有业务的唯一目标。

### 来源参考
改写自 Google MLCC Accuracy, Precision, Recall，并参考 scikit-learn precision/recall/F1 定义。`,
        `### Core Question
What is the difference between precision and recall?

### Concept
Precision asks: among examples predicted positive, how many are truly positive? Recall asks: among all true positives, how many did we catch? F1 combines them with a harmonic mean, penalizing cases where one is high and the other is low.

### Worked Example
If $TP=8, FP=4, FN=2$:

$$\\text{precision}=\\frac{8}{8+4}=0.667$$

$$\\text{recall}=\\frac{8}{8+2}=0.8$$

$$F1=\\frac{2PR}{P+R}\\approx0.727$$

### Formula
$$P=\\frac{TP}{TP+FP},\\quad R=\\frac{TP}{TP+FN},\\quad F1=\\frac{2PR}{P+R}$$

### Common Mistake
Do not call precision or recall universally better. They correspond to different risks: search often fears false positives, while screening often fears false negatives.

### Interaction Design
Move the threshold and notice how precision and recall often move in opposite directions. Use F1 as one compromise, not as the only business objective.

### Source References
Rewritten from Google MLCC Accuracy, Precision, Recall, with definitions aligned to scikit-learn.`,
      ),
      loc('Precision 管“预测正类的纯度”，Recall 管“真实正类的覆盖”。', 'Precision measures predicted-positive purity; recall measures true-positive coverage.'),
      loc('在同一阈值下同时读 precision、recall 和 F1，不要只看其中一个。', 'Read precision, recall, and F1 together at the same threshold.'),
      ['confusion-matrix-outcomes', 'classification-confusion-video'],
      [sources.mlccMetrics, sources.sklearnEvaluation],
      ['precision', 'recall', 'f1'],
    ),
    chapter(
      'costTradeoff',
      loc('错误成本决定指标优先级', 'Error cost decides metric priority'),
      loc(
        `### 核心问题
如果两个模型 accuracy 相同，怎样选更合适的？

### 概念直觉
分类器最终服务行动。误报会触发不必要的行动，漏报会错过应该采取的行动。只要两种错误成本不一样，单看 accuracy 就会丢失关键信息。把成本写进实验，学生才能看到“同一个混淆矩阵为什么在不同任务里价值不同”。

### 手算例子
模型 A 有 $FP=6,FN=1$；模型 B 有 $FP=2,FN=4$。若 $FP$ 成本为 1、$FN$ 成本为 5，则：

$$C_A=6\\times1+1\\times5=11$$

$$C_B=2\\times1+4\\times5=22$$

即使 B 误报更少，A 也可能更适合。

### 公式
$$\\text{expected cost}=\\frac{c_{FP}FP+c_{FN}FN}{N}$$

### 常见误解
不要把指标选择当成纯技术问题。指标是任务价值观的编码。

### 交互实验设计
调高 false-negative cost，再扫描阈值。观察 expected cost 曲线最低点如何改变。

### 来源参考
改写自 Google MLCC 阈值和错误取舍内容，结合实际评估指标的成本解释。`,
        `### Core Question
If two models have the same accuracy, how do we choose?

### Concept
Classifiers serve actions. False positives trigger unnecessary action; false negatives miss action that should have happened. If those two errors have different costs, accuracy drops key information. Writing cost into the lab lets students see why the same confusion matrix can mean different things in different tasks.

### Worked Example
Model A has $FP=6,FN=1$; model B has $FP=2,FN=4$. If false positives cost 1 and false negatives cost 5:

$$C_A=6\\times1+1\\times5=11$$

$$C_B=2\\times1+4\\times5=22$$

Even though B has fewer false positives, A may be the better operational choice.

### Formula
$$\\text{expected cost}=\\frac{c_{FP}FP+c_{FN}FN}{N}$$

### Common Mistake
Metric choice is not purely technical. It encodes task values.

### Interaction Design
Raise false-negative cost, then scan thresholds. Watch where expected cost is minimized.

### Source References
Rewritten from Google MLCC thresholding and error-tradeoff material.`,
      ),
      loc('成本让指标从“看起来好”变成“对任务有用”。', 'Cost turns metrics from looking good into being useful for the task.'),
      loc('把漏报成本设为误报的 5 倍，观察最佳阈值倾向。', 'Set false-negative cost to five times false-positive cost and inspect the threshold preference.'),
      ['threshold-score-ruler'],
      [sources.mlccThresholding, sources.sklearnEvaluation],
      ['expectedCost'],
    ),
    chapter(
      'rocAuc',
      loc('ROC/AUC 衡量跨阈值排序能力', 'ROC/AUC measures ranking across thresholds'),
      loc(
        `### 核心问题
如果阈值可以随任务改变，怎样评价模型本身的排序质量？

### 概念直觉
ROC 曲线把所有阈值都扫一遍：横轴是假正例率 FPR，纵轴是真正例率 TPR。好的模型会让曲线靠近左上角，因为它能在少量误报下抓住大量正例。AUC 是曲线下面积，可以理解为模型把随机正例排在随机负例前面的概率型概括。

### 手算例子
若一个阈值下 $TPR=0.8,FPR=0.2$，说明模型抓住 80% 正例，同时把 20% 负例误报为正。降低阈值后 TPR 可能升高，但 FPR 也会升高。

### 公式
$$TPR=\\frac{TP}{TP+FN},\\quad FPR=\\frac{FP}{FP+TN}$$

$$AUC=\\int_0^1 TPR(FPR)\\,dFPR$$

### 常见误解
AUC 高不自动给出最终阈值。它衡量排序质量，阈值仍要结合成本、产能和业务目标。

### 交互实验设计
拖动阈值时，观察 ROC 图上的当前点如何移动；改变 separability，观察整条曲线如何贴近或远离左上角。

### 来源参考
改写自 Google MLCC ROC and AUC，并参考 scikit-learn roc_auc_score 的评估语境。`,
        `### Core Question
If threshold can change by task, how do we evaluate model ranking itself?

### Concept
ROC scans every threshold. The x-axis is false-positive rate; the y-axis is true-positive rate. A strong model pushes the curve toward the upper-left because it catches many positives with few false alarms. AUC is the area under that curve, often read as a summary of how often a random positive ranks above a random negative.

### Worked Example
At one threshold, $TPR=0.8,FPR=0.2$ means the model catches 80% of positives while incorrectly flagging 20% of negatives. Lowering the threshold may increase TPR, but FPR usually increases too.

### Formula
$$TPR=\\frac{TP}{TP+FN},\\quad FPR=\\frac{FP}{FP+TN}$$

$$AUC=\\int_0^1 TPR(FPR)\\,dFPR$$

### Common Mistake
High AUC does not automatically choose a final threshold. It measures ranking quality; threshold still needs cost, capacity, and task goals.

### Interaction Design
Move the threshold and watch the current point travel on the ROC chart. Change separability and watch the whole curve move toward or away from the upper-left.

### Source References
Rewritten from Google MLCC ROC and AUC, with evaluation context aligned to scikit-learn roc_auc_score.`,
      ),
      loc('ROC 评价的是“跨阈值排序”，不是某一个行动点。', 'ROC evaluates ranking across thresholds, not one action point.'),
      loc('降低 separability，观察 AUC 如何接近随机基线。', 'Lower separability and watch AUC move toward the random baseline.'),
      ['roc-auc-ranking', 'classification-roc-video'],
      [sources.mlccRoc, sources.sklearnEvaluation],
      ['auc'],
    ),
    chapter(
      'biasCalibration',
      loc('Prediction bias 和校准检查概率是否可信', 'Prediction bias and calibration check probability trustworthiness'),
      loc(
        `### 核心问题
模型 accuracy 不差时，为什么还要看 prediction bias 和校准？

### 概念直觉
如果模型预测为正的比例长期高于真实正例比例，可能存在 prediction bias；如果模型给出 0.8 概率的一组样本中，真实正例只有 50%，说明概率没有校准好。前者关注总体比例偏移，后者关注概率值是否能当作频率解释。

### 手算例子
100 个样本里真实正例是 30 个，但模型预测正例 45 个，则：

$$\\text{prediction bias}=0.45-0.30=0.15$$

这不直接说明模型一定坏，但提示需要检查数据分布、阈值、标注或校准。

### 公式
$$\\text{prediction bias}=\\frac{\\#\\hat{y}=1}{N}-\\frac{\\#y=1}{N}$$

校准则比较分箱内平均预测概率和真实正例比例。

### 常见误解
不要只在分类结果上讨论概率。若概率要用于排序、定价、风险控制或资源分配，就必须关注校准。

### 交互实验设计
调节 calibration shift，观察校准曲线如何偏离对角线；再移动阈值，区分“概率偏差”和“行动阈值”两件事。

### 来源参考
改写自 Google MLCC 对 prediction bias 的讲解，并结合概率校准的常用评估方式。`,
        `### Core Question
Why inspect prediction bias and calibration even when accuracy looks acceptable?

### Concept
If the predicted-positive rate persistently exceeds the true positive rate, prediction bias may be present. If examples scored around 0.8 are positive only 50% of the time, probabilities are poorly calibrated. The first checks aggregate rate shift; the second checks whether probability values can be interpreted as frequencies.

### Worked Example
Among 100 examples, suppose 30 are truly positive but the model predicts 45 positives:

$$\\text{prediction bias}=0.45-0.30=0.15$$

That does not prove the model is broken, but it points to data distribution, threshold, labeling, or calibration checks.

### Formula
$$\\text{prediction bias}=\\frac{\\#\\hat{y}=1}{N}-\\frac{\\#y=1}{N}$$

Calibration compares mean predicted probability with observed positive rate inside each bin.

### Common Mistake
Do not discuss probabilities only after classification. If probabilities drive ranking, pricing, risk, or resource allocation, calibration matters.

### Interaction Design
Adjust calibration shift and watch the calibration curve drift from the diagonal. Then move threshold and separate probability bias from action threshold.

### Source References
Rewritten from Google MLCC prediction-bias material with common probability-calibration evaluation framing.`,
      ),
      loc('概率要能被信任，不能只看最终判对没有。', 'If probabilities will be used, final correctness is not enough.'),
      loc('增大 calibration shift，观察 prediction bias 与校准分箱如何变化。', 'Increase calibration shift and watch prediction bias plus calibration bins change.'),
      ['prediction-bias-calibration'],
      [sources.mlccClassification, sources.sklearnEvaluation],
      ['predictionBias'],
    ),
    chapter(
      'multiclass',
      loc('多分类把一个概率扩展成一组概率预算', 'Multiclass extends one probability into a probability budget'),
      loc(
        `### 核心问题
二分类里一个概率就够了，多分类为什么需要 softmax？

### 概念直觉
互斥多分类必须把总和为 1 的概率预算分给所有类别。每个类别先得到一个 logit 分数，softmax 再把所有分数一起指数化并归一化。这样某一类概率升高时，其他类的概率会相应减少。

### 手算例子
三类 logits 为 $[2.2,1.1,0.2]$：

$$p_A=\\frac{e^{2.2}}{e^{2.2}+e^{1.1}+e^{0.2}}$$

这不是分别给每类套 sigmoid，因为三个互斥类别必须共享同一个概率总量。

### 公式
$$\\text{softmax}(z_i)=\\frac{e^{z_i}}{\\sum_j e^{z_j}}$$

多分类交叉熵常写成：

$$CE=-\\sum_i y_i\\log p_i=-\\log p_{true}$$

### 常见误解
不要把互斥多分类写成“每类一个独立 sigmoid”。独立 sigmoid 更适合多标签任务，而不是单个样本只能属于一个主类的任务。

### 交互实验设计
在 Three.js 概率单纯形中调节三个 logit 和 temperature。观察概率点如何在三角形内移动，以及 top-1 类别如何切换。

### 来源参考
改写自 Google MLCC Multiclass 和 D2L Softmax Regression。`,
        `### Core Question
Why does multiclass classification need softmax when binary classification can use one probability?

### Concept
Mutually exclusive multiclass classification must distribute a total probability budget of 1 across all classes. Each class first receives a logit score, and softmax exponentiates and normalizes all scores together. When one class gains probability, other classes lose probability.

### Worked Example
For three logits $[2.2,1.1,0.2]$:

$$p_A=\\frac{e^{2.2}}{e^{2.2}+e^{1.1}+e^{0.2}}$$

This is not one independent sigmoid per class, because mutually exclusive classes must share one probability total.

### Formula
$$\\text{softmax}(z_i)=\\frac{e^{z_i}}{\\sum_j e^{z_j}}$$

Multiclass cross-entropy is often:

$$CE=-\\sum_i y_i\\log p_i=-\\log p_{true}$$

### Common Mistake
Do not model mutually exclusive multiclass classification as independent sigmoids. Independent sigmoids fit multilabel tasks, not one-primary-class tasks.

### Interaction Design
Use the Three.js probability simplex and adjust logits plus temperature. Watch the probability point move inside the triangle and the top-1 class switch.

### Source References
Rewritten from Google MLCC Multiclass and D2L Softmax Regression.`,
      ),
      loc('多分类的关键是共享概率预算，而不是多复制几个二分类器。', 'The key is a shared probability budget, not copying several binary classifiers.'),
      loc('降低 temperature，观察概率分布如何变得更尖锐。', 'Lower temperature and watch the probability distribution become sharper.'),
      ['classification-softmax-video'],
      [sources.mlccMulticlass, sources.d2lSoftmax],
      ['macroF1', 'microF1'],
    ),
  ],
  controls: [
    { key: 'threshold', type: 'range', labelKey: 'controls.threshold', category: 'data', min: 0.05, max: 0.95, step: 0.01, format: 'number' },
    { key: 'prevalence', type: 'range', labelKey: 'controls.prevalence', category: 'data', min: 0.08, max: 0.72, step: 0.01, format: 'percent' },
    { key: 'separability', type: 'range', labelKey: 'controls.separability', category: 'data', min: 0.35, max: 2.4, step: 0.05, format: 'number' },
    { key: 'falsePositiveCost', type: 'range', labelKey: 'controls.falsePositiveCost', category: 'data', min: 0.5, max: 8, step: 0.5, format: 'number' },
    { key: 'falseNegativeCost', type: 'range', labelKey: 'controls.falseNegativeCost', category: 'data', min: 0.5, max: 12, step: 0.5, format: 'number' },
    { key: 'calibrationShift', type: 'range', labelKey: 'controls.calibrationShift', category: 'data', min: -1.4, max: 1.4, step: 0.05, format: 'number' },
    { key: 'temperature', type: 'range', labelKey: 'controls.temperature', category: 'architecture', min: 0.35, max: 2.2, step: 0.05, format: 'number' },
    { key: 'playbackMs', type: 'range', labelKey: 'controls.animationSpeed', category: 'playback', min: 70, max: 300, step: 10, format: 'speed' },
  ],
  presets: [
    {
      id: 'balanced-screening',
      label: loc('平衡筛查', 'Balanced screening'),
      description: loc('中等正例比例和中等可分性，适合观察四格矩阵和 F1。', 'Moderate prevalence and separability for reading the four cells plus F1.'),
      config: { threshold: 0.5, prevalence: 0.36, separability: 1.35, falsePositiveCost: 1, falseNegativeCost: 4, calibrationShift: 0 },
    },
    {
      id: 'rare-positive',
      label: loc('稀有正例', 'Rare positives'),
      description: loc('正例很少时 accuracy 容易虚高，precision/recall 更关键。', 'When positives are rare, accuracy can look inflated and precision/recall matter more.'),
      config: { threshold: 0.34, prevalence: 0.13, separability: 1.45, falsePositiveCost: 1, falseNegativeCost: 8, calibrationShift: -0.15 },
    },
    {
      id: 'noisy-ranking',
      label: loc('排序变差', 'Noisy ranking'),
      description: loc('降低可分性，观察 ROC 曲线如何靠近随机基线。', 'Lower separability and watch ROC move toward the random baseline.'),
      config: { threshold: 0.52, prevalence: 0.42, separability: 0.55, falsePositiveCost: 1, falseNegativeCost: 3, calibrationShift: 0.2 },
    },
    {
      id: 'sharp-softmax',
      label: loc('尖锐 softmax', 'Sharp softmax'),
      description: loc('降低 temperature，让多分类概率集中到最高 logit。', 'Lower temperature so multiclass probability concentrates on the top logit.'),
      config: { temperature: 0.55, logitA: 2.2, logitB: 1.1, logitC: 0.2 },
    },
  ],
  createDefaultConfig: () => ({
    threshold: 0.5,
    prevalence: 0.36,
    separability: 1.35,
    falsePositiveCost: 1,
    falseNegativeCost: 4,
    calibrationShift: 0,
    noise: 0.72,
    sampleCount: 92,
    temperature: 1,
    logitA: 2.2,
    logitB: 1.1,
    logitC: 0.2,
    playbackMs: 120,
    seed: 37,
  }),
  simulate: simulateClassification,
}
