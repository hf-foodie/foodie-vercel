import { customFetch } from '@/lib/fetch'
import { apiBase } from '@/lib/server-session'
import {TBranch} from "@/data/types";
import {branches} from "@/data/branches";

export async function getBranches(token: string) : Promise<TBranch[]> {
    const baseUrl = apiBase();
    const branchesWithCount = await Promise.all(
        branches.map(async (branch) => {
            try {
                const response = await customFetch(`${baseUrl}/restaurants/count?address=${encodeURIComponent(branch.handle)}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    return branch;
                }
                const data = await response.text();
                return {
                    ...branch,
                    count: Number(data) || 0,
                };
            } catch (error) {
                console.error(`Failed to fetch count for ${branch.handle}:`, error);
                return branch;
            }
        })
    );

    return branchesWithCount;
}