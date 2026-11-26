/* Exercises the settings-backup helpers in client.js.

   The helpers live inside the plugin factory's closure, so they cannot be
   imported. Rather than duplicate them here (which would test a copy that can
   drift), this pulls their exact source text out of client.js and evaluates it
   with the same sibling helpers they close over. A rename or a changed
   signature breaks the extraction, which is the point: the test fails when the
   code it claims to cover stops existing. */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, 'client.js'), 'utf8');

/* --- pull declarations out of the source ------------------------------- */

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

/* Scan from a declaration to its end, skipping braces inside strings,
   template literals and comments. */
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
    /* Only braces nest the declaration. A parameter list or an array
       initialiser ends in its own bracket, and counting those would cut a
       function off at its closing parenthesis. */
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
      /* A const or let whose initialiser has no brackets at all, such as
         `const AUTO_DEFAULT_MS = 30 * 1000;`: without this the scan would run
         on into the next declaration and emit it twice. */
      return source.slice(start, index + 1);
    }
    index += 1;
  }
  throw new Error('unterminated declaration: ' + name);
}

const NEEDED = [
  'AUTO_DEFAULT_MS', 'AUTO_OPTIONS', 'AUTO_RETIRED',
  'pad2', 'dateFromString', 'asNumber', 'uid', 'cleanLots', 'normalizeEntry', 'normalizeInterval',
  'BACKUP_KIND', 'BACKUP_VERSION', 'backupStamp', 'buildBackup', 'downloadBackup',
  'parseBackup', 'identOf', 'mergeBackup', 'backupErrorKey'
];

const body = NEEDED.map(declarationText).join('\n\n');

/* --- evaluate it with DOM stubs ---------------------------------------- */

const downloads = [];
const sandbox = {
  console,
  Date,
  Math,
  Number,
  String,
  Array,
  Object,
  Map,
  Set,
  JSON,
  Intl,
  Blob: class Blob {
    constructor(parts, options) {
      this.parts = parts;
      this.type = options && options.type;
    }
  },
  URL: {
    createObjectURL: (blob) => {
      downloads.push(blob);
      return 'blob:stub/' + downloads.length;
    },
    revokeObjectURL: () => {}
  },
  window: { setTimeout: (fn) => { void fn; return 0; } },
  document: {
    body: { appendChild: () => {} },
    createElement: () => makeLink()
  }
};

function makeLink() {
  const node = {
    href: '',
    download: '',
    rel: '',
    clicked: false,
    click() { node.clicked = true; },
    remove() {}
  };
  return node;
}

const context = vm.createContext(sandbox);
vm.runInContext(
  body + '\n;globalThis.__api = { ' + NEEDED.join(', ') + ' };',
  context,
  { filename: 'client-backup-helpers.js' }
);
const api = sandbox.__api;

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

const sample = [
  { id: 'a', service: 'Trae', account: 'me', credits: 100, total: 200, expiresAt: '2026-12-01', lots: [], note: '', sourceKey: 'trae:1', createdAt: 1, updatedAt: 10 },
  { id: 'b', service: 'Qoder', account: '', credits: 5, total: null, expiresAt: '2026-11-30', lots: [], note: 'n', sourceKey: null, createdAt: 2, updatedAt: 20 }
];


check('buildBackup marks the document and keeps every record', () => {
  const doc = api.buildBackup({ entries: sample, lastSyncedAt: 123 }, { enabled: false, intervalMs: 60000 });
  assert.equal(doc.kind, api.BACKUP_KIND);
  assert.equal(doc.version, api.BACKUP_VERSION);
  assert.equal(doc.entries.length, 2);
  assert.equal(doc.lastSyncedAt, 123);
  /* The helpers run in a vm realm, so their objects have that realm's
     prototype: compare the fields rather than the prototype chain. */
  assert.equal(doc.auto.enabled, false);
  assert.equal(doc.auto.intervalMs, 60000);
  assert.ok(typeof doc.exportedAt === 'string' && doc.exportedAt.length > 10);
});

check('buildBackup repairs an entry that lost a field', () => {
  const doc = api.buildBackup({ entries: [{ service: 'Trae' }], lastSyncedAt: null }, null);
  assert.equal(doc.entries.length, 1);
  assert.equal(doc.entries[0].service, 'Trae');
  assert.ok(typeof doc.entries[0].id === 'string' && doc.entries[0].id.length > 0);
});

check('downloadBackup writes a JSON blob and clicks the link', () => {
  const made = [];
  sandbox.document.createElement = () => {
    const node = makeLink();
    made.push(node);
    return node;
  };
  const out = api.downloadBackup({ entries: sample, lastSyncedAt: null }, { enabled: true, intervalMs: 30000 });
  assert.equal(out.entries, 2);
  assert.equal(downloads.length, 1);
  assert.equal(downloads[0].type, 'application/json');
  const parsed = JSON.parse(downloads[0].parts[0]);
  assert.equal(parsed.kind, api.BACKUP_KIND);
  assert.equal(made.length, 1);
  assert.equal(made[0].clicked, true, 'the download link was never clicked');
  assert.match(made[0].download, /^dsh-connect-hub-\d{8}-\d{4}\.json$/);
});

check('backupStamp is a sortable local timestamp', () => {
  assert.equal(api.backupStamp(new Date(2026, 10, 26, 9, 5)), '20261126-0905');
});

