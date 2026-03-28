# MarketBox — Telegram Mini App Architecture Design

## Overview

MarketBox (BORIGA BARAKA) — Telegram Mini App для бизнес-платформы, связывающей предпринимателей с поставщиками, фабриками, карго-сервисами и образовательными материалами для торговли на маркетплейсах (OZON, Wildberries, Uzum Market) и с Китаем.

**Ключевые характеристики:**
- Работает исключительно как TG Mini App (не standalone, прямой доступ по URL вне TG — редирект на бота)
- Автоматическая авторизация через Telegram initData
- Glass-дизайн в стиле iOS 26 (liquid glass, backdrop-blur, dark theme)
- Подписка PREMIUM (оплата через отдельного TG-бота, фронт отображает статус)
- Готовый REST API бекенд со Swagger-документацией
- Админка существует отдельно
- 15 feature-модулей

---

## Tech Stack

| Технология | Назначение | Размер (gzip) |
|------------|-----------|---------------|
| React 18 + ReactDOM | UI фреймворк | ~45kb |
| Vite | Сборка, dev-сервер, HMR | dev only |
| TypeScript | Типизация | dev only |
| react-router-dom | Роутинг с lazy loading | ~15kb |
| @tanstack/react-query | Data fetching + кэширование | ~12kb |
| zustand | Глобальный стейт (auth, ui) | ~1kb |
| framer-motion | Анимации glass UI, переходы | ~18kb (tree-shaked) |
| @telegram-apps/sdk-react | TG WebApp SDK, авторизация | ~8kb |
| i18next + react-i18next | Локализация ru/uz | ~10kb |
| i18next-http-backend | Ленивая загрузка переводов | ~2kb |
| axios | HTTP клиент | ~5kb |
| sass | SCSS компиляция | dev only |
| clsx | Утилита для условных классов | ~0.5kb |
| vitest | Unit/component тесты | dev only |
| @testing-library/react | Тестирование компонентов | dev only |
| playwright | E2E тесты | dev only |

**Стилизация:** SCSS + BEM методология с древовидными селекторами. НЕ Tailwind.

**Общий размер всех библиотек: ~116kb gzip.** При code splitting начальная загрузка значительно меньше — см. раздел Performance.

---

## Project Structure

