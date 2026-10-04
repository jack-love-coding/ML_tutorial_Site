# 回归目标函数与参考数据说明

2026-10-04 核对并修正教学正文，不重新生成冻结数据、Notebook 或数值输出。

- Ridge 使用系数平方和。教材若写作 `MSE + λ ||w||₂²`，与 sklearn 的 `SSE + alpha ||w||₂²` 对应关系为 `λ = alpha / n`。
- Lasso 使用系数绝对值之和。教材若写作 `MSE + λ ||w||₁`，与 sklearn 的 `MSE / 2 + alpha ||w||₁` 对应关系为 `λ = 2 alpha`。
- 上述换算要求同一未加权数据、相同预处理和截距处理；实验控件与参考输出继续采用 sklearn 自己的 alpha 定义。

依据：[sklearn Ridge](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.Ridge.html)、[sklearn Lasso](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.Lasso.html) 官方 API 中的目标函数（核对日期同上）。

Bike Sharing 在 Python 与回归课中都是已分析、公开结果的参考案例。原测试分区可以用于复现既有分析，不能在读过结果并据此调参后再次宣称为未知的独立测试。房价项目使用另一份冻结数据展示完整流程；学生据公开结果继续开发时，同样需要为新方案另外规定独立评估协议。
