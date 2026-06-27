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

function simulateSequenceEmbeddingBridge(): ModuleSimulation {
  return {
    snapshots: [
      {
        step: 0,
        loss: 0,
        accuracy: 0,
        derivedMetrics: {
          moduleType: 'sequence-embedding-bridge',
          referenceIds: ['REF-HF-LLM-COURSE', 'REF-D2L-ATTENTION', 'REF-ANNOTATED-TRANSFORMER'],
        },
      },
    ],
  }
}

export const sequenceEmbeddingBridgeModule: AlgorithmModuleDefinition = {
  slug: 'sequence-embedding-bridge',
  route: '/learn/sequence-embedding-bridge',
  titleKey: 'modules.sequenceEmbeddingBridge.title',
  kickerKey: 'modules.sequenceEmbeddingBridge.kicker',
  introKey: 'modules.sequenceEmbeddingBridge.intro',
  summaryKey: 'modules.sequenceEmbeddingBridge.summary',
  theme: '#eff6ff',
  accent: '#2563eb',
  checkpoints: algorithmCheckpointsBySlug['sequence-embedding-bridge'],
  chapters: [
    chapter(
      'why-sequences',
      'modules.sequenceEmbeddingBridge.sections.whySequences.title',
      loc(
        `前面你已经看过表格样本、图像张量和 CNN feature map。进入语言和 Transformer 前，先把输入换成另一种结构：有顺序的离散单元。

### 从表格和图像到序列
表格通常是一行样本配一组列特征。图像通常是 $H \\times W \\times C$ 的像素体。文本、代码、时间片段和很多交互日志则更像序列：第 1 个单元、第 2 个单元、第 3 个单元之间有顺序。

这时模型不再只问“这一列是什么”或“这个局部 patch 是什么”，而要问：

- 当前单元是谁？
- 它在第几个位置？
- 它可以看见哪些其他位置？
- 后面的 attention 应该拿什么张量继续算？

### 老师会先问
如果一句话被切成 8 个 token，那么这 8 个 token 更像表格里的 8 列，还是同一个样本里的 8 个有序位置？先答对这个问题，后面的 [B,T,H] 才不会只是符号。

### Ref ID
REF-HF-LLM-COURSE、REF-D2L-ATTENTION`,
        `You have already seen tabular rows, image tensors, and CNN feature maps. Before language and Transformers, switch the input structure to ordered discrete units.

### From tables and images to sequences
A table is usually one sample with named feature columns. An image is usually an $H \\times W \\times C$ pixel volume. Text, code, time snippets, and many interaction logs are more like sequences: unit 1, unit 2, unit 3, with order.

Now the model no longer asks only "what is this column?" or "what is this local patch?" It asks:

- Which unit is this?
- Which position is it in?
- Which other positions can it see?
- What tensor should attention consume next?

### Teacher question
If a sentence becomes 8 tokens, are those 8 tokens more like 8 table columns, or 8 ordered positions inside one sample? Answer that first, and [B,T,H] stops being just notation.

### Ref ID
REF-HF-LLM-COURSE, REF-D2L-ATTENTION`,
      ),
      loc(
        '序列学习的关键不是多了几列，而是同一个样本内部多了有顺序的位置轴。',
        'The key shift in sequence learning is not more columns; it is an ordered position axis inside one sample.',
      ),
      loc(
        '在右侧 sequence 阶段，把“表格一行”“图像 H×W×C”和“8 个 token 的一句话”分别说成模型看到的结构。',
        'Use the sequence stage to describe a table row, an H×W×C image, and an 8-token sentence as model input structures.',
      ),
    ),
    chapter(
      'token-ids',
      'modules.sequenceEmbeddingBridge.sections.tokenIds.title',
      loc(
        `tokenization 的输出通常先是整数 id。这个 id 是词表里的索引，不是连续数值特征本身。

### token id 不是温度、面积或价格
表格里的面积 120 和 80 有数值大小关系。token id 120 和 80 只是两个词表位置，id 大小本身没有“更大语义”。如果把 token id 直接当连续特征喂给模型，模型会误以为编号距离有意义。

一个 batch 的 token id 常写成：

$$\\mathrm{token\\_ids}\\in\\mathbb{Z}^{B\\times T}$$

这里 $B$ 是 batch size，$T$ 是 sequence length，也就是 token 轴。比如一批 2 句话，每句补齐到 5 个 token，形状就是 $[2,5]$。

### 想一想
token id 的作用像数组下标。真正要被训练和比较的，是下一步查表得到的 embedding 向量。

### Ref ID
REF-HF-LLM-COURSE`,
        `Tokenization usually outputs integer ids first. An id is an index into a vocabulary, not a continuous numeric feature.

### Token id is not temperature, area, or price
In a table, area 120 and 80 have numeric magnitude. Token id 120 and 80 are just two vocabulary positions; the id magnitude itself does not mean "larger semantics". If token ids are fed directly as continuous features, the model may treat index distance as meaningful.

A batch of token ids is often shaped as:

$$\\mathrm{token\\_ids}\\in\\mathbb{Z}^{B\\times T}$$

Here $B$ is batch size, and $T$ is sequence length: the token axis. A batch of 2 sentences padded to 5 tokens each has shape $[2,5]$.

### Think about it
A token id acts like an array index. The trainable object to compare is the embedding vector obtained by lookup in the next step.

### Ref ID
REF-HF-LLM-COURSE`,
      ),
      loc(
        'token id 是词表索引，不是带距离意义的连续数值特征；T 轴记录有序 token 位置。',
        'A token id is a vocabulary index, not a continuous feature with distance meaning; the T axis records ordered token positions.',
      ),
      loc(
        '在右侧 token 阶段，说明为什么 token id 1024 不能被解释为“比 12 更大”。',
        'Use the token stage to explain why token id 1024 should not mean "larger than 12".',
      ),
    ),
    chapter(
      'embedding-lookup',
      'modules.sequenceEmbeddingBridge.sections.embeddingLookup.title',
      loc(
        `embedding layer 把 token id 变成向量。最朴素的读法是：用 id 去一张可训练表里查一行。

### 查表得到 H 维表示
如果词表大小是 $V$，embedding 维度是 $H$，embedding table 的形状是：

$$E\\in\\mathbb{R}^{V\\times H}$$

token id $i$ 会查到第 $i$ 行：

$$x_t=E[i]$$

当 $[B,T]$ 的 token id 全部查完表后，输出就从整数矩阵变成浮点张量：

$$[B,T]\\rightarrow[B,T,H]$$

这一步把离散符号接到了神经网络熟悉的向量空间里。后面的 attention、MLP、LayerNorm 都会处理这些 $H$ 维向量。

### 老师会先问
embedding 是手写词义表，还是训练出来的参数矩阵？它从随机初始化开始，靠 loss 和反向传播逐渐变成有用表示。

### Ref ID
REF-HF-LLM-COURSE、REF-D2L-ATTENTION`,
        `An embedding layer turns token ids into vectors. The simplest reading is lookup: use the id to select a row from a trainable table.

### Lookup creates H-dimensional representation
If vocabulary size is $V$ and embedding dimension is $H$, the embedding table has shape:

$$E\\in\\mathbb{R}^{V\\times H}$$

Token id $i$ looks up row $i$:

$$x_t=E[i]$$

After all token ids in $[B,T]$ are looked up, the output changes from an integer matrix to a floating-point tensor:

$$[B,T]\\rightarrow[B,T,H]$$

This step connects discrete symbols to the vector space used by neural networks. Later attention, MLP, and LayerNorm operate on these $H$-dimensional vectors.

### Teacher question
Is an embedding a handwritten meaning table, or a trained parameter matrix? It starts random and becomes useful through loss and backpropagation.

### Ref ID
REF-HF-LLM-COURSE, REF-D2L-ATTENTION`,
      ),
      loc(
        'embedding lookup 把 [B,T] 的 token id 变成 [B,T,H] 的可训练向量表示。',
        'Embedding lookup turns [B,T] token ids into [B,T,H] trainable vector representations.',
      ),
      loc(
        '在右侧 embed 阶段，说出 V、H、B、T 分别是哪类维度，并解释 lookup 为什么可训练。',
        'Use the embed stage to name V, H, B, and T, then explain why lookup is trainable.',
      ),
    ),
    chapter(
      'positions-and-masks',
      'modules.sequenceEmbeddingBridge.sections.positionsAndMasks.title',
      loc(
        `embedding 只说明“这个位置是什么 token”，还没有完整说明“它在第几个位置、哪些位置可见”。

### 位置信息补顺序
如果模型只拿到一组 token embedding，而没有位置编码或位置嵌入，很多结构会很难区分。例如“猫追狗”和“狗追猫”包含同样 token，却不是同样意思。position embedding 或 positional encoding 会把顺序线索加入每个 token 表示。

常见写法是：

$$X=\\mathrm{token\\_embedding}+\\mathrm{position\\_embedding}$$

### attention mask 控制可见性
batch 里不同句子长度不一样时，短句常被 padding 到同一长度。padding 位置不应该被模型当作真实 token。attention mask 会告诉后续 attention：哪些位置可见，哪些位置要屏蔽。

自回归模型还会用 causal mask，防止当前位置偷看未来 token。

### 想一想
position 和 mask 不是装饰。position 解决顺序问题，mask 解决可见性问题。

### Ref ID
REF-D2L-ATTENTION、REF-ANNOTATED-TRANSFORMER、REF-HF-LLM-COURSE`,
        `Embeddings say "which token is at this slot", but not fully "which position is it in, and which positions are visible".

### Position information supplies order
If the model only receives a set of token embeddings without position encodings or position embeddings, many structures are hard to separate. "Cat chases dog" and "dog chases cat" contain the same tokens but mean different things. Position embeddings or positional encodings add order clues to each token representation.

A common form is:

$$X=\\mathrm{token\\_embedding}+\\mathrm{position\\_embedding}$$

### Attention mask controls visibility
Sentences in a batch can have different lengths, so shorter ones are often padded to the same length. Padding positions should not be treated as real tokens. An attention mask tells later attention which positions are visible and which should be blocked.

Autoregressive models also use a causal mask to prevent the current position from seeing future tokens.

### Think about it
Position and mask are not decoration. Position solves order; mask solves visibility.

### Ref ID
REF-D2L-ATTENTION, REF-ANNOTATED-TRANSFORMER, REF-HF-LLM-COURSE`,
      ),
      loc(
        'position 表示顺序，attention mask 表示哪些 token 可见；它们让 [B,T,H] 变成可安全计算的序列输入。',
        'Position represents order, and attention mask represents token visibility; together they make [B,T,H] safe sequence input.',
      ),
      loc(
        '在右侧 position 阶段，把 padding mask 和 causal mask 的用途分开说清。',
        'Use the position stage to distinguish padding mask from causal mask.',
      ),
    ),
    chapter(
      'shape-handoff',
      'modules.sequenceEmbeddingBridge.sections.shapeHandoff.title',
      loc(
        `到这里，attention 真正接到的不是原始文字，也不是孤立 token id，而是带位置和 mask 的序列表示。

### 交给 attention 前的最小清单
- token ids：形状 $[B,T]$，只负责索引词表。
- embedding lookup：把每个 id 变成 $H$ 维向量。
- position：告诉模型 token 的顺序。
- attention mask：告诉模型哪些位置能看见。
- hidden states：进入 attention 的主张量，形状 $[B,T,H]$。

Attention 的 Q/K/V 会从这个 $[B,T,H]$ 出发：

$$Q=XW_Q,\\quad K=XW_K,\\quad V=XW_V$$

所以下一课的重点不再是“怎样得到 token 向量”，而是“这些 token 向量怎样彼此交换上下文”。

### 老师会先问
如果你解释不清 [B,T,H] 从哪里来，Q/K/V 的矩阵乘法就会像凭空出现。先把桥搭好，再进入 attention。

### Ref ID
REF-D2L-ATTENTION、REF-ANNOTATED-TRANSFORMER、REF-HF-LLM-COURSE`,
        `At this point, attention receives neither raw text nor isolated token ids. It receives sequence representation with position and mask information.

### Minimal checklist before attention
- Token ids: shape $[B,T]$, only indexing the vocabulary.
- Embedding lookup: turns each id into an $H$-dimensional vector.
- Position: tells the model token order.
- Attention mask: tells the model which positions can be seen.
- Hidden states: the main tensor entering attention, shape $[B,T,H]$.

Q/K/V in attention start from this $[B,T,H]$:

$$Q=XW_Q,\\quad K=XW_K,\\quad V=XW_V$$

The next lesson no longer focuses on "how token vectors are obtained"; it focuses on "how token vectors exchange context".

### Teacher question
If you cannot explain where [B,T,H] comes from, Q/K/V matrix multiplication feels like it appears from nowhere. Build the bridge first, then enter attention.

### Ref ID
REF-D2L-ATTENTION, REF-ANNOTATED-TRANSFORMER, REF-HF-LLM-COURSE`,
      ),
      loc(
        '进入 attention 前，学生应能从 token id 追踪到带 position 和 mask 的 [B,T,H] hidden states。',
        'Before attention, students should trace token ids into [B,T,H] hidden states with position and mask information.',
      ),
      loc(
        '在右侧 handoff 阶段，用一条箭头链写出 token ids -> embedding -> position/mask -> [B,T,H] -> Q/K/V。',
        'Use the handoff stage to write token ids -> embedding -> position/mask -> [B,T,H] -> Q/K/V as one arrow chain.',
      ),
    ),
  ],
  controls: [],
  presets: [],
  sourceNote: loc(
    '桥接内容参考 Hugging Face LLM Course、Dive into Deep Learning 的 attention 章节，以及 The Annotated Transformer 的实现注释。',
    'Bridge content references the Hugging Face LLM Course, Dive into Deep Learning attention material, and implementation notes from The Annotated Transformer.',
  ),
  createDefaultConfig: () => ({}),
  simulate: simulateSequenceEmbeddingBridge,
}
