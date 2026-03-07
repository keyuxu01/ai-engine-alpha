import { createInstance } from '@repo/lib';

const aiEngineApi = createInstance(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
);

export { aiEngineApi };
