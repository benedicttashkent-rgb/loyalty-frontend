/**
 * Multicard Payment Service
 *
 * TEST IMPLEMENTATION — calls Multicard API directly from the frontend.
 * Before going to production, move this logic to the backend so that
 * credentials are never exposed to the client.
 *
 * Test credentials (sandbox):
 *   Base URL:        https://dev-mesh.multicard.uz
 *   application_id:  rhmt_test
 *   secret:          Pw18axeBFo8V7NamKHXX
 *   store_id:        6
 *
 * Test card:  8600533364098829  expiry: 06/28  OTP: 112233
 */

// Requests go through a proxy (/multicard → https://dev-mesh.multicard.uz)
// Dev: Vite proxy in vite.config.mjs
// Prod: Vercel rewrite in vercel.json
const BASE_URL = '/multicard';
const APPLICATION_ID = 'rhmt_test';
const SECRET = 'Pw18axeBFo8V7NamKHXX';
const STORE_ID = '6';

// Cache token in memory for the session (tokens last 24h)
let _cachedToken = null;
let _tokenExpiry = null;

const getToken = async () => {
  if (_cachedToken && _tokenExpiry && Date.now() < _tokenExpiry) {
    return _cachedToken;
  }

  const res = await fetch(`${BASE_URL}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ application_id: APPLICATION_ID, secret: SECRET }),
  });

  const data = await res.json();
  if (!res.ok || !data.token) {
    throw new Error(data?.error?.details || 'Multicard auth failed');
  }

  _cachedToken = data.token;
  // Expire 1 hour before actual expiry to be safe
  _tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
  return _cachedToken;
};

/**
 * Create a Multicard invoice and return the checkout URL.
 *
 * @param {object} params
 * @param {string} params.invoiceId     - Your order number (e.g. "BEN123456")
 * @param {number} params.amountUzs     - Amount in UZS (will be converted to tiyin × 100)
 * @param {string} params.returnUrl     - Frontend URL to redirect on success
 * @param {string} params.returnErrorUrl - Frontend URL to redirect on failure
 * @returns {Promise<string>} checkout_url
 */
export const createInvoice = async ({ invoiceId, amountUzs, returnUrl, returnErrorUrl }) => {
  const token = await getToken();

  const res = await fetch(`${BASE_URL}/payment/invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      store_id: STORE_ID,
      amount: Math.round(amountUzs * 100), // UZS → tiyin
      invoice_id: invoiceId,
      return_url: returnUrl,
      return_error_url: returnErrorUrl,
      lang: 'ru',
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data?.error?.details || 'Не удалось создать платёж');
  }

  return data.data.checkout_url;
};

export default { createInvoice };
