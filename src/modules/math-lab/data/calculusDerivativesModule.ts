import type { LocalizedCopy, MathLabModule, MathLabSection } from '../types/mathLab.ts'

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

// Final lesson body. Maintain here; historical enhancers do not apply.
const sections: MathLabSection[] = [
  {
    id: "derivatives-opening",
    level: 2,
    title: copy("1. 开场：误差曲线此刻朝哪边走？", "1. Opening: Which Way Does Error Move Here?"),
    content: copy(`当前参数 $w=[4,-1],b=5$ 给出预测 \`[10,5]\`、目标 \`[9,7]\`、$L=2.5$。若把 $w_2$ 从 -1 改为 -0.99，损失上升还是下降？变化大约多少？枚举几个候选值只能看粗略趋势，导数要回答“就在当前点附近”的方向和敏感程度。

先区分两个问题：导数描述局部变化；梯度下降还要选择学习率、更新方向并重复迭代。能量温不等于已经调好空调，能估计斜率也不等于已经训练模型。`, "The verified batch has MSE 2.5, but that single value does not say how loss changes near the current parameters. The opening question asks: if one parameter moves slightly while X, targets, and all other parameters stay fixed, does loss rise, fall, or stay locally flat? We will compare symmetric nearby evaluations rather than update the model. A central-difference estimate is a measurement of local sensitivity; it is **not gradient descent**. The lesson connects average change, derivatives, partial derivatives, finite-step failure, and a separate motion example. Exercises are formative and not graded."),
  },
  {
    id: "derivatives-recap",
    level: 2,
    title: copy("2. 回顾：平均变化率、MSE 与控制变量", "2. Recap: Average Change, MSE, and Controlled Variables"),
    content: copy(`从 $a$ 到 $a+h$ 的平均变化率是 $[f(a+h)-f(a)]/h$。$h$ 越小，割线越接近当前点的切线，但浮点数中不能无限缩小。

主线损失为

$$L=\\frac12[(\\hat y_1-y_1)^2+(\\hat y_2-y_2)^2].$$

研究一个参数时，固定 $X,y$ 与其他参数。否则无法把损失变化归因给命名因素。`, "Average rate compares two separated points: [F(theta+h)-F(theta)]/h. MSE summarizes residual squares for the fixed batch. A controlled experiment changes one factor while fixing the rest. Derivatives combine these ideas by shrinking a local observation window. The current prediction chain remains x,w,b -> y_hat, followed by y_hat,y -> L. A derivative does not feed target into prediction; it repeatedly evaluates the same valid loss function at neighboring parameter values."),
  },
  {
    id: "derivatives-shared-task",
    level: 2,
    title: copy("3. 主线连接：从 x,w,b 到 y_hat,y,L", "3. Shared Task: From x,w,b to y_hat,y,L"),
    content: copy(`核心词汇不变：单行是 \`x\`，整批是 \`X\`，参数是 \`w,b\`，预测是 \`y_hat\`，目标是 \`y\`，误差是 \`L\`。中央差分纯文本合同为：

\`\`\`text
central_difference = (L(theta + h) - L(theta - h)) / (2h)
\`\`\`

$\\theta$ 只代表当前被探测的一个标量参数。例如探测 $w_2$ 时，$w_1=4,b=5$ 保持不变。先分别完成两次前向计算，再相减除以 $2h$；目标始终不进入预测。`, "Define $L(w,b)=\\operatorname{MSE}(Xw+b,y)$ for fixed X and y. At w=[4,-1], b=5, predictions are [10,5] and L=2.5. To probe $w_1$, make a copied parameter vector, change only coordinate 0, recompute predictions and loss, and restore the baseline for every evaluation. Repeat independently for $w_2$ and b. The local sensitivities are approximately [0,-5] for w and -1 for b. These numbers describe slope at the current state; they are not new weights and do not by themselves choose a step size."),
  },
  {
    id: "derivatives-intuition",
    level: 2,
    title: copy("4. 直觉：运动的局部斜率与误差地形", "4. Intuition: Local Motion Slope and Loss Terrain"),
    content: copy(`骑车全程平均速度不能告诉你第 3 秒瞬时多快。把时间窗缩到第 3 秒左右，左右两点位置差除以时间差，便得到局部速度近似。

同理，把参数当横轴、$L$ 当纵轴。正导数表示参数向右小移时损失倾向上升；负导数表示向右小移时损失倾向下降；零导数只表示一阶局部平坦，未必是全局最优，也可能是峰顶或平台。

多个参数各有一个偏导数，合成梯度向量。但本课只读取这些局部信息，不执行自动更新循环。`, "A derivative is the slope of a local linear approximation. On a motion graph it reads velocity near one time; on a loss landscape it reads how loss responds near one parameter value. Positive sensitivity means increasing that parameter slightly tends to increase loss; negative means increasing it slightly tends to decrease loss; near zero means locally flat along that coordinate. None is a global guarantee. A curve can turn, a nonsmooth point can lack one derivative, and a step far outside the local neighborhood can contradict the tangent prediction."),
    visualIds: ["minimum-derivative-tangent"],
  },
  {
    id: "derivatives-formal",
    level: 2,
    title: copy("5. 正式表达：导数、偏导与中央差分", "5. Formal Contract: Derivatives, Partials, and Central Difference"),
    content: copy(`标量导数定义为

$$f'(a)=\\lim_{h\\to0}\\frac{f(a+h)-f(a)}h.$$

中央差分用对称两侧抵消部分偏差：

$$
f'(a)\\approx\\frac{f(a+h)-f(a-h)}{2h}.
$$

对 $L(w_1,w_2,b)$，$\\partial L/\\partial w_2$ 意味着只改变 $w_2$。导数单位也可检查：若 $L$ 单位为分钟²，$w_2$ 单位为分钟/提示，则该偏导单位是“分钟²除以权重单位”。

中央差分是近似；解析导数是规则推导；自动微分是程序按计算图组合局部导数。三者可互相核验，但不是同一种实现。

### 深入一：变化率不是变化量

导数值本身不是损失变化。只有给定小步长后，才用 $\\Delta L\\approx(\\partial L/\\partial\\theta)\\Delta\\theta$。本例 $dL/dw_2=-5$，配合 $\\Delta w_2=0.01$ 才得到约 -0.05。直接说“损失减少 5”混淆了变化率和变化量。

偏导数相当于在多参数空间中沿一个坐标轴切片。计算 $\\partial L/\\partial w_2$ 时固定 $w_1,b,X,y$。梯度 \`[∂L/∂w_1, ∂L/∂w_2, ∂L/∂b]\` 把不同轴的局部变化率收集起来，但它不是参数，也不是更新后的参数。

### 深入二：MSE 导数的每个因子来自哪里

单个残差 $r_i=\\hat y_i-y_i$，平方对预测的局部变化率是 $2r_i$。预测 $w^Tx_i+b$ 对 $w_j$ 的局部变化率是 $X_{ij}$，对偏置是 1。再对 $n$ 个样本平均，得到 $(2/n)\\sum_i r_iX_{ij}$ 与 $(2/n)\\sum_i r_i$。

因此 2 来自平方，$1/n$ 来自平均，残差来自预测减目标，特征来自参数变化如何传到预测。即使暂不系统学习链式法则，也能逐因子检查单位、符号与 shape。

数值差分、解析推导和自动微分是三条不同证据。三者接近增强可信度；若不一致，先检查损失定义是否都是 MSE、残差方向是否一致、是否对同一参数和同一批数据求值。`, `A scalar derivative is $f'(a)=\\lim_{h\\to0}[f(a+h)-f(a)]/h$. For a loss slice, the numerator is $L(\\theta+h)-L(\\theta-h)$. Central difference uses symmetric sides: $f'(a)\\approx[f(a+h)-f(a-h)]/(2h)$. For $L(w_1,w_2,b)$, $\\partial L/\\partial w_2$ changes only w2 while holding w1,b,X,y fixed. Units are auditable: if loss has minutes² and w2 has minutes/hint units, the derivative unit is minutes² divided by the weight unit. Central difference is a numerical approximation, an analytic derivative follows symbolic rules, and automatic differentiation composes local derivatives along a computation graph. They can check one another without being the same implementation.

### Deeper 1: Rate is not change

The derivative value is a rate, not a loss change. Only after choosing a small step may we use $\\Delta L\\approx(\\partial L/\\partial\\theta)\\Delta\\theta$. Here dL/dw2=-5 and Delta w2=0.01 give Delta L approximately -5*0.01=-0.05. Saying “loss decreases by 5” confuses rate with change. A partial derivative is a coordinate slice. The gradient vector [dL/dw1,dL/dw2,dL/db]=[0, -5, -1] collects local rates along all parameter axes; the gradient is not a parameter and not an updated parameter.

### Deeper 2: Where every MSE derivative factor comes from

For residual $r_i=\\hat y_i-y_i$, squaring contributes local factor $2r_i$. Prediction $w^Tx_i+b$ contributes X_ij for w_j and 1 for bias. Averaging n samples contributes 1/n. Therefore $\\partial L/\\partial w_j=(2/n)\\sum_i r_iX_{ij}$ and $\\partial L/\\partial b=(2/n)\\sum_i r_i$. The 2 comes from squaring, 1/n comes from averaging, r_i is prediction minus target, X_ij carries parameter change into prediction, and bias contributes 1. This factor ledger checks units, sign, and shape before a full chain-rule course. Numerical difference, analytic derivation, and automatic differentiation are independent evidence. If they disagree, verify the same MSE definition, residual direction, same parameter, and same batch.`),
  },
  {
    id: "derivatives-worked-shared",
    level: 2,
    title: copy("6. 算例一：核对三个参数的损失敏感度", "6. Example One: Check Three Loss Sensitivities"),
    content: copy(`当前 \`L = 2.5\`。残差 $r=[1,-2]$，$X=[[2,3],[1,4]]$。对线性预测与 MSE，

$$\\frac{\\partial L}{\\partial w_j}=\\frac{2}{2}\\sum_i r_iX_{ij},\\qquad
\\frac{\\partial L}{\\partial b}=\\frac{2}{2}\\sum_i r_i.$$

所以：

\`\`\`text
dL/dw_1 = 1*2 + (-2)*1 = 0
dL/dw_2 = 1*3 + (-2)*4 = -5
dL/db = 1 + (-2) = -1
\`\`\`

即 \`dL/dw_1 = 0\`、\`dL/dw_2 = -5\`、\`dL/db = -1\`。负号表示在当前点把参数略微增大，损失的一阶变化倾向为负。例如 $w_2$ 增大 0.01，线性近似给 $\\Delta L\\approx-5\\times0.01=-0.05$。

核对 $w_2=-0.99$：预测 \`[10.03,5.04]\`，残差 \`[1.03,-1.96]\`，$L=(1.0609+3.8416)/2=2.45125$，实际变化 -0.04875，接近 -0.05。

固定 $w_1=4,b=5$，可把损失明写成

$$L(w_2)=\\frac{(4+3w_2)^2+(2+4w_2)^2}{2}
=12.5w_2^2+20w_2+10.$$

所以导数 $25w_2+20$ 在 -1 处为 -5。该切片最低点是 -0.8，但这只是在其他参数固定时的结论，不是完整训练问题的全局结论。

同样固定 $w$，$L(b)=\\tfrac12[(b-4)^2+(b-7)^2]$，导数 $2b-11$ 在 5 处为 -1。两条展开式与残差公式互相核验。`, `Current L=2.5, residuals r=[1,-2], and X=[[2,3],[1,4]]. With factor 2/2, dL/dw1=1*2+(-2)*1=0, dL/dw2=1*3+(-2)*4=-5, and dL/db=1+(-2)=-1. Thus the sensitivity vector is [0,-5,-1]. The negative sign means a small increase tends to lower loss locally. For Delta w2=0.01, linear approximation predicts Delta L about -0.05.

Check w2=-0.99: predictions [10.03,5.04], residuals [1.03,-1.96], and L=(1.0609+3.8416)/2=2.45125. Actual change -0.04875 is close to -0.05. With w1=4 and b=5 fixed, the explicit slice is $L(w2)=((4+3w2)^2+(2+4w2)^2)/2=12.5w2^2+20w2+10$. Its derivative 25w2+20 equals -5 at w2=-1, and its slice minimum is -0.8; that is not a global claim about all parameters. With w fixed, $L(b)=((b-4)^2+(b-7)^2)/2$, whose derivative 2b-11 equals -1 at b=5. Both loss polynomials independently verify the residual formula.`),
  },
  {
    id: "derivatives-worked-auxiliary",
    level: 2,
    title: copy("7. 算例二：运动位置的局部斜率", "7. Example Two: Local Slope of Motion"),
    content: copy(`取 \`s(t) = t^2\` 米，在 $t=3$ 秒附近用 \`h = 0.1\`：

$$s(3.1)=9.61,\\qquad s(2.9)=8.41,$$

$$\\frac{9.61-8.41}{0.2}=6.$$

因此 \`slope_at_3 = 6\` 米/秒。解析展开 $(3+h)^2-(3-h)^2=12h$，除以 $2h$ 也恰为 6。

这里导数描述位置对时间的局部变化；主线导数描述损失对参数的局部变化。两者共享“输入小变化—输出变化率”，但物理单位与任务含义不同。`, "Take `s(t) = t^2` meters and inspect it near `t=3` seconds with `h = 0.1`. Then $s(3.1)=9.61$ and $s(2.9)=8.41$, so the central difference is $(9.61-8.41)/0.2=6$. Therefore `slope_at_3 = 6` meters/second. Analytically, $(3+h)^2-(3-h)^2=12h$; division by $2h$ also gives 6. Here the derivative describes local position change with respect to time. In the shared task, the derivative describes local loss change with respect to a parameter. Both use “small input change to output rate,” but their physical units and task meanings differ."),
  },
  {
    id: "derivatives-code",
    level: 2,
    title: copy("8. 代码翻译：把被探测参数封装成函数", "8. Code Translation: Wrap the Probed Parameter"),
    content: copy(`\`\`\`python
import numpy as np

X = np.array([[2., 3.], [1., 4.]])
y = np.array([9., 7.])
w = np.array([4., -1.])
b = 5.

def mse_for(candidate_w, candidate_b):
    y_hat = X @ candidate_w + candidate_b
    return np.mean((y_hat - y) ** 2)

def central_difference(fn, theta, h=1e-4):
    if not np.isfinite(theta) or not np.isfinite(h) or h <= 0:
        raise ValueError("theta and positive h must be finite")
    return (fn(theta + h) - fn(theta - h)) / (2 * h)

dw2 = central_difference(
    lambda candidate: mse_for(np.array([w[0], candidate]), b), w[1]
)
print(dw2)  # about -5.0
\`\`\`

闭包必须只替换一个参数。若直接修改共享 \`w\`，左右两次计算可能互相污染。调试时打印 \`theta-h, L_minus, theta+h, L_plus\`，确认顺序与分母。

### 完整估计、无副作用与安全边界

\`\`\`python
gradient_w = []
for j in range(w.size):
    def loss_for_weight(candidate, j=j):
        candidate_w = w.copy()
        candidate_w[j] = candidate
        return mse_for(candidate_w, b)
    gradient_w.append(central_difference(loss_for_weight, w[j]))

gradient_b = central_difference(lambda candidate: mse_for(w, candidate), b)
print(gradient_w, gradient_b)  # about [0.0, -5.0], -1.0
\`\`\`

每次复制 \`w\`，确保左右求值从同一中心出发，运行前后原参数仍为 \`[4,-1]\`。步长、中心参数、左右函数结果都必须有限；步长还必须大于 0。极小步长可能让 \`theta+h\` 在浮点表示中等于 \`theta\`，并非越小越可靠。

默认 $10^{-4}$ 是对本例数量级合适的可复现起点，不是普遍常数。实际工作可比较多个数量级并寻找稳定区间；若参数尺度差异巨大，还可能需要相对步长。本课把选择依据说清，而不扩展为完整数值分析课程。`, `The probed parameter is wrapped as a one-argument function, and every plus/minus evaluation starts from the same unmodified baseline. The complete copyable implementation is:

\`\`\`python
import numpy as np

X = np.array([[2., 3.], [1., 4.]])
y = np.array([9., 7.])
w = np.array([4., -1.])
b = 5.

def mse_for(candidate_w, candidate_b):
    y_hat = X @ candidate_w + candidate_b
    return np.mean((y_hat - y) ** 2)

def central_difference(fn, theta, h=1e-4):
    if not np.isfinite(theta) or not np.isfinite(h) or h <= 0:
        raise ValueError("theta and positive h must be finite")
    return (fn(theta + h) - fn(theta - h)) / (2 * h)

dw2 = central_difference(
    lambda candidate: mse_for(np.array([w[0], candidate]), b), w[1]
)
print(dw2)  # about -5.0
\`\`\`

The closure must replace exactly one parameter. Mutating shared \`w\` would allow the left and right evaluations to contaminate one another. During debugging, print \`theta-h, L_minus, theta+h, L_plus\` and verify the denominator is $2h$.

### Complete estimates, no side effects, and safety boundaries

\`\`\`python
gradient_w = []
for j in range(w.size):
    def loss_for_weight(candidate, j=j):
        candidate_w = w.copy()
        candidate_w[j] = candidate
        return mse_for(candidate_w, b)
    gradient_w.append(central_difference(loss_for_weight, w[j]))

gradient_b = central_difference(lambda candidate: mse_for(w, candidate), b)
print(gradient_w, gradient_b)  # about [0.0, -5.0], -1.0
\`\`\`

Each candidate uses \`candidate_w = w.copy()\`, so both sides start at the same center and the original parameters remain [4,-1]. Step, center, left result, and right result must all be finite, and h must be positive. An extremely small h can make theta+h indistinguishable from theta in floating-point arithmetic; smaller is not automatically more reliable. The default $10^{-4}$ is a reproducible starting point for this scale, not a universal constant.`),
  },
  {
    id: "derivatives-experiment",
    level: 2,
    title: copy("9. 控制实验：改变 h，而不是改变结论", "9. Controlled Experiment: Change h, Not the Question"),
    content: copy(`固定当前参数，估计 $w_2$ 导数：

| $h$ | 中央差分近似 | 观察 |
|---:|---:|---|
| 1 | -5 | 本例损失对单参数是二次式，中央差分恰好 |
| 0.1 | -5 | 与解析值一致 |
| 0.0001 | 约 -5 | 仅有浮点舍入尾差 |

不要据此宣称 $h$ 越小永远越好。一般非二次函数中，大 $h$ 有截断误差，极小 $h$ 会发生相近数相减的舍入误差。应跨几个数量级比较稳定区间。

独立控制实验：把 $w_2$ 增加 0.01，观察 $L$ 从 2.5 降至 2.45125；这验证局部符号，但仍不是梯度下降，因为没有定义学习率规则、更新所有参数或迭代停止方式。

读取结果分三步：先看符号，$L(\\theta+h)<L(\\theta-h)$ 时差分为负；再看量级，分母必须是 $2h$；最后看稳定性，相邻几个 $h$ 是否接近。三步都通过，才把值称为可信近似。

若得到 +5，检查左右项顺序；若得到 -10，检查分母是否误写成 $h$；若每个参数结果相同，检查闭包是否替换了不同索引；若重复运行改变结果，检查数组是否原地修改。这些诊断比调小 $h$ 更优先。

从数据解释负号：$w_2$ 增大时两项预测按 3、4 增大。第一项本已高 1，会更高；第二项低 2，会更接近目标。第二项残差绝对值与特征都更大，净效果是当前损失下降。公式、数值与行为在这里闭合。`, "Controlled experiment: keep X, y, baseline parameters, and derivative formula fixed; vary only h through 1, 0.1, 0.01, 1e-4, and a very tiny value. Record L(theta+h), L(theta-h), numerator, denominator, and estimate. A stable middle range should approach the analytic sensitivity; a broad window can bias a nonlinear loss, and an extremely tiny window can show floating-point noise. Formative feedback asks whether only h changed, whether each evaluation started from a fresh copy, and whether the conclusion reports stability rather than declaring the smallest h automatically best."),
    visualIds: ["minimum-derivative-window"],
  },
  {
    id: "minimum-derivative-local-approximation",
    level: 2,
    title: copy("用导数估计一个足够小的变化", "Use a Derivative to Estimate a Small Change"),
    content: copy(`在当前参数处，批量 MSE 对 \\(w_2\\) 的导数是 \\(-5\\)。这句话不是说“把 \\(w_2\\) 增加 1，损失必然减少 5”，而是给出局部近似：

$$
L(w_2+\\Delta w_2)\\approx L(w_2)+\\frac{\\partial L}{\\partial w_2}\\Delta w_2.
$$

若 \\(\\Delta w_2=0.01\\)，则 \\(L\\) 的预测变化约为 \\(-5\\times0.01=-0.05\\)，从 2.5 降到约 2.45。直接代入实际二次损失会得到约 2.45125；两者很接近，但并不完全相等，因为切线只保留一阶局部信息。

同一批次还给出 \\(\\partial L/\\partial w_1=0\\) 和 \\(\\partial L/\\partial b=-1\\)。零导数只表示当前一阶切片平坦，不能证明参数永远无用；负导数只描述向右小移时损失先下降，也不等于参数本身为负。`, `At the current parameters, the derivative of batch MSE with respect to \\(w_2\\) is \\(-5\\). This does not mean that increasing \\(w_2\\) by 1 must reduce loss by exactly 5. It gives a local approximation:

$$
L(w_2+\\Delta w_2)\\approx L(w_2)+\\frac{\\partial L}{\\partial w_2}\\Delta w_2.
$$

For \\(\\Delta w_2=0.01\\), the predicted loss change is approximately \\(-5\\times0.01=-0.05\\), from 2.5 to about 2.45. Direct evaluation of the quadratic loss gives about 2.45125. The values are close but not identical because a tangent keeps only first-order local information.

The same batch gives \\(\\partial L/\\partial w_1=0\\) and \\(\\partial L/\\partial b=-1\\). A zero derivative means only that the current first-order slice is flat; it does not prove a parameter is permanently useless. A negative derivative describes the initial loss direction for a small move to the right; it is not the sign of the parameter itself.`),
    visualIds: ["minimum-derivative-tangent"],
  },
  {
    id: "derivatives-misconceptions",
    level: 2,
    title: copy("10. 误区诊断：局部信息的边界", "10. Misconceptions: Boundaries of Local Information"),
    content: copy(`### 进入误区前：用左右损失亲手重建差分

取 $w_2=-1,h=0.1$。右侧 $w_2=-0.9$ 时，预测为 \`[10.3,5.4]\`，残差 \`[1.3,-1.6]\`，损失 $(1.69+2.56)/2=2.125$。左侧 $w_2=-1.1$ 时，预测 \`[9.7,4.6]\`，残差 \`[0.7,-2.4]\`，损失 $(0.49+5.76)/2=3.125$。中央差分为

$$\\frac{2.125-3.125}{0.2}=-5.$$

这次计算显示“右边损失更低”对应负斜率。不要只背负号规则；用左右两次完整前向结果就能重建它。也要注意右侧并不表示两个样本都改善：第一项从误差 1 变 1.3，第二项从 -2 变 -1.6，净平均仍改善。

对 $b$ 取同样 $h=0.1$。偏置增加会让两个预测都加 0.1，残差变 \`[1.1,-1.9]\`，损失 $(1.21+3.61)/2=2.41$；偏置减少得到 \`[0.9,-2.1]\`，损失 $(0.81+4.41)/2=2.61$；差分 $(2.41-2.61)/0.2=-1$。这核验偏置梯度。

对 $w_1$，右移 0.1 后残差 \`[1.2,-1.9]\`，损失 $(1.44+3.61)/2=2.525$；左移后 \`[0.8,-2.1]\`，损失同为 $(0.64+4.41)/2=2.525$，差分为 0。左右损失相等说明当前切片对称，但并不表示改变 $w_1$ 永远不影响损失。

### 局部线性近似的有效范围

用导数 -5 预测 $w_2$ 增加 0.1 时损失变化约 -0.5，给出 2.0；实际是 2.125，误差来自二次曲率。步长 0.01 时近似 2.45，实际 2.45125，更接近。步长缩小通常改善局部近似，直到浮点舍入开始主导。

若直接增加 1，线性近似会给损失 -2.5，这是不可能的负 MSE，明显暴露局部模型被用得太远。导数没有承诺整条曲线保持同一斜率。任何使用导数估计大变化的结论都应回代真实函数验证。

### 数值导数与未来优化的接口

本课函数输入一个损失函数、中心值和步长，输出一个数值斜率。未来的更新函数还需要当前参数、梯度和学习率，可能写成 \`new_theta = theta - learning_rate * gradient\`。两者分离后，可以独立测试差分是否正确、更新是否按规则执行。

即使梯度正确，学习率过大也可能跨过低点或发散；即使一步损失下降，也不保证对新样本更好。完整优化课程还需迭代、停止条件、训练/验证区分等内容。本课交付的是可核验局部信号，不提前声称这些能力。

### 阅读检查点

请用完整句读三个结果：$dL/dw_1=0$ 表示当前点沿 $w_1$ 的一阶局部变化为零；$dL/dw_2=-5$ 表示小幅增加 $w_2$ 倾向降低损失；$dL/db=-1$ 表示小幅增加偏置也倾向降低损失。每句都包含“当前”“局部”“小幅”，这些限定词不是客套，而是数学结论的边界。

最后画一张数据流：候选参数进入 \`Xw+b\`，产生预测，再与固定目标计算 MSE；中央差分调用这条链两次。若图中差分直接作用于预测而没有损失，估计的是预测敏感度而非误差敏感度；若目标进入 \`Xw+b\`，信息边界已被破坏。

### 误区一：负导数表示参数是负数

**为什么容易发生：**导数与参数值都带正负号。

**本例诊断：**$w_2=-1$ 且导数 -5，但 $b=5$ 的导数也为 -1；符号描述变化方向，不描述参数本身。

**修复动作：**用一句完整话读导数：“参数向右小移时，损失如何变”。

### 误区二：导数为零就找到全局最优

**为什么容易发生：**抛物线最低点是最熟悉例子。

**本例诊断：**$dL/dw_1=0$ 只是在其他参数固定的当前切片上一阶平坦。

**修复动作：**检查其他偏导、邻域损失和曲线形状，再讨论最优性。

### 误区三：数值导数就是梯度下降

**为什么容易发生：**二者常在同一训练代码出现。

**本例诊断：**中央差分只返回 -5；它没有选择更新量，也没有修改 $w_2$。

**修复动作：**在程序中分开 \`estimate_gradient\` 与未来的 \`update_parameters\`，记录各自输入输出。`, `### Before misconceptions: Rebuild the difference from left and right losses

At w2=-0.9, predictions [10.3,5.4], residuals [1.3,-1.6], and loss 2.125. At w2=-1.1, predictions [9.7,4.6], residuals [0.7,-2.4], and loss 3.125. Their central difference (2.125-3.125)/0.2=-5. The right side lowers average loss even though sample one worsens. For bias, residuals [1.1,-1.9] give 2.41 and [0.9,-2.1] give 2.61, yielding -1. For w1, residuals [1.2,-1.9] give 2.525 and [0.8,-2.1] also give 2.525, yielding zero without proving no future effect.

### Valid range of the local linear approximation

Derivative -5 predicts that step 0.1 changes loss by -0.5, giving 2.0, while actual loss is 2.125 because of curvature. Step 0.01 predicts 2.45 and actual is 2.45125. Increasing w2 by 1 would predict impossible negative MSE -2.5, showing the local model was used too far. Re-evaluate the true function after any large proposed change.

### Interface between numerical derivatives and future optimization

The estimator accepts loss function, center, and h and returns slope. A future updater also needs parameter, gradient, and learning rate: new_theta=theta-learning_rate*gradient. Keep estimate_gradient and update_parameters separate. A correct gradient with a large learning rate can overshoot; one lower training loss does not guarantee validation improvement.

### Reading checkpoint

Read dL/dw1=0 as first-order local flatness, dL/dw2=-5 as a small right move tending to lower loss, and dL/db=-1 likewise. Every statement needs current, local, and small. Draw candidate parameters -> Xw+b -> predictions -> fixed-target MSE, with central difference calling the whole loss chain twice. Applying it only to prediction estimates prediction sensitivity; putting target into Xw+b breaks the information boundary.

### Misconception 1: A negative derivative means the parameter is negative

Parameter and derivative both have signs, but w2=-1 has derivative -5 while positive b=5 has derivative -1. The sign describes local change direction, not parameter sign. Repair with: “when the parameter moves slightly right, how does loss move?”

### Misconception 2: A zero derivative proves a global optimum

A familiar parabola encourages this claim, but dL/dw1=0 only says the current one-coordinate slice is first-order flat with other quantities fixed. Check other partials, neighboring losses, and curve shape before discussing optimum.

### Misconception 3: A numerical derivative is gradient descent

They appear together in training code, but central difference only returns -5; it chooses no update and does not modify w2. Keep estimate_gradient and update_parameters as separately tested functions with separate inputs and outputs.`),
  },
  {
    id: "derivatives-handoff",
    level: 2,
    title: copy("12. 小结与交接：把可核验导数交给 NumPy 课", "12. Summary and NumPy Handoff"),
    content: copy(`本课得到主线 $L=2.5$ 与参数敏感度 \`[0,-5]\`、偏置敏感度 -1，并用运动局部斜率建立直觉。关键边界是：数值导数提供局部估计，不等于梯度下降；后者还包含更新政策和迭代过程。

建议先用 15 分钟从运动割线建立局部斜率，再用 25 分钟完成三个参数的解析和数值核验，15 分钟比较步长并阅读代码，最后用误区与练习做 20–30 分钟自查。若只记住中央差分公式而不能列出左右两次预测，说明数值方法还没有接回模型；若会算 -5 却说不出“当前点、小幅、局部”，说明结论边界仍需复看。

交接自检包含四个数：当前损失 2.5，三个敏感度 0、-5、-1。还要能解释为何 $w_2$ 右移同时让一个样本变差、另一个变好，净效果仍下降；为何 $w_1$ 的零导数不证明全局最优；为何中央差分函数不应修改参数。它们分别核验数值、解释与实现安全。

NumPy 课接收以下可复现合同：\`X=[[2,3],[1,4]]\`、\`w=[4,-1]\`、\`b=5\`、\`y_hat=[10,5]\`、\`y=[9,7]\`、\`L=2.5\`，中央差分步长默认 $10^{-4}$，期望梯度近似 \`[0,-5,-1]\`。下一课会把 arrays、shapes、broadcasting、vectorization 与 debugging 串成一个可运行实现。`, "The NumPy handoff contains a fully auditable derivative contract: fixed X=[[2,3],[1,4]], targets [9,7], baseline w=[4,-1], b=5, predictions [10,5], MSE 2.5, central-difference sensitivities approximately w=[0,-5] and b=-1, and a documented h sweep. The next lesson must reproduce these outputs with array shape and finite checks, fresh copies for perturbations, and real failure messages. It must retain the sentence that central difference is not gradient descent and must not introduce a learning-rate update into this measurement task."),
  },
]

