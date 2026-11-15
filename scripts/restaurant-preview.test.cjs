const {test}=require('node:test')
const assert=require('node:assert/strict')
const fs=require('node:fs')
const data=require('../src/data/preview-snapshot.json')
test('requested restaurants retain branch details and local image assets',()=>{
  for(const [id,name,phone] of [[446,'윤우재 문현샤브 칼국수','0507-1492-0230'],[447,'부산에뜬고등어 문현점','051-633-0789']]){
    const matches=data.restaurants.filter(x=>x.restaurantId===id)
    assert.equal(matches.length,1)
    assert.equal(matches[0].name,name)
    assert.equal(matches[0].phoneNumber,phone)
    assert.ok(fs.statSync(`public/images/restaurant/thumbnail/${id}-provided-20261116.png`).size>10000)
  }
})
test('all newly exposed registration and edit routes remain preview notices',()=>{
  for(const route of ['restaurant/new','restaurant/manage','restaurant/moderation','post/new','post/edit']){
    assert.match(fs.readFileSync(`src/app/(app)/${route}/page.tsx`,'utf8'),/export\s*\{\s*default\s*\}\s*from\s*['"]@\/components\/PreviewUnavailable/)
  }
})
