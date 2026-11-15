const { test } = require('node:test')
const assert = require('node:assert/strict')
const { latestRestaurants } = require('../src/lib/latestRestaurants.ts')
test('new registrations precede edited old restaurants; ties are stable and input is preserved', () => {
  const rows = [
    { restaurantId: 1, createdAt: '2020-01-01', updatedAt: '2030-01-01' },
    { restaurantId: 2, createdAt: '2026-11-15' },
    { restaurantId: 3, createdAt: '2026-11-15' },
    { restaurantId: 4, createdAt: 'invalid' },
  ]
  assert.deepEqual(latestRestaurants(rows, 2).map(r => r.restaurantId), [3, 2])
  assert.deepEqual(rows.map(r => r.restaurantId), [1, 2, 3, 4])
  assert.deepEqual(latestRestaurants([]), [])
})
