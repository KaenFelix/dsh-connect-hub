# 同步来源（连接器）清单

额度雷达不是「读一遍已安装插件清单、自动发现所有能报积分的东西」。它只认识**一张写死在代码里的来源表**，每个来源对应一个固定的 HTTP 地址和一套固定的返回结构。

- 来源表：`SYNC_SOURCES`（[client.js:1305](../client.js#L1305-L1311)）
- 每个来源的读取与解析：`syncTrae` / `syncWorkBuddy` / `syncMeoo` / `syncMadao` / `syncQoder`（[client.js:846](../client.js#L846-L1310)）
- 空白页与失败提示的文案也写死了这几个名字（`syncNone` / `syncNoAccounts` / `emptyDesc`，见 [locale/zh.json](../locale/zh.json)）

所以：**新装一个连接器，只要它不在下表里，雷达就不会去读它**，只能靠「添加订阅」手动录入；手动录入的条目不会被同步刷新，但也不会被清理。

## 已支持的五个来源

| 服务 | 连接器包 | 仓库 | 读取的接口 | 用到的字段 |
|---|---|---|---|---|
| Trae | [`dsh-connect-trae`](https://www.npmjs.com/package/dsh-connect-trae)（当前 4.18.8） | [dingminhua/dsh-connect-trae](https://github.com/dingminhua/dsh-connect-trae) | `/plugins/dsh-connect-trae/usage?region=cn&detail=full`<br>`/plugins/dsh-connect-trae/account-credits?region=cn` | `status`、`credits.available`、`credits.accounts[]`（`remain` / `expiresAtMs`）、`account.accountId`、`accounts[].generalAvailable` |
| WorkBuddy | [`dsh-connect-workbuddy`](https://www.npmjs.com/package/dsh-connect-workbuddy)（当前 5.31.2） | [dingminhua/dsh-connect-workbuddy](https://github.com/dingminhua/dsh-connect-workbuddy) | `/plugins/dsh-connect-workbuddy/account-credits?region=cn` / `?region=global`<br>`/plugins/dsh-connect-workbuddy/usage?region=cn` / `?region=global` | `accounts[]`（`credits` / `nearestExpiryMs`）、`credits.packages[]`（`remain` / `expiresAtMs` / `cycleRefreshMs`）、`accountId` |
| Meoo 秒悟 | [`dsh-connect-meoo`](https://www.npmjs.com/package/dsh-connect-meoo)（当前 0.0.6） | [xinstart-1/dsh-connect-meoo](https://github.com/xinstart-1/dsh-connect-meoo) | `/plugins/dsh-connect-meoo/status` | `login.name`、`points.available`、`points.nextExpiry`、`points.grants[]`（`remaining` / `expiresDate`） |
| 华为云码道（CodeArts） | [`dsh-connect-madao`](https://www.npmjs.com/package/dsh-connect-madao)（当前 0.9.2） | [XLNC-L/dsh-connect-madao](https://github.com/XLNC-L/dsh-connect-madao) | `http://127.0.0.1:8765/diag/account`（本机桥接服务，**不是** DSH 路由） | `ok`、`account`、`credit.remain`、`credit.total`、`credit.packageEnd` |
| Qoder | [`@dmh2002/dsh-connect-qoder`](https://www.npmjs.com/package/@dmh2002/dsh-connect-qoder)（当前 1.27.1） | [dingminhua/dsh-connect-qoder](https://github.com/dingminhua/dsh-connect-qoder) | `/plugins/dsh-connect-qoder/usage?region=cn` / `?region=global`<br>`/plugins/dsh-connect-qoder/account-credits?region=cn` / `?region=global` | `accountId` / `accountName`、`credits.total`（剩余之和）、`credits.packages[].size`、`pool.accounts[]`（`credits` / `nearestExpiryMs` / `expiringSoon`）；`account-credits` 的 `accounts[].credits` 兜底 |

几个和上表相关的实现细节：

- **Trae 只查 `region=cn`**。连接器其实支持三个面板 `cn` / `enterprise` / `ai`（见其源码 `TRAE_PANELS`），雷达只读国内版；`enterprise` 与 `ai` 面板的账号不会被同步进来。
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

1. 写一个 `syncX()`，把接口结果映射成 `{ sourceKey, service, account, plan, credits, total, expiresAt, lots }`；同时在 `index.js` 的 `CONNECTORS` 里加 `{ key: 'x', module: '包名' }`、在客户端的 `SOURCE_SERVICE` 里加显示名——否则开关状态读不到它，会一直当作「未知」而照常探测；
2. 把 `{ key: 'x', labelKey: 'sourceX', load: syncX }` 加进 `SYNC_SOURCES`（[client.js:1305](../client.js#L1305-L1311)）；
3. 把服务名加进 `SERVICES`（快速添加 + 编辑框 datalist，[client.js:25](../client.js#L25)）；
4. 在**两处**加 `sourceX` 文案：`client.js` 里的内联 `ZH` / `EN` 块（运行期实际用这两个），以及 `locale/zh.json`、`locale/en.json`（随包资源）。漏掉内联那对会让界面直接显示 key 名。

顺带把 `syncNone` / `emptyDesc`（「没有检测到 … 连接器」和空状态说明）里的服务清单补上新名字——这两条文案是枚举式的，不会自动跟着 `SYNC_SOURCES` 变。

注意 `sourceKey` 是去重与「改名残留」清理的主键（`mergeImported` / `pruneStale`，[client.js:741](../client.js#L741)、[client.js:795](../client.js#L795)），换 key 规则等于换账号身份，会让旧记录被当成幽灵清掉——Trae 早期按账号名建键、后来改按 `accountId`，就踩过这个坑。

## 开关状态：只同步「装好且开着」的连接器

雷达的 Host 半边（[index.js](../index.js)）注册了一条只读路由 `GET /plugins/dsh-credit-radar/connectors`，它读 **Cordis Loader** 的内存状态，而不是去试接口：

```json
{ "known": true, "connectors": [
  { "key": "qoder", "module": "@dmh2002/dsh-connect-qoder",
    "installed": true, "enabled": false, "available": false } ] }
```

判据（见 `stateOf`）：`installed` = Loader 里有这个模块名的条目（子路径条目如 `pkg/client` 也算）；`enabled` = 至少一行未被禁用；`available` = 至少一行 `disabled === false` **且** `fiber.state === 2`（Cordis 的 ACTIVE）。把 `available` 卡在 ACTIVE 而不是「装了就算」，是因为被禁用的行根本没有 fiber，而启动失败的行有 fiber 却没挂上路由——两者都会让接口 404。

`entry.disabled` 是个会求值 `!!js` 表达式的 getter，求值失败会抛错；这种行按**不可用**处理，与插件市场读同一字段的方式一致，不猜。

客户端侧（`loadSourceState` / `visibleEntries` / `suggestServices`）：

| 行为 | 说明 |
|---|---|
| 不探测关闭的来源 | 只对 `available === true` 的来源发请求，省掉必然 404 的那几次 |
| 卡片隐藏但保留记录 | 关闭后卡片从列表、统计、对话栏胶囊里一起消失；`localStorage` 里的记录**不删**，重新开启即恢复 |
| 手动记录永不隐藏 | 无 `sourceKey` 的条目不受影响 |
| 未知来源不隐藏 | Host 没报告到的 `sourceKey` 当作「不知道」，不当作「关掉了」 |
| 快速添加只列可用来源 | 关闭的来源不再出现在 chips 与编辑框 datalist 里 |
| 页面上有一行说明 | 有卡片因关闭而被隐藏时，显示「X 已关闭，相关卡片已隐藏（记录仍保留…）」 |

**Host 不回答时全部放开**：路由不存在（老 Host、非 Desktop 形态、读取失败）时 `known: false`，客户端退回「每个来源都试」，与改动前完全一致。把未知当「全关」会静默吞掉用户的账号，这是这里唯一不能犯的错。

同步结果文案也一并分开了，因为「关掉」和「坏了」是两件事：

| 情形 | 文案 |
|---|---|
| 全部来源都关着/没装 | `syncAllOff`：「以下连接器已关闭或未安装，本次没有读取：…」——**不再**报「未响应」 |
| 来源响应了但零条（未登录） | `syncSourceIdle`：「X 已响应但没有账号（可能未登录）」——之前这种状态**完全没有提示** |
| 来源请求失败/null | `syncSomeFailed`：「X 未响应」 |

## 为什么不改成自动发现

各连接器的积分接口字段形状差别很大（Trae 是 `credits.available` + 积分包，WorkBuddy 是 `accounts[]` + `packages[]`，Meoo 是 `points.grants[]`，码道是另一个进程的 `/diag/account`），没有统一的 schema 可依。即便自动枚举出已安装的 `dsh-connect-*`，每个来源仍要一段专属适配代码；而且「装了但没登录」和「装了但不该读」无法从包名区分。所以更实际的做法是维护上表这张可扩展的来源表，而不是猜。

## 来源清单与一键安装

页面上有一块「支持的连接器」列表，把**五个来源全部列出**，每行显示实时状态和对应动作：

| 状态 | 判定 | 行尾动作 |
|---|---|---|
| 已接入 | `available`（fiber ACTIVE） | 无按钮，直接参与同步 |
| 已关闭 | 安装了但被禁用 | 「去开启」→ 滚动到同步，提示去插件页打开 |
| 启动失败 | 装了、没禁用，但 fiber 未 ACTIVE | 显示「启动失败」，同样不伪装成可用 |
| 未安装 | Loader 里没有这个模块 | 「安装」→ 调用 Host 的安装路由 |

**安全边界**（这是关键，别改）：安装路由 `POST /plugins/dsh-credit-radar/install` 只接受连接器的 **key**（`trae` / `workbuddy` / `meoo` / `madao` / `qoder`），包名由 Host 侧的 `CONNECTORS` 白名单决定。前端**永远无法**传入任意包名——测试里 `{"key":"react"}` 会被 400 `unknown-connector` 拒绝，带了额外 `package` 字段也会被忽略。另外：非 POST 返回 405，非本机回环 Origin 返回 403，没有 `pluginManager` 服务时返回 `management-required` 而不是假装成功。

### 一个不明显的坑：`already-installed` 不等于已挂载

实测发现 `@dmh2002/dsh-connect-qoder` 处于这种状态：**仍在 profile 的 `dependencies` 里，但已从 `dsh.profile.bundles` 移除**。此时 Loader 里没有它的条目（`installed: false`），但 `installBundle` 直接回 `already-installed` 就结束了——面板会永远显示「未安装」，点安装也没用。

正确的补第二步是 `setBundleEnabled(name, true)`，那才是把 bundle 选进 profile、让 Loader 挂载它的操作。所以安装路由的处理是：

1. `installBundle(pkg, { enabled: true })`；
2. 如果结果是 `already-installed` 且 manager 有 `setBundleEnabled`，再调 `setBundleEnabled(pkg, true)`；
3. 后续调用失败就保留 manager 的原始答复，不谎报成功。

实测这条路径有效：调用 `setBundleEnabled('@dmh2002/dsh-connect-qoder', true)` 后，`/plugins/dsh-connect-qoder/usage` 立即从 404 变为 200，来源状态从 `installed: false` 变为 `available: true`。

### 结果文案

安装结果按真实状态分档，不会一律报「成功」：`applied` → 已安装；`restart-required` → 明确要求重启 DSH；`incompatible-version` → 版本不兼容未安装；`management-required` → 当前环境不能装（指引去插件页）；`timeout`/`network` → 网络问题可重试；其余 → 带错误码的失败。

安装成功后客户端会清掉状态缓存、重新读一次 Host、并触发一次静默同步，所以行状态和额度数字会自己刷新，不需要手动重载。

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

## 布局：单一列容器

页面所有内容都放在一个 `.cr-shell` 里（`max-width: 1280px; margin: 0 auto`），而不是给 `.cr-page` 的每个直接子元素分别设宽度和自动边距。

原来用的是后者，宽屏下会错位：`.cr-page > *` 给了 `margin-left/right: auto`，而 `.cr-head` 自己的 `margin: 0` 特异性相同、在样式表里更靠后，于是把两侧的 `auto` 清成 0——头部贴住页面的 padding 边，下面的卡片却仍然居中，两者左右边缘对不齐。改用单一容器后，子元素再怎么设自己的 margin 都不会影响列宽和居中。

两点值得记住：

- 模态框走 `ReactDOM.createPortal` 挂到 `document.body`，不在 `.cr-shell` 里，否则会被列宽限制、也会被父级的 `overflow` 裁掉。
- 窄屏断点（880px / 560px）不用跟着改：头部本来就是 `flex-wrap: wrap`，只是现在换行的基准从「整页宽度」变成了「列宽」，视觉上更稳。

## 本插件自身的仓库

`dsh-credit-radar` 目前**没有 Git 仓库、也没有发布到 npm**（`registry.npmjs.org/dsh-credit-radar` 返回 404，工作目录下也没有 `.git`）。要让别人拿到安装地址，需要先建仓库并发布；在那之前，分发方式只有本地打包（`pnpm pack` 产物 `dsh-credit-radar-1.0.0.tgz`）。