import {TInfluencerRestaurant} from '@/data/types'
import RecommendationCard from '@/components/krds/RecommendationCard'
import { curatedRestaurantDisplay } from '@/lib/curatedRestaurant'
export default function RestaurantCard({data,className,listHref,cardId}:{data:TInfluencerRestaurant;className?:string;listHref?:string;cardId?:string}) {
  const display = curatedRestaurantDisplay(data.title, data.address, data.linkedRestaurant)
  return <RecommendationCard restaurantId={data.restaurantId} listHref={listHref} cardId={cardId} title={display.name} previousName={display.previousName} address={display.address} image={data.featuredImage} menu={data.representative_menu} source={data.branch?.join(' · ')} description={data.description} rating={data.reviewStart} className={className}/>
}
