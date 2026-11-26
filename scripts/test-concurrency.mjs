/* Exercises the per-connector concurrency rule in client.js.

   The panel used to track a single in-flight key, which greyed out every other
   card while one install ran. That is a UI rule, not a Host rule: the Host
   serializes profile writes on its own file lock, so two different connectors
   can be requested at once. These checks pin the rule down by reading the
   source text, because the state lives inside the plugin factory's closure and
   cannot be imported. */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, 'client.js'), 'utf8');

const results = [];
function check(name, run) {
  try {
    run();
    results.push('  \u2713 ' + name);
  } catch (error) {
    results.push('  \u2717 ' + name + '\n      ' + error.message);
    process.exitCode = 1;
  }
}
function ok(value, message) {
  if (!value) throw new Error(message);
}

/* The install state must be a collection keyed per connector, not one scalar. */
check('the busy state is a set, so several keys can be in flight', () => {
  ok(/const \[installing, setInstalling\] = React\.useState\(function \(\) \{ return new Set\(\); \}\)/
    .test(source), 'installing is not a Set state');
});

check('a second click on the same card is ignored, a different card is not', () => {
  ok(source.includes('if (busyKeys.current.has(key)) return;'),
    'no per-key re-entry guard');
  ok(!source.includes('if (installing !== null) return;'),
    'the old global guard is still present');
});

check('the guard is a ref, so it sees a click before React re-renders', () => {
  ok(source.includes('const busyKeys = React.useRef(new Set());'),
    'busyKeys is not a ref');
});

check('a card goes busy only for its own key', () => {
  ok(source.includes('busy: installing.has(item.key),'),
    'the card is not bound to its own key');
  ok(!source.includes('busyKey: installing,'),
    'a card still receives the whole busy state');
});

check('no button is disabled by another card\u2019s change', () => {
  const disabled = source.match(/disabled: [^,\n]+/g) || [];
  const offending = disabled.filter((line) => /anyBusy/.test(line));
  ok(offending.length === 0, 'a button is still disabled by anyBusy: ' + offending.join(', '));
});

check('the per-key guard is released even when the request throws', () => {
  ok(/try \{\s*result = await request\(\);\s*\} finally \{/.test(source),
    'the guard is not released in a finally block');
  ok(source.includes('busyKeys.current.delete(key);'), 'the key is never removed');
});

check('a change publishes the new Host state to every mounted surface', () => {
  ok(source.includes('const subscribers = new Set();'), 'no subscriber set');
  ok(source.includes('subscribers.add(setState);'), 'the hook never subscribes');
  ok(source.includes('subscribers.delete(setState);'), 'the hook never unsubscribes');
  ok(source.includes('publishSourceState(await loadSourceState());'),
    'a change does not publish the re-read state');
});

check('the published state replaces the cached snapshot', () => {
  const publish = source.indexOf('publishSourceState(await loadSourceState());');
  ok(publish !== -1, 'no publish call');
  const before = source.slice(0, publish);
  ok(before.lastIndexOf('sourceStateAt = 0;') > before.lastIndexOf('async function applyChange'),
    'the cache is not invalidated before the re-read');
});

console.log('\n\u2713 connector concurrency (' + results.filter((r) => r.indexOf('\u2713') !== -1).length +
  ' checks)\n' + results.join('\n') + '\n');
