import { Suspense } from 'react'
import {getRestaurantListFilterOptions} from "@/data/restaurant";
import ListingPageContent from "./ListingPageContent";
import {getFootprintsCEO} from "@/services/footprints";

const Page = async () => {
  const filterOptions = await getRestaurantListFilterOptions()
  const listings = await getFootprintsCEO()

  return (
    <Suspense>
      <ListingPageContent listings={listings} filterOptions={filterOptions} />
    </Suspense>
  )
}

export default Page
