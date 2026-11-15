import { Suspense } from 'react'
import {getRestaurantListFilterOptions} from "@/data/restaurant";
import ListingPageContent from "./ListingPageContent";
import {getAllRestaurantList} from "@/services/restaurant";

const Page = async () => {
  const filterOptions = await getRestaurantListFilterOptions()
  const listings = await getAllRestaurantList()

  return (
    <Suspense>
      <ListingPageContent listings={listings} filterOptions={filterOptions} />
    </Suspense>
  )
}

export default Page
