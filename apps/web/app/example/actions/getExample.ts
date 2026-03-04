'use server';

import type { Example } from "@repo/types";
import { REQUEST_CACHE_KEY } from "../constants/cacheKeys";

const getExample = async (): Promise<Example[]> => {
    const response = await fetch(`${process.env.API_URL}/example`, {
        next: {
            tags: [REQUEST_CACHE_KEY],
        },
    });
    return response.json();
};

export { getExample };