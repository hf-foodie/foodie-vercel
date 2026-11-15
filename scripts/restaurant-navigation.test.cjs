const { test } = require('node:test')
const assert = require('node:assert/strict')
const { restaurantListHref, restaurantReturnHref, restaurantReviewsHref } = require('../src/lib/restaurantNavigation.ts')
const { searchQuery } = require('../src/lib/searchNavigation.ts')

test('bingo mission, candidate page and region survive reviews and post detail', () => {
  const list = restaurantListHref('/game/bingo', new URLSearchParams('mission=region&page=3&region=부산'))
  const reviews = new URL(restaurantReviewsHref(44, list), 'http://localhost')
  reviews.searchParams.set('page', '2')
  const post = new URL('/posts/58' + searchQuery(reviews.searchParams), 'http://localhost')
  assert.equal(restaurantReturnHref(post.searchParams.get('restaurantReturn')), list)
  assert.equal(new URL(list, 'http://localhost').searchParams.get('page'), '3')
  assert.equal(restaurantReturnHref('/game/bingo?mission=solo&page=2&redirect=https://example.com'), '/game/bingo?page=2&mission=solo')
  assert.equal(restaurantReturnHref('/game/bingo/other?mission=solo'), null)
})
test('chef and all recommendation collections retain their own filters through post detail', () => {
  for (const path of ['/blackwhite','/influencer/ceo','/influencer/vpresident','/influencer/cc','/influencer/intern']) {
    const source=new URLSearchParams('q=서울&page=2&season[]=1&season[]=2&spoonClass[]=흑수저&time-zone[]=lunch&food-style[]=korean-food')
    const list=restaurantListHref(path,source)
    const reviews=new URL(restaurantReviewsHref(123,list),'http://localhost')
    reviews.searchParams.set('page','3')
    const detail=new URL('/posts/1'+searchQuery(reviews.searchParams),'http://localhost')
    assert.equal(restaurantReturnHref(detail.searchParams.get('restaurantReturn')),list)
    const query=new URL(list,'http://localhost').searchParams
    assert.equal(query.get('page'),'2')
    assert.deepEqual(query.getAll('season[]'),path==='/blackwhite'?['1','2']:[])
    assert.deepEqual(query.getAll('time-zone[]'),path==='/influencer/intern'?['lunch']:[])
  }
  assert.equal(restaurantReturnHref('/influencer/unknown?q=x'),null)
})

test('restaurant return preserves repeated filters and keeps review page separate', () => {
  const source = new URLSearchParams('q=부산&page=2&time-zone[]=lunch&time-zone[]=dinner&food-style[]=korean-food&food-style[]=japanese-food')
  const list = restaurantListHref('/restaurant/hf',source)
  const reviews = new URL(restaurantReviewsHref(245,list),'http://localhost')
  reviews.searchParams.set('page','3')
  const detail = new URL('/posts/58'+searchQuery(reviews.searchParams),'http://localhost')
  const back = restaurantReturnHref(detail.searchParams.get('restaurantReturn'))
  assert.equal(back,list)
  const p = new URL(back,'http://localhost').searchParams
  assert.equal(p.get('page'),'2')
  assert.deepEqual(p.getAll('time-zone[]'),['lunch','dinner'])
  assert.deepEqual(p.getAll('food-style[]'),['korean-food','japanese-food'])
})
test('restaurant return accepts only supported lists and filters', () => {
  assert.equal(restaurantReturnHref('/restaurant/dubai?q=카페&page=3&food-style[]=cafe'),'/restaurant/dubai?q=%EC%B9%B4%ED%8E%98&page=3')
  for(const value of ['//example.com','https://example.com','/restaurant/hf/other','/restaurant/unknown','/restaurant/hf#bad','/restaurant/hf?x=\\bad']) assert.equal(restaurantReturnHref(value),null)
  assert.equal(restaurantReturnHref(null),null)
})
