const {test}=require('node:test');const assert=require('node:assert/strict');
const {newBingo,readBingo,toggleMission,bingoLines,missions,missionRestaurants,restaurantRegion}=require('../src/lib/foodBingo.ts');
const {readBingoView}=require('../src/lib/foodBingo.ts');
test('bingo URL state validates missions, page numbers and region independently of completion',()=>{
  assert.deepEqual(readBingoView(new URLSearchParams('mission=region&page=3&region=부산')),{mission:'region',page:2,region:'부산'});
  for(const page of ['0','-2','NaN','1.5','Infinity','9007199254740992']) assert.equal(readBingoView(new URLSearchParams({page})).page,0);
  assert.deepEqual(readBingoView(new URLSearchParams('mission=unknown&page=2&region=invalid')),{mission:'first',page:1,region:''});
  assert.equal(readBingoView(new URLSearchParams()).region,null);
});
test('bingo persists a unique nine-cell board and toggles without duplicate completion',()=>{let b=newBingo(()=>.5);assert.equal(new Set(b.order).size,9);b=toggleMission(b,b.order[0]);assert.equal(b.checked.length,1);assert.deepEqual(readBingo(JSON.stringify(b)),b);assert.equal(toggleMission(b,b.order[0]).checked.length,0);assert.equal(bingoLines(b),0)});
test('rows columns and diagonals count once and cancel reverses achievements',()=>{let b={...newBingo(),order:missions.map(m=>m.id)};for(const i of [0,1,2])b=toggleMission(b,b.order[i]);assert.equal(bingoLines(b),1);b={...b,checked:[...b.order]};assert.equal(bingoLines(b),8);b=toggleMission(b,b.order[4]);assert.equal(bingoLines(b),4)});
test('invalid storage cannot create fake cells or awards',()=>{for(const s of ['bad','null','{}',JSON.stringify({...newBingo(),checked:['unknown']}),JSON.stringify({...newBingo(),order:Array(9).fill('first')}),JSON.stringify({...newBingo(),version:2})])assert.equal(readBingo(s),null)});
test('mission restaurants use menu and category facts and retain exact IDs',()=>{const rows=[{restaurantId:1,name:'국밥 상호',address:'서울특별시 중구',category:'중식',isSolo:false,representativeMenuNames:['짜장면']},{restaurantId:44,name:'다른 이름',address:'부산 남구',category:'한식',isSolo:true,representativeMenuNames:['돼지 국밥']}];assert.deepEqual(missionRestaurants(rows,'soup','').map(r=>r.restaurantId),[44]);assert.deepEqual(missionRestaurants(rows,'solo','').map(r=>r.restaurantId),[44]);assert.equal(restaurantRegion('부산광역시 남구'),'부산');assert.equal(missionRestaurants(rows,'region','').length,0);assert.deepEqual(missionRestaurants(rows,'region','부산').map(r=>r.restaurantId),[1]);assert.equal(missionRestaurants(rows,'first','').length,2)});
test('unrecognized addresses never become selectable provinces',()=>{for(const a of ['125 Example','Shop 4','부산진구 전포동','기',''])assert.equal(restaurantRegion(a),'')});
