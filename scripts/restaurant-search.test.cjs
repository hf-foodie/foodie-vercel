const {test}=require('node:test')
const assert=require('node:assert/strict')
const {matchesRestaurant}=require('../src/lib/restaurantSearch.ts')
const {restaurantListHref,restaurantReviewsHref,restaurantReturnHref}=require('../src/lib/restaurantNavigation.ts')
const {searchQuery}=require('../src/lib/searchNavigation.ts')
const rows=[
 {name:'우동키노야 BIFC2스퀘어가든점',address:'부산 남구 남동천로 128 2층 241호',representativeMenuNames:['덴뿌라 붓카케우동','토리텐 붓카케우동','니꾸 카케우동'],nearOfficeNames:['본사']},
 {name:'1953형제돼지국밥 비아이에프씨문현점',address:'부산 남구 남동천로 128 2층 233호',representativeMenuNames:['맑은 돼지국밥','뽀얀 돼지국밥','불꽃 돼지국밥'],nearOfficeNames:['본사']},
]
test('both new restaurants match names and representative menus without needing a review',()=>{
 for(const row of rows)for(const q of [row.name,...row.representativeMenuNames])assert.ok(matchesRestaurant(row,q,'본사'))
 assert.ok(matchesRestaurant(rows[0],'BIFC2 스퀘어 가든'))
 assert.ok(matchesRestaurant(rows[1],'맑은돼지국밥'))
 assert.equal(rows.filter(r=>matchesRestaurant(r,'남동천로 128','본사')).length,2)
 assert.equal(rows.filter(r=>matchesRestaurant(r,'','서울중부지사')).length,0)
 assert.equal(rows.filter(r=>matchesRestaurant(r,'없는메뉴','본사')).length,0)
})
test('office and independent restaurant pagination survive review-detail round trip',()=>{
 for(const path of ['/search','/restaurant/hf']){
  const list=restaurantListHref(path,new URLSearchParams('q=우동&s=우동&office=본사&page=2&restaurantPage=3'))
  const reviews=new URL(restaurantReviewsHref(424,list),'http://localhost')
  reviews.searchParams.set('page','4')
  const detail=new URL('/posts/1'+searchQuery(reviews.searchParams),'http://localhost')
  assert.equal(restaurantReturnHref(detail.searchParams.get('restaurantReturn')),list)
  assert.equal(new URL(list,'http://localhost').searchParams.get('office'),'본사')
  if(path==='/search')assert.equal(new URL(list,'http://localhost').searchParams.get('restaurantPage'),'3')
 }
})
