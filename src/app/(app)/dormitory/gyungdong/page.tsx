import { getAllRestaurantList } from '@/services/restaurant'
import RestaurantList from './RestaurantList'

export const metadata = { title: '경동파크타워 인근 맛집' }

// 등록 식당 ID로 연결하여 최신 상호·주소·메뉴와 후기를 함께 사용합니다.
const restaurantIds = [426, 434, 118, 427, 435, 278, 78, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445]

export default async function Page() {
  const restaurants = await getAllRestaurantList()
  const listings = restaurantIds.flatMap(id => restaurants.filter(item => item.restaurantId === id))
  return <RestaurantList listings={listings} />
}


