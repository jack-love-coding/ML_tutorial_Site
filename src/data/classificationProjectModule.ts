import type { AlgorithmModuleDefinition, LocalizedCopy, ModuleSimulation, StorySection } from '../types/ml'
import { algorithmCheckpointsBySlug } from './algorithmCheckpoints'
import { classificationProjectCode, classificationProjectReference as reference } from './generated/classificationProjectRuntime'

function code(id: keyof typeof classificationProjectCode, locale: keyof LocalizedCopy) {
  return `<details><summary>${locale === 'zh-CN' ? '查看本步 Python 代码' : 'Read the Python code for this step'}</summary>\n\n~~~python\n${classificationProjectCode[id]}~~~\n\n</details>`
}

function metricsTable(split: 'validation' | 'lockedTest', locale: keyof LocalizedCopy) {
  const report = reference[split]
  const count = report.confusion
  const heading = locale === 'zh-CN' ? '| 指标 | 参考结果 |' : '| Metric | Reference result |'
  return `${heading}\n| --- | ---: |\n| TP / FP / TN / FN | ${count.TP} / ${count.FP} / ${count.TN} / ${count.FN} |\n| Precision | ${report.precision.toFixed(4)} |\n| Recall | ${report.recall.toFixed(4)} |\n| F1 | ${report.f1.toFixed(4)} |\n| ROC/AUC | ${report.auc.toFixed(4)} |\n| Accuracy | ${report.accuracy.toFixed(4)} |\n| 5 × FP + FN | ${report.cost} |`
}

