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

function simulateAttentionTransformer(): ModuleSimulation {
  return {
    snapshots: [
      {
        step: 0,
        loss: 0,
        accuracy: 0,
        derivedMetrics: {
          moduleType: 'attention-transformer',
          referenceIds: [
            'REF-D2L-ATTENTION',
            'REF-D2L-TRANSFORMER',
            'REF-ANNOTATED-TRANSFORMER',
            'REF-HF-LLM-COURSE',
          ],
        },
      },
    ],
  }
}

export const attentionTransformerModule: AlgorithmModuleDefinition = {
  slug: 'attention-transformer',
  route: '/learn/attention-transformer',
  titleKey: 'modules.attentionTransformer.title',
  kickerKey: 'modules.attentionTransformer.kicker',
  introKey: 'modules.attentionTransformer.intro',
  summaryKey: 'modules.attentionTransformer.summary',
  theme: '#fdf4ff',
  accent: '#a21caf',
  checkpoints: algorithmCheckpointsBySlug['attention-transformer'],
  chapters: [
    chapter(
      'tokens-embeddings',
      'modules.attentionTransformer.sections.tokensEmbeddings.title',
      loc(
        `Transformer 先把文本看成 token 序列，再把每个 token 查表成 embedding 向量。

### 从句子到矩阵
一句话可以被 tokenizer 切成 token id。embedding layer 把每个 id 变成长度为 $H$ 的向量。如果 batch size 是 $B$、序列长度是 $T$，进入 Transformer block 的张量常写成：

$$[B,T,H]$$

这里的 $T$ 是 token 位置，$H$ 是每个 token 的表示维度。

### positional encoding 为什么必要
自注意力本身会同时比较所有 token，如果不加入位置信息，模型很难区分“狗咬人”和“人咬狗”。位置编码或位置嵌入把顺序信息加进表示里。

### 老师会先问
这一层是在理解自然语言，还是在把 token id 变成可训练向量？先把 embedding 看成表查找，Transformer 的形状才清楚。

### Ref ID
REF-D2L-ATTENTION、REF-HF-LLM-COURSE`,
        `A Transformer first sees text as a token sequence, then maps each token to an embedding vector.

### From sentence to matrix
A tokenizer turns a sentence into token ids. An embedding layer maps each id to a vector of length $H$. If batch size is $B$ and sequence length is $T$, the tensor entering a Transformer block is often written as:

$$[B,T,H]$$

Here $T$ is token position, and $H$ is the representation dimension for each token.

### Why positional encoding is needed
Self-attention compares all tokens at once. Without position information, the model has trouble separating "dog bites person" from "person bites dog". Positional encoding or learned position embeddings add order information into the representation.

### Teacher question
Is this layer understanding language, or turning token ids into trainable vectors? Treat embeddings as lookup first, and Transformer shapes become clearer.

### Ref ID
REF-D2L-ATTENTION, REF-HF-LLM-COURSE`,
      ),
      loc(
        'Transformer 的输入先是 token id，再变成 [B, T, H] 的 embedding 表示。',
        'Transformer input starts as token ids, then becomes embedding representation with shape [B, T, H].',
      ),
      loc(
        '在右侧 token 阶段，说出 B、T、H 分别代表什么，并说明位置编码补了哪类信息。',
        'Use the token stage to name B, T, and H, then explain what information positional encoding adds.',
      ),
    ),
    chapter(
      'qkv-scores',
      'modules.attentionTransformer.sections.qkvScores.title',
      loc(
        `Attention 的核心问题是：当前 token 应该看向哪些其他 token？Q/K/V 是这个问题的三个投影。

### Q、K、V 分别像什么
- Query：我现在想找什么信息。
- Key：我这里有什么可被匹配的线索。
- Value：如果你关注我，我实际贡献什么内容。

从输入表示 $X$ 得到：

$$Q=XW_Q,\\quad K=XW_K,\\quad V=XW_V$$

score matrix 常写成：

$$S=\\frac{QK^T}{\\sqrt{d_k}}$$

如果序列有 4 个 token，$S$ 就是 $4 \\times 4$：每一行表示某个 query 对所有 key 的打分。

### 想一想
Q/K 点积不是最终输出，它只是相关性分数。真正被汇总的是 value。

### Ref ID
REF-D2L-ATTENTION、REF-D2L-TRANSFORMER、REF-ANNOTATED-TRANSFORMER`,
        `The core attention question is: which other tokens should the current token look at? Q/K/V are three projections for answering that question.

### What Q, K, and V resemble
- Query: what information am I looking for?
- Key: what matching clue do I contain?
- Value: what content do I contribute if attended to?

From input representation $X$:

$$Q=XW_Q,\\quad K=XW_K,\\quad V=XW_V$$

The score matrix is often written as:

$$S=\\frac{QK^T}{\\sqrt{d_k}}$$

If the sequence has 4 tokens, $S$ is $4 \\times 4$: each row scores one query against all keys.

### Think about it
The Q/K dot product is not the final output. It is a relevance score. The values are what actually get aggregated.

### Ref ID
REF-D2L-ATTENTION, REF-D2L-TRANSFORMER, REF-ANNOTATED-TRANSFORMER`,
      ),
      loc(
        'Q/K 生成 attention score matrix，V 才是后面要被加权汇总的内容。',
        'Q/K create the attention score matrix; V is the content later combined by weights.',
      ),
      loc(
        '在右侧 qkv 阶段，用 4 个 token 画出一个 4×4 score matrix，并说清行和列代表什么。',
        'Use the qkv stage to draw a 4×4 score matrix for four tokens and name what rows and columns mean.',
      ),
    ),
    chapter(
      'softmax-weighted-sum',
      'modules.attentionTransformer.sections.softmaxWeightedSum.title',
      loc(
        `score matrix 还不能直接当输出。它先要经过 softmax，变成每个 query 对所有 key 的权重分布。

### softmax 作用在哪个维度
对自注意力，通常是每一行做 softmax：

$$A=\\mathrm{softmax}(S,\\mathrm{dim}=-1)$$

这样每一行的权重加起来是 1。然后把这些权重乘到 value 上：

$$O=AV$$

第 $i$ 行输出就是第 $i$ 个 token 根据注意力权重汇总出来的新表示。

### 温度和缩放
$\\sqrt{d_k}$ 的缩放能避免点积随维度变大而过大，帮助 softmax 不要过早变得极端。

### 老师会先问
softmax 是让所有 token 全局加起来为 1，还是让每个 query 单独分配注意力预算？答案是后者。

### Ref ID
REF-D2L-ATTENTION、REF-ANNOTATED-TRANSFORMER`,
        `The score matrix is not the output yet. It goes through softmax to become a weight distribution from each query over all keys.

### Which dimension gets softmax?
For self-attention, softmax usually happens row by row:

$$A=\\mathrm{softmax}(S,\\mathrm{dim}=-1)$$

Each row then sums to 1. These weights are applied to values:

$$O=AV$$

Row $i$ of the output is the new representation for token $i$, aggregated according to its attention weights.

### Temperature and scaling
The $\\sqrt{d_k}$ scaling prevents dot products from growing too large with dimension, helping softmax avoid becoming extreme too early.

### Teacher question
Does softmax make all tokens globally sum to 1, or does each query get its own attention budget? It is the latter.

### Ref ID
REF-D2L-ATTENTION, REF-ANNOTATED-TRANSFORMER`,
      ),
      loc(
        'softmax 通常按 score matrix 的每一行做，让每个 query 单独分配注意力。',
        'Softmax usually acts row-wise on the score matrix so each query allocates its own attention.',
      ),
      loc(
        '在右侧 softmax 挑战中，先预测当前 query 最会看向哪个 key、mask 是否会改变答案，再查看 Q/K score、softmax 权重和 value 加权结果。',
        'Use the softmax challenge to predict the top key for the current query and whether the mask changes the answer, then inspect Q/K scores, softmax weights, and weighted value output.',
      ),
    ),
    chapter(
      'multi-head-shapes',
      'modules.attentionTransformer.sections.multiHeadShapes.title',
      loc(
        `Multi-head attention 不是简单重复很多次同一件事，而是把表示维度拆成多个子空间，让不同 head 学不同关系。

### 形状怎么拆
如果输入是 $[B,T,H]$，有 \`heads\` 个头，每个头维度是 $d_{head}=H/heads$，常见中间形状是：

$$[B,T,H] \\rightarrow [B,heads,T,d_{head}]$$

每个 head 各自做 Q/K/V、score、softmax 和 value weighted sum。最后再 concat 回 $[B,T,H]$ 并通过输出投影。

~~~python
import torch.nn as nn

attn = nn.MultiheadAttention(
    embed_dim=128,
    num_heads=4,
    batch_first=True,
)
~~~

### 为什么多头有用
一个 head 可能关注局部语法，另一个关注远距离指代，另一个关注标点或格式。它们不是人工指定的角色，而是在训练中分化出来的。

### Ref ID
REF-D2L-TRANSFORMER、REF-ANNOTATED-TRANSFORMER`,
        `Multi-head attention is not merely repeating the same operation. It splits the representation dimension into several subspaces so different heads can learn different relations.

### Shape split
If input is $[B,T,H]$, there are \`heads\` attention heads, and each head dimension is $d_{head}=H/heads$, a common intermediate shape is:

$$[B,T,H] \\rightarrow [B,heads,T,d_{head}]$$

Each head performs Q/K/V, scores, softmax, and value weighted sum. The heads are concatenated back to $[B,T,H]$ and passed through an output projection.

~~~python
import torch.nn as nn

attn = nn.MultiheadAttention(
    embed_dim=128,
    num_heads=4,
    batch_first=True,
)
~~~

### Why multiple heads help
One head may attend to local syntax, another to long-range reference, another to punctuation or format. These roles are not handwritten; they differentiate during training.

### Ref ID
REF-D2L-TRANSFORMER, REF-ANNOTATED-TRANSFORMER`,
      ),
      loc(
        'Multi-head 把 H 拆成多个 d_head，让不同子空间各自学习注意力模式。',
        'Multi-head attention splits H into several d_head subspaces so each can learn its own attention pattern.',
      ),
      loc(
        '在右侧 heads 阶段，把 [B,T,128] 和 4 个 heads 改写成 [B,4,T,32]。',
        'Use the heads stage to rewrite [B,T,128] with 4 heads as [B,4,T,32].',
      ),
    ),
    chapter(
      'transformer-block',
      'modules.attentionTransformer.sections.transformerBlock.title',
      loc(
        `一个 Transformer block 不只有 attention。它还包含 residual connection、LayerNorm 和 position-wise FFN。

### Encoder block 的常见顺序
简化写法可以看成：

~~~text
x -> self-attention -> add & norm -> feed-forward -> add & norm
~~~

自注意力负责让 token 之间交换信息。position-wise FFN 对每个 token 的表示做同一套非线性变换。residual connection 让原始信号有直通路径，LayerNorm 帮助训练稳定。

### 为什么 residual 很重要
如果每层都完全重写表示，深层网络很难训练。residual 让 block 学“增量修改”，而不是每次从零开始。

### 想一想
attention 解决的是 token 之间如何交流；FFN 解决的是每个 token 表示内部如何加工。两者组合才形成完整 block。

### Ref ID
REF-D2L-TRANSFORMER、REF-ANNOTATED-TRANSFORMER`,
        `A Transformer block is not attention alone. It also includes residual connections, LayerNorm, and a position-wise FFN.

### Common encoder-block order
A simplified view is:

~~~text
x -> self-attention -> add & norm -> feed-forward -> add & norm
~~~

Self-attention lets tokens exchange information. The position-wise FFN applies the same nonlinear transformation to each token representation. Residual connections provide a direct path for the original signal, and LayerNorm helps training stability.

### Why residuals matter
If each layer completely rewrote the representation, deep networks would be hard to train. A residual lets a block learn an incremental change instead of starting from scratch every time.

### Think about it
Attention answers how tokens communicate; the FFN answers how each token's internal representation is processed. The complete block needs both.

### Ref ID
REF-D2L-TRANSFORMER, REF-ANNOTATED-TRANSFORMER`,
      ),
      loc(
        'Transformer block = self-attention + residual/norm + position-wise FFN。',
        'Transformer block = self-attention + residual/norm + position-wise FFN.',
      ),
      loc(
        '在右侧 block 挑战中，先判断 Transformer block 少了哪一部分或误把 attention 当成完整 block，再查看 trace、shape 和角色证据。',
        'Use the block challenge to identify the missing part or the mistake of treating attention as the full block, then inspect trace, shape, and role evidence.',
      ),
    ),
    chapter(
      'architecture-to-tools',
      'modules.attentionTransformer.sections.architectureToTools.title',
      loc(
        `学完 Transformer block 后，就能更清楚地看现代 LLM 工具链：tokenizer、model、generation 和 fine-tuning 都不是黑盒名词。

### 从架构到工具
Hugging Face 的常见对象可以对应回前面的概念：

- tokenizer：文本和 token id 之间的转换。
- model：embedding、多个 Transformer block 和输出头。
- attention mask：告诉模型哪些位置可见，哪些是 padding 或未来 token。
- logits：每个位置对词表里下一个 token 的分数。

### 为什么要先学形状
如果你能追踪 $[B,T,H]$、Q/K/V、softmax 和 logits，就能更稳地理解 batch、padding、context window 和生成时的逐 token 采样。

### 下一步路径
进入 LLM/RAG 章节时，重点会从“Transformer block 怎样算”转向“应用怎样组织外部知识、prompt 和评估”。

### Ref ID
REF-HF-LLM-COURSE、REF-D2L-TRANSFORMER`,
        `After learning a Transformer block, modern LLM tooling becomes easier to read: tokenizer, model, generation, and fine-tuning stop being black-box words.

### From architecture to tooling
Common Hugging Face objects map back to earlier concepts:

- tokenizer: conversion between text and token ids.
- model: embeddings, multiple Transformer blocks, and an output head.
- attention mask: which positions are visible and which are padding or future tokens.
- logits: scores over the vocabulary for the next token at each position.

### Why shapes come first
If you can track $[B,T,H]$, Q/K/V, softmax, and logits, you can more reliably understand batch, padding, context window, and token-by-token generation.

### Next path
In the LLM/RAG chapter, the focus shifts from how a Transformer block computes to how applications organize external knowledge, prompts, and evaluation.

### Ref ID
REF-HF-LLM-COURSE, REF-D2L-TRANSFORMER`,
      ),
      loc(
        '现代 LLM 工具链可以回到 tokenizer、Transformer block、attention mask 和 logits 来理解。',
        'Modern LLM tooling can be understood through tokenizer, Transformer blocks, attention masks, and logits.',
      ),
      loc(
        '先完成右侧工具链判断挑战，再把 tokenizer、model、attention mask、logits 对应回前面的形状和计算。',
        'Complete the tools handoff challenge first, then map tokenizer, model, attention mask, and logits back to the shapes and computations above.',
      ),
    ),
  ],
  controls: [],
  presets: [],
  sourceNote: loc(
    '统一资料入口：REF-D2L-ATTENTION、REF-D2L-TRANSFORMER、REF-ANNOTATED-TRANSFORMER、REF-HF-LLM-COURSE。',
    'Centralized references: REF-D2L-ATTENTION, REF-D2L-TRANSFORMER, REF-ANNOTATED-TRANSFORMER, REF-HF-LLM-COURSE.',
  ),
  createDefaultConfig: () => ({
    playbackMs: 900,
  }),
  simulate: simulateAttentionTransformer,
}
