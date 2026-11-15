import 'server-only'
import { previewResponse } from './preview-api'
export async function customFetch(url: string, options: RequestInit = {}) { return previewResponse(url, options.method) }
