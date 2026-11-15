import type { TRestaurant } from '@/data/types'

export type LinkedRestaurantDisplay = {
  linkedRestaurant?: { name: string; address: string }
}

export function attachLinkedRestaurants<T extends { restaurantId?: number | null }>(items: T[], restaurants: TRestaurant[]): (T & LinkedRestaurantDisplay)[] {
  const byId = new Map(restaurants.map(restaurant => [restaurant.restaurantId, restaurant]))
  return items.map(item => {
    const restaurant = item.restaurantId ? byId.get(item.restaurantId) : undefined
    return { ...item, linkedRestaurant: restaurant ? { name: restaurant.name, address: restaurant.address } : undefined }
  })
}

export function curatedRestaurantDisplay(originalName: string, originalAddress: string, linked?: LinkedRestaurantDisplay['linkedRestaurant']) {
  const name = linked?.name.trim() || originalName
  const address = linked?.address.trim() || originalAddress
  const normalize = (value: string) => value.normalize('NFKC').replace(/\s+/g, '').toLowerCase()
  return { name, address, previousName: normalize(name) !== normalize(originalName) ? originalName : undefined }
}
