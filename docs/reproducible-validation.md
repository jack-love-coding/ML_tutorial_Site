# 浏览器与严格离线验证

## 浏览器环境

运行 `npm ci` 后执行 `npm run browser:install`、`npm run browser:check`。仓库固定 `@playwright/cli@0.1.18`，其 lockfile 对应 Playwright `1.63.0-alpha-2026-08-05`、Chromium `152.0.7977.8` / revision `1237`。检查命令核对已安装可执行文件的实际版本，缺失时失败。版本升级必须同时审查 lockfile 并重跑浏览器验收。

所有 `scripts/qa/run-*.mjs` 显式传入 `scripts/qa/browser.config.json`，使用包管理的 Chromium 和 headless 模式。CI 通过 `playwright install --with-deps chromium` 安装相同版本及 Linux 系统依赖，再验证版本，不依赖 runner 上的系统 Chrome。浏览器运行需要已经构建的 Pages 产物；候选单元用 `TEXTBOOK_SMOKE_UNITS=unit-3` 等选择，测试本身不改变发布状态。

连续阅读按已开放单元逐个执行，每次仍验证末节的跨单元链接。这样新增试用单元会自动加入验收，单个探针的超时上限不需要随全站章节数持续增加。

## 冻结产物与离线重生成

普通 `npm test` / CI 检查公开冻结产物、资源引用和 manifest；28 项需要本地候选数据与离线环境的检查仅在显式设置 `ML_ATLAS_REQUIRE_LOCAL_RELEASE_ASSETS=1` 时运行。缓存存在不会悄悄改变普通测试的范围。

重生成或检查候选包时运行 `npm run test:offline-notebooks`。它先执行只读预检，随后启用严格套件，最后重生成并比较分类项目参考包的两份 Notebook；环境/缓存缺失或不匹配时失败，不将跳过当作验证成功。预检复用现有生成器的合同校验，核对 Python、平台、精确依赖表、wheel 清单及全部文件的 bytes/SHA-256，再检查候选目录存在。Notebook 输出、数据边界、发布事务与回滚由严格套件检查。分类项目的独立冻结协议与生成入口见 [参考包说明](classification-project-reference.md)。

当前合同要求 CPython `3.12.13`、Darwin `arm64`、`macosx-11.0-arm64`。wheel 清单位于 `.cache/numerical-methods/batch-4-wheelhouse/batch-4-wheel-cache-manifest.json`，99 个 wheel，清单 SHA-256 为 `95ca3095110658363933ecfa7c64dc5935e03c09119a612603c38fec30bc78e1`。原始数据缓存为 `.cache/loss-functions/phase-26-sources`，预检同时核对其 hash、bytes、内容与来源清单。候选目录为 `.cache/loss-functions/phase-26-staging` 与 `.cache/linear-regression/phase-27-staging`。不要用 Ubuntu 或不同 Python 的通过结果代替该合同；更换重生成环境需另立合同并重新冻结产物。

恢复已有缓存时复制到隔离工作区，保留原件；不要把缓存、临时虚拟环境或 Notebook 临时输出提交到 Git。现有生成器在临时 venv 中使用 `pip --no-index --find-links` 安装已核验依赖并限制网络；不要求宿主 Python 全局安装 Jupyter。`python3 scripts/check-offline-environment.py --cache-root /path/to/cache` 可只读核查外部缓存，不会下载或修改缓存。

章节展示数据放在 `public/loss-functions/display`，由 `npm run loss:display:generate` 从冻结结果生成，并由 `npm run loss:display:check` 验证。它们不属于 `public/notebooks/loss-functions` 的 16 个冻结包成员，不能放入该目录，否则严格的完整清单校验会拒绝额外文件。迁移路径不会改变展示数值、完整下载产物或 Notebook 输出。严格套件还检查整个仓库文件的 bytes 与 mtime；执行期间不要编辑源码、切换分支或提交。

## 部署核验

Pages 构建输出 `release.json`，记录本次 `GITHUB_SHA`、push 前的 `previousSha`、Actions run ID 和每个单元的发布状态。部署成功后将该文件与最后一个合并 SHA 对照；本地构建使用 `local-unpublished` 且 SHA 为空，不能当作上线证明。回退应重部署上一已验证 SHA，保留课程 URL 与历史浏览器存储。

## 2026-10-04 本地严格验收

在上述匹配环境及隔离缓存副本中，`npm run test:offline-notebooks` 67 项全部通过，0 跳过。包含四份损失函数 Notebook、两份回归 Notebook 的独立离线重运行、冻结数值与双语输出一致性，以及发布事务的失败回滚检查。整个检查期间仓库文件的 bytes、size 和 mtime 不变，完整下载产物未重新冻结。

普通 `npm test` 仍保留 28 项条件跳过；本次由独立严格套件补齐验证，不改变普通 CI 的冻结产物检查范围。未来修改生成器、环境合同或冻结数据时必须重跑严格套件，本记录不能代替后续验证。

分类项目参考包补齐后，再次运行完整命令：原严格套件 67 项通过、0 跳过，随后 SMS 参考代码及两份双语 Notebook 在独立内核中离线重运行通过。全部新产物与冻结包逐字节一致，仓库 bytes/mtime 不变。本次共验证原六份 Notebook 与新增两份 SMS Notebook。
