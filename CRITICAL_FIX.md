# 🚨 КРИТИЧЕСКАЯ ПРОБЛЕМА: Запросы идут на Vercel

## Проблема:
Запросы идут на `https://loyalty-frontend-six.vercel.app/api/...` вместо Railway backend.

**Status Code: 405 Method Not Allowed** - это Vercel статический сайт, а не API!

---

## ✅ РЕШЕНИЕ (ОБЯЗАТЕЛЬНО):

### 1. Проверьте Vercel Environment Variables:

**Vercel Dashboard → Project → Settings → Environment Variables:**

**Должна быть переменная:**
```
Name: VITE_API_BASE_URL
Value: https://web-production-9dbea.up.railway.app/api
Environment: Production ✅ (ОБЯЗАТЕЛЬНО!)
```

**Проверьте:**
- ✅ Environment должен быть **Production** (не только Development!)
- ✅ Value должен быть: `https://web-production-9dbea.up.railway.app/api`
- ✅ НЕТ лишних пробелов
- ✅ НЕТ кавычек

### 2. ПЕРЕСОБЕРИТЕ проект:

**Vercel Dashboard → Deployments → Latest → ⋮ (три точки) → Redeploy**

**ИЛИ:**

Сделайте новый commit и push - Vercel автоматически пересоберет.

### 3. Проверьте в браузере:

1. **Откройте ваше Vercel приложение**
2. **Откройте DevTools (F12)** → **Console**
3. **Должно быть:**
   ```
   🔍 Signup Page - Environment Check:
      VITE_API_BASE_URL: https://web-production-9dbea.up.railway.app/api
   ```

4. **Попробуйте зарегистрироваться**
5. **В консоли должно быть:**
   ```
   🔍 Sending OTP request:
      VITE_API_BASE_URL: https://web-production-9dbea.up.railway.app/api
      Full API URL: https://web-production-9dbea.up.railway.app/api/auth/send-otp
   ```

6. **В Network tab:**
   - Request URL должен быть: `https://web-production-9dbea.up.railway.app/api/auth/send-otp`
   - НЕ должен быть: `https://loyalty-frontend-six.vercel.app/api/auth/send-otp`

---

## ⚠️ ВАЖНО:

- **Vite переменные применяются только при сборке!**
- **После добавления переменной ОБЯЗАТЕЛЬНО пересоберите проект!**
- **Environment должен быть Production для production deployment**

---

## 🔍 Если все еще не работает:

1. **Проверьте Console** - что показывает `VITE_API_BASE_URL`?
2. **Если `undefined`** - переменная не применяется, пересоберите
3. **Если показывает правильный URL, но запрос идет на Vercel** - проверьте код

---

✅ **После пересборки запросы должны идти на Railway!**
