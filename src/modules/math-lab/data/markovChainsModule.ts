import type { LocalizedCopy, MathLabModule, MathLabSection } from '../types/mathLab'

const md = String.raw

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

function section(
  id: string,
  title: LocalizedCopy,
  content: LocalizedCopy,
  placements: Pick<MathLabSection, 'visualIds' | 'labIds'> = {},
): MathLabSection {
  return {
    id,
    level: 2,
    title,
    content,
    ...placements,
  }
}

const sections: MathLabSection[] = [
  section(
    'markov-chains-learning-objectives',
    copy('学习目标', 'Learning Objectives'),
    copy(
      md`学完本章后，应该能把“随机过程”翻译成一个可计算的线性代数对象：

1. 用邻接矩阵表示无向图、有向图和带权有向图。
2. 解释马尔可夫性质：下一步只依赖当前状态，而不是完整历史。
3. 在本章采用的列随机约定下，写出状态更新 $\mathbf{x}_{k+1}=M\mathbf{x}_k$。
4. 读懂稳定分布 $\mathbf{x}^*$ 为什么满足 $M\mathbf{x}^*=\mathbf{x}^*$，并把它连接到特征值 $1$ 的特征向量。
5. 用天气模型和 PageRank 说明转移矩阵如何从具体问题中构造出来。
6. 解释 PageRank 的阻尼因子为什么能处理陷阱、周期和非唯一稳定状态。`,
      md`By the end of this chapter, you should be able to translate a random process into a computable linear-algebra object:

1. Represent undirected, directed, and weighted directed graphs with adjacency matrices.
2. Explain the Markov property: the next step depends on the current state, not the whole history.
3. Under this chapter's column-stochastic convention, write the update $\mathbf{x}_{k+1}=M\mathbf{x}_k$.
4. Read a stationary distribution $\mathbf{x}^*$ as a solution of $M\mathbf{x}^*=\mathbf{x}^*$ and connect it to an eigenvector for eigenvalue $1$.
5. Build transition matrices from concrete settings such as weather prediction and PageRank.
6. Explain why PageRank damping handles traps, cycles, and non-unique steady states.`,
    ),
  ),
  section(
    'markov-chains-graphs-as-matrices',
    copy('从图到邻接矩阵', 'From Graphs to Adjacency Matrices'),
    copy(
      md`图由节点和边组成。矩阵表示的价值在于：一旦边关系进入矩阵，后面的“走一步”“传播一次”“把影响重新分配”都可以写成矩阵乘法。

无向图的邻接矩阵通常是对称的，因为节点 $i$ 和节点 $j$ 相连时，两个方向都成立：

$$
a_{ij}=
\begin{cases}
1,&\text{if nodes }i\text{ and }j\text{ are connected},\\
0,&\text{otherwise}.
\end{cases}
$$

![无向图示例](/math-lab/cs357-assets/figs/undirected_graph.png)

有向图要更小心。本章采用“列表示来源、行表示去向”的约定：$a_{ij}=1$ 表示从节点 $j$ 指向节点 $i$。这样第 $j$ 列描述从节点 $j$ 出发能流向哪里：

$$
a_{ij}=
\begin{cases}
1,&\text{if node }j\to\text{node }i,\\
0,&\text{otherwise}.
\end{cases}
$$

![有向图示例](/math-lab/cs357-assets/figs/directed_graph.png)

带权有向图把 $1$ 换成权重 $w_{ij}$：

$$
a_{ij}=
\begin{cases}
w_{ij},&\text{if node }j\to\text{node }i,\\
0,&\text{otherwise}.
\end{cases}
$$

![带权有向图示例](/math-lab/cs357-assets/figs/weighted_directed_graph.png)

如果这些权重表示概率，那么每个来源节点的所有出边概率应该加起来等于 $1$。在本章的列约定下，这意味着每一列求和为 $1$。这一步就是从普通带权图走向马尔可夫转移矩阵的关键。`,
      md`A graph consists of nodes and edges. The value of a matrix representation is that once edge relationships enter a matrix, operations such as "take one step," "propagate once," and "redistribute influence" become matrix multiplication.

For an undirected graph, the adjacency matrix is usually symmetric because a connection between node $i$ and node $j$ works in both directions:

$$
a_{ij}=
\begin{cases}
1,&\text{if nodes }i\text{ and }j\text{ are connected},\\
0,&\text{otherwise}.
\end{cases}
$$

![Undirected graph example](/math-lab/cs357-assets/figs/undirected_graph.png)

Directed graphs require a convention. In this chapter, columns represent source nodes and rows represent destination nodes: $a_{ij}=1$ means node $j$ points to node $i$. Column $j$ therefore describes where probability or influence can move when it starts at node $j$:

$$
a_{ij}=
\begin{cases}
1,&\text{if node }j\to\text{node }i,\\
0,&\text{otherwise}.
\end{cases}
$$

![Directed graph example](/math-lab/cs357-assets/figs/directed_graph.png)

A weighted directed graph replaces $1$ with a weight $w_{ij}$:

$$
a_{ij}=
\begin{cases}
w_{ij},&\text{if node }j\to\text{node }i,\\
0,&\text{otherwise}.
\end{cases}
$$

![Weighted directed graph example](/math-lab/cs357-assets/figs/weighted_directed_graph.png)

If those weights are probabilities, then all outgoing probabilities from one source node should add to $1$. Under the column convention used here, that means every column sums to $1$. That is the key step from a weighted graph to a Markov transition matrix.`,
    ),
  ),
  section(
    'markov-chains-property-and-matrix',
    copy('马尔可夫性质与转移矩阵', 'The Markov Property and Transition Matrices'),
    copy(
      md`马尔可夫链是一类随机模型：未来的下一步只依赖当前状态。它不说历史完全无用，而是在建模时把“足够解释下一步的信息”压缩到当前状态里。

形式上，如果 $X_n$ 表示第 $n$ 步的状态，马尔可夫性质写作

$$
P(X_{n+1}=x_{n+1}\mid X_0=x_0,\ldots,X_n=x_n)
=
P(X_{n+1}=x_{n+1}\mid X_n=x_n).
$$

如果状态数量有限，就可以用一个方阵 $M$ 描述所有一步转移概率。本章采用左乘状态列向量的写法：

$$
\mathbf{x}_{k+1}=M\mathbf{x}_k.
$$

这里 $\mathbf{x}_k$ 是第 $k$ 步的概率分布，元素非负并且和为 $1$。矩阵 $M$ 的第 $j$ 列表示“当前在状态 $j$ 时，下一步去各状态的概率”。因此 $M$ 应满足

$$
m_{ij}\ge 0,\qquad \sum_i m_{ij}=1.
$$

有些资料使用行随机矩阵，把分布写成行向量，并用 $\mathbf{x}_{k+1}^{\top}=\mathbf{x}_k^{\top}M$。两种写法都可以，但不能在同一个推导里混用。检查行和或列和，是排查马尔可夫链代码错误的第一步。`,
      md`A Markov chain is a stochastic model in which the next future state depends only on the current state. It does not claim that history is useless; rather, the model compresses the information needed for the next step into the current state.

Formally, if $X_n$ is the state at step $n$, the Markov property is

$$
P(X_{n+1}=x_{n+1}\mid X_0=x_0,\ldots,X_n=x_n)
=
P(X_{n+1}=x_{n+1}\mid X_n=x_n).
$$

With finitely many states, a square matrix $M$ can store all one-step transition probabilities. This chapter uses a left-multiplication convention with state column vectors:

$$
\mathbf{x}_{k+1}=M\mathbf{x}_k.
$$

Here $\mathbf{x}_k$ is the probability distribution at step $k$; its entries are nonnegative and sum to $1$. Column $j$ of $M$ means "if the current state is $j$, these are the probabilities of each next state." Therefore $M$ should satisfy

$$
m_{ij}\ge 0,\qquad \sum_i m_{ij}=1.
$$

Some resources use row-stochastic matrices, write distributions as row vectors, and update by $\mathbf{x}_{k+1}^{\top}=\mathbf{x}_k^{\top}M$. Both conventions are valid, but they must not be mixed inside one derivation. Checking row sums or column sums is the first debugging step for Markov-chain code.`,
    ),
  ),
  section(
    'markov-chains-weather-example',
    copy('天气例题：一步更新与多步预测', 'Weather Example: One-Step Updates and Multi-Step Prediction'),
    copy(
      md`考虑三个天气状态：晴、雨、阴。观察到的转移规则如下：

- 晴天之后，下一天仍晴的概率是 $0.6$，下雨概率是 $0.1$，阴天概率是 $0.3$。
- 雨天之后，下一天晴的概率是 $0.2$，仍雨的概率是 $0.4$，阴天概率是 $0.4$。
- 阴天之后，下一天晴的概率是 $0.3$，下雨概率是 $0.3$，仍阴的概率是 $0.4$。

![天气状态转移图](/math-lab/cs357-assets/figs/weather.png)

按照“列表示当前状态、行表示下一状态”的约定，转移矩阵是

$$
M=
\begin{bmatrix}
0.6&0.2&0.3\\
0.1&0.4&0.3\\
0.3&0.4&0.4
\end{bmatrix}.
$$

每一列都加到 $1$。如果第 $0$ 天已知为雨天，则

$$
\mathbf{x}_0=
\begin{bmatrix}
0\\
1\\
0
\end{bmatrix}.
$$

一步更新就是取矩阵的“雨天列”：

$$
\mathbf{x}_1=M\mathbf{x}_0=
\begin{bmatrix}
0.2\\
0.4\\
0.4
\end{bmatrix}.
$$

也就是说，明天晴、雨、阴的概率分别是 $0.2,0.4,0.4$。多步预测不需要重新推导，只要继续乘同一个矩阵：

$$
\mathbf{x}_n=M^n\mathbf{x}_0.
$$

这个例子也说明了建模边界：如果季节、气压或更早天气会显著改变下一天概率，而当前状态没有包含这些信息，那么这个三状态马尔可夫模型就会偏粗糙。解决方式不是否定马尔可夫链，而是重新定义状态，例如把“晴且高湿度”作为一个更细状态。`,
      md`Consider three weather states: sunny, rainy, and cloudy. The observed transition rules are:

- After a sunny day, the next day is sunny with probability $0.6$, rainy with probability $0.1$, and cloudy with probability $0.3$.
- After a rainy day, the next day is sunny with probability $0.2$, rainy with probability $0.4$, and cloudy with probability $0.4$.
- After a cloudy day, the next day is sunny with probability $0.3$, rainy with probability $0.3$, and cloudy with probability $0.4$.

![Weather state transition diagram](/math-lab/cs357-assets/figs/weather.png)

Using the convention that columns are current states and rows are next states, the transition matrix is

$$
M=
\begin{bmatrix}
0.6&0.2&0.3\\
0.1&0.4&0.3\\
0.3&0.4&0.4
\end{bmatrix}.
$$

Every column sums to $1$. If day $0$ is known to be rainy, then

$$
\mathbf{x}_0=
\begin{bmatrix}
0\\
1\\
0
\end{bmatrix}.
$$

The one-step update simply selects the rainy column of the matrix:

$$
\mathbf{x}_1=M\mathbf{x}_0=
\begin{bmatrix}
0.2\\
0.4\\
0.4
\end{bmatrix}.
$$

So tomorrow's probabilities for sunny, rainy, and cloudy are $0.2,0.4,0.4$. Multi-step prediction needs no new derivation; keep multiplying by the same matrix:

$$
\mathbf{x}_n=M^n\mathbf{x}_0.
$$

This example also shows the modeling boundary. If season, pressure, or older weather materially changes tomorrow's probabilities, and the current state does not include that information, then this three-state Markov model is too coarse. The fix is not to abandon Markov chains, but to redefine the state, for example by using "sunny and humid" as a more detailed state.`,
    ),
  ),
  section(
    'markov-chains-stationary-distribution',
    copy('稳定分布就是特征值 1 的方向', 'A Stationary Distribution Is the Eigenvalue-1 Direction'),
    copy(
      md`如果一个概率分布经过一次转移后不再改变，就称为稳定分布：

$$
M\mathbf{x}^*=\mathbf{x}^*.
$$

这正是特征值 $\lambda=1$ 的特征向量方程。由于 $\mathbf{x}^*$ 还必须是概率向量，所以最后要把非负特征向量归一化，让元素和为 $1$。

为什么反复乘 $M$ 常常会靠近稳定分布？从特征向量视角看，矩阵不断作用后，其他特征方向会被衰减或振荡掉，$\lambda=1$ 对应的概率方向留下来。这和幂迭代很接近：反复应用矩阵，让主导方向显现。

不过，稳定分布并不自动唯一，也不自动与初始状态无关。常见失败场景包括：

| 场景 | 会发生什么 |
| --- | --- |
| 图被分成互不连通的闭合类 | 初始落在哪个类会决定长期分布 |
| 存在周期性来回跳转 | 分布可能振荡，而不是逐步稳定 |
| 有“陷阱”节点或悬挂节点 | 概率质量可能被吸走或无法按原规则继续 |

PageRank 的随机跳转就是为了解决这些问题：它让每个状态都有一小部分概率跳到任意状态，从而破坏陷阱和周期，让稳定分布更容易唯一。`,
      md`If a probability distribution remains unchanged after one transition, it is called a stationary distribution:

$$
M\mathbf{x}^*=\mathbf{x}^*.
$$

This is exactly the eigenvector equation for eigenvalue $\lambda=1$. Because $\mathbf{x}^*$ must also be a probability vector, the nonnegative eigenvector must be normalized so its entries sum to $1$.

Why does repeated multiplication by $M$ often approach a stationary distribution? From the eigenvector view, repeated application of the matrix damps or oscillates away other directions while the probability direction for $\lambda=1$ remains. This is close to power iteration: keep applying a matrix until the dominant direction becomes visible.

However, a stationary distribution is not automatically unique, and it is not automatically independent of the initial state. Common failure modes include:

| Situation | What can happen |
| --- | --- |
| The graph splits into closed disconnected classes | The long-run distribution depends on where the initial state starts |
| There is a periodic back-and-forth pattern | The distribution can oscillate instead of settling |
| There are trap nodes or dangling nodes | Probability mass can be absorbed or fail to follow the original rule |

PageRank's random jump is designed to address these problems. It gives every state a small probability of jumping to any state, breaking traps and cycles and making a unique stationary distribution easier to obtain.`,
    ),
  ),
  section(
    'markov-chains-pagerank',
    copy('PageRank：把网页重要性读成稳定概率', 'PageRank: Reading Importance as Stationary Probability'),
    copy(
      md`PageRank 把网页看成图中的节点，把链接看成有向边。随机浏览者在当前页上随机点击一个外链；如果某个网页经常被重要网页链接到，那么长期随机游走落在它上面的概率就会更高。

![PageRank 图示例](/math-lab/cs357-assets/figs/page_rank.png)

先写邻接矩阵。仍采用“列是来源网页、行是目标网页”的约定：

$$
A=
\begin{bmatrix}
0&0&0&1&0&1\\
1&0&0&0&0&0\\
0&1&0&0&0&0\\
0&1&1&0&0&0\\
0&0&1&0&0&0\\
1&0&1&0&1&0
\end{bmatrix}.
$$

接着把每一列按出链数量归一化。假设一个网页有 $r$ 条出链，那么它会把当前概率均分到这 $r$ 条链接上。这样得到列随机矩阵：

$$
S=
\begin{bmatrix}
0&0&0&1.0&0&1.0\\
0.5&0&0&0&0&0\\
0&0.5&0&0&0&0\\
0&0.5&0.33&0&0&0\\
0&0&0.33&0&0&0\\
0.5&0&0.33&0&1.0&0
\end{bmatrix}.
$$

朴素做法是不断迭代 $\mathbf{x}_{k+1}=S\mathbf{x}_k$，直到分布稳定。但真实网页图会有陷阱、悬挂页和断开的子图，所以 PageRank 引入阻尼因子 $d$：

$$
G=dS+\frac{1-d}{n}\mathbf{1}\mathbf{1}^{\top}.
$$

这里 $n$ 是网页数。浏览者以概率 $d$ 沿链接走，以概率 $1-d$ 随机跳到任意网页。常见取值 $d\approx0.85$。这个随机跳转项让 $G$ 的每个元素都为正，也让稳定分布更容易唯一。

下面的实验台使用同一个网页图。调节 $d$、初始网页和迭代次数，观察概率质量如何从一个初始页扩散，并逐步接近稳定排名。`,
      md`PageRank treats web pages as graph nodes and hyperlinks as directed edges. A random surfer repeatedly clicks an outgoing link from the current page. If a page is often linked by important pages, the long-run probability of landing on it becomes larger.

![PageRank graph example](/math-lab/cs357-assets/figs/page_rank.png)

First write the adjacency matrix, still using the convention that columns are source pages and rows are destination pages:

$$
A=
\begin{bmatrix}
0&0&0&1&0&1\\
1&0&0&0&0&0\\
0&1&0&0&0&0\\
0&1&1&0&0&0\\
0&0&1&0&0&0\\
1&0&1&0&1&0
\end{bmatrix}.
$$

Next normalize each column by the number of outgoing links. If a page has $r$ outgoing links, it redistributes its current probability evenly across those $r$ links. This gives a column-stochastic matrix:

$$
S=
\begin{bmatrix}
0&0&0&1.0&0&1.0\\
0.5&0&0&0&0&0\\
0&0.5&0&0&0&0\\
0&0.5&0.33&0&0&0\\
0&0&0.33&0&0&0\\
0.5&0&0.33&0&1.0&0
\end{bmatrix}.
$$

The naive approach repeatedly applies $\mathbf{x}_{k+1}=S\mathbf{x}_k$ until the distribution settles. Real web graphs contain traps, dangling pages, and disconnected components, so PageRank introduces a damping factor $d$:

$$
G=dS+\frac{1-d}{n}\mathbf{1}\mathbf{1}^{\top}.
$$

Here $n$ is the number of pages. The surfer follows a link with probability $d$ and jumps to a random page with probability $1-d$. A common choice is $d\approx0.85$. The random-jump term makes every entry of $G$ positive and makes a unique stationary distribution easier to guarantee.

The lab below uses the same page graph. Adjust $d$, the initial page, and the iteration count to watch probability mass spread from one page and approach the stationary ranking.`,
    ),
    { labIds: ['markov-chain-pagerank-lab'] },
  ),
  section(
    'markov-chains-ml-connection',
    copy('机器学习里的转移思想', 'Transition Thinking in Machine Learning'),
    copy(
      md`马尔可夫链在机器学习和数值计算里不是孤立主题，它提供了一种“状态 + 转移 + 长期行为”的建模语言。

**强化学习。** 马尔可夫决策过程（MDP）把环境写成状态、动作、转移概率和奖励。策略评估中的 Bellman 更新，本质上也在反复传播未来价值。

**图学习与推荐。** PageRank 是最直接的例子。图神经网络里的 message passing 也常常可以被读成沿边传播特征，只是传播的不是概率质量，而是向量表示。

**语言和序列模型。** 简单 n-gram 模型近似地把“当前上下文”当作状态，并预测下一个 token。现代 Transformer 不再是简单马尔可夫链，但“用当前表示总结历史并预测下一步”的思想仍然相通。

**MCMC 和 Bayesian 推断。** 马尔可夫链 Monte Carlo 设计一个转移过程，使其稳定分布等于目标后验分布。我们不直接计算高维积分，而是让链在目标分布上游走并收集样本。

**数值谱方法。** 稳定分布是特征值 $1$ 的特征向量。理解这一点后，PageRank、随机游走图嵌入和某些归一化图算子都可以放在同一套谱方法语言下理解。`,
      md`Markov chains are not isolated from machine learning and numerical computing. They provide a modeling language of "state + transition + long-run behavior."

**Reinforcement learning.** A Markov decision process (MDP) represents an environment with states, actions, transition probabilities, and rewards. Bellman updates in policy evaluation repeatedly propagate future value.

**Graph learning and recommendation.** PageRank is the direct example. Message passing in graph neural networks can also be read as propagation along edges, although the propagated object is a vector representation rather than probability mass.

**Language and sequence models.** A simple n-gram model approximately treats the current context as the state and predicts the next token. Modern Transformers are not simple Markov chains, but they still rely on a current representation summarizing history for next-step prediction.

**MCMC and Bayesian inference.** Markov chain Monte Carlo designs a transition process whose stationary distribution is the desired posterior. Instead of directly computing a high-dimensional integral, the chain walks through the target distribution and collects samples.

**Numerical spectral methods.** A stationary distribution is an eigenvector for eigenvalue $1$. With that view, PageRank, random-walk graph embeddings, and some normalized graph operators can be understood through the same spectral-method language.`,
    ),
  ),
  section(
    'markov-chains-review-questions',
    copy('复习问题', 'Review Questions'),
    copy(
      md`1. 无向图、有向图和带权有向图的邻接矩阵有什么区别？
2. 在本章列随机约定下，$a_{ij}$ 表示从哪个节点到哪个节点？
3. 马尔可夫性质为什么不是“完全没有历史”，而是“状态已经总结了建模所需历史”？
4. 为什么转移矩阵的每一列应该求和为 $1$？
5. 已知第 $0$ 天为雨天，如何用天气矩阵算出第 $1$ 天分布？
6. 稳定分布为什么满足 $M\mathbf{x}^*=\mathbf{x}^*$？
7. 为什么稳定分布可以看成特征值 $1$ 的特征向量？
8. 什么情况会导致稳定分布不唯一或迭代不收敛？
9. PageRank 如何把网页链接图变成转移矩阵？
10. 阻尼因子 $d$ 的随机跳转项解决了哪些图结构问题？
11. 在强化学习、图学习或 MCMC 中，状态、转移和长期行为分别对应什么？`,
      md`1. How do adjacency matrices differ for undirected, directed, and weighted directed graphs?
2. Under this chapter's column-stochastic convention, what direction does $a_{ij}$ represent?
3. Why does the Markov property mean "the state summarizes the needed history" rather than "history never matters"?
4. Why should every column of a transition matrix sum to $1$?
5. Given that day $0$ is rainy, how do you compute the day $1$ distribution with the weather matrix?
6. Why does a stationary distribution satisfy $M\mathbf{x}^*=\mathbf{x}^*$?
7. Why can a stationary distribution be viewed as an eigenvector for eigenvalue $1$?
8. What situations can make the stationary distribution non-unique or make iteration fail to converge?
9. How does PageRank turn a web-link graph into a transition matrix?
10. What graph-structure problems are addressed by the random-jump term controlled by damping factor $d$?
11. In reinforcement learning, graph learning, or MCMC, what are the state, transition, and long-run behavior?`,
    ),
  ),
]

