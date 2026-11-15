const {test}=require('node:test');const assert=require('node:assert/strict');
const {searchListHref,searchQuery}=require('../src/lib/searchNavigation.ts');
const {restaurantReviewsHref,restaurantReturnHref}=require('../src/lib/restaurantNavigation.ts');
test('blog review navigation preserves query and page while restaurant origin stays independent',()=>{
 const p=new URLSearchParams({s:'국밥',region:'부산',address:'남구',tag:'#점심, #혼밥',page:'3'});
 assert.equal(searchListHref(p),'/records'+searchQuery(p));
 const href=new URL(restaurantReviewsHref(5,'/search?s=국밥&restaurantPage=2'),'http://localhost');
 assert.equal(href.pathname,'/records');assert.equal(restaurantReturnHref(href.searchParams.get('restaurantReturn')),'/search?s=%EA%B5%AD%EB%B0%A5&restaurantPage=2');
});

test('navigation places blogs beside restaurant exploration for every role',async()=>{
 const {getNavigation}=require('../src/data/navigation.ts');
 for(const role of [null,'USER','MANAGER','ADMIN']){const items=await getNavigation(role);const index=items.findIndex(x=>x.href==='/search');assert.equal(items[index+1].href,'/records')}
});
