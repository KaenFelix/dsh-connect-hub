window.__ModuleLoader__.load({
  id: 'dsh-connect-hub',
  factory(require) {
    const React = require('react');
    const ReactDOM = require('react-dom');
    const h = React.createElement;
    const NS = 'dsh-connect-hub';
    const PANEL_ID = 'connect-hub';
    const STORAGE_KEY = 'dsh-connect-hub:v1';
    const AUTO_KEY = 'dsh-connect-hub:auto';
    /* The panel used to be called dsh-credit-radar. Its stored records and
       auto-refresh settings are the user's data, not the package's, so they are
       carried across once instead of being orphaned by the rename. */
    const LEGACY_STORAGE_KEY = 'dsh-credit-radar:v1';
    const LEGACY_AUTO_KEY = 'dsh-credit-radar:auto';
    const AUTO_STALE_MS = 60 * 1000;
    const AUTO_DEFAULT_MS = 5 * 60 * 1000;
    const AUTO_OPTIONS = [
      30 * 1000,
      60 * 1000,
      2 * 60 * 1000,
      3 * 60 * 1000,
      5 * 60 * 1000,
      10 * 60 * 1000,
      30 * 60 * 1000
    ];

    const ZH = {
      panelLabel: '连接中心',
      title: '连接中心',
      eyebrow: '连接器与额度',
      subtitle: '集中查看和管理已接入的平台：安装、启用、看额度与到期日，都在这一个页面。',
      sync: '同步连接器',
      syncing: '同步中…',
      back: '返回会话',
      lastSynced: '上次同步 {time}',
      neverSynced: '尚未同步',
      autoOn: '自动刷新',
      autoOff: '自动刷新已关',
      autoTitle: '自动刷新设置',
      autoInterval: '刷新间隔',
      autoSeconds: '{n} 秒',
      autoMinutes: '{n} 分钟',
      autoEvery: '每 {n} 自动读取一次',
      autoClose: '关闭自动刷新',
      syncDoneDetail: '已同步 {n} 个账号（新增 {added}，更新 {updated}）。',
      syncSomeFailed: '{sources} 未响应，可手动补充。',
      syncNone: '没有检测到 Trae / WorkBuddy / Meoo 秒悟 / 码道 / Qoder 连接器；先手动添加订阅吧。',
      syncNoAccounts: '连接器已响应，但没有读取到可用的积分数据（可能尚未登录）。',
      syncSourceIdle: '{sources} 已响应但没有账号（可能未登录）。',
      syncAllOff: '以下连接器已关闭或未安装，本次没有读取：{sources}。',
      syncFailed: '同步失败，请稍后再试。',
      listSep: '、',
      sourceTrae: 'Trae',
      sourceWorkBuddy: 'WorkBuddy',
      sourceMeoo: 'Meoo 秒悟',
      sourceMadao: '华为云码道',
      sourceQoder: 'Qoder',
      heroUseFirst: '建议优先使用',
      heroActiveDesc: '剩余 {credits} 积分，{date} 到期。先把它花掉。',
      heroActiveDescLot: '其中 {credits} 积分 {date} 到期，先把它花掉。',
      heroDraftTitle: '有一条还缺数据',
      heroDraftDesc: '「{name}」的连接器没有给出积分或到期日，所以它暂时排不进优先队列。重新同步或检查该连接器登录状态。',
      heroExpiredTitle: '额度已过期',
      heroExpiredDesc: '「{name}」的到期日已经过去。续期后更新日期，它会重新参与排序。',
      heroEmptyCreditTitle: '额度已用完',
      heroEmptyCreditDesc: '「{name}」当前没有剩余积分，记得续期或补充额度。',
      nextStep: '下一步',
      statCredits: '可用积分',
      statCreditsNote: '来自 {n} 个订阅',
      statSoon: '7 天内到期',
      statSoonNote: '{credits} 积分即将过期',
      statSoonEmpty: '暂无临近到期',
      statExpired: '已过期',
      statExpiredNote: '记得续期或清理',
      statExpiredEmpty: '没有过期记录',
      statSubs: '订阅 / 账号',
      statSubsNote: '全部记录',
      statDrafts: '{n} 条待补充',
      filterAll: '全部',
      filterSoon: '7 天内',
      filterMonth: '30 天内',
      filterExpired: '已过期',
      filterDraft: '待补充',
      search: '搜索服务或账号',
      emptyTitle: '还没有订阅记录',
      emptyDesc: '点「同步连接器」读取 Trae、WorkBuddy、Meoo 秒悟、华为云码道、Qoder 的积分与到期日。数据只来自连接器，这里不提供手工录入。',
      emptyFiltered: '没有符合条件的订阅',
      emptyFilteredDesc: '换个筛选条件或搜索词试试。',
      clearFilters: '清除筛选',
      popPill: '连接中心',
      popPillTitle: '查看连接中心',
      popPillTitleSoon: '{n} 个订阅快到期，查看连接中心',
      popEmpty: '还没有订阅，先在连接中心里同步连接器。',
      popRefresh: '刷新额度',
      popOpen: '打开面板',
      noAccount: '未填写账号',
      noExpiry: '未设置到期日',
      creditsUnit: '积分',
      badgeDraft: '待补充',
      badgeEmpty: '已用完',
      badgeExpired: '已过期',
      badgeToday: '今天到期',
      badgeTomorrow: '明天到期',
      badgeDays: '{n} 天后到期',
      badgePartial: '部分 {n} 天后到期',
      today: '今天到期',
      tomorrow: '明天到期',
      inDays: '还有 {n} 天',
      shortToday: '今天',
      shortTomorrow: '明天',
      shortDays: '{n} 天后',
      lotNote: '其中 {credits} 积分 {when}到期',
      overdueDays: '已过期 {n} 天',
      daysUnit: '天',
      untilExpiry: '距离到期',
      legacyManual: '旧手动记录（只读）',
      synced: '连接器同步',
      sourceReady: '已接入',
      sourceOff: '已关闭',
      sourceFailed: '启动失败',
      sourceAbsent: '未安装',
      sourceRetryStart: '重试启动',
      sourceEnabling: '开启中…',
      sourceEnable: '启用',
      sourceDisable: '禁用',
      sourceDisableHint: '关闭 {service}，已同步的记录会保留',
      sourceDisabled: '{package} 已关闭，记录会保留。',
      connInstalledHint: '已安装但当前是关闭状态，点「启用」即可接入额度。',
      connAbsentHint: '还没有安装，点「安装」由插件管理器装好后自动同步。',
      connFailedHint: '已安装且已开启，但这次没起来。先「重试启动」，仍不行就去插件页看报错。',
      connInstalledOrigin: '已安装',
      connAbsentOrigin: '未安装',
      connIdleHint: '连接器已就绪，但这次同步没有读到账号（可能还没登录）。',
      connIdleOrigin: '已接入',
      sourceInstall: '安装',
      sourceInstalling: '安装中…',
      sourceInstalled: '已安装 {package}，积分会随下次同步出现。',
      sourceEnabled: '{package} 已开启，积分会随下次同步出现。',
      sourceAlreadyOn: '{package} 已经是开启状态，无需重复操作。',
      sourceRestart: '已安装 {package}，但需要重启 DeepSeek Harness 才会生效。',
      sourceNoManager: '当前环境不允许安装插件（没有插件管理服务），请在「插件」页手动安装。',
      sourceUnknown: '这个连接器不在支持列表里。',
      sourceIncompatible: '{package} 与当前版本的 DeepSeek Harness 不兼容，未安装。',
      sourceNetwork: '安装未完成：网络或超时问题，请稍后重试。',
      sourceInstallFailed: '安装失败：{code}',
    };

    const EN = {
      panelLabel: 'Connections',
      title: 'Connections',
      eyebrow: 'Subscriptions & credits',
      subtitle: 'Every connected platform in one place: install, switch on, and read each balance and expiry date.',
      sync: 'Sync connectors',
      syncing: 'Syncing…',
      back: 'Back to chat',
      lastSynced: 'Last sync {time}',
      neverSynced: 'Not synced yet',
      autoOn: 'Auto refresh',
      autoOff: 'Auto refresh off',
      autoTitle: 'Auto refresh settings',
      autoInterval: 'Refresh interval',
      autoSeconds: '{n} s',
      autoMinutes: '{n} min',
      autoEvery: 'Reads connectors every {n}',
      autoClose: 'Turn auto refresh off',
      syncDoneDetail: 'Synced {n} accounts ({added} added, {updated} updated).',
      syncSomeFailed: '{sources} did not respond; add them manually.',
      syncNone: 'No Trae, WorkBuddy, Meoo, CodeArts or Qoder connector was detected. Add a subscription manually.',
      syncNoAccounts: 'The connectors responded, but no usable credit data was available. They may be signed out.',
      syncSourceIdle: '{sources} responded but has no account (it may be signed out).',
      syncAllOff: 'These connectors are switched off or not installed, so nothing was read: {sources}.',
      syncFailed: 'Sync failed. Try again later.',
      listSep: ', ',
      sourceTrae: 'Trae',
      sourceWorkBuddy: 'WorkBuddy',
      sourceMeoo: 'Meoo',
      sourceMadao: 'Huawei CodeArts',
      sourceQoder: 'Qoder',
      heroUseFirst: 'Use this first',
      heroActiveDesc: '{credits} credits left, expiring {date}. Spend it before it lapses.',
      heroActiveDescLot: 'Spend the {credits} credits expiring {date} first.',
      heroDraftTitle: 'One entry has no data yet',
      heroDraftDesc: '“{name}” has no credits or expiry date from its connector, so it cannot join the priority queue. Sync again or check that connector’s sign-in.',
      heroExpiredTitle: 'This balance has expired',
      heroExpiredDesc: '“{name}” is past its expiry date. Renew it and update the date to bring it back into the ranking.',
      heroEmptyCreditTitle: 'This balance is used up',
      heroEmptyCreditDesc: '“{name}” has no credits left. Renew it or add more credit.',
      nextStep: 'Next step',
      statCredits: 'Available credits',
      statCreditsNote: 'Across {n} subscriptions',
      statSoon: 'Expiring in 7 days',
      statSoonNote: '{credits} credits at risk',
      statSoonEmpty: 'Nothing expiring soon',
      statExpired: 'Expired',
      statExpiredNote: 'Renew or remove them',
      statExpiredEmpty: 'No expired entries',
      statSubs: 'Subscriptions',
      statSubsNote: 'All records',
      statDrafts: '{n} to complete',
      filterAll: 'All',
      filterSoon: '7 days',
      filterMonth: '30 days',
      filterExpired: 'Expired',
      filterDraft: 'Incomplete',
      search: 'Search services or accounts',
      emptyTitle: 'No subscriptions yet',
      emptyDesc: 'Sync connectors to read credits and expiry dates from Trae, WorkBuddy, Meoo, CodeArts and Qoder. Entries come from connectors only; there is no manual entry.',
      emptyFiltered: 'No matching subscriptions',
      emptyFilteredDesc: 'Try another filter or search term.',
      clearFilters: 'Clear filters',
      popPill: 'Credits',
      popPillTitle: 'Open connections',
      popPillTitleSoon: '{n} subscriptions expiring soon',
      popEmpty: 'No subscriptions yet. Add one or sync the connectors.',
      popRefresh: 'Refresh',
      popOpen: 'Open panel',
      noAccount: 'No account label',
      noExpiry: 'No expiry date',
      creditsUnit: 'credits',
      badgeDraft: 'Incomplete',
      badgeEmpty: 'Used up',
      badgeExpired: 'Expired',
      badgeToday: 'Expires today',
      badgeTomorrow: 'Expires tomorrow',
      badgeDays: 'In {n} days',
      badgePartial: 'Part expires in {n} days',
      today: 'Expires today',
      tomorrow: 'Expires tomorrow',
      inDays: '{n} days left',
      shortToday: 'today',
      shortTomorrow: 'tomorrow',
      shortDays: 'in {n} days',
      lotNote: '{credits} of them expire {when}',
      overdueDays: 'Expired {n} days ago',
      daysUnit: 'days',
      untilExpiry: 'until expiry',
      legacyManual: 'Legacy manual entry (read-only)',
      synced: 'Synced',
      sourceReady: 'Connected',
      sourceOff: 'Off',
      sourceFailed: 'Failed to start',
      sourceAbsent: 'Not installed',
      sourceRetryStart: 'Retry start',
      sourceEnabling: 'Switching on…',
      sourceEnable: 'Enable',
      sourceDisable: 'Disable',
      sourceDisableHint: 'Turn off {service}; synced records are kept',
      sourceDisabled: '{package} is switched off; its records are kept.',
      connInstalledHint: 'Installed but currently switched off. Enable it to read its credits.',
      connAbsentHint: 'Not installed yet. Install it here and its credits sync automatically.',
      connFailedHint: 'Installed and enabled, but it did not start this time. Retry, then check Plugins for the error.',
      connInstalledOrigin: 'Installed',
      connAbsentOrigin: 'Not installed',
      connIdleHint: 'The connector is ready, but the last sync found no accounts (it may be signed out).',
      connIdleOrigin: 'Connected',
      sourceInstall: 'Install',
      sourceInstalling: 'Installing…',
      sourceInstalled: '{package} installed; its credits appear on the next sync.',
      sourceEnabled: '{package} is switched on; its credits appear on the next sync.',
      sourceAlreadyOn: '{package} is already switched on; nothing to do.',
      sourceRestart: '{package} is installed but takes effect after DeepSeek Harness restarts.',
      sourceNoManager: 'This environment cannot install plugins (no plugin manager service). Install it from Plugins instead.',
      sourceUnknown: 'That connector is not in the supported list.',
      sourceIncompatible: '{package} is incompatible with this DeepSeek Harness version and was not installed.',
      sourceNetwork: 'Install did not finish: network or timeout. Try again later.',
      sourceInstallFailed: 'Install failed: {code}',
    };

    function pad2(value) {
      return value < 10 ? '0' + value : String(value);
    }

    function dateFromMs(value) {
      const n = asNumber(value);
      if (n === null || n <= 0) return null;
      const date = new Date(n);
      if (Number.isNaN(date.getTime())) return null;
      return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
    }

    function dateFromString(value) {
      if (typeof value !== 'string') return null;
      const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
      if (match === null) return null;
      const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
      if (Number.isNaN(date.getTime())) return null;
      return match[1] + '-' + match[2] + '-' + match[3];
    }

    function daysUntil(value) {
      const normalized = dateFromString(value);
      if (normalized === null) return null;
      const match = normalized.split('-');
      const target = new Date(Number(match[0]), Number(match[1]) - 1, Number(match[2]));
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return Math.round((target.getTime() - today.getTime()) / 86400000);
    }

    function formatDate(value) {
      const normalized = dateFromString(value);
      return normalized === null ? '' : normalized.replace(/-/g, '/');
    }

    function asNumber(value) {
      if (value === null || value === undefined || value === '') return null;
      const n = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(n) ? n : null;
    }

    function formatNum(value) {
      const n = asNumber(value);
      if (n === null) return '—';
      return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(n);
    }

    function formatSyncTime(value) {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return '';
      const now = new Date();
      const sameDay = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
      if (sameDay) return pad2(date.getHours()) + ':' + pad2(date.getMinutes());
      return (date.getMonth() + 1) + '/' + date.getDate() + ' ' + pad2(date.getHours()) + ':' + pad2(date.getMinutes());
    }

    function uid() {
      if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
      return 'cr-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
    }

    /* Live credit batches: still-usable chunks with their own expiry date. */
    function liveLots(entry) {
      const lots = Array.isArray(entry && entry.lots) ? entry.lots : [];
      return lots
        .filter(function (lot) {
          if (!lot || !lot.expiresAt) return false;
          const credits = asNumber(lot.credits);
          if (credits === null || credits <= 0) return false;
          const days = daysUntil(lot.expiresAt);
          return days !== null && days >= 0;
        })
        .slice()
        .sort(function (a, b) {
          return String(a.expiresAt).localeCompare(String(b.expiresAt));
        });
    }

    /* The date that decides urgency: the soonest batch, whichever is earlier. */
    function dueOf(entry) {
      let due = entry && entry.expiresAt ? entry.expiresAt : null;
      liveLots(entry).forEach(function (lot) {
        if (!due || String(lot.expiresAt) < String(due)) due = lot.expiresAt;
      });
      return due;
    }

    /* The batch worth calling out on the card, or null when there is only one. */
    function urgentLotOf(entry) {
      const lots = liveLots(entry);
      if (lots.length < 2) return null;
      const first = lots[0];
      const second = lots[1];
      if (String(first.expiresAt) === String(second.expiresAt)) return null;
      /* Only worth a callout once that batch is actually close. */
      const days = daysUntil(first.expiresAt);
      if (days === null || days > 7) return null;
      return first;
    }

    /* Credits that actually lapse inside `within` days: the batches inside the
       window, or the whole balance when the source reports no split. */
    function soonCreditsOf(entry, within) {
      const days = daysUntil(dueOf(entry));
      if (days === null || days < 0 || days > within) return 0;
      const lots = liveLots(entry);
      if (lots.length === 0) return asNumber(entry.credits) || 0;
      const soon = lots.reduce(function (sum, lot) {
        const d = daysUntil(lot.expiresAt);
        return d !== null && d >= 0 && d <= within ? sum + (asNumber(lot.credits) || 0) : sum;
      }, 0);
      return soon > 0 ? soon : asNumber(entry.credits) || 0;
    }

    function statusOf(entry) {
      if (!entry) return 'draft';
      const due = dueOf(entry);
      if (!due || entry.credits === null || entry.credits === undefined) return 'draft';
      const days = daysUntil(due);
      if (days === null) return 'draft';
      if (entry.credits <= 0) return days < 0 ? 'expired' : 'empty';
      if (days < 0) return 'expired';
      if (days <= 7) return 'warn';
      if (days <= 30) return 'brand';
      return 'idle';
    }

    function toneOfStatus(status) {
      if (status === 'expired') return 'error';
      if (status === 'warn') return 'warn';
      if (status === 'brand') return 'brand';
      if (status === 'empty') return 'idle';
      if (status === 'draft') return 'draft';
      return 'idle';
    }

    function isUsable(status) {
      return status === 'warn' || status === 'brand' || status === 'idle';
    }

    function sortEntries(entries) {
      return entries.slice().sort(function (a, b) {
        const sa = statusOf(a);
        const sb = statusOf(b);
        const group = function (status) {
          if (status === 'draft') return 3;
          if (status === 'expired') return 2;
          if (status === 'empty') return 1;
          return 0;
        };
        const ga = group(sa);
        const gb = group(sb);
        if (ga !== gb) return ga - gb;
        const da = daysUntil(dueOf(a));
        const db = daysUntil(dueOf(b));
        if (da !== null && db !== null && da !== db) {
          if (ga === 2) return db - da;
          return da - db;
        }
        if (da === null && db !== null) return 1;
        if (da !== null && db === null) return -1;
        const ca = asNumber(a.credits);
        const cb = asNumber(b.credits);
        if (ca !== null && cb !== null && ca !== cb) return ca - cb;
        if (ca === null && cb !== null) return 1;
        if (ca !== null && cb === null) return -1;
        return String(a.service || '').localeCompare(String(b.service || ''));
      });
    }

    function badgeText(entry, t) {
      const status = statusOf(entry);
      const days = daysUntil(dueOf(entry));
      if (status === 'draft') return t('badgeDraft');
      if (status === 'empty') return t('badgeEmpty');
      if (days !== null && days < 0) return t('badgeExpired');
      if (days === 0) return t('badgeToday');
      if (days === 1) return t('badgeTomorrow');
      if (days !== null && days >= 2 && urgentLotOf(entry)) return t('badgePartial', { n: days });
      if (days !== null) return t('badgeDays', { n: days });
      return t('badgeDraft');
    }

    function daysText(days, t) {
      if (days === null) return t('noExpiry');
      if (days < 0) return t('overdueDays', { n: Math.abs(days) });
      if (days === 0) return t('today');
      if (days === 1) return t('tomorrow');
      return t('inDays', { n: days });
    }

    function lotNoteText(lot, t) {
      const days = daysUntil(lot.expiresAt);
      if (days === null) return '';
      const when = days === 0 ? t('shortToday') : days === 1 ? t('shortTomorrow') : t('shortDays', { n: days });
      return t('lotNote', { credits: formatNum(lot.credits), when: when });
    }

    /* Brand marks, shipped as PNGs in this package's `lib/assets/brand/`.

       They are downloaded copies, not hotlinks: the page must render them with
       no network access, and a brand site rearranging its assets must not blank
       a tile.

       Why not reuse the connector packages' own `icons/*.png`: trae, workbuddy
       and qoder all ship the SAME placeholder image (identical SHA-256), madao
       ships a 「码」 glyph and meoo ships none — reusing them would put one logo
       on five different platforms. Each file below was taken from the brand's
       own published favicon or logo and squared to 128px:

         trae       www.trae.ai favicon           (its dark plate + neon mark)
         workbuddy  www.workbuddy.ai logo.svg     (rasterized)
         meoo       meoo.com favicon              (alicdn, 184px)
         madao      codearts.huaweicloud.com      (the CodeArts brand mark)
         qoder      www.qoder.com favIcon.svg     (rasterized)

       The revision in each file name is the content hash, matching the
       framework's `./assets/*` convention: a changed file gets a new URL, so a
       stale cache can never show the wrong logo. `sources.md` beside the images
       records what each file came from. */
    const BRAND_ASSETS = {
      trae: 'trae-35d7c9b8eb9b.png',
      workbuddy: 'workbuddy-c398bbf5f99a.png',
      meoo: 'meoo-445128ff6dcb.png',
      madao: 'madao-76880438ca99.png',
      qoder: 'qoder-dcdea0167b20.png'
    };

    /* Document-relative, like every other app-owned route: the reference
       resolves under any mount point instead of assuming the site root. */
    function brandAssetUrl(file) {
      return 'plugins/dsh-connect-hub/assets/brand/' + file;
    }

    /* Which brand a service belongs to. Matched on the names the connectors
       write, including the Chinese label, so a renamed account still lands on
       the right tile. */
    function brandKeyOf(service) {
      const name = String(service || '').trim();
      if (name === '') return null;
      const lower = name.toLowerCase();
      if (lower.indexOf('trae') >= 0) return 'trae';
      if (lower.indexOf('workbuddy') >= 0 || lower.indexOf('work buddy') >= 0) return 'workbuddy';
      if (lower.indexOf('meoo') >= 0 || name.indexOf('秒悟') >= 0) return 'meoo';
      if (name.indexOf('码道') >= 0 || lower.indexOf('codearts') >= 0 || lower.indexOf('madao') >= 0) return 'madao';
      if (lower.indexOf('qoder') >= 0) return 'qoder';
      return null;
    }

    /* The tile at the head of every card: the platform's mark when we know it,
       its initials otherwise.
 
       `sourceKey` is the reliable answer — a synced entry carries the connector
       it came from — while the service name is free text a user could have
       renamed. Name matching is the fallback for a legacy manual entry, which
       has no source key at all. */
    function BrandTile(props) {
      const key = props.sourceKey && Object.hasOwn(BRAND_ASSETS, props.sourceKey)
        ? props.sourceKey
        : brandKeyOf(props.service);
      if (key === null) return h('div', { className: 'cr-tile' }, initials(props.service));
      return h('div', { className: 'cr-tile cr-tile-brand', title: props.service },
        h('img', {
          className: 'cr-tile-img',
          src: brandAssetUrl(BRAND_ASSETS[key]),
          alt: '',
          width: 34,
          height: 34,
          /* Not lazy: the tile sits at the top of a card that is already on
             screen, and these files are 5–33 KB each. */
          decoding: 'async',
          draggable: 'false'
        }));
    }

    function initials(service) {
      const name = String(service || '').trim();
      if (name === '') return '?';
      const lower = name.toLowerCase();
      if (lower.indexOf('trae') >= 0) return 'TR';
      if (lower.indexOf('workbuddy') >= 0 || lower.indexOf('work buddy') >= 0) return 'WB';
      if (lower.indexOf('meoo') >= 0 || name.indexOf('秒悟') >= 0) return 'MO';
      if (name.indexOf('码道') >= 0 || lower.indexOf('codearts') >= 0 || lower.indexOf('madao') >= 0) return '码';
      const words = name.split(/\s+/).filter(Boolean);
      if (words.length > 1 && /^[A-Za-z]/.test(words[0])) return (words[0][0] + words[1][0]).toUpperCase();
      if (/^[\x00-\x7F]+$/.test(name)) return name.slice(0, 2).toUpperCase();
      return name.slice(0, 2);
    }

    /* Collapse imported batches into one row per expiry date. */
    function cleanLots(list) {
      const merged = new Map();
      (list || []).forEach(function (lot) {
        if (!lot) return;
        const credits = asNumber(lot.credits);
        const expiresAt = dateFromString(lot.expiresAt);
        if (credits === null || credits <= 0 || !expiresAt) return;
        merged.set(expiresAt, (merged.get(expiresAt) || 0) + credits);
      });
      return Array.from(merged.entries())
        .map(function (pair) {
          return { credits: Math.round(pair[1] * 100) / 100, expiresAt: pair[0] };
        })
        .sort(function (a, b) {
          return a.expiresAt.localeCompare(b.expiresAt);
        });
    }

    function normalizeEntry(raw) {
      if (raw === null || typeof raw !== 'object') return null;
      const service = typeof raw.service === 'string' ? raw.service.trim() : '';
      if (service === '') return null;
      const credits = asNumber(raw.credits);
      const total = asNumber(raw.total);
      return {
        id: typeof raw.id === 'string' && raw.id !== '' ? raw.id : uid(),
        service: service,
        account: typeof raw.account === 'string' ? raw.account : '',
        plan: typeof raw.plan === 'string' ? raw.plan : '',
        credits: credits,
        total: total,
        expiresAt: dateFromString(raw.expiresAt),
        lots: cleanLots(raw.lots),
        note: typeof raw.note === 'string' ? raw.note : '',
        sourceKey: typeof raw.sourceKey === 'string' && raw.sourceKey !== '' ? raw.sourceKey : null,
        createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
        updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now()
      };
    }

    /* One-time carry-over of a value stored under the panel's old name. The
       legacy key is read only when the new one is absent, and the value is then
       written under the new key: a later write by the new version must win, so
       this can never resurrect old data over fresh data. */
    function adoptLegacy(legacyKey, key) {
      try {
        const legacy = window.localStorage.getItem(legacyKey);
        if (legacy === null) return;
        if (window.localStorage.getItem(key) === null) {
          window.localStorage.setItem(key, legacy);
        }
        window.localStorage.removeItem(legacyKey);
      } catch (error) {
        /* Storage unavailable: the old value simply stays where it is. */
      }
    }

    function readStore() {
      try {
        let raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          adoptLegacy(LEGACY_STORAGE_KEY, STORAGE_KEY);
          raw = window.localStorage.getItem(STORAGE_KEY);
        }
        if (!raw) return { entries: [], lastSyncedAt: null };
        const parsed = JSON.parse(raw);
        const entries = Array.isArray(parsed && parsed.entries)
          ? parsed.entries.map(normalizeEntry).filter(Boolean)
          : [];
        return {
          entries: entries,
          lastSyncedAt: typeof parsed.lastSyncedAt === 'number' ? parsed.lastSyncedAt : null
        };
      } catch (error) {
        return { entries: [], lastSyncedAt: null };
      }
    }

    function writeStore(store) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
          version: 1,
          entries: store.entries,
          lastSyncedAt: store.lastSyncedAt
        }));
      } catch (error) {
        /* Storage can be unavailable; the page still works for this visit. */
      }
    }

    function normalizeInterval(value) {
      const ms = Number(value);
      return AUTO_OPTIONS.indexOf(ms) >= 0 ? ms : AUTO_DEFAULT_MS;
    }

    function intervalLabel(ms, t) {
      if (ms < 60000) return t('autoSeconds', { n: Math.round(ms / 1000) });
      return t('autoMinutes', { n: Math.round(ms / 60000) });
    }

    function readAuto() {
      try {
        adoptLegacy(LEGACY_AUTO_KEY, AUTO_KEY);
        const raw = window.localStorage.getItem(AUTO_KEY);
        if (!raw) return { enabled: true, intervalMs: AUTO_DEFAULT_MS };
        const parsed = JSON.parse(raw);
        return {
          enabled: !(parsed && parsed.enabled === false),
          intervalMs: normalizeInterval(parsed && parsed.intervalMs)
        };
      } catch (error) {
        return { enabled: true, intervalMs: AUTO_DEFAULT_MS };
      }
    }

    function writeAuto(value) {
      try {
        window.localStorage.setItem(AUTO_KEY, JSON.stringify({
          version: 2,
          enabled: !!value.enabled,
          intervalMs: normalizeInterval(value.intervalMs)
        }));
      } catch (error) {
        /* Storage can be unavailable; the settings still work for this visit. */
      }
    }

    /* Auto refresh lives outside the panel: any mounted surface (the page or
       the composer pill) keeps one shared timer alive, so credits keep
       updating while the user stays in the conversation. */
    let localeT = function (key) { return key; };
    const autoEngine = {
      settings: readAuto(),
      refs: 0,
      timer: null,
      boot: null,
      lastAttempt: 0,
      listeners: new Set()
    };

    function autoNotify() {
      autoEngine.listeners.forEach(function (listener) { listener(autoEngine.settings); });
    }

    function autoApply(next) {
      autoEngine.settings = {
        enabled: !!next.enabled,
        intervalMs: normalizeInterval(next.intervalMs)
      };
      writeAuto(autoEngine.settings);
      autoNotify();
      autoSchedule();
    }

    function autoSyncNow(staleOnly) {
      const settings = autoEngine.settings;
      if (!settings.enabled) return;
      if (document.visibilityState && document.visibilityState !== 'visible') return;
      if (syncState.running) return;
      const now = Date.now();
      if (staleOnly) {
        const last = storeSnapshot().lastSyncedAt || 0;
        if (now - last <= Math.min(settings.intervalMs, AUTO_STALE_MS)) return;
      } else if (now - autoEngine.lastAttempt < Math.max(5000, Math.round(settings.intervalMs * 0.8))) {
        return;
      }
      autoEngine.lastAttempt = now;
      syncNow(localeT);
    }

    function autoOnVisible() {
      if (document.visibilityState && document.visibilityState !== 'visible') return;
      autoSyncNow(true);
    }

    function autoSchedule() {
      if (autoEngine.timer !== null) {
        window.clearInterval(autoEngine.timer);
        autoEngine.timer = null;
      }
      if (autoEngine.boot !== null) {
        window.clearTimeout(autoEngine.boot);
        autoEngine.boot = null;
      }
      if (autoEngine.refs === 0 || !autoEngine.settings.enabled) return;
      autoEngine.timer = window.setInterval(function () { autoSyncNow(false); }, autoEngine.settings.intervalMs);
      autoEngine.boot = window.setTimeout(function () { autoSyncNow(true); }, 1200);
    }

    function autoRetain() {
      autoEngine.refs += 1;
      if (autoEngine.refs === 1) {
        document.addEventListener('visibilitychange', autoOnVisible);
        window.addEventListener('focus', autoOnVisible);
      }
      autoSchedule();
      return function () {
        autoEngine.refs = Math.max(0, autoEngine.refs - 1);
        if (autoEngine.refs === 0) {
          document.removeEventListener('visibilitychange', autoOnVisible);
          window.removeEventListener('focus', autoOnVisible);
        }
        autoSchedule();
      };
    }

    function useAutoSettings() {
      const state = React.useState(autoEngine.settings);
      React.useEffect(function () {
        function onChange(next) { state[1](next); }
        autoEngine.listeners.add(onChange);
        const release = autoRetain();
        return function () {
          autoEngine.listeners.delete(onChange);
          release();
        };
      }, []);
      return [state[0], autoApply];
    }





    function mergeImported(entries, imported, now) {
      const next = entries.slice();
      const bySource = new Map();
      next.forEach(function (entry, index) {
        if (entry.sourceKey) bySource.set(entry.sourceKey, index);
      });
      let added = 0;
      let updated = 0;
      imported.forEach(function (item) {
        if (!item || !item.sourceKey) return;
        const index = bySource.get(item.sourceKey);
        if (index === undefined) {
          next.push({
            id: uid(),
            service: item.service || 'Subscription',
            account: item.account || '',
            plan: item.plan || '',
            credits: item.credits === undefined ? null : item.credits,
            total: item.total === undefined ? null : item.total,
            expiresAt: item.expiresAt || null,
            lots: cleanLots(item.lots),
            note: '',
            sourceKey: item.sourceKey,
            createdAt: now,
            updatedAt: now
          });
          bySource.set(item.sourceKey, next.length - 1);
          added += 1;
          return;
        }
        const previous = next[index];
        next[index] = {
          ...previous,
          service: item.service || previous.service,
          account: item.account || previous.account,
          plan: item.plan || previous.plan,
          credits: item.credits === undefined || item.credits === null ? previous.credits : item.credits,
          total: item.total === undefined || item.total === null ? previous.total : item.total,
          expiresAt: item.expiresAt || previous.expiresAt,
          lots: Array.isArray(item.lots) ? cleanLots(item.lots) : previous.lots || [],
          updatedAt: now
        };
        updated += 1;
      });
      return { entries: next, added: added, updated: updated };
    }

    /* Drop the ghost a renamed source key leaves behind.
       A connector that starts reporting an account under a new key (the Trae
       identity fallback did exactly that) leaves the old row with no expiry
       and no producer, so it sits in 待补充 forever. Only rows that are BOTH
       unproduced now AND empty of an expiry are dropped — a manual entry
       (no sourceKey) and any synced row that still carries a date are kept,
       and a live key is never touched. */
    function pruneStale(entries, items) {
      const live = new Set(items.map(function (item) { return item.sourceKey; }));
      const sameService = new Map();
      items.forEach(function (item) {
        const list = sameService.get(item.service) || [];
        list.push({ credits: asNumber(item.credits), account: (item.account || '').trim() });
        sameService.set(item.service, list);
      });
      return entries.filter(function (entry) {
        if (!entry || !entry.sourceKey) return true;
        if (live.has(entry.sourceKey)) return true;
        const peers = sameService.get(entry.service);
        if (!peers) return true;
        const credits = asNumber(entry.credits);
        const account = (entry.account || '').trim();
        return !peers.some(function (peer) {
          /* Same balance: the same account under a key the connector no
             longer produces. */
          if (credits !== null && peer.credits !== null && Math.abs(peer.credits - credits) < 0.01) return true;
          /* Same account name, or a nameless row while the connector now
             names the account — a genuinely different account always has a
             name, so this only matches the identity-less duplicate. */
          if (account !== '' && peer.account === account) return true;
          return account === '' && peer.account !== '';
        });
      });
    }

    async function getJson(url, timeoutMs) {
      const controller = new AbortController();
      const timer = window.setTimeout(function () {
        controller.abort();
      }, timeoutMs || 15000);
      try {
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal,
          headers: { accept: 'application/json' },
          cache: 'no-store'
        });
        if (!response.ok) return null;
        return await response.json();
      } catch (error) {
        return null;
      } finally {
        window.clearTimeout(timer);
      }
    }

    async function syncTrae() {
      const results = await Promise.all([
        getJson('/plugins/dsh-connect-trae/usage?region=cn&detail=full', 20000),
        getJson('/plugins/dsh-connect-trae/account-credits?region=cn', 20000)
      ]);
      const usage = results[0];
      const credits = results[1];
      if (usage === null && credits === null) return null;
      const rows = credits && Array.isArray(credits.accounts) ? credits.accounts : [];
      const selectedRow = rows.find(function (row) { return row && row.selected === true; }) || null;
      const signedIn = !!(usage && usage.status === 'signed-in' && usage.credits);
      /* `usage.account` is often an empty object even when signed in, so the
         identity has to come from account-credits' selected row as well —
         otherwise the same account lands twice under two different keys. */
      const account = (usage && usage.account) || {};
      const currentId = account.accountId || (selectedRow && selectedRow.id) || null;
      const currentName = account.accountName || (selectedRow && selectedRow.accountName) || '';
      const out = [];
      const seen = new Set();
      const key = 'trae:cn:' + (currentId || currentName || 'current');
      if (signedIn) {
        const packs = Array.isArray(usage.credits.accounts) ? usage.credits.accounts : [];
        const dated = packs
          .map(function (pack) {
            return { remain: asNumber(pack.remain), ms: asNumber(pack.expiresAtMs) };
          })
          .filter(function (pack) {
            return pack.remain !== null && pack.remain > 0 && pack.ms !== null && pack.ms > 0;
          })
          .sort(function (a, b) {
            return a.ms - b.ms;
          });
        const value = asNumber(usage.credits.available);
        if (value !== null) {
          out.push({
            sourceKey: key,
            service: 'Trae',
            account: currentName,
            plan: 'CN',
            credits: value,
            total: asNumber(usage.credits.total),
            expiresAt: dated.length > 0 ? dateFromMs(dated[0].ms) : null,
            lots: cleanLots(packs.map(function (pack) {
              const ms = asNumber(pack.expiresAtMs);
              return { credits: pack.remain, expiresAt: ms ? dateFromMs(ms) : null };
            }))
          });
          seen.add(key);
        }
      }
      rows.forEach(function (row) {
        if (!row || typeof row !== 'object') return;
        const value = asNumber(row.generalAvailable);
        if (value === null) return;
        const isCurrent = (currentId !== null && row.id === currentId)
          || (currentId === null && currentName !== '' && row.accountName === currentName)
          || (row.selected === true && out.length > 0);
        if (isCurrent) return;
        const rowKey = 'trae:cn:' + (row.id || row.accountName || 'account');
        if (seen.has(rowKey)) return;
        out.push({
          sourceKey: rowKey,
          service: 'Trae',
          account: row.accountName || '',
          plan: 'CN',
          credits: value,
          total: null,
          expiresAt: null,
          lots: []
        });
        seen.add(rowKey);
      });
      return out;
    }

    async function syncWorkBuddy() {
      const regions = [
        { region: 'cn', plan: 'CN' },
        { region: 'global', plan: 'Global' }
      ];
      const results = await Promise.all(regions.map(async function (entry) {
        /* account-credits carries the per-account totals; usage carries the
           package split, which is the only place a monthly cycle reset (a
           batch that lapses without moving the account's nearest expiry) is
           visible. The usage read is best effort: an older connector simply
           answers without packages and the card falls back to nearestExpiry. */
        const pair = await Promise.all([
          getJson('/plugins/dsh-connect-workbuddy/account-credits?region=' + entry.region, 20000),
          getJson('/plugins/dsh-connect-workbuddy/usage?region=' + entry.region, 25000)
        ]);
        const credits = pair[0];
        const status = pair[1];
        if (credits === null) return null;
        const packs = status && status.credits && Array.isArray(status.credits.packages)
          ? status.credits.packages
          : [];
        const selectedId = status && typeof status.accountId === 'string' && status.accountId !== ''
          ? status.accountId
          : (status && status.account && typeof status.account.accountId === 'string' ? status.account.accountId : null);
        const lots = cleanLots(packs.map(function (pack) {
          if (!pack || typeof pack !== 'object') return null;
          const remain = asNumber(pack.remain);
          if (remain === null) return null;
          const ms = asNumber(pack.monthly ? pack.cycleRefreshMs : pack.expiresAtMs);
          return { credits: remain, expiresAt: ms ? dateFromMs(ms) : null };
        }));
        const out = [];
        const rows = Array.isArray(credits.accounts) ? credits.accounts : [];
        rows.forEach(function (row) {
          if (!row || typeof row !== 'object') return;
          const value = asNumber(row.credits);
          if (value === null) return;
          out.push({
            sourceKey: 'workbuddy:' + entry.region + ':' + (row.id || row.accountName || 'account'),
            service: 'WorkBuddy',
            account: row.accountName || '',
            plan: entry.plan,
            credits: value,
            total: null,
            expiresAt: dateFromMs(row.nearestExpiryMs),
            lots: selectedId !== null && row.id === selectedId ? lots : []
          });
        });
        return out;
      }));
      const answered = results.some(function (value) { return value !== null; });
      if (!answered) return null;
      const out = [];
      results.forEach(function (value) {
        if (value !== null) out.push.apply(out, value);
      });
      return out;
    }

    async function syncMeoo() {
      const data = await getJson('/plugins/dsh-connect-meoo/status', 15000);
      if (data === null) return null;
      const points = data.points;
      if (!points || points.state !== 'ok') return [];
      const value = asNumber(points.available);
      if (value === null) return [];
      const lots = cleanLots((Array.isArray(points.grants) ? points.grants : []).map(function (grant) {
        return { credits: grant && grant.remaining, expiresAt: grant && grant.expiresDate };
      }));
      const account = data.login && typeof data.login.name === 'string' ? data.login.name : '';
      return [{
        sourceKey: 'meoo:' + (account || 'account'),
        service: 'Meoo 秒悟',
        account: account,
        plan: 'Meoo',
        credits: value,
        total: null,
        expiresAt: dateFromString(points.nextExpiry) || (lots.length > 0 ? lots[0].expiresAt : null),
        lots: lots
      }];
    }

    async function syncMadao() {
      const data = await getJson('http://127.0.0.1:8765/diag/account', 8000);
      if (data === null) return null;
      if (!data.ok || !data.credit) return [];
      const credit = data.credit;
      const value = asNumber(credit.remain);
      if (value === null) return [];
      const account = typeof data.account === 'string' ? data.account : '';
      return [{
        sourceKey: 'madao:' + (account || 'account'),
        service: '华为云码道',
        account: account,
        plan: 'CodeArts',
        credits: value,
        total: asNumber(credit.total),
        expiresAt: dateFromString(credit.packageEnd),
        lots: []
      }];
    }

    async function syncQoder() {
      const regions = [
        { region: 'cn', plan: 'CN' },
        { region: 'global', plan: 'Global' }
      ];
      /* Two documents per region, and they answer different questions:
         `usage` carries the serving account plus `pool.accounts[]`, where each
         row has its own `credits` / `nearestExpiryMs` / `expiringSoon` — the
         only place a batch expiry exists, because the connector derives it
         from daily check-in batches. `account-credits` answers even when usage
         failed (timeout / upstream hiccup) and covers accounts the pool view
         leaves out, so a bad usage read costs the expiry dates, not the rows. */
      const results = await Promise.all(regions.map(async function (entry) {
        const pair = await Promise.all([
          getJson('/plugins/dsh-connect-qoder/usage?region=' + entry.region, 20000),
          getJson('/plugins/dsh-connect-qoder/account-credits?region=' + entry.region, 20000)
        ]);
        const usage = pair[0];
        const credits = pair[1];
        if (usage === null && credits === null) return null;
        const out = [];
        const seen = new Set();
        /* Per-account expiry, keyed by account id, from the pool view. */
        const poolRows = usage && usage.pool && Array.isArray(usage.pool.accounts)
          ? usage.pool.accounts
          : [];
        const poolById = new Map();
        poolRows.forEach(function (row) {
          if (row && typeof row === 'object' && row.accountId) poolById.set(row.accountId, row);
        });
        /* `nearestExpiryMs` + `expiringSoon` (the AMOUNT inside the 3-day
           window) describe one batch, not one per package — `packages[]` has
           no per-package expiry at all. Emitting the package count as lots
           would multiply the balance. */
        function batchOf(row) {
          const ms = asNumber(row && row.nearestExpiryMs);
          const amount = asNumber(row && row.expiringSoon);
          if (ms === null || amount === null || amount <= 0) return [];
          const date = dateFromMs(ms);
          return date === null ? [] : [{ credits: amount, expiresAt: date }];
        }
        /* Credit expiry comes ONLY from check-in batches, the one thing the
           connector can actually date. `planExpiresAtMs` is the plan's own
           end and the connector keeps it deliberately separate — feeding it
           in as the credit date would rank Qoder by a date when nothing
           lapses, the exact conflation its README calls out as a fixed bug.
           No batch, no date: the card drops into the incomplete group instead
           of guessing a date. */
        function expiryOf(row) {
          const nearest = asNumber(row && row.nearestExpiryMs);
          return nearest !== null ? dateFromMs(nearest) : null;
        }

        const signedIn = !!(usage && usage.status === 'signed-in');
        const accountId = usage && typeof usage.accountId === 'string' ? usage.accountId : '';
        const accountName = usage && typeof usage.accountName === 'string' ? usage.accountName : '';
        /* `credits.total` is the REMAINING sum (see the connector's
           `creditsOf`), so the progress bar needs the sum of `size`. */
        const creditsDoc = usage && usage.credits ? usage.credits : null;
        const value = creditsDoc ? asNumber(creditsDoc.total) : null;
        if (signedIn && value !== null) {
          const packs = creditsDoc && Array.isArray(creditsDoc.packages) ? creditsDoc.packages : [];
          const sizeSum = packs.reduce(function (sum, pack) {
            const size = asNumber(pack && pack.size);
            return size !== null && size > 0 ? sum + size : sum;
          }, 0);
          const key = 'qoder:' + entry.region + ':' + (accountId || accountName || 'current');
          const poolRow = poolById.get(accountId) || null;
          out.push({
            sourceKey: key,
            service: 'Qoder',
            account: accountName,
            plan: entry.plan,
            credits: value,
            total: sizeSum > 0 ? sizeSum : null,
            expiresAt: poolRow ? expiryOf(poolRow) : null,
            lots: poolRow ? batchOf(poolRow) : []
          });
          seen.add(key);
        }

        /* Every account the connector knows about, pool rows first: they carry
           the expiry, and the serving account is already in `seen`. */
        poolRows.forEach(function (row) {
          if (!row || typeof row !== 'object') return;
          const rowValue = asNumber(row.credits);
          if (rowValue === null) return;
          const key = 'qoder:' + entry.region + ':' + (row.accountId || row.accountName || 'account');
          if (seen.has(key)) return;
          out.push({
            sourceKey: key,
            service: 'Qoder',
            account: row.accountName || '',
            plan: entry.plan,
            credits: rowValue,
            total: null,
            expiresAt: expiryOf(row),
            lots: batchOf(row)
          });
          seen.add(key);
        });

        /* Rows `usage` did not describe at all (pool off, or a failed usage
           read). `account-credits` carries no expiry, so these stay dateless
           rather than borrowing one. */
        const rows = credits && Array.isArray(credits.accounts) ? credits.accounts : [];
        rows.forEach(function (row) {
          if (!row || typeof row !== 'object') return;
          const rowValue = asNumber(row.credits);
          if (rowValue === null) return;
          const key = 'qoder:' + entry.region + ':' + (row.id || row.accountName || 'account');
          if (seen.has(key)) return;
          out.push({
            sourceKey: key,
            service: 'Qoder',
            account: row.accountName || '',
            plan: entry.plan,
            credits: rowValue,
            total: null,
            expiresAt: null,
            lots: []
          });
          seen.add(key);
        });
        return out;
      }));
      const answered = results.some(function (value) { return value !== null; });
      if (!answered) return null;
      const out = [];
      results.forEach(function (value) {
        if (value !== null) out.push.apply(out, value);
      });
      return out;
    }

    /* Which connectors the Host says are installed and switched on, and which
       of those actually mounted. `installed` and `enabled` are separate answers
       on purpose: a profile dependency that is installed but not selected has
       no Loader row at all, and reporting that as "not installed" is what made
       the panel offer "install" for a package already on disk.
       `map: null` means "the Host did not answer" — an older Host, a
       non-Desktop surface, or a failed read. That is NOT the same as "all off",
       so it falls back to trying every source exactly as before; hiding sources
       on an unknown answer would silently drop a user's accounts. */
    const INSTALL_ROUTE = '/plugins/dsh-connect-hub/install';
    const SWITCH_ROUTE = '/plugins/dsh-connect-hub/enable';
    let sourceState = { known: false, map: null };
    let sourceStateAt = 0;
    const SOURCE_STATE_TTL_MS = 10 * 1000;

    function sourceAvailable(key) {
      const map = sourceState.map;
      if (!map) return true;
      const row = map.get(key);
      /* A connector the Host does not know about is simply absent from the
         list; treat it as unavailable only when the answer was authoritative. */
      return row ? row.available === true : false;
    }

    /* Which source an entry came from. `sourceKey` is `<source>:<...>`, and the
       prefix is the key the Host reports, so one split serves every source. */
    function sourceKeyOf(entry) {
      const key = entry && entry.sourceKey;
      if (typeof key !== 'string' || key === '') return null;
      const at = key.indexOf(':');
      return at === -1 ? key : key.slice(0, at);
    }

    /* Hide an entry whose connector is switched off or gone — but never a
       manual entry (no sourceKey), and never one from a source the Host does
       not report (that is an unknown, not a "no"). */
    function isEntryHidden(state, entry) {
      const map = state && state.map;
      if (!map) return false;
      const key = sourceKeyOf(entry);
      if (key === null) return false;
      const row = map.get(key);
      if (!row) return false;
      return row.available !== true;
    }

    function visibleEntries(state, entries) {
      return (entries || []).filter(function (entry) { return !isEntryHidden(state, entry); });
    }

    /* Load the Host's answer once per surface; re-read when the window comes
       back so a connector toggled in Settings shows up without a reload. */
    function useSourceState() {
      const state = React.useState(sourceState);
      const setState = state[1];
      React.useEffect(function () {
        let alive = true;
        function refresh() {
          loadSourceState().then(function (next) {
            if (alive) setState(next);
          });
        }
        refresh();
        function onVisible() {
          if (document.visibilityState && document.visibilityState !== 'visible') return;
          refresh();
        }
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', onVisible);
        return function () {
          alive = false;
          document.removeEventListener('visibilitychange', onVisible);
          window.removeEventListener('focus', onVisible);
        };
      }, []);
      return state[0];
    }

    /* The display name each source writes onto its cards. Quick-add chips and
       the editor's datalist offer these, so a manual entry starts with the
       same spelling the sync would produce. */
    const SOURCE_SERVICE = {
      trae: 'Trae',
      workbuddy: 'WorkBuddy',
      meoo: 'Meoo 秒悟',
      madao: '华为云码道',
      qoder: 'Qoder'
    };

    /* Read the Host's connector states. Cheap (the Loader is read in memory),
       cached briefly so the pill and the page do not both hammer it. */
    async function loadSourceState() {
      const now = Date.now();
      if (sourceState.map && now - sourceStateAt < SOURCE_STATE_TTL_MS) return sourceState;
      const data = await getJson('/plugins/dsh-connect-hub/connectors', 5000);
      if (!data || data.known !== true || !Array.isArray(data.connectors)) {
        sourceState = { known: false, map: null };
        sourceStateAt = now;
        return sourceState;
      }
      const map = new Map();
      data.connectors.forEach(function (row) {
        if (row && typeof row.key === 'string') map.set(row.key, row);
      });
      sourceState = { known: true, map: map };
      sourceStateAt = now;
      return sourceState;
    }

    /* What each source is, for the source list. Kept beside SOURCE_SERVICE so
       the panel can name a connector it has never synced with. */
    const SOURCE_INFO = {
      trae: { service: 'Trae', repo: 'https://github.com/dingminhua/dsh-connect-trae' },
      workbuddy: { service: 'WorkBuddy', repo: 'https://github.com/dingminhua/dsh-connect-workbuddy' },
      meoo: { service: 'Meoo 秒悟', repo: 'https://github.com/xinstart-1/dsh-connect-meoo' },
      madao: { service: '华为云码道', repo: 'https://github.com/XLNC-L/dsh-connect-madao' },
      qoder: { service: 'Qoder', repo: 'https://github.com/dingminhua/dsh-connect-qoder' }
    };

    /* Ask the Host to change one connector. The Host owns the package names;
       this only ever sends a key, so a mistake here cannot install or enable
       anything outside the five known connectors.

       `route` is the install route or the enable route; an enable is a profile
       selection and returns in well under a second, while an install runs pnpm
       and gets the long bound. */
    async function changeSource(route, key, timeoutMs, extra) {
      const controller = new AbortController();
      const timer = window.setTimeout(function () { controller.abort(); }, timeoutMs);
      try {
        const response = await fetch(route, {
          method: 'POST',
          signal: controller.signal,
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify(Object.assign({ key: key }, extra || {}))
        });
        if (!response.ok) return { ok: false, state: 'failed', code: 'http-' + response.status };
        return await response.json();
      } catch (error) {
        return { ok: false, state: 'failed', code: error && error.name === 'AbortError' ? 'timeout' : 'network' };
      } finally {
        window.clearTimeout(timer);
      }
    }

    function installSource(key) {
      return changeSource(INSTALL_ROUTE, key, 120000);
    }

    /* Switch an installed connector on or off. Neither direction touches
       packages, so both are safe to retry and need no progress wording beyond
       "开启中…" / "关闭中…". */
    function enableSource(key, enabled) {
      return changeSource(SWITCH_ROUTE, key, 30000, { enabled: enabled });
    }

    const SYNC_SOURCES = [
      { key: 'trae', labelKey: 'sourceTrae', load: syncTrae },
      { key: 'workbuddy', labelKey: 'sourceWorkBuddy', load: syncWorkBuddy },
      { key: 'meoo', labelKey: 'sourceMeoo', load: syncMeoo },
      { key: 'madao', labelKey: 'sourceMadao', load: syncMadao },
      { key: 'qoder', labelKey: 'sourceQoder', load: syncQoder }
    ];

    /* Read every connector once and merge the result into the shared store.
       Both the page and the composer pill call this, and the in-flight flag
       keeps two visible surfaces from syncing over each other. */
    async function syncNow(t) {
      if (syncState.running) return { skipped: true, tone: null, text: null };
      syncState.running = true;
      try {
        /* Ask the Host first: a connector the user switched off (or never
           installed) must not be probed, and must not be reported as "did not
           respond" either — that sentence is what a broken source deserves,
           not a deliberate switch. */
        const known = await loadSourceState();
        const active = SYNC_SOURCES.filter(function (source) {
          return sourceAvailable(source.key);
        });
        const skipped = known.known
          ? SYNC_SOURCES.filter(function (source) { return !sourceAvailable(source.key); })
          : [];
        if (known.known && active.length === 0) {
          return { tone: 'warn', text: t('syncAllOff', { sources: skipped.map(function (source) { return t(source.labelKey); }).join(t('listSep')) }) };
        }
        const results = await Promise.all(active.map(async function (source) {
          try {
            const entries = await source.load();
            return { key: source.key, entries: entries };
          } catch (error) {
            return { key: source.key, entries: null };
          }
        }));
        const found = [];
        /* Responded, but with no usable rows. That is the signed-out case, and
           it needs its own sentence: counting it as success leaves the user
           wondering where their account went, while counting it as failure
           claims the connector is broken when it is merely logged out. */
        const idle = [];
        const failed = [];
        const imported = [];
        results.forEach(function (result) {
          const label = t((SYNC_SOURCES.find(function (item) { return item.key === result.key; }) || {}).labelKey || result.key);
          if (result.entries === null) {
            failed.push(label);
            return;
          }
          if (result.entries.length === 0) {
            idle.push(label);
            return;
          }
          found.push(label);
          imported.push.apply(imported, result.entries);
        });
        const unique = new Map();
        imported.forEach(function (entry) {
          if (entry && entry.sourceKey && !unique.has(entry.sourceKey)) unique.set(entry.sourceKey, entry);
        });
        const items = Array.from(unique.values());
        const idleText = idle.length > 0 ? ' ' + t('syncSourceIdle', { sources: idle.join(t('listSep')) }) : '';
        if (items.length === 0) {
          if (found.length > 0) {
            return { tone: 'warn', text: t('syncNoAccounts') + idleText };
          }
          return {
            tone: failed.length > 0 ? 'warn' : 'warn',
            text: t('syncNone') + idleText
          };
        }
        const now = Date.now();
        const merged = mergeImported(storeSnapshot().entries, items, now);
        storeWrite({ entries: pruneStale(merged.entries, items), lastSyncedAt: now });
        const detail = t('syncDoneDetail', { n: items.length, added: merged.added, updated: merged.updated });
        const failureText = failed.length > 0 ? ' ' + t('syncSomeFailed', { sources: failed.join(t('listSep')) }) : '';
        return { tone: failed.length > 0 ? 'warn' : 'ok', text: detail + idleText + failureText };
      } catch (error) {
        return { tone: 'error', text: t('syncFailed') };
      } finally {
        syncState.running = false;
      }
    }

    const ICON_STYLE = {
      display: 'inline-block',
      verticalAlign: 'middle',
      flex: '0 0 auto'
    };

    function Svg(props) {
      return h('svg', {
        width: props.size || 16,
        height: props.size || 16,
        viewBox: props.viewBox || '0 0 20 20',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: props.strokeWidth || 1.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
        focusable: 'false',
        className: props.className,
        style: Object.assign({}, ICON_STYLE, props.style)
      }, props.children);
    }

    function IconRadar(props) {
      return h(Svg, { size: props.size || 16, className: props.className }, [
        h('circle', { key: 'a', cx: 10, cy: 10, r: 7.2, opacity: 0.9 }),
        h('circle', { key: 'b', cx: 10, cy: 10, r: 3.6, opacity: 0.45 }),
        h('path', { key: 'c', d: 'M10 10l5.1-4.4' }),
        h('circle', { key: 'd', cx: 15.1, cy: 5.6, r: 1.2, fill: 'currentColor', stroke: 'none' })
      ]);
    }

    function IconSync(props) {
      return h(Svg, { size: props.size || 16 }, [
        h('path', { key: 'a', d: 'M4.2 8.2A6 6 0 0 1 15 5.9' }),
        h('path', { key: 'b', d: 'M15.1 3.2v2.9h-2.9' }),
        h('path', { key: 'c', d: 'M15.8 11.8A6 6 0 0 1 5 14.1' }),
        h('path', { key: 'd', d: 'M4.9 16.8v-2.9h2.9' })
      ]);
    }

    function IconPlus(props) {
      return h(Svg, { size: props.size || 16 }, [
        h('path', { key: 'a', d: 'M10 4.2v11.6' }),
        h('path', { key: 'b', d: 'M4.2 10h11.6' })
      ]);
    }

    /* Power glyph: the switch-on action, as opposed to the "+" that adds a
       package. */
    function IconPower(props) {
      return h(Svg, { size: props.size || 16 }, [
        h('path', { key: 'a', d: 'M10 3.4v6.2' }),
        h('path', { key: 'b', d: 'M5.6 5.9a6 6 0 1 0 8.8 0' })
      ]);
    }

    function IconSearch(props) {
      return h(Svg, { size: props.size || 16 }, [
        h('circle', { key: 'a', cx: 8.6, cy: 8.6, r: 4.7 }),
        h('path', { key: 'b', d: 'M12.2 12.2l4.1 4.1' })
      ]);
    }

    function IconCalendar(props) {
      return h(Svg, { size: props.size || 16 }, [
        h('rect', { key: 'a', x: 3.1, y: 4.6, width: 13.8, height: 11.6, rx: 2.4 }),
        h('path', { key: 'b', d: 'M3.4 8h13.2' }),
        h('path', { key: 'c', d: 'M6.8 3.2v3' }),
        h('path', { key: 'd', d: 'M13.2 3.2v3' })
      ]);
    }

    function IconWallet(props) {
      return h(Svg, { size: props.size || 16 }, [
        h('rect', { key: 'a', x: 2.7, y: 5, width: 14.6, height: 10.4, rx: 2.3 }),
        h('path', { key: 'b', d: 'M2.9 8.2h14.2' }),
        h('circle', { key: 'c', cx: 14.2, cy: 12.1, r: 1.1, fill: 'currentColor', stroke: 'none' })
      ]);
    }

    function IconArrowLeft(props) {
      return h(Svg, { size: props.size || 16 }, [
        h('path', { key: 'a', d: 'M16 10H4' }),
        h('path', { key: 'b', d: 'M8.4 5.4L3.8 10l4.6 4.6' })
      ]);
    }

    function IconSpark(props) {
      return h(Svg, { size: props.size || 16 }, [
        h('path', { key: 'a', d: 'M10 2.8l1.5 5.1 5.1 1.5-5.1 1.5-1.5 5.1-1.5-5.1-5.1-1.5 5.1-1.5z' })
      ]);
    }

    function IconX(props) {
      return h(Svg, { size: props.size || 16 }, [
        h('path', { key: 'a', d: 'M5.2 5.2l9.6 9.6' }),
        h('path', { key: 'b', d: 'M14.8 5.2l-9.6 9.6' })
      ]);
    }

    function IconChevron(props) {
      return h(Svg, { size: props.size || 12, className: props.className }, [
        h('path', { key: 'a', d: 'M5.6 8.2L10 12.4l4.4-4.2' })
      ]);
    }

    function IconCheck(props) {
      return h(Svg, { size: props.size || 12, strokeWidth: 2 }, [
        h('path', { key: 'a', d: 'M4.4 10.4l3.6 3.4 7.6-7.6' })
      ]);
    }

    function Spinner() {
      return h('span', { className: 'cr-spin', 'aria-hidden': 'true' });
    }

    function RadarIcon(props) {
      const size = typeof props.size === 'number' ? props.size : 16;
      return h('svg', {
        width: size,
        height: size,
        viewBox: '0 0 20 20',
        fill: 'none',
        'aria-hidden': 'true',
        focusable: 'false',
        style: { display: 'block', opacity: props.active ? 1 : 0.82 }
      }, [
        h('rect', { key: 'a', x: 2.2, y: 4.3, width: 15.6, height: 11.4, rx: 2.6, stroke: 'currentColor', strokeWidth: 1.55 }),
        h('path', { key: 'b', d: 'M2.6 8.1h14.8', stroke: 'currentColor', strokeWidth: 1.2, opacity: 0.55 }),
        h('circle', { key: 'c', cx: 14.1, cy: 12, r: 2.6, fill: 'var(--dsw-specific-sidebar-fill, var(--dsw-alias-bg-layer-1, #1b1c20))', stroke: 'currentColor', strokeWidth: 1.4 }),
        h('path', { key: 'd', d: 'M14.1 10.7v1.4l1 .6', stroke: 'currentColor', strokeWidth: 1.15 })
      ]);
    }

    /* One shared snapshot of the stored subscriptions. The page and the
       composer pill both read it, so a sync started from either one updates
       the other immediately (the `storage` event never fires in this tab). */
    let storeCache = null;
    const storeListeners = new Set();
    const syncState = { running: false };

    function storeSnapshot() {
      if (storeCache === null) storeCache = readStore();
      return storeCache;
    }

    function storeWrite(next) {
      storeCache = next;
      writeStore(next);
      storeListeners.forEach(function (listener) { listener(next); });
    }

    function storeUpdate(updater) {
      const current = storeSnapshot();
      storeWrite(typeof updater === 'function' ? updater(current) : updater);
    }

    function useStore() {
      const state = React.useState(storeSnapshot);
      React.useEffect(function () {
        function onChange(next) {
          state[1](next);
        }
        storeListeners.add(onChange);
        function onStorage(event) {
          if (event.key !== STORAGE_KEY) return;
          storeCache = readStore();
          onChange(storeCache);
        }
        window.addEventListener('storage', onStorage);
        return function () {
          storeListeners.delete(onChange);
          window.removeEventListener('storage', onStorage);
        };
      }, []);
      return [state[0], storeUpdate];
    }

    function Stat(props) {
      return h('div', { className: 'cr-stat cr-tone-' + (props.tone || 'brand') },
        h('div', { className: 'cr-stat-label' },
          h('i', { className: 'cr-stat-dot', 'aria-hidden': 'true' }),
          props.label
        ),
        h('div', { className: 'cr-stat-value' }, props.value),
        h('div', { className: 'cr-stat-note' }, props.note)
      );
    }

    /* Is this connector one the panel cannot talk to right now? A source with
       no Host answer is "unknown", never "off": hiding on an unknown would drop
       a user's accounts, so that case stays usable. */
    function connectorStateOf(states, key) {
      const row = states && states.map ? states.map.get(key) : null;
      return {
        known: !!(states && states.map),
        row: row,
        installed: row ? row.installed === true : false,
        enabled: row ? row.enabled === true : false,
        available: row ? row.available === true : false
      };
    }

    /* A connector the panel has nothing to show yet.
 
       This is the whole replacement for the old "supported connectors" section:
       a connector that is not installed, or is installed but switched off, gets
       a card of its own in the same grid as the credit cards. One action per
       state, and the action never claims to install something already on disk:
 
         - not installed  → 安装 (adds the package and selects it);
         - installed, off → 启用 (selects the existing bundle, no pnpm run);
         - on but failed  → 重试启动 (re-selects and reloads its rows).
 
       The last two also offer 禁用 once they are running, which is the switch
       the Plugins page has and this panel previously could not reach. */
    function ConnectorCard(props) {
      const t = props.t;
      const key = props.item.key;
      const info = SOURCE_INFO[key] || { service: key, repo: null };
      const state = props.state;
      const busy = props.busyKey === key;
      const anyBusy = props.busyKey !== null && props.busyKey !== undefined;
      const outcome = props.outcomeKey === key ? props.outcome : null;
      const installed = state.installed;
      const enabled = state.enabled;
      const available = state.available;

      let badge;
      let tone;
      if (available) {
        badge = t('sourceReady');
        tone = 'ok';
      } else if (installed && enabled) {
        /* Installed and switched on, but its fiber never reached ACTIVE: it
           failed to start, so the honest thing is to say so. */
        badge = t('sourceFailed');
        tone = 'error';
      } else if (installed) {
        badge = t('sourceOff');
        tone = 'idle';
      } else {
        badge = t('sourceAbsent');
        tone = 'idle';
      }

      let action;
      if (!installed) {
        action = h('button', {
          type: 'button',
          className: 'cr-btn cr-btn-primary cr-src-btn',
          onClick: function () { props.onInstall(key); },
          disabled: busy || anyBusy
        }, busy ? h(Spinner) : h(IconPlus, { size: 13 }), t(busy ? 'sourceInstalling' : 'sourceInstall'));
      } else if (available) {
        action = h('button', {
          type: 'button',
          className: 'cr-btn cr-btn-ghost cr-src-btn',
          onClick: function () { props.onEnable(key, false); },
          disabled: busy || anyBusy,
          title: t('sourceDisableHint', { service: info.service })
        }, busy ? h(Spinner) : h(IconPower, { size: 13 }), t('sourceDisable'));
      } else {
        action = h('button', {
          type: 'button',
          /* On but broken is a retry, not a switch: keep it quiet. */
          className: 'cr-btn cr-src-btn ' + (enabled ? 'cr-btn-ghost' : 'cr-btn-primary'),
          onClick: function () { props.onEnable(key, true); },
          disabled: busy || anyBusy
        }, busy ? h(Spinner) : h(IconPower, { size: 13 }),
          t(busy ? 'sourceEnabling' : enabled ? 'sourceRetryStart' : 'sourceEnable'));
      }

      return h('article', { className: 'cr-card cr-card-conn cr-tone-' + (tone === 'ok' ? 'brand' : tone) },
        h('div', { className: 'cr-card-top' },
          h('div', { className: 'cr-ident' },
            h(BrandTile, { service: info.service, sourceKey: key }),
            h('div', { className: 'cr-ident-text' },
              h('div', { className: 'cr-service' }, info.service),
              h('div', { className: 'cr-account' },
                info.repo ? h('a', {
                  className: 'cr-src-repo',
                  href: info.repo,
                  target: '_blank',
                  rel: 'noreferrer noopener',
                  title: info.repo
                }, info.repo.replace(/^https:\/\/github\.com\//, '')) : null)
            )
          ),
          h('span', { className: 'cr-badge' }, badge)
        ),
        h('div', { className: 'cr-conn-body' },
          outcome
            ? h('div', { className: 'cr-src-outcome cr-src-outcome-' + (outcome.ok ? 'ok' : 'error'), role: 'status' },
                t(sourceOutcomeKey(outcome, props.outcomeKind), { package: outcome.package || '', code: outcome.code || '', version: outcome.version || '' }))
            : h('p', { className: 'cr-conn-hint' }, t(
                !installed ? 'connAbsentHint'
                  : available ? 'connIdleHint'
                    : enabled ? 'connFailedHint' : 'connInstalledHint',
                { service: info.service }))
        ),
        h('div', { className: 'cr-card-foot' },
          h('span', { className: 'cr-origin' },
            h('i', { className: 'cr-origin-dot', 'aria-hidden': 'true' }),
            t(!installed ? 'connAbsentOrigin' : available ? 'connIdleOrigin' : 'connInstalledOrigin')),
          h('div', { className: 'cr-conn-action' }, action)
        )
      );
    }

    /* Map a connector change outcome to the sentence that explains it.
       `kind` only picks the success wording; every failure sentence is shared. */
    function sourceOutcomeKey(outcome, kind) {
      if (!outcome) return kind === 'enable' ? 'sourceEnabled' : kind === 'disable' ? 'sourceDisabled' : 'sourceInstalled';
      if (outcome.ok) return kind === 'enable' ? 'sourceEnabled' : kind === 'disable' ? 'sourceDisabled' : 'sourceInstalled';
      if (outcome.state === 'restart-required') return 'sourceRestart';
      if (outcome.state === 'unavailable' || outcome.code === 'management-required') return 'sourceNoManager';
      if (outcome.code === 'unknown-connector') return 'sourceUnknown';
      if (outcome.code === 'incompatible-version') return 'sourceIncompatible';
      if (outcome.code === 'timeout' || outcome.code === 'network') return 'sourceNetwork';
      if (outcome.code === 'already-installed') return 'sourceAlreadyOn';
      return 'sourceInstallFailed';
    }

    function EmptyState(props) {
      /* Read-only: the only way in is a connector. Offering "add" here would
         reintroduce a second, hand-maintained source of truth that no sync
         ever refreshes. */
      return h('section', { className: 'cr-empty' },
        h('div', { className: 'cr-empty-icon' }, h(IconRadar, { size: 27 })),
        h('h2', null, props.t('emptyTitle')),
        h('p', null, props.t('emptyDesc')),
        h('div', { className: 'cr-empty-actions' },
          h('button', {
            type: 'button',
            className: 'cr-btn cr-btn-primary',
            onClick: props.onSync,
            disabled: props.syncBusy
          }, props.syncBusy ? h(Spinner) : h(IconSync, { size: 15 }), props.t(props.syncBusy ? 'syncing' : 'sync'))
        )
      );
    }

    function HeroSetup(props) {
      return h('section', { className: 'cr-hero cr-hero-setup' },
        h('div', { className: 'cr-hero-copy' },
          h('div', { className: 'cr-hero-kicker' }, h(IconSpark, { size: 13 }), props.t('nextStep')),
          h('h2', { className: 'cr-hero-name' }, props.title),
          h('p', { className: 'cr-hero-desc' }, props.desc),
          h('div', { className: 'cr-hero-actions' },
            h('button', {
              type: 'button',
              className: 'cr-btn cr-btn-primary',
              onClick: props.onSync,
              disabled: props.syncBusy
            }, props.syncBusy ? h(Spinner) : h(IconSync, { size: 15 }), props.t(props.syncBusy ? 'syncing' : 'sync'))
          )
        ),
        h('div', { className: 'cr-hero-art-wrap' }, h(IconRadar, { size: 118, className: 'cr-hero-art' }))
      );
    }

    function PriorityHero(props) {
      const t = props.t;
      const active = props.active;
      if (active) {
        const due = dueOf(active);
        const days = daysUntil(due);
        const urgent = urgentLotOf(active);
        const tone = days <= 1 ? 'error' : days <= 7 ? 'warn' : 'brand';
        const account = [active.account, active.plan].filter(Boolean).join(' · ');
        const description = active.note || (urgent
          ? t('heroActiveDescLot', { credits: formatNum(urgent.credits), date: formatDate(urgent.expiresAt) })
          : t('heroActiveDesc', { credits: formatNum(active.credits), date: formatDate(due) }));
        return h('section', { className: 'cr-hero cr-hero-active cr-tone-' + tone },
          h('div', { className: 'cr-hero-copy' },
            h('div', { className: 'cr-hero-kicker' }, h(IconSpark, { size: 13 }), t('heroUseFirst')),
            h('div', { className: 'cr-hero-name-row' },
              h('h2', { className: 'cr-hero-name' }, active.service),
              account ? h('span', { className: 'cr-hero-account-inline' }, account) : null
            ),
            h('p', { className: 'cr-hero-desc' }, description),
            h('div', { className: 'cr-hero-chips' },
              h('span', { className: 'cr-chip' }, h(IconWallet, { size: 12 }), formatNum(active.credits) + ' ' + t('creditsUnit')),
              h('span', { className: 'cr-chip' }, h(IconCalendar, { size: 12 }), formatDate(due)),
              h('span', { className: 'cr-chip cr-chip-tone' }, daysText(days, t))
            )
          ),
          h('div', { className: 'cr-hero-side' },
            h('div', { className: 'cr-count' }, h('b', null, days === null ? '—' : String(days)), h('span', null, t('daysUnit'))),
            h('div', { className: 'cr-count-note' }, days === 0 ? t('today') : t('untilExpiry'))
          )
        );
      }
      if (props.draft) {
        return h(HeroSetup, {
          t: t,
          title: t('heroDraftTitle'),
          desc: t('heroDraftDesc', { name: props.draft.service }),
          onSync: props.onSync,
          syncBusy: props.syncBusy
        });
      }
      if (props.expired) {
        return h(HeroSetup, {
          t: t,
          title: t('heroExpiredTitle'),
          desc: t('heroExpiredDesc', { name: props.expired.service }),
          onSync: props.onSync,
          syncBusy: props.syncBusy
        });
      }
      if (props.empty) {
        return h(HeroSetup, {
          t: t,
          title: t('heroEmptyCreditTitle'),
          desc: t('heroEmptyCreditDesc', { name: props.empty.service }),
          onSync: props.onSync,
          syncBusy: props.syncBusy
        });
      }
      return null;
    }

    function SubscriptionCard(props) {
      const entry = props.entry;
      const t = props.t;
      const status = statusOf(entry);
      const tone = toneOfStatus(status);
      const due = dueOf(entry);
      const urgent = urgentLotOf(entry);
      const days = daysUntil(due);
      const account = [entry.account, entry.plan].filter(Boolean).join(' · ') || t('noAccount');
      const credits = asNumber(entry.credits);
      const total = asNumber(entry.total);
      const pct = total !== null && total > 0 && credits !== null ? Math.max(0, Math.min(100, (credits / total) * 100)) : null;
      return h('article', {
        className: 'cr-card cr-tone-' + tone,
        style: { animationDelay: Math.min(props.index || 0, 8) * 35 + 'ms' }
      },
        h('div', { className: 'cr-card-top' },
          h('div', { className: 'cr-ident' },
            h(BrandTile, { service: entry.service, sourceKey: sourceKeyOf(entry) }),
            h('div', { className: 'cr-ident-text' },
              h('div', { className: 'cr-service' }, entry.service),
              h('div', { className: 'cr-account', title: account }, account)
            )
          ),
          h('span', { className: 'cr-badge' }, badgeText(entry, t))
        ),
        h('div', { className: 'cr-amount' },
          h('b', null, credits === null ? '—' : formatNum(credits)),
          h('span', null, t('creditsUnit')),
          total !== null && total > 0 ? h('em', null, '/ ' + formatNum(total)) : null
        ),
        pct !== null ? h('div', { className: 'cr-meter', 'aria-hidden': 'true' },
          h('i', { style: { width: pct + '%' } })
        ) : null,
        h('div', { className: 'cr-meta' },
          h(IconCalendar, { size: 13 }),
          h('span', null, due ? formatDate(due) : t('noExpiry')),
          days !== null ? h('i', { className: 'cr-sep' }, '·') : null,
          days !== null ? h('span', { className: 'cr-days' }, daysText(days, t)) : null
        ),
        urgent ? h('p', { className: 'cr-lot-note' }, lotNoteText(urgent, t)) : null,
        entry.note ? h('p', { className: 'cr-note' }, entry.note) : null,
        h('div', { className: 'cr-card-foot' },
          h('span', { className: 'cr-origin' }, h('i', { className: 'cr-origin-dot', 'aria-hidden': 'true' }),
            entry.sourceKey ? t('synced') : t('legacyManual')),
          /* The connector's off switch, on one card per service. It is the
             same switch the Plugins page has; the card disappears and comes
             back with the connector, and the stored record is never deleted. */
          props.toggle ? h('button', {
            type: 'button',
            className: 'cr-btn cr-btn-ghost cr-src-btn cr-card-switch',
            onClick: function () { props.toggle.onToggle(props.toggle.key, false); },
            disabled: props.toggle.busy || props.toggle.anyBusy,
            title: props.t('sourceDisableHint', { service: entry.service })
          }, props.toggle.busy ? h(Spinner) : h(IconPower, { size: 12 }), props.t('sourceDisable')) : null
        )
      );
    }

    /* ---------------------------------------------------------------
       Composer pill: a compact credit summary that lives next to the
       composer, with a popup for the urgent subscriptions. Both surfaces
       read the shared store, so a sync from either one updates both.
       --------------------------------------------------------------- */
    const POP_ROWS = 40;

    /* Everything usable first, drafts last: the popup scrolls rather than
       hiding subscriptions behind a "more" line. */
    function popupRows(entries) {
      const sorted = sortEntries(entries);
      const real = sorted.filter(function (entry) { return statusOf(entry) !== 'draft'; });
      const drafts = sorted.filter(function (entry) { return statusOf(entry) === 'draft'; });
      return { rows: real.concat(drafts).slice(0, POP_ROWS) };
    }

    function CreditPill(props) {
      const t = props.t;
      const storeState = useStore();
      const store = storeState[0];
      const sourceInfo = useSourceState();
      const autoState = useAutoSettings();
      const auto = autoState[0];
      const setAuto = autoState[1];
      const [open, setOpen] = React.useState(false);
      const [busy, setBusy] = React.useState(false);
      const [place, setPlace] = React.useState(null);
      const [scrolled, setScrolled] = React.useState(false);
      const [autoMenu, setAutoMenu] = React.useState(false);
      const [menuMax, setMenuMax] = React.useState(0);
      const [, tick] = React.useState(0);
      const btnRef = React.useRef(null);
      const popRef = React.useRef(null);

      const entries = visibleEntries(sourceInfo, store.entries);
      const sorted = sortEntries(entries);
      const usable = sorted.filter(function (entry) { return isUsable(statusOf(entry)); });
      const totalCredits = usable.reduce(function (sum, entry) {
        const value = asNumber(entry.credits);
        return sum + (value === null ? 0 : value);
      }, 0);
      const soonEntries = sorted.filter(function (entry) {
        return statusOf(entry) === 'warn';
      });
      const expiredCount = sorted.filter(function (entry) {
        return statusOf(entry) === 'expired';
      }).length;
      const summary = popupRows(entries);

      React.useEffect(function () {
        const id = window.setInterval(function () {
          tick(function (value) { return value + 1; });
        }, 60000);
        return function () { window.clearInterval(id); };
      }, []);

      /* The popup belongs to the pill, not to the composer: its bottom edge
         sits 8px above the pill and it grows upward, so the panel reads as
         something the 连接中心 button opened in place. */
      const position = React.useCallback(function () {
        const btn = btnRef.current;
        const pop = popRef.current;
        if (!btn || !pop) return;
        const anchor = btn.getBoundingClientRect();
        const box = pop.getBoundingClientRect();
        const gap = 8;
        const margin = 12;
        const viewW = window.innerWidth;
        const viewH = window.innerHeight;

        const width = Math.min(box.width, viewW - margin * 2);
        let left = anchor.left + anchor.width / 2 - width / 2;
        left = Math.max(margin, Math.min(left, viewW - width - margin));

        const bottom = anchor.top - gap;
        /* Never grow past the room above the pill, so the 8px gap survives on
           short windows instead of the panel sliding over the button. */
        const room = Math.max(80, bottom - margin);
        const maxHeight = Math.min(Math.round(room), Math.round(viewH * 0.82));
        const height = Math.min(box.height, maxHeight);
        const top = Math.max(margin, bottom - height);

        const next = { top: Math.round(top), left: Math.round(left), maxHeight: maxHeight };
        setPlace(function (prev) {
          if (prev && prev.top === next.top && prev.left === next.left && prev.maxHeight === next.maxHeight) return prev;
          return next;
        });
      }, []);

      /* Track whether the list is clipped, so the fade only appears when the
         popup had to shrink to fit above the composer. */
      React.useEffect(function () {
        if (!open) return undefined;
        const pop = popRef.current;
        const list = pop ? pop.querySelector('.cr-pop-list') : null;
        if (!list) { setScrolled(false); return undefined; }
        function measure() {
          setScrolled(list.scrollHeight > list.clientHeight + 1);
        }
        measure();
        if (typeof ResizeObserver === 'function') {
          const observer = new ResizeObserver(measure);
          observer.observe(list);
          return function () { observer.disconnect(); };
        }
        return undefined;
      }, [open, place]);

      /* Re-anchor when the content height changes: a background sync can add
         rows while the popup is already on screen. */
      React.useEffect(function () {
        if (!open) return undefined;
        const pop = popRef.current;
        if (!pop || typeof ResizeObserver !== 'function') return undefined;
        const observer = new ResizeObserver(function () { position(); });
        observer.observe(pop);
        return function () { observer.disconnect(); };
      }, [open, position]);

      /* The interval menu lives inside the popup, so a pointerdown anywhere
         else has to collapse it without closing the whole dialog. */
      React.useEffect(function () {
        if (!autoMenu) return undefined;
        function onDown(event) {
          const node = popRef.current;
          const menu = node ? node.querySelector('.cr-pop-autowrap') : null;
          if (menu && menu.contains(event.target)) return;
          setAutoMenu(false);
        }
        function onKey(event) {
          if (event.key === 'Escape') setAutoMenu(false);
        }
        /* The dialog is only as tall as the list it holds, so the interval menu
           has to fit whatever room is left under the header instead of running
           over the footer buttons. */
        function measure() {
          const pop = popRef.current;
          const btn = pop ? pop.querySelector('.cr-pop-auto') : null;
          const foot = pop ? pop.querySelector('.cr-pop-foot') : null;
          if (!pop || !btn) return;
          /* Stop above the footer: a dropdown that buries 刷新额度 / 打开面板
             makes the dialog feel broken. */
          const floor = foot ? foot.getBoundingClientRect().top : pop.getBoundingClientRect().bottom;
          const room = floor - btn.getBoundingClientRect().bottom - 10;
          setMenuMax(Math.max(132, Math.round(room)));
        }
        measure();
        document.addEventListener('pointerdown', onDown, true);
        document.addEventListener('keydown', onKey);
        window.addEventListener('resize', measure);
        return function () {
          document.removeEventListener('pointerdown', onDown, true);
          document.removeEventListener('keydown', onKey);
          window.removeEventListener('resize', measure);
        };
      }, [autoMenu]);

      React.useEffect(function () {
        if (!open) { setPlace(null); setAutoMenu(false); return undefined; }
        position();
        const raf = window.requestAnimationFrame(position);
        function onKey(event) {
          if (event.key === 'Escape') setOpen(false);
        }
        function onPointer(event) {
          const pop = popRef.current;
          const btn = btnRef.current;
          if (pop && pop.contains(event.target)) return;
          if (btn && btn.contains(event.target)) return;
          setOpen(false);
        }
        window.addEventListener('resize', position);
        window.addEventListener('scroll', position, true);
        document.addEventListener('keydown', onKey);
        document.addEventListener('pointerdown', onPointer, true);
        return function () {
          window.cancelAnimationFrame(raf);
          window.removeEventListener('resize', position);
          window.removeEventListener('scroll', position, true);
          document.removeEventListener('keydown', onKey);
          document.removeEventListener('pointerdown', onPointer, true);
        };
      }, [open, position]);

      async function refresh() {
        if (busy) return;
        setBusy(true);
        try {
          await syncNow(t);
        } finally {
          setBusy(false);
        }
      }

      /* Changing the interval from the popup has to sync right away the first
         time auto refresh is switched on, so the number above the pill is
         never stale while the new timer waits for its first tick. */
      function pickInterval(intervalMs) {
        const wasOn = auto.enabled;
        setAutoMenu(false);
        setAuto({ enabled: true, intervalMs: intervalMs });
        if (!wasOn) {
          autoEngine.lastAttempt = Date.now();
          refresh();
        }
      }

      const tone = soonEntries.length > 0 ? 'warn' : 'brand';
      const dotTone = soonEntries.length > 0 ? 'warn' : expiredCount > 0 ? 'error' : null;
      const stamp = store.lastSyncedAt ? formatSyncTime(store.lastSyncedAt) : t('neverSynced');
      const pillTitle = soonEntries.length > 0
        ? t('popPillTitleSoon', { n: soonEntries.length })
        : t('popPillTitle');

      return h(React.Fragment, null,
        h('button', {
          ref: btnRef,
          type: 'button',
          className: 'cr-pill',
          'data-tone': tone,
          'data-busy': busy ? 'true' : 'false',
          'aria-haspopup': 'dialog',
          'aria-expanded': open ? 'true' : 'false',
          title: pillTitle,
          onClick: function () { setOpen(!open); }
        },
          h(IconRadar, { size: 14, className: 'cr-pill-icon' }),
          h('span', { className: 'cr-pill-label' }, t('popPill')),
          h('span', { className: 'cr-pill-value' }, formatNum(totalCredits)),
          dotTone ? h('i', { className: 'cr-pill-dot', 'data-tone': dotTone, 'aria-hidden': 'true' }) : null
        ),
        open ? ReactDOM.createPortal(
          h('div', {
            ref: popRef,
            className: 'cr-pop' + (scrolled ? ' cr-pop-scroll' : ''),
            role: 'dialog',
            'aria-label': t('panelLabel'),
            style: place
              ? { top: place.top + 'px', left: place.left + 'px', maxHeight: place.maxHeight + 'px' }
              : { top: '0px', left: '0px', visibility: 'hidden' }
          },
            h('div', { className: 'cr-pop-head' },
              h('span', { className: 'cr-pop-logo' }, h(IconRadar, { size: 11 })),
              h('strong', { className: 'cr-pop-title' }, t('panelLabel')),
              h('div', { className: 'cr-pop-autowrap' },
                h('button', {
                  type: 'button',
                  className: 'cr-pop-auto',
                  'data-on': auto.enabled ? 'true' : 'false',
                  'aria-haspopup': 'menu',
                  'aria-expanded': autoMenu ? 'true' : 'false',
                  title: auto.enabled
                    ? t('autoEvery', { n: intervalLabel(auto.intervalMs, t) })
                    : t('autoTitle'),
                  onClick: function () { setAutoMenu(!autoMenu); }
                },
                  h('i', { className: 'cr-pop-auto-dot', 'aria-hidden': 'true' }),
                  h('span', null, auto.enabled
                    ? t('autoOn') + ' · ' + intervalLabel(auto.intervalMs, t)
                    : t('autoOff')),
                  h(IconChevron, { size: 10, className: 'cr-pop-auto-caret' })
                ),
                autoMenu ? h('div', {
                  className: 'cr-pop-auto-menu',
                  role: 'menu',
                  'aria-label': t('autoTitle'),
                  style: menuMax ? { maxHeight: menuMax + 'px' } : null
                },
                  h('div', { className: 'cr-pop-auto-menu-head' }, t('autoInterval')),
                  AUTO_OPTIONS.map(function (ms) {
                    const active = auto.enabled && auto.intervalMs === ms;
                    return h('button', {
                      key: ms,
                      type: 'button',
                      role: 'menuitemradio',
                      'aria-checked': active ? 'true' : 'false',
                      className: 'cr-pop-auto-item',
                      onClick: function () { pickInterval(ms); }
                    },
                      h('span', null, intervalLabel(ms, t)),
                      active ? h(IconCheck, { size: 11 }) : null
                    );
                  }),
                  h('div', { className: 'cr-pop-auto-sep' }),
                  h('button', {
                    type: 'button',
                    role: 'menuitemradio',
                    'aria-checked': auto.enabled ? 'false' : 'true',
                    className: 'cr-pop-auto-item',
                    onClick: function () { setAutoMenu(false); setAuto({ enabled: false, intervalMs: auto.intervalMs }); }
                  },
                    h('span', null, t('autoClose')),
                    !auto.enabled ? h(IconCheck, { size: 11 }) : null
                  )
                ) : null
              )
            ),
            summary.rows.length === 0
              ? h('div', { className: 'cr-pop-empty' }, t('popEmpty'))
              : h('div', { className: 'cr-pop-list' }, summary.rows.map(function (entry) {
                  const status = statusOf(entry);
                  const lot = urgentLotOf(entry);
                  return h('div', {
                    key: entry.id,
                    className: 'cr-pop-row',
                    'data-tone': toneOfStatus(status)
                  },
                    h('i', { className: 'cr-pop-dot', 'aria-hidden': 'true' }),
                    h('div', { className: 'cr-pop-rowtext' },
                      h('span', { className: 'cr-pop-rowtitle' },
                        String(entry.service || t('noAccount')),
                        entry.account ? h('em', null, ' · ' + String(entry.account)) : null
                      ),
                      h('span', { className: 'cr-pop-rowsub' },
                        lot ? lotNoteText(lot, t) : (formatDate(dueOf(entry)) || t('noExpiry'))
                      )
                    ),
                    h('div', { className: 'cr-pop-rowright' },
                      h('strong', null, formatNum(entry.credits)),
                      h('span', { className: 'cr-pop-badge' }, badgeText(entry, t))
                    )
                  );
                })),
            h('div', { className: 'cr-pop-foot' },
              h('button', {
                type: 'button',
                className: 'cr-pop-btn',
                onClick: refresh,
                disabled: busy
              }, busy ? h(Spinner) : h(IconSync, { size: 13 }), t(busy ? 'syncing' : 'popRefresh')),
              h('button', {
                type: 'button',
                className: 'cr-pop-btn cr-pop-btn-primary',
                onClick: function () {
                  setOpen(false);
                  if (props.openPanel) props.openPanel();
                }
              }, t('popOpen'), h(IconChevron, { size: 12, className: 'cr-pop-go' }))
            )
          ),
          document.body
        ) : null
      );
    }

    /* Injected once by the plugin, because the pill lives outside the panel
       page and must style itself even when the panel is not mounted. */
    const PILL_CSS = `
.cr-pill, .cr-pop {
  --cr-bg: var(--dsw-alias-bg-base, #141518);
  --cr-card: var(--dsw-alias-bg-layer-1, #1c1d21);
  --cr-card2: var(--dsw-alias-bg-layer-2, #24252b);
  --cr-border: var(--dsw-alias-border-l1, rgba(127,127,127,.20));
  --cr-border2: var(--dsw-alias-border-l2, rgba(127,127,127,.34));
  --cr-text: var(--dsw-alias-label-primary, #ececf1);
  --cr-sub: var(--dsw-alias-label-secondary, #a7aab3);
  --cr-brand: var(--dsw-alias-brand-primary, #5b6cff);
  --cr-warn: var(--dsw-alias-state-warn-primary, #e5a23a);
  --cr-error: var(--dsw-alias-state-error-primary, #e35d6a);
  --cr-idle: var(--dsw-alias-state-idle-primary, #8a8f9a);
  --cr-tone: var(--cr-brand);
}

/* ---- composer pill + popup ---- */
.cr-pill {
  display: inline-flex; align-items: center; gap: 6px;
  height: 22px; padding: 0 9px 0 7px;
  border: 0; border-radius: 999px;
  background: transparent; color: var(--dsw-alias-label-tertiary, #8b8f99);
  font-family: inherit; font-size: calc(var(--dsh-content-font-size-secondary, 13px) - 1px);
  line-height: 1; white-space: nowrap; cursor: pointer;
  transition: background-color .15s, color .15s;
}
.cr-pill:hover, .cr-pill[aria-expanded='true'] {
  background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14));
  color: var(--dsw-alias-label-secondary, #a7aab3);
}
.cr-pill-icon { flex: 0 0 auto; opacity: .9; }
.cr-pill[data-tone='warn'] .cr-pill-icon { color: var(--cr-warn); }
.cr-pill[data-tone='error'] .cr-pill-icon { color: var(--cr-error); }
.cr-pill-label { font-weight: 520; opacity: .82; }
.cr-pill-value { font-weight: 620; color: var(--dsw-alias-label-secondary, #a7aab3); font-variant-numeric: tabular-nums; }
.cr-pill[data-tone='warn'] .cr-pill-value { color: var(--cr-warn); }
.cr-pill[data-tone='error'] .cr-pill-value { color: var(--cr-error); }
.cr-pill-dot {
  width: 5px; height: 5px; border-radius: 50%; flex: 0 0 auto;
  background: var(--cr-warn);
}
.cr-pill-dot[data-tone='error'] { background: var(--cr-error); }
.cr-pill[data-busy='true'] .cr-pill-icon { animation: cr-pulse 1s ease-in-out infinite; }
.cr-pill:focus-visible { outline: 2px solid var(--cr-brand); outline-offset: 2px; }

.cr-pop {
  position: fixed; z-index: 1100; box-sizing: border-box;
  display: flex; flex-direction: column; overflow: hidden;
  max-height: calc(100dvh - 24px);
  width: min(378px, calc(100vw - 24px));
  padding: 12px;
  border: 1px solid var(--cr-border2);
  border-radius: var(--dsw-radius-lg, 14px);
  background: var(--dsw-specific-menu, var(--cr-card));
  box-shadow: var(--dsw-elevation-prominent, 0 22px 60px rgba(0,0,0,.38));
  backdrop-filter: var(--dsw-menu-backdrop-filter, blur(14px));
  color: var(--cr-text);
  font-family: inherit; font-size: 12.5px; line-height: 1.45;
  animation: cr-pop .16s cubic-bezier(.2,.8,.2,1) both;
}
.cr-pop *, .cr-pop *::before, .cr-pop *::after { box-sizing: border-box; }
/* One line, title on the left, auto refresh control on the right: the dialog
   is opened from the pill, so it does not need its own close button. */
.cr-pop-head { display: flex; align-items: center; gap: 6px; padding: 0 2px 8px; flex: 0 0 auto; }
.cr-pop-logo {
  width: 18px; height: 18px; border-radius: 6px; flex: 0 0 auto;
  display: flex; align-items: center; justify-content: center;
  color: var(--dsw-alias-label-primary-foreground, #fff);
  background: linear-gradient(135deg, color-mix(in srgb, var(--cr-brand) 88%, #fff), color-mix(in srgb, var(--cr-brand) 70%, #7a5cff));
}
.cr-pop-title { font-size: 12.5px; font-weight: 650; letter-spacing: -.01em; min-width: 0; }
.cr-pop-autowrap { position: relative; margin-left: auto; flex: 0 0 auto; }
.cr-pop-auto {
  display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 6px;
  border: 1px solid transparent; border-radius: 7px; background: transparent;
  color: var(--cr-sub); font-family: inherit; font-size: 10.5px; font-weight: 520;
  cursor: pointer; white-space: nowrap;
  transition: background-color .15s, color .15s, border-color .15s;
}
.cr-pop-auto:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.10)); color: var(--cr-text); }
.cr-pop-auto:focus-visible { outline: 2px solid var(--cr-brand); outline-offset: 1px; }
.cr-pop-auto-dot { width: 5px; height: 5px; border-radius: 50%; flex: 0 0 auto; background: var(--cr-idle); opacity: .6; }
.cr-pop-auto[data-on='true'] { color: var(--cr-text); }
.cr-pop-auto[data-on='true'] .cr-pop-auto-dot { background: var(--cr-ok); opacity: 1; }
.cr-pop-auto-caret { opacity: .5; transition: transform .15s; }
.cr-pop-auto[aria-expanded='true'] .cr-pop-auto-caret { transform: rotate(180deg); }
.cr-pop-auto-menu {
  position: absolute; top: calc(100% + 6px); right: 0; z-index: 2;
  min-width: 132px; padding: 5px;
  border: 1px solid var(--cr-border2); border-radius: 10px;
  /* Built from the opaque --cr-card token: --dsw-specific-menu can carry
     alpha, and a see-through dropdown shows the rows scrolling under it. */
  background: color-mix(in srgb, var(--cr-card) 92%, #fff);
  box-shadow: var(--dsw-elevation-prominent, 0 16px 40px rgba(0,0,0,.34));
  display: flex; flex-direction: column; gap: 1px;
  overflow-y: auto; overscroll-behavior: contain;
  animation: cr-pop .14s cubic-bezier(.2,.8,.2,1) both;
}
.cr-pop-auto-menu-head {
  padding: 3px 7px 5px; color: var(--cr-sub); font-size: 10px; font-weight: 600;
  letter-spacing: .04em; text-transform: uppercase; opacity: .75;
}
.cr-pop-auto-item {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  height: 26px; padding: 0 7px; border: 0; border-radius: 7px; background: transparent;
  color: var(--cr-text); font-family: inherit; font-size: 11.5px; text-align: left; cursor: pointer;
  transition: background-color .12s;
}
.cr-pop-auto-item:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.10)); }
.cr-pop-auto-item:focus-visible { outline: 2px solid var(--cr-brand); outline-offset: -2px; }
.cr-pop-auto-item[aria-checked='true'] { color: var(--cr-ok); font-weight: 650; }
.cr-pop-auto-sep { height: 1px; margin: 4px 6px; background: var(--cr-border); }
.cr-pop-list { display: flex; flex-direction: column; gap: 1px; margin-top: 2px; min-height: 0; overflow-y: auto; }
.cr-pop-scroll .cr-pop-list {
  -webkit-mask-image: linear-gradient(180deg, #000 calc(100% - 16px), transparent);
  mask-image: linear-gradient(180deg, #000 calc(100% - 16px), transparent);
}
.cr-pop-row {
  display: flex; align-items: center; gap: 8px; min-width: 0;
  padding: 6px 7px; border-radius: 8px;
  transition: background-color .12s;
}
.cr-pop-row:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.10)); }
.cr-pop-dot { width: 6px; height: 6px; border-radius: 50%; flex: 0 0 auto; background: var(--cr-tone); }
.cr-pop-row[data-tone='warn'] { --cr-tone: var(--cr-warn); }
.cr-pop-row[data-tone='error'] { --cr-tone: var(--cr-error); }
.cr-pop-row[data-tone='brand'] { --cr-tone: var(--cr-brand); }
.cr-pop-row[data-tone='idle'] { --cr-tone: var(--cr-idle); }
.cr-pop-row[data-tone='draft'] { --cr-tone: var(--cr-idle); }
.cr-pop-rowtext { display: flex; flex-direction: column; min-width: 0; flex: 1 1 auto; gap: 1px; }
.cr-pop-rowtitle {
  font-size: 12px; font-weight: 560; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cr-pop-rowtitle em { font-style: normal; font-weight: 400; color: var(--cr-sub); opacity: .75; }
.cr-pop-rowsub { color: var(--cr-sub); font-size: 10.5px; opacity: .82; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cr-pop-rowright { display: flex; align-items: center; gap: 7px; flex: 0 0 auto; }
.cr-pop-rowright strong { font-size: 12px; font-weight: 620; font-variant-numeric: tabular-nums; }
.cr-pop-badge {
  padding: 1px 6px; border-radius: 999px;
  background: color-mix(in srgb, var(--cr-tone) 16%, transparent);
  color: var(--cr-tone); font-size: 9.5px; font-weight: 600; white-space: nowrap;
}
.cr-pop-empty { padding: 14px 8px 6px; color: var(--cr-sub); font-size: 11.5px; text-align: center; }
.cr-pop-foot { display: flex; align-items: center; gap: 6px; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--cr-border); flex: 0 0 auto; }
.cr-pop-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
  height: 27px; padding: 0 10px; border-radius: 8px;
  border: 1px solid var(--cr-border); background: transparent; color: var(--cr-sub);
  font-family: inherit; font-size: 11.5px; font-weight: 550; white-space: nowrap; cursor: pointer;
  transition: background-color .15s, color .15s, border-color .15s;
}
.cr-pop-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14)); color: var(--cr-text); }
.cr-pop-btn:disabled { opacity: .6; cursor: default; }
.cr-pop-btn-primary { margin-left: auto; border-color: transparent; background: var(--cr-brand); color: var(--dsw-alias-label-primary-foreground, #fff); }
.cr-pop-btn-primary:hover:not(:disabled) { background: color-mix(in srgb, var(--cr-brand) 86%, #fff); color: var(--dsw-alias-label-primary-foreground, #fff); }
.cr-pop-go { transform: rotate(-90deg); }
@keyframes cr-pulse { 0%, 100% { opacity: .45; } 50% { opacity: 1; } }
`;

    function Page(props) {
      const t = props.t;
      const storeState = useStore();
      const store = storeState[0];
      const sourceInfo = useSourceState();
      const setStore = storeState[1];
      const [filter, setFilter] = React.useState('all');
      const [query, setQuery] = React.useState('');
      const [sync, setSync] = React.useState({ busy: false, tone: null, text: null });
      /* Installing a bundle runs pnpm and rewrites the profile: it can take a
         while and only one may run at a time. */
      const [installing, setInstalling] = React.useState(null);
      const [installOutcome, setInstallOutcome] = React.useState(null);
      const [, tick] = React.useState(0);
      const autoState = useAutoSettings();
      const auto = autoState[0];
      const setAuto = autoState[1];
      const [menuOpen, setMenuOpen] = React.useState(false);
      const autoMenuRef = React.useRef(null);

      const syncLock = React.useRef(false);

      React.useEffect(function () {
        const id = window.setInterval(function () {
          tick(function (value) { return value + 1; });
        }, 60000);
        return function () {
          window.clearInterval(id);
        };
      }, []);

      React.useEffect(function () {
        if (!menuOpen) return undefined;
        function onPointer(event) {
          if (autoMenuRef.current && !autoMenuRef.current.contains(event.target)) setMenuOpen(false);
        }
        function onKey(event) {
          if (event.key === 'Escape') setMenuOpen(false);
        }
        document.addEventListener('mousedown', onPointer);
        document.addEventListener('keydown', onKey);
        return function () {
          document.removeEventListener('mousedown', onPointer);
          document.removeEventListener('keydown', onKey);
        };
      }, [menuOpen]);

      React.useEffect(function () {
        if (!sync.text) return undefined;
        const id = window.setTimeout(function () {
          setSync(function (previous) {
            return Object.assign({}, previous, { text: null });
          });
        }, 10000);
        return function () {
          window.clearTimeout(id);
        };
      }, [sync.text]);

      /* Change one connector, then re-read the Host so the row flips to its
         new state without a page reload. A `restart-required` answer is shown
         as such: the bundle is on disk but its Host code is not running yet. */
      async function applyChange(kind, key, request) {
        if (installing !== null) return;
        setInstalling(key);
        setInstallOutcome(null);
        const result = await request();
        setInstalling(null);
        /* `kind` is what the success sentence says: an install added a package,
           an enable only flipped a switch, and the two are not the same news. */
        setInstallOutcome({ key: key, kind: kind, result: result });
        sourceState = { known: false, map: null };
        sourceStateAt = 0;
        await loadSourceState();
        if (result && result.ok) {
          runSync({ silent: true });
        }
      }

      function installConnector(key) {
        return applyChange('install', key, function () { return installSource(key); });
      }

      /* Installed: this only flips a switch, so it neither downloads anything
         nor needs the install progress wording. */
      function enableConnector(key, enabled) {
        const on = enabled !== false;
        return applyChange(on ? 'enable' : 'disable', key, function () {
          return enableSource(key, on);
        });
      }

      async function runSync(options) {
        const silent = !!(options && options.silent);
        if (syncLock.current) return;
        syncLock.current = true;
        setSync({ busy: true, tone: null, text: null });
        try {
          const result = await syncNow(t);
          if (result && result.skipped) return;
          setSync({
            busy: false,
            tone: silent ? null : result.tone,
            text: silent ? null : result.text
          });
        } finally {
          syncLock.current = false;
          setSync(function (previous) {
            return previous.busy ? { busy: false, tone: previous.tone, text: previous.text } : previous;
          });
        }
      }
      function chooseInterval(intervalMs) {
        const wasOn = auto.enabled;
        setAuto({ enabled: true, intervalMs: intervalMs });
        setMenuOpen(false);
        if (!wasOn) {
          /* Turning auto refresh on triggers one visible sync; keep the
             scheduled boot sync from running a second one right behind it. */
          autoEngine.lastAttempt = Date.now();
          runSync();
        }
      }

      function stopAuto() {
        setAuto({ enabled: false, intervalMs: auto.intervalMs });
        setMenuOpen(false);
      }

      const shown = visibleEntries(sourceInfo, store.entries);
      const sorted = sortEntries(shown);
      const statuses = shown.map(statusOf);
      const usable = sorted.filter(function (entry) { return isUsable(statusOf(entry)); });
      const soonEntries = shown.filter(function (entry) {
        const days = daysUntil(dueOf(entry));
        return days !== null && days >= 0 && days <= 7 && asNumber(entry.credits) !== null && entry.credits > 0;
      });
      const totalCredits = usable.reduce(function (sum, entry) { return sum + (asNumber(entry.credits) || 0); }, 0);
      const soonCredits = soonEntries.reduce(function (sum, entry) { return sum + soonCreditsOf(entry, 7); }, 0);
      const expiredCount = statuses.filter(function (status) { return status === 'expired'; }).length;
      const draftCount = statuses.filter(function (status) { return status === 'draft'; }).length;

      const counts = {
        all: shown.length,
        soon: soonEntries.length,
        month: shown.filter(function (entry) {
          const days = daysUntil(dueOf(entry));
          return days !== null && days >= 0 && days <= 30 && asNumber(entry.credits) !== null && entry.credits > 0;
        }).length,
        expired: expiredCount,
        draft: draftCount
      };

      const term = query.trim().toLowerCase();
      const filtered = sorted.filter(function (entry) {
        const status = statusOf(entry);
        const days = daysUntil(dueOf(entry));
        let matchesFilter = true;
        if (filter === 'soon') matchesFilter = days !== null && days >= 0 && days <= 7 && asNumber(entry.credits) !== null && entry.credits > 0;
        else if (filter === 'month') matchesFilter = days !== null && days >= 0 && days <= 30 && asNumber(entry.credits) !== null && entry.credits > 0;
        else if (filter === 'expired') matchesFilter = status === 'expired';
        else if (filter === 'draft') matchesFilter = status === 'draft';
        if (!matchesFilter) return false;
        if (term === '') return true;
        return [entry.service, entry.account, entry.plan, entry.note].some(function (value) {
          return String(value || '').toLowerCase().indexOf(term) >= 0;
        });
      });

      /* Connectors that contribute no card of their own.
 
         This is what replaced the standalone "supported connectors" list: a
         connector with nothing to show becomes a card in the same grid, so
         "not installed" and "installed but off" are stated where the missing
         credits would have been instead of in a second section above them. */
      const connectorCards = (function () {
        if (!sourceInfo || !sourceInfo.known) return [];
        const contributing = new Set();
        shown.forEach(function (entry) {
          const key = sourceKeyOf(entry);
          if (key !== null) contributing.add(key);
        });
        return SYNC_SOURCES.filter(function (source) {
          return !contributing.has(source.key);
        }).map(function (source) {
          return { key: source.key, state: connectorStateOf(sourceInfo, source.key) };
        });
      })();

      /* What the grid shows: the filtered account cards, then the connector
         cards that have nothing to show yet. Connector cards belong to "all"
         only — every other filter is about credit state, and a connector with
         no credits cannot match one. A search term still narrows them by
         service name, so typing "qoder" finds the connector card. */
      const gridItems = (function () {
        const items = filtered.map(function (entry) {
          return {
            kind: 'entry',
            entry: entry,
            toggle: false,
            key: sourceKeyOf(entry)
          };
        });
        /* Assign the per-service toggle to the first surviving card of a
           source, so filtering cannot hide the switch entirely. */
        const seen = new Set();
        items.forEach(function (item) {
          const key = item.key;
          if (key === null) return;
          const state = connectorStateOf(sourceInfo, key);
          if (!state.known || !state.available || seen.has(key)) return;
          seen.add(key);
          item.toggle = true;
        });
        if (filter !== 'all') return items;
        connectorCards.forEach(function (card) {
          const info = SOURCE_INFO[card.key] || { service: card.key };
          if (term !== '' && String(info.service).toLowerCase().indexOf(term) < 0 && card.key.indexOf(term) < 0) return;
          items.push({ kind: 'connector', key: card.key, state: card.state });
        });
        return items;
      })();

      const active = usable.length > 0 ? usable[0] : null;
      const firstDraft = sorted.find(function (entry) { return statusOf(entry) === 'draft'; });
      const firstExpired = sorted.find(function (entry) { return statusOf(entry) === 'expired'; });
      const firstEmpty = sorted.find(function (entry) { return statusOf(entry) === 'empty'; });

      const filters = [
        { id: 'all', label: t('filterAll'), count: counts.all },
        { id: 'soon', label: t('filterSoon'), count: counts.soon },
        { id: 'month', label: t('filterMonth'), count: counts.month },
        { id: 'expired', label: t('filterExpired'), count: counts.expired },
        { id: 'draft', label: t('filterDraft'), count: counts.draft }
      ];

      function clearFilters() {
        setFilter('all');
        setQuery('');
      }

      const syncStamp = store.lastSyncedAt
        ? t('lastSynced', { time: formatSyncTime(store.lastSyncedAt) })
        : t('neverSynced');

      return h(React.Fragment, null,
        h('style', { key: 'cr-style' }, CSS),
        h('div', { className: 'cr-page' },
          h('div', { className: 'cr-shell' },
          h('header', { className: 'cr-head' },
            h('div', { className: 'cr-brand' },
              h('div', { className: 'cr-logo' }, h(IconRadar, { size: 23 })),
              h('div', { className: 'cr-head-text' },
                h('div', { className: 'cr-eyebrow' }, t('eyebrow')),
                h('h1', { className: 'cr-title' }, t('title')),
                h('p', { className: 'cr-subtitle' }, t('subtitle'))
              )
            ),
            h('div', { className: 'cr-head-actions' },
              h('div', { className: 'cr-head-buttons' },
                props.backToConversation ? h('button', {
                  type: 'button',
                  className: 'cr-btn cr-btn-ghost',
                  onClick: props.backToConversation
                }, h(IconArrowLeft, { size: 15 }), t('back')) : null,
                h('button', {
                  type: 'button',
                  className: 'cr-btn cr-btn-ghost',
                  onClick: runSync,
                  disabled: sync.busy
                }, sync.busy ? h(Spinner) : h(IconSync, { size: 15 }), t(sync.busy ? 'syncing' : 'sync')),
              ),
              h('div', { className: 'cr-head-meta' },
                h('div', { className: 'cr-auto-wrap', ref: autoMenuRef },
                  h('button', {
                    type: 'button',
                    className: 'cr-auto',
                    'aria-haspopup': 'menu',
                    'aria-expanded': menuOpen ? 'true' : 'false',
                    'data-on': auto.enabled ? 'true' : 'false',
                    onClick: function () { setMenuOpen(!menuOpen); },
                    title: auto.enabled
                      ? t('autoEvery', { n: intervalLabel(auto.intervalMs, t) })
                      : t('autoTitle')
                  },
                    h('i', { className: 'cr-auto-dot', 'aria-hidden': 'true' }),
                    h('span', null, auto.enabled
                      ? t('autoOn') + ' · ' + intervalLabel(auto.intervalMs, t)
                      : t('autoOff')),
                    h(IconChevron, { size: 11, className: 'cr-auto-caret' })
                  ),
                  menuOpen ? h('div', { className: 'cr-auto-menu', role: 'menu', 'aria-label': t('autoTitle') },
                    h('div', { className: 'cr-auto-menu-head' }, t('autoInterval')),
                    AUTO_OPTIONS.map(function (ms) {
                      const active = auto.enabled && auto.intervalMs === ms;
                      return h('button', {
                        key: ms,
                        type: 'button',
                        role: 'menuitemradio',
                        'aria-checked': active ? 'true' : 'false',
                        className: 'cr-auto-item',
                        onClick: function () { chooseInterval(ms); }
                      },
                        h('span', null, intervalLabel(ms, t)),
                        active ? h(IconCheck, { size: 12 }) : null
                      );
                    }),
                    h('div', { className: 'cr-auto-sep' }),
                    h('button', {
                      type: 'button',
                      role: 'menuitemradio',
                      'aria-checked': auto.enabled ? 'false' : 'true',
                      className: 'cr-auto-item',
                      onClick: stopAuto
                    },
                      h('span', null, t('autoClose')),
                      !auto.enabled ? h(IconCheck, { size: 12 }) : null
                    )
                  ) : null
                ),
                h('span', { className: 'cr-sync-stamp' }, syncStamp)
              )
            )
          ),
          sync.text ? h('div', {
            className: 'cr-sync cr-sync-' + (sync.tone || 'ok'),
            role: 'status'
          }, h('i', { className: 'cr-sync-dot', 'aria-hidden': 'true' }), h('span', null, sync.text)) : null,
          /* A switched-off connector's cards are hidden, not deleted. No note
             is needed for that any more: the connector's own card in the grid
             says "已关闭" and carries the 启用 button, so the user sees both the
             cause and the fix in one place instead of a separate sentence. */
          /* With no synced entries the page still has something to say: the
             connector cards in the grid below, each with the action that would
             fill it in. The full empty state is only for a panel where even
             that would be blank (no Host answer, nothing stored). */
          shown.length === 0 && connectorCards.length === 0
            ? h(EmptyState, {
                t: t,
                syncBusy: sync.busy,
                onSync: runSync,
                sourceState: sourceInfo
              })
            : h(React.Fragment, null,
                h(PriorityHero, {
                  t: t,
                  active: active,
                  draft: firstDraft,
                  expired: firstExpired,
                  empty: firstEmpty,
                  onSync: runSync,
                  syncBusy: sync.busy
                }),
                shown.length > 0 ? h('section', { className: 'cr-stats' },
                  h(Stat, {
                    label: t('statCredits'),
                    value: formatNum(totalCredits),
                    note: t('statCreditsNote', { n: usable.length }),
                    tone: 'brand'
                  }),
                  h(Stat, {
                    label: t('statSoon'),
                    value: formatNum(soonEntries.length),
                    note: soonCredits > 0 ? t('statSoonNote', { credits: formatNum(soonCredits) }) : t('statSoonEmpty'),
                    tone: 'warn'
                  }),
                  h(Stat, {
                    label: t('statExpired'),
                    value: formatNum(expiredCount),
                    note: expiredCount > 0 ? t('statExpiredNote') : t('statExpiredEmpty'),
                    tone: expiredCount > 0 ? 'error' : 'idle'
                  }),
                  h(Stat, {
                    label: t('statSubs'),
                    value: formatNum(store.entries.length),
                    note: draftCount > 0 ? t('statDrafts', { n: draftCount }) : t('statSubsNote'),
                    tone: 'idle'
                  })
                ) : null,
                shown.length > 0 ? h('div', { className: 'cr-toolbar' },
                  h('div', { className: 'cr-filters', role: 'tablist' }, filters.map(function (item) {
                    return h('button', {
                      key: item.id,
                      type: 'button',
                      role: 'tab',
                      className: 'cr-filter',
                      'aria-selected': filter === item.id ? 'true' : 'false',
                      onClick: function () { setFilter(item.id); }
                    }, item.label, h('span', { className: 'cr-filter-count' }, String(item.count)));
                  })),
                  h('div', { className: 'cr-tools' },
                    h('label', { className: 'cr-search' },
                      h(IconSearch, { size: 14 }),
                      h('input', {
                        type: 'search',
                        value: query,
                        onChange: function (event) { setQuery(event.target.value); },
                        placeholder: t('search'),
                        'aria-label': t('search')
                      })
                    )
                  )
                ) : null,
                gridItems.length > 0
                  ? h('div', { className: 'cr-grid' }, gridItems.map(function (item, index) {
                      if (item.kind === 'connector') {
                        return h(ConnectorCard, {
                          key: 'conn:' + item.key,
                          item: item,
                          state: item.state,
                          t: t,
                          busyKey: installing,
                          outcomeKey: installOutcome ? installOutcome.key : null,
                          outcome: installOutcome ? installOutcome.result : null,
                          outcomeKind: installOutcome ? installOutcome.kind : null,
                          onInstall: installConnector,
                          onEnable: enableConnector
                        });
                      }
                      return h(SubscriptionCard, {
                        key: item.entry.id,
                        entry: item.entry,
                        t: t,
                        index: index,
                        toggle: item.toggle ? {
                          key: item.key,
                          busy: installing === item.key,
                          anyBusy: installing !== null,
                          onToggle: enableConnector
                        } : null
                      });
                    }))
                  : h('div', { className: 'cr-empty cr-empty-small' },
                      h('h2', null, t('emptyFiltered')),
                      h('p', null, t('emptyFilteredDesc')),
                      h('div', { className: 'cr-empty-actions' },
                        h('button', {
                          type: 'button',
                          className: 'cr-btn cr-btn-ghost',
                          onClick: clearFilters
                        }, t('clearFilters'))
                      )
                    )
              ),
          )
        )
      );
    }

    const CSS = `
.cr-page {
  --cr-bg: var(--dsw-alias-bg-base, #141518);
  --cr-card: var(--dsw-alias-bg-layer-1, #1c1d21);
  --cr-card2: var(--dsw-alias-bg-layer-2, #24252b);
  --cr-border: var(--dsw-alias-border-l1, rgba(127,127,127,.20));
  --cr-border2: var(--dsw-alias-border-l2, rgba(127,127,127,.34));
  --cr-text: var(--dsw-alias-label-primary, #ececf1);
  --cr-sub: var(--dsw-alias-label-secondary, #a7aab3);
  --cr-brand: var(--dsw-alias-brand-primary, #5b6cff);
  --cr-warn: var(--dsw-alias-state-warn-primary, #e5a23a);
  --cr-error: var(--dsw-alias-state-error-primary, #e35d6a);
  --cr-ok: var(--dsw-alias-state-success-primary, #3cb371);
  --cr-idle: var(--dsw-alias-state-idle-primary, #8a8f9a);
  --cr-tone: var(--cr-brand);
}
.cr-page {
  box-sizing: border-box;
  width: 100%;
  min-height: 100%;
  overflow: auto;
  padding: 24px clamp(18px, 3vw, 44px) 32px;
  color: var(--cr-text);
  background:
    radial-gradient(1100px 420px at 10% -12%, color-mix(in srgb, var(--cr-brand) 10%, transparent), transparent 65%),
    var(--cr-bg);
  font-size: 13px;
  line-height: 1.5;
  font-family: inherit;
}
.cr-page *,
.cr-page *::before,
.cr-page *::after { box-sizing: border-box; }
.cr-page button,
.cr-page input,
.cr-page textarea { font-family: inherit; }
/* One shell owns the column width. Centering each child separately (the old
   direct-child margin rule) broke as soon as a child set its own margin: the
   header's margin reset has the same specificity and came later, so it stopped
   centering and sat against the padding edge while everything below stayed in
   the middle. A single wrapper cannot drift that way. */
.cr-shell {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.cr-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin: 0; }
.cr-brand { display: flex; align-items: flex-start; gap: 12px; min-width: 0; }
.cr-logo {
  width: 42px; height: 42px; border-radius: 13px; flex: 0 0 auto;
  display: flex; align-items: center; justify-content: center;
  color: var(--dsw-alias-label-primary-foreground, #fff);
  background: linear-gradient(135deg, color-mix(in srgb, var(--cr-brand) 88%, #fff), color-mix(in srgb, var(--cr-brand) 72%, #7a5cff));
  box-shadow: 0 7px 20px color-mix(in srgb, var(--cr-brand) 26%, transparent);
}
.cr-head-text { min-width: 0; }
.cr-eyebrow { margin-bottom: 4px; color: var(--cr-brand); font-size: 10px; font-weight: 700; letter-spacing: .12em; }
.cr-title { margin: 0; font-size: 22px; line-height: 1.15; font-weight: 680; letter-spacing: -.025em; }
.cr-subtitle { margin: 7px 0 0; max-width: 620px; color: var(--cr-sub); font-size: 12px; line-height: 1.55; }
.cr-head-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
.cr-head-buttons { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
.cr-head-meta { display: flex; align-items: center; justify-content: flex-end; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
.cr-sync-stamp { color: var(--cr-sub); font-size: 10.5px; opacity: .72; white-space: nowrap; }
.cr-auto {
  display: inline-flex; align-items: center; gap: 5px;
  height: 20px; padding: 0 8px 0 7px; border-radius: 999px;
  border: 1px solid var(--cr-border); background: transparent; color: var(--cr-sub);
  font-size: 10.5px; font-weight: 560; white-space: nowrap; cursor: pointer;
  transition: color .15s, border-color .15s, background-color .15s;
}
.cr-auto:hover { color: var(--cr-text); border-color: var(--cr-border2); }
.cr-auto:focus-visible { outline: 2px solid var(--cr-brand); outline-offset: 2px; }
.cr-auto-dot { width: 6px; height: 6px; flex: 0 0 auto; border-radius: 50%; background: var(--cr-idle); opacity: .55; }
.cr-auto[data-on="true"] {
  color: var(--cr-text);
  border-color: color-mix(in srgb, var(--cr-ok) 34%, var(--cr-border));
  background: color-mix(in srgb, var(--cr-ok) 9%, transparent);
}
.cr-auto[data-on="true"] .cr-auto-dot {
  background: var(--cr-ok); opacity: 1;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--cr-ok) 16%, transparent);
}
.cr-auto-wrap { position: relative; display: inline-flex; }
.cr-auto-caret { opacity: .5; margin-left: -1px; transition: transform .15s; }
.cr-auto[aria-expanded="true"] .cr-auto-caret { transform: rotate(180deg); }
.cr-auto-menu {
  position: absolute; top: calc(100% + 6px); right: 0; z-index: 40;
  min-width: 150px; padding: 5px;
  border: 1px solid var(--cr-border2); border-radius: 11px;
  background: var(--cr-card);
  box-shadow: 0 14px 34px color-mix(in srgb, #000 22%, transparent);
  animation: cr-menu-in .12s ease-out;
}
.cr-auto-menu-head {
  padding: 4px 8px 6px; color: var(--cr-sub);
  font-size: 9.5px; font-weight: 680; letter-spacing: .08em;
}
.cr-auto-item {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  width: 100%; height: 28px; padding: 0 8px; border: 0; border-radius: 7px;
  background: transparent; color: var(--cr-text);
  font-size: 11.5px; font-weight: 500; text-align: left; white-space: nowrap; cursor: pointer;
  transition: background-color .12s, color .12s;
}
.cr-auto-item:hover { background: var(--dsw-alias-interactive-bg-hover, color-mix(in srgb, var(--cr-text) 7%, transparent)); }
.cr-auto-item:focus-visible { outline: 2px solid var(--cr-brand); outline-offset: -2px; }
.cr-auto-item[aria-checked="true"] { color: var(--cr-ok); font-weight: 650; }
.cr-auto-sep { height: 1px; margin: 4px 6px; background: var(--cr-border); }
@keyframes cr-menu-in {
  from { opacity: 0; transform: translateY(-3px); }
  to { opacity: 1; transform: none; }
}
.cr-btn {
  appearance: none; -webkit-appearance: none;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 30px; padding: 0 12px; border-radius: 9px;
  border: 1px solid transparent; background: transparent; color: var(--cr-text);
  font-size: 12px; font-weight: 600; line-height: 1; white-space: nowrap; cursor: pointer;
  transition: background-color .15s, border-color .15s, color .15s, box-shadow .15s, transform .15s;
}
.cr-btn:focus-visible { outline: 2px solid var(--cr-brand); outline-offset: 2px; }
.cr-btn:disabled { opacity: .55; cursor: default; }
.cr-btn-primary {
  background: var(--cr-brand); color: var(--dsw-alias-label-primary-foreground, #fff);
  box-shadow: 0 6px 16px color-mix(in srgb, var(--cr-brand) 24%, transparent);
}
.cr-btn-primary:hover:not(:disabled) { background: color-mix(in srgb, var(--cr-brand) 88%, #fff); }
.cr-btn-ghost { border-color: var(--cr-border2); color: var(--cr-sub); }
.cr-btn-ghost:hover:not(:disabled) { color: var(--cr-text); border-color: var(--cr-border2); background: var(--dsw-alias-interactive-bg-hover, color-mix(in srgb, var(--cr-text) 6%, transparent)); }
.cr-spin {
  display: inline-block; width: 13px; height: 13px; border-radius: 50%;
  border: 1.6px solid currentColor; border-right-color: transparent;
  animation: cr-rotate .7s linear infinite;
}
.cr-sync {
  display: flex; align-items: flex-start; gap: 8px; margin-top: 14px;
  border: 1px solid color-mix(in srgb, var(--cr-tone) 28%, var(--cr-border));
  border-radius: 10px; padding: 8px 11px; font-size: 11.5px; line-height: 1.5;
  background: color-mix(in srgb, var(--cr-tone) 8%, transparent);
  color: var(--cr-text);
}
.cr-sync-dot { width: 6px; height: 6px; margin-top: 6px; border-radius: 50%; flex: 0 0 auto; background: var(--cr-tone); }
.cr-sync-ok { --cr-tone: var(--cr-ok); }
.cr-sync-warn { --cr-tone: var(--cr-warn); }
.cr-sync-error { --cr-tone: var(--cr-error); }
.cr-hero {
  --cr-tone: var(--cr-brand);
  position: relative; overflow: hidden; margin-top: 20px;
  display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 18px;
  padding: 20px 22px; border-radius: 16px;
  border: 1px solid color-mix(in srgb, var(--cr-tone) 25%, var(--cr-border));
  background:
    radial-gradient(620px 190px at 96% 0%, color-mix(in srgb, var(--cr-tone) 14%, transparent), transparent 70%),
    linear-gradient(105deg, color-mix(in srgb, var(--cr-tone) 7%, var(--cr-card)), var(--cr-card));
  box-shadow: 0 10px 30px color-mix(in srgb, var(--cr-tone) 6%, transparent);
}
.cr-hero::after {
  content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 2px;
  background: linear-gradient(90deg, var(--cr-tone), transparent 76%); opacity: .62;
}
.cr-hero-copy { min-width: 0; }
.cr-hero-kicker {
  display: inline-flex; align-items: center; gap: 5px;
  color: var(--cr-tone); font-size: 10px; font-weight: 750; letter-spacing: .11em;
}
.cr-hero-name-row { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; min-width: 0; margin-top: 4px; }
.cr-hero-name { margin: 4px 0 0; font-size: 20px; line-height: 1.2; font-weight: 680; letter-spacing: -.02em; }
.cr-hero-name-row .cr-hero-name { margin-top: 0; }
.cr-hero-account-inline { color: var(--cr-sub); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 360px; }
.cr-hero-desc { margin: 6px 0 0; max-width: 620px; color: var(--cr-sub); font-size: 12px; line-height: 1.55; }
.cr-hero-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.cr-chip {
  display: inline-flex; align-items: center; gap: 5px;
  height: 24px; padding: 0 8px; border-radius: 7px;
  border: 1px solid var(--cr-border); background: color-mix(in srgb, var(--cr-card) 72%, transparent);
  color: var(--cr-sub); font-size: 10.5px; font-weight: 550; white-space: nowrap;
}
.cr-chip-tone { color: var(--cr-tone); border-color: color-mix(in srgb, var(--cr-tone) 26%, var(--cr-border)); background: color-mix(in srgb, var(--cr-tone) 8%, transparent); }
.cr-hero-side { display: flex; flex-direction: column; align-items: flex-end; gap: 7px; text-align: right; }
.cr-count { display: flex; align-items: baseline; gap: 4px; color: var(--cr-tone); }
.cr-count b { font-size: 42px; line-height: .95; font-weight: 720; letter-spacing: -.06em; font-variant-numeric: tabular-nums; }
.cr-count span { color: var(--cr-sub); font-size: 11px; font-weight: 650; }
.cr-count-note { color: var(--cr-sub); font-size: 10.5px; margin-bottom: 4px; }
.cr-hero-actions { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px; }
.cr-hero-art-wrap { position: relative; width: 130px; height: 112px; display: flex; align-items: center; justify-content: center; }
.cr-hero-art { color: var(--cr-tone); opacity: .13; }
.cr-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: 14px; }
.cr-stat {
  --cr-tone: var(--cr-brand);
  min-width: 0; padding: 12px 14px 11px; border-radius: 12px;
  border: 1px solid var(--cr-border); background: color-mix(in srgb, var(--cr-card) 86%, transparent);
}
.cr-stat-label { display: flex; align-items: center; gap: 5px; color: var(--cr-sub); font-size: 10.5px; white-space: nowrap; }
.cr-stat-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--cr-tone); flex: 0 0 auto; }
.cr-stat-value { margin-top: 3px; font-size: 22px; line-height: 1.16; font-weight: 690; letter-spacing: -.03em; font-variant-numeric: tabular-nums; }
.cr-stat-note { margin-top: 2px; color: var(--cr-sub); font-size: 10px; opacity: .86; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cr-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; margin-top: 20px; }
.cr-filters {
  display: inline-flex; align-items: center; gap: 2px; padding: 2px;
  border: 1px solid var(--cr-border); border-radius: 999px; background: var(--cr-card2);
  max-width: 100%;
}
.cr-filter {
  display: inline-flex; align-items: center; gap: 5px;
  height: 27px; padding: 0 11px; border: 0; border-radius: 999px;
  background: transparent; color: var(--cr-sub); font-size: 11.5px; font-weight: 550;
  white-space: nowrap; cursor: pointer; transition: background-color .15s, color .15s;
}
.cr-filter:hover { color: var(--cr-text); }
.cr-filter[aria-selected="true"] { background: var(--cr-card); color: var(--cr-text); box-shadow: 0 1px 3px rgba(0,0,0,.12); }
.cr-filter:focus-visible { outline: 2px solid var(--cr-brand); outline-offset: 1px; }
.cr-filter-count { opacity: .5; font-size: 10px; font-variant-numeric: tabular-nums; }
.cr-tools { display: flex; align-items: center; gap: 6px; }
.cr-search { position: relative; display: flex; align-items: center; width: 220px; max-width: 100%; }
.cr-search svg { position: absolute; left: 10px; color: var(--cr-sub); pointer-events: none; }
.cr-search input {
  width: 100%; height: 31px; padding: 0 12px 0 31px;
  border: 1px solid var(--cr-border); border-radius: 999px;
  background: var(--cr-card); color: var(--cr-text);
  font-size: 12px; outline: none;
}
.cr-search input::placeholder { color: var(--cr-sub); opacity: .72; }
.cr-search input:focus { border-color: color-mix(in srgb, var(--cr-brand) 55%, var(--cr-border2)); box-shadow: 0 0 0 3px color-mix(in srgb, var(--cr-brand) 12%, transparent); }
.cr-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 14px; }
.cr-card {
  --cr-tone: var(--cr-brand);
  position: relative; overflow: hidden;
  display: flex; flex-direction: column; gap: 10px;
  padding: 15px 16px 13px; border: 1px solid var(--cr-border); border-radius: 14px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--cr-tone) 5%, transparent), transparent 58%),
    var(--cr-card);
  animation: cr-rise .3s cubic-bezier(.2,.7,.2,1) both;
  transition: border-color .16s, box-shadow .16s, transform .16s;
}
.cr-card:hover { border-color: color-mix(in srgb, var(--cr-tone) 30%, var(--cr-border2)); box-shadow: 0 10px 26px color-mix(in srgb, var(--cr-tone) 8%, transparent); transform: translateY(-1px); }
.cr-card.cr-tone-draft { border-style: dashed; background: color-mix(in srgb, var(--cr-card) 84%, transparent); }
.cr-tone-brand { --cr-tone: var(--cr-brand); }
.cr-tone-warn { --cr-tone: var(--cr-warn); }
.cr-tone-error { --cr-tone: var(--cr-error); }
.cr-tone-idle { --cr-tone: var(--cr-idle); }
.cr-tone-draft { --cr-tone: var(--cr-sub); }
.cr-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
.cr-ident { display: flex; align-items: center; gap: 9px; min-width: 0; }
.cr-tile {
  width: 34px; height: 34px; border-radius: 10px; flex: 0 0 auto;
  display: flex; align-items: center; justify-content: center;
  color: var(--cr-brand); font-size: 11px; font-weight: 760; letter-spacing: .02em;
  border: 1px solid color-mix(in srgb, var(--cr-brand) 18%, var(--cr-border));
  background: linear-gradient(145deg, color-mix(in srgb, var(--cr-brand) 16%, var(--cr-card2)), color-mix(in srgb, var(--cr-brand) 6%, var(--cr-card2)));
}
/* A platform mark keeps its own colour, so it must not pick up the tile's
   brand tint (or the muted tint a connector card gives a placeholder tile). */
.cr-tile-brand {
  padding: 0;
  overflow: hidden;
  border-color: color-mix(in srgb, #fff 12%, transparent);
  background: var(--cr-card2);
}
/* The image fills the tile. contain, not cover: the CodeArts mark is not
   square, and cover would crop it. */
.cr-tile-img {
  width: 100%; height: 100%;
  display: block;
  object-fit: contain;
}
.cr-ident-text { min-width: 0; }
.cr-service { font-size: 13.5px; font-weight: 650; letter-spacing: -.01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cr-account { margin-top: 1px; color: var(--cr-sub); font-size: 10.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 210px; }
.cr-badge {
  display: inline-flex; align-items: center; flex: 0 0 auto;
  height: 20px; padding: 0 7px; border-radius: 999px;
  color: var(--cr-tone); background: color-mix(in srgb, var(--cr-tone) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--cr-tone) 24%, transparent);
  font-size: 10px; font-weight: 650; white-space: nowrap;
}
.cr-amount { display: flex; align-items: baseline; gap: 5px; flex-wrap: wrap; }
.cr-amount b { font-size: 26px; line-height: 1; font-weight: 700; letter-spacing: -.035em; font-variant-numeric: tabular-nums; }
.cr-amount span { color: var(--cr-sub); font-size: 10.5px; }
.cr-amount em { color: var(--cr-sub); font-size: 10.5px; font-style: normal; opacity: .8; }
.cr-meter { height: 4px; border-radius: 999px; background: color-mix(in srgb, var(--cr-tone) 13%, transparent); overflow: hidden; }
.cr-meter i { display: block; height: 100%; border-radius: inherit; background: var(--cr-tone); opacity: .82; }
.cr-meta { display: flex; align-items: center; gap: 5px; min-width: 0; color: var(--cr-sub); font-size: 10.5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cr-meta svg { flex: 0 0 auto; opacity: .8; }
.cr-sep { font-style: normal; opacity: .45; }
.cr-days { color: var(--cr-tone); font-weight: 600; }
.cr-note {
  margin: 0; color: var(--cr-sub); font-size: 11px; line-height: 1.5;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.cr-lot-note {
  margin: -2px 0 0; padding: 3px 8px; align-self: flex-start; max-width: 100%;
  border-radius: 6px;
  border: 1px dashed color-mix(in srgb, var(--cr-warn) 40%, transparent);
  background: color-mix(in srgb, var(--cr-warn) 9%, transparent);
  color: var(--cr-warn);
  font-size: 10.5px; font-weight: 560; letter-spacing: .01em; line-height: 1.35;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cr-card-foot { display: flex; align-items: center; gap: 8px; margin-top: auto; padding-top: 9px; border-top: 1px solid var(--cr-border); }
.cr-origin { display: inline-flex; align-items: center; gap: 5px; color: var(--cr-sub); font-size: 9.5px; opacity: .82; }
.cr-origin-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--cr-tone); opacity: .8; }
/* Connector cards live in the same grid as the credit cards, so "not
   installed" and "installed but off" are stated where the missing credits
   would be. There is no separate list section any more. */
.cr-card-conn {
  /* A connector with nothing to report reads as a placeholder, not as data:
     dashed edge, no rise animation, no tone glow. */
  border-style: dashed;
  background: color-mix(in srgb, var(--cr-card) 78%, transparent);
  animation: none;
}
.cr-card-conn:hover {
  border-style: dashed;
  border-color: color-mix(in srgb, var(--cr-tone) 34%, var(--cr-border2));
  box-shadow: none;
  transform: none;
}
/* Only the placeholder tile is muted on a connector card; a real platform mark
   keeps its brand colour, because that is what makes the row scannable. */
.cr-card-conn .cr-tile:not(.cr-tile-brand) {
  color: var(--cr-idle);
  border-color: var(--cr-border);
  background: color-mix(in srgb, var(--cr-card2) 90%, transparent);
}
.cr-conn-body { display: flex; align-items: flex-start; min-height: 38px; }
.cr-conn-hint { margin: 0; color: var(--cr-sub); font-size: 11px; line-height: 1.55; }
.cr-conn-action { margin-left: auto; display: flex; align-items: center; gap: 6px; }
/* Connector cards carry little text, so the grid's 2-column rhythm would leave
   them mostly empty; let them shrink to their content and share the row. */
.cr-grid { align-items: start; }
.cr-card-switch { margin-left: auto; height: 23px; padding: 0 9px; font-size: 10.5px; }
.cr-card-switch svg { opacity: .75; }
.cr-src-repo {
  color: var(--cr-sub); font-size: 10px; opacity: .72; text-decoration: none;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 320px;
}
.cr-src-repo:hover { opacity: 1; text-decoration: underline; text-underline-offset: 2px; }
.cr-src-btn { height: 26px; padding: 0 11px; font-size: 11px; flex: 0 0 auto; }
.cr-src-outcome { font-size: 10px; line-height: 1.45; margin-top: 1px; }
.cr-src-outcome-ok { color: var(--cr-ok); }
.cr-src-outcome-error { color: var(--cr-error); }
.cr-empty {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  margin-top: 18px;
  padding: 38px 24px; border-radius: 18px; text-align: center;
  border: 1px dashed color-mix(in srgb, var(--cr-brand) 30%, var(--cr-border2));
  background:
    radial-gradient(600px 220px at 50% -10%, color-mix(in srgb, var(--cr-brand) 10%, transparent), transparent 70%),
    var(--cr-card);
}
.cr-empty-icon {
  width: 54px; height: 54px; border-radius: 17px; display: flex; align-items: center; justify-content: center;
  color: var(--cr-brand); border: 1px solid color-mix(in srgb, var(--cr-brand) 20%, var(--cr-border));
  background: color-mix(in srgb, var(--cr-brand) 10%, transparent);
}
.cr-empty h2 { margin: 2px 0 0; font-size: 18px; font-weight: 680; letter-spacing: -.02em; }
.cr-empty p { margin: 0; max-width: 540px; color: var(--cr-sub); font-size: 12px; line-height: 1.65; }
.cr-empty-actions { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; margin-top: 5px; }
.cr-empty-small { padding: 28px 18px; gap: 6px; margin-top: 14px; }
.cr-empty-small h2 { font-size: 15px; }
.cr-hint { color: var(--cr-sub); font-size: 9.5px; opacity: .7; margin-top: -1px; }
@keyframes cr-pop { from { opacity: 0; transform: translateY(8px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes cr-rise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes cr-rotate { to { transform: rotate(360deg); } }

@media (max-width: 880px) {
  .cr-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .cr-grid { grid-template-columns: 1fr; }
  .cr-hero { grid-template-columns: 1fr; }
  .cr-hero-side { flex-direction: row; align-items: center; justify-content: space-between; text-align: left; }
  .cr-count-note { margin-bottom: 0; }
  .cr-hero-art-wrap { display: none; }
}
@media (max-width: 560px) {
  .cr-page { padding: 20px 14px 28px; }
  .cr-head-actions { align-items: flex-start; width: 100%; }
  .cr-head-buttons { justify-content: flex-start; }
  .cr-head-meta { justify-content: flex-start; }
  .cr-title { font-size: 20px; }
  .cr-hero { padding: 16px; margin-top: 14px; }
  .cr-count b { font-size: 34px; }
  .cr-toolbar { align-items: stretch; }
  .cr-filters { overflow-x: auto; }
  .cr-tools { width: 100%; }
  .cr-search { width: 100%; }
  .cr-card { padding: 13px 14px 11px; }
  .cr-account { max-width: 160px; }
}
@media (prefers-reduced-motion: reduce) {
  .cr-card, .cr-auto-menu { animation: none; }
  .cr-card:hover { transform: none; }
  .cr-spin { animation-duration: 1.4s; }
}
`;

    function apply(ctx) {
      ctx.effect(function () {
        return ctx.locale.register(NS, { zh: ZH, en: EN });
      }, 'dsh-connect-hub: locale');

      ctx.effect(function () {
        const style = document.createElement('style');
        style.setAttribute('data-dsh-connect-hub', 'pill');
        style.textContent = PILL_CSS;
        document.head.appendChild(style);
        return function () {
          if (style.parentNode) style.parentNode.removeChild(style);
        };
      }, 'dsh-connect-hub: pill styles');

      const t = ctx.locale.bind(NS);
      localeT = t;

      function backToConversation() {
        const layout = ctx.get('layout');
        if (layout && typeof layout.selectPanel === 'function') layout.selectPanel(null);
      }

      function pageProps() {
        return { t: t, backToConversation: backToConversation };
      }

      ctx.slots.inject('main', function () {
        return ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
          inject: pageProps
        }, Page);
      });

      ctx.slots.inject('sidebar.panellist', function () {
        return ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 30,
          label: function () { return t('panelLabel'); },
          locale: NS
        }, RadarIcon);
      });

      /* Compact trigger beside the composer, opening the summary popup. */
      function openPanel() {
        const layout = ctx.get('layout');
        if (layout && typeof layout.selectPanel === 'function') {
          try {
            layout.selectPanel(PANEL_ID);
          } catch (error) {
            /* The panel slot is gone (plugin disabled); stay in the chat. */
          }
        }
      }

      ctx.slots.inject('conversation.composer.dock', function () {
        return ctx.slots.register({
          name: 'conversation.composer.dock',
          id: PANEL_ID,
          order: 20,
          locale: NS
        }, function ComposerPill() {
          return h(CreditPill, { t: ctx.locale.bind(NS), openPanel: openPanel });
        });
      });
    }

    return { name: NS, inject: ['slots', 'locale'], apply: apply };
  }
});