check('parseBackup round-trips an exported document', () => {
  const doc = api.buildBackup({ entries: sample, lastSyncedAt: 77 }, { enabled: true, intervalMs: 5000 });
  const back = api.parseBackup(JSON.stringify(doc));
  assert.equal(back.ok, true);
  assert.equal(back.entries.length, 2);
  assert.equal(back.lastSyncedAt, 77);
  assert.equal(back.auto.enabled, true);
  assert.equal(back.auto.intervalMs, 5000);
  assert.equal(back.dropped, 0);
});

check('parseBackup accepts a bare array of records', () => {
  const back = api.parseBackup(JSON.stringify([{ service: 'Trae', credits: 1 }]));
  assert.equal(back.ok, true);
  assert.equal(back.entries.length, 1);
  assert.equal(back.auto, null);
});

check('parseBackup rejects what it cannot read, with a code', () => {
  assert.equal(api.parseBackup('{oops').code, 'invalid-json');
  assert.equal(api.parseBackup('"just a string"').code, 'invalid-json');
  assert.equal(api.parseBackup('{"kind":"other","entries":[]}').code, 'wrong-kind');
  assert.equal(api.parseBackup('{"kind":"' + api.BACKUP_KIND + '","version":99,"entries":[]}').code, 'too-new');
  assert.equal(api.parseBackup('{"kind":"' + api.BACKUP_KIND + '","entries":[]}').code, 'empty');
  assert.equal(api.parseBackup('{"kind":"' + api.BACKUP_KIND + '","entries":[{"credits":1}]}').code, 'no-valid-entries');
  assert.equal(api.parseBackup('{"entries":"nope"}').code, 'invalid-json');
});

check('backupErrorKey names every failure and defaults to invalid', () => {
  assert.equal(api.backupErrorKey('wrong-kind'), 'importWrongKind');
  assert.equal(api.backupErrorKey('too-new'), 'importTooNew');
  assert.equal(api.backupErrorKey('empty'), 'importEmpty');
  assert.equal(api.backupErrorKey('no-valid-entries'), 'importNoValid');
  assert.equal(api.backupErrorKey('invalid-json'), 'importInvalid');
  assert.equal(api.backupErrorKey('anything-else'), 'importInvalid');
});


check('mergeBackup appends an unknown account with a fresh id', () => {
  const out = api.mergeBackup([], [{ service: 'Trae', account: 'me', credits: 1, sourceKey: 'trae:9' }], 500);
  assert.equal(out.entries.length, 1);
  assert.equal(out.added, 1);
  assert.equal(out.updated, 0);
  assert.equal(out.entries[0].createdAt, 500);
  assert.ok(typeof out.entries[0].id === 'string' && out.entries[0].id.length > 0);
});

check('mergeBackup matches on source key instead of adding a duplicate', () => {
  const out = api.mergeBackup(sample, [{ service: 'Trae', account: 'me', credits: 42, sourceKey: 'trae:1', updatedAt: 999 }], 999);
  assert.equal(out.entries.length, 2);
  assert.equal(out.added, 0);
  assert.equal(out.updated, 1);
  assert.equal(out.entries[0].credits, 42);
  assert.equal(out.entries[0].id, 'a', 'the existing id was replaced');
});

check('mergeBackup falls back to service plus account', () => {
  const out = api.mergeBackup(sample, [{ service: 'qoder', account: '  ', credits: 9, updatedAt: 999 }], 999);
  assert.equal(out.entries.length, 2, 'a hand-written record became a second card');
  assert.equal(out.updated, 1);
  assert.equal(out.entries[1].credits, 9);
  assert.equal(out.entries[1].id, 'b');
});

check('mergeBackup keeps the newer copy when the file is stale', () => {
  const out = api.mergeBackup(sample, [{ service: 'Trae', account: 'me', credits: 1, sourceKey: 'trae:1', updatedAt: 5 }], 999);
  assert.equal(out.entries[0].credits, 100, 'a stale import overwrote a fresh balance');
  assert.equal(out.updated, 0);
});

check('mergeBackup fills blanks without erasing filled fields', () => {
  const out = api.mergeBackup(sample, [{ service: 'Trae', account: '', plan: 'Pro', note: '', credits: null, sourceKey: 'trae:1', updatedAt: 999 }], 999);
  const row = out.entries[0];
  assert.equal(row.account, 'me', 'an empty account erased the stored one');
  assert.equal(row.plan, 'Pro');
  assert.equal(row.credits, 100, 'a null balance erased the stored one');
  assert.equal(row.expiresAt, '2026-12-01');
});

check('mergeBackup keeps lots when the file carries none', () => {
  const withLots = [{ id: 'c', service: 'Trae', account: 'me', credits: 10, lots: [{ credits: 10, expiresAt: '2026-12-02' }], sourceKey: 'trae:1', updatedAt: 1 }];
  const out = api.mergeBackup(withLots, [{ service: 'Trae', account: 'me', credits: 10, lots: [], sourceKey: 'trae:1', updatedAt: 2 }], 2);
  assert.equal(out.entries[0].lots.length, 1);
});

check('identOf ignores case and surrounding space', () => {
  assert.equal(api.identOf({ service: ' Trae ', account: 'ME' }), api.identOf({ service: 'trae', account: 'me' }));
  assert.notEqual(api.identOf({ service: 'Trae', account: 'me' }), api.identOf({ service: 'Trae', account: 'you' }));
});

console.log(results.join('\n'));
if (process.exitCode) {
  console.error('\n\u2717 settings backup helpers failed');
} else {
  console.log('\n\u2713 settings backup helpers (' + results.length + ' checks)');
}

