/* Loads client.js the way the host does — registering the module, then running
   its factory — and reports whether it comes up.
   
   `node --check` is not enough here. client.js keeps its stylesheet in a
   template literal, so a stray backtick inside a CSS comment closes the literal
   early. That still parses as JavaScript (`` `text`.cr - card - foot`...` `` is
   a valid expression), so the syntax check passes while the module throws
   `ReferenceError: card is not defined` the moment the host loads it — and the
   plugin's sidebar entry never appears. */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = readFileSync(join(root, 'client.js'), 'utf8');

/* Stand-in for React and every other import: callable, constructable, and
   answers any property access with itself, so the factory's top-level
   constants build without a real renderer. */
const stub = new Proxy(function () {}, {
  get: (_target, key) => (key === 'then' ? undefined : stub),
  apply: () => stub,
  construct: () => stub
});

let registered = null;
const context = vm.createContext({
  window: { __ModuleLoader__: { load: (module) => { registered = module; } } },
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  document: { createElement: () => stub },
  require: () => stub
});

vm.runInContext(source, context, { filename: 'client.js' });

if (!registered) {
  console.error('✗ client.js did not register with __ModuleLoader__');
  process.exit(1);
}

let module;
try {
  module = registered.factory(() => stub);
} catch (error) {
  console.error(`✗ factory threw: ${error.name}: ${error.message}`);
  process.exit(1);
}

if (!module || typeof module.apply !== 'function' || module.name !== registered.id) {
  console.error('✗ factory returned an unusable module:', module);
  process.exit(1);
}

console.log(`✓ ${registered.id} loads (name=${module.name}, inject=${module.inject.join(', ')})`);
