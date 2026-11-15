import { Suspense } from 'react'
import ListingPageContent from "./ListingPageContent";
import {getInfluencersByVPresident} from "@/services/influencer";
import {getRestaurantListFilterOptions} from "@/data/restaurant";

const Page = async () => {
  const filterOptions = await getRestaurantListFilterOptions()
  const listings = await getInfluencersByVPresident()

  return (
    <Suspense>
      <ListingPageContent listings={listings} filterOptions={filterOptions} />
    </Suspense>
  )
}

export default Page
