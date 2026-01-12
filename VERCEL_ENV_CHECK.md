# 🔍 Проверка Vercel Environment Variables

## Проблема:
`VITE_API_BASE_URL` установлен, но запросы все еще идут на Vercel вместо Railway.

## ✅ КРИТИЧЕСКАЯ ПРОВЕРКА:

### 1. Проверьте в Vercel Dashboard:

**Vercel Dashboard → Project → Settings → Environment Variables:**

**Должна быть переменная:**
```
Name: VITE_API_BASE_URL
Value: https://web-production-9dbea.up.railway.app/api
Environment: Production (и Preview, если нужно)
```

**Проверьте:**
- ✅ Environment должен быть **Production** (не только Development!)
- ✅ Value должен быть: `https://web-production-9dbea.up.railway.app/api`
- ✅ НЕТ лишних пробелов или символов
- ✅ НЕТ кавычек вокруг значения

### 2. ПЕРЕСОБЕРИТЕ проект:

**Vercel Dashboard → Deployments → Latest Deployment → ⋮ (три точки) → Redeploy**

**ИЛИ:**

Сделайте новый commit и push - Vercel автоматически пересоберет.

### 3. Проверьте в браузере после пересборки:

1. **Откройте ваше Vercel приложение**
2. **Откройте DevTools (F12)** → **Console**
3. **Введите:**
   ```javascript
   console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
   ```

**Должно показать:**
```
VITE_API_BASE_URL: https://web-production-9dbea.up.railway.app/api
```

**Если показывает `undefined`:**
- Переменная не применяется
- Нужно пересобрать проект
- Или переменная установлена только для Development

### 4. Проверьте Network tab:

1. **DevTools (F12)** → **Network**
2. **Попробуйте зарегистрироваться**
3. **Найдите запрос к `send-otp`**
4. **Проверьте Request URL:**

**Должен быть:**
```
https://web-production-9dbea.up.railway.app/api/auth/send-otp
```

**НЕ должен быть:**
```
https://loyalty-frontend-six.vercel.app/api/auth/send-otp
```

---

## ⚠️ Важно:

- **Vite переменные** начинаются с `VITE_`
- **Переменные применяются только при сборке** - нужно пересобрать!
- **Environment должен быть Production** для production deployment

---

## ✅ Быстрая проверка:

1. **Vercel → Environment Variables** → `VITE_API_BASE_URL` = `https://web-production-9dbea.up.railway.app/api` (Production)
2. **Redeploy** в Vercel
3. **Проверьте Console** - должно показать Railway URL
4. **Проверьте Network** - запрос должен идти на Railway

---

✅ **После пересборки запросы должны идти на Railway!**
