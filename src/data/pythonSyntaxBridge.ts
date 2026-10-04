import type { LocalizedCopy } from '../types/ml.ts'
/** A web reading bridge before the executed Notebook workflow; no extra chapter ID. */
export const pythonSyntaxBridge: LocalizedCopy = {
  'zh-CN': `## 开始之前：够用的 Python 语法

本节问题：怎样读懂后面的代码，而不必先学完整门编程课？没有编程基础也可以从这里开始。在一个新的 Notebook 中依次运行下面的短例子。

### 变量、容器和函数调用

\`count = 3\` 把整数绑定到名字；\`rate = 0.5\` 是小数，\`name = "bike"\` 是字符串。\`=\` 表示赋值，\`==\` 用于比较。

\`counts = [2, 4, 6]\` 是列表，\`counts[0]\` 为 2；索引从 0 开始。\`row = {"hour": 8, "count": 6}\` 是字典，\`row["count"]\` 为 6。\`len(counts)\` 调用函数并传入参数，结果为 3。

### 导入、循环、条件与缩进

\`import numpy as np\` 导入库并给它短名字；\`from pathlib import Path\` 只导入其中一个对象。安装库与导入库是两件事：导入只在当前内核中让名字可用。

\`\`\`python
counts = [2, 4, 6]
total = 0
for count in counts:
    if count >= 4:
        total = total + count
print(total)  # 10
\`\`\`

冒号后的缩进属于同一个代码块。循环依次取出 2、4、6；条件只保留 4 和 6，因此输出 10。\`print\` 显示结果，\`#\` 后面是注释。

### 自己定义一次变换

\`\`\`python
def predict(x, weight=2):
    return weight * x

print(predict(3))           # 6
print(predict(3, weight=4)) # 12
\`\`\`

\`def\` 定义函数，\`return\` 返回结果；括号中既可以传位置参数，也可以写参数名。修改 weight 后输出随之改变，这就是后面模型公式的最小代码版本。

### 遇到报错时先看最后一行

- **NameError**：名字还没有定义。先运行定义变量或导入库的单元格，再运行使用它的单元格。
- **TypeError**：类型不合适，例如字符串不能直接当作数字相加。先检查 \`type(value)\`。
- **KeyError / IndexError**：字典中没有这个键，或列表索引越界。检查键名、\`len\` 与从 0 开始的索引。
- **IndentationError**：缩进不一致。检查冒号与代码块，统一使用空格。
- **ModuleNotFoundError**：当前内核没有该库。对照本课环境文件安装依赖，并确认选择了对应内核。

下一步：把这些语句放进可从干净内核顺序重跑的 Notebook。后面的 Bike Sharing 图表和回归课共用同一参考数据，属于已经分析过的案例；最终评估边界在独立项目中说明。`,
  en: `## Before you begin: enough Python to read the course

Guiding question: how can you read the code without first taking a full programming course? No prior coding is required. Run these short examples in a new Notebook in order.

### Variables, containers, and function calls

\`count = 3\` binds an integer to a name; \`rate = 0.5\` is a decimal and \`name = "bike"\` is a string. \`=\` assigns a value; \`==\` compares values.

\`counts = [2, 4, 6]\` is a list and \`counts[0]\` is 2: indexing starts at 0. \`row = {"hour": 8, "count": 6}\` is a dictionary, so \`row["count"]\` is 6. \`len(counts)\` calls a function with an argument and returns 3.

### Imports, loops, conditions, and indentation

\`import numpy as np\` imports a library under a short name; \`from pathlib import Path\` imports one object. Installing a package and importing it are separate steps: an import makes its names available in the current kernel.

\`\`\`python
counts = [2, 4, 6]
total = 0
for count in counts:
    if count >= 4:
        total = total + count
print(total)  # 10
\`\`\`

Indented lines after a colon belong to the same block. The loop visits 2, 4, and 6; the condition keeps 4 and 6, producing 10. \`print\` displays a result; \`#\` begins a comment.

### Define a transformation

\`\`\`python
def predict(x, weight=2):
    return weight * x

print(predict(3))           # 6
print(predict(3, weight=4)) # 12
\`\`\`

\`def\` defines a function and \`return\` returns its result. Arguments can be positional or named. Changing weight changes the output: this is the smallest code version of a later model formula.

### Read the last line of an error first

- **NameError**: the name has not been defined. Run the definition or import before its use.
- **TypeError**: incompatible types, such as treating a string as a number. Inspect \`type(value)\`.
- **KeyError / IndexError**: a missing dictionary key or out-of-range list index. Check keys, \`len\`, and zero-based indexing.
- **IndentationError**: inconsistent indentation. Check colons and blocks, using spaces consistently.
- **ModuleNotFoundError**: the current kernel lacks the package. Install the course environment dependencies and select that kernel.

Next: place these statements into a Notebook that reruns in order from a clean kernel. Bike Sharing is a previously analyzed reference shared by the Python and regression lessons; independent projects explain final evaluation boundaries.`,
}
