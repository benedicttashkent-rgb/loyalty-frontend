# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server on port 4028
npm run build      # Production build (outputs to build/)
npm run serve      # Preview production build
```

No test runner is configured — `@testing-library` packages are installed but there is no test script or test files.

## Architecture

This is a React 18 + Vite SPA (loyalty/food-ordering app for Benedict Cafe) styled with Tailwind CSS. JavaScript only (no TypeScript), with path aliases rooted at `src/` via `jsconfig.json`.

### Routing (`src/Routes.jsx`)
11 public routes + 8 admin routes (including `/admin/login`), all defined in one file. The admin section (`/admin/*`) uses `AdminLayout.jsx` as a nested layout. Every route transition shows a `LogoLoader` fullscreen overlay for 500ms.

### Shared Components (`src/components/`)
- `navigation/` — `BottomTabNavigation`, `FloatingCartButton`, `ProfileButton`, `PromotionsModal`, `ModalOverlay`, `BrandLogo`
- `ui/` — primitive form controls: `Button`, `Input`, `Select`, `Checkbox`
- `AppIcon`, `AppImage`, `LogoLoader`, `ErrorBoundary`, `ScrollToTop`

### Pages (`src/pages/`)
Feature-based folders, each containing all components for that feature. Main sections: `home-dashboard`, `food-ordering-menu`, `user-profile-management`, `rewards-catalog`, `promotions-page`, `about-branch-locations`, `admin/`, `signup/`.

### Services (`src/services/`)
Business logic lives here, separated by domain:
- `menu/menuService.js` — fetches and caches menu data (5-min TTL), wraps `menuFetcher.js` and `menuScraper.js`
- `auth/tokenRefreshService.js` — auto-refreshes JWT tokens (hourly + on tab visibility change, 7-day threshold)
- `auth/telegramService.js` — extracts Telegram WebApp `initDataUnsafe` chat ID for mobile auth
- `loyalty/loyaltyService.js`, `rewards/rewardService.js`, `orders/orderService.js`
- `api/iikoLoyaltyAPI.js` — direct iiko POS API integration
- `api/geminiAI.js` — Google Gemini AI integration

### Utils (`src/utils/`)
- `apiClient.js` — fetch-based wrapper for public API calls
- `adminApiClient.js` — fetch-based wrapper for admin API calls (different auth)
- `cn.js` — `clsx` + `tailwind-merge` helper for className composition

### Config (`src/config/`)
- `api.js` — resolves `VITE_API_BASE_URL` with fallbacks: env var → `/api` proxy (dev) → Railway URL (prod). The Vite dev server proxies `/api` to `localhost:3001`.
- `restaurant.config.js` — branch/location settings
- `iikoLoyalty.config.js` — iiko loyalty system settings

### Global State (`src/App.jsx`)
Root component owns global order-tracking state: polls order status every 5 seconds, listens to `localStorage` events for cross-page sync (`benedictOrderDetails`, `benedictSelectedBranch`, `authToken`), and renders an order-completion rating modal.

### Persistence
Heavy use of `localStorage` (no Redux store despite redux being a dependency):
- `authToken` — JWT
- `benedictOrderDetails` — active order
- `benedictSelectedBranch` — selected branch
- Cart items — managed in food-ordering page

### Deployment
- Frontend → Vercel (`vercel.json` rewrites all paths to `/index.html`)
- Backend → Railway (`https://github.com/azamoviich/loyaltyback.git`)
- Set `VITE_API_BASE_URL` in Vercel environment to point at the Railway API
