import { notFound, redirect } from 'next/navigation'
export async function readApi<T>(response: Response, detail = false): Promise<T> {
  if (response.status === 401) redirect('/login?reason=session-expired')
  if (response.status === 404 && detail) notFound()
  if (!response.ok)
    throw new Error(
      response.status === 403 ? '접근 권한이 없습니다.' : '데이터를 불러오지 못했습니다. 다시 시도해주세요.'
    )
  return response.json() as Promise<T>
}
