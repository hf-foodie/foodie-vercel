type RegisteredRestaurant = { restaurantId: number; createdAt: string }

/** Registration time, never review activity or later edits, determines freshness. */
export function latestRestaurants<T extends RegisteredRestaurant>(restaurants: T[], limit = 6): T[] {
  const registeredAt = (item: T) => {
    const time = Date.parse(item.createdAt)
    return Number.isFinite(time) ? time : 0
  }
  return [...restaurants].sort((a, b) => registeredAt(b) - registeredAt(a) || b.restaurantId - a.restaurantId).slice(0, limit)
}
