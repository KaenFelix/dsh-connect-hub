/**
 * Host half of dsh-connect-hub.
 *
 * The feature is a Client page: sidebar entry, local storage, and read-only
 * HTTP reads from connector plugins. This half answers the two things the
 * Client cannot see for itself:
 *
 *   - which connectors are installed, and which of those are switched on, so
 *     the panel can tell "not installed" from "installed but off"; and
 *   - installing or switching one on through the profile's own plugin manager,
 *     so the panel can offer the action its row actually needs.
 */

/* Loader fiber states, mirrored from Cordis (FiberState). A connector counts as
   usable only when its fiber is ACTIVE: a disabled row has no fiber at all, and
   a failed one has a fiber that never got its routes mounted. */
const FIBER_ACTIVE = 2;

/* The connectors this panel reads. `module` is the exact specifier the Loader
   entry carries; `package` is what the registry installs. They are the same
   string for every entry here, but keeping both means an entry that mounts a
   subpath still reports and installs its package.

   This list is the ONLY set of packages the install route will ever touch. The
   route takes a connector KEY, never a package spec, so a compromised page (or
   a crafted request) cannot turn this into an arbitrary package installer. */
const CONNECTORS = [
  { key: 'trae', module: 'dsh-connect-trae', package: 'dsh-connect-trae' },
  { key: 'workbuddy', module: 'dsh-connect-workbuddy', package: 'dsh-connect-workbuddy' },
  { key: 'meoo', module: 'dsh-connect-meoo', package: 'dsh-connect-meoo' },
  { key: 'madao', module: '@yzdys/dsh-connect-madao', package: '@yzdys/dsh-connect-madao' },
  { key: 'qoder', module: '@dmh2002/dsh-connect-qoder', package: '@dmh2002/dsh-connect-qoder' }
];

const STATE_ROUTE = '/plugins/dsh-connect-hub/connectors';
const INSTALL_ROUTE = '/plugins/dsh-connect-hub/install';
/* One route for both directions: `{ key, enabled }`. Kept at the old `enable`
   path so a page loaded before this change keeps working. */
const SWITCH_ROUTE = '/plugins/dsh-connect-hub/enable';

/** Read the Loader's live entries. Returns `undefined` when there is no Loader. */
function readEntries(ctx) {
  const loader = ctx.get('loader');
  if (!loader || typeof loader.entries !== 'function') return undefined;
  try {
    return [...loader.entries()];
  } catch (error) {
    return undefined;
  }
}

/**
 * The Loader's view of one module: how many rows carry it, whether one of them
 * is switched on, and whether one of them reached ACTIVE.
 *
 * `entry.disabled` is a getter that evaluates a `!!js` expression, so a row
 * whose condition cannot be evaluated throws; that row is treated as unusable
 * rather than guessed at, matching how the market reads the same field.
 */
function loaderStateOf(entries, moduleName) {
  const rows = entries.filter(function (entry) {
    const name = entry && entry.options ? entry.options.name : undefined;
    if (typeof name !== 'string') return false;
    /* A subpath entry mounts `pkg/sub`, and its package is up with it. */
    return name === moduleName || name.startsWith(moduleName + '/');
  });
  let enabled = false;
  let active = false;
  rows.forEach(function (entry) {
    let disabled = true;
    try {
      disabled = entry.disabled === true;
    } catch (error) {
      disabled = true;
    }
    if (!disabled) enabled = true;
    const fiber = entry.fiber;
    if (!disabled && fiber !== undefined && fiber.state === FIBER_ACTIVE) active = true;
  });
  return { rows: rows.length, enabled: enabled, active: active };
}

/**
 * Read the profile's bundle inventory, which is the only place a connector that
 * is installed but NOT switched on still appears.
 *
 * This is the difference the Loader cannot show: a profile dependency that was
 * installed and then deselected (`dsh.profile.bundles` no longer names it) has
 * no Loader row at all, so a panel reading only the Loader calls it "not
 * installed" and offers to install what is already on disk. `listBundles` also
 * reports `availability`, which distinguishes files that are readable from a
 * catalog entry that is merely installable.
 *
 * Returns `undefined` when there is no manager (a Host that cannot manage
 * plugins): that is "unknown", not "nothing installed".
 */
async function readBundles(ctx) {
  const manager = ctx.get('pluginManager');
  if (!manager || typeof manager.listBundles !== 'function') return undefined;
  try {
    const rows = await manager.listBundles();
    if (!Array.isArray(rows)) return undefined;
    return new Map(rows
      .filter(function (row) { return row && typeof row.name === 'string'; })
      .map(function (row) { return [row.name, row]; }));
  } catch (error) {
    return undefined;
  }
}

