import { fetchCached } from '../../utils/apiCache';

// Vacancies live in the same Google Apps Script backend as benedict-cafe.uz
// (managed from that site's admin page). All calls are GET with query params
// to avoid CORS preflight issues with Apps Script web apps.
const SCRIPT_URL = import.meta.env.VITE_VACANCIES_SCRIPT_URL;

const buildUrl = (params) => `${SCRIPT_URL}?${new URLSearchParams(params).toString()}`;

export const isVacanciesConfigured = Boolean(SCRIPT_URL);

export const fetchVacancies = async () => {
  if (!SCRIPT_URL) throw new Error('VITE_VACANCIES_SCRIPT_URL is not configured');
  const json = await fetchCached('vacancies', buildUrl({ action: 'vacancies_list' }));
  if (!json.success) throw new Error(json.error || 'Failed to load vacancies');
  return json;
};

export const submitVacancyApplication = async (application) => {
  if (!SCRIPT_URL) throw new Error('VITE_VACANCIES_SCRIPT_URL is not configured');
  const response = await fetch(buildUrl({
    action: 'vacancy_apply',
    ...application,
    timestamp: new Date().toISOString(),
  }), { headers: { Accept: 'application/json' } });
  const json = await response.json();
  if (!json.success) throw new Error(json.error || 'Failed to send application');
};
