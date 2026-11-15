export type RecommendationContent = {
  title: string
  description: string
  featuredImage: string
  address: string
  reviewStart: number
  representative_menu: string
  branch: string[]
  timeZoneCategory: string[]
  foodStyleCategory: string[]
  displayOrder: number
}
export type Recommendation = { id: string; revision: number; content: RecommendationContent; updatedAt: string; restaurantId?: number | null }
export type RecommendationHistory = { revision: number; actor: string; content: RecommendationContent; changedAt: string }
export const recommendationImages = Array.from({length: 20}, (_, i) => `/images/intern/${String(i+1).padStart(3,'0')}.png`)
