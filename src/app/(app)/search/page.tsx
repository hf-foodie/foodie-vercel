import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getAllRestaurantList } from '@/services/restaurant'
import SearchClient from './SearchClient'

export const metadata: Metadata = { title: '맛집탐방', description: '등록된 식당을 상호·대표 메뉴·지역으로 찾아보세요.' }
type Query = Record<string, string | string[] | undefined>
export default async function SearchPage({ searchParams }: { searchParams: Promise<Query> }) {
  const query = await searchParams
  if (query.restaurantId || query.restaurantReturn || query.bookmarkReturn || query.tab || query['sort-by'] || query.tag || query.c === 'author') {
    const legacy = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => { if (typeof value === 'string') legacy.set(key, value) })
    redirect('/blogs?' + legacy)
  }
  const searchQuery = (Array.isArray(query.s) ? query.s[0] : query.s) || ''
  const filters = Object.fromEntries(['region', 'address', 'restaurantName'].map(key => [key, typeof query[key] === 'string' ? query[key] : '']))
  const restaurants = await getAllRestaurantList()
  const filterSuggestions = {
    address: [...new Set(restaurants.flatMap(({ address }) => { const parts = address.trim().split(/\s+/); return [parts[0], parts.slice(0, 2).join(' '), address] }).filter(Boolean))].sort((a,b) => a.localeCompare(b,'ko')),
    restaurantName: [...new Set(restaurants.map(({name}) => name).filter(Boolean))].sort((a,b) => a.localeCompare(b,'ko')),
  }
  return <SearchClient key={JSON.stringify(query)} view="restaurants" filterSuggestions={filterSuggestions} filters={filters}
    restaurants={restaurants} posts={[]} tags={[]} totalResults={0} searchQuery={searchQuery} searchTab="posts" currentPage={1} />
}
