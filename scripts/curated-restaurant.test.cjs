const {test}=require('node:test')
const assert=require('node:assert/strict')
const {attachLinkedRestaurants,curatedRestaurantDisplay}=require('../src/lib/curatedRestaurant.ts')

test('linked ID selects current identity without changing recommendation originals',()=>{
 const items=[{restaurantId:2,title:'네기 라이브',address:'옛 주소'},{restaurantId:3,title:'미연결 후보'},{restaurantId:null,title:'미연결'}]
 const result=attachLinkedRestaurants(items,[{restaurantId:1,name:'네기 라이브',address:'동명 다른 식당'},{restaurantId:2,name:'코레츠 라이브',address:'현재 주소'}])
 assert.deepEqual(curatedRestaurantDisplay(result[0].title,result[0].address,result[0].linkedRestaurant),{name:'코레츠 라이브',address:'현재 주소',previousName:'네기 라이브'})
 assert.equal(result[0].title,items[0].title)
 assert.equal(items[0].linkedRestaurant,undefined)
 assert.equal(result[1].linkedRestaurant,undefined)
 assert.equal(result[2].linkedRestaurant,undefined)
})
test('unlinked records retain originals; spacing alone does not claim a name change',()=>{
 assert.deepEqual(curatedRestaurantDisplay('파브리 키친','원본',{name:'파브리키친',address:'도산'}),{name:'파브리키친',address:'도산',previousName:undefined})
 assert.deepEqual(curatedRestaurantDisplay('네오','송파'),{name:'네오',address:'송파',previousName:undefined})
})
