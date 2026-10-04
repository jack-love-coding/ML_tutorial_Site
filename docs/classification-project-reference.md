# 分类项目参考包

沿用现有 classification-project 的六章和 URL，补齐可执行数据、代码、双语 Notebook 与参考结果。单元 6 的试用状态在后续独立发布中调整，本参考包修复本身不开放新单元。

## 唯一维护入口

Python 流程只维护在 scripts/classification-project/reference.py，六个显式 cell 标记对应网页六章和 Notebook 六个代码单元。build-reference.py 执行同一份代码，生成 public/classification-project/v1/ 及 src/data/generated/classificationProjectRuntime.ts。网页说明在 classificationProjectModule.ts，代码和数值表从生成文件读取；不手工修改公开 Notebook、结果、代码副本或 runtime 数值。

普通测试独立检查数据集合无交叉、验证集每个阈值的混淆矩阵/指标/成本、AUC、阈值选择、最终报告分母、下载文件 hash、代码一致性、双语已执行输出和课程回看链接。严格重生成在匹配的离线环境中运行训练与两份 Notebook，每份使用独立内核，再逐字节比较全部冻结文件；它不是仅加载现有结果 JSON。

## 数据、来源与边界

复用已入库的 [UCI SMS Spam Collection](https://archive.ics.uci.edu/dataset/228/sms+spam+collection)，作者 Tiago Almeida、José María Gómez Hidalgo，CC BY 4.0，DOI 10.24432/C5CC84。原始来源及转换记录保留在 public/datasets/numerical-methods/sms-spam-manifest.json。CSV 为 5574 行、507860 bytes，SHA-256 d43a9b9fe1530f4cc58a1e01ad23ee466283c9abce4a83be17b199899bd584f8；没有改动它或其他现有冻结包。

该语料也用于稀疏矩阵专题。项目独立冻结划分，重新学习训练词表，不能复用原专题全语料的词表/IDF。原来源记录的 403 条是原文完全重复数；本项目先 casefold，再合并空白，去掉 415 条规范化重复消息，只保留每组第一条，共 5159 条，无冲突标签组。

先分层留出 20% test（seed 42），再从其余数据分层留出 25% validation（seed 43）。split.json 记录原始行号及顺序；各组消息只出现于一个集合。训练 3095 条（ham 2710/spam 385）、验证 1032 条（903/129）、测试 1032 条（904/128）。这与单元 5 的 banknote 分类数据独立；公开 SMS 参考结果不代表未来通信流的表现。

## 冻结流程

以下协议在首次项目计算前确定，未按 test 结果修改：

1. Pipeline 中使用 TfidfVectorizer(min_df=2, ngram_range=(1, 2)) 与 LogisticRegression(solver="liblinear", max_iter=1000, random_state=42)。
2. train 内三折 StratifiedKFold(shuffle=True, random_state=42)，比较 C=[0.5, 1, 2]，以 spam F1 选择。每折独立拟合词表和模型；选中后也只在 train 上 refit。
3. 在外部 validation 上比较 0.10—0.90、间隔 0.05 的阈值，最小化 5 × FP + FN。平局先选较少 FP，再选较高阈值。真实值与预测值都用 spam/ham 字符串。
4. 锁定 C 和阈值后，才计算一次 test 汇总；复盘只展示 validation 错误。后续不得用已看到的 test 重选方案，再声称是独立最终评估。

参考选择 C=2、阈值 0.45，训练矩阵为 3095 × 7612。验证 TP/FP/TN/FN=103/1/902/26，成本 31；测试=103/0/904/25，成本 25。测试 precision=1、recall=0.80468750、F1=0.89177489、AUC=0.99573078。零误拦只是这一固定样本的观察；仍漏掉 25 条 spam。val 的多数类 accuracy=0.875，说明仅看 accuracy 会掩盖漏检。

## 重生成与核验

环境、99 个离线 wheel 和原始缓存合同见 [可复现验证](reproducible-validation.md)。不会自动联网下载依赖；缺失或版本不符直接失败。

- npm run classification-project:stage：在隔离环境中训练、运行中英文 Notebook，输出到 .cache/classification-project/candidate-UUID；不改动公开包。
- 审查候选协议、数值、文件列表后，将该候选的 public/classification-project/v1 和 src/data/generated/classificationProjectRuntime.ts 一起复制到对应位置。现有包的任何新版本必须单独审查；不要只替换部分产物。
- npm run classification-project:check：临时重生成，逐字节比较公开包和 runtime，检查整个仓库 bytes/mtime 不变。
- npm run test:offline-notebooks：现有 67 项严格检查通过后，再执行分类项目的两份独立 Notebook 重运行。
- npm test、npm run build、npm run build:pages、npm run curriculum:check，以及 node scripts/qa/run-textbook-smoke.mjs classification-project。

严格检查期间不要编辑、提交或切换分支。生成器只输出候选；缓存和临时环境不入库。日常 CI 验证冻结包，严格环境专门验证重生成，两者结果分别记录。浏览器专项覆盖六章的双语代码折叠、下载、当前章节实验场景、键盘、刷新、390px、reduced motion 及空/历史存储不变。
