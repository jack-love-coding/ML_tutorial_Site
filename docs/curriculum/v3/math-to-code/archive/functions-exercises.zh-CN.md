# Historical function exercises

Archived from the pre-textbook authoring source. Historical reference material, not a current student route or assessment requirement.


这些练习用于形成理解，不计分，也不作为课程完成证据。每题先写“我依据哪条规则”，再看提示与参考推理。

### 第一层：概念辨析

**练习 1A** 把 features、weights、bias、prediction、target 分为样本输入、模型参数、函数输出或监督反馈。

**提示：**问部署新样本时每个量从哪里来。

**参考推理：**features 来自样本；weights 与 bias 属于模型参数；prediction 是输出；target 是预测后使用的监督反馈，不能进入 predict_one。

[回看：共同预测任务](#shared-prediction-task)

**练习 1B** 两个不同输入都得到 prediction = 10，这仍是函数吗？

**提示：**区分“多个输入到同一输出”和“同一完整输入到多个输出”。

**参考推理：**仍是函数。函数允许多对一，只要求固定参数时每个完整合法输入有唯一输出。

[回看：映射直觉](#mapping-intuition)

**练习 1C** 有人说训练会改变权重，所以预测规则不是函数。怎样回应？

**提示：**分别考虑一次前向计算与训练中的多个参数状态。

**参考推理：**每次前向计算的输入和当前参数确定，输出唯一；训练只是依次考察参数不同的映射状态。

[回看：正式定义](#formal-definition)

### 第二层：手算与读码

**练习 2A** 保持 features 与 weights 不变，只把 bias 从 5 改成 2，计算 prediction 与 residual。

**提示：**两项特征贡献仍是 8 与 -3。

**参考推理：**加权和仍为 5，新 prediction = 7，residual = 7 - 9 = -2；偏置减少 3，预测也减少 3。

[回看：完整手算](#worked-prediction)

**练习 2B** 阅读 `return [feature * weight for feature, weight in zip(features, weights)]`，指出返回形状与逻辑缺口。

**提示：**用 [2,3] 与 [4,-1] 代入，再与一个标量预测比较。

**参考推理：**返回 [8,-3]，既没有求和也没有加 bias，还缺长度检查；zip 可能静默截断。应检查长度后使用 sum(...) + bias。

[回看：Python 翻译](#python-translation)

**练习 2C** 不运行程序，补全 $w_1=3,3.5,4$ 的 prediction。

**提示：**先化简为 $2w_1+2$。

**参考推理：**结果依次为 8、9、10。3.5 只让当前样本命中目标，不能证明对所有样本最好。

[回看：控制实验](#controlled-experiment)

### 第三层：开放观察

**练习 3A** 画出 $x_1=2$ 时的 $2w_1+2$，再只把 $x_1$ 改为 1 画第二条线。

**提示：**第二条线先独立化简，不要同时修改其他数字。

**参考推理：**第二条线为 $w_1+2$。两条截距同为 2，斜率分别为 2 和 1，说明特征值决定预测对对应权重的敏感程度。

[回看：控制实验](#controlled-experiment)

**练习 3B** 为运动函数选择另一组 $s_0,v$，只改 $v$ 后再恢复并只改 $s_0$。

**提示：**速度控制相邻位置差，初始位置控制 $t=0$ 的起点。

**参考推理：**改变 $v$ 改变斜率；改变 $s_0$ 让整条线平移但斜率不变。记录选择的数值与固定量，而不只说“图变了”。

[回看：运动图](#worked-motion-example)

**练习 3C** 设计最小调试日志，区分特征顺序错位、漏加偏置、把目标放进预测。

**提示：**至少记录名称、长度或 shape、逐项贡献、加权和、偏置和最终预测；目标单独记录。

**参考推理：**依次打印 features 的语义顺序、weights、长度、contributions、weighted_sum、bias、prediction，最后另行打印 target 与 residual。配对不同定位顺序错误；加权和正确却少 5 定位偏置；预测表达式出现 target 定位信息泄漏。

[回看：Python 翻译](#python-translation)
