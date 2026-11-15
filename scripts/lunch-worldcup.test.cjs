const { test } = require('node:test')
const assert = require('node:assert/strict')
const {menuCandidates,startCup,chooseMenu,matchKey,menuReviewsHref}=require('../src/lib/lunchWorldcup.ts')
const rows=[{restaurantId:44,name:'이름이 달라도',address:'부산',representativeMenuNames:['돼지 국밥'],nearOfficeNames:['본사']},{restaurantId:52,name:'국밥이라는 상호',address:'서울',representativeMenuNames:['짜장면'],nearOfficeNames:['서울지사']}]
test('menu matches representative menu only; office filter and original restaurant IDs survive',()=>{
 const candidates=menuCandidates(rows)
 assert.deepEqual(candidates.find(x=>x.id==='gukbap').restaurants.map(r=>r.restaurantId),[44])
 assert.deepEqual(menuCandidates(rows,'서울지사').map(x=>x.id),['jjajang'])
 assert.equal(new URL(menuReviewsHref(44),'http://localhost').searchParams.get('restaurantId'),'44')
 assert.equal(menuCandidates([]).length,0)
})
for(const size of [8,16])test(`${size} teams produce a single winner in ${size-1} decisions without repeats`,()=>{
 const candidates=Array.from({length:20},(_,i)=>({id:String(i),name:String(i),icon:'',restaurants:rows}))
 let cup=startCup(candidates,size,()=>0.5)
 assert.equal(new Set(cup.round.map(x=>x.id)).size,size)
 for(let i=0;i<size-1;i++){
  const key=matchKey(cup),id=cup.round[cup.winners.length*2].id
  const next=chooseMenu(cup,id,key)
  assert.equal(chooseMenu(next,id,key),next,'stale double click is ignored')
  cup=next
 }
 assert.ok(cup.champion);assert.equal(cup.completed,size-1)
 assert.equal(chooseMenu(cup,cup.champion.id,matchKey(cup)),cup)
 assert.equal(candidates.length,20)
})
test('insufficient candidates and invalid selections cannot corrupt bracket',()=>{
 assert.throws(()=>startCup([],8));assert.throws(()=>startCup([],16))
 const candidates=Array.from({length:8},(_,i)=>({id:String(i),name:String(i),icon:'',restaurants:rows}))
 const cup=startCup(candidates,8)
 assert.equal(chooseMenu(cup,'invalid',matchKey(cup)),cup)
 assert.throws(()=>startCup([...candidates,...candidates],16))
})
