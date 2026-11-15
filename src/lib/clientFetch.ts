export async function clientFetch(url: string, options: RequestInit = {}) {
  const base = process.env.NEXT_PUBLIC_API_URL || ''
  const path = base && url.startsWith(`${base}/`) ? url.slice(base.length) : url
  if (!path.startsWith('/') || path.startsWith('//')) throw new Error('허용되지 않은 API 주소입니다.')
  const headers = new Headers(options.headers)
  headers.delete('Authorization')
  const device = localStorage.getItem('deviceId')
  if (device) headers.set('X-Device-Id', device)
  const response = await fetch(`/api/backend${path}`, { ...options, headers, credentials: 'same-origin', cache: 'no-store' })
  if (!/^\/(auth\/(login|register)|password\/)/.test(path) && response.status === 401 && !['GET', 'HEAD'].includes((options.method || 'GET').toUpperCase())) {
    alert('로그인이 필요하거나 세션이 만료되었습니다. 로그인 후 다시 시도해주세요.')
  }
  return response
}
