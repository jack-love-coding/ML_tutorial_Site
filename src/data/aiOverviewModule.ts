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

function simulateAiOverview(): ModuleSimulation {
  return {
    snapshots: [
      {
        step: 0,
        loss: 0,
        accuracy: 0,
        derivedMetrics: {
          moduleType: 'orientation',
          referenceIds: [
            'REF-GOOGLE-MLCC',
            'REF-INRIA-SKLEARN-MOOC',
            'REF-D2L',
            'REF-SKLEARN-USER-GUIDE',
            'REF-HF-LLM-COURSE',
            'REF-HF-RAG-MILVUS',
          ],
        },
      },
    ],
  }
}

export const aiOverviewModule: AlgorithmModuleDefinition = {
  slug: 'ai-overview',
  route: '/learn/ai-overview',
  titleKey: 'modules.aiOverview.title',
  kickerKey: 'modules.aiOverview.kicker',
  introKey: 'modules.aiOverview.intro',
  summaryKey: 'modules.aiOverview.summary',
  theme: '#ecf7f2',
  accent: '#0f9f8f',
  checkpoints: algorithmCheckpointsBySlug['ai-overview'],
  chapters: [
    chapter(
      'what-is-ml',
      'modules.aiOverview.sections.whatisml.title',
      loc(
        `先别急着问“AI 到底聪不聪明”。老师会先问三个更朴素的问题：这件事的输入是什么？我们希望它输出什么？它做错以后，谁告诉它错在哪里？

### 从写规则到学规则
想象你要写一个垃圾邮件过滤器。传统程序会让你手写规则：标题里有“中奖”就拦截，链接太多就拦截，发件人可疑也拦截。问题是，坏邮件会变，规则很快就补不完。

机器学习换了一种做法：把很多历史邮件和对应标签交给模型，让它自己从样本里找规律。模型先猜，猜错了就根据 loss 或 metric 调整参数；猜得越来越稳，才算学到了一点东西。

一个最小的 ML 问题，先看四件事：

- **输入**：样本的特征，例如房屋面积、邮件文本、图片像素、用户行为。
- **目标**：希望模型预测或发现的东西，例如房价、是否垃圾邮件、用户分组。
- **模型**：带参数的函数，例如线性回归、决策树、神经网络。
- **反馈**：loss、metric 或错误样本，告诉模型目前哪里不够好。

### 想一想
如果一个学生只背下了练习册答案，换一套题就不会做，你会说他学会了吗？模型也是一样。模型不是背答案。它真正要学的是能迁移到新样本上的模式，这叫泛化。

### 你现在要抓住的句子
机器学习就是：用数据调整模型参数，让模型在没见过的新样本上也能做出有用预测，或者发现有用结构。

### Ref ID
REF-GOOGLE-MLCC、REF-INRIA-SKLEARN-MOOC、REF-SKLEARN-USER-GUIDE`,
        `Do not start by asking whether AI is intelligent. A good teacher asks simpler questions first: what is the input, what should come out, and what feedback tells the system it was wrong?

### From writing rules to learning rules
Imagine building a spam filter. A traditional program asks you to write rules: block messages with prize claims, too many links, or suspicious senders. But spam changes quickly, and hand-written rules become brittle.

Machine learning changes the workflow. You provide many historical examples and labels. The model guesses, receives feedback through a loss or metric, and adjusts parameters until its guesses become more useful.

A minimal ML problem has four parts:

- **Input**: features such as house size, email text, image pixels, or user behavior.
- **Target**: what the model should predict or discover, such as price, spam status, or user groups.
- **Model**: a parameterized function, such as linear regression, a decision tree, or a neural network.
- **Feedback**: a loss, metric, or error cases that show where the model is still weak.

### Think about it
If a student only memorizes workbook answers and fails on a new worksheet, we do not say the student has learned. A model is similar. It should not memorize answers; it should learn patterns that transfer to new examples. That is generalization.

### The sentence to keep
Machine learning uses data to tune model parameters so the model can make useful predictions or discover useful structure on examples it has not seen before.

### Ref ID
REF-GOOGLE-MLCC, REF-INRIA-SKLEARN-MOOC, REF-SKLEARN-USER-GUIDE`,
      ),
      loc(
        '先把 ML 看成“输入、模型、反馈、泛化”的闭环。算法名字可以晚一点再背。',
        'Read ML first as a loop of input, model, feedback, and generalization. Algorithm names can come later.',
      ),
      loc(
        '在右侧任务卡中选一个场景，先说出输入、目标和反馈，再判断它是不是机器学习问题。',
        'Pick a task card on the right. Name the input, target, and feedback before deciding whether it is an ML problem.',
      ),
    ),
    chapter(
      'learning-types',
      'modules.aiOverview.sections.learningtypes.title',
      loc(
        `很多初学者会把监督学习、无监督学习、深度学习、生成式 AI 混在一起。别急，我们换一个老师上课时会用的问法：训练时，答案有没有提前给模型看？

### 监督学习：有答案的练习题
监督学习有输入，也有标签。模型学的是从 $x$ 到 $y$ 的映射。

- 房屋特征 -> 成交价格，是回归，因为标签是连续数值。
- 邮件文本 -> 垃圾邮件或正常邮件，是分类，因为标签是类别。
- 病人指标 -> 是否需要复查，也是分类，因为目标是一个决策。

老师会先问：你手里有没有标准答案？如果有，再问答案是数值还是类别。

### 无监督学习：没有标准答案，先找结构
无监督学习只有输入，没有人工给出的标准答案。模型要做的不是“猜对标签”，而是在数据里找结构。

- 聚类：把相似用户放在同一组。
- 降维：把高维数据压到二维或三维，方便观察。
- 异常检测：找出不像其他样本的点。

### 深度学习：不是任务类型，而是模型方法
深度学习不是和监督学习并列的一种任务。它是一类模型方法，用多层参数把输入逐步改写成更有用的表示。它可以用于监督学习，也可以用于无监督学习和生成式 AI。

### 生成式 AI：输出变成了新内容
生成式 AI 学习数据分布，然后生成新的文本、图片、代码或音频。它仍然离不开数据、模型、loss、训练和评估，只是输出从“一个标签”变成了“新的内容”。

### 想一想
预测房价会输出一个数字，但它不一定是生成式 AI。判断任务类型时，不要只看“有没有输出”，要看输出是不是开放内容、训练目标是什么、反馈如何定义。

### Ref ID
REF-GOOGLE-MLCC、REF-INRIA-SKLEARN-MOOC、REF-D2L`,
        `Beginners often mix supervised learning, unsupervised learning, deep learning, and generative AI. Use the teacher's first question: during training, does the model see answers?

### Supervised learning: practice with answers
Supervised learning has inputs and labels. The model learns a mapping from $x$ to $y$.

- House features -> sale price is regression because the label is continuous.
- Email text -> spam or not spam is classification because the label is a class.
- Patient measurements -> review needed or not is also classification because the target is a decision.

Ask first whether you have answer keys. If yes, ask whether the answer is a number or a class.

### Unsupervised learning: no answer key, find structure
Unsupervised learning has inputs but no human-provided labels. The model looks for structure rather than guessing a known answer.

- Clustering groups similar users.
- Dimensionality reduction compresses high-dimensional data into two or three dimensions.
- Anomaly detection finds examples unlike the rest.

### Deep learning: a model method, not a task type
Deep learning is not a task category parallel to supervised learning. It is a family of model methods that rewrite inputs through multiple layers into useful representations. It can be used for supervised, unsupervised, and generative tasks.

### Generative AI: the output becomes new content
Generative AI learns data distributions and creates new text, images, code, or audio. It still depends on data, models, loss, training, and evaluation; the output becomes new content rather than a single label.

### Think about it
House-price prediction outputs a number, but that does not make it generative AI. Do not classify a task by whether it has an output. Ask whether the output is open-ended content, what the training target is, and how feedback is defined.

### Ref ID
REF-GOOGLE-MLCC, REF-INRIA-SKLEARN-MOOC, REF-D2L`,
      ),
      loc(
        '先按“有没有标签”分清监督/无监督，再把深度学习和生成式 AI 放到模型能力与应用形态这一层。',
        'Separate supervised and unsupervised by labels first, then place deep learning and generative AI at the model-capability and application layer.',
      ),
      loc(
        '用右侧场景卡比较回归、分类、聚类和 RAG 问答：每个任务的答案从哪里来？反馈又是什么？',
        'Use the scenario cards to compare regression, classification, clustering, and RAG QA: where does the answer come from, and what is the feedback?',
      ),
    ),
    chapter(
      'deep-learning',
      'modules.aiOverview.sections.deeplearning.title',
      loc(
        `深度学习的关键，不是“层数多所以聪明”。更准确地说，它让模型自己学习中间表示。

### 人造特征和模型自学特征
如果我们用传统方法识别图片里的猫，可能要手工设计很多特征：耳朵形状、眼睛位置、纹理、轮廓。深度网络则把这件事交给多层参数去学：

- 低层可能学边缘、颜色和纹理。
- 中层可能组合出局部形状。
- 高层可能更接近“猫脸”“车轮”“句子语义”这样的任务线索。

老师会先问：这个模型有没有机会把原始输入改写成更适合任务的表示？如果有，你就已经碰到深度学习最核心的思想了。

### 为什么数据、算力和诊断都变重要
更大的模型能表达更复杂的关系，也更容易学偏。它可能真的学到了规律，也可能只是记住了训练集里的噪声。因此深度学习通常离不开：

- 足够多、足够干净的数据
- 合适的 loss 和评价指标
- 优化器、学习率和 batch 设置
- 正则化、验证集和早停
- 错误样本分析，而不是只看一个总分

### 和本站后续内容的关系
MLP 是第一座桥。它让你看到隐藏层如何把原始空间重写成更容易分类或回归的表示。之后的 CNN、Attention 和 Transformer，都是在更复杂的输入上做类似的表示学习。

### 想一想
模型更大，不等于一定更懂。你需要问：验证集有没有变好？错误样本集中在哪？换一批新数据还能不能工作？

### Ref ID
REF-D2L、REF-D2L-CNN、REF-D2L-ATTENTION`,
        `The key idea in deep learning is not "more layers means smarter." More precisely, deep models learn intermediate representations.

### Human-made features and learned features
If we use a traditional method to recognize cats in images, we might hand-design features: ear shapes, eye positions, textures, and outlines. A deep network lets multiple parameterized layers learn these transformations:

- Lower layers may learn edges, colors, and textures.
- Middle layers may combine local shapes.
- Higher layers may approach cues such as cat faces, wheels, or sentence meaning.

Ask whether the model can rewrite raw input into a representation that better serves the task. If yes, you are looking at the central idea of deep learning.

### Why data, compute, and diagnostics matter
Larger models can express richer relationships, but they can also learn the wrong thing. They may learn a useful pattern, or they may memorize noise in the training set. Deep learning therefore usually needs:

- enough clean data
- a suitable loss and evaluation metric
- optimizer, learning rate, and batch choices
- regularization, validation, and early stopping
- error-case analysis, not only one aggregate score

### Connection to this site
MLP is the first bridge. It shows how hidden layers rewrite the raw input space into a representation that is easier to classify or regress on. CNN, Attention, and Transformers do similar representation learning on more complex inputs.

### Think about it
A bigger model is not automatically a better model. Ask whether validation improved, where the errors concentrate, and whether the model still works on new data.

### Ref ID
REF-D2L, REF-D2L-CNN, REF-D2L-ATTENTION`,
      ),
      loc(
        '深度学习是表示学习：模型把原始输入一步步改写成更适合任务的中间语言。',
        'Deep learning is representation learning: the model rewrites raw input into task-useful intermediate language.',
      ),
      loc(
        '观察右侧层级图，把 MLP、CNN、Attention、Transformer 看成同一件事的不同版本：学习表示。',
        'Use the layered visual to read MLP, CNN, Attention, and Transformers as different versions of representation learning.',
      ),
    ),
    chapter(
      'generative-ai',
      'modules.aiOverview.sections.generativeai.title',
      loc(
        `生成式 AI 容易让人误会，因为它的输出太像“作品”了：一段话、一张图、一段代码。可从训练角度看，它仍然是机器学习。

### LLM 到底在学什么
先拿大语言模型做例子。它把文本切成 token，把 token 转成向量，然后学习在上下文里预测下一个合理 token。预测错了，loss 变大；反复训练后，它就能生成看起来连贯的回答。

这不是说模型像人一样理解了世界。更稳妥的说法是：它学到了大量语言和知识片段之间的统计关系，并能在提示词约束下继续生成。

### token、embedding、RAG 先分清
初学者先抓住三个词：

1. **token**：模型读写文本的基本单位，不一定等于一个汉字或一个单词。
2. **embedding**：把文本变成向量，方便比较“语义上像不像”。
3. **RAG**：回答前先检索外部资料，把相关片段放进上下文，再让模型基于资料回答。

### 为什么 RAG 很适合学习网站
如果学生问“交叉熵为什么惩罚过度自信”，模型最好先查到本站对应章节、公式解释和例子，再组织回答。这样答案更容易回到课程证据，而不是凭空编一个听起来顺的解释。

### 想一想
RAG 不是重新训练模型，也不是让模型永久记住新知识。它更像开卷考试：资料摆在旁边，模型根据资料答题。开卷也可能答错，所以仍然要看引用是否覆盖、事实是否一致、答案是否解决问题。

### Ref ID
REF-HF-LLM-COURSE、REF-HF-COOKBOOK、REF-HF-RAG-MILVUS、REF-HF-RAG-ZEPHYR、REF-MS-GENAI-BEGINNERS`,
        `Generative AI is easy to misunderstand because its outputs look like finished work: text, images, or code. From the training perspective, it is still machine learning.

### What an LLM learns
Take a large language model as the example. It splits text into tokens, turns tokens into vectors, and learns to predict a reasonable next token from context. Wrong predictions increase the loss; repeated training makes generated answers more coherent.

This does not mean the model understands the world the way a person does. A safer statement is that it learns many statistical relationships among language patterns and knowledge fragments, then continues generation under a prompt.

### Separate token, embedding, and RAG
Beginners should first separate three terms:

1. **Token**: the basic unit a model reads and writes. It is not always one character or one word.
2. **Embedding**: a vector representation that lets us compare semantic similarity.
3. **RAG**: retrieve external material first, place relevant chunks into context, then ask the model to answer from that material.

### Why RAG fits a learning site
If a student asks why cross-entropy punishes overconfidence, the model should first retrieve the site's chapter, formula explanation, and examples, then answer from that evidence. This makes the answer more grounded than a fluent guess.

### Think about it
RAG does not retrain the model or make it permanently remember new knowledge. It is closer to an open-book exam: the material is available, and the model answers from it. Open-book answers can still be wrong, so citation coverage, factual consistency, and usefulness still need evaluation.

### Ref ID
REF-HF-LLM-COURSE, REF-HF-COOKBOOK, REF-HF-RAG-MILVUS, REF-HF-RAG-ZEPHYR, REF-MS-GENAI-BEGINNERS`,
      ),
      loc(
        '生成式 AI 仍然遵循数据、表示、loss、训练和评估；RAG 只是把外部资料放进回答现场。',
        'Generative AI still follows data, representation, loss, training, and evaluation; RAG supplies external material at answer time.',
      ),
      loc(
        '在右侧 RAG 流程中区分 query、token、embedding、retrieval、context 和 answer。每一步都问：信息从哪里来？',
        'Use the RAG flow to separate query, token, embedding, retrieval, context, and answer. At each step, ask where the information comes from.',
      ),
    ),
    chapter(
      'training-flow',
      'modules.aiOverview.sections.trainingflow.title',
      loc(
        `完整训练流程可以先记成一条线：

**input -> model -> prediction -> loss/metric -> iteration**

这行看起来很短，但每一步都能问出一串严肃问题。

### 一次 ML 项目通常怎么走
1. **定义问题**：预测什么？为什么有用？哪些信息不能用，否则会泄漏答案？
2. **准备数据**：收集、清洗、编码，处理缺失值和异常值。
3. **划分数据**：分成 train/validation/test。先把考试卷封好，别训练到一半偷看答案。
4. **建立 baseline**：先用简单模型或 dummy 规则确认最低标准。
5. **训练模型**：用 loss 产生更新信号，让参数朝更好的方向移动。
6. **验证与调参**：在 validation 上比较模型、阈值和超参数。
7. **测试与复盘**：最后只用 test 做一次最终估计，并分析错误样本。
8. **迭代上线**：上线后继续监控数据漂移、指标变化和新失败案例。

### train/validation/test 为什么要分开
训练集用来学习参数；验证集用来做选择；测试集用来估计最后的泛化表现。三者混在一起，分数会越来越像“对这套评估方式的适应”，而不是对真实任务的能力。

老师会先问：你这次提升，是因为模型更懂任务了，还是因为你把评估规则摸熟了？

### 想一想
如果你反复在 test set 上调参，test set 就不再是期末考试，而变成了又一本练习册。最后的分数会好看，但它不再诚实。

### 记住这句话
训练流程不是“调用 fit 然后看分数”。它是一条可复查的证据链：问题、数据、模型、指标、错误、下一步。

### Ref ID
REF-GOOGLE-MLCC、REF-INRIA-SKLEARN-MOOC、REF-SKLEARN-COMMON-PITFALLS、REF-SKLEARN-CV`,
        `A complete training flow can first be remembered as one line:

**input -> model -> prediction -> loss/metric -> iteration**

The line is short, but every step raises serious questions.

### How an ML project usually moves
1. **Define the problem**: what to predict, why it matters, and what information is forbidden leakage.
2. **Prepare data**: collect, clean, encode, handle missing values and outliers.
3. **Split data**: train/validation/test. Seal the exam sheet before training starts.
4. **Build a baseline**: use a simple model or dummy rule to set the minimum standard.
5. **Train the model**: use loss to create update signals for parameters.
6. **Validate and tune**: compare models, thresholds, and hyperparameters on validation data.
7. **Test and review**: use test data once for the final estimate, then inspect error cases.
8. **Iterate and monitor**: watch data drift, metric changes, and new failure cases after deployment.

### Why train/validation/test must stay separate
The training set learns parameters; the validation set guides choices; the test set estimates final generalization. If you mix them, the score can become adaptation to the evaluation process rather than evidence of real task ability.

Ask whether the improvement came from a model that understands the task better or from repeated exposure to the evaluation rule.

### Think about it
If you tune repeatedly on the test set, it is no longer a final exam. It becomes another practice book. The score may look better, but it is no longer honest.

### The sentence to remember
Training is not "call fit and read a score." It is an auditable chain of evidence: problem, data, model, metric, errors, next step.

### Ref ID
REF-GOOGLE-MLCC, REF-INRIA-SKLEARN-MOOC, REF-SKLEARN-COMMON-PITFALLS, REF-SKLEARN-CV`,
      ),
      loc(
        '完整流程要能复述：问题、数据、划分、baseline、训练、验证、测试、复盘。每一步都要知道自己在防什么错误。',
        'You should be able to retell the full flow: problem, data, split, baseline, training, validation, testing, review. At each step, know what mistake you are preventing.',
      ),
      loc(
        '跟着右侧流水线，把 train/validation/test 放到正确阶段，并说明 test 为什么不能反复用来调参。',
        'Use the pipeline to place train/validation/test in the right stages, then explain why test data should not be used repeatedly for tuning.',
      ),
    ),
  ],
  controls: [],
  presets: [],
  sourceNote: loc(
    '统一资料入口：REF-GOOGLE-MLCC、REF-INRIA-SKLEARN-MOOC、REF-D2L、REF-SKLEARN-USER-GUIDE、REF-HF-LLM-COURSE、REF-HF-COOKBOOK、REF-HF-RAG-MILVUS。',
    'Centralized references: REF-GOOGLE-MLCC, REF-INRIA-SKLEARN-MOOC, REF-D2L, REF-SKLEARN-USER-GUIDE, REF-HF-LLM-COURSE, REF-HF-COOKBOOK, REF-HF-RAG-MILVUS.',
  ),
  createDefaultConfig: () => ({
    playbackMs: 900,
  }),
  simulate: simulateAiOverview,
}
