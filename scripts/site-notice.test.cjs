const test = require('node:test'), assert = require('node:assert/strict')
const { isNoticeHidden, NOTICE_DAY } = require('../src/lib/site-notice.ts')
test('notice suppression expires at 24 hours and rejects invalid or excessive values', () => {
  const now = 1800000000000
  assert.equal(isNoticeHidden(String(now + NOTICE_DAY), now), true)
  assert.equal(isNoticeHidden(String(now + NOTICE_DAY), now + NOTICE_DAY - 1), true)
  assert.equal(isNoticeHidden(String(now + NOTICE_DAY), now + NOTICE_DAY), false)
  for (const value of [null, '', 'broken', 'Infinity', '-1', String(now + NOTICE_DAY + 1)]) assert.equal(isNoticeHidden(value, now), false)
})
