import { Suspense } from 'react'
import InternClient from './InternClient'
import { getRestaurantListFilterOptions } from '@/data/restaurant'
import { customFetch } from '@/lib/fetch'
import { readApi } from '@/lib/readApi'
import { apiBase } from '@/lib/server-session'
import { Recommendation } from '@/lib/recommendation'
import { getAllRestaurantList } from '@/services/restaurant'
import { attachLinkedRestaurants } from '@/lib/curatedRestaurant'

export default async function Page() {
  const [items, filterOptions, restaurants] = await Promise.all([
    customFetch(apiBase() + '/recommendations/intern').then(r => readApi<Recommendation[]>(r)),
    getRestaurantListFilterOptions(),
    getAllRestaurantList(),
  ])
  const listings = attachLinkedRestaurants(items.map(item => ({...item.content, restaurantId: item.restaurantId, id: item.id, handle: item.id, listingCategory: 'intern'})), restaurants)
  return <Suspense><InternClient listings={listings} filterOptions={filterOptions} /></Suspense>
}
