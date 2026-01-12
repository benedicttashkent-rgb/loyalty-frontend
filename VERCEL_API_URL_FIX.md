# 🚨 СРОЧНО: Запросы идут на Vercel вместо Railway!

## Проблема:
Запросы идут на `https://loyalty-frontend-six.vercel.app/api/...` вместо Railway backend.

**Status Code: 405 Method Not Allowed** - это Vercel, а не ваш backend!

---

## ✅ РЕШЕНИЕ:

### 1. Проверьте Vercel Environment Variables:

**Vercel Dashboard → Project → Settings → Environment Variables:**

**Должна быть переменная:**
```
VITE_API_BASE_URL=https://web-production-9dbea.up.railway.app/api
```

**Важно:**
- ✅ URL должен быть полным: `https://...`
- ✅ Должен заканчиваться на `/api`
- ✅ НЕ должно быть слеша в конце: `https://...railway.app/api` (правильно)
- ❌ НЕ должно быть: `https://...railway.app/api/` (неправильно)

### 2. Проверьте Environment:

Убедитесь, что переменная добавлена для **Production** environment (не только Development).

### 3. ПЕРЕСОБЕРИТЕ проект:

**Vercel Dashboard → Deployments → Latest Deployment → Redeploy**

Или просто сделайте новый commit и push - Vercel автоматически пересоберет.

---

## 🔍 Проверка после пересборки:

1. **Откройте ваше Vercel приложение**
2. **Откройте DevTools (F12)** → **Console**
3. **Попробуйте зарегистрироваться**
4. **В консоли должно быть:**
   ```
   🔍 Sending OTP request:
      VITE_API_BASE_URL: https://web-production-9dbea.up.railway.app/api
      Full API URL: https://web-production-9dbea.up.railway.app/api/auth/send-otp
   ```

5. **В Network tab:**
   - Request URL должен быть: `https://web-production-9dbea.up.railway.app/api/auth/send-otp`
   - НЕ должен быть: `https://loyalty-frontend-six.vercel.app/api/auth/send-otp`

---

## ⚠️ Важно:

- **Vercel НЕ может проксировать API запросы** в production (proxy работает только в dev)
- **Нужен полный URL** к Railway backend
- **После добавления переменной нужно пересобрать** проект

---

## ✅ Быстрая проверка:

1. **Vercel → Environment Variables** → `VITE_API_BASE_URL` = `https://web-production-9dbea.up.railway.app/api`
2. **Redeploy** в Vercel
3. **Проверьте Console** - должно показать Railway URL
4. **Проверьте Network** - запрос должен идти на Railway

---

✅ **После пересборки запросы должны идти на Railway, а не на Vercel!**
