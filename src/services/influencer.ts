import { apiBase } from '@/lib/server-session'


import 'server-only'
import { customFetch } from "@/lib/fetch";
import { TInfluencerRecommendation} from "@/data/types";

export async function getInfluencersByVPresident(): Promise<TInfluencerRecommendation[]> {
    const baseUrl = apiBase();
    const responseVPresident = await customFetch(`${baseUrl}/influencers/0902`, {
        cache: 'no-store'
    });

    if (!responseVPresident.ok) {
        throw new Error('Failed to fetch restaurants');
    }

    const responseSecretary = await customFetch(`${baseUrl}/influencers/6084`, {
        cache: 'no-store'
    });

    if (!responseSecretary.ok) {
        throw new Error('Failed to fetch restaurants');
    }

    const dataVPresident = await responseVPresident.json();
    const dataSecretary = await responseSecretary.json();

    return [...dataVPresident, ...dataSecretary];
}
