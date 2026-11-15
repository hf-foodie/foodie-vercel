type SearchableRestaurant = { name: string; address: string; representativeMenuNames?: string[]; nearOfficeNames?: string[] }
const normalized = (text: string) => text.trim().toLowerCase().replace(/\s+/g, '')
export function matchesRestaurant(restaurant: SearchableRestaurant, query: string, office = '') {
  const q = normalized(query)
  return (!office || restaurant.nearOfficeNames?.includes(office)) && (!q || [restaurant.name, restaurant.address, ...(restaurant.representativeMenuNames || [])].some(value => normalized(value).includes(q)))
}