/**
 * Decide one connector's state from both answers.
 *
 * The two switches are independent in DSH: a bundle can be selected while its
 * row is disabled (the per-plugin switch), and a package can be installed while
 * its bundle is deselected (the per-bundle switch). "Off" is either of them, so
 * `enabled` is the conjunction; `available` is still only the Loader's ACTIVE
 * fiber, because a selected bundle whose layer failed to load has no rows at
 * all and must read as broken rather than off.
 */
function stateOf(entries, bundles, moduleName, packageName) {
  const loader = loaderStateOf(entries, moduleName);
  const bundle = bundles === undefined ? undefined : bundles.get(packageName);
  /* `availability: 'missing'` is a catalog entry with no files: not installed. */
  const bundleInstalled = bundle !== undefined
    && bundle.installed === true
    && bundle.availability !== 'missing';
  const installed = loader.rows > 0 || bundleInstalled;
  /* No manager: the Loader is the only switch there is. With one, the bundle
     selection is authoritative and the row state can only narrow it. */
  const selected = bundle === undefined || bundle.installed !== true
    ? loader.enabled
    : bundle.enabled === true && (loader.rows === 0 || loader.enabled);
  return { installed: installed, enabled: selected, available: loader.active };
}

function json(res, status, body) {
  if (res.writableEnded || res.destroyed) return;
  const text = JSON.stringify(body);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  });
  res.end(text);
}

/** Read a small JSON request body. Returns undefined for malformed input. */
function readBody(req, limit) {
  return new Promise(function (resolve) {
    let total = 0;
    const chunks = [];
    req.on('data', function (chunk) {
      total += chunk.length;
      if (total > limit) {
        req.destroy();
        resolve(undefined);
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', function () {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch (error) {
        resolve(undefined);
      }
    });
    req.on('error', function () {
      resolve(undefined);
    });
  });
}

/**
 * Accept only requests a local page could have made.
 *
 * The route changes the profile, so a cross-origin page must not be able to
 * drive it: an absent Origin is a same-origin navigation or a non-browser
 * caller, and a present one has to be this machine's loopback origin.
 */
function loopbackOrigin(req) {
  const origin = req.headers.origin;
  if (origin === undefined) return true;
  return /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
    || /^https?:\/\/localhost(:\d+)?$/.test(origin)
    || /^https?:\/\/\[::1\](:\d+)?$/.test(origin);
}

/**
 * Collect the state document shared by every route.
 *
 * A Loader-less Host still answers `known: false` so the panel can fall back to
 * trying each source rather than hiding all of them. When there IS a Loader but
 * no plugin manager, the Loader alone answers: `installed` then means "the
 * profile mounted a row for it", which is the most that Host can know.
 */
async function snapshot(ctx) {
  const entries = readEntries(ctx);
  if (entries === undefined) return { known: false, connectors: [] };
  const bundles = await readBundles(ctx);
  return {
    known: true,
    /* Diagnostic: whether `installed` reflects the profile's package list
       rather than merely "a Loader row exists". Rows are worded from their own
       three flags, so the panel does not need this; it is here for a reader
       trying to tell a degraded Host from one that really sees everything. */
    managed: bundles !== undefined,
    connectors: CONNECTORS.map(function (connector) {
      const state = stateOf(entries, bundles, connector.module, connector.package);
      return {
        key: connector.key,
        module: connector.module,
        package: connector.package,
        installed: state.installed,
        enabled: state.enabled,
        available: state.available
      };
    })
  };
}

/**
 * Turn a plugin manager outcome into what the panel should say.
 *
 * `applied` is live; `restart-required` needs the app quit and reopened;
 * `overridden`/`failed` carry the manager's own code, which the panel turns
 * into a sentence rather than showing a bare enum.
 */
function installReport(result) {
  if (!result || typeof result !== 'object') return { ok: false, state: 'failed', code: 'operation-error' };
  const code = result.error && typeof result.error.code === 'string' ? result.error.code : null;
  return {
    ok: result.application === 'applied',
    state: result.application || 'failed',
    code: code,
    version: typeof result.version === 'string' ? result.version : null,
    restartReason: typeof result.restartReason === 'string' ? result.restartReason : null,
    warnings: Array.isArray(result.warnings) ? result.warnings : [],
    /* The manager's pnpm tail is long; the panel only needs the first lines. */
    diagnostic: result.error && typeof result.error.diagnostic === 'string'
      ? result.error.diagnostic.slice(0, 400)
      : null,
    pendingBuilds: Array.isArray(result.pendingBuilds) ? result.pendingBuilds : []
  };
}

