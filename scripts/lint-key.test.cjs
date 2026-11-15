const { test } = require('node:test')
const assert = require('node:assert/strict')
const { normalizeLintKey } = require('./lint-key.cjs')
const key = (root, message = 'Existing error', source = 'setValue(1)') =>
  JSON.stringify(['src/page.tsx', 'react-hooks/set-state-in-effect', `${message}\n\n${root}:12:4\n> 12 | ${source}`, source])

test('lint diagnostics match across local Windows, CI Windows and POSIX checkouts', () => {
  const expected = normalizeLintKey(key('C:\\Users\\developer\\front\\src\\page.tsx'))
  assert.equal(normalizeLintKey(key('D:\\a\\front\\front\\src\\page.tsx')), expected)
  assert.equal(normalizeLintKey(key('/home/runner/front/src/page.tsx')), expected)
  assert.equal(normalizeLintKey(expected), expected)
})

test('portable lint keys still distinguish new diagnostics and affected source', () => {
  const existing = normalizeLintKey(key('/repo/src/page.tsx'))
  assert.notEqual(normalizeLintKey(key('/repo/src/page.tsx', 'New error')), existing)
  assert.notEqual(normalizeLintKey(key('/repo/src/page.tsx', 'Existing error', 'setValue(2)')), existing)
})
