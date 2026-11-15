import { Suspense } from 'react'
import {getAllBackWhiteList} from "@/services/blackwhite";
import {getBlackWhiteListFilterOptions} from "@/data/blackwhite";
import ListingPageContent from "./ListingPageContent";
import { getAllRestaurantList } from '@/services/restaurant'
import { attachLinkedRestaurants } from '@/lib/curatedRestaurant'

const Page = async () => {
  const filterOptions = await getBlackWhiteListFilterOptions()
  const [items, restaurants] = await Promise.all([getAllBackWhiteList(), getAllRestaurantList()])
  const listings = attachLinkedRestaurants(items, restaurants)

  return (
    <Suspense>
      <ListingPageContent listings={listings} filterOptions={filterOptions} />
    </Suspense>
  )
}

export default Page