export const calculusDerivativesModule: MathLabModule = {
  id: "calculus-derivatives-local-change",
  enhancementTier: "core",
  order: 0,
  title: copy("导数与误差敏感度：当前参数附近怎样变化", "Derivatives and Error Sensitivity: Change Near the Current Parameters"),
  subtitle: copy("用解析结果与中央差分核对局部损失敏感度，并严格区分估计与更新。", "Check local loss sensitivity with analytic results and central difference while separating estimation from updating."),
  difficulty: "foundation",
  estimatedMinutes: 65,
  prerequisites: ["calculus-functions-rate-change"],
  aiModelConnections: [
    copy("导数把当前参数与 loss 的局部变化连接起来。", "Derivatives connect current parameters to local loss change."),
    copy("梯度检查用独立数值估计核对解析或自动微分。", "Gradient checking uses an independent numerical estimate to verify analytic or automatic differentiation."),
  ],
  learningObjectives: [
    copy("从平均变化率解释导数的局部含义。", "Explain the local meaning of a derivative from average change."),
    copy("用中央差分核对 w1、w2、b 的 MSE 敏感度。", "Use central difference to check MSE sensitivities for w1, w2, and b."),
    copy("通过 h sweep 诊断截断误差与浮点消去。", "Diagnose broad-window error and floating cancellation with an h sweep."),
    copy("明确中央差分只估计导数，不执行梯度下降。", "State that central difference estimates a derivative and does not perform gradient descent."),
  ],
  concepts: [
    {
      id: "central-difference-sensitivity",
      name: copy("中央差分敏感度", "Central-Difference Sensitivity"),
      formulaLatex: "\\frac{L(\\theta+h)-L(\\theta-h)}{2h}",
      variables: [
        {
          symbol: "theta",
          description: copy("被单独探测的当前参数。", "The current parameter probed in isolation."),
        },
        {
          symbol: "h",
          description: copy("正且有限的对称观察半宽。", "A positive finite symmetric half-window."),
        },
      ],
      plainExplanation: copy("对称地比较参数两侧的 loss，估计当前局部斜率。", "Compare loss symmetrically on both sides to estimate the current local slope."),
      geometricIntuition: copy("窗口缩小让割线靠近局部切线，但过小会受浮点误差影响。", "Shrinking the window approaches a local tangent, but an overly small window suffers floating error."),
      numericalExample: copy("当前批量敏感度约为 [0,-5,-1]。", "Current batch sensitivities are approximately [0,-5,-1]."),
      modelConnection: copy("这是 gradient checking 的数值基线，不是参数更新。", "This is a numerical baseline for gradient checking, not a parameter update."),
      codeExample: `import numpy as np

X = np.array([[2.0, 3.0], [1.0, 4.0]])
targets = np.array([9.0, 7.0])
w = np.array([4.0, -1.0])
bias = 5.0

def mse_for_w2(candidate_w2: float) -> float:
    candidate_w = w.copy()
    candidate_w[1] = candidate_w2
    predictions = X @ candidate_w + bias
    return float(np.mean((predictions - targets) ** 2))

def central_difference(fn, value: float, h: float = 1e-4) -> float:
    if not np.isfinite(value) or not np.isfinite(h) or h <= 0:
        raise ValueError("value and positive h must be finite")
    return (fn(value + h) - fn(value - h)) / (2 * h)

slope = central_difference(mse_for_w2, w[1])
print("baseline_mse =", mse_for_w2(w[1]))
print("dL_dw2 =", round(slope, 6))
print("actual_mse_at_w2_plus_0.01 =", round(mse_for_w2(w[1] + 0.01), 6))`,
      codeOutput: copy(`baseline_mse = 2.5
dL_dw2 = -5.0
actual_mse_at_w2_plus_0.01 = 2.45125`, `baseline_mse = 2.5
dL_dw2 = -5.0
actual_mse_at_w2_plus_0.01 = 2.45125`),
    },
    {
      id: "motion-local-slope",
      name: copy("运动的局部斜率", "Local Motion Slope"),
      formulaLatex: "s'(t)=2t",
      variables: [
        {
          symbol: "t",
          description: copy("时间输入，单位秒。", "Time input in seconds."),
        },
        {
          symbol: "s",
          description: copy("位置输出，单位米。", "Position output in meters."),
        },
      ],
      plainExplanation: copy("位置对时间的导数是局部速度。", "The derivative of position with respect to time is local velocity."),
      geometricIntuition: copy("对称窗口比较 t 两侧的位置，得到当前局部斜率。", "A symmetric window compares positions on both sides of t to obtain the current local slope."),
      numericalExample: copy("s(t)=t^2 在 t=3、h=0.1 时中央差分为 6 米/秒。", "For s(t)=t^2 at t=3 with h=0.1, central difference is 6 meters/second."),
      modelConnection: copy("同样的局部率思想用于解释 loss 对参数的敏感度。", "The same local-rate idea explains loss sensitivity to a parameter."),
    },
  ],
  sections,
  toc: sections.map(({ id, level, title }) => ({ id, level, title })),
  visuals: [
    {
      id: "minimum-derivative-tangent",
      type: "image",
      title: copy("割线怎样靠近切线", "How Secants Approach a Tangent"),
      assetPath: "/math-lab/generated/beginner-derivative-tangent-longform.png",
      transcript: copy("对称观察点逐渐靠近当前输入时，区间斜率逐步变成只描述当前邻域的局部斜率。", "As symmetric observation points approach the current input, the interval slope becomes a local slope that describes only the current neighborhood."),
      learningPurpose: copy("对称观察点逐渐靠近当前输入时，区间斜率逐步变成只描述当前邻域的局部斜率。", "As symmetric observation points approach the current input, the interval slope becomes a local slope that describes only the current neighborhood."),
      alt: copy("对称观察点逐渐靠近当前输入时，区间斜率逐步变成只描述当前邻域的局部斜率。", "As symmetric observation points approach the current input, the interval slope becomes a local slope that describes only the current neighborhood."),
      caption: copy("对称观察点逐渐靠近当前输入时，区间斜率逐步变成只描述当前邻域的局部斜率。", "As symmetric observation points approach the current input, the interval slope becomes a local slope that describes only the current neighborhood."),
    },
    {
      id: "minimum-derivative-window",
      type: "image",
      title: copy("有限差分观察窗口", "The Finite-Difference Observation Window"),
      assetPath: "/math-lab/generated/beginner-derivative-window-longform.png",
      transcript: copy("窗口过宽会混入远处曲率，窗口过窄会放大浮点消去；稳定区间比盲目追求最小 h 更重要。", "A wide window mixes in distant curvature, while an excessively narrow window amplifies floating cancellation; a stable range matters more than the smallest h."),
      learningPurpose: copy("窗口过宽会混入远处曲率，窗口过窄会放大浮点消去；稳定区间比盲目追求最小 h 更重要。", "A wide window mixes in distant curvature, while an excessively narrow window amplifies floating cancellation; a stable range matters more than the smallest h."),
      alt: copy("窗口过宽会混入远处曲率，窗口过窄会放大浮点消去；稳定区间比盲目追求最小 h 更重要。", "A wide window mixes in distant curvature, while an excessively narrow window amplifies floating cancellation; a stable range matters more than the smallest h."),
      caption: copy("窗口过宽会混入远处曲率，窗口过窄会放大浮点消去；稳定区间比盲目追求最小 h 更重要。", "A wide window mixes in distant curvature, while an excessively narrow window amplifies floating cancellation; a stable range matters more than the smallest h."),
    },
  ],
  labs: [],
  quizzes: [
    {
      id: "derivative-role-check",
      type: "single-choice",
      prompt: copy("中央差分输出是什么？", "What does central difference output?"),
      answer: "slope",
      choices: [
        {
          id: "slope",
          label: copy("局部斜率估计", "A local slope estimate"),
        },
        {
          id: "distractor",
          label: copy("更新后的参数", "An updated parameter"),
        },
      ],
      explanation: copy("估计与更新必须分离。", "Estimation and updating must remain separate."),
      misconceptionTags: ["derivative-is-update"],
      revisitVisualId: "derivatives-formal",
    },
    {
      id: "derivative-w2-check",
      type: "single-choice",
      prompt: copy("当前 dL/dw2 约为多少？", "What is the current approximate dL/dw2?"),
      answer: "minus-five",
      choices: [
        {
          id: "minus-five",
          label: copy("-5", "-5"),
        },
        {
          id: "distractor",
          label: copy("+5", "+5"),
        },
      ],
      explanation: copy("残差与第二特征列配对得到 -5；负号描述当前局部 loss 方向，不是参数符号。", "Pairing residuals with the second feature column gives -5; its sign describes the current local loss direction, not the parameter sign."),
      misconceptionTags: ["derivative-sign-is-parameter-sign"],
      revisitVisualId: "derivatives-worked-shared",
    },
    {
      id: "derivative-h-check",
      type: "single-choice",
      prompt: copy("为什么不总选最小 h？", "Why not always choose the smallest h?"),
      answer: "roundoff",
      choices: [
        {
          id: "roundoff",
          label: copy("浮点消去可能主导", "Floating cancellation may dominate"),
        },
        {
          id: "distractor",
          label: copy("因为中央差分要求 h=1", "Because central difference requires h=1"),
        },
      ],
      explanation: copy("h sweep 用于寻找稳定范围。", "The h sweep seeks a stable range."),
      misconceptionTags: ["derivative-smallest-h"],
      revisitVisualId: "derivatives-experiment",
    },
    {
      id: "derivative-copy-check",
      type: "single-choice",
      prompt: copy("plus/minus 探测应如何创建参数？", "How should plus/minus probe parameters be created?"),
      answer: "copies",
      choices: [
        {
          id: "copies",
          label: copy("从同一基线各自复制", "Copy each independently from one baseline"),
        },
        {
          id: "distractor",
          label: copy("依次修改同一数组", "Mutate one array sequentially"),
        },
      ],
      explanation: copy("独立副本保护对称比较。", "Independent copies protect the symmetric comparison."),
      misconceptionTags: ["derivative-mutate-shared"],
      revisitVisualId: "derivatives-code",
    },
  ],
  misconceptions: [
    {
      id: "derivative-is-update",
      statement: copy("中央差分就是梯度下降。", "Central difference is gradient descent."),
      correction: copy("中央差分估计斜率；更新还需要学习率与参数赋值。", "Central difference estimates slope; an update also needs a learning rate and assignment."),
      example: copy("本课返回 -5，不执行 w2 <- w2-eta*(-5)。", "This lesson returns -5 and does not execute w2 <- w2-eta*(-5)."),
    },
    {
      id: "derivative-is-global",
      statement: copy("当前导数决定整条曲线的方向。", "The current derivative determines the whole curve."),
      correction: copy("导数只描述当前点附近。", "A derivative describes only the current neighborhood."),
      example: copy("远离当前点后曲线可能转向。", "The curve may turn away from the current point."),
    },
    {
      id: "derivative-smallest-h",
      statement: copy("h 越小结果必然越准确。", "A smaller h is always more accurate."),
      correction: copy("过小 h 会让相近浮点数相减丢失有效位。", "An overly small h loses significant digits when close floats are subtracted."),
      example: copy("应寻找稳定区间并与解析例核对。", "Seek a stable range and compare with an analytic case."),
    },
    {
      id: "derivative-mutate-shared",
      statement: copy("可以在同一个 w 上依次做 plus/minus 扰动。", "The same w can be mutated for plus and minus probes."),
      correction: copy("两侧计算必须从同一基线的独立副本开始。", "Both sides must begin from independent copies of one baseline."),
      example: copy("否则 minus 侧继承 plus 状态，破坏对称。", "Otherwise the minus side inherits the plus state and breaks symmetry."),
    },
    {
      id: "derivative-sign-is-parameter-sign",
      statement: copy("导数为负表示参数本身必须为负。", "A negative derivative means the parameter itself must be negative."),
      correction: copy("导数符号描述当前点附近参数向右小移时 loss 的局部变化方向，不描述参数值的符号。", "The derivative sign describes the local loss direction when the parameter moves slightly right; it does not describe the parameter value sign."),
      example: copy("w2=-1 的导数是 -5，而正参数 b=5 的导数也是 -1；两者都只说明局部增加参数会使 loss 倾向下降。", "w2=-1 has derivative -5, while positive parameter b=5 has derivative -1; both signs only say that a small local increase tends to lower loss."),
    },
  ],
  nextModuleIds: [],
  accent: "#c2410c",
  theme: "#fff7ed",
  sourceNoteFile: "math-lab-calculus-route-sources.md",
  sourceReferences: [
    {
      label: copy("Mathematics for Machine Learning", "Mathematics for Machine Learning"),
      href: "https://mml-book.github.io/",
      license: "CC BY-NC-SA 4.0",
      usage: copy("用于核对数学定义、shape 与机器学习连接。", "Used to verify mathematical definitions, shape contracts, and machine-learning connections."),
    },
    {
      label: copy("NumPy 官方文档", "NumPy Documentation"),
      href: "https://numpy.org/doc/stable/",
      usage: copy("用于核对数组、矩阵乘法、广播、轴与有限值 API。", "Used to verify array, matrix multiplication, broadcasting, axis, and finite-value APIs."),
    },
  ],
}
