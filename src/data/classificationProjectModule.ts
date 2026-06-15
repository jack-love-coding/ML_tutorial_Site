import type { AlgorithmModuleDefinition, LocalizedCopy, ModuleSimulation, StorySection } from '../types/ml'
import { algorithmCheckpointsBySlug } from './algorithmCheckpoints'

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
      'problem-and-costs',
      'modules.classificationProject.sections.problemAndCosts.title',
      loc(
        `分类项目的第一步不是选模型，而是先说清楚：正类是什么？错判的代价是什么？

这一章用垃圾邮件过滤做主线。每一行数据可以是一封邮件，特征来自邮件文本，标签是 \`spam\` 或 \`ham\`。模型最后输出一个分数或概率，再由阈值决定是否拦截。

### 先定义业务问题
- **输入**：邮件主题、正文、发件人等可在预测时获得的信息。
- **标签**：历史上人工或规则确认的 \`spam\` / \`ham\`。
- **正类**：这里把 \`spam\` 当作正类，因为拦截动作围绕它发生。
- **错误成本**：误拦正常邮件是假阳性，放过垃圾邮件是假阴性。两者都不好，但业务代价不同。

### baseline 要先出现
如果 12% 的邮件是 spam，一个永远预测 ham 的 dummy baseline 也有 88% accuracy。这个分数看起来高，却完全没有拦截能力。所以分类项目不能只看 accuracy。

### 如果换成疾病筛查
疾病筛查仍是二分类，但 false negative 往往更危险：漏掉真正需要复查的人，代价可能高于让健康人多做一次检查。这个区别会直接影响阈值选择。

### Ref ID
REF-GOOGLE-MLCC-CLASSIFICATION、REF-SKLEARN-CLASSIFICATION-METRICS`,
        `The first step in a classification project is not choosing a model. It is defining the positive class and the cost of mistakes.

This chapter uses spam filtering as the main project. Each row can be one email, features come from the message text, and the label is \`spam\` or \`ham\`. The model outputs a score or probability, and a threshold decides whether the message is blocked.

### Define the business problem first
- **Input**: subject, body, sender signals, and other information available at prediction time.
- **Label**: historical \`spam\` or \`ham\` labels from humans or rules.
- **Positive class**: here \`spam\` is positive because the blocking action revolves around it.
- **Error cost**: blocking a normal email is a false positive; letting spam through is a false negative. Both are bad, but their business costs differ.

### Baseline comes first
If 12% of messages are spam, a dummy baseline that always predicts ham still reaches 88% accuracy. That score looks high but blocks nothing. Classification projects cannot stop at accuracy.

### If the task is disease screening
Disease screening is also binary classification, but false negatives are often more dangerous: missing someone who needs follow-up can cost more than asking a healthy person to retest. This difference directly changes threshold choice.

### Ref ID
REF-GOOGLE-MLCC-CLASSIFICATION, REF-SKLEARN-CLASSIFICATION-METRICS`,
      ),
      loc(
        '先定义正类和错误成本。没有这一步，后面的 precision、recall 和阈值都没有业务含义。',
        'Define the positive class and error costs first. Without that, precision, recall, and thresholds have no business meaning.',
      ),
      loc(
        '看右侧项目流程，先指出正类、负类、假阳性和假阴性分别对应什么实际后果。',
        'Use the project flow on the right to identify the positive class, negative class, false positive, and false negative consequences.',
      ),
    ),
    chapter(
      'text-to-features',
      'modules.classificationProject.sections.textToFeatures.title',
      loc(
        `邮件文本不能直接交给线性模型。模型需要的是数值特征，所以第一座桥是把文本变成稀疏向量。

### Bag of Words 和 TF-IDF
\`CountVectorizer\` 会把文本拆成 token，再统计每个 token 出现次数。结果通常是 sparse matrix，因为每封邮件只会用到词表中的一小部分词。

\`TfidfVectorizer\` 进一步降低常见词的权重，让“免费领取”“验证账户”这类更有区分度的词更突出。

~~~python
from sklearn.feature_extraction.text import TfidfVectorizer

texts = [
    "win prize now",
    "meeting notes for tomorrow",
    "claim your free prize",
]

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)
vectorizer.get_feature_names_out()
X.shape
~~~

### 老师会先问
词表是从哪里学到的？如果你在全体数据上先 \`fit\` 词表，再切分 train/test，测试集里的词分布已经泄漏进训练流程。

### Ref ID
REF-SKLEARN-TEXT-FEATURES、REF-SKLEARN-TEXT-GRID-SEARCH`,
        `Raw email text cannot go directly into a linear model. The model needs numeric features, so the first bridge turns text into sparse vectors.

### Bag of Words and TF-IDF
\`CountVectorizer\` splits text into tokens and counts token occurrences. The result is usually a sparse matrix because each email uses only a small part of the vocabulary.

\`TfidfVectorizer\` further reduces the weight of common words so more discriminative terms such as "free prize" or "verify account" stand out.

~~~python
from sklearn.feature_extraction.text import TfidfVectorizer

texts = [
    "win prize now",
    "meeting notes for tomorrow",
    "claim your free prize",
]

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)
vectorizer.get_feature_names_out()
X.shape
~~~

### Teacher question
Where was the vocabulary learned? If you \`fit\` the vocabulary on all data before train/test split, test-set word distribution has already leaked into training.

### Ref ID
REF-SKLEARN-TEXT-FEATURES, REF-SKLEARN-TEXT-GRID-SEARCH`,
      ),
      loc(
        '文本向量化也是训练流程的一部分。词表、IDF 权重和缩放规则一样，只能从训练集学习。',
        'Text vectorization is part of training. Vocabulary and IDF weights, like scaling rules, should be learned from training data only.',
      ),
      loc(
        '在右侧向量化阶段，说明 token、词表、sparse vector 和特征矩阵 shape 分别是什么。',
        'Use the vectorization stage to explain token, vocabulary, sparse vector, and feature-matrix shape.',
      ),
    ),
    chapter(
      'pipeline-baseline',
      'modules.classificationProject.sections.pipelineBaseline.title',
      loc(
        `现在把向量化、分类器和评估绑进一个 Pipeline。重点不是模型多强，而是流程干净。

### 一个最小 spam baseline
~~~python
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

X = df["message"]
y = df["label"]  # spam or ham

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = Pipeline([
    ("tfidf", TfidfVectorizer(min_df=2, ngram_range=(1, 2))),
    ("classifier", LogisticRegression(max_iter=1000)),
])

model.fit(X_train, y_train)
pred = model.predict(X_test)
print(classification_report(y_test, pred))
~~~

### 为什么要 stratify
如果 spam 本来就少，随机切分可能让测试集里正类比例偏离整体数据。使用 \`stratify=y\` 可以让 train/test 保持更接近的类别比例。

### Pipeline 的意义
\`Pipeline\` 会在交叉验证或未来调参时，把 \`TfidfVectorizer.fit\` 限制在训练折里。它不是写法偏好，而是在防泄漏。

### Ref ID
REF-SKLEARN-TEXT-GRID-SEARCH、REF-SKLEARN-COMMON-PITFALLS、REF-SKLEARN-CLASSIFICATION-METRICS`,
        `Now bind vectorization, classifier, and evaluation into one Pipeline. The focus is not model strength yet; it is a clean workflow.

### A minimal spam baseline
~~~python
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

X = df["message"]
y = df["label"]  # spam or ham

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = Pipeline([
    ("tfidf", TfidfVectorizer(min_df=2, ngram_range=(1, 2))),
    ("classifier", LogisticRegression(max_iter=1000)),
])

model.fit(X_train, y_train)
pred = model.predict(X_test)
print(classification_report(y_test, pred))
~~~

### Why stratify
If spam is rare, a random split may give the test set a class rate unlike the full dataset. \`stratify=y\` keeps train/test class proportions closer.

### Why Pipeline matters
\`Pipeline\` keeps \`TfidfVectorizer.fit\` inside the training fold during cross-validation or later tuning. It is not style; it prevents leakage.

### Ref ID
REF-SKLEARN-TEXT-GRID-SEARCH, REF-SKLEARN-COMMON-PITFALLS, REF-SKLEARN-CLASSIFICATION-METRICS`,
      ),
      loc(
        '一个好 baseline 要同时做到简单、可复现和不泄漏。',
        'A good baseline should be simple, reproducible, and leakage-free.',
      ),
      loc(
        '在右侧 pipeline 阶段，指出哪一步学习词表，哪一步学习分类权重，哪一步只读测试集。',
        'Use the pipeline stage to identify which step learns vocabulary, which learns classifier weights, and which only reads the test set.',
      ),
    ),
    chapter(
      'scores-thresholds',
      'modules.classificationProject.sections.scoresThresholds.title',
      loc(
        `分类器不一定只输出 \`spam\` 或 \`ham\`。更有用的是先输出正类概率，再用阈值做决策。

### 分数没有变，决策会变
~~~python
proba = model.predict_proba(X_test)[:, 1]

threshold = 0.50
pred_050 = (proba >= threshold).astype(int)

threshold = 0.30
pred_030 = (proba >= threshold).astype(int)
~~~

同一批 \`proba\`，阈值从 0.50 降到 0.30，会拦截更多邮件。这样 recall 通常会上升，因为更多 spam 被抓住；precision 可能下降，因为更多正常邮件也被误拦。

### 和垃圾邮件业务连接
如果用户很讨厌漏掉 spam，可以降低阈值；如果误拦正常邮件代价很高，就要提高阈值。阈值不是数学常数，而是业务决策。

### 老师会先问
你是在训练模型，还是在改变决策规则？如果模型分数没变，只是阈值变了，那么参数并没有重新学习，变的是正类判定范围。

### Ref ID
REF-GOOGLE-MLCC-CLASSIFICATION、REF-SKLEARN-CLASSIFICATION-METRICS`,
        `A classifier does not have to output only \`spam\` or \`ham\`. It is more useful to output positive-class probability first, then make decisions with a threshold.

### Scores stay fixed while decisions change
~~~python
proba = model.predict_proba(X_test)[:, 1]

threshold = 0.50
pred_050 = (proba >= threshold).astype(int)

threshold = 0.30
pred_030 = (proba >= threshold).astype(int)
~~~

With the same \`proba\`, lowering the threshold from 0.50 to 0.30 blocks more messages. Recall usually rises because more spam is caught; precision may fall because more normal mail is blocked too.

### Connection to spam filtering
If users hate missed spam, lower the threshold. If blocking normal mail is very costly, raise the threshold. The threshold is not a mathematical constant; it is a business decision.

### Teacher question
Are you training the model or changing the decision rule? If model scores stay fixed and only the threshold changes, parameters did not relearn. The predicted-positive region changed.

### Ref ID
REF-GOOGLE-MLCC-CLASSIFICATION, REF-SKLEARN-CLASSIFICATION-METRICS`,
      ),
      loc(
        '阈值移动的是决策，不是模型分数。把这件事分清，precision/recall 才会变得清楚。',
        'Thresholds move decisions, not model scores. Once that is clear, precision and recall make sense.',
      ),
      loc(
        '在右侧阈值阶段，把阈值下调，预测正例数量、假阳性和假阴性会怎样变化？',
        'Use the threshold stage to reason about what happens to predicted positives, false positives, and false negatives when the threshold drops.',
      ),
    ),
    chapter(
      'metrics-tradeoffs',
      'modules.classificationProject.sections.metricsTradeoffs.title',
      loc(
        `分类评估要把混淆矩阵、precision、recall、F1、ROC/AUC 和错误成本放在一起看。

### 常用指标怎么接到样本
~~~python
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, roc_auc_score

cm = confusion_matrix(y_test, pred_050, labels=["spam", "ham"])
precision = precision_score(y_test, pred_050, pos_label="spam")
recall = recall_score(y_test, pred_050, pos_label="spam")
f1 = f1_score(y_test, pred_050, pos_label="spam")
auc = roc_auc_score((y_test == "spam").astype(int), proba)
~~~

### 指标各自回答的问题
- **precision**：被模型拦截的邮件里，有多少真的是 spam？
- **recall**：所有 spam 里，模型抓住了多少？
- **F1**：在 precision 和 recall 之间做一个平衡摘要。
- **AUC**：不固定某个阈值时，模型排序正负样本的能力如何？

### 成本比 accuracy 更诚实
疾病筛查里，漏掉阳性可能比误报更贵；垃圾邮件里，误拦重要邮件可能比漏掉普通广告更贵。不要问“哪个指标永远最好”，要问“这个任务最怕哪类错”。

### Ref ID
REF-SKLEARN-CLASSIFICATION-METRICS、REF-GOOGLE-MLCC-CLASSIFICATION`,
        `Classification evaluation should connect the confusion matrix, precision, recall, F1, ROC/AUC, and error costs.

### Metrics connected to examples
~~~python
from sklearn.metrics import confusion_matrix, precision_score, recall_score, f1_score, roc_auc_score

cm = confusion_matrix(y_test, pred_050, labels=["spam", "ham"])
precision = precision_score(y_test, pred_050, pos_label="spam")
recall = recall_score(y_test, pred_050, pos_label="spam")
f1 = f1_score(y_test, pred_050, pos_label="spam")
auc = roc_auc_score((y_test == "spam").astype(int), proba)
~~~

### What each metric asks
- **precision**: among blocked emails, how many were truly spam?
- **recall**: among all spam emails, how many did the model catch?
- **F1**: a balanced summary between precision and recall.
- **AUC**: without fixing one threshold, how well does the model rank positive above negative examples?

### Cost is more honest than accuracy
In disease screening, missing a positive case can be more expensive than a false alarm; in spam filtering, blocking an important normal email can be worse than letting a harmless ad through. Do not ask which metric is always best. Ask which mistake the task fears most.

### Ref ID
REF-SKLEARN-CLASSIFICATION-METRICS, REF-GOOGLE-MLCC-CLASSIFICATION`,
      ),
      loc(
        '指标不是排行榜，而是不同错误类型的放大镜。',
        'Metrics are not a leaderboard. They are lenses for different error types.',
      ),
      loc(
        '在右侧指标阶段，选择一个业务目标，并说明应该更重视 precision、recall 还是 AUC。',
        'Use the metrics stage to choose a business goal and explain whether precision, recall, or AUC deserves more weight.',
      ),
    ),
    chapter(
      'error-review',
      'modules.classificationProject.sections.errorReview.title',
      loc(
        `项目最后不能只贴一张 classification report。你需要把错误样本翻出来，写出下一轮实验。

### 复盘 false positives 和 false negatives
~~~python
review = pd.DataFrame({
    "message": X_test,
    "label": y_test,
    "score": proba,
    "pred": pred_050,
})

false_positive = review[(review["label"] == "ham") & (review["pred"] == "spam")]
false_negative = review[(review["label"] == "spam") & (review["pred"] == "ham")]
false_positive.sort_values("score", ascending=False).head()
false_negative.sort_values("score").head()
~~~

### 一个可执行的复盘
“当前 TF-IDF + LogisticRegression baseline 能抓住明显 spam，但会误拦包含促销、发票或链接的正常邮件。下一轮先检查 false positive 的高权重 token，再比较 0.35、0.50、0.70 三个阈值下的 precision/recall，并用交叉验证确认结果是否稳定。”

### 下一步路径
完成这一章后，回到站内 Classification 指标实验，专门拖动阈值，观察混淆矩阵、precision、recall 和成本如何一起变化。项目复盘和指标实验应该互相解释。

### Ref ID
REF-SKLEARN-TEXT-GRID-SEARCH、REF-SKLEARN-CLASSIFICATION-METRICS、REF-SKLEARN-CV`,
        `The project should not end with a pasted classification report. Inspect error examples and write the next experiment.

### Review false positives and false negatives
~~~python
review = pd.DataFrame({
    "message": X_test,
    "label": y_test,
    "score": proba,
    "pred": pred_050,
})

false_positive = review[(review["label"] == "ham") & (review["pred"] == "spam")]
false_negative = review[(review["label"] == "spam") & (review["pred"] == "ham")]
false_positive.sort_values("score", ascending=False).head()
false_negative.sort_values("score").head()
~~~

### An actionable review
"The current TF-IDF + LogisticRegression baseline catches obvious spam, but it blocks some normal messages containing promotion, invoice, or link terms. Next, inspect high-weight tokens in false positives, compare thresholds 0.35, 0.50, and 0.70, and use cross-validation to check whether the result is stable."

### Next path
After this chapter, return to the site's Classification metrics lab. Drag the threshold and watch the confusion matrix, precision, recall, and cost move together. The project review and metrics lab should explain each other.

### Ref ID
REF-SKLEARN-TEXT-GRID-SEARCH, REF-SKLEARN-CLASSIFICATION-METRICS, REF-SKLEARN-CV`,
      ),
      loc(
        '分类项目复盘要能说清是哪类错最多、为什么错、下一轮先改哪一个变量。',
        'A classification review should name which errors dominate, why they happen, and which single variable to change next.',
      ),
      loc(
        '在右侧复盘阶段，把错误样本分成 false positive 和 false negative，再写一句下一轮实验计划。',
        'Use the review stage to separate false positives from false negatives, then write one sentence for the next experiment.',
      ),
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
