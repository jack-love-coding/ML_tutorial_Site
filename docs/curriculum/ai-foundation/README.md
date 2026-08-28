# AI 基础参考教材大纲来源

- 权威来源：`AI基础前置课_50小时_25节.csv`
- 来源文件：用户提供的 UTF-8 with BOM CSV，2026-08-20 纳入仓库。
- 运行时数据：`src/curriculum/courses/data/aiFoundation.ts`
- 稳定入口：`/courses/ai-foundation`

CSV 只用于大纲审计，不在浏览器运行时解析。TypeScript 课程目录保留 4 个阶段、25 个稳定单元 ID、每单元 2 个参考学时和总计 50 小时，并为学生可见内容补齐英文。

## 发布规则

- A—B 编共十四个单元达到完整教学闭环，状态为 `published`。
- C、D 编保留大纲元数据和阶段目标，状态为 `planned`，不生成可点击的未完成页面。
- 发布单元必须通过课程契约、双语、前置依赖和内部资源引用验证。
- 旧 `/spine`、`/learn/*`、Math Lab、Data Lab 和原有进度存储继续保留。

## 发布证据

- [B 编发布验证](./PART-B-VERIFICATION.md)：记录单元 07–14 的内容、路由、进度、响应式浏览器和安全门禁。