/**
 * Select an already-installed bundle, which is what actually mounts it.
 *
 * A package can stay a profile dependency while `dsh.profile.bundles` no longer
 * names it: the files are on disk and the row is simply gone from the Loader.
 * Reporting that as "not installed" is wrong, and installing it again answers
 * `already-installed` without contributing anything — so the panel's action has
 * to be this call. It is idempotent for a live bundle.
 *
 * Returns null when the manager cannot select bundles at all.
 */
function selectBundle(manager, packageName) {
  if (typeof manager.setBundleEnabled !== 'function') return Promise.resolve(null);
  return manager.setBundleEnabled(packageName, true);
}

/**
 * Read the request body and resolve the connector it names, or answer for us.
 *
 * Returns `{ connector, body }` so a route that takes a direction (enable vs
 * disable) can read it from the same body, without parsing the request twice.
 */
async function connectorRequest(req, res) {
  if (req.method !== 'POST') {
    res.writeHead(405, { allow: 'POST' });
    res.end();
    return null;
  }
  if (!loopbackOrigin(req)) {
    json(res, 403, { ok: false, state: 'failed', code: 'forbidden' });
    return null;
  }
  const body = await readBody(req, 64 * 1024);
  const key = body && typeof body.key === 'string' ? body.key : null;
  /* The key has to name one of OUR connectors. Anything else stops here,
     before a package spec could reach the manager. */
  const connector = key === null ? undefined : CONNECTORS.find(function (item) {
    return item.key === key;
  });
  if (connector === undefined) {
    json(res, 400, { ok: false, state: 'failed', code: 'unknown-connector' });
    return null;
  }
  return { connector: connector, body: body };
}

/** Answer one failed manager call without inventing an outcome. */
function failedChange(res, connector, error) {
  const code = error && typeof error.code === 'string' ? error.code : null;
  json(res, 200, {
    ok: false,
    state: 'failed',
    package: connector.package,
    key: connector.key,
    code: code || 'operation-error',
    diagnostic: error instanceof Error ? error.message.slice(0, 400) : String(error).slice(0, 400)
  });
}

/** The manager service, or a reply that says why this Host cannot change it. */
function managerOrRefusal(ctx, res, connector) {
  const manager = ctx.get('pluginManager');
  if (manager && typeof manager.installBundle === 'function') return manager;
  /* A read-only or non-management Host: say so instead of offering a button
     that could never work. */
  json(res, 200, {
    ok: false,
    state: 'unavailable',
    code: 'management-required',
    package: connector.package,
    key: connector.key
  });
  return null;
}

/**
 * The Loader rows this connector owns.
 *
 * A row is matched by module specifier, and a subpath row (`pkg/sub`) belongs to
 * the same package. Rows the manager cannot address carry `readOnlyReason`;
 * they are filtered out here so neither direction retries them forever.
 */
async function connectorRows(manager, connector) {
  if (typeof manager.listPlugins !== 'function') return [];
  const rows = await manager.listPlugins();
  if (!Array.isArray(rows)) return [];
  return rows.filter(function (row) {
    if (!row || typeof row.moduleName !== 'string') return false;
    const name = row.moduleName;
    const mine = name === connector.module || name.startsWith(connector.module + '/');
    return mine && row.readOnlyReason === undefined;
  });
}

/**
 * Switch one connector on, whichever of the two DSH switches is off.
 *
 * A connector can be off in two independent ways, and the panel cannot tell
 * them apart from the state document alone:
 *
 *   - its bundle is not selected (the package is installed, no Loader row); or
 *   - its bundle is selected but its row is disabled (a per-plugin switch).
 *
 * Selecting the bundle is the first fix and is idempotent. If rows still exist
 * and are disabled afterwards, the second fix is `setPluginEnabled` on each of
 * them — which is what the Plugins page's own toggle does.
 */
async function enableConnector(manager, connector) {
  let result = null;
  if (typeof manager.setBundleEnabled === 'function') {
    result = await manager.setBundleEnabled(connector.package, true);
    /* Selected name with no files: nothing to mount, so install instead. */
    if (result && result.application === 'failed'
      && result.error && result.error.code === 'not-bundle') {
      return manager.installBundle(connector.package, { enabled: true });
    }
    if (result && result.application === 'failed') return result;
  }
  const rows = await connectorRows(manager, connector);
  for (const row of rows) {
    if (row.enabled === true || typeof manager.setPluginEnabled !== 'function') continue;
    const changed = await manager.setPluginEnabled(row.entryId, true);
    if (changed && changed.application === 'failed') return changed;
    result = changed || result;
  }
  return result;
}

