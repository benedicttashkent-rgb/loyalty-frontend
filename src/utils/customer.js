import { getApiUrl } from '../config/api';

// Tier thresholds (total spent) for the next level
const NEXT_TIER_THRESHOLD = {
  Bronze: 10000000,
  Silver: 30000000,
  Gold: 60000000,
  Platinum: null,
};

const formatPhone = (phone) => {
  if (phone && phone.startsWith('998') && phone.length === 12) {
    // Format 998XXXXXXXXX to +998 XX XXX XX XX
    const digits = phone.slice(3);
    return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
  }
  return phone;
};

// Shape the /customers/me response into what the UI uses
export const toUserData = (data) => {
  if (!data?.success || !data.customer) return null;
  const customer = data.customer;
  const tier = customer.tier || 'Bronze';
  const nextThreshold = NEXT_TIER_THRESHOLD[tier] ?? null;
  const totalSpent = typeof customer.totalSpent === 'number' && !isNaN(customer.totalSpent) ? customer.totalSpent : 0;
  // Always recalculate remaining locally in case the backend sends a wrong value
  const remaining = nextThreshold ? Math.max(0, nextThreshold - totalSpent) : 0;

  return {
    id: customer.id,
    name: `${customer.name} ${customer.surName || ''}`.trim(),
    email: customer.email || '',
    phone: formatPhone(customer.phone),
    cashback: customer.cashback || customer.points || 0,
    cashbackPercent: customer.cashbackPercent || 2,
    points: customer.points || customer.cashback || 0, // Backward compatibility
    tier,
    progress: {
      current: totalSpent,
      next: nextThreshold,
      remaining,
      percentage: nextThreshold ? Math.min(100, (totalSpent / nextThreshold) * 100) : 100
    }
  };
};

export const getTelegramChatId = () => {
  const tg = window.Telegram?.WebApp;
  if (!tg) return null;
  try {
    tg.ready();
    tg.expand();
  } catch (e) {
    console.error('[customer] Error initializing Telegram Web App:', e);
  }
  // Private chats: user.id is the chat_id. Group chats: chat.id.
  return tg.initDataUnsafe?.user?.id || tg.initDataUnsafe?.chat?.id || null;
};

// Save the Telegram chat ID once per session, without blocking page load
let telegramChatIdSaved = false;
export const saveTelegramChatId = (token, telegramChatId) => {
  if (telegramChatIdSaved || !telegramChatId) return;
  telegramChatIdSaved = true;
  fetch(getApiUrl('customers/me/telegram-chat-id'), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ telegramChatId: String(telegramChatId) }),
  })
    .then((response) => {
      if (!response.ok) {
        telegramChatIdSaved = false;
        console.error('[customer] Failed to save Telegram chat ID:', response.status);
      }
    })
    .catch((err) => {
      telegramChatIdSaved = false;
      console.error('[customer] Failed to save Telegram chat ID:', err);
    });
};