```
marketbox/
├── public/
│   └── locales/
│       ├── ru/
│       │   ├── common.json
│       │   ├── home.json
│       │   ├── courses.json
│       │   └── ...
│       └── uz/
│           ├── common.json
│           └── ...
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   ├── providers.tsx
│   │   └── index.ts
│   │
│   ├── api/
│   │   ├── client.ts             # Axios + TG auth header + interceptors
│   │   ├── endpoints.ts          # Typed endpoints
│   │   ├── types.ts              # API response/request types
│   │   └── index.ts
│   │
│   ├── components/               # Shared UI
│   │   ├── GlassCard/
│   │   │   ├── GlassCard.tsx
│   │   │   ├── GlassCard.scss
│   │   │   └── index.ts
│   │   ├── GlassTabBar/
│   │   │   ├── GlassTabBar.tsx
│   │   │   ├── GlassTabBar.scss
│   │   │   └── index.ts
│   │   ├── GlassButton/
│   │   │   └── index.ts
│   │   ├── GlassHeader/
│   │   │   └── index.ts
│   │   ├── CategoryCard/
│   │   │   └── index.ts
│   │   ├── OptimizedImage/
│   │   │   └── index.ts
│   │   ├── Skeleton/
│   │   │   └── index.ts
│   │   ├── ErrorBoundary/
│   │   │   └── index.ts
│   │   ├── PremiumGate/
│   │   │   └── index.ts
│   │   ├── OfflineBanner/
│   │   │   └── index.ts
│   │   └── index.ts              # Barrel: re-export all shared
│   │
│   ├── features/                 # 15 business modules
│   │   ├── home/
│   │   │   ├── components/
│   │   │   │   ├── QuickActions/
│   │   │   │   │   └── index.ts
│   │   │   │   ├── CategoryList/
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   ├── hooks/
│   │   │   │   ├── useCategories.ts
│   │   │   │   └── index.ts
│   │   │   ├── HomePage.tsx
│   │   │   ├── HomePage.scss
│   │   │   └── index.ts         # Public API: exports only HomePage
│   │   ├── courses/
│   │   │   └── index.ts
│   │   ├── cargo/
│   │   │   └── index.ts
│   │   ├── factories/
│   │   │   └── index.ts
│   │   ├── wholesale/
│   │   │   └── index.ts
│   │   ├── china-guide/
│   │   │   └── index.ts
│   │   ├── jobs/
│   │   │   └── index.ts
│   │   ├── design-services/
│   │   │   └── index.ts
│   │   ├── documents/
│   │   │   └── index.ts
│   │   ├── exchange/
│   │   │   └── index.ts
│   │   ├── events/
│   │   │   └── index.ts
│   │   ├── news/
│   │   │   └── index.ts
│   │   ├── profile/
│   │   │   └── index.ts
│   │   ├── favorites/
│   │   │   └── index.ts
│   │   └── money/
│   │       └── index.ts
│   │
│   ├── hooks/                    # Global hooks
│   │   ├── useTelegramUser.ts
│   │   ├── useHaptic.ts
│   │   ├── useThemeParams.ts
│   │   ├── useOnlineStatus.ts
│   │   ├── usePullToRefresh.ts
│   │   └── index.ts
│   │
│   ├── stores/                   # Zustand
│   │   ├── authStore.ts
│   │   ├── uiStore.ts
│   │   └── index.ts
│   │
│   ├── styles/
│   │   ├── _variables.scss       # Design tokens
│   │   ├── _mixins.scss          # Glass effects, typography
│   │   ├── _fonts.scss           # @font-face declarations
│   │   ├── _reset.scss
│   │   ├── _accessibility.scss   # prefers-reduced-motion, prefers-contrast
│   │   └── global.scss
│   │
│   ├── utils/
│   │   ├── cn.ts                 # BEM class helper (wraps clsx)
│   │   ├── i18n.ts               # i18next config
│   │   ├── telegram.ts           # TG WebApp utilities
│   │   └── index.ts
│   │
│   └── main.tsx
│
├── .env.example
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Public API Pattern

Every module exposes its public API through `index.ts` barrel files. Internal components are not exported.

```ts
// src/components/index.ts
export { GlassCard } from './GlassCard'
export { GlassTabBar } from './GlassTabBar'
export { GlassButton } from './GlassButton'
export { CategoryCard } from './CategoryCard'
export type { GlassCardProps } from './GlassCard'

// src/features/home/index.ts
export { HomePage } from './HomePage'
// Internal components (QuickActions, CategoryList) are NOT exported

// Consumer usage:
import { GlassCard, GlassButton } from '@/components'
import { HomePage } from '@/features/home'
import { useTelegramUser } from '@/hooks'
```

**Rule:** Never import from deep paths like `@/features/home/components/QuickActions`. Always go through the module's `index.ts`.

### BEM Class Helper

`cn.ts` wraps `clsx` and adds BEM-specific logic for generating `block__element--modifier` strings:

```ts
// src/utils/cn.ts
import clsx from 'clsx'

export function cn(block: string, element?: string, modifiers?: Record<string, boolean>) {
  const base = element ? `${block}__${element}` : block
  if (!modifiers) return base
  return clsx(base, ...Object.entries(modifiers)
    .filter(([, v]) => v)
    .map(([k]) => `${base}--${k}`))
}

