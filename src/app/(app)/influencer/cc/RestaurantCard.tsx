import {TFootprintsCC} from '@/data/types'
import { curatedRestaurantDisplay } from '@/lib/curatedRestaurant'
import RecommendationCard from '@/components/krds/RecommendationCard'
export default function RestaurantCard({data,className,listHref,cardId}:{data:TFootprintsCC;className?:string;listHref?:string;cardId?:string}){return <RecommendationCard listHref={listHref} cardId={cardId} restaurantId={data.restaurantId} title={data.name} previousName={curatedRestaurantDisplay(data.originalName || data.name,data.address,{name:data.name,address:data.address}).previousName} address={data.address} image={'/images/restaurant/thumbnail/'+data.restaurantId+'.jpg'} menu={data.representativeMenuNames?.join(', ')} source={data.category} className={className}/>}
