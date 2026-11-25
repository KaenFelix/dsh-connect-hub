# 订阅额度雷达 · dsh-credit-radar

在 DeepSeek Harness 左侧栏增加一个「额度雷达」入口，把多个订阅/账号的剩余积分和到期日集中到一页，按到期先后排序，回答「下一笔该用哪个」。

## 使用

1. 安装并启用本插件，刷新页面。
2. 对话栏输入框下方多了一个「额度雷达 102,226.5」的小按钮：点一下就在这个按钮正上方弹出额度速览（和 DSH 自带的「会话统计」一样贴着按钮展开）——按紧急程度排好的订阅列表，每行显示积分、到期日和状态（弹框只放列表和刷新/打开两个动作，顶部三块统计数字只留在完整页面里）。右上角是「自动刷新 · N 分钟」，点开就能改间隔或关掉，弹框不再有单独的关闭按钮——点外面或按 Esc 就收起。间隔菜单会按弹框剩余高度自适应，不会盖住底部两个按钮。弹框里可以直接「刷新额度」，或点「打开面板」跳到完整页面。按钮上的数字实时跟随同步结果；有订阅 7 天内到期时，图标和数字会变成警示色并带一个小圆点。
3. 点击左侧栏的「额度雷达」图标（或弹框里的「打开面板」）进入完整页面。
4. 页面默认开启「自动刷新」：打开页面时若数据已过期会立即读取一次，之后按设定间隔自动读取；窗口切回前台也会补一次。点右上角「自动刷新 · 5 分钟」可改间隔（30 秒 / 1 / 2 / 3 / 5 / 10 / 30 分钟）或关掉；也可以随时点「同步连接器」手动读取。读取范围**固定为下面「同步来源」里的五个连接器**，不支持自动发现其他已安装的连接器。
5. 也可以在页面上点「添加订阅」手动录入，或点「编辑」修正同步结果。
6. 页面根据到期日自动排序：越早到期排越前；已过期排在可用额度之后；缺积分或缺到期日的条目归入「待补充」。
7. 同一账号的积分常常分批到期，排序看的是「最早会作废的那一批」：例如某账号整包 30 天后到期，但其中 100 积分 7 天后就过期，它仍然排在 10 天后到期的订阅前面。卡片会用「部分 7 天后到期」和「其中 100 积分 7 天后到期」标出这批积分，顶部「7 天内到期」也只统计真正会在这周作废的额度。

## 同步来源

