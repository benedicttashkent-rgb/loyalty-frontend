# 🔍 Отладка API URL

## Проблема:
`VITE_API_BASE_URL` установлен с `/api`, но регистрация все еще не работает.

## ✅ Проверка:

### 1. Проверьте в браузере Console:

Откройте DevTools (F12) → Console и введите:
```javascript
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
console.log('All VITE vars:', Object.keys(import.meta.env).filter(k => k.startsWith('VITE_')));
```

**Должно показать:**
```
VITE_API_BASE_URL: https://web-production-9dbea.up.railway.app/api
```

**Если показывает `undefined`:**
- Переменная не применяется
- Нужно пересобрать проект в Vercel

### 2. Проверьте Vercel Environment Variables:

**Vercel Dashboard → Project → Settings → Environment Variables:**

Должна быть:
```
VITE_API_BASE_URL=https://web-production-9dbea.up.railway.app/api
```

**Проверьте:**
- ✅ Environment: **Production** (не только Development)
- ✅ Value: `https://web-production-9dbea.up.railway.app/api` (с `/api`)
- ✅ Нет лишних пробелов или символов

### 3. Пересоберите проект:

**Vercel Dashboard → Deployments → Latest → Redeploy**

Или сделайте новый commit и push.

### 4. Проверьте после пересборки:

1. Откройте ваше Vercel приложение
2. Откройте DevTools (F12) → Console
3. Попробуйте зарегистрироваться
4. В консоли должно быть:
   ```
   🔍 Sending OTP request:
      VITE_API_BASE_URL: https://web-production-9dbea.up.railway.app/api
      Full API URL: https://web-production-9dbea.up.railway.app/api/auth/send-otp
   ```

5. В Network tab:
   - Request URL должен быть: `https://web-production-9dbea.up.railway.app/api/auth/send-otp`
   - Status должен быть: `200` или `400` (не `404` или `405`)

---

## ⚠️ Типичные проблемы:

### Проблема 1: Переменная не применяется
**Симптом:** `import.meta.env.VITE_API_BASE_URL` = `undefined`

**Решение:** 
- Убедитесь, что переменная для **Production**
- Пересоберите проект (Redeploy)

### Проблема 2: Неправильный URL
**Симптом:** Запрос идет на Vercel вместо Railway

**Решение:** 
- Проверьте, что URL правильный
- Проверьте, что заканчивается на `/api`

### Проблема 3: CORS Error
**Симптом:** `CORS policy: No 'Access-Control-Allow-Origin'`

**Решение:** 
- Railway → BACKEND → Variables → `FRONTEND_URL=https://loyalty-frontend-six.vercel.app`

---

✅ **После проверки всех пунктов регистрация должна заработать!**
