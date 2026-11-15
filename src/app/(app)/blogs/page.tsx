import { permanentRedirect } from 'next/navigation'
export default async function LegacyBlogs({ searchParams }: { searchParams: Promise<Record<string,string|string[]|undefined>> }) {
  const query=new URLSearchParams()
  for(const [key,value] of Object.entries(await searchParams)) {
    if(Array.isArray(value)) value.forEach(item=>query.append(key,item))
    else if(value!==undefined) query.set(key,value)
  }
  permanentRedirect('/records'+(query.size?'?'+query.toString():''))
}
