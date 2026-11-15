
import SearchClient from '../search/SearchClient'
import {Metadata} from "next";
import {getPosts} from "@/services/post";
import {TTag} from "@/data/types";
import {getAllDistinctTags} from "@/services/tag";
import {getAllRestaurantList} from '@/services/restaurant'

const filterTabs = [
  { name: '포스터',  value: 'posts'},
  { name: '태그', value: 'tags' },
]

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
    const { s: query } = await searchParams

    return {
        title: `맛집 후기`,
        description: `Search results for ${query || ''}`,
    }
}

const PageSearch = async ({
                              params, searchParams
} : {
    params: Promise<{ query: string }>
    searchParams: SearchParams
}) => {
    let searchQuery = (await searchParams)['s']
    let searchTab = (await searchParams)['tab']
    const page = (await searchParams)['page']

    if (Array.isArray(searchQuery)) {
        searchQuery = searchQuery[0]
    }
    if (!searchQuery) {
        searchQuery = ''
    }

    if (searchTab && Array.isArray(searchTab)) {
        searchTab = searchTab[0]
    }
    if (!filterTabs.some((tab) => tab.value === searchTab)) {
        searchTab = filterTabs[0].value // default tab is posts
    }

    const parsedPage = Number(Array.isArray(page) ? page[0] : page)
    const currentPage = Number.isSafeInteger(parsedPage) && parsedPage > 0 && parsedPage <= 1000000 ? parsedPage : 1
    const order = (await searchParams)['sort-by']
    const query = await searchParams
    const filters = Object.fromEntries(['region','address','restaurantName', 'restaurantId','tag'].map(key => [key, typeof query[key] === 'string' ? query[key] : '']))
    const allRestaurants = await getAllRestaurantList()
    const filterSuggestions = {
      address: [...new Set(allRestaurants.flatMap(({ address }) => { const parts = address.trim().split(/\s+/); return [parts.slice(0, 1).join(' '), parts.slice(0, 2).join(' '), address] }).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ko')),
      restaurantName: [...new Set(allRestaurants.map(({ name }) => name).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ko')),
    }
    const restaurants = null
    const result = searchTab === 'posts' ? await getPosts(currentPage, searchQuery, typeof order === 'string' ? order : 'most-recent', filters) : {content: [], totalElements: 0}
    const posts = result.content
    let tags: TTag[] = []
    let totalResults = 0
    
    if (searchTab === 'tags') {
        const tagRes = await getAllDistinctTags()
        tags = tagRes || []
        totalResults = tagRes.length || 0
    } else {
        totalResults = result.totalElements
    }

    return (
        <SearchClient filterSuggestions={filterSuggestions} key={JSON.stringify(query)} filters={filters} restaurants={restaurants}
            posts={posts}
            tags={tags}
            totalResults={totalResults}
            searchQuery={searchQuery}
            searchTab={searchTab as 'posts' | 'tags'}
            currentPage={currentPage}
        />
    )
}

export default PageSearch
