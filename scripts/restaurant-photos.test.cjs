const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { restaurantPhotos, unverifiedRestaurantPhotos } = require('../src/data/restaurantPhotos.ts');

const auditedIds = [366,367,368,369,370,371,372,373,374,375,377,378,379,380,381,382,383,384,385,386,387,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,415,416,418,419,420,422,423];
test('all 53 historical recommendation photos are replaced or explicitly withheld', () => {
  assert.equal(auditedIds.length,53);
  for (const id of auditedIds) {
    assert.notEqual(Boolean(restaurantPhotos[id]),Boolean(unverifiedRestaurantPhotos[id]),String(id));
    if (restaurantPhotos[id]) {
      assert.match(restaurantPhotos[id].src,new RegExp('/'+id+'-(?:verified|naver)-20261115\\.'));
      assert.match(restaurantPhotos[id].sourceUrl,/^https:\/\//);
    }
  }
  assert.deepEqual(Object.keys(unverifiedRestaurantPhotos).map(Number),[]);
});
test('photo registry references existing image bytes and keeps Sobajuu separate from Solbam', () => {
  for(const [id,photo] of Object.entries(restaurantPhotos)) {
    const bytes=fs.readFileSync(path.join(__dirname,'../public',photo.src));
    assert.ok(bytes.length>1000,id+' must have image content');
  }
  assert.match(restaurantPhotos[414].alt,/소바쥬/);
  assert.match(restaurantPhotos[415].alt,/솔밤/);
  assert.notEqual(restaurantPhotos[414].sourceUrl,restaurantPhotos[415].sourceUrl);
});
