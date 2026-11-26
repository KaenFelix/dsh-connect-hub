/* Exercises the brand-tile helpers in client.js.

   These live inside the plugin factory's closure, so they cannot be imported.
   This pulls their exact source text out of client.js and evaluates it, so a
   rename or a changed signature breaks the extraction instead of silently
   testing a stale copy. */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, 'client.js'), 'utf8');

const INDENT = '    ';

function findDeclaration(name) {
  const starts = [
    INDENT + 'function ' + name + '(',
    INDENT + 'const ' + name + ' = ',
    INDENT + 'let ' + name + ' = '
  ];
  for (const start of starts) {
    const at = source.indexOf('\n' + start);
    if (at !== -1) return at + 1;
  }
  throw new Error('declaration not found in client.js: ' + name);
}

function declarationText(name) {
  const start = findDeclaration(name);
  let depth = 0;
  let index = start;
  let seenBody = false;
  while (index < source.length) {
    const ch = source[index];
    const next = source[index + 1];
    if (ch === '/' && next === '/') {
      index = source.indexOf('\n', index);
      if (index === -1) break;
      continue;
    }
    if (ch === '/' && next === '*') {
      const close = source.indexOf('*/', index + 2);
      index = close === -1 ? source.length : close + 2;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '\u0060') {
      const quote = ch;
      index += 1;
      while (index < source.length) {
        if (source[index] === '\\') { index += 2; continue; }
        if (source[index] === quote) break;
        index += 1;
      }
      index += 1;
      continue;
    }
    if (ch === '{') {
      depth += 1;
      seenBody = true;
    } else if (ch === '}') {
      depth -= 1;
      if (depth === 0 && seenBody) {
        let end = index + 1;
        if (source[end] === ';') end += 1;
        return source.slice(start, end);
      }
    } else if (ch === ';' && depth === 0) {
      return source.slice(start, index + 1);
    }
    index += 1;
  }
  throw new Error('unterminated declaration: ' + name);
}

const NEEDED = [
  'BRAND_ASSETS', 'BRAND_RETRIES', 'BRAND_RETRY_DELAYS',
  'brandAssetUrl', 'brandKeyOf', 'initials'
];

const body = NEEDED.map(declarationText).join('\n\n');

/* --- evaluate it ------------------------------------------------------- */

function makeSandbox(withAssetResolver) {
  const sandbox = { String, Object, Array, Number };
  /* The factory's `require` carries the Host's asset resolver. */
  sandbox.require = withAssetResolver
    ? { asset: (reference) => '/resolved/' + reference }
    : {};
  const context = vm.createContext(sandbox);
  vm.runInContext(
    body + '\n;globalThis.__api = { ' + NEEDED.join(', ') + ' };',
    context,
    { filename: 'client-brand-helpers.js' }
  );
  return sandbox.__api;
}

const plain = makeSandbox(false);
const resolved = makeSandbox(true);

/* --- assertions -------------------------------------------------------- */

const results = [];
function check(name, fn) {
  try {
    fn();
    results.push('  \u2713 ' + name);
  } catch (error) {
    results.push('  \u2717 ' + name + '\n      ' + error.message);
    process.exitCode = 1;
  }
}

function equal(actual, expected) {
  if (actual !== expected) {
    throw new Error('expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
  }
}

const FIRST = plain.brandAssetUrl(plain.BRAND_ASSETS.trae, 0);

check('every mark names a file the package ships', () => {
  for (const key of Object.keys(plain.BRAND_ASSETS)) {
    const file = plain.BRAND_ASSETS[key];
    if (!/^[a-z]+-[0-9a-f]{12}\.png$/.test(file)) {
      throw new Error(key + ' is not a content-revisioned png: ' + file);
    }
  }
});

check('the first attempt is the document-relative reference', () => {
  equal(FIRST, 'plugins/dsh-connect-hub/assets/brand/trae-35d7c9b8eb9b.png');
});

check('the first attempt carries no query', () => {
  if (FIRST.indexOf('?') !== -1) throw new Error('first attempt should be cacheable as-is');
});

check('a retry asks for a different url than the failed one', () => {
  const retried = plain.brandAssetUrl(plain.BRAND_ASSETS.trae, 1);
  if (retried === FIRST) throw new Error('a retry that repeats the url is served from the failed cache entry');
  equal(retried, FIRST + '?retry=1');
});

check('each retry is distinct, so none is answered from a failed cache entry', () => {
  const seen = new Set([FIRST]);
  for (let attempt = 1; attempt <= plain.BRAND_RETRIES; attempt += 1) {
    const url = plain.brandAssetUrl(plain.BRAND_ASSETS.trae, attempt);
    if (seen.has(url)) throw new Error('attempt ' + attempt + ' repeats an earlier url');
    seen.add(url);
  }
});

check('there is a wait for every retry', () => {
  equal(plain.BRAND_RETRY_DELAYS.length, plain.BRAND_RETRIES);
  for (const delay of plain.BRAND_RETRY_DELAYS) {
    if (!Number.isFinite(delay) || delay <= 0) throw new Error('delay must be a positive number');
  }
});

check('the waits grow, so a slow Host gets progressively longer to settle', () => {
  for (let i = 1; i < plain.BRAND_RETRY_DELAYS.length; i += 1) {
    if (plain.BRAND_RETRY_DELAYS[i] <= plain.BRAND_RETRY_DELAYS[i - 1]) {
      throw new Error('delay ' + i + ' does not exceed the one before it');
    }
  }
});

check('the whole retry budget stays under a few seconds', () => {
  const total = plain.BRAND_RETRY_DELAYS.reduce((sum, delay) => sum + delay, 0);
  if (total > 5000) throw new Error('retrying for ' + total + 'ms keeps a broken tile spinning too long');
});

check('a Host asset resolver is used when the Host provides one', () => {
  const viaHost = resolved.brandAssetUrl(resolved.BRAND_ASSETS.qoder, 0);
  equal(viaHost, '/resolved/plugins/dsh-connect-hub/assets/brand/qoder-dcdea0167b20.png');
});

check('a retry keeps the Host resolver and appends the query to its result', () => {
  const viaHost = resolved.brandAssetUrl(resolved.BRAND_ASSETS.qoder, 2);
  equal(viaHost, '/resolved/plugins/dsh-connect-hub/assets/brand/qoder-dcdea0167b20.png?retry=2');
});

check('a Host without an asset resolver still gets the plain reference', () => {
  equal(plain.brandAssetUrl(plain.BRAND_ASSETS.madao, 0),
    'plugins/dsh-connect-hub/assets/brand/madao-76880438ca99.png');
});

check('the source key wins over the service name', () => {
  equal(plain.brandKeyOf('秒悟'), 'meoo');
  equal(plain.brandKeyOf('WorkBuddy Pro'), 'workbuddy');
  equal(plain.brandKeyOf('CodeArts'), 'madao');
  equal(plain.brandKeyOf('Qoder IDE'), 'qoder');
});

check('an unknown platform has no mark, so its tile shows initials', () => {
  equal(plain.brandKeyOf('Something Else'), null);
  equal(plain.initials('Something Else'), 'SE');
});

check('initials stay one tile wide for a single-word name', () => {
  equal(plain.initials('Qoder'), 'QO');
  equal(plain.initials(''), '?');
});

console.log('\n\u2713 brand tile helpers (' + results.filter((r) => r.indexOf('\u2713') !== -1).length + ' checks)\n' + results.join('\n') + '\n');
