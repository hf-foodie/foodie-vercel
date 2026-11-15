const {test}=require('node:test'),assert=require('node:assert/strict')
const {getNavigation}=require('../src/data/navigation.ts')
test('management menu is absent for anonymous and members; statistics is admin only',async()=>{
 for(const role of [undefined,null,'USER','ROLE_USER'])assert.equal((await getNavigation(role)).some(x=>x.id==='3'),false)
 for(const role of ['MANAGER','ADMIN']){
  const menu=(await getNavigation(role)).find(x=>x.id==='3');assert.ok(menu)
  assert.equal(menu.children.some(x=>x.href==='/admin/analytics'),role==='ADMIN')
 }
})
