'use server';

import { revalidateTag } from "next/cache";
import { REQUEST_CACHE_KEY } from "../constants/cacheKeys";

const createExample = async (formData: FormData) => {
  console.log('createExample', process.env.API_URL);
  await fetch(`${process.env.API_URL}/example`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(Object.fromEntries(formData)),
  });

  revalidateTag(REQUEST_CACHE_KEY, 'max');
};

export { createExample };