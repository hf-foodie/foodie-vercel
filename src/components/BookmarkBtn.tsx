'use client'
import { BookmarkIcon } from '@heroicons/react/24/outline'
interface Props {className?:string;bookmarked?:boolean;postId?:string;restaurantId?:number}
export default function BookmarkBtn({className}:Props){return <button type="button" className={'relative flex size-11 items-center justify-center rounded-md bg-neutral-50 '+(className||'')} aria-label="맛집 저장" title="내부망에 정식 서비스 오픈 후 이용가능" onClick={()=>alert('내부망에 정식 서비스 오픈 후 이용가능')}><BookmarkIcon className="size-5"/></button>}
