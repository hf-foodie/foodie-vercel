import { customFetch } from '@/lib/fetch'
import { apiBase } from '@/lib/server-session'


import 'server-only'
import { cookies } from 'next/headers'
import {TBlackWhite} from "@/data/types";

export async function getAllBackWhiteList(): Promise<TBlackWhite[]> {
    let token: string | undefined
    try {
        const cookieStore = await cookies()
        token = cookieStore.get('accessToken')?.value
    } catch (e) {
        // 빌드 타임 무시
    }
    const headers: HeadersInit = {}
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const baseUrl = apiBase();
    const response = await customFetch(`${baseUrl}/blackwhites`, {
        headers,
        cache: 'no-store'
    }).catch(() => null);

    if (!response || !response.ok) {
        return [];
    }

    return response.json();
}