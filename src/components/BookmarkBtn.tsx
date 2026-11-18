'use client'
import { BookmarkIcon } from '@heroicons/react/24/outline'
interface Props {className?:string;bookmarked?:boolean;postId?:string;restaurantId?:number}
export default function BookmarkBtn({className}:Props){return <button type="button" className={'relative flex size-11 items-center justify-center rounded-md bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed '+(className||'')} disabled aria-label="맛집 저장 · 정식 서비스에서 이용 가능" title="내부망에 정식 서비스 오픈 후 이용가능"><BookmarkIcon className="size-5"/></button>}
