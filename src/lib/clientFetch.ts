export async function clientFetch(url: string, options: RequestInit = {}) {
 const path=url.replace('https://preview.invalid','')
 if(!path.startsWith('/')||path.startsWith('//'))throw new Error('허용되지 않은 API 주소입니다.')
 if(!['GET','HEAD'].includes((options.method||'GET').toUpperCase())){ alert('내부망에 정식 서비스 오픈 후 이용가능'); return Response.json({message:'내부망에 정식 서비스 오픈 후 이용가능'},{status:405}) }
 return fetch('/api/backend'+path,{...options,credentials:'omit',cache:'no-store'})
}
