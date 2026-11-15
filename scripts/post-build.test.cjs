const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('deployment copies application assets but excludes TLS and runtime database files', () => {
  const build = path.resolve(__dirname, '../build');
  fs.mkdirSync(build, { recursive: true });
  const fixture = fs.mkdtempSync(path.join(build, 'packaging-test-'));
  const write = (name, content = 'test fixture only') => {
    const file = path.join(fixture, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  };
  write('server.js', "const nextConfig = JSON.parse(process.env.__NEXT_PRIVATE_STANDALONE_CONFIG || '{}');");
  write('.next/standalone/server.js', 'const nextConfig = {}\n');
  write('.next/standalone/certs/private.key');
  write('.next/standalone/copied.key');
  write('.next/standalone/h2/foodie.mv.db');
  write('.next/standalone/certs.zip');
  write('.next/static/app.js');
  write('public/image.png');
  write('public/accidental.pfx');
  write('certs/private.key');
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'post-build.js'), 'utf8'), {
    require, __dirname: path.join(fixture, 'scripts'), console,
    process: { exit: code => { throw new Error('packaging exited: ' + code); } },
  });
  for (const name of ['server.js', '.next/static/app.js', 'public/image.png'])
    assert.ok(fs.existsSync(path.join(fixture, 'dist', name)), name);
  for (const name of ['certs', 'h2', 'copied.key', 'certs.zip', 'public/accidental.pfx'])
    assert.equal(fs.existsSync(path.join(fixture, 'dist', name)), false, name);
});
