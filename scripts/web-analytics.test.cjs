const { test } = require('node:test')
const assert = require('node:assert/strict')
const { sanitizePageView, isAnalyticsEnabled } = require('../src/lib/webAnalytics.ts')

test('page views retain page identity without query, fragment or credentials', () => {
  const event = { type: 'pageview', url: 'https://user:secret@example.com/search?q=nickname&office=head#results' }
  assert.deepEqual(sanitizePageView(event), { type: 'pageview', url: 'https://example.com/search' })
  assert.ok(event.url.includes('secret'), 'input must not be mutated')
  assert.equal(sanitizePageView({ type: 'pageview', url: 'https://example.com/posts/42?return=private' }).url, 'https://example.com/posts/42')
})
test('custom events and malformed page URLs are not sent', () => {
  assert.equal(sanitizePageView({ type: 'event', url: 'https://example.com/search' }), null)
  for (const url of ['invalid', 'javascript:alert(1)', 'file:///local']) {
    assert.equal(sanitizePageView({ type: 'pageview', url }), null)
  }
})
test('only Vercel production deployments collect analytics', () => {
  for (const environment of [undefined, '', 'development', 'preview']) assert.equal(isAnalyticsEnabled(environment), false)
  assert.equal(isAnalyticsEnabled('production'), true)
})
