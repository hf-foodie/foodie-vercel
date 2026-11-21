'use client'
import {useEffect,useState} from 'react'
export default function PhotoPicker({file,onChange}:{file:File|null;onChange:(file:File|null)=>void}){
 const [url,setUrl]=useState('')
 const [error,setError]=useState('')
 useEffect(()=>{if(!file){setUrl('');return}const local=URL.createObjectURL(file);setUrl(local);return()=>URL.revokeObjectURL(local)},[file])
 return <div className="space-y-2"><label className="block">대표사진 1장 (선택)<input className="block w-full min-w-0 rounded border p-2" type="file" accept="image/jpeg,image/png" onChange={e=>{const f=e.target.files?.[0];setError('');if(f&&(f.size>5*1024*1024||!['image/jpeg','image/png'].includes(f.type))){setError('JPEG 또는 PNG 사진을 5MB 이하로 선택해주세요.');e.target.value='';onChange(null)}else onChange(f||null)}}/></label><small>JPEG·PNG, 최대 5MB · 1600만 화소</small>{error&&<p role="alert">{error}</p>}{url&&<img alt="선택한 대표사진 미리보기" className="max-h-48 max-w-full rounded object-contain" src={url}/>}</div>
}
