# 2026-10-11 发布依赖修复

插图教学 PR #86 的 CI 已通过测试、构建和浏览器验收，但在安全审计处失败。本次独立修复依赖，不改课程内容、冻结数据或安全审计阈值。

| 依赖 | 锁定版本变化 | 原因 |
| --- | --- | --- |
| Vue 与其编译／运行时包 | 3.5.31 → 3.5.43 | [SSR 属性名检查缺漏](https://github.com/advisories/GHSA-g2v6-rqmx-r4w6)，修复版本自 3.5.42 起 |
| KaTeX | 0.16.44 → 0.18.10 | [继承的 trust 配置可能绕过限制](https://github.com/advisories/GHSA-238p-pmpm-9mq7)，修复版本自 0.18.2 起 |
| source-map-js | 1.2.1 → 1.2.2 | [索引 source map 偏移量导致拒绝服务](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) |
| TensorFlow 下的 argparse | 1.0.10 → 2.0.1 | 移除有 [精度参数拒绝服务问题](https://github.com/advisories/GHSA-hp3w-g68c-fv3c) 的 sprintf-js 依赖 |

`@tensorflow/tfjs` 保持 4.22.0，模型结构、权重与输入处理不变。仅对它的 argparse 依赖使用定向 override。已检查 4.22.0 发布包：浏览器推理未引用 argparse，发布包的自定义构建 CLI 使用 yargs；同时验证 CLI 的 `--help` 和被替换解析器的参数解析。argparse 2.0.1 不依赖 sprintf-js，且仍保留 v1 兼容接口；不升级到已移除此接口的 3.x。后续 TensorFlow 发布移除此旧依赖后，应删除 override。

KaTeX 的间接 CLI 依赖 commander 15 要求 Node >=22.12；项目构建和 CI 使用现有 Node 24。Vue 所需的 Babel 解析器跟随更新，其余无关依赖保持原锁定版本。

验证包括干净 `npm ci`、`npm test`、两种生产构建、课程目录及发布资源检查。新增运行时回归覆盖继承 trust 时仍拒绝公式 HTML、TensorFlow CLI 和解析器、冻结 Tiny VGG 的加载与预测及张量释放。浏览器覆盖算法教学模式、数学 provider、异步加载与存储保留；实际结果随 PR 记录更新。普通测试仍有 28 项离线环境相关条件跳过，本次没有重新生成 Notebook。

本地结果：1158 项测试通过、28 项跳过；两种构建、8 项发布资源检查、目录检查通过。浏览器通过 22 个教学模式、28 个数学 provider、9 个按需加载和 40 个历史数据保留场景。干净安装后 `npm run security:audit` 为 0 项漏洞，`npm ls` 无无效依赖。

2026-10-12 远端结果：[PR #89 CI](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38129732861) 通过，以 merge commit `d880fb22215f4d4a4ee931ed0d74606cad48eb53` 合并，[Pages 部署](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38216295558) 成功，线上 release.json 与该 SHA 和 runId 一致。随后 #86、#87、#88 依次通过包含安全审计的实际 CI 并部署。完整发布证据及保留依赖修复的回退点见 [发布记录](releases/textbook-refactor-release.md)。