// Usage:
cn('tab-bar', 'icon', { active: true })
// → 'tab-bar__icon tab-bar__icon--active'
```

---

## Design System

### Design Tokens (SCSS Variables)

```scss
// Colors
$color-bg-primary: #121212;
$color-bg-glass: rgba(23, 23, 23, 0.5);
$color-bg-glass-tab: rgba(101, 101, 101, 0.6);
$color-bg-glass-tab-active: rgba(101, 101, 101, 0.4);
$color-bg-glass-card: rgba(0, 0, 0, 0.8);
$color-bg-glass-card-burn: #ccc;
$color-accent: #ac9dff;
$color-premium: #968ad7;
$color-white: #fafafa;
$color-border-glass: rgba(255, 255, 255, 0.6);
$color-border-glass-subtle: rgba(255, 255, 255, 0.1);

// Blur
$blur-glass: 40px;
$blur-glass-sm: 20px;

// Radii
$radius-card: 20px;
$radius-tab: 34px;

// Fonts
$font-gilroy: 'Gilroy', sans-serif;
$font-inter: 'Inter', sans-serif;
$font-bebas: 'Bebas Neue', sans-serif;

// Z-index
$z-tabbar: 100;
$z-header: 50;
```

### SCSS Mixins (implementations)

```scss
@mixin glass-surface($bg: $color-bg-glass, $blur: $blur-glass) {
  background: $bg;
  backdrop-filter: blur($blur);
  -webkit-backdrop-filter: blur($blur);
  border: 1px solid $color-border-glass;
  border-radius: $radius-card;
}

@mixin glass-card-overlay {
  position: absolute;
  bottom: 9px;
  left: 9px;
  right: 9px;
  height: 45px;
  border-radius: $radius-card;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;

  &::before, &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: $radius-card;
    pointer-events: none;
  }

  &::before {
    background: $color-bg-glass-card;
    opacity: 0.67;
  }

  &::after {
    background: $color-bg-glass-card-burn;
    mix-blend-mode: color-burn;
    opacity: 0.67;
  }
}

@mixin glass-tab-bar {
  @include glass-surface($color-bg-glass-tab, $blur-glass);
  border-radius: $radius-tab;
  border-color: $color-border-glass-subtle;
}

