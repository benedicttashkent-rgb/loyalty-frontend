import { getApiUrl } from '../config/api';

// Stale-while-revalidate cache for GET endpoints.
// Pages render instantly from the last saved response, then refresh in the background.
const PREFIX = 'benedictCache:';
const inflight = new Map();

// `scope` ties an entry to something like the auth token, so a different
// (or logged-out) user never sees someone else's cached data.
export const readCache = (key, scope = null) => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    return entry.scope === scope ? entry.data : null;
  } catch {
    return null;
  }
};

export const fetchCached = (key, url, { headers, scope = null } = {}) => {
  if (inflight.has(key)) return inflight.get(key);

  const request = fetch(url, { headers })
    .then(async (response) => {
      if (!response.ok) {
        const error = new Error(`Request failed: ${response.status}`);
        error.status = response.status;
        throw error;
      }
      const data = await response.json();
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify({ scope, data }));
      } catch {}
      return data;
    })
    .finally(() => inflight.delete(key));

  inflight.set(key, request);
  return request;
};

export const fetchCustomer = (token, extraHeaders = {}) =>
  fetchCached('customers/me', getApiUrl('customers/me'), {
    headers: { Authorization: `Bearer ${token}`, ...extraHeaders },
    scope: token,
  });

export const readCachedCustomer = () => readCache('customers/me', localStorage.getItem('authToken'));

export const fetchContent = (name) => fetchCached(`content/${name}`, getApiUrl(`content/${name}`));

// Warm public content at app start so tab switches don't wait on the network.
export const prefetchContent = () => {
  ['news', 'special-offers', 'events', 'rewards'].forEach((name) => {
    fetchContent(name).catch(() => {});
  });
  const token = localStorage.getItem('authToken');
  if (token) fetchCustomer(token).catch(() => {});
};