/**
 * Switch one connector off, keeping its package installed.
 *
 * Deselecting the bundle is the right operation and it is reversible: the
 * dependency stays in `package.json`, so the row turns into "installed · off"
 * and "switch on" brings it back without a download. Disabling the Loader rows
 * instead would leave the bundle selected, which is the other shape of off and
 * is used only when the name is not a bundle at all.
 */
async function disableConnector(manager, connector) {
  if (typeof manager.setBundleEnabled === 'function') {
    const result = await manager.setBundleEnabled(connector.package, false);
    /* Not a bundle row (a plain plugin): fall through to the row switch. */
    if (!(result && result.application === 'failed'
      && result.error && result.error.code === 'not-bundle')) {
      return result;
    }
  }
  let result = null;
  const rows = await connectorRows(manager, connector);
  for (const row of rows) {
    if (row.enabled !== true || typeof manager.setPluginEnabled !== 'function') continue;
    const changed = await manager.setPluginEnabled(row.entryId, false);
    if (changed && changed.application === 'failed') return changed;
    result = changed || result;
  }
  return result;
}

export function apply(ctx) {
  /* Both services are optional: a Host without a webserver simply never serves
     the routes, and the panel then falls back to trying every connector. */
  ctx.inject(['webServer'], function (webCtx) {
    const server = webCtx.get('webServer');
    if (!server || typeof server.register !== 'function') return;

    const stateDispose = server.register({
      kind: 'exact',
      path: STATE_ROUTE,
      handler: async function (req, res) {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.writeHead(405, { allow: 'GET, HEAD' });
          res.end();
          return;
        }
        /* No Loader is not the same as "nothing installed": answer with an
           explicit false so the Client can tell "unknown" from "all off" and
           fail open instead of hiding every source. */
        let document;
        try {
          document = await snapshot(ctx);
        } catch (error) {
          document = { known: false, connectors: [] };
        }
        json(res, 200, document);
      }
    });

    const installDispose = server.register({
      kind: 'exact',
      path: INSTALL_ROUTE,
      handler: async function (req, res) {
        const request = await connectorRequest(req, res);
        if (request === null) return;
        const connector = request.connector;
        const manager = managerOrRefusal(ctx, res, connector);
        if (manager === null) return;
        try {
          let result = await manager.installBundle(connector.package, { enabled: true });
          /* `already-installed` means the files are here but the bundle is not
             selected; selecting it is the operation that mounts it. Without
             this the panel would offer "install" forever. */
          if (result && result.application === 'failed'
            && result.error && result.error.code === 'already-installed') {
            try {
              const selected = await selectBundle(manager, connector.package);
              if (selected !== null) {
                result = Object.assign({}, result, {
                  application: selected.application || 'applied',
                  error: selected.application === 'failed' ? selected.error : undefined
                });
              }
            } catch (error) {
              /* Keep the manager's original answer when the follow-up throws. */
            }
          }
          json(res, 200, Object.assign({ package: connector.package, key: connector.key, enabled: true }, installReport(result)));
        } catch (error) {
          failedChange(res, connector, error);
        }
      }
    });

    /* Turning an installed connector on or off. No pnpm run either way unless
       the profile's name is selected while its files are gone; normally each
       direction is one or two cheap profile writes.
 
       The body carries `{ key, enabled }`, where `enabled` defaults to true so a
       request written before this had a direction keeps switching on. */
    const switchDispose = server.register({
      kind: 'exact',
      path: SWITCH_ROUTE,
      handler: async function (req, res) {
        const request = await connectorRequest(req, res);
        if (request === null) return;
        const connector = request.connector;
        const enabled = !(request.body && request.body.enabled === false);
        const manager = managerOrRefusal(ctx, res, connector);
        if (manager === null) return;
        try {
          const result = enabled
            ? await enableConnector(manager, connector)
            : await disableConnector(manager, connector);
          json(res, 200, Object.assign({
            package: connector.package,
            key: connector.key,
            enabled: enabled
          }, installReport(result)));
        } catch (error) {
          failedChange(res, connector, error);
        }
      }
    });

    ctx.effect(function () {
      return function () {
        if (typeof stateDispose === 'function') stateDispose();
        if (typeof installDispose === 'function') installDispose();
        if (typeof switchDispose === 'function') switchDispose();
      };
    }, 'dsh-connect-hub: connector state, install, and switch routes');
  });
}