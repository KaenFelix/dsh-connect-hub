# 同步来源（连接器）清单

连接中心不是「读一遍已安装插件清单、自动发现所有能报积分的东西」。它只认识**一张写死在代码里的来源表**，每个来源对应一个固定的 HTTP 地址和一套固定的返回结构。

- 来源表：`SYNC_SOURCES`（[client.js:1586](../client.js#L1586-L1592)）
- 每个来源的读取与解析：`syncTrae` / `syncWorkBuddy` / `syncMeoo` / `syncMadao` / `syncQoder`（[client.js:1118](../client.js#L1118-L1428)）
- 空白页与失败提示的文案也写死了这几个名字（`syncNone` / `syncNoAccounts` / `emptyDesc`，见 [locale/zh.json](../locale/zh.json)）

所以：**新装一个连接器，只要它不在下表里，连接中心就不会去读它**。页面本身没有手工录入入口；要凭空造一条记录，只能自己写一份备份 JSON 再「导入」（见 README 的「导出 / 导入设置」），这样来的条目不会被同步刷新，但也不会被清理。

## 已支持的五个来源

| 服务 | 连接器包 | 仓库 | 读取的接口 | 用到的字段 |
|---|---|---|---|---|
| Trae | [`dsh-connect-trae`](https://www.npmjs.com/package/dsh-connect-trae)（当前 4.18.8） | [dingminhua/dsh-connect-trae](https://github.com/dingminhua/dsh-connect-trae) | `/plugins/dsh-connect-trae/usage?region=cn&detail=full`<br>`/plugins/dsh-connect-trae/account-credits?region=cn` | `status`、`credits.available`、`credits.accounts[]`（`remain` / `expiresAtMs`）、`account.accountId`、`accounts[].generalAvailable` |
| WorkBuddy | [`dsh-connect-workbuddy`](https://www.npmjs.com/package/dsh-connect-workbuddy)（当前 5.31.2） | [dingminhua/dsh-connect-workbuddy](https://github.com/dingminhua/dsh-connect-workbuddy) | `/plugins/dsh-connect-workbuddy/account-credits?region=cn` / `?region=global`<br>`/plugins/dsh-connect-workbuddy/usage?region=cn` / `?region=global` | `accounts[]`（`credits` / `nearestExpiryMs`）、`credits.packages[]`（`remain` / `expiresAtMs` / `cycleRefreshMs`）、`accountId` |
| Meoo 秒悟 | [`dsh-connect-meoo`](https://www.npmjs.com/package/dsh-connect-meoo)（当前 0.0.6） | [xinstart-1/dsh-connect-meoo](https://github.com/xinstart-1/dsh-connect-meoo) | `/plugins/dsh-connect-meoo/status` | `login.name`、`points.available`、`points.nextExpiry`、`points.grants[]`（`remaining` / `expiresDate`） |
| 华为云码道（CodeArts） | [`@yzdys/dsh-connect-madao`](https://www.npmjs.com/package/@yzdys/dsh-connect-madao)（当前 0.12.0） | [KaenFelix/dsh-connect-madao](https://github.com/KaenFelix/dsh-connect-madao) | `http://127.0.0.1:8765/diag/account`（本机桥接服务，**不是** DSH 路由） | `ok`、`account`、`credit.remain`、`credit.total`、`credit.packageEnd` |
| Qoder | [`@dmh2002/dsh-connect-qoder`](https://www.npmjs.com/package/@dmh2002/dsh-connect-qoder)（当前 1.27.1） | [dingminhua/dsh-connect-qoder](https://github.com/dingminhua/dsh-connect-qoder) | `/plugins/dsh-connect-qoder/usage?region=cn` / `?region=global`<br>`/plugins/dsh-connect-qoder/account-credits?region=cn` / `?region=global` | `accountId` / `accountName`、`credits.total`（剩余之和）、`credits.packages[].size`、`pool.accounts[]`（`credits` / `nearestExpiryMs` / `expiringSoon`）；`account-credits` 的 `accounts[].credits` 兜底 |

几个和上表相关的实现细节：

- **Trae 只查 `region=cn`**。连接器其实支持三个面板 `cn` / `enterprise` / `ai`（见其源码 `TRAE_PANELS`），连接中心只读国内版；`enterprise` 与 `ai` 面板的账号不会被同步进来。
- **WorkBuddy 两个 region 都查**：`cn` 与 `global` 各读一次 `account-credits` 和 `usage`，合并成一张表；`usage` 是尽力而为，老版本连接器没有 `packages` 时卡片退回用 `nearestExpiryMs`。
- **码道绕过了 DSH 的插件路由**，直接访问连接器自己起的桥接服务 `127.0.0.1:8765`。这意味着：桥接服务没起、端口被改成别的（`config.port`）、或页面不在本机回环地址时，这一路必然失败——而 DSH 路由下的另外四个来源在同样的前提下仍可能正常。码道也只提供套餐整体到期日，拆不出批次。
- 五个来源都是**只读 GET**，不消耗积分、不切换账号、不修改上游状态。

## 第五个来源：Qoder

[`@dmh2002/dsh-connect-qoder`](https://www.npmjs.com/package/@dmh2002/dsh-connect-qoder)（1.27.1，仓库 [dingminhua/dsh-connect-qoder](https://github.com/dingminhua/dsh-connect-qoder)）已接入，是两个 region 分别读两份文档：

| 读什么 | 为什么 |
|---|---|
| `/plugins/dsh-connect-qoder/usage?region=cn` / `?region=global` | 当前在服务账号的 `accountId` / `accountName`、`credits.total`（**剩余**之和）、`credits.packages[].size`（用于进度条）、以及 `pool.accounts[]`——**批次到期只在这里**：每行有 `nearestExpiryMs` 与 `expiringSoon`（3 天内要作废的**金额**） |
| `/plugins/dsh-connect-qoder/account-credits?region=cn` / `?region=global` | 兜底：`usage` 读失败（超时/上游抖动）时仍能拿到每个 PAT 账号的 `credits`；也补上池视图里没出现的账号。这一份**没有到期日** |

接入时按连接器的真实语义做了三个判断，都写在 `syncQoder()` 的注释里：

1. **`credits.total` 是「剩余」不是「总额度」**（见连接器 `creditsOf`：`total` 是各包 `remain` 之和）。进度条的分母必须用 `packages[].size` 之和，否则会显示成「剩余 / 剩余 = 100%」。
2. **批次只有一条，不是每包一条。** `packages[]` 没有逐包到期；连接器只从签到批次推算出**一个**最近到期时刻和临期金额。所以 `lots` 是最多一项 `{ credits: expiringSoon, expiresAt: nearestExpiryMs }`，把包数当成条数会把余额放大好几倍。
3. **不用 `planExpiresAtMs` 冒充积分到期日。** 连接器 README 明确说这两件事是**刻意分开**的（早期混用是已修复的 bug）。所以没有签到批次时 `expiresAt` 留空、卡片进「待补充」，而不是拿套餐结束日顶替——那个日期到了积分并不会作废，用它排序会把 Qoder 排到错误的位置。

`sourceKey` 形如 `qoder:{region}:{accountId}`，与 Trae 一样按 ID 而非账号名，避免改账号名后留下幽灵记录。

## 新增第六个来源要改哪里

Qoder 那次改动就是模板，一共四处（外加下面列出的 Host 开关状态登记）：

1. 写一个 `syncX()`，把接口结果映射成 `{ sourceKey, service, account, plan, credits, total, expiresAt, lots }`；同时在 `index.js` 的 `CONNECTORS` 里加 `{ key: 'x', module: '包名', package: '包名' }`（`module` 是 Loader 行用的 specifier，`package` 是注册表安装用的名字，两者通常相同），并在 `SOURCE_INFO` 里补 `{ service, repo }`——连接器卡片的标题和仓库链接都从这里来——否则开关状态读不到它，会一直当作「未知」而照常探测；
2. 把 `{ key: 'x', labelKey: 'sourceX', load: syncX }` 加进 `SYNC_SOURCES`（[client.js:1586](../client.js#L1586-L1592)）；
3. 把服务名加进 `SOURCE_SERVICE`（对话栏胶囊的行名，[client.js:1511](../client.js#L1511)）和 `SOURCE_INFO`（来源列表的服务名与仓库链接，[client.js:1541](../client.js#L1541)）；
4. 在**两处**加 `sourceX` 文案：`client.js` 里的内联 `ZH` / `EN` 块（运行期实际用这两个），以及 `locale/zh.json`、`locale/en.json`（随包资源）。漏掉内联那对会让界面直接显示 key 名。

顺带把 `syncNone` / `emptyDesc`（「没有检测到 … 连接器」和空状态说明）里的服务清单补上新名字——这两条文案是枚举式的，不会自动跟着 `SYNC_SOURCES` 变。

注意 `sourceKey` 是去重与「改名残留」清理的主键（`mergeImported` / `pruneStale`，[client.js:831](../client.js#L831)、[client.js:885](../client.js#L885)），换 key 规则等于换账号身份，会让旧记录被当成幽灵清掉——Trae 早期按账号名建键、后来改按 `accountId`，就踩过这个坑。

## 开关状态：只同步「装好且开着」的连接器

Host 半边（[index.js](../index.js)）注册了一条只读路由 `GET /plugins/dsh-connect-hub/connectors`，它读 **Cordis Loader** 的内存状态**加上插件管理器的 bundle 清单**，而不是去试接口（去试接口会把「关掉」和「挂了」混为一谈，还会多打一堆必然 404 的请求）：

```json
{ "known": true, "managed": true, "connectors": [
  { "key": "qoder", "module": "@dmh2002/dsh-connect-qoder",
    "package": "@dmh2002/dsh-connect-qoder",
    "installed": true, "enabled": false, "available": false } ] }
```

判据（见 `stateOf`）：**`installed` 以 profile 的 bundle 清单为准**，不是 Loader 里有没有条目——这是本文档早先版本搞错的地方，见下面「两个开关」。`enabled` = bundle 被选进 `dsh.profile.bundles` **且**（有 Loader 行时）至少一行未被禁用；`available` = 至少一行 `disabled === false` **且** `fiber.state === 2`（Cordis 的 ACTIVE）。把 `available` 卡在 ACTIVE 而不是「装了就算」，是因为被禁用的行根本没有 fiber，而启动失败的行有 fiber 却没挂上路由——两者都会让接口 404。

Host 同时返回一个 `managed` 字段：`true` 表示 `installed` 来自插件管理器的 bundle 清单；`false` 表示这台 Host 没有插件管理器，`installed` 只能退化成「Loader 里有行」。

`entry.disabled` 是个会求值 `!!js` 表达式的 getter，求值失败会抛错；这种行按**不可用**处理，与插件市场读同一字段的方式一致，不猜。

### 两个开关：「装了」和「开着」是两件事

DSH 里一个连接器可以以两种互不相干的方式「关掉」：

| 关法 | profile 里的样子 | Loader 里的样子 |
|---|---|---|
| bundle 没被选中 | `dependencies` 里有、`dsh.profile.bundles` 里没有 | **完全没有任何行** |
| 插件行被禁用 | 两者都有 | 有行，`disabled: true`、无 fiber |

旧实现只看 Loader，于是第一种被读成「未安装」——可它的文件明明在 `node_modules` 里，重新 `installBundle` 只会回 `already-installed`，面板就永远卡在「未安装」+ 一个按了没反应的安装按钮。Qoder 当时就是这个状态。

所以 `stateOf` 现在把两个来源合起来判：

- `installed`：profile 的 bundle 清单里 `installed === true` 且 `availability !== 'missing'`（`missing` 是目录里没有文件、只在官方 catalog 里出现的条目），**或** Loader 里仍有行；
- `enabled`：bundle 被选中，且（有行时）行没被禁用；
- `available`：仍只认 Loader 的 ACTIVE fiber。

这三者分开之后，UI 才能给出三个不同的动作，而不是把中间那种塞进「安装」。

客户端侧（`loadSourceState` / `visibleEntries` / `connectorStateOf`）：

| 行为 | 说明 |
|---|---|
| 不探测关闭的来源 | 只对 `available === true` 的来源发请求，省掉必然 404 的那几次 |
| 卡片隐藏但保留记录 | 关闭后卡片从列表、统计、对话栏胶囊里一起消失；`localStorage` 里的记录**不删**，重新开启即恢复 |
| 手动记录永不隐藏 | 无 `sourceKey` 的条目不受影响 |
| 未知来源不隐藏 | Host 没报告到的 `sourceKey` 当作「不知道」，不当作「关掉了」 |
| 关闭的来源变成连接器卡片 | 它的账号卡片消失，但同一位置出现一张写着「已关闭」并带「启用」按钮的连接器卡片，原因和办法在同一处（见「连接器卡片」一节） |

**Host 不回答时全部放开**：路由不存在（老 Host、非 Desktop 形态、读取失败）时 `known: false`，客户端退回「每个来源都试」，与改动前完全一致。把未知当「全关」会静默吞掉用户的账号，这是这里唯一不能犯的错。

同步结果文案也一并分开了，因为「关掉」和「坏了」是两件事：

| 情形 | 文案 |
|---|---|
| 全部来源都关着/没装 | `syncAllOff`：「以下连接器已关闭或未安装，本次没有读取：…」——**不再**报「未响应」 |
| 来源响应了但零条（未登录） | `syncSourceIdle`：「X 已响应但没有账号（可能未登录）」——之前这种状态**完全没有提示** |
| 来源请求失败/null | `syncSomeFailed`：「X 未响应」 |

## 为什么不改成自动发现

各连接器的积分接口字段形状差别很大（Trae 是 `credits.available` + 积分包，WorkBuddy 是 `accounts[]` + `packages[]`，Meoo 是 `points.grants[]`，码道是另一个进程的 `/diag/account`），没有统一的 schema 可依。即便自动枚举出已安装的 `dsh-connect-*`，每个来源仍要一段专属适配代码；而且「装了但没登录」和「装了但不该读」无法从包名区分。所以更实际的做法是维护上表这张可扩展的来源表，而不是猜。

## 连接器卡片：状态就写在卡片区里

页面上**没有**单独的「支持的连接器」列表了。连接器没有额度可显示时，它就以一张**连接器卡片**的身份出现在额度卡片所在的同一个网格里——用户看到的是「这里本该有一张卡，但它缺一个开关」，而不是另起一段去读一张清单。

五种样子，一套规则：

| 卡片状态 | 判定 | 卡片上的动作 |
|---|---|---|
| 额度卡片 | 有该来源的同步记录 | 正常显示积分/到期；同一来源的**第一张**卡片底部带「禁用」 |
| 已接入 | `available`（fiber ACTIVE），但还没有记录 | 「禁用」 |
| 已关闭 | `installed` 且 `!enabled` | 「启用」 |
| 启动失败 | `installed`、`enabled`，但 `!available` | 「重试启动」 |
| 未安装 | `!installed` | 「安装」 |

「已关闭」和「启动失败」这两种都**带「已安装」的语义**（卡片底部标 `已安装`），因为用户最需要知道的是：东西已经在盘上了，缺的只是一个开关。旧实现把第一种显示成「未安装」，这正是用户报的 bug。

### 卡片封面：下载到本地的平台图标

每张卡左上角的方块是**平台自己的品牌图标**，不再是 `TR` / `WB` 这种首字母文本，也不是画的线条图形。

图标以 **PNG 文件随包分发**，放在 `lib/assets/brand/`，通过包自身的 `./assets/*` 导出由框架路由到 `plugins/dsh-connect-hub/assets/brand/<file>`：

```json
"exports": { "./assets/*": "./lib/assets/*" }
```

| 来源 | 取自 |
|---|---|
| Trae | `www.trae.ai` 的 `<link rel="icon">`（深色底 + 霓虹标记） |
| WorkBuddy | `www.workbuddy.ai` 的 `logo.svg`，栅格化 |
| Meoo 秒悟 | `meoo.com` 的 favicon（alicdn，184px） |
| 华为云码道 | `codearts.huaweicloud.com` 的 CodeArts 品牌标记 |
| Qoder | `www.qoder.com/favIcon.svg`，栅格化 |

逐条来源与原始尺寸记在 [`lib/assets/brand/sources.md`](../lib/assets/brand/sources.md)。这些是各公司的商标，在这里只用于标识卡片属于哪个服务。

**为什么下载而不是热链**：页面必须在没有网络时也能正确渲染，而且品牌站改版不该让卡片变空白。

**为什么不复用连接器包里的 `icons/*.png`**：`shasum` 实测 **Trae、WorkBuddy、Qoder 三个包里的图标是同一张占位图**（三个哈希完全一致），码道的是一张「码」字图，Meoo 根本没有 `icons/` 目录。直接复用会让五个平台显示成同一个 logo。

文件名里的 12 位十六进制是**文件内容的 SHA-1 前缀**，跟随框架的 `./assets/*` 约定：内容一改文件名就变，旧缓存不可能显示错图标。替换图标时先算出新哈希再改名，测试会核对两者一致。

识别顺序是**先看 `sourceKey`，再看名字**：同步来的条目带 `sourceKey`，那就是它来自哪个连接器，改过名的账号也认得；手动录入的老记录没有 `sourceKey`，退回到名字匹配（`brandKeyOf`）。两者都不命中时仍然回落到首字母，不会出现空白方块。

新增第六个来源时，想让它有图标就把 PNG 放进 `lib/assets/brand/`、在 `BRAND_ASSETS` 里加一条；不加也能正常工作，只是显示首字母。

几个刻意的设计：

- **「禁用」每来源只出现一次**，挂在该来源的第一张卡片上。开关是连接器级别的，十一个账号卡片各带一个会读成十一个不同的开关。
- **连接器卡片只在「全部」筛选下出现**，且可被搜索命中（搜 `qoder` 能找到它）。其余筛选都是额度状态，一张没有额度的卡片不可能匹配。
- **一条记录都没有时**，页面不塌回「空状态」：统计条和筛选条收起，五张连接器卡片照常显示，因为这时它们才是页面唯一能做的事。
- 关掉之后**记录一条都不删**；重新启用后卡片立刻回来。原来那行「X 已关闭，相关卡片已隐藏」的说明因此删掉了——现在的卡片自己就写着「已关闭」并带着「启用」按钮，原因和办法在同一处。

### 双向开关：启用与禁用

一条路由兼两个方向：`POST /plugins/dsh-connect-hub/enable`，body 是 `{ key, enabled }`。`enabled` 缺省为 `true`，所以改动前写的请求（只有 `{ key }`）仍然是「开启」。

- **开启**（`enableConnector`）：`setBundleEnabled(pkg, true)` → 若回 `not-bundle` 则改走 `installBundle` → 再逐行放开仍被禁用的 Loader 行（`setPluginEnabled`）。
- **关闭**（`disableConnector`）：`setBundleEnabled(pkg, false)`，即把 bundle 从 `dsh.profile.bundles` 移除**但保留依赖**。实测这会把该连接器留在「已安装 · 已关闭」这个状态，`package.json` 的 `dependencies` 和 `node_modules` 里的文件都不动，重新启用不需要任何下载。只有当这个包根本不是 bundle 时（`not-bundle`）才退回关掉它的 Loader 行。

**安全边界**（这是关键，别改）：安装与开关两条路由都只接受连接器的 **key**（`trae` / `workbuddy` / `meoo` / `madao` / `qoder`），包名由 Host 侧的 `CONNECTORS` 白名单决定。前端**永远无法**传入任意包名——测试里 `{"key":"react"}` 会被 400 `unknown-connector` 拒绝，带了额外 `package` 字段也会被忽略。另外：非 POST 返回 405，非本机回环 Origin 返回 403，没有 `pluginManager` 服务时返回 `management-required` 而不是假装成功。

### 一个不明显的坑：`already-installed` 不等于已挂载

实测发现 `@dmh2002/dsh-connect-qoder` 处于这种状态：**仍在 profile 的 `dependencies` 里，但已从 `dsh.profile.bundles` 移除**。此时 Loader 里没有它的条目，旧实现因此读成 `installed: false`；而 `installBundle` 面对已存在的依赖只回 `already-installed` 就结束了——面板于是永远显示「未安装」，点那个安装按钮也什么都不会发生。

现在这条路径有两个出口，先后都保留：

- **状态层**：`stateOf` 不再靠 Loader 判断 `installed`，这个连接器直接读成「已关闭」的卡片，「启用」就在卡上（这是主要修法）；
- **安装层**：仍保留 `already-installed` → `setBundleEnabled(pkg, true)` 的兜底，因为老版本客户端、或用户直接点「安装」时还会走到这条路。

实测这条路径有效：调用 `setBundleEnabled('@dmh2002/dsh-connect-qoder', true)` 后，`/plugins/dsh-connect-qoder/usage` 立即从 404 变为 200，来源状态转为 `available: true`；再调 `setBundleEnabled(..., false)` 则回到 `enabled: false` 且文件仍在。

### 结果文案

结果按真实状态分档，不会一律报「成功」：`applied` 之外还有 `restart-required`（改完要重启才生效）、`incompatible-version`（版本不兼容，未安装）、`management-required`（当前环境不能改，指引去插件页）、`timeout`/`network`（网络问题可重试）、`not-bundle`（开启时名字被选中但文件不在了，自动改走安装），其余带错误码。

成功文案分三档，不会混着报：安装说「已安装 {package}」、启用说「已开启」、禁用说「已关闭，记录会保留」。三种成功之后客户端都会清掉状态缓存、重新读一次 Host、并触发一次静默同步，所以卡片状态和额度数字会自己刷新，不需要手动重载。

## 只读：没有任何手工录入入口

面板是**纯展示**的看板：没有「添加订阅」、没有卡片上的「编辑」、没有快速添加 chips，也没有编辑弹窗。五个连接器是唯一的数据来源。

这不是纯粹的简化，而是修掉一个实际失效的交互。读同步的合并逻辑（`mergeImported`，[client.js](../client.js)）就能看到：同步来的条目每次都**整体覆盖** `service` / `account` / `plan` / `credits` / `total` / `expiresAt` / `lots`，只保留 `note`。也就是说，编辑一张同步卡片，下一次同步就把改动冲掉了——那个按钮本来就是在骗人。

几点处理方式：

| 情况 | 行为 |
|---|---|
| 同步过来的卡片 | 只读，底部显示「连接器同步」 |
| 以前手工录入的记录 | 仍然**显示**（不删用户数据），底部标注「旧手动记录（只读）」 |
| 记录缺积分或到期日 | 卡片进「待补充」分组，Hero 提示「该连接器没有给出数据，重新同步或检查登录状态」 |
| 空状态 | 只留「同步连接器」一个动作；文案明确「数据只来自连接器，这里不提供手工录入」 |

`localStorage` 里的旧手动记录会一直保留，想清掉只能清除站点数据；这是刻意不做自动删除——静默移除用户看得见的数据比留一条只读记录更糟。

页面上的「导出 / 导入」不违反这条：它们搬的是**已有的记录**，不提供逐字段编辑，导入走的也是同步用的同一条合并逻辑（按 `sourceKey`、再按服务名+账号匹配，较新的 `updatedAt` 赢），所以导入进来的条目下一次同步照样会被连接器的真实数据覆盖——和以前那张骗人的「编辑」按钮不同，这里没有任何一处声称能改动同步来的字段。

## 布局：单一列容器

页面所有内容都放在一个 `.cr-shell` 里（`max-width: 1280px; margin: 0 auto`），而不是给 `.cr-page` 的每个直接子元素分别设宽度和自动边距。

原来用的是后者，宽屏下会错位：`.cr-page > *` 给了 `margin-left/right: auto`，而 `.cr-head` 自己的 `margin: 0` 特异性相同、在样式表里更靠后，于是把两侧的 `auto` 清成 0——头部贴住页面的 padding 边，下面的卡片却仍然居中，两者左右边缘对不齐。改用单一容器后，子元素再怎么设自己的 margin 都不会影响列宽和居中。

两点值得记住：

- 模态框走 `ReactDOM.createPortal` 挂到 `document.body`，不在 `.cr-shell` 里，否则会被列宽限制、也会被父级的 `overflow` 裁掉。
- 窄屏断点（880px / 560px）不用跟着改：头部本来就是 `flex-wrap: wrap`，只是现在换行的基准从「整页宽度」变成了「列宽」，视觉上更稳。

## 本插件自身的仓库

包名是 `dsh-connect-hub`，**没有发布到 npm**（`registry.npmjs.org/dsh-connect-hub` 返回 404）。没直接用 `dsh-connect` 是因为那个名字已经被一个飞书/Telegram 桥接插件占用，且它和 `dsh-connect-trae` 这类连接器包名极易混淆。

仓库在 [KaenFelix/dsh-credit-radar](https://github.com/KaenFelix/dsh-credit-radar)——**目录名和仓库名仍是旧的**，只有包名、入口 ID 与文案改成了连接中心。改目录要同步重挂 profile 的 link 依赖，所以单独做。分发方式：仓库 + 本地打包（`pnpm pack` 产物 `dsh-connect-hub-1.0.0.tgz`）。