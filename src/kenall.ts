import { KENALL } from '@ken-all/kenall';

const apiBaseUrl = import.meta.env.VITE_KENALL_API_BASE_URL;
const api = new KENALL(import.meta.env.VITE_KENALL_API_KEY as string, {
  apibase: apiBaseUrl,
  timeout: 10000,
});

export { api };