雷达只认识一张写死在代码里的来源表（`SYNC_SOURCES`，[client.js:1157](client.js#L1157-L1163)），**不枚举已安装的插件**。五个来源如下，接口地址与字段解析各自写死在 `syncTrae` / `syncWorkBuddy` / `syncMeoo` / `syncMadao` / `syncQoder` 里：

| 服务 | 连接器包 | 仓库 | 读取的接口 |
|---|---|---|---|
| Trae | `dsh-connect-trae`（4.18.8） | [dingminhua/dsh-connect-trae](https://github.com/dingminhua/dsh-connect-trae) | `/plugins/dsh-connect-trae/usage` 与 `/account-credits`（**仅 `region=cn`**） |
| WorkBuddy | `dsh-connect-workbuddy`（5.31.2） | [dingminhua/dsh-connect-workbuddy](https://github.com/dingminhua/dsh-connect-workbuddy) | `/plugins/dsh-connect-workbuddy/account-credits` 与 `/usage`（`cn` + `global`） |
| Meoo 秒悟 | `dsh-connect-meoo`（0.0.6） | [xinstart-1/dsh-connect-meoo](https://github.com/xinstart-1/dsh-connect-meoo) | `/plugins/dsh-connect-meoo/status` |
| 华为云码道 | `dsh-connect-madao`（0.9.2） | [XLNC-L/dsh-connect-madao](https://github.com/XLNC-L/dsh-connect-madao) | 本机桥接服务 `http://127.0.0.1:8765/diag/account`（不走 DSH 路由） |
| Qoder | `@dmh2002/dsh-connect-qoder`（1.27.1） | [dingminhua/dsh-connect-qoder](https://github.com/dingminhua/dsh-connect-qoder) | `/plugins/dsh-connect-qoder/usage` 与 `/account-credits`（`cn` + `global`） |

几个实现细节：

- Trae 连接器本身还有 `enterprise` / `ai` 两个面板，雷达没读；码道走的是它自己起的 8765 桥接服务，桥接没起或改了 `config.port` 时这一路必然失败。
- **Qoder 的积分到期只看签到批次。** 连接器的 `credits.total` 是**剩余**之和（进度条分母用 `packages[].size`），批次到期只出现在 `usage.pool.accounts[].nearestExpiryMs` + `expiringSoon`（临期**金额**）；`planExpiresAtMs`（套餐结束）**不**拿来冒充积分到期日——两者在连接器里是刻意分开的，用错会把 Qoder 排到错误位置。没有批次时该条进「待补充」。
- **这五个之外的连接器即使已登录、接口能返回积分，雷达也不会读取。** 新增来源要改的位置、以及为什么不改成自动发现，见 [docs/CONNECTORS.md](docs/CONNECTORS.md)。

### 只同步「装好且开着」的连接器

在「插件」里关掉某个连接器（或根本没装）时，雷达会跟着闭嘴：不再探测它的接口，不再报「未响应」，并把它的卡片、统计和快速添加按钮一起收起来。依据是 Host 读的 **Cordis Loader 内存状态**（`GET /plugins/dsh-credit-radar/connectors`），不是去试接口——所以不会因为一次网络抖动就把来源误判成关掉。

- 被隐藏的只是**显示**：`localStorage` 里的记录一条都不删，连接器重新开启后卡片立刻回来。
- 手动录入的条目不隐藏；Host 报告不到的来源当作「未知」，也不隐藏。
- **Host 不回答时全部放开**（老 Host / 非 Desktop / 读取失败）：退回「每个来源都试」，和改动前一致。宁可能试一次，也不静默吞掉用户账号。
- 页面会留一行说明「X 已关闭，相关卡片已隐藏（记录仍保留…）」，免得数据凭空消失。
- 同步结果区分三件事：全部关闭 → 「已关闭或未安装，本次没有读取」；响应但零条 → 「已响应但没有账号（可能未登录）」；请求失败 → 「未响应」。

## 数据与限制

- 订阅数据保存在当前浏览器的 `localStorage`（键名 `dsh-credit-radar:v1`），不写入 DSH profile，也不会上传到远端。页面和对话栏的小按钮读同一份数据，任何一处同步完，另一处立刻跟着更新。
- 同步只调用连接器已有的只读接口，不消耗积分、不切换账号、不修改上游状态。
- 同步会清理「改名残留」：连接器换了账号标识（比如 Trae 早先按账号名建键、现在按 accountId 建键）时，旧记录会被新记录覆盖并自动删除，不会在「待补充」里留一张重复卡片。
- 同步是「尽力而为」：连接器未安装、被禁用、未登录或当前页面不是本机回环地址时，对应来源会失败或返回空；此时手动录入即可。
- 自动刷新在「额度雷达」页面或对话栏那个小按钮任一处挂着时运行（按设定间隔，安静更新，不弹提示），两处都关掉才停止；开关与间隔保存在 `dsh-credit-radar:auto`，不会发送系统通知。间隔越短，对连接器接口的请求越频繁。
- 分批到期数据来自连接器本身：Trae 用积分包（`credits.accounts`）、WorkBuddy 用套餐列表（`usage` 里的 `packages`，月度包按重置日算）、Meoo 用 `grants`、Qoder 用签到批次（`pool.accounts[].nearestExpiryMs` + `expiringSoon`）；华为云码道只提供套餐整体到期日，拆不出批次，仍按整包到期日排序。
- 优先级只看到期日，不按积分单价或模型倍率计算；同一天到期时，剩余积分少的排前面，避免浪费。
- 清除浏览器站点数据会删除本插件里的记录。
- 本插件目前没有公开仓库，也没有发布到 npm（`dsh-credit-radar` 在 npm 上返回 404），分发只有本地打包产物 `dsh-credit-radar-1.0.0.tgz`。