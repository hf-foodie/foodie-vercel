import { apiBase } from '@/lib/server-session'
import {TTag} from "@/data/types";
import {customFetch} from "@/lib/fetch";

export async function getAllDistinctTags(): Promise<TTag[]> {
    const baseUrl = apiBase();
    const response = await customFetch(`${baseUrl}/tags`, {
        cache: 'no-store'
    });
    if (!response.ok) {
        throw new Error('Failed to fetch tags');
    }

    return await response.json();
}