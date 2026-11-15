'use client'
// Only explicit search submissions and restaurant selections are events.
// Pagination, hydration and list restoration never call this helper.
export function recordSearch(keyword: string, source: string) {
  if (!keyword.trim()) return
  record({kind:'SEARCH',keyword:keyword.trim().slice(0,100),source,restaurantId:null})
}
export function recordRestaurantOpen(restaurantId: number, listHref: string) {
  record({kind:'RESTAURANT_OPEN',keyword:'',source:listHref.split('?')[0],restaurantId})
}
function record(event: {kind:string;keyword:string;source:string;restaurantId:number|null}) {
  try {
    const bytes=crypto.getRandomValues(new Uint8Array(16))
    bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128
    const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')
    const eventId=[hex.slice(0,8),hex.slice(8,12),hex.slice(12,16),hex.slice(16,20),hex.slice(20)].join('-')
    void fetch('/api/backend/analytics/events',{method:'POST',credentials:'same-origin',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({...event,eventId})}).catch(()=>{})
  } catch { /* Analytics must not prevent searching or navigation. */ }
}
