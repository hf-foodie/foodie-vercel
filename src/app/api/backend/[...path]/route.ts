import { previewResponse } from '@/lib/preview-api'
import type { NextRequest } from 'next/server'
async function handle(request: NextRequest, context: {params: Promise<{path:string[]}>}) {
 const {path}=await context.params
 return previewResponse('/'+path.map(encodeURIComponent).join('/')+request.nextUrl.search, request.method)
}
export {handle as GET, handle as HEAD, handle as POST, handle as PUT, handle as PATCH, handle as DELETE}
