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

function simulateLlmRag(): ModuleSimulation {
  return {
    snapshots: [
      {
        step: 0,
        loss: 0,
        accuracy: 0,
        derivedMetrics: {
          moduleType: 'llm-rag',
          referenceIds: [
            'REF-HF-LLM-COURSE',
            'REF-HF-RAG-MILVUS',
            'REF-HF-RAG-ZEPHYR',
            'REF-MS-GENAI-BEGINNERS',
          ],
        },
      },
    ],
  }
}

export const llmRagModule: AlgorithmModuleDefinition = {
  slug: 'llm-rag',
  route: '/learn/llm-rag',
  titleKey: 'modules.llmRag.title',
  kickerKey: 'modules.llmRag.kicker',
  introKey: 'modules.llmRag.intro',
  summaryKey: 'modules.llmRag.summary',
  theme: '#f0fdfa',
  accent: '#0f766e',
  checkpoints: algorithmCheckpointsBySlug['llm-rag'],
  chapters: [
    chapter(
      'causal-language-modeling',
      'modules.llmRag.sections.causalLanguageModeling.title',
      loc(
        `Transformer block 会产生每个位置的 hidden state，但语言模型还需要一个明确的训练目标：根据已经出现的 token 预测下一个 token。

### 输入与目标只错开一位
假设 token 序列是 \`[机器, 学习, 改变, 世界]\`。训练时可以同时构造三组关系：

- 看见“机器”，目标是“学习”；
- 看见“机器，学习”，目标是“改变”；
- 看见“机器，学习，改变”，目标是“世界”。

实现时通常不需要把样本真的复制三遍，只要把同一个序列向右错开：

~~~python
input_ids = tokens[:, :-1]
targets = tokens[:, 1:]
logits = model(input_ids)       # [B, T-1, V]
loss = cross_entropy(
    logits.reshape(-1, vocab_size),
    targets.reshape(-1),
)
~~~

这里的 \`V\` 是词表大小。每个位置输出一整行 logits，交叉熵只关心正确 next token 对应的概率是否提高。

### causal mask 防止偷看答案
位置 \`t\` 只能关注 \`0...t\`，不能读取未来 token。因果 mask 会把未来位置的 attention score 屏蔽掉；否则模型训练时能直接看见目标，loss 虽然会很低，但推理时无法复现这种条件。

### 从 Attention 接到语言模型
Attention 回答“当前位置怎样汇总过去上下文”，语言模型目标回答“汇总后的 hidden state 要预测什么”。这两步合起来，才从 Transformer 结构走到可训练的 next-token model。

### Ref ID
REF-HF-LLM-COURSE、REF-MS-GENAI-BEGINNERS`,
        `A Transformer block produces a hidden state at each position, but a language model still needs an explicit training objective: predict the next token from the tokens already seen.

### Inputs and targets differ by one position
Suppose the token sequence is \`[machine, learning, changes, the, world]\`. Training creates several relations at once:

- after “machine”, predict “learning”;
- after “machine, learning”, predict “changes”;
- after “machine, learning, changes”, predict “the”.

The implementation does not need to copy the sample several times. Shift the same sequence by one position:

~~~python
input_ids = tokens[:, :-1]
targets = tokens[:, 1:]
logits = model(input_ids)       # [B, T-1, V]
loss = cross_entropy(
    logits.reshape(-1, vocab_size),
    targets.reshape(-1),
)
~~~

Here \`V\` is vocabulary size. Every position produces a row of logits, and cross entropy asks whether the probability of the correct next token increases.

### A causal mask prevents answer leakage
Position \`t\` may attend only to \`0...t\`, never to future tokens. The causal mask blocks future attention scores. Without it, training could read the target directly: loss would look excellent, but inference could not reproduce that condition.

### From attention to a language model
Attention answers “how should this position combine past context?” The language-model objective answers “what should the resulting hidden state predict?” Together they turn Transformer blocks into a trainable next-token model.

### Ref ID
REF-HF-LLM-COURSE, REF-MS-GENAI-BEGINNERS`,
      ),
      loc(
        '因果语言模型把同一序列右移成输入与目标，并用 causal mask 保证每个位置只能读取过去。',
        'A causal language model shifts one sequence into inputs and targets, while a causal mask limits every position to the past.',
      ),
      loc(
        '在右侧逐行读取输入、目标和 mask，说明为什么未来 token 必须不可见。',
        'Read the inputs, targets, and mask row by row, then explain why future tokens must stay hidden.',
      ),
    ),
    chapter(
      'decoding-generation',
      'modules.llmRag.sections.decodingGeneration.title',
      loc(
        `训练会并行计算许多位置的 next-token loss；生成时却必须自回归地一次增加一个 token。

### 一次生成循环
1. 把当前 token 序列送入模型。
2. 只读取最后一个位置的 logits。
3. 把 logits 变成概率分布并选出 next token。
4. 把 token 追加到序列，直到遇到停止 token 或长度上限。

~~~python
while len(generated) < max_new_tokens:
    logits = model(generated)[:, -1, :]
    next_token = choose(logits, temperature=0.8, top_k=40)
    generated.append(next_token)
    if next_token == eos_token_id:
        break
~~~

### logits 不是概率
softmax 把 logits 归一化为概率。temperature \(T\) 会先缩放 logits：

$$p_i=\operatorname{softmax}(z_i/T)$$

- \(T<1\)：分布更尖，生成更稳定但容易重复。
- \(T>1\)：分布更平，变化更多但低概率错误也更容易出现。
- greedy decoding：每步都选最高概率 token，结果确定但不一定是整体最佳句子。

### top-k 与 top-p 限制候选集合
top-k 只保留概率最高的 \(k\) 个 token；top-p 则保留累计概率达到阈值的最小候选集合。两者都在采样前排除长尾候选，但不能修复模型没有学到的事实。

### 训练、解码与 RAG 是三件事
训练更新参数；解码根据当前参数逐 token 生成；RAG 在解码前把外部资料放进上下文。后面学习 context window 和 retrieval 时，要始终保留这条边界。

### Ref ID
REF-HF-LLM-COURSE、REF-MS-GENAI-BEGINNERS`,
        `Training computes next-token losses for many positions in parallel; generation must autoregressively add one token at a time.

### One generation loop
1. Send the current token sequence through the model.
2. Read only the logits at the last position.
3. Turn logits into a distribution and choose the next token.
4. Append that token and continue until an end token or length limit.

~~~python
while len(generated) < max_new_tokens:
    logits = model(generated)[:, -1, :]
    next_token = choose(logits, temperature=0.8, top_k=40)
    generated.append(next_token)
    if next_token == eos_token_id:
        break
~~~

### Logits are not probabilities
Softmax normalizes logits into probabilities. Temperature \(T\) scales logits first:

$$p_i=\operatorname{softmax}(z_i/T)$$

- \(T<1\): the distribution becomes sharper, making output steadier but sometimes repetitive.
- \(T>1\): the distribution becomes flatter, adding variety while admitting more low-probability errors.
- Greedy decoding: always selects the highest-probability token, so it is deterministic but not guaranteed to form the best whole sequence.

### Top-k and top-p limit the candidate set
Top-k keeps the \(k\) highest-probability tokens. Top-p keeps the smallest set whose cumulative probability reaches a threshold. Both remove tail candidates before sampling, but neither repairs facts the model never learned.

### Training, decoding, and RAG are different operations
Training updates parameters; decoding generates tokens from the current parameters; RAG places external material into context before decoding. Keep these boundaries in view when studying context windows and retrieval.

### Ref ID
REF-HF-LLM-COURSE, REF-MS-GENAI-BEGINNERS`,
      ),
      loc(
        '自回归生成每次只选择一个 next token；temperature、top-k 和 top-p 改变候选分布，不改变模型参数。',
        'Autoregressive generation chooses one next token at a time; temperature, top-k, and top-p reshape candidates without changing parameters.',
      ),
      loc(
        '在右侧调节 temperature 和 top-k，观察候选概率如何变化，并区分训练参数与解码参数。',
        'Adjust temperature and top-k, observe the candidate probabilities, and separate training parameters from decoding controls.',
      ),
    ),
    chapter(
      'tokenization-context',
      'modules.llmRag.sections.tokenizationContext.title',
      loc(
        `LLM 应用的第一层约束不是 prompt 技巧，而是 tokenization 和 context window。

### token 不是单词
tokenizer 可能把一个英文单词切成多个子词，也可能把中文字符、标点和空格拆成不同 token。模型最终看到的是 token id 序列，不是原始字符串。

~~~python
tokens = tokenizer("RAG 会把外部资料放进上下文。")
len(tokens["input_ids"])
~~~

### context window 是预算
context window 决定一次请求里最多能放多少 token。系统指令、用户问题、检索片段、格式要求和模型输出都要共享这份预算。

### 老师会先问
如果回答失败，是模型“不知道”，还是关键资料根本没放进 context window？RAG 章节要先学会算这笔预算。

### Ref ID
REF-HF-LLM-COURSE、REF-MS-GENAI-BEGINNERS`,
        `The first constraint in LLM applications is not prompt tricks. It is tokenization and the context window.

### Tokens are not words
A tokenizer may split one English word into several subwords, and it may split Chinese characters, punctuation, and spaces into different tokens. The model ultimately sees token ids, not the raw string.

~~~python
tokens = tokenizer("RAG puts external material into context.")
len(tokens["input_ids"])
~~~

### Context window is budget
The context window limits how many tokens one request can contain. System instruction, user question, retrieved passages, formatting requirements, and model output all share the same budget.

### Teacher question
If an answer fails, did the model "not know", or did the key material never enter the context window? The RAG chapter starts by learning to budget tokens.

### Ref ID
REF-HF-LLM-COURSE, REF-MS-GENAI-BEGINNERS`,
      ),
      loc(
        'LLM 看到的是 token id；context window 是 prompt、检索片段和输出共享的 token 预算。',
        'An LLM sees token ids; the context window is the token budget shared by prompt, retrieved passages, and output.',
      ),
      loc(
        '在右侧 token 阶段，估算系统指令、问题、3 段资料和答案会怎样占用上下文预算。',
        'Use the token stage to estimate how system instruction, question, three passages, and answer use the context budget.',
      ),
    ),
    chapter(
      'embeddings-similarity',
      'modules.llmRag.sections.embeddingsSimilarity.title',
      loc(
        `RAG 的检索部分通常先把文本 chunk 变成 embedding，再用相似度搜索找相关片段。

### embedding 是什么
embedding 是一段文本的向量表示。相近含义的文本通常在向量空间里更接近。检索时，query 和文档 chunk 都会变成向量。

常见相似度之一是 cosine similarity：

$$\\mathrm{cos}(q,d)=\\frac{q\\cdot d}{\\|q\\|\\|d\\|}$$

### vector store 做什么
vector store 保存 chunk embedding 和元数据。用户提问时，系统计算 query embedding，在向量库里取 top_k 个相似 chunk，再交给后面的 prompt assembly。

### 想一想
embedding 相似不等于答案正确。它只是把可能相关的材料找出来，后面还要检查来源、覆盖度和回答是否 grounded。

### Ref ID
REF-HF-RAG-MILVUS、REF-HF-RAG-ZEPHYR、REF-HF-LLM-COURSE`,
        `The retrieval part of RAG usually turns text chunks into embeddings, then uses similarity search to find relevant passages.

### What is an embedding?
An embedding is a vector representation of text. Texts with similar meaning are often closer in vector space. During retrieval, both the query and document chunks become vectors.

One common similarity measure is cosine similarity:

$$\\mathrm{cos}(q,d)=\\frac{q\\cdot d}{\\|q\\|\\|d\\|}$$

### What does a vector store do?
A vector store saves chunk embeddings and metadata. When a user asks a question, the system computes a query embedding, retrieves top_k similar chunks, and passes them to prompt assembly.

### Think about it
Embedding similarity does not guarantee the answer is correct. It only finds potentially relevant material; source quality, coverage, and grounded generation still need checking.

### Ref ID
REF-HF-RAG-MILVUS, REF-HF-RAG-ZEPHYR, REF-HF-LLM-COURSE`,
      ),
      loc(
        'embedding 检索用向量相似度找候选资料，但它还不是最终答案。',
        'Embedding retrieval uses vector similarity to find candidate material, but it is not the final answer.',
      ),
      loc(
        '在右侧 embed 阶段，说明 query embedding 和 chunk embedding 如何进入 top_k 检索。',
        'Use the embed stage to explain how query embedding and chunk embedding enter top_k retrieval.',
      ),
    ),
    chapter(
      'chunking-retrieval',
      'modules.llmRag.sections.chunkingRetrieval.title',
      loc(
        `文档不能直接整本塞进模型。RAG 需要 chunking：把资料切成大小合适、可检索、可引用的小段。

### chunk size 和 overlap
- chunk size 太小：片段可能缺上下文，召回后读不懂。
- chunk size 太大：占用 context window，可能混入无关内容。
- overlap：让相邻 chunk 共享一部分文字，减少边界处信息被切断。

~~~python
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=80,
)
chunks = splitter.split_documents(documents)
~~~

### retrieval 之后还可以 reranking
第一轮向量检索负责快速召回候选；reranking 可以再根据 query 和候选片段做更精细排序，减少“相似但不回答问题”的片段。

### 老师会先问
如果回答缺少关键事实，问题可能在生成模型，也可能在 chunking、top_k、embedding 或 reranking。先定位 retrieval 问题，不要马上怪 prompt。

### Ref ID
REF-HF-RAG-ZEPHYR、REF-HF-RAG-MILVUS`,
        `A full document usually cannot be placed directly into the model. RAG needs chunking: splitting material into passages that are sized for retrieval and citation.

### Chunk size and overlap
- Chunk size too small: a passage may lack context and be hard to understand after retrieval.
- Chunk size too large: it consumes context window and may include irrelevant material.
- Overlap: neighboring chunks share some text so information near boundaries is less likely to be cut off.

~~~python
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=80,
)
chunks = splitter.split_documents(documents)
~~~

### Retrieval can be followed by reranking
The first vector search quickly recalls candidates; reranking can sort query-passage pairs more carefully and reduce passages that are similar but do not answer the question.

### Teacher question
If an answer lacks a key fact, the problem may be generation, but it may also be chunking, top_k, embedding, or reranking. Diagnose retrieval before blaming the prompt.

### Ref ID
REF-HF-RAG-ZEPHYR, REF-HF-RAG-MILVUS`,
      ),
      loc(
        'chunk size、overlap、top_k 和 reranking 决定哪些资料会进入 prompt。',
        'Chunk size, overlap, top_k, and reranking decide which material enters the prompt.',
      ),
      loc(
        '在右侧 chunk 阶段，比较 chunk 太小、太大和 overlap 不足时会出现什么失败。',
        'Use the chunk stage to compare failures from chunks that are too small, too large, or have too little overlap.',
      ),
    ),
    chapter(
      'prompt-assembly',
      'modules.llmRag.sections.promptAssembly.title',
      loc(
        `RAG 的生成部分不是把检索结果随便拼到 prompt 后面，而是 prompt assembly。

### 一个最小 RAG prompt
~~~text
System: 你只能根据给定资料回答；如果资料不足，请说明不足。
Question: {user_question}
Context:
[1] {chunk_a}
[2] {chunk_b}
[3] {chunk_c}
Answer: 请给出 grounded answer，并标注来源编号。
~~~

### grounded answer
grounded answer 的意思是：回答里的关键事实能在给定 context 中找到依据。它不保证世界上绝对正确，但能让学生把“模型说了什么”和“资料支持什么”分开检查。

### 常见失败
- context 里没有答案，模型却编。
- context 太长，关键信息被淹没。
- prompt 没要求引用，回答无法审计。

### Ref ID
REF-HF-RAG-MILVUS、REF-HF-RAG-ZEPHYR、REF-MS-GENAI-BEGINNERS`,
        `The generation part of RAG is not randomly appending retrieved passages to the prompt. It is prompt assembly.

### A minimal RAG prompt
~~~text
System: Answer only from the provided material; say when it is insufficient.
Question: {user_question}
Context:
[1] {chunk_a}
[2] {chunk_b}
[3] {chunk_c}
Answer: Give a grounded answer and cite source numbers.
~~~

### Grounded answer
A grounded answer means the key facts in the answer can be traced to the provided context. It does not guarantee absolute truth in the world, but it lets students separately check "what the model said" and "what the material supports".

### Common failures
- The context lacks the answer, but the model invents one.
- The context is too long, burying the key evidence.
- The prompt does not require citations, so the answer is hard to audit.

### Ref ID
REF-HF-RAG-MILVUS, REF-HF-RAG-ZEPHYR, REF-MS-GENAI-BEGINNERS`,
      ),
      loc(
        'prompt assembly 把问题、检索片段、格式要求和引用规则组织成可审计输入。',
        'Prompt assembly organizes question, retrieved passages, format requirements, and citation rules into auditable input.',
      ),
      loc(
        '在右侧 prompt 阶段，写出 query -> context -> answer 三段，并说明引用编号怎么帮助复盘。',
        'Use the prompt stage to write query -> context -> answer and explain how source numbers help review.',
      ),
    ),
    chapter(
      'rag-evaluation',
      'modules.llmRag.sections.ragEvaluation.title',
      loc(
        `RAG 评估要拆成 retrieval、prompt、generation 和 evaluation，而不是只问“答案看起来顺不顺”。

### 四类失败定位
- retrieval 问题：该召回的资料没进来。
- prompt 问题：资料进来了，但指令没有要求按资料回答或引用。
- generation 问题：模型忽略资料、编造或格式不稳定。
- evaluation 问题：没有标准问题集、没有来源检查，只凭感觉打分。

### 可记录的指标
检索侧可以看 recall@k、precision@k、是否包含 gold passage。生成侧可以看答案是否 grounded、是否覆盖关键事实、是否承认资料不足。

### 老师会先问
这次失败是“找不到资料”“资料放错了”“模型没按资料答”，还是“我们没有正确检查”？RAG 项目复盘要能分类。

### Ref ID
REF-HF-RAG-MILVUS、REF-HF-RAG-ZEPHYR、REF-MS-GENAI-BEGINNERS`,
        `RAG evaluation should separate retrieval, prompt, generation, and evaluation instead of only asking whether the answer sounds fluent.

### Four failure categories
- Retrieval problem: the needed material was not retrieved.
- Prompt problem: material arrived, but the instruction did not require grounded or cited answers.
- Generation problem: the model ignored material, invented facts, or produced unstable format.
- Evaluation problem: no standard question set, no source check, only subjective scoring.

### Metrics to record
Retrieval can track recall@k, precision@k, and whether the gold passage was included. Generation can track whether the answer is grounded, whether it covers key facts, and whether it admits insufficient context.

### Teacher question
Did this fail because we could not find material, placed material poorly, the model ignored it, or we did not check correctly? A RAG project review should classify the failure.

### Ref ID
REF-HF-RAG-MILVUS, REF-HF-RAG-ZEPHYR, REF-MS-GENAI-BEGINNERS`,
      ),
      loc(
        'RAG 评估要分开看检索是否命中、prompt 是否清楚、生成是否 grounded。',
        'RAG evaluation separates retrieval hit rate, prompt clarity, and whether generation is grounded.',
      ),
      loc(
        '在右侧 eval 阶段，把一个失败回答归类为 retrieval、prompt、generation 或 evaluation 问题。',
        'Use the eval stage to classify a failed answer as retrieval, prompt, generation, or evaluation problem.',
      ),
    ),
    chapter(
      'rag-is-not-training',
      'modules.llmRag.sections.ragIsNotTraining.title',
      loc(
        `RAG 最容易被误解的一点：它通常不是让模型“学会”新知识，而是在回答时把外部上下文交给模型。

### RAG、fine-tuning、prompt 的区别
- prompt：临时告诉模型任务和格式。
- RAG：先检索外部资料，再把相关上下文放进 prompt。
- fine-tuning：改变模型参数，让它更适应某类任务或风格。

如果公司政策更新，RAG 常常只需要更新文档索引；fine-tuning 则涉及训练数据、训练成本和模型版本管理。

### 项目复盘卡
- 资料源是否可信且最新？
- chunking 是否保留完整事实？
- retrieval 是否召回正确片段？
- answer 是否引用 context？
- 失败样本属于哪一类？

### 下一步路径
回到 Attention/Transformer 章节，你会更理解 LLM 为什么受 context window、attention mask 和 logits 影响；回到模型选择章节，你会更重视评估集和泄漏边界。

### Ref ID
REF-HF-LLM-COURSE、REF-MS-GENAI-BEGINNERS、REF-HF-RAG-MILVUS`,
        `The most common RAG misunderstanding: it usually does not make the model "learn" new knowledge. It gives the model external context at answer time.

### RAG, fine-tuning, and prompts
- Prompt: temporarily tells the model the task and format.
- RAG: retrieves external material first, then places relevant context in the prompt.
- Fine-tuning: changes model parameters to better fit a task or style.

If company policy changes, RAG often updates the document index; fine-tuning involves training data, training cost, and model version management.

### Project review card
- Are sources trustworthy and current?
- Does chunking preserve complete facts?
- Does retrieval recall the right passages?
- Does the answer cite context?
- Which category do failure cases belong to?

### Next path
Return to Attention/Transformer and you will better understand why context window, attention masks, and logits matter. Return to Model Selection and you will care more about evaluation sets and leakage boundaries.

### Ref ID
REF-HF-LLM-COURSE, REF-MS-GENAI-BEGINNERS, REF-HF-RAG-MILVUS`,
      ),
      loc(
        'RAG 不等于把新知识写进参数；它是在回答时提供可检索、可引用的外部上下文。',
        'RAG does not write new knowledge into parameters; it provides retrievable, citable external context at answer time.',
      ),
      loc(
        '在右侧 review 阶段，区分 prompt、RAG 和 fine-tuning 分别改变了系统的哪一部分。',
        'Use the review stage to separate what prompt, RAG, and fine-tuning each change in the system.',
      ),
    ),
  ],
  controls: [],
  presets: [],
  sourceNote: loc(
    '统一资料入口：REF-HF-LLM-COURSE、REF-HF-RAG-MILVUS、REF-HF-RAG-ZEPHYR、REF-MS-GENAI-BEGINNERS。',
    'Centralized references: REF-HF-LLM-COURSE, REF-HF-RAG-MILVUS, REF-HF-RAG-ZEPHYR, REF-MS-GENAI-BEGINNERS.',
  ),
  createDefaultConfig: () => ({
    playbackMs: 900,
  }),
  simulate: simulateLlmRag,
}
