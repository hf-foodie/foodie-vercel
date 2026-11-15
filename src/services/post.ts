import { TPost, TPostSummary } from '@/data/types'
import { customFetch } from '@/lib/fetch'
import { readApi } from '@/lib/readApi'
import { apiBase } from '@/lib/server-session'
import 'server-only'
export async function getPostByHandle(handle: string): Promise<TPost> {
  return readApi<TPost>(await customFetch(`${apiBase()}/posts/${encodeURIComponent(handle)}`), true)
}
export async function getPosts(page = 1, search = '', order = 'most-recent', filters: {region?:string;address?:string;restaurantName?:string;restaurantId?:string;tag?:string} = {}): Promise<{content:TPostSummary[];totalElements:number}> {
  const params = new URLSearchParams({page: String(page-1), size: '8', search, order})
  Object.entries(filters).forEach(([key,value]) => { if(value) params.set(key,value) })
  return readApi(await customFetch(`${apiBase()}/posts?${params}`))
}
export type TPostDetail = Awaited<ReturnType<typeof getPostByHandle>>
