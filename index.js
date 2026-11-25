/**
 * Host half of dsh-credit-radar.
 *
 * The feature is a Client page: sidebar entry, local storage, and read-only
 * HTTP reads from connector plugins. This half answers the two things the
 * Client cannot see for itself:
 *
 *   - which connectors the Loader has installed and switched on, so the panel
 *     can stop offering a source a user turned off; and
 *   - installing one a user asked for, through the profile's own plugin
 *     manager, so the panel can offer "install" next to "sync".
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
  { key: 'madao', module: 'dsh-connect-madao', package: 'dsh-connect-madao' },
  { key: 'qoder', module: '@dmh2002/dsh-connect-qoder', package: '@dmh2002/dsh-connect-qoder' }
];

const STATE_ROUTE = '/plugins/dsh-credit-radar/connectors';
const INSTALL_ROUTE = '/plugins/dsh-credit-radar/install';

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
 * Decide one connector's availability from the entries carrying its module.
 *
 * `entry.disabled` is a getter that evaluates a `!!js` expression, so a row
 * whose condition cannot be evaluated throws; that row is treated as unusable
 * rather than guessed at, matching how the market reads the same field.
 */
function stateOf(entries, moduleName) {
  const rows = entries.filter(function (entry) {
    const name = entry && entry.options ? entry.options.name : undefined;
    if (typeof name !== 'string') return false;
    /* A subpath entry mounts `pkg/sub`, and its package is up with it. */
    return name === moduleName || name.startsWith(moduleName + '/');
  });
  if (rows.length === 0) return { installed: false, enabled: false, available: false };
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
  return { installed: true, enabled: enabled, available: active };
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

/** Collect the state document shared by both routes. */
function snapshot(ctx) {
  const entries = readEntries(ctx);
  if (entries === undefined) return { known: false, connectors: [] };
  return {
    known: true,
    connectors: CONNECTORS.map(function (connector) {
      const state = stateOf(entries, connector.module);
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

export function apply(ctx) {
  /* Both services are optional: a Host without a webserver simply never serves
     the route, and the panel then falls back to trying every connector. */
  ctx.inject(['webServer'], function (webCtx) {
    const server = webCtx.get('webServer');
    if (!server || typeof server.register !== 'function') return;

    const stateDispose = server.register({
      kind: 'exact',
      path: STATE_ROUTE,
      handler: function (req, res) {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.writeHead(405, { allow: 'GET, HEAD' });
          res.end();
          return;
        }
        /* No Loader is not the same as "nothing installed": answer with an
           explicit false so the Client can tell "unknown" from "all off" and
           fail open instead of hiding every source. */
        json(res, 200, snapshot(ctx));
      }
    });

    const installDispose = server.register({
      kind: 'exact',
      path: INSTALL_ROUTE,
      handler: async function (req, res) {
        if (req.method !== 'POST') {
          res.writeHead(405, { allow: 'POST' });
          res.end();
          return;
        }
        if (!loopbackOrigin(req)) {
          json(res, 403, { ok: false, state: 'failed', code: 'forbidden' });
          return;
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
          return;
        }
        const manager = ctx.get('pluginManager');
        if (!manager || typeof manager.installBundle !== 'function') {
          /* A read-only or non-management Host: say so instead of offering a
             button that could never work. */
          json(res, 200, { ok: false, state: 'unavailable', code: 'management-required', package: connector.package });
          return;
        }
        try {
          let result = await manager.installBundle(connector.package, { enabled: true });
          /* A package that is still a profile dependency but no longer listed
             among its bundles answers `already-installed` without contributing
             anything — the Loader has no row for it, so the panel would keep
             offering "install" forever. Selecting the bundle is the operation
             that actually mounts it, and it is idempotent for a live one. */
          if (result && result.application === 'failed'
            && result.error && result.error.code === 'already-installed'
            && typeof manager.setBundleEnabled === 'function') {
            try {
              const selected = await manager.setBundleEnabled(connector.package, true);
              result = Object.assign({}, result, {
                application: selected && selected.application ? selected.application : 'applied',
                error: selected && selected.application === 'failed' ? selected.error : undefined,
                version: result.version
              });
            } catch (error) {
              /* Keep the manager's original answer when the follow-up throws. */
            }
          }
          const report = installReport(result);
          json(res, 200, Object.assign({ package: connector.package, key: connector.key, enabled: true }, report));
        } catch (error) {
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
      }
    });

    ctx.effect(function () {
      return function () {
        if (typeof stateDispose === 'function') stateDispose();
        if (typeof installDispose === 'function') installDispose();
      };
    }, 'dsh-credit-radar: connector state and install routes');
  });
}