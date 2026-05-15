/**
 * Opens the device dialer for a phone number.
 * Telegram Mini App WebViews block tel: via location.href — use window.open instead.
 */
export function formatTelUrl(phone) {
  const cleanPhone = String(phone).replace(/[^\d+]/g, '');
  return `tel:${cleanPhone}`;
}

export function openPhoneDialer(phone) {
  const telUrl = formatTelUrl(phone);
  const isTelegram = Boolean(window.Telegram?.WebApp);

  if (isTelegram) {
    window.open(telUrl, '_blank');
    return;
  }

  const link = document.createElement('a');
  link.href = telUrl;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
