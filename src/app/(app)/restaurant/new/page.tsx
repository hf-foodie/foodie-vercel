'use client'
import {useState} from 'react'
import PhotoPicker from '@/components/PhotoPicker'
export default function Page(){
 const [file,setFile]=useState<File|null>(null)
 return <main className="kr-container kr-main space-y-5 py-8"><h1 className="text-2xl font-bold">맛집 등록 체험</h1><p>대표사진을 선택하면 이 기기에서 미리볼 수 있습니다. 식당 등록은 내부망에 정식 서비스 오픈 후 이용가능합니다.</p><PhotoPicker file={file} onChange={setFile}/><button className="kr-button" disabled>식당 등록</button></main>
}
