import { KENALL } from '@ken-all/kenall';

const apiBaseUrl =
  process.env.REACT_APP_KENALL_API_BASE_URL || 'https://api-beta.kenall.jp/v1';
const api = new KENALL(process.env.REACT_APP_KENALL_API_KEY as string, {
  apibase: apiBaseUrl,
  timeout: 10000,
});

export { api };
