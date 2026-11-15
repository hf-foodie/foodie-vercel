import { Suspense } from 'react'
import ListingPageContent from "./ListingPageContent";
import {getRestaurantListFilterOptions} from "@/data/restaurant";
import {getFootprintsCC} from "@/services/footprints";

const Page = async () => {
  const filterOptions = await getRestaurantListFilterOptions()
  const listings = await getFootprintsCC()

  return (
    <Suspense>
      <ListingPageContent listings={listings} filterOptions={filterOptions} />
    </Suspense>
  )
}

export default Page
