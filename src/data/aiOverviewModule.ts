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
        `机器学习不是“让电脑拥有智能”的魔法，而是让系统从数据中学习一条可复用的规则。

### 核心直觉
传统程序通常是人写规则：输入数据，程序按规则输出结果。机器学习反过来：我们给它很多样本和目标，让模型在训练中自己调参数，学到从输入到输出的映射。

一个最小机器学习问题包含四件事：

- **输入**：样本的特征，例如房屋面积、邮件文本、图片像素。
- **目标**：希望模型预测或发现的东西，例如价格、是否垃圾邮件、相似分组。
- **模型**：带参数的函数，例如线性回归、决策树、神经网络。
- **反馈**：loss 或 metric，告诉模型现在做得怎样。

### 一个句子版本
机器学习就是：用数据调整模型参数，让模型在没见过的新样本上也能做出有用预测或发现结构。

> **常见误区**  
> 不要把 ML 理解成背答案。模型训练真正追求的是泛化：在训练样本之外仍然有用。

### Ref ID
REF-GOOGLE-MLCC、REF-INRIA-SKLEARN-MOOC、REF-SKLEARN-USER-GUIDE`,
        `Machine learning is not magic intelligence. It is a way to learn reusable rules from data.

### Core intuition
In a traditional program, people write the rules: data goes in, rules run, results come out. In machine learning, we provide examples and goals, then let the model adjust parameters until it learns a mapping from inputs to outputs.

A minimal ML problem has four parts:

- **Input**: features such as house size, email text, or image pixels.
- **Target**: what the model should predict or discover, such as price, spam status, or similar groups.
- **Model**: a parameterized function, such as linear regression, a decision tree, or a neural network.
- **Feedback**: a loss or metric that says how the model is doing.

### One-sentence version
Machine learning uses data to tune model parameters so the model can make useful predictions or discover structure on new examples.

> **Common mistake**  
> Do not read ML as memorizing answers. Training aims for generalization: usefulness beyond the training examples.

### Ref ID
REF-GOOGLE-MLCC, REF-INRIA-SKLEARN-MOOC, REF-SKLEARN-USER-GUIDE`,
      ),
      loc('先把 ML 看成“数据、模型、反馈、泛化”的闭环，而不是某一种具体算法。', 'Read ML first as a loop of data, model, feedback, and generalization, not as one particular algorithm.'),
      loc('在右侧任务卡中选择一个场景，判断它的输入、输出和反馈信号。', 'Use the task cards on the right to identify input, output, and feedback signal.'),
    ),
    chapter(
      'learning-types',
      'modules.aiOverview.sections.learningtypes.title',
      loc(
        `机器学习任务的第一层分流，是看“训练时有没有明确答案”。

### 监督学习
监督学习有输入和标签。模型学的是从 $x$ 到 $y$ 的映射。

- 房屋特征 -> 房价，是回归。
- 邮件文本 -> 是否垃圾邮件，是分类。
- 病人指标 -> 是否需要复查，也是分类。

### 无监督学习
无监督学习只有输入，没有标准答案。模型主要寻找结构。

- 聚类：把相似用户分组。
- 降维：把高维数据压到可视化平面。
- 异常检测：找出不像其他样本的点。

### 深度学习
深度学习不是另一种任务类型，而是一类模型方法。它用多层参数把输入逐层改写成更有用的表示，特别适合图像、语音、文本和复杂非线性结构。

### 生成式 AI
生成式 AI 训练模型学习数据分布，然后生成新的文本、图片、代码或音频。它仍然离不开数据、模型、loss、训练和评估，只是输出从“一个标签”变成了“新的内容”。

> **常见误区**  
> 监督/无监督是在说任务和数据标注方式；深度学习和生成式 AI 更偏向模型能力和应用形态。它们不是同一层级的分类。

### Ref ID
REF-GOOGLE-MLCC、REF-INRIA-SKLEARN-MOOC、REF-D2L`,
        `The first split in ML is whether training examples include explicit answers.

### Supervised learning
Supervised learning has inputs and labels. The model learns a mapping from $x$ to $y$.

- House features -> price is regression.
- Email text -> spam or not is classification.
- Patient measurements -> review needed or not is classification.

### Unsupervised learning
Unsupervised learning has inputs but no answer key. The model looks for structure.

- Clustering groups similar users.
- Dimensionality reduction compresses high-dimensional data into a visual space.
- Anomaly detection finds examples unlike the rest.

### Deep learning
Deep learning is not a separate task type. It is a family of model methods that rewrite inputs through multiple parameterized layers into useful representations, especially for images, speech, text, and complex nonlinear structure.

### Generative AI
Generative AI trains models to learn data distributions and create new text, images, code, or audio. It still depends on data, models, loss, training, and evaluation; the output becomes new content rather than a single label.

> **Common mistake**  
> Supervised and unsupervised describe task/data labeling. Deep learning and generative AI describe model capability and application style. They are not the same level of category.

### Ref ID
REF-GOOGLE-MLCC, REF-INRIA-SKLEARN-MOOC, REF-D2L`,
      ),
      loc('先按任务和标签分清监督/无监督，再把深度学习和生成式 AI 放到模型能力层。', 'Separate supervised/unsupervised by task labels, then place deep learning and generative AI at the model-capability layer.'),
      loc('用右侧分拣器比较回归、分类、聚类和生成任务的输入、目标与指标。', 'Use the sorter to compare inputs, targets, and metrics for regression, classification, clustering, and generation.'),
    ),
    chapter(
      'deep-learning',
      'modules.aiOverview.sections.deeplearning.title',
      loc(
        `深度学习的核心不是“层数多所以聪明”，而是模型可以逐层学习表示。

### 从特征到表示
在线性模型里，输入特征通常由人提前设计好。深度网络会学习中间表示：

- 图片的低层可能学边缘和纹理。
- 中层可能组合成局部形状。
- 高层可能更接近物体、语义或任务相关线索。

### 为什么需要更多数据和算力
更深的模型有更多参数，可以表达更复杂关系，也更容易过拟合和更难训练。因此深度学习通常需要：

- 足够的数据
- 合适的 loss
- 优化器和学习率
- 正则化与验证集
- 可解释的训练诊断

### 和本站已有内容的关系
MLP 是第一座桥。它让你看到隐藏层如何把原始空间重写成更容易分类或回归的表示。后续 CNN、Attention 和 Transformer 都是在更复杂输入上做类似的表示学习。

> **常见误区**  
> 不要把“深度”理解成自动更好。模型能力越强，越需要验证集、正则化和错误分析来证明它真的学到了可泛化模式。

### Ref ID
REF-D2L`,
        `The core of deep learning is not “many layers means smart.” It is that the model can learn representations layer by layer.

### From features to representations
In linear models, people often design features ahead of time. Deep networks learn intermediate representations:

- Low image layers may learn edges and textures.
- Middle layers may combine local shapes.
- Higher layers may approach objects, semantics, or task-specific cues.

### Why it needs more data and compute
Deeper models have more parameters. They can express richer relationships, but they can also overfit and become harder to train. Deep learning usually needs:

- enough data
- a suitable loss
- optimizer and learning rate choices
- regularization and validation
- interpretable training diagnostics

### Connection to this site
MLP is the first bridge. It shows how hidden layers rewrite the raw input space into a representation that is easier to classify or regress on. CNN, Attention, and Transformers do similar representation learning on more complex inputs.

> **Common mistake**  
> Do not read “deep” as automatically better. Stronger models need validation, regularization, and error analysis to prove they learned generalizable patterns.

### Ref ID
REF-D2L`,
      ),
      loc('深度学习是表示学习：隐藏层把输入逐步改写成更适合任务的中间语言。', 'Deep learning is representation learning: hidden layers rewrite inputs into task-useful intermediate language.'),
      loc('观察右侧层级图，把 MLP、CNN、Attention、Transformer 放到同一条表示学习路径上。', 'Use the layered visual to place MLP, CNN, Attention, and Transformers on one representation-learning path.'),
    ),
    chapter(
      'generative-ai',
      'modules.aiOverview.sections.generativeai.title',
      loc(
        `生成式 AI 的目标不是只判断类别，而是生成新的内容。

### 它仍然是机器学习
LLM、图像生成模型和代码助手看起来很不一样，但训练框架仍然熟悉：

- 收集大规模数据
- 把输入转成 token、向量或其他数值表示
- 让模型预测下一个 token、去噪图像或补全内容
- 用 loss 衡量生成结果和目标之间的差距
- 反复更新参数

### 生成与检索增强
生成式模型可能会编造不可靠内容。RAG 的思路是：回答前先检索外部资料，把相关上下文交给模型，再要求它基于这些上下文作答。

### 初学者应该先懂什么
在深入 LLM 前，先理解三件事：

1. token 是模型读写文本的基本单位。
2. embedding 把文本变成可比较的向量。
3. 生成结果需要评估，不能只看是否“像人写的”。

> **常见误区**  
> RAG 不等于让模型重新训练或真正“学会”新知识；它是在回答时把外部上下文放进模型视野。

### Ref ID
REF-HF-LLM-COURSE、REF-HF-COOKBOOK、REF-MS-GENAI-BEGINNERS`,
        `Generative AI does not only judge categories; it creates new content.

### It is still machine learning
LLMs, image generators, and coding assistants look different, but the training frame is familiar:

- collect large-scale data
- turn inputs into tokens, vectors, or other numeric representations
- train the model to predict the next token, denoise an image, or complete content
- use loss to measure the gap between generated output and target
- update parameters repeatedly

### Generation and retrieval augmentation
Generative models may produce unreliable content. RAG first retrieves external material, gives relevant context to the model, and asks it to answer from that context.

### What beginners should understand first
Before diving into LLMs, understand three things:

1. Tokens are the basic units models read and write.
2. Embeddings turn text into comparable vectors.
3. Generated output needs evaluation, not only “sounds human” judgment.

> **Common mistake**  
> RAG does not retrain the model or make it truly learn new knowledge. It supplies external context at answer time.

### Ref ID
REF-HF-LLM-COURSE, REF-HF-COOKBOOK, REF-MS-GENAI-BEGINNERS`,
      ),
      loc('生成式 AI 仍然遵循数据、表示、loss、训练和评估，只是输出变成了新内容。', 'Generative AI still follows data, representation, loss, training, and evaluation; the output becomes new content.'),
      loc('在右侧 RAG 流程中区分 tokenization、embedding、retrieval、context 和 answer。', 'Use the RAG flow to separate tokenization, embedding, retrieval, context, and answer.'),
    ),
    chapter(
      'training-flow',
      'modules.aiOverview.sections.trainingflow.title',
      loc(
        `完整训练流程可以先记成一条线：

**input -> model -> prediction -> loss/metric -> iteration**

### 标准项目流程
更完整地看，一次 ML 项目通常包含：

1. 定义问题：预测什么，为什么有价值，不能用哪些泄漏信息。
2. 准备数据：收集、清洗、编码、处理缺失和异常。
3. 划分数据：train/validation/test，避免在测试集上调参。
4. 建立 baseline：先用简单模型或 dummy 规则确定最低标准。
5. 训练模型：用 loss 产生梯度或其他更新信号。
6. 验证与调参：在 validation 上比较模型、阈值和超参数。
7. 测试与复盘：最后只用 test 做一次最终估计，并分析错误样本。
8. 迭代上线：监控数据漂移、指标变化和新失败案例。

### 为什么要划分数据
训练集用来学习参数；验证集用来做选择；测试集用来估计最终泛化。把这三者混用，模型可能只是适应了你的评估方式，而不是真的学会了任务。

### 记住这一点
训练流程不是“调用 fit 然后看分数”。它是一条可复查的证据链：问题、数据、模型、指标、错误、下一步。

> **常见误区**  
> 不要在 test set 上反复调参。那会让测试集变成另一个训练反馈来源。

### Ref ID
REF-GOOGLE-MLCC、REF-INRIA-SKLEARN-MOOC、REF-SKLEARN-COMMON-PITFALLS`,
        `A complete training flow can first be remembered as one line:

**input -> model -> prediction -> loss/metric -> iteration**

### Standard project flow
More completely, an ML project usually includes:

1. Define the problem: what to predict, why it matters, and what information is forbidden leakage.
2. Prepare data: collect, clean, encode, handle missing values and outliers.
3. Split data: train/validation/test, avoiding tuning on the test set.
4. Build a baseline: use a simple model or dummy rule to set the minimum standard.
5. Train the model: use loss to create gradients or other update signals.
6. Validate and tune: compare models, thresholds, and hyperparameters on validation data.
7. Test and review: use test data once for a final estimate, then inspect error cases.
8. Iterate and monitor: watch data drift, metric changes, and new failure cases.

### Why data splits matter
The training set learns parameters; the validation set guides choices; the test set estimates final generalization. If you mix them, the model may adapt to your evaluation process rather than learn the task.

### Remember this
Training is not “call fit and read a score.” It is an auditable chain of evidence: problem, data, model, metric, errors, next step.

> **Common mistake**  
> Do not tune repeatedly on the test set. That turns the test set into another training feedback source.

### Ref ID
REF-GOOGLE-MLCC, REF-INRIA-SKLEARN-MOOC, REF-SKLEARN-COMMON-PITFALLS`,
      ),
      loc('完整流程要能复述：问题、数据、划分、baseline、训练、验证、测试、复盘。', 'You should be able to retell the full flow: problem, data, split, baseline, training, validation, testing, review.'),
      loc('跟着右侧流水线，把 train/validation/test 分别放到正确阶段。', 'Use the pipeline to place train/validation/test in the right stages.'),
    ),
  ],
  controls: [],
  presets: [],
  sourceNote: loc(
    '统一资料入口：REF-GOOGLE-MLCC、REF-INRIA-SKLEARN-MOOC、REF-D2L、REF-SKLEARN-USER-GUIDE、REF-HF-LLM-COURSE。',
    'Centralized references: REF-GOOGLE-MLCC, REF-INRIA-SKLEARN-MOOC, REF-D2L, REF-SKLEARN-USER-GUIDE, REF-HF-LLM-COURSE.',
  ),
  createDefaultConfig: () => ({
    playbackMs: 900,
  }),
  simulate: simulateAiOverview,
}