function loc(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

function chapter(
  id: string,
  titleKey: string,
  markdown: LocalizedCopy,
  callout: LocalizedCopy,
  experimentPrompt: LocalizedCopy,
): StorySection {
  return {
    id,
    eyebrowKey: 'common.chapter',
    titleKey,
    markdown,
    callout,
    experimentPrompt,
  }
}

function simulateClassificationProject(): ModuleSimulation {
  return {
    snapshots: [
      {
        step: 0,
        loss: 0,
        accuracy: 0,
        derivedMetrics: {
          moduleType: 'binary-classification-project',
          referenceIds: [
            'REF-SKLEARN-TEXT-FEATURES',
            'REF-SKLEARN-TEXT-GRID-SEARCH',
            'REF-SKLEARN-CLASSIFICATION-METRICS',
            'REF-GOOGLE-MLCC-CLASSIFICATION',
          ],
        },
      },
    ],
  }
}

export const classificationProjectModule: AlgorithmModuleDefinition = {
  slug: 'classification-project',
  route: '/learn/classification-project',
  titleKey: 'modules.classificationProject.title',
  kickerKey: 'modules.classificationProject.kicker',
  introKey: 'modules.classificationProject.intro',
  summaryKey: 'modules.classificationProject.summary',
  theme: '#f0fdfa',
  accent: '#0f766e',
  checkpoints: algorithmCheckpointsBySlug['classification-project'],
  chapters: [
    chapter(
      'problem-and-costs', 'modules.classificationProject.sections.problemAndCosts.title',
      loc(
        `### 本节问题：正类是什么，误拦和漏拦各意味着什么？
用垃圾邮件过滤的思路理解短信分类：输入是短信文本，正类是 spam，负类是 ham。误拦（false positive）把 ham 判成 spam，漏拦（false negative）把 spam 判成 ham。本案例预先约定一次误拦的成本为 5，一次漏拦为 1；这个教学约定不代表所有业务。

### 准备和操作
先读完分类指标与模型选择。下载 [原始 CSV](/datasets/numerical-methods/sms-spam.csv)、[冻结划分](/classification-project/v1/split.json)、[中文 Notebook](/classification-project/v1/classification-project.zh-CN.ipynb) 和 [依赖表](/classification-project/v1/requirements.txt)，放在同一目录，按顺序运行六步。[英文 Notebook](/classification-project/v1/classification-project.en.ipynb)、[完整参考代码](/classification-project/v1/reference.py)、[参考结果](/classification-project/v1/reference-summary.json) 和 [文件清单](/classification-project/v1/manifest.json) 也可下载。

原始语料是已有的 UCI SMS Spam Collection（Tiago Almeida、José María Gómez Hidalgo，CC BY 4.0；[来源记录](/datasets/numerical-methods/sms-spam-manifest.json)），共 ${reference.sourceRows} 行。它也用于稀疏矩阵专题；这里重新建立独立的项目划分，不能沿用全语料词表。大小写和空白规范化后，重复消息只保留第一条，得到 ${reference.uniqueMessages} 条；排除的 ${reference.excludedDuplicateRows} 行不再跨集合重复出现。训练 ${reference.counts.train}、验证 ${reference.counts.validation}、测试 ${reference.counts.test} 条，编号已冻结。

总预测 ham 的验证集 accuracy 为 ${(reference.majorityValidationAccuracy * 100).toFixed(2)}%，却抓不到 spam。后面要比较正类指标和错误成本，而不是只看 accuracy。这是公开参考基准，不能当作真实邮件流的未来表现保证。
${code('setup', 'zh-CN')}

**老师会先问：** 当前正在读取哪一个集合？下一步先搭建只在训练数据上拟合的文本流水线。`,
        `### Question: what is positive, and what do false blocks and missed spam mean?
Use the idea of spam filtering for SMS classification: text is the input, spam is positive, and ham is negative. A false positive labels ham as spam; a false negative labels spam as ham. Before analysis, this example assigns cost 5 to a false block and 1 to missed spam; those are teaching choices, not universal business costs.

### Prepare and run
Read classification metrics and model selection first. Download the [source CSV](/datasets/numerical-methods/sms-spam.csv), [frozen split](/classification-project/v1/split.json), [English Notebook](/classification-project/v1/classification-project.en.ipynb) and [requirements](/classification-project/v1/requirements.txt) into one directory, then run six steps in order. The [Chinese Notebook](/classification-project/v1/classification-project.zh-CN.ipynb), [reference code](/classification-project/v1/reference.py), [reference results](/classification-project/v1/reference-summary.json) and [file manifest](/classification-project/v1/manifest.json) are also available.

The existing UCI SMS Spam Collection (Tiago Almeida and José María Gómez Hidalgo, CC BY 4.0; [source record](/datasets/numerical-methods/sms-spam-manifest.json)) has ${reference.sourceRows} rows and also appears in the sparse-matrix topic. This project establishes its own frozen split and must not reuse the full-corpus vocabulary. Case-folding and collapsing whitespace identifies duplicate messages; retain their first row, leaving ${reference.uniqueMessages} messages and excluding ${reference.excludedDuplicateRows} repeated rows. Frozen counts are ${reference.counts.train} train, ${reference.counts.validation} validation and ${reference.counts.test} test.

Always predicting ham gives ${(reference.majorityValidationAccuracy * 100).toFixed(2)}% validation accuracy but catches no spam. Compare positive-class metrics and costs, not accuracy alone. This public reference benchmark does not guarantee performance on future email traffic.
${code('setup', 'en')}

**Review question:** which split are you reading now? Next, define a text Pipeline that fits training data only.`,
      ),
      loc('先冻结数据职责和错误成本，再选择模型。', 'Freeze split roles and error costs before choosing a model.'),
      loc('选择“文本”场景，指出 false positive 和 false negative 的实际后果。', 'Select the Text scene and identify the consequences of false positives and false negatives.'),
    ),
    chapter(
      'text-to-features', 'modules.classificationProject.sections.textToFeatures.title',
      loc(
        `### 本节问题：词表由谁学习？
TfidfVectorizer 把文本变为 sparse matrix。每一列对应一个词或词组，每一行对应一条短信。这里保留至少在两篇训练文档中出现的词，使用一元和二元词组。

原始文本进入 Pipeline，向量化和 LogisticRegression 绑在一起。交叉验证会在每个训练折里重新拟合词表和 IDF，验证折只做 transform。这里先搭建流程，下一步才 fit；不要先在整份 CSV 上 fit_transform 后再切分。
${code('vectorizer', 'zh-CN')}

下一步比较同一训练协议下的候选参数。向量和 sparse matrix 的完整解释可回看 [稀疏矩阵专题](/math-lab/modules/sparse-matrices)。

REF-SKLEARN-TEXT-FEATURES、REF-SKLEARN-TEXT-GRID-SEARCH`,
        `### Question: which data learns the vocabulary?
TfidfVectorizer converts text to a sparse matrix. Each column represents a token or phrase and each row a message. Keep terms present in at least two training documents, using unigrams and bigrams.

Raw text enters a Pipeline combining vectorization with LogisticRegression. Every CV training fold refits vocabulary and IDF; its validation fold only transforms. Define the workflow now and fit it next. Do not fit_transform the full CSV before splitting.
${code('vectorizer', 'en')}

Next, compare candidate parameters under one training protocol. Revisit the [sparse-matrix topic](/math-lab/modules/sparse-matrices) for the full representation explanation.

REF-SKLEARN-TEXT-FEATURES, REF-SKLEARN-TEXT-GRID-SEARCH`,
      ),
      loc('词表和 IDF 也是学出来的参数，必须遵守训练边界。', 'Vocabulary and IDF are learned parameters and must respect the training boundary.'),
      loc('选择“向量”场景，说明验证短信遇到新词时为什么不能重学词表。', 'Select Vector and explain why unseen validation words cannot trigger vocabulary refitting.'),
    ),
    chapter(
      'pipeline-baseline', 'modules.classificationProject.sections.pipelineBaseline.title',
      loc(
        `### 本节问题：怎样比较候选参数而不提前看测试集？
划分文件由 train_test_split 在去重后的短信上使用 stratify 生成；运行参考代码时直接读取这些固定编号。只在 train 内做三折 StratifiedKFold，使用正类 spam 的 F1 比较 C=0.5、1、2。

| C | 三折平均 F1 | 标准差 |
| --- | ---: | ---: |
${reference.cv.map(row => `| ${row.C} | ${row.meanF1.toFixed(4)} | ${row.stdF1.toFixed(4)} |`).join('\n')}

参考选择 C=${reference.selectedC}，随后只在全部 train 上 refit。训练文本的矩阵形状为 ${reference.trainingMatrixShape[0]} × ${reference.trainingMatrixShape[1]}。这个选择不使用外部 validation 或 test 的分数；下一步才用 validation 选择阈值。
${code('fit', 'zh-CN')}

REF-SKLEARN-TEXT-GRID-SEARCH、REF-SKLEARN-CV`,
        `### Question: how can candidate parameters be compared without peeking at test?
The split file was created with train_test_split and stratify after deduplicating messages. The reference run reads those fixed IDs. Use three-fold StratifiedKFold inside train only, comparing C=0.5, 1 and 2 by spam F1.

| C | Mean CV F1 | Standard deviation |
| --- | ---: | ---: |
${reference.cv.map(row => `| ${row.C} | ${row.meanF1.toFixed(4)} | ${row.stdF1.toFixed(4)} |`).join('\n')}

The reference selects C=${reference.selectedC}, then refits on all train rows only. The training text matrix has shape ${reference.trainingMatrixShape[0]} × ${reference.trainingMatrixShape[1]}. External validation and test scores do not choose C. Next, use validation to select a threshold.
${code('fit', 'en')}

REF-SKLEARN-TEXT-GRID-SEARCH, REF-SKLEARN-CV`,
      ),
      loc('Pipeline 在每折内部学习词表；测试集不参与选 C。', 'The Pipeline learns vocabulary within each fold; test does not select C.'),
      loc('选择“Pipeline”场景，指出哪些步骤会 fit，哪些只会 transform 或 predict。', 'Select Pipeline and identify which steps fit and which only transform or predict.'),
    ),
    chapter(
      'scores-thresholds', 'modules.classificationProject.sections.scoresThresholds.title',
      loc(
        `### 本节问题：分数固定后，怎样选择一次决策规则？
用 model.classes_ 找到 spam 对应的概率列，再调用 predict_proba。不要把“第二列一定是正类”写成默认假设。预测标签用 np.where 保持为 spam/ham，与真实标签类型一致。

只在 validation 比较 0.10—0.90、间隔 0.05 的预定网格，最小化 5 × FP + FN；平局时依次选择较少 FP、较高阈值。参考阈值为 ${reference.validation.threshold}：
${metricsTable('validation', 'zh-CN')}

降低阈值会扩大预测正类范围，通常提高 recall，也可能增加误拦。这里不重新训练参数，不用 test 重选阈值。下一步锁定当前模型和阈值，再做最终汇总。
${code('threshold', 'zh-CN')}

REF-GOOGLE-MLCC-CLASSIFICATION、REF-SKLEARN-CLASSIFICATION-METRICS`,
        `### Question: how do fixed scores become one chosen decision rule?
Find spam in model.classes_ before selecting its predict_proba column; do not assume the second column is always positive. Use np.where to keep predicted spam/ham labels consistent with the true label type.

On validation only, search the predeclared 0.10–0.90 grid in steps of 0.05, minimizing 5 × FP + FN. Break ties by fewer FP, then higher threshold. The reference threshold is ${reference.validation.threshold}:
${metricsTable('validation', 'en')}

Lowering the threshold expands predicted positives, usually raising recall while possibly adding false blocks. Parameters are not retrained and test cannot reselect the threshold. Next, lock this model and threshold for the final summary.
${code('threshold', 'en')}

REF-GOOGLE-MLCC-CLASSIFICATION, REF-SKLEARN-CLASSIFICATION-METRICS`,
      ),
      loc('阈值选择只看 validation；选择完成后再读 test。', 'Select the threshold on validation; read test only after selection ends.'),
      loc('选择“score”场景，区分模型分数、阈值和字符串预测标签。', 'Select Score and distinguish model scores, the threshold and string predictions.'),
    ),
    chapter(
      'metrics-tradeoffs', 'modules.classificationProject.sections.metricsTradeoffs.title',
      loc(
        `### 本节问题：最终报告能支持什么结论？
锁定 C=${reference.selectedC}、阈值 ${reference.validation.threshold} 后，只对 ${reference.counts.test} 条 test 做一次最终汇总，不再 fit 或挑阈值：
${metricsTable('lockedTest', 'zh-CN')}

在这份固定样本上，precision=1 只说明当前没有误拦；recall=${reference.lockedTest.recall.toFixed(4)} 说明仍漏掉 ${reference.lockedTest.confusion.FN} 条 spam。高 accuracy 或 ROC/AUC 都不能消除这个代价。不要把零 FP 推广为未来永远不会误拦。

可以用 classification_report 查看多类汇总，但先核对正类、标签类型和分母。指标公式回看 [分类指标](/learn/classification/precisionRecall)，本课集中解释项目结果。
${code('evaluate', 'zh-CN')}

下一步复盘 validation 的错误样本，保持当前 test 汇总固定。

REF-SKLEARN-CLASSIFICATION-METRICS`,
        `### Question: what does the final report support?
After locking C=${reference.selectedC} and threshold ${reference.validation.threshold}, summarize the ${reference.counts.test} test rows once, with no further fit or threshold selection:
${metricsTable('lockedTest', 'en')}

Precision=1 means there are no false blocks in this fixed sample. Recall=${reference.lockedTest.recall.toFixed(4)} still means ${reference.lockedTest.confusion.FN} missed spam messages. High accuracy or ROC/AUC does not remove that cost, and zero observed FP does not promise zero future false blocks.

classification_report can provide a multiclass summary, but first check the positive class, label types and denominators. Revisit [classification metrics](/learn/classification/precisionRecall) for formulas; this lesson focuses on interpreting project results.
${code('evaluate', 'en')}

Next, inspect validation errors while keeping this test summary fixed.

REF-SKLEARN-CLASSIFICATION-METRICS`,
      ),
      loc('固定测试结果是本次协议的报告，不是继续调参的排行榜。', 'The fixed test result reports this protocol; it is not a leaderboard for further tuning.'),
      loc('选择“指标”场景，用 TP、FN 解释为什么高 precision 仍可能漏掉 spam。', 'Select Metrics and use TP and FN to explain why high precision can still miss spam.'),
    ),
    chapter(
      'error-review', 'modules.classificationProject.sections.errorReview.title',
      loc(
        `### 本节问题：哪些观察能变成下一轮假设？
只从 validation 取错误样本：

| 编号 | 错误类型 | spam 概率 |
| --- | --- | ---: |
${reference.validationErrorExamples.map(row => `| ${row.sms_id} | ${row.kind} | ${row.score.toFixed(4)} |`).join('\n')}

用 Notebook 的 df.loc[编号] 查看原文。4730 被标为 ham，却含有 FREE SMS 等词，值得检查这些词的权重是否影响误拦。69 看起来像笑话，4145 像问答；仅靠常见营销词可能无法覆盖语料中的 spam。这些是待验证的解释，不能直接当作因果结论。

下一轮可以预先比较特征或模型，但必须重新说明评估边界。当前 test 已经看过，不能用它挑新阈值后再宣称是一次独立最终评估。公开 Notebook 的确定性重运行是在复现同一参考结果，不是在挑最好的一次。
${code('review', 'zh-CN')}

下一步可回到 [分类指标实验](/learn/classification/scores) 对照阈值与成本，或在 [项目案例目录](/projects) 选择其他参考案例。

REF-SKLEARN-TEXT-GRID-SEARCH、REF-SKLEARN-CLASSIFICATION-METRICS、REF-SKLEARN-CV`,
        `### Question: which observations can become hypotheses for a future experiment?
Inspect validation errors only:

| ID | Error | Spam probability |
| --- | --- | ---: |
${reference.validationErrorExamples.map(row => `| ${row.sms_id} | ${row.kind} | ${row.score.toFixed(4)} |`).join('\n')}

Use df.loc[ID] in the Notebook to read the source text. Message 4730 is labeled ham but contains FREE SMS; checking those token weights may help explain the false block. Message 69 resembles a joke and 4145 a question, so common marketing tokens may miss some labeled spam. These are hypotheses to investigate, not causal conclusions.

A future experiment can predeclare feature or model comparisons, with a new evaluation boundary. This test has already been observed; using it to select a new threshold would not be an independent final evaluation. Deterministically rerunning the public Notebook reproduces the same reference; it does not select the best run.
${code('review', 'en')}

Next, revisit the [classification metrics lab](/learn/classification/scores) to compare threshold and cost, or choose another reference in the [project directory](/projects).

REF-SKLEARN-TEXT-GRID-SEARCH, REF-SKLEARN-CLASSIFICATION-METRICS, REF-SKLEARN-CV`,
      ),
      loc('用验证错误形成假设；保留当前测试报告的解释边界。', 'Use validation errors to form hypotheses while preserving the meaning of the current test report.'),
      loc('选择“复盘”场景，区分已观察到的错误与仍需实验验证的原因。', 'Select Review and distinguish observed errors from explanations that still need an experiment.'),
    ),
  ],
  controls: [],
  presets: [],
  sourceNote: loc(
    '统一资料入口：REF-SKLEARN-TEXT-FEATURES、REF-SKLEARN-TEXT-GRID-SEARCH、REF-SKLEARN-CLASSIFICATION-METRICS、REF-GOOGLE-MLCC-CLASSIFICATION。',
    'Centralized references: REF-SKLEARN-TEXT-FEATURES, REF-SKLEARN-TEXT-GRID-SEARCH, REF-SKLEARN-CLASSIFICATION-METRICS, REF-GOOGLE-MLCC-CLASSIFICATION.',
  ),
  createDefaultConfig: () => ({
    playbackMs: 900,
  }),
  simulate: simulateClassificationProject,
}