export function buildMarkovChainsModule(importedModule: MathLabModule): MathLabModule {
  return {
    ...importedModule,
    enhancementTier: 'interactive',
    title: copy('马尔可夫链', 'Markov chains'),
    subtitle: copy(
      '把随机游走、天气预测和 PageRank 统一为转移矩阵与稳定分布问题。',
      'Unify random walks, weather prediction, and PageRank as transition-matrix and stationary-distribution problems.',
    ),
    estimatedMinutes: 42,
    prerequisites: ['monte-carlo', 'eigenvalues-eigenvectors'],
    aiModelConnections: [
      copy(
        'PageRank、图随机游走、强化学习的 MDP 和 MCMC 都依赖“状态通过转移规则演化”的思想。',
        'PageRank, graph random walks, reinforcement-learning MDPs, and MCMC all rely on states evolving through transition rules.',
      ),
      copy(
        '稳定分布把概率模型连接到特征值问题，因此也连接到幂迭代和谱方法。',
        'Stationary distributions connect probability models to eigenvalue problems, and therefore to power iteration and spectral methods.',
      ),
    ],
    learningObjectives: [
      copy('用邻接矩阵表示无向、有向和带权有向图。', 'Represent undirected, directed, and weighted directed graphs with adjacency matrices.'),
      copy('解释马尔可夫性质和状态向量的一步更新。', 'Explain the Markov property and one-step updates of a state vector.'),
      copy('检查转移矩阵的列随机条件，并避免行列约定混用。', 'Check the column-stochastic condition and avoid mixing row and column conventions.'),
      copy('把稳定分布连接到特征值 $1$ 的特征向量。', 'Connect stationary distributions to eigenvectors for eigenvalue $1$.'),
      copy('说明 PageRank 阻尼因子如何保证随机游走更稳定。', 'Explain how PageRank damping makes random walks more stable.'),
    ],
    concepts: [
      {
        id: 'markov-property-core',
        name: copy('马尔可夫性质', 'Markov Property'),
        formulaLatex:
          'P(X_{n+1}=x_{n+1}\\mid X_0=x_0,\\ldots,X_n=x_n)=P(X_{n+1}=x_{n+1}\\mid X_n=x_n)',
        variables: [
          {
            symbol: 'X_n',
            description: copy('第 n 步的随机状态。', 'The random state at step n.'),
          },
          {
            symbol: 'x_n',
            description: copy('某个具体状态取值。', 'A specific state value.'),
          },
        ],
        plainExplanation: copy(
          '下一步只看当前状态；如果历史重要，就应该把相关历史并入当前状态定义。',
          'The next step reads only the current state; if history matters, the relevant history should be folded into the state definition.',
        ),
        geometricIntuition: copy(
          '状态像概率质量所在的位置，转移规则只需要知道质量当前在哪里。',
          'A state is where probability mass currently sits, and the transition rule only needs that current location.',
        ),
        numericalExample: copy(
          md`若当前是雨天，下一天分布直接取天气矩阵的雨天列：\([0.2,0.4,0.4]^\top\)。`,
          md`If the current state is rainy, the next-day distribution is the rainy column of the weather matrix: \([0.2,0.4,0.4]^\top\).`,
        ),
        codeExample:
          'import numpy as np\n\nM = np.array([[0.6, 0.2, 0.3],\n              [0.1, 0.4, 0.3],\n              [0.3, 0.4, 0.4]])\nx = np.array([0.0, 1.0, 0.0])\nprint(M @ x)',
        modelConnection: copy(
          '强化学习里的 MDP 用当前状态和动作决定下一步分布；这正是马尔可夫建模语言。',
          'An MDP in reinforcement learning uses the current state and action to determine the next-state distribution; this is Markov modeling language.',
        ),
      },
      {
        id: 'markov-transition-matrix-core',
        name: copy('列随机转移矩阵', 'Column-Stochastic Transition Matrix'),
        formulaLatex: '\\mathbf{x}_{k+1}=M\\mathbf{x}_k,\\qquad \\sum_i m_{ij}=1',
        variables: [
          {
            symbol: 'M',
            description: copy('每一列保存从一个当前状态流向各下一状态的概率。', 'Each column stores probabilities flowing from one current state to all next states.'),
          },
          {
            symbol: '\\mathbf{x}_k',
            description: copy('第 k 步的状态分布，元素非负且总和为 1。', 'The state distribution at step k, with nonnegative entries summing to 1.'),
          },
        ],
        plainExplanation: copy(
          '矩阵乘法把当前概率质量按列重新分配；列和为 1 保证概率总量不丢失。',
          'Matrix multiplication redistributes current probability mass by columns; column sums of 1 preserve total probability.',
        ),
        geometricIntuition: copy(
          '每一列像一个分流器：当前状态的概率质量被拆成若干份，流向下一步各状态。',
          'Each column acts like a splitter: probability mass at the current state is divided and sent to next states.',
        ),
        numericalExample: copy(
          md`天气矩阵三列分别对应“从晴出发”“从雨出发”“从阴出发”，每列都加到 \(1\)。`,
          md`The three weather columns mean "from sunny," "from rainy," and "from cloudy," and each column sums to \(1\).`,
        ),
        modelConnection: copy(
          '图随机游走、网页排名和某些推荐系统传播步骤都可以写成转移矩阵乘状态向量。',
          'Graph random walks, web ranking, and some recommender propagation steps can be written as a transition matrix times a state vector.',
        ),
      },
      {
        id: 'markov-stationary-pagerank-core',
        name: copy('稳定分布与 PageRank 阻尼', 'Stationary Distribution and PageRank Damping'),
        formulaLatex: 'G=dS+\\frac{1-d}{n}\\mathbf{1}\\mathbf{1}^{\\top},\\qquad G\\mathbf{x}^*=\\mathbf{x}^*',
        variables: [
          {
            symbol: 'S',
            description: copy('由链接图归一化得到的列随机矩阵。', 'The column-stochastic matrix obtained by normalizing the link graph.'),
          },
          {
            symbol: 'd',
            description: copy('沿链接继续浏览的概率，通常接近 0.85。', 'The probability of continuing to follow links, often near 0.85.'),
          },
          {
            symbol: '\\mathbf{x}^*',
            description: copy('长期随机游走达到的稳定排名分布。', 'The stationary ranking distribution reached by the long-run random walk.'),
          },
        ],
        plainExplanation: copy(
          'PageRank 用少量随机跳转修补网页图中的陷阱，让长期访问概率成为稳定的重要性分数。',
          'PageRank repairs traps in a web graph with small random jumps, turning long-run visit probability into an importance score.',
        ),
        geometricIntuition: copy(
          '阻尼像给图加上一层细雾：大部分质量沿链接流动，少量质量能跳到任意位置。',
          'Damping adds a light mist over the graph: most mass follows links, while a little can jump anywhere.',
        ),
        numericalExample: copy(
          md`当 \(d=0.85\) 且 \(n=6\) 时，每一步至少有 \((1-d)/n=0.025\) 的概率质量分配到每个网页方向。`,
          md`With \(d=0.85\) and \(n=6\), each step assigns at least \((1-d)/n=0.025\) probability toward every page direction.`,
        ),
        modelConnection: copy(
          '图排序、随机游走 embedding 和 MCMC 都关心“什么转移规则会产生想要的长期分布”。',
          'Graph ranking, random-walk embeddings, and MCMC all ask which transition rule produces the desired long-run distribution.',
        ),
      },
    ],
    sections,
    toc: sections.map((item) => ({
      id: item.id,
      level: item.level,
      title: item.title,
    })),
    visuals: [],
    labs: [
      {
        id: 'markov-chain-pagerank-lab',
        title: copy('PageRank 随机游走实验', 'PageRank Random-Walk Lab'),
        type: 'interactive-visual',
        componentName: 'MarkovChainLab',
        successCriteria: [
          copy(
            md`能解释 \(\mathbf{x}_{k+1}=G\mathbf{x}_k\) 中 \(G\) 如何重分配当前网页概率。`,
            md`Explain how \(G\) redistributes the current page probabilities in \(\mathbf{x}_{k+1}=G\mathbf{x}_k\).`,
          ),
          copy(
            md`能说明阻尼因子 \(d\) 变小时，随机跳转如何让排名更均匀。`,
            md`Explain how lower damping \(d\) makes ranks flatter through random jumps.`,
          ),
          copy(
            md`能用稳定残差或距稳定分布的距离判断迭代是否接近 \(\mathbf{x}^*\)。`,
            md`Use the stationary residual or distance to stationarity to judge whether iteration is close to \(\mathbf{x}^*\).`,
          ),
        ],
      },
    ],
    quizzes: [
      {
        id: 'markov-column-stochastic',
        type: 'single-choice',
        prompt: copy(
          '本章采用列向量状态和左乘矩阵时，合法转移矩阵应满足什么条件？',
          'With column-vector states and left multiplication, what condition should a valid transition matrix satisfy?',
        ),
        choices: [
          {
            id: 'columns',
            label: copy('每一列非负且求和为 1。', 'Every column is nonnegative and sums to 1.'),
          },
          {
            id: 'diagonal',
            label: copy('只有对角线元素可以非零。', 'Only diagonal entries may be nonzero.'),
          },
          {
            id: 'symmetric',
            label: copy('矩阵必须对称。', 'The matrix must be symmetric.'),
          },
        ],
        answer: 'columns',
        explanation: copy(
          md`第 \(j\) 列表示从当前状态 \(j\) 出发到所有下一状态的概率，所以这一列必须构成一个概率分布。`,
          md`Column \(j\) contains probabilities from current state \(j\) to all next states, so that column must be a probability distribution.`,
        ),
        misconceptionTags: ['markov-row-column-convention'],
      },
      {
        id: 'markov-weather-one-step',
        type: 'single-choice',
        prompt: copy(
          md`天气矩阵中，若今天是雨天，\(\mathbf{x}_0=[0,1,0]^\top\)，明天分布是哪一个？`,
          md`In the weather matrix, if today is rainy and \(\mathbf{x}_0=[0,1,0]^\top\), what is tomorrow's distribution?`,
        ),
        choices: [
          {
            id: 'rainy-column',
            label: copy(md`\([0.2,0.4,0.4]^\top\)`, md`\([0.2,0.4,0.4]^\top\)`),
          },
          {
            id: 'rainy-row',
            label: copy(md`\([0.1,0.4,0.3]^\top\)`, md`\([0.1,0.4,0.3]^\top\)`),
          },
          {
            id: 'uniform',
            label: copy(md`\([1/3,1/3,1/3]^\top\)`, md`\([1/3,1/3,1/3]^\top\)`),
          },
        ],
        answer: 'rainy-column',
        explanation: copy(
          md`左乘列向量时，\(\mathbf{x}_0\) 选中矩阵的第 2 列，也就是“从雨天出发”的转移概率。`,
          md`With left multiplication on a column vector, \(\mathbf{x}_0\) selects the second column, the transition probabilities from rainy weather.`,
        ),
        misconceptionTags: ['markov-row-column-convention'],
      },
      {
        id: 'markov-pagerank-damping',
        type: 'single-choice',
        prompt: copy(
          'PageRank 为什么要加入随机跳转项？',
          'Why does PageRank add a random-jump term?',
        ),
        choices: [
          {
            id: 'damping',
            label: copy('减少陷阱和周期问题，使稳定排名更可靠。', 'To reduce traps and periodic behavior so the stationary ranking is more reliable.'),
          },
          {
            id: 'remove-links',
            label: copy('删除所有网页链接，只保留均匀分布。', 'To delete all links and keep only a uniform distribution.'),
          },
          {
            id: 'make-symmetric',
            label: copy('强制邻接矩阵变成对称矩阵。', 'To force the adjacency matrix to be symmetric.'),
          },
        ],
        answer: 'damping',
        explanation: copy(
          md`\(G=dS+\frac{1-d}{n}\mathbf{1}\mathbf{1}^{\top}\) 保留了链接结构，同时给任意跳转留出概率。`,
          md`\(G=dS+\frac{1-d}{n}\mathbf{1}\mathbf{1}^{\top}\) keeps link structure while leaving probability for jumps to any page.`,
        ),
        misconceptionTags: ['markov-pagerank-naive'],
        revisitVisualId: 'markov-chain-pagerank-lab',
      },
    ],
    misconceptions: [
      {
        id: 'markov-no-structure',
        statement: copy('马尔可夫链表示完全没有结构的随机。', 'A Markov chain means randomness with no structure.'),
        correction: copy(
          '马尔可夫链有明确的转移结构；它只是假设下一步所需的信息已经包含在当前状态里。',
          'A Markov chain has explicit transition structure; it only assumes the information needed for the next step is contained in the current state.',
        ),
        example: copy(
          md`PageRank 不是随便跳网页，而是大部分概率沿链接矩阵 \(S\) 流动，少量概率随机跳转。`,
          md`PageRank does not jump arbitrarily all the time; most probability follows the link matrix \(S\), while a small amount jumps randomly.`,
        ),
      },
      {
        id: 'markov-row-column-convention',
        statement: copy('行随机和列随机约定可以在同一个推导里随便混用。', 'Row-stochastic and column-stochastic conventions can be mixed freely in one derivation.'),
        correction: copy(
          '必须固定状态向量方向和乘法方向；本章用列向量和左乘矩阵，因此检查列和为 1。',
          'You must fix the state-vector orientation and multiplication direction; this chapter uses column vectors and left multiplication, so columns must sum to 1.',
        ),
        example: copy(
          md`天气例题从雨天出发时，要取矩阵的雨天列 \([0.2,0.4,0.4]^\top\)，不是雨天所在行。`,
          md`In the weather example, starting from rainy weather selects the rainy column \([0.2,0.4,0.4]^\top\), not the rainy row.`,
        ),
      },
      {
        id: 'markov-pagerank-naive',
        statement: copy('只要不断乘邻接矩阵，PageRank 一定会得到唯一排名。', 'Repeatedly multiplying the adjacency matrix always gives a unique PageRank.'),
        correction: copy(
          '需要先把邻接矩阵归一化为转移矩阵；还要处理陷阱、悬挂页和周期，阻尼项就是为此加入的。',
          'The adjacency matrix must first be normalized into a transition matrix; traps, dangling pages, and cycles also need handling, which is why damping is added.',
        ),
        example: copy(
          md`如果某个网页没有出链，朴素随机游走无法按链接继续；随机跳转项给所有网页都补上一条小概率通道。`,
          md`If a page has no outgoing links, a naive random walk cannot continue by links; the random-jump term adds a small probability channel to every page.`,
        ),
      },
    ],
  }
}