@mixin text-title { font-family: $font-gilroy; font-weight: 700; color: $color-white; }
@mixin text-body { font-family: $font-gilroy; font-weight: 500; color: rgba($color-white, 0.8); line-height: 1.2; }
@mixin gpu-accelerated { will-change: transform, opacity; transform: translateZ(0); }
@mixin tap-feedback {
  -webkit-tap-highlight-color: transparent;
  transition: transform 0.15s ease;
  &:active { transform: scale(0.97); }
}
@mixin image-cover { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
```

### BEM Convention

```scss
.block {
  &__element {
    &--modifier { }
  }
}
```

### Fonts

- **Gilroy Bold/Medium** — content headings and body (preloaded, commercial — license required)
- **Inter Medium** — navigation labels
- **Bebas Neue Bold** — quick action cards
- All fonts use `font-display: swap`

### Accessibility

```scss
// _accessibility.scss
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-contrast: more) {
  .glass-surface {
    backdrop-filter: none;
    background: rgba(0, 0, 0, 0.9);
    border: 2px solid rgba(255, 255, 255, 0.8);
  }
}
```

- Text over glass surfaces must maintain WCAG AA contrast (4.5:1 for body, 3:1 for large text)
- Framer Motion respects `useReducedMotion()` hook — disables spring animations
- All interactive elements have visible focus indicators

---

## Screens & Navigation

### Tab Bar (4 tabs)
1. **Главная** `/` — main dashboard
2. **Избранный** `/favorites` — saved items
3. **Профиль** `/profile` — user settings
4. **Мои деньги** `/money` — finances

### Feature Routes (from main page categories)
- `/courses/*` — Курсы (OZON, WB, Uzum)
- `/factories/*` — Фабрики
- `/cargo/*` — Карго (По белому, По чёрному, Фулфилмент)
- `/wholesale/*` — Оптовые продавцы
- `/china-guide/*` — Гид по Китаю (Рынки, Рестораны, Отели)
- `/jobs/*` — Работа
- `/design-services/*` — Услуги дизайна (Инфограф, Фотограф)
- `/documents/*` — Документация (Декларация, Честный знак, Бухгалтерия, Счёт, Юрист)
- `/exchange` — Обмен валют
- `/events/*` — Выставки и мероприятия
- `/news/*` — Новости

### Profile Sub-screens
- `/profile/name` — Имя и фамилия
- `/profile/language` — Язык
- `/profile/payment` — Платежная информация
- `/profile/report` — Сообщить о нарушении
- `/profile/terms` — Оферта и политики
- `/profile/rules` — Правила сообщества

All feature routes use `React.lazy()` for code splitting.

---

## API Contract

### Base Configuration

```ts
// Environment variables
VITE_API_URL=https://api.marketbox.uz    // production
VITE_API_URL=http://localhost:3000       // development
VITE_TG_BOT_USERNAME=marketbox_bot
```

### Standard Response Envelope

```ts
// Success response
interface ApiResponse<T> {
  data: T
  meta?: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

// Error response
interface ApiError {
  error: {
    code: string        // e.g. "SUBSCRIPTION_REQUIRED", "NOT_FOUND"
    message: string     // human-readable (localized by backend based on Accept-Language)
  }
}
```

### Pagination

Offset-based pagination (standard REST):
```
GET /api/courses?page=1&perPage=20
GET /api/courses?page=2&perPage=20
```

### Error Codes & HTTP Status

| Status | Code | Meaning |
|--------|------|---------|
| 400 | `VALIDATION_ERROR` | Invalid request data |
| 401 | `UNAUTHORIZED` | initData invalid/expired |
| 403 | `SUBSCRIPTION_REQUIRED` | Premium content, user has no active subscription |
| 404 | `NOT_FOUND` | Resource not found |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

### Key Endpoints (per feature)

```
Auth:
  POST /api/auth/telegram         — validate initData, return user + token

User:
  GET  /api/user/me               — current user profile + subscription status
  PUT  /api/user/me               — update profile (name, language)

Categories:
  GET  /api/categories            — list all categories for home page

Courses:
  GET  /api/courses               — list courses (paginated, filterable)
  GET  /api/courses/:id           — course detail

Cargo:
  GET  /api/cargo                 — list cargo companies (type: white|black|fulfillment)
  GET  /api/cargo/:id             — cargo company detail

Factories:
  GET  /api/factories             — list factories (paginated)
  GET  /api/factories/:id         — factory detail

Wholesale:
  GET  /api/wholesale             — list wholesale sellers
  GET  /api/wholesale/:id         — seller detail

China Guide:
  GET  /api/china-guide/markets   — list markets
  GET  /api/china-guide/restaurants — list restaurants
  GET  /api/china-guide/hotels    — list hotels
  GET  /api/china-guide/:type/:id — detail

Jobs:
  GET  /api/jobs                  — list jobs (filterable by type)
  GET  /api/jobs/:id              — job detail

Design Services:
  GET  /api/design-services       — list services (type: infograph|photographer)
  GET  /api/design-services/:id   — service detail

Documents:
  GET  /api/documents             — list document services
  GET  /api/documents/:id         — service detail

Exchange:
  GET  /api/exchange/rates        — current exchange rates

Events:
  GET  /api/events                — list events (paginated)
  GET  /api/events/:id            — event detail

News:
  GET  /api/news                  — list news (paginated)
  GET  /api/news/:id              — news detail

Favorites:
  GET    /api/favorites           — user's favorites
  POST   /api/favorites           — add to favorites { type, entityId }
  DELETE /api/favorites/:id       — remove from favorites

Money:
  GET  /api/money/balance         — user balance
  GET  /api/money/transactions    — transaction history
  POST /api/money/withdraw        — request withdrawal

Subscription:
  GET  /api/subscription          — current subscription status + expiry
```

Exact schemas will be derived from Swagger once available.

---

## Data Flow

### Authentication (detailed)

```
1. TG WebApp opens
   → @telegram-apps/sdk-react provides initDataRaw automatically

2. App mounts → AuthProvider calls POST /api/auth/telegram
   Body: { initData: initDataRaw }
   Response: { data: { user, token, subscription } }

3. On success:
   → authStore.setAuth(token, user, subscription)
   → axios default header: Authorization: Bearer ${token}
   → render app

4. On failure (401 — initData expired/invalid):
   → show error screen with "Reopen the app" message
   → no retry (initData is one-time, user must reopen Mini App)

5. Token refresh:
   → TG initData is valid for a limited time
   → Backend returns a JWT with longer expiry (e.g. 24h)
   → On 401 from any request: clear authStore, show reopen prompt

6. Race condition prevention:
   → AuthProvider shows <Skeleton /> until auth resolves
   → No routes render until authStore.isAuthenticated === true
```

### State Management

- **TanStack Query** — all server state (categories, courses, user data, etc.)
- **Zustand** — client-only state:
  - `authStore`: token, user info, premium status, isAuthenticated
  - `uiStore`: active locale, active tab

### Caching Strategy

| Data | staleTime | gcTime |
|------|-----------|--------|
| Categories list | 5 min | 30 min |
| Category detail | 1 min | 10 min |
| User profile | 10 min | 30 min |
| News feed | 2 min | 15 min |
| Exchange rates | 30 sec | 5 min |

- `refetchOnWindowFocus: false` (not needed in TG WebApp)
- `refetchOnReconnect: true`
- Prefetching on touch start for category details

---

## Error Handling Strategy

### Layers

1. **Global axios interceptor** — catches 401 (→ reopen prompt), 429 (→ retry-after), 500 (→ generic toast)
2. **TanStack Query `onError`** — per-query error handling where needed (e.g. 403 → show PremiumGate)
3. **ErrorBoundary** — catches React render errors, placed:
   - Global (wraps entire app) — catastrophic fallback
   - Per-route (wraps each lazy-loaded feature) — isolates feature crashes
4. **Component-level** — form validation, user input errors

### Premium Access Control

```tsx
// src/components/PremiumGate/PremiumGate.tsx
// Wraps premium content. If user is not premium and API returns 403:
// → shows glass-styled upgrade prompt
// → "Upgrade" button opens the payment TG bot via tg://resolve?domain=...

// Usage in features:
<PremiumGate>
  <CourseContent />
</PremiumGate>
```

### Offline Behavior

When offline (`useOnlineStatus` returns false):
- Show `<OfflineBanner />` at top of screen
- TanStack Query serves stale cached data if available
- Mutations are blocked with user-facing message
- No full-screen overlay — user can still browse cached content

---

## Performance

### Code Splitting Strategy

```
Initial load (what the user downloads on first open):
  vendor-react.js     ~45kb  — React + ReactDOM (cached indefinitely)
  app-shell.js        ~8kb   — providers, router config, tabbar, auth
  home-page.js        ~10kb  — home page feature
  common.json         ~2kb   — i18n common namespace
  Total initial:      ~65kb gzip

Deferred (loaded on first use, NOT on initial load):
  vendor-query.js     ~12kb  — loaded with first data fetch (in app-shell)
  vendor-motion.js    ~18kb  — loaded when first animation triggers
  vendor-router.js    ~15kb  — loaded with app-shell
  vendor-i18n.js      ~12kb  — loaded with app-shell

On navigation (~5-15kb per chunk):
  courses.js, cargo.js, profile.js, etc.
```

### Vite Configuration

```ts
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles/variables" as *; @use "@/styles/mixins" as *;`,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-motion': ['framer-motion'],
          'vendor-i18n': ['i18next', 'react-i18next', 'i18next-http-backend'],
        },
      },
    },
  },
})
```

### Images

- `loading="lazy"` + `decoding="async"` on all images
- Backend serves WebP + multiple sizes
- `OptimizedImage` component handles: lazy loading, error fallback (placeholder), `srcSet` if backend provides sizes
- GPU-accelerated animations with `will-change`

### Fonts
- Gilroy Bold + Medium preloaded in `<head>`
- `font-display: swap` for instant text rendering

### Animations
- Framer Motion `layoutId` for tab bar transitions
- `whileTap={{ scale: 0.97 }}` for card interactions
- Spring physics: `stiffness: 400, damping: 30`
- `useReducedMotion()` — disables animations when OS setting is on

---

## Localization (i18n)

- **Languages:** Russian (ru), Uzbek (uz)
- **Strategy:** lazy loading per namespace via `i18next-http-backend`
- **Namespaces:** `common` (loaded at start), feature-specific (loaded on navigation)
- **Storage:** `localStorage` for language preference
- **Adding new language:** create `public/locales/{lang}/` folder, copy JSON structure, translate. No code changes.

---

## Testing Strategy

### Unit Tests (Vitest)

- Utils, hooks, store logic
- API client interceptors
- `cn()` helper
- i18n configuration

### Component Tests (Vitest + React Testing Library)

- Shared components: GlassCard, GlassButton, GlassTabBar, CategoryCard, PremiumGate
- Feature page components with mocked API (via MSW or TanStack Query test utils)
- Snapshot tests for glass styling consistency

### E2E Tests (Playwright)

- Critical user flows: app open → home → category → detail
- Tab navigation
- Language switching
- Premium gate behavior
- Offline mode

### TG-specific Testing

- Mock `@telegram-apps/sdk-react` in tests
- Use TG Bot API test environment for staging
- Manual testing via BotFather test bot

### Coverage Target

- Shared components: >80%
- Utils/hooks: >90%
- Features: >60% (focus on critical paths)

---

## Environment & Deployment

### Environment Variables

```bash
# .env.example
VITE_API_URL=http://localhost:3000        # Backend API base URL
VITE_TG_BOT_USERNAME=marketbox_bot        # TG bot username for deep links
VITE_SENTRY_DSN=                          # Error tracking (optional)
```

### Environments

| Env | API URL | TG Bot | Hosting |
|-----|---------|--------|---------|
| Development | localhost:3000 | test bot (BotFather) | vite dev server |
| Staging | api-staging.marketbox.uz | staging bot | Vercel preview |
| Production | api.marketbox.uz | production bot | Vercel / static hosting |

### Deployment

- Build: `vite build` → static files in `dist/`
- Host on any static hosting (Vercel, Cloudflare Pages, Nginx)
- Register Mini App URL via BotFather: `https://app.marketbox.uz`
- CI/CD: GitHub Actions → build → deploy → notify

### Non-TG Access

If opened outside Telegram (no `initData` available):
- Detect via `@telegram-apps/sdk-react` initialization failure
- Show screen: "Open this app in Telegram" with link to bot

---

## UX Patterns

- **Error Boundary** — glass-styled fallback with retry button, per-route + global
- **Skeleton loading** — shimmer animation matching glass aesthetic
- **Haptic feedback** — TG SDK haptics on tap/success/error
- **Pull-to-refresh** — invalidates TanStack Query cache
- **Offline banner** — top banner, cached data still accessible
- **Prefetching** — data loads on touch start before navigation
- **PremiumGate** — upgrade prompt for locked content
- **Form handling** — controlled components with inline validation (no form library — forms are simple in this app)

---

## Subscription Model

- Payment handled by a separate Telegram bot
- Frontend fetches subscription status from backend API (`GET /api/subscription`)
- Displays PREMIUM badge + expiration date in header
- Content access controlled by backend (API returns 403 `SUBSCRIPTION_REQUIRED`)
- `PremiumGate` component shows upgrade prompt with deep link to payment bot
- Frontend never handles payment logic

---

## Future Considerations

- **Chat module** — architecture supports adding a chat feature when design is ready (likely WebSocket via `websocket-engineer` subagent)
- **Additional languages** — i18n system designed for easy expansion
- **Admin panel** — exists separately, not part of this codebase
- **Push notifications** — TG Bot API supports sending notifications to users
