import { TMagazine } from '@/data/types'
import { customFetch } from '@/lib/fetch'
import { readApi } from '@/lib/readApi'
import { apiBase } from '@/lib/server-session'
export async function getMagazines(_token: string): Promise<TMagazine[]> {
  void _token
  const data = await readApi<{ items: TMagazine[] }>(await customFetch(`${apiBase()}/magazines`))
  return data.items
}
export async function getMagazinesById(_token: string, magazineId: string): Promise<TMagazine> {
  return readApi<TMagazine>(await customFetch(`${apiBase()}/magazines/${encodeURIComponent(magazineId)}`), true)
}
