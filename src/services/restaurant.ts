import { apiBase } from '@/lib/server-session'


import 'server-only'
import { TRestaurant } from "@/data/types";
import { customFetch } from "@/lib/fetch";

export async function getAllRestaurantList(): Promise<TRestaurant[]> {
    const baseUrl = apiBase();
    const response = await customFetch(`${baseUrl}/restaurants`, {
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
    }

    return response.json();
}

export async function getDubaiCookieRstaurantList(): Promise<TRestaurant[]> {
    const baseUrl = apiBase();
    const response = await customFetch(`${baseUrl}/restaurants?representativeMenuNames=두쫀쿠`, {
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
    }

    return response.json();
}

export async function getRestaurantById(id: string): Promise<TRestaurant | null> {
    const baseUrl = apiBase();

    const response = await customFetch(`${baseUrl}/restaurants/${id}`, {
        cache: 'no-store'
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error('Failed to fetch restaurant');
    }

    return response.json();
}

