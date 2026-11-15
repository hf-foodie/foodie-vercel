import { apiBase } from '@/lib/server-session'


import 'server-only'
import { customFetch } from "@/lib/fetch";
import {TFootprintsCC, TFootprintsCEO} from "@/data/types";

export async function getFootprintsCEO(): Promise<TFootprintsCEO[]> {
    const baseUrl = apiBase();
    const response = await customFetch(`${baseUrl}/footprints/ceo`, {
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
    }

    return response.json();
}
export async function getFootprintsCC(): Promise<TFootprintsCC[]> {
    const baseUrl = apiBase();
    const response = await customFetch(`${baseUrl}/footprints/cc`, {
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
    }

    return response.json();
}