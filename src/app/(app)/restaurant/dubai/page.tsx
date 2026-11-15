import { Suspense } from 'react'
import {getRestaurantListFilterOptions} from "@/data/restaurant";
import ListingPageContent from "../dubai/ListingPageContent";
import {getDubaiCookieRstaurantList} from "@/services/restaurant";

const Page = async () => {
  const filterOptions = await getRestaurantListFilterOptions()
  const listings = await getDubaiCookieRstaurantList()

  return (
    <Suspense>
      <ListingPageContent listings={listings} filterOptions={filterOptions} />
    </Suspense>
  )
}

export default Page